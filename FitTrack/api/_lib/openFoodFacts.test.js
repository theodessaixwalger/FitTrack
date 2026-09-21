import { describe, expect, it, vi } from 'vitest'
import { fetchOffProduct, mapOffProduct, OffUnavailableError } from './openFoodFacts.js'

const CODE = '3017620422003'

const completeProduct = {
  product_name: 'Nutella',
  product_name_fr: 'Pâte à tartiner Nutella',
  brands: 'Nutella, Ferrero',
  serving_quantity: '15',
  image_front_small_url: 'https://images.openfoodfacts.org/images/products/301/762/042/2003/front_fr.200.jpg',
  nutriscore_grade: 'E',
  nova_group: 4,
  additives_tags: ['en:e322', 'en:e322i'],
  nutriments: {
    'energy-kcal_100g': 539,
    'energy-kj_100g': 2252,
    proteins_100g: 6.3,
    carbohydrates_100g: 57.5,
    sugars_100g: 56.3,
    fat_100g: 30.9,
    'saturated-fat_100g': 10.6,
    fiber_100g: 0,
    salt_100g: 0.107,
  },
}

const jsonResponse = (status, body) => new Response(JSON.stringify(body), { status })

describe('mapOffProduct', () => {
  it('mappe un produit complet', () => {
    const { complete, food } = mapOffProduct(completeProduct, CODE)

    expect(complete).toBe(true)
    expect(food).toEqual({
      barcode: CODE,
      name: 'Pâte à tartiner Nutella',
      brand: 'Nutella',
      category: 'other',
      serving_size: 100,
      serving_unit: 'g',
      calories: 539,
      proteins: 6.3,
      carbs: 57.5,
      fats: 30.9,
      sugar: 56.3,
      fiber: 0,
      saturated_fat: 10.6,
      salt: 0.107,
      nutriscore_grade: 'e',
      nova_group: 4,
      additives_tags: ['en:e322', 'en:e322i'],
      image_url: completeProduct.image_front_small_url,
      serving_quantity: 15,
      source: 'off',
      verified: true,
    })
  })

  it('prend product_name si product_name_fr est absent ou vide', () => {
    const { food } = mapOffProduct({ ...completeProduct, product_name_fr: '  ' }, CODE)
    expect(food.name).toBe('Nutella')
  })

  it('calcule les kcal depuis les kJ quand energy-kcal_100g manque', () => {
    const nutriments = { ...completeProduct.nutriments }
    delete nutriments['energy-kcal_100g']

    const { complete, food } = mapOffProduct({ ...completeProduct, nutriments }, CODE)

    expect(complete).toBe(true)
    expect(food.calories).toBe(538.2) // 2252 / 4.184
  })

  it('accepte des macros à 0 (eau)', () => {
    const water = {
      product_name: 'Cristaline',
      brands: 'Cristaline',
      nutriments: { 'energy-kcal_100g': 0, proteins_100g: 0, carbohydrates_100g: 0, fat_100g: 0 },
    }
    const { complete, food } = mapOffProduct(water, '3274080005003')

    expect(complete).toBe(true)
    expect(food.calories).toBe(0)
    // Pas de sucres / fibres fournis : on laisse la valeur par défaut de la base
    expect(food).not.toHaveProperty('sugar')
    expect(food).not.toHaveProperty('fiber')
  })

  it('renvoie un partial quand une macro principale manque', () => {
    const nutriments = { ...completeProduct.nutriments }
    delete nutriments.proteins_100g

    const result = mapOffProduct({ ...completeProduct, nutriments }, CODE)

    expect(result.complete).toBe(false)
    expect(result.partial).toMatchObject({ name: 'Pâte à tartiner Nutella', brand: 'Nutella', proteins: null, calories: 539 })
  })

  it('renvoie un partial sans kcal ni kJ', () => {
    const result = mapOffProduct({ product_name: 'Mystère', nutriments: { proteins_100g: 1, carbohydrates_100g: 1, fat_100g: 1 } }, CODE)
    expect(result).toMatchObject({ complete: false, partial: { name: 'Mystère', brand: '', calories: null } })
  })

  it('renvoie un partial sans nom', () => {
    const result = mapOffProduct({ ...completeProduct, product_name: '', product_name_fr: undefined }, CODE)
    expect(result).toMatchObject({ complete: false, partial: { name: '', brand: 'Nutella' } })
  })

  it('ignore un Nutri-Score ou un NOVA hors échelle', () => {
    const { food } = mapOffProduct({ ...completeProduct, nutriscore_grade: 'not-applicable', nova_group: 7 }, CODE)
    expect(food.nutriscore_grade).toBeNull()
    expect(food.nova_group).toBeNull()
  })
})

describe('fetchOffProduct', () => {
  const userAgent = 'FitTrack/1.0 (test@example.com)'

  it("appelle l'API v3 avec le User-Agent et renvoie le produit", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(200, { status: 'success', product: completeProduct }))

    const product = await fetchOffProduct(CODE, { userAgent, fetchImpl })

    expect(product).toEqual(completeProduct)
    const [url, init] = fetchImpl.mock.calls[0]
    expect(url).toMatch(new RegExp(`^https://world\\.openfoodfacts\\.org/api/v3/product/${CODE}\\?fields=`))
    expect(url).toContain('product_name_fr')
    expect(init.headers['User-Agent']).toBe(userAgent)
    expect(init.signal).toBeInstanceOf(AbortSignal)
  })

  it('renvoie null sur un 404', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse(404, { status: 'failure', result: { id: 'product_not_found' } }),
    )
    await expect(fetchOffProduct(CODE, { userAgent, fetchImpl })).resolves.toBeNull()
  })

  it.each([429, 503])('lève OffUnavailableError sur un %i', async (status) => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(status, {}))
    const error = await fetchOffProduct(CODE, { userAgent, fetchImpl }).catch((e) => e)

    expect(error).toBeInstanceOf(OffUnavailableError)
    expect(error.status).toBe(status)
  })

  it('lève OffUnavailableError au timeout', async () => {
    // Fetch qui ne répond jamais, sauf à l'annulation par le signal
    const fetchImpl = vi.fn((url, { signal }) => new Promise((_, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason))
    }))

    const error = await fetchOffProduct(CODE, { userAgent, fetchImpl, timeoutMs: 20 }).catch((e) => e)

    expect(error).toBeInstanceOf(OffUnavailableError)
    expect(error.message).toContain('timeout')
  })

  it('lève OffUnavailableError sur une erreur réseau', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('fetch failed'))
    await expect(fetchOffProduct(CODE, { userAgent, fetchImpl })).rejects.toBeInstanceOf(OffUnavailableError)
  })
})
