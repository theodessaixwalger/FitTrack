import { supabase } from '../config/supabase'

// Récupérer les repas d'un jour spécifique
export const getMealsByDate = async (userId, date) => {
  const { data, error } = await supabase
    .from('meals')
    .select(`
      *,
      meal_foods (
        *,
        foods (*)
      )
    `)
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at')
  
  if (error) throw error
  return data
}

// Créer un nouveau repas
export const createMeal = async (userId, mealType, date = new Date().toISOString().split('T')[0]) => {
  const { data, error } = await supabase
    .from('meals')
    .insert([{
      user_id: userId,
      meal_type: mealType,
      date: date
    }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Ajouter un aliment à un repas
export const addFoodToMeal = async (mealId, foodId, quantity = 1) => {
  const { data, error } = await supabase
    .from('meal_foods')
    .insert([{
      meal_id: mealId,
      food_id: foodId,
      quantity: quantity
    }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Retirer un aliment d'un repas
export const removeFoodFromMeal = async (mealFoodId) => {
  const { error } = await supabase
    .from('meal_foods')
    .delete()
    .eq('id', mealFoodId)
  
  if (error) throw error
}

// Mettre à jour la quantité d'un aliment dans un repas
export const updateMealFoodQuantity = async (mealFoodId, quantity) => {
  const { data, error } = await supabase
    .from('meal_foods')
    .update({ quantity })
    .eq('id', mealFoodId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Supprimer un repas complet
export const deleteMeal = async (mealId) => {
  const { error } = await supabase
    .from('meals')
    .delete()
    .eq('id', mealId)
  
  if (error) throw error
}

// Calculer les totaux nutritionnels d'un repas
export const calculateMealNutrition = (meal) => {
  if (!meal?.meal_foods) return {
    calories: 0,
    proteins: 0,
    carbs: 0,
    fats: 0
  }

  return meal.meal_foods.reduce((totals, mealFood) => {
    const food = mealFood.foods
    const quantity = mealFood.quantity
    const servingRatio = quantity / food.serving_size

    return {
      calories: totals.calories + (food.calories * servingRatio),
      proteins: totals.proteins + (food.proteins * servingRatio),
      carbs: totals.carbs + (food.carbs * servingRatio),
      fats: totals.fats + (food.fats * servingRatio)
    }
  }, { calories: 0, proteins: 0, carbs: 0, fats: 0 })
}

// Calculer les totaux nutritionnels de la journée
export const calculateDailyNutrition = (meals) => {
  return meals.reduce((totals, meal) => {
    const mealNutrition = calculateMealNutrition(meal)
    return {
      calories: totals.calories + mealNutrition.calories,
      proteins: totals.proteins + mealNutrition.proteins,
      carbs: totals.carbs + mealNutrition.carbs,
      fats: totals.fats + mealNutrition.fats
    }
  }, { calories: 0, proteins: 0, carbs: 0, fats: 0 })
}
