import { supabase } from '../config/supabase'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

export const DEFAULT_NOTIFICATION_PREFS = { meals_enabled: true, streak_enabled: true }

export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

// Sur iPhone, le push n'existe que pour l'app ajoutée à l'écran d'accueil
export function needsHomeScreenInstall() {
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true
  return isIos && !isStandalone
}

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return
  navigator.serviceWorker.register('/sw.js').catch((error) => {
    console.error('Erreur enregistrement service worker:', error)
  })
}

function urlBase64ToUint8Array(base64) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(raw, (char) => char.charCodeAt(0))
}

export async function getCurrentSubscription() {
  if (!isPushSupported()) return null
  const registration = await navigator.serviceWorker.getRegistration()
  return registration ? registration.pushManager.getSubscription() : null
}

// À appeler depuis un clic : Safari refuse la demande de permission sinon
export async function enablePush() {
  if (!VAPID_PUBLIC_KEY) throw new Error('VITE_VAPID_PUBLIC_KEY manquante')

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return { permission }

  const registration = await navigator.serviceWorker.register('/sw.js')
  await navigator.serviceWorker.ready

  const subscription = await registration.pushManager.getSubscription()
    ?? await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })

  const { endpoint, keys } = subscription.toJSON()
  const { error } = await supabase.rpc('save_push_subscription', {
    p_endpoint: endpoint,
    p_p256dh: keys.p256dh,
    p_auth: keys.auth,
    p_user_agent: navigator.userAgent,
  })
  if (error) throw error

  // Crée la ligne de préférences avec le fuseau de l'appareil
  await saveNotificationPreferences({})

  return { permission, subscription }
}

export async function disablePush() {
  const subscription = await getCurrentSubscription()
  if (!subscription) return

  const { error } = await supabase.from('push_subscriptions').delete().eq('endpoint', subscription.endpoint)
  if (error) throw error
  await subscription.unsubscribe()
}

export async function getNotificationPreferences() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return DEFAULT_NOTIFICATION_PREFS

  const { data, error } = await supabase
    .from('notification_preferences')
    .select('meals_enabled, streak_enabled')
    .eq('user_id', user.id)
    .maybeSingle()
  if (error) throw error
  return data ?? DEFAULT_NOTIFICATION_PREFS
}

export async function saveNotificationPreferences(changes) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('notification_preferences')
    .upsert({
      user_id: user.id,
      ...changes,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
  if (error) throw error
}
