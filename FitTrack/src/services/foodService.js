import { supabase } from '../config/supabase'

// Récupérer tous les aliments
export const getAllFoods = async () => {
  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data
}

// Rechercher des aliments
export const searchFoods = async (query) => {
  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .or(`name.ilike.%${query}%,brand.ilike.%${query}%`)
    .order('name')
    .limit(20)
  
  if (error) throw error
  return data
}

// Récupérer les aliments par catégorie
export const getFoodsByCategory = async (category) => {
  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .eq('category', category)
    .order('name')
  
  if (error) throw error
  return data
}

// Ajouter un nouvel aliment
export const addFood = async (foodData) => {
  const { data, error } = await supabase
    .from('foods')
    .insert([foodData])
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Mettre à jour un aliment
export const updateFood = async (id, foodData) => {
  const { data, error } = await supabase
    .from('foods')
    .update(foodData)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Supprimer un aliment
export const deleteFood = async (id) => {
  const { error } = await supabase
    .from('foods')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Rechercher un produit par code-barres (déjà normalisé) : base partagée puis
// Open Food Facts, via /api/foods/barcode/:code (OFF n'est jamais appelé depuis le front).
// Renvoie { found: true, food } | { found: false, partial? }.
export const getFoodByBarcode = async (code) => {
  const { data: { session } } = await supabase.auth.getSession()

  let res
  try {
    res = await fetch(`/api/foods/barcode/${encodeURIComponent(code)}`, {
      headers: { Authorization: `Bearer ${session?.access_token ?? ''}` },
      signal: AbortSignal.timeout(15000),
    })
  } catch {
    throw new Error('Connexion impossible. Vérifie ton réseau et réessaie.')
  }

  const body = await res.json().catch(() => null)
  if (!res.ok || !body) {
    throw new Error(body?.message || 'Erreur serveur. Réessaie dans un instant.')
  }
  return body
}

// Aliment déjà enregistré pour ce code-barres (lecture directe en base)
export const findFoodByBarcode = async (code) => {
  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .eq('barcode', code)
    .maybeSingle()

  if (error) throw error
  return data
}

// Récupérer un aliment par ID
export const getFoodById = async (id) => {
  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}
