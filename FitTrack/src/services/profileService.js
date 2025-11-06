import { supabase } from '../config/supabase'

// Calculer les besoins caloriques (formule Mifflin-St Jeor)
function calculateBMR(weight, height, age, gender) {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161
  }
}

// Multiplicateurs d'activité
const activityMultipliers = {
  sedentary: 1.2,      // Peu ou pas d'exercice
  light: 1.375,        // Exercice léger 1-3 jours/semaine
  moderate: 1.55,      // Exercice modéré 3-5 jours/semaine
  active: 1.725,       // Exercice intense 6-7 jours/semaine
  very_active: 1.9     // Exercice très intense, travail physique
}

// Calculer les objectifs nutritionnels
function calculateNutritionalGoals(profile) {
  const { 
    current_weight, 
    height, 
    date_of_birth, 
    gender, 
    activity_level, 
    fitness_goal,
    target_weight 
  } = profile

  // Calculer l'âge
  const age = new Date().getFullYear() - new Date(date_of_birth).getFullYear()
  
  // BMR (métabolisme de base)
  const bmr = calculateBMR(current_weight, height, age, gender)
  
  // TDEE (dépense énergétique totale)
  const tdee = bmr * activityMultipliers[activity_level]
  
  // Ajuster selon l'objectif
  let calorieGoal
  switch (fitness_goal) {
    case 'lose_weight':
      calorieGoal = Math.round(tdee - 500) // Déficit de 500 cal
      break
    case 'gain_muscle':
      calorieGoal = Math.round(tdee + 300) // Surplus de 300 cal
      break
    case 'maintain':
      calorieGoal = Math.round(tdee)
      break
    case 'recomp':
      calorieGoal = Math.round(tdee - 200) // Léger déficit
      break
    default:
      calorieGoal = Math.round(tdee)
  }

  // Calculer les macros
  const proteinGoal = Math.round(current_weight * 2) // 2g par kg
  const fatsGoal = Math.round((calorieGoal * 0.25) / 9) // 25% des calories
  const carbsGoal = Math.round((calorieGoal - (proteinGoal * 4) - (fatsGoal * 9)) / 4)

  return {
    daily_calorie_goal: calorieGoal,
    daily_protein_goal: proteinGoal,
    daily_carbs_goal: carbsGoal,
    daily_fats_goal: fatsGoal
  }
}

// Créer ou mettre à jour le profil
export async function saveUserProfile(profileData) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Utilisateur non connecté')

    // Calculer les objectifs nutritionnels
    const nutritionalGoals = calculateNutritionalGoals(profileData)

    const profileToSave = {
      user_id: user.id,
      ...profileData,
      ...nutritionalGoals,
      onboarding_completed: true,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(profileToSave, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erreur sauvegarde profil:', error)
    throw error
  }
}

// Récupérer le profil utilisateur
export async function getUserProfile() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Utilisateur non connecté')

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  } catch (error) {
    console.error('Erreur récupération profil:', error)
    throw error
  }
}
