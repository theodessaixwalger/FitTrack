import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  dueReminders,
  handleCronRequest,
  localDateTime,
  runReminders,
  streakAtRisk,
} from './notificationsHandler.js'

const sub = (userId, endpoint = `https://push.example/${userId}`) => ({ user_id: userId, endpoint, p256dh: 'p', auth: 'a' })

const makeServices = (overrides = {}) => ({
  listSubscriptions: vi.fn().mockResolvedValue([sub('user-1')]),
  getPreferences: vi.fn().mockResolvedValue(new Map()),
  hasMeal: vi.fn().mockResolvedValue(false),
  getActiveDates: vi.fn().mockResolvedValue([]),
  markSent: vi.fn().mockResolvedValue(true),
  deleteSubscription: vi.fn().mockResolvedValue(),
  sendPush: vi.fn().mockResolvedValue(),
  ...overrides,
})

// 11:00 UTC en octobre = 13:00 à Paris (heure d'été)
const PARIS_13H = new Date('2026-10-12T11:00:00Z')
const PARIS_21H = new Date('2026-10-12T19:00:00Z')

describe('localDateTime', () => {
  it("donne la date et l'heure dans le fuseau de l'utilisateur", () => {
    expect(localDateTime(PARIS_13H, 'Europe/Paris')).toEqual({ date: '2026-10-12', hour: 13 })
    expect(localDateTime(new Date('2026-10-12T23:30:00Z'), 'Europe/Paris')).toEqual({ date: '2026-10-13', hour: 1 })
  })

  it('suit le changement d’heure', () => {
    // Heure d'hiver : Paris = UTC+1
    expect(localDateTime(new Date('2026-11-12T12:00:00Z'), 'Europe/Paris').hour).toBe(13)
  })

  it('retombe sur Europe/Paris si le fuseau est invalide', () => {
    expect(localDateTime(PARIS_13H, 'Pas/Un_Fuseau')).toEqual({ date: '2026-10-12', hour: 13 })
  })
})

describe('dueReminders', () => {
  it('respecte les préférences', () => {
    expect(dueReminders({ meals_enabled: true, streak_enabled: true }, 13).map((r) => r.kind)).toEqual(['lunch'])
    expect(dueReminders({ meals_enabled: false, streak_enabled: true }, 13)).toEqual([])
    expect(dueReminders({ meals_enabled: true, streak_enabled: true }, 15)).toEqual([])
  })
})

describe('streakAtRisk', () => {
  it("compte la série jusqu'à hier quand aujourd'hui n'est pas validé", () => {
    expect(streakAtRisk(['2026-10-11', '2026-10-10', '2026-10-09', '2026-10-07'], '2026-10-12')).toBe(3)
  })

  it("renvoie 0 si aujourd'hui est déjà validé", () => {
    expect(streakAtRisk(['2026-10-12', '2026-10-11'], '2026-10-12')).toBe(0)
  })

  it("renvoie 0 si hier n'était pas actif", () => {
    expect(streakAtRisk(['2026-10-10', '2026-10-09'], '2026-10-12')).toBe(0)
  })

  it('traverse les changements de mois', () => {
    expect(streakAtRisk(['2026-09-30', '2026-09-29'], '2026-10-01')).toBe(2)
  })
})

describe('runReminders', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it("envoie le rappel déjeuner quand aucun déjeuner n'est saisi", async () => {
    const services = makeServices()

    const summary = await runReminders(PARIS_13H, services)

    expect(services.hasMeal).toHaveBeenCalledWith('user-1', '2026-10-12', 'lunch')
    expect(services.sendPush).toHaveBeenCalledWith(sub('user-1'), expect.objectContaining({ url: '/nutrition' }))
    expect(summary.sent).toBe(1)
  })

  it('ne relance pas un utilisateur qui a déjà saisi son déjeuner', async () => {
    const services = makeServices({ hasMeal: vi.fn().mockResolvedValue(true) })
    await runReminders(PARIS_13H, services)
    expect(services.sendPush).not.toHaveBeenCalled()
  })

  it('alerte sur la série en danger avec sa longueur', async () => {
    const services = makeServices({ getActiveDates: vi.fn().mockResolvedValue(['2026-10-11', '2026-10-10']) })

    await runReminders(PARIS_21H, services)

    expect(services.sendPush).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ title: expect.stringContaining('2 jours') })
    )
  })

  it('utilise le fuseau enregistré', async () => {
    // 11:00 UTC = 07:00 à New York : pas de rappel
    const services = makeServices({
      getPreferences: vi.fn().mockResolvedValue(new Map([['user-1', { user_id: 'user-1', timezone: 'America/New_York' }]])),
    })
    await runReminders(PARIS_13H, services)
    expect(services.hasMeal).not.toHaveBeenCalled()
  })

  it("n'envoie pas deux fois le même rappel le même jour", async () => {
    const services = makeServices({ markSent: vi.fn().mockResolvedValue(false) })

    const summary = await runReminders(PARIS_13H, services)

    expect(services.sendPush).not.toHaveBeenCalled()
    expect(summary.alreadySent).toBe(1)
  })

  it('supprime les abonnements expirés (410)', async () => {
    const services = makeServices({
      sendPush: vi.fn().mockRejectedValue(Object.assign(new Error('Gone'), { statusCode: 410 })),
    })

    const summary = await runReminders(PARIS_13H, services)

    expect(services.deleteSubscription).toHaveBeenCalledWith('https://push.example/user-1')
    expect(summary.removed).toBe(1)
  })

  it('envoie sur chaque appareil de l’utilisateur', async () => {
    const services = makeServices({
      listSubscriptions: vi.fn().mockResolvedValue([sub('user-1', 'https://a'), sub('user-1', 'https://b')]),
    })
    await runReminders(PARIS_13H, services)
    expect(services.sendPush).toHaveBeenCalledTimes(2)
    expect(services.markSent).toHaveBeenCalledTimes(1)
  })
})

const env = {
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role',
  VITE_VAPID_PUBLIC_KEY: 'public',
  VAPID_PRIVATE_KEY: 'private',
  VAPID_SUBJECT: 'mailto:test@example.com',
  CRON_SECRET: 'cron-secret',
}

describe('handleCronRequest', () => {
  const request = (secret) => new Request('http://localhost/api/notifications/cron', {
    method: 'POST',
    headers: secret ? { Authorization: `Bearer ${secret}` } : {},
  })

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('exige le secret du cron', async () => {
    const services = makeServices()
    expect((await handleCronRequest(request(null), env, () => services)).status).toBe(401)
    expect((await handleCronRequest(request('mauvais'), env, () => services)).status).toBe(401)
    expect(services.listSubscriptions).not.toHaveBeenCalled()
  })

  it('lance les rappels avec le bon secret', async () => {
    const services = makeServices()
    const res = await handleCronRequest(request('cron-secret'), env, () => services)
    expect(res.status).toBe(200)
    expect(services.listSubscriptions).toHaveBeenCalled()
  })

  it('refuse de démarrer sans CRON_SECRET, sans divulguer de valeur', async () => {
    const res = await handleCronRequest(request('x'), { ...env, CRON_SECRET: '' }, () => makeServices())
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.message).toContain('CRON_SECRET')
    expect(body.message).not.toContain('private')
  })
})
