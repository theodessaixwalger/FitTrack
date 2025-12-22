import { supabase } from '../config/supabase'

// Programmes
export async function getActiveProgram(userId) {
  const { data } = await supabase
    .from('workout_programs')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()
  return data
}

export async function createProgram(userId, name) {
  // Désactiver les autres programmes
  await supabase
    .from('workout_programs')
    .update({ is_active: false })
    .eq('user_id', userId)

  const { data } = await supabase
    .from('workout_programs')
    .insert({ user_id: userId, name, is_active: true })
    .select()
    .single()
  return data
}

// Jours
export async function getProgramDays(programId) {
  const { data } = await supabase
    .from('program_days')
    .select(`
      *,
      exercises:day_exercises(*)
    `)
    .eq('program_id', programId)
    .order('day_of_week')
  return data || []
}

export async function addDay(programId, dayOfWeek, name) {
  const { data } = await supabase
    .from('program_days')
    .insert({ program_id: programId, day_of_week: dayOfWeek, name })
    .select()
    .single()
  return data
}

// Exercices
export async function addExercise(dayId, exerciseName, sets, reps) {
  const { data } = await supabase
    .from('day_exercises')
    .insert({ day_id: dayId, exercise_name: exerciseName, sets, reps })
    .select()
    .single()
  return data
}

export async function deleteExercise(exerciseId) {
  await supabase
    .from('day_exercises')
    .delete()
    .eq('id', exerciseId)
}

// Supprimer un jour
export async function deleteDay(dayId) {
  await supabase
    .from('program_days')
    .delete()
    .eq('id', dayId)
}

// Mettre à jour un jour
export async function updateDay(dayId, name, dayOfWeek) {
  const { data } = await supabase
    .from('program_days')
    .update({ name, day_of_week: dayOfWeek })
    .eq('id', dayId)
    .select()
    .single()
  return data
}

// ========== BIBLIOTHÈQUE D'EXERCICES ==========

// Récupérer tous les exercices de l'utilisateur
export async function getAllExercises(userId) {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('user_id', userId)
    .order('name')
  
  if (error) {
    console.error('Erreur lors de la récupération des exercices:', error)
    return []
  }
  
  return data || []
}

// Créer un nouvel exercice personnalisé
export async function createExercise(userId, exerciseData) {
  const { data, error } = await supabase
    .from('exercises')
    .insert({
      user_id: userId,
      name: exerciseData.name,
      muscle_group: exerciseData.muscle_group,
      equipment: exerciseData.equipment || null,
      description: exerciseData.description || null
    })
    .select()
    .single()
  
  if (error) {
    console.error('Erreur lors de la création de l\'exercice:', error)
    throw error
  }
  
  return data
}

// Mettre à jour un exercice existant
export async function updateExercise(exerciseId, exerciseData) {
  const { data, error } = await supabase
    .from('exercises')
    .update({
      name: exerciseData.name,
      muscle_group: exerciseData.muscle_group,
      equipment: exerciseData.equipment || null,
      description: exerciseData.description || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', exerciseId)
    .select()
    .single()
  
  if (error) {
    console.error('Erreur lors de la mise à jour de l\'exercice:', error)
    throw error
  }
  
  return data
}

// Supprimer un exercice personnalisé
export async function deleteCustomExercise(exerciseId) {
  const { error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', exerciseId)
  
  if (error) {
    console.error('Erreur lors de la suppression de l\'exercice:', error)
    throw error
  }
}

// Obtenir l'icône du groupe musculaire
export function getMuscleGroupIcon(muscleGroup) {
  const icons = {
    'Pectoraux': '💪',
    'Dos': '🦾',
    'Jambes': '🦵',
    'Épaules': '🏋️',
    'Biceps': '💪',
    'Triceps': '💪',
    'Abdominaux': '🔥',
    'Cardio': '❤️',
    'Fessiers': '🍑',
    'Mollets': '🦵',
    'Avant-bras': '✊',
    'Trapèzes': '🦾'
  }
  
  return icons[muscleGroup] || '💪'
}

// Initialiser des exercices par défaut pour un nouvel utilisateur
export async function initializeDefaultExercises(userId) {
  const defaultExercises = [
    // Pectoraux
    { name: 'Développé couché', muscle_group: 'Pectoraux', equipment: 'Barre' },
    { name: 'Développé incliné', muscle_group: 'Pectoraux', equipment: 'Haltères' },
    { name: 'Écarté couché', muscle_group: 'Pectoraux', equipment: 'Haltères' },
    { name: 'Pompes', muscle_group: 'Pectoraux', equipment: 'Poids du corps' },
    
    // Dos
    { name: 'Tractions', muscle_group: 'Dos', equipment: 'Barre de traction' },
    { name: 'Rowing barre', muscle_group: 'Dos', equipment: 'Barre' },
    { name: 'Tirage vertical', muscle_group: 'Dos', equipment: 'Machine' },
    { name: 'Rowing haltère', muscle_group: 'Dos', equipment: 'Haltères' },
    
    // Jambes
    { name: 'Squat', muscle_group: 'Jambes', equipment: 'Barre' },
    { name: 'Presse à cuisses', muscle_group: 'Jambes', equipment: 'Machine' },
    { name: 'Fentes', muscle_group: 'Jambes', equipment: 'Haltères' },
    { name: 'Leg curl', muscle_group: 'Jambes', equipment: 'Machine' },
    
    // Épaules
    { name: 'Développé militaire', muscle_group: 'Épaules', equipment: 'Barre' },
    { name: 'Élévations latérales', muscle_group: 'Épaules', equipment: 'Haltères' },
    { name: 'Oiseau', muscle_group: 'Épaules', equipment: 'Haltères' },
    
    // Biceps
    { name: 'Curl barre', muscle_group: 'Biceps', equipment: 'Barre' },
    { name: 'Curl haltères', muscle_group: 'Biceps', equipment: 'Haltères' },
    { name: 'Curl marteau', muscle_group: 'Biceps', equipment: 'Haltères' },
    
    // Triceps
    { name: 'Dips', muscle_group: 'Triceps', equipment: 'Barres parallèles' },
    { name: 'Extension triceps', muscle_group: 'Triceps', equipment: 'Haltères' },
    { name: 'Barre au front', muscle_group: 'Triceps', equipment: 'Barre' },
    
    // Abdominaux
    { name: 'Crunch', muscle_group: 'Abdominaux', equipment: 'Poids du corps' },
    { name: 'Planche', muscle_group: 'Abdominaux', equipment: 'Poids du corps' },
    { name: 'Relevé de jambes', muscle_group: 'Abdominaux', equipment: 'Poids du corps' }
  ]

  const exercisesToInsert = defaultExercises.map(ex => ({
    user_id: userId,
    ...ex
  }))

  const { data, error } = await supabase
    .from('exercises')
    .insert(exercisesToInsert)
    .select()

  if (error) {
    console.error('Erreur lors de l\'initialisation des exercices par défaut:', error)
    throw error
  }

  return data
}
