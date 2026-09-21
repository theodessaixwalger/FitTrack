import { NOVA_GROUPS, NUTRISCORE_GRADES } from '../../src/utils/barcode.js'

export const OFF_TIMEOUT_MS = 5000

const OFF_FIELDS = [
  'product_name',
  'product_name_fr',
  'brands',
  'nutriments',
  'serving_quantity',
  'image_front_small_url',
  'nutriscore_grade',
  'nova_group',
  'additives_tags',
].join(',')

// Garder /api/v3/ sans sous-version : à partir de la v3.5, la structure de
// `nutriments` change et le mapping ci-dessous ne serait plus valable.
const productEndpoint = (code) =>
  `https://world.openfoodfacts.org/api/v3/product/${code}?fields=${OFF_FIELDS}`

// OFF indisponible pour l'instant (429, 5xx, timeout, réseau) : le client doit
// réessayer plus tard, et on ne met rien en cache.
export class OffUnavailableError extends Error {
  constructor(reason, { status, cause } = {}) {
    super(`Open Food Facts indisponible (${reason})`, { cause })
    this.name = 'OffUnavailableError'
    this.status = status
  }
}

// Retourne le produit OFF, ou null s'il n'existe pas (HTTP 404).
export async function fetchOffProduct(code, { userAgent, fetchImpl = globalThis.fetch, timeoutMs = OFF_TIMEOUT_MS } = {}) {
  // Le signal couvre aussi la lecture du corps : un timeout pendant res.json()
  // tombe dans le même cas qu'un timeout sur les en-têtes.
  const signal = AbortSignal.timeout(timeoutMs)

  let res
  try {
    res = await fetchImpl(productEndpoint(code), {
      headers: { 'User-Agent': userAgent, Accept: 'application/json' },
      signal,
    })
  } catch (err) {
    throw new OffUnavailableError(err?.name === 'TimeoutError' ? 'timeout' : 'réseau', { cause: err })
  }

  if (res.status === 404) return null
  if (res.status === 429 || res.status >= 500) {
    throw new OffUnavailableError(`HTTP ${res.status}`, { status: res.status })
  }
  if (!res.ok) throw new Error(`Open Food Facts : réponse HTTP ${res.status} inattendue`)

  let body
  try {
    body = await res.json()
  } catch (err) {
    throw new OffUnavailableError(err?.name === 'TimeoutError' ? 'timeout' : 'réponse illisible', { cause: err })
  }
  return body?.product ?? null
}

// Nombre positif ou null. OFF renvoie parfois des nombres sous forme de texte.
const toNumber = (value) => {
  const n = typeof value === 'string' ? Number(value.replace(',', '.')) : value
  return typeof n === 'number' && Number.isFinite(n) && n >= 0 ? n : null
}

const round = (n, decimals) => (n == null ? null : Math.round(n * 10 ** decimals) / 10 ** decimals)

const firstText = (...values) => {
  for (const v of values) {
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return null
}

// `brands` est une liste séparée par des virgules : on garde la marque principale.
const firstBrand = (brands) => {
  const list = Array.isArray(brands) ? brands : String(brands ?? '').split(',')
  return firstText(...list)
}

// Convertit un produit OFF en ligne de la table `foods` (valeurs pour 100 g).
// Si le nom ou une des 4 macros principales manque, le produit est inexploitable
// tel quel : on renvoie de quoi pré-remplir le formulaire de création.
export function mapOffProduct(product, code) {
  const n = product?.nutriments ?? {}
  const name = firstText(product?.product_name_fr, product?.product_name)
  const brand = firstBrand(product?.brands)

  const kj = toNumber(n['energy-kj_100g'])
  const calories = toNumber(n['energy-kcal_100g']) ?? (kj == null ? null : kj / 4.184)
  const proteins = toNumber(n.proteins_100g)
  const carbs = toNumber(n.carbohydrates_100g)
  const fats = toNumber(n.fat_100g)

  if (!name || [calories, proteins, carbs, fats].includes(null)) {
    return {
      complete: false,
      partial: {
        name: name ?? '',
        brand: brand ?? '',
        calories: round(calories, 1),
        proteins: round(proteins, 2),
        carbs: round(carbs, 2),
        fats: round(fats, 2),
      },
    }
  }

  const sugar = toNumber(n.sugars_100g)
  const fiber = toNumber(n.fiber_100g)
  const grade = String(product.nutriscore_grade ?? '').toLowerCase()
  const nova = Number(product.nova_group)
  const servingQuantity = toNumber(product.serving_quantity)
  const image = product.image_front_small_url

  return {
    complete: true,
    food: {
      barcode: code,
      name,
      brand: brand ?? '',
      category: 'other',
      serving_size: 100,
      serving_unit: 'g',
      calories: round(calories, 1),
      proteins: round(proteins, 2),
      carbs: round(carbs, 2),
      fats: round(fats, 2),
      // sugar / fiber existaient avant la migration avec 0 par défaut :
      // on laisse la valeur par défaut quand OFF ne les fournit pas.
      ...(sugar != null && { sugar: round(sugar, 2) }),
      ...(fiber != null && { fiber: round(fiber, 2) }),
      saturated_fat: round(toNumber(n['saturated-fat_100g']), 2),
      salt: round(toNumber(n.salt_100g), 3),
      nutriscore_grade: NUTRISCORE_GRADES.includes(grade) ? grade : null,
      nova_group: NOVA_GROUPS.includes(nova) ? nova : null,
      additives_tags: Array.isArray(product.additives_tags) ? product.additives_tags.filter((t) => typeof t === 'string') : null,
      image_url: typeof image === 'string' && image.startsWith('https://') ? image : null,
      serving_quantity: servingQuantity ? round(servingQuantity, 1) : null,
      source: 'off',
      verified: true,
    },
  }
}
