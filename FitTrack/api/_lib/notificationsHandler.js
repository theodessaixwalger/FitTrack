import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

// Heures locales d'envoi. Le cron tourne chaque heure : un rappel part quand
// l'heure locale de l'utilisateur (selon son fuseau) correspond.
export const REMINDERS = [
  { kind: 'lunch', hour: 13, pref: 'meals_enabled' },
  { kind: 'dinner', hour: 20, pref: 'meals_enabled' },
  { kind: 'streak', hour: 21, pref: 'streak_enabled' },
]

const DEFAULT_PREFS = { meals_enabled: true, streak_enabled: true, timezone: 'Europe/Paris' }

// Un rappel non distribué après 3 h n'a plus de sens (repas passé, journée finie)
const PUSH_TTL_SECONDS = 3 * 60 * 60

export function localDateTime(now, timeZone) {
  let parts
  try {
    parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(now)
  } catch {
    // Fuseau invalide enregistré par le navigateur
    return localDateTime(now, DEFAULT_PREFS.timezone)
  }
  const get = (type) => parts.find((p) => p.type === type).value
  return { date: `${get('year')}-${get('month')}-${get('day')}`, hour: Number(get('hour')) }
}

export function dueReminders(prefs, hour) {
  return REMINDERS.filter((r) => r.hour === hour && prefs[r.pref])
}

function previousDay(date) {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

// Longueur de la série qui s'arrête ce soir si rien n'est fait aujourd'hui.
// 0 : aujourd'hui est déjà validé, ou il n'y a pas de série à sauver.
export function streakAtRisk(activeDates, today) {
  const active = new Set(activeDates)
  if (active.has(today)) return 0
  let streak = 0
  let day = today
  while (active.has((day = previousDay(day)))) streak++
  return streak
}

export function buildMessage(kind, { streak } = {}) {
  switch (kind) {
    case 'lunch':
      return {
        title: 'Déjeuner',
        body: "Vous n'avez pas encore ajouté votre déjeuner.",
        url: '/nutrition',
        tag: 'meal-reminder',
      }
    case 'dinner':
      return {
        title: 'Dîner',
        body: "Vous n'avez pas encore ajouté votre dîner.",
        url: '/nutrition',
        tag: 'meal-reminder',
      }
    case 'streak':
      return {
        title: `🔥 Série de ${streak} jour${streak > 1 ? 's' : ''} en danger`,
        body: 'Ajoutez un repas ou une séance avant minuit pour la garder.',
        url: '/',
        tag: 'streak-reminder',
      }
    case 'test':
      return {
        title: 'FitTrack',
        body: 'Les notifications fonctionnent sur cet appareil ✅',
        url: '/settings',
        tag: 'test',
      }
    default:
      throw new Error(`Type de notification inconnu : ${kind}`)
  }
}

// Message à envoyer, ou null si le rappel n'a pas lieu d'être
async function checkReminder(kind, userId, date, services) {
  if (kind === 'lunch' || kind === 'dinner') {
    return (await services.hasMeal(userId, date, kind)) ? null : buildMessage(kind)
  }
  if (kind === 'streak') {
    const streak = streakAtRisk(await services.getActiveDates(userId), date)
    return streak > 0 ? buildMessage('streak', { streak }) : null
  }
  return null
}

export async function sendToSubscriptions(subscriptions, message, services) {
  const result = { sent: 0, removed: 0, failed: 0 }
  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await services.sendPush(sub, message)
        result.sent++
      } catch (err) {
        // 404 / 410 : abonnement expiré ou révoqué par l'utilisateur
        if (err.statusCode === 404 || err.statusCode === 410) {
          await services.deleteSubscription(sub.endpoint)
          result.removed++
        } else {
          console.error(`[push] envoi échoué (${err.statusCode ?? 'sans statut'}) :`, err.body ?? err.message)
          result.failed++
        }
      }
    })
  )
  return result
}

export async function runReminders(now, services) {
  const subscriptions = await services.listSubscriptions()
  const byUser = new Map()
  for (const sub of subscriptions) {
    if (!byUser.has(sub.user_id)) byUser.set(sub.user_id, [])
    byUser.get(sub.user_id).push(sub)
  }

  const prefsByUser = await services.getPreferences([...byUser.keys()])
  const summary = { sent: 0, removed: 0, failed: 0, alreadySent: 0 }

  for (const [userId, subs] of byUser) {
    const prefs = { ...DEFAULT_PREFS, ...prefsByUser.get(userId) }
    const { date, hour } = localDateTime(now, prefs.timezone)

    for (const reminder of dueReminders(prefs, hour)) {
      const message = await checkReminder(reminder.kind, userId, date, services)
      if (!message) continue

      // Cron relancé dans la même heure : le rappel est déjà parti
      if (!(await services.markSent(userId, reminder.kind, date))) {
        summary.alreadySent++
        continue
      }

      const result = await sendToSubscriptions(subs, message, services)
      summary.sent += result.sent
      summary.removed += result.removed
      summary.failed += result.failed
    }
  }

  return summary
}

let adminClient = null

// Client service_role : lit les données de tous les users pour le cron.
// Ne doit jamais être exposé au front.
function createServices(config) {
  adminClient ??= createClient(config.supabaseUrl, config.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const vapidDetails = {
    subject: config.vapidSubject,
    publicKey: config.vapidPublicKey,
    privateKey: config.vapidPrivateKey,
  }

  return {
    getUser: async (token) => {
      const { data, error } = await adminClient.auth.getUser(token)
      return error ? null : data.user
    },

    listSubscriptions: async (userId) => {
      let query = adminClient.from('push_subscriptions').select('user_id, endpoint, p256dh, auth')
      if (userId) query = query.eq('user_id', userId)
      const { data, error } = await query
      if (error) throw error
      return data
    },

    getPreferences: async (userIds) => {
      if (userIds.length === 0) return new Map()
      const { data, error } = await adminClient
        .from('notification_preferences')
        .select('user_id, meals_enabled, streak_enabled, timezone')
        .in('user_id', userIds)
      if (error) throw error
      return new Map(data.map((row) => [row.user_id, row]))
    },

    // Un repas compte s'il contient au moins un aliment ou une recette
    hasMeal: async (userId, date, mealType) => {
      const { data, error } = await adminClient
        .from('meals')
        .select('id, meal_foods(count), meal_recipes(count)')
        .eq('user_id', userId)
        .eq('date', date)
        .eq('meal_type', mealType)
      if (error) throw error
      return data.some((meal) => (meal.meal_foods?.[0]?.count ?? 0) + (meal.meal_recipes?.[0]?.count ?? 0) > 0)
    },

    getActiveDates: async (userId) => {
      const { data, error } = await adminClient
        .from('user_activity')
        .select('activity_date, has_workout, has_logged_nutrition')
        .eq('user_id', userId)
        .order('activity_date', { ascending: false })
        .limit(400)
      if (error) throw error
      return data.filter((row) => row.has_workout || row.has_logged_nutrition).map((row) => row.activity_date)
    },

    markSent: async (userId, kind, date) => {
      const { data, error } = await adminClient
        .from('notification_log')
        .upsert({ user_id: userId, kind, local_date: date }, { onConflict: 'user_id,kind,local_date', ignoreDuplicates: true })
        .select()
      if (error) throw error
      return data.length > 0
    },

    deleteSubscription: async (endpoint) => {
      const { error } = await adminClient.from('push_subscriptions').delete().eq('endpoint', endpoint)
      if (error) throw error
    },

    sendPush: (sub, message) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(message),
        { vapidDetails, TTL: PUSH_TTL_SECONDS }
      ),
  }
}

function readConfig(env, extraRequired = {}) {
  const config = {
    supabaseUrl: env.SUPABASE_URL || env.VITE_SUPABASE_URL,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    vapidPublicKey: env.VITE_VAPID_PUBLIC_KEY,
    vapidPrivateKey: env.VAPID_PRIVATE_KEY,
    vapidSubject: env.VAPID_SUBJECT || (env.OFF_CONTACT_EMAIL && `mailto:${env.OFF_CONTACT_EMAIL}`),
    cronSecret: env.CRON_SECRET,
  }
  const missing = Object.entries({
    SUPABASE_URL: config.supabaseUrl,
    SUPABASE_SERVICE_ROLE_KEY: config.serviceRoleKey,
    VITE_VAPID_PUBLIC_KEY: config.vapidPublicKey,
    VAPID_PRIVATE_KEY: config.vapidPrivateKey,
    VAPID_SUBJECT: config.vapidSubject,
    ...extraRequired,
  })
    .filter(([, value]) => !value)
    .map(([key]) => key)

  return { ...config, missing }
}

const json = (status, body, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers },
  })

function misconfigured(missing) {
  console.error(`[push] variables d'environnement manquantes : ${missing.join(', ')}`)
  // Noms seulement, jamais les valeurs
  return json(500, { error: 'server_misconfigured', message: `Configuration serveur incomplète (manquant : ${missing.join(', ')}).` })
}

// GET ou POST /api/notifications/cron — appelé chaque heure par pg_cron (Supabase)
export async function handleCronRequest(request, env = process.env, makeServices = createServices) {
  if (request.method !== 'GET' && request.method !== 'POST') {
    return json(405, { error: 'method_not_allowed' }, { Allow: 'GET, POST' })
  }

  const config = readConfig(env, { CRON_SECRET: env.CRON_SECRET })
  if (config.missing.length) return misconfigured(config.missing)

  if (request.headers.get('authorization') !== `Bearer ${config.cronSecret}`) {
    return json(401, { error: 'unauthorized' })
  }

  try {
    return json(200, await runReminders(new Date(), makeServices(config)))
  } catch (err) {
    console.error('[push] cron :', err)
    return json(500, { error: 'internal' })
  }
}

// POST /api/notifications/test — envoie une notification de test à l'utilisateur connecté
export async function handleTestRequest(request, env = process.env, makeServices = createServices) {
  if (request.method !== 'POST') return json(405, { error: 'method_not_allowed' }, { Allow: 'POST' })

  const config = readConfig(env)
  if (config.missing.length) return misconfigured(config.missing)

  const services = makeServices(config)

  const token = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]
  const user = token ? await services.getUser(token) : null
  if (!user) return json(401, { error: 'unauthorized', message: 'Session expirée, reconnectez-vous.' })

  try {
    const subscriptions = await services.listSubscriptions(user.id)
    if (subscriptions.length === 0) {
      return json(404, { error: 'no_subscription', message: "Aucun appareil abonné. Activez d'abord les notifications." })
    }
    return json(200, await sendToSubscriptions(subscriptions, buildMessage('test'), services))
  } catch (err) {
    console.error('[push] test :', err)
    return json(500, { error: 'internal', message: 'Erreur serveur. Réessayez dans un instant.' })
  }
}
