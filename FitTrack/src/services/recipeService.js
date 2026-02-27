import { supabase } from '../config/supabase'

// Récupérer toutes les recettes de l'utilisateur
export const getRecipes = async (userId) => {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      recipe_ingredients (
        *,
        foods (*)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Créer une nouvelle recette
export const createRecipe = async (userId, { name, description, servings = 1 }) => {
  const { data, error } = await supabase
    .from('recipes')
    .insert([{ user_id: userId, name, description, servings }])
    .select()
    .single()

  if (error) throw error
  return data
}

// Mettre à jour une recette existante (infos + ingrédients)
export const updateRecipe = async (recipeId, { name, description, servings }) => {
  const { data, error } = await supabase
    .from('recipes')
    .update({ name, description, servings, updated_at: new Date().toISOString() })
    .eq('id', recipeId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Supprimer tous les ingrédients d'une recette (avant remplacement)
export const clearRecipeIngredients = async (recipeId) => {
  const { error } = await supabase
    .from('recipe_ingredients')
    .delete()
    .eq('recipe_id', recipeId)

  if (error) throw error
}

// Ajouter un ingrédient à une recette
export const addIngredientToRecipe = async (recipeId, foodId, quantity) => {
  const { data, error } = await supabase
    .from('recipe_ingredients')
    .insert([{ recipe_id: recipeId, food_id: foodId, quantity }])
    .select(`*, foods (*)`)
    .single()

  if (error) throw error
  return data
}

// Retirer un ingrédient d'une recette
export const removeIngredientFromRecipe = async (ingredientId) => {
  const { error } = await supabase
    .from('recipe_ingredients')
    .delete()
    .eq('id', ingredientId)

  if (error) throw error
}

// Supprimer une recette (cascade supprime aussi les ingrédients)
export const deleteRecipe = async (recipeId) => {
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', recipeId)

  if (error) throw error
}

// Calculer les macros totales d'une recette (pour 1 portion)
export const calculateRecipeNutrition = (recipe, servings = 1) => {
  if (!recipe?.recipe_ingredients) return { calories: 0, proteins: 0, carbs: 0, fats: 0 }

  const totals = recipe.recipe_ingredients.reduce((acc, ingredient) => {
    const food = ingredient.foods
    const ratio = ingredient.quantity / food.serving_size
    return {
      calories: acc.calories + food.calories * ratio,
      proteins: acc.proteins + food.proteins * ratio,
      carbs: acc.carbs + food.carbs * ratio,
      fats: acc.fats + food.fats * ratio,
    }
  }, { calories: 0, proteins: 0, carbs: 0, fats: 0 })

  // Diviser par le nombre de portions
  const portions = recipe.servings || 1
  return {
    calories: totals.calories / portions * servings,
    proteins: totals.proteins / portions * servings,
    carbs: totals.carbs / portions * servings,
    fats: totals.fats / portions * servings,
  }
}

// Ajouter tous les aliments d'une recette à un repas
export const addRecipeToMeal = async (mealId, recipe, servings = 1) => {
  if (!recipe?.recipe_ingredients?.length) return

  const portions = recipe.servings || 1
  const ratio = servings / portions

  const inserts = recipe.recipe_ingredients.map((ingredient) => ({
    meal_id: mealId,
    food_id: ingredient.food_id,
    quantity: Math.round(ingredient.quantity * ratio),
  }))

  const { error } = await supabase
    .from('meal_foods')
    .insert(inserts)

  if (error) throw error
}
