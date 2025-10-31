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
