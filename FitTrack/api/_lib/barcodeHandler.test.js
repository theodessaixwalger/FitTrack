import { beforeEach, describe, expect, it, vi } from 'vitest'
import { handleBarcodeRequest, lookupBarcode } from './barcodeHandler.js'
import { OffUnavailableError } from './openFoodFacts.js'

const offProduct = {
  product_name: 'Cristaline',
  brands: 'Cristaline',
  nutriments: { 'energy-kcal_100g': 0, proteins_100g: 0, carbohydrates_100g: 0, fat_100g: 0 },
}

const makeServices = (overrides = {}) => ({
  getUser: vi.fn().mockResolvedValue({ id: 'user-1' }),
  findFoodByBarcode: vi.fn().mockResolvedValue(null),
  insertFood: vi.fn(async (row) => ({ id: 'food-1', ...row })),
  fetchProduct: vi.fn().mockResolvedValue(null),
  ...overrides,
})

describe('lookupBarcode', () => {
  it('renvoie la fiche en base sans appeler Open Food Facts', async () => {
    const cached = { id: 'food-1', barcode: '3274080005003', name: 'Cristaline' }
    const services = makeServices({ findFoodByBarcode: vi.fn().mockResolvedValue(cached) })

    await expect(lookupBarcode('3274080005003', services)).resolves.toEqual({ found: true, food: cached })
    expect(services.fetchProduct).not.toHaveBeenCalled()
  })

  it('enregistre un produit OFF complet puis le renvoie', async () => {
    const services = makeServices({ fetchProduct: vi.fn().mockResolvedValue(offProduct) })

    const result = await lookupBarcode('3274080005003', services)

    expect(services.insertFood).toHaveBeenCalledWith(expect.objectContaining({ barcode: '3274080005003', source: 'off' }))
    expect(result).toMatchObject({ found: true, food: { id: 'food-1', name: 'Cristaline' } })
  })

  it('renvoie found: false sur un produit inconnu (404 OFF)', async () => {
    const services = makeServices()
    await expect(lookupBarcode('0000000000017', services)).resolves.toEqual({ found: false })
    expect(services.insertFood).not.toHaveBeenCalled()
  })

  it("renvoie un partial sans rien enregistrer si des macros manquent", async () => {
    const services = makeServices({
      fetchProduct: vi.fn().mockResolvedValue({ product_name: 'Chips', brands: 'Lay’s', nutriments: {} }),
    })

    const result = await lookupBarcode('3168930010265', services)

    expect(result).toMatchObject({ found: false, partial: { name: 'Chips', brand: 'Lay’s' } })
    expect(services.insertFood).not.toHaveBeenCalled()
  })
})

describe('handleBarcodeRequest', () => {
  const env = {
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role',
    OFF_CONTACT_EMAIL: 'test@example.com',
  }
  const request = (code, token = 'jwt') => new Request(`http://localhost/api/foods/barcode/${code}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  let services
  beforeEach(() => {
    services = makeServices()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('normalise le code avant la recherche', async () => {
    const res = await handleBarcodeRequest(request('96385074'), env, () => services)

    expect(res.status).toBe(200)
    expect(services.findFoodByBarcode).toHaveBeenCalledWith('0000096385074')
  })

  it('exige une session', async () => {
    const res = await handleBarcodeRequest(request('3274080005003', null), env, () => services)

    expect(res.status).toBe(401)
    expect(services.findFoodByBarcode).not.toHaveBeenCalled()
  })

  it('rejette un jeton invalide', async () => {
    services.getUser.mockResolvedValue(null)
    const res = await handleBarcodeRequest(request('3274080005003'), env, () => services)
    expect(res.status).toBe(401)
  })

  it('rejette un code inexploitable', async () => {
    const res = await handleBarcodeRequest(request('abc'), env, () => services)
    expect(res.status).toBe(400)
  })

  it('répond 503 « réessaie » quand OFF limite le débit (429), sans rien enregistrer', async () => {
    services.fetchProduct.mockRejectedValue(new OffUnavailableError('HTTP 429', { status: 429 }))

    const res = await handleBarcodeRequest(request('3274080005003'), env, () => services)

    expect(res.status).toBe(503)
    expect(res.headers.get('Retry-After')).toBe('10')
    expect(await res.json()).toMatchObject({ error: 'off_unavailable', message: expect.stringContaining('Réessaie') })
    expect(services.insertFood).not.toHaveBeenCalled()
  })

  it('refuse de démarrer sans configuration complète', async () => {
    const res = await handleBarcodeRequest(request('3274080005003'), { ...env, OFF_CONTACT_EMAIL: '' }, () => services)
    expect(res.status).toBe(500)
  })
})
