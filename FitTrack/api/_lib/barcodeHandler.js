import { createClient } from '@supabase/supabase-js'
import { normalizeBarcode } from '../../src/utils/barcode.js'
import { fetchOffProduct, mapOffProduct, OffUnavailableError } from './openFoodFacts.js'

// Base d'abord (cache partagé par tous les users), Open Food Facts ensuite.
// OFF limite la lecture à 15 req/min par IP, et toutes les requêtes partent
// de la même IP serveur : chaque produit trouvé est donc enregistré.
export async function lookupBarcode(code, { findFoodByBarcode, insertFood, fetchProduct }) {
  const cached = await findFoodByBarcode(code)
  if (cached) return { found: true, food: cached }

  const product = await fetchProduct(code)
  if (!product) return { found: false }

  const mapped = mapOffProduct(product, code)
  if (!mapped.complete) return { found: false, partial: mapped.partial }

  return { found: true, food: await insertFood(mapped.food) }
}

let adminClient = null

// Client service_role : contourne la RLS, qui interdit aux users d'écrire
// des fiches `source = 'off'`. Ne doit jamais être exposé au front.
function createServices(config) {
  adminClient ??= createClient(config.supabaseUrl, config.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const findFoodByBarcode = async (code) => {
    const { data, error } = await adminClient.from('foods').select('*').eq('barcode', code).maybeSingle()
    if (error) throw error
    return data
  }

  return {
    getUser: async (token) => {
      const { data, error } = await adminClient.auth.getUser(token)
      return error ? null : data.user
    },
    findFoodByBarcode,
    insertFood: async (row) => {
      const { data, error } = await adminClient
        .from('foods')
        .upsert(row, { onConflict: 'barcode', ignoreDuplicates: true })
        .select()
        .maybeSingle()
      if (error) throw error
      // Rien d'inséré : quelqu'un a enregistré ce code entre notre lecture et l'écriture
      return data ?? findFoodByBarcode(row.barcode)
    },
    fetchProduct: (code) => fetchOffProduct(code, { userAgent: config.userAgent }),
  }
}

function readConfig(env) {
  const config = {
    supabaseUrl: env.SUPABASE_URL || env.VITE_SUPABASE_URL,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    contactEmail: env.OFF_CONTACT_EMAIL,
  }
  const missing = Object.entries({
    SUPABASE_URL: config.supabaseUrl,
    SUPABASE_SERVICE_ROLE_KEY: config.serviceRoleKey,
    OFF_CONTACT_EMAIL: config.contactEmail,
  }).filter(([, value]) => !value).map(([key]) => key)

  return { ...config, missing, userAgent: `FitTrack/1.0 (${config.contactEmail})` }
}

const json = (status, body, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers },
  })

// GET /api/foods/barcode/:code — utilisé par la fonction Vercel et par le
// middleware de dev de Vite (vite.config.js).
export async function handleBarcodeRequest(request, env = process.env, makeServices = createServices) {
  if (request.method !== 'GET') return json(405, { error: 'method_not_allowed' }, { Allow: 'GET' })

  const config = readConfig(env)
  if (config.missing.length) {
    console.error(`[barcode] variables d'environnement manquantes : ${config.missing.join(', ')}`)
    return json(500, { error: 'server_misconfigured', message: 'Configuration serveur incomplète.' })
  }

  const services = makeServices(config)

  const token = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]
  const user = token ? await services.getUser(token) : null
  if (!user) return json(401, { error: 'unauthorized', message: 'Session expirée, reconnecte-toi.' })

  const rawCode = new URL(request.url).pathname.split('/').filter(Boolean).pop()
  const code = normalizeBarcode(rawCode)
  if (!code) return json(400, { error: 'invalid_barcode', message: 'Code-barres invalide.' })

  try {
    return json(200, await lookupBarcode(code, services))
  } catch (err) {
    if (err instanceof OffUnavailableError) {
      console.warn(`[barcode] ${code} : ${err.message}`)
      return json(503, {
        error: 'off_unavailable',
        message: 'Open Food Facts ne répond pas. Réessaie dans un instant.',
      }, { 'Retry-After': '10' })
    }
    console.error(`[barcode] ${code} :`, err)
    return json(500, { error: 'internal', message: 'Erreur serveur. Réessaie dans un instant.' })
  }
}
