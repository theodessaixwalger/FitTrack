import { supabase } from '../config/supabase'
import { logActivity } from './streakService'

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
export async function addExercise(dayId, exerciseName, setsData = null, reps = null, weight = null, weightUnit = 'kg') {
  // Si setsData est un tableau, c'est le nouveau format avec sets individuels
  // Sinon, c'est l'ancien format avec sets/reps/weight globaux
  
  const isNewFormat = Array.isArray(setsData)
  
  const { data: exercise, error: exerciseError } = await supabase
    .from('day_exercises')
    .insert({ 
      day_id: dayId, 
      exercise_name: exerciseName,
      // Pour rétrocompatibilité, on garde les anciennes colonnes si format ancien
      sets: isNewFormat ? null : setsData,
      reps: isNewFormat ? null : reps,
      weight: isNewFormat ? null : weight,
      weight_unit: isNewFormat ? null : weightUnit
    })
    .select()
    .single()
  
  if (exerciseError) {
    throw exerciseError
  }
  
  // Si nouveau format, ajouter les sets individuels
  if (isNewFormat && setsData.length > 0) {
    await addExerciseSets(exercise.id, setsData)
  }
  
  // Logger l'activité pour le streak
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await logActivity(user.id, true, false) // has_workout = true
    }
  } catch (error) {
    console.error('Error logging activity for streak:', error)
    // Ne pas bloquer si le logging échoue
  }
  
  return exercise
}

export async function deleteExercise(exerciseId) {
  await supabase
    .from('day_exercises')
    .delete()
    .eq('id', exerciseId)
}

// Mettre à jour le poids d'un exercice
export async function updateExerciseWeight(exerciseId, weight, weightUnit = 'kg') {
  const { data } = await supabase
    .from('day_exercises')
    .update({ weight, weight_unit: weightUnit })
    .eq('id', exerciseId)
    .select()
    .single()
  return data
}

// ========== HISTORIQUE DES POIDS ==========

// Ajouter une entrée dans l'historique
export async function addExerciseHistory(userId, exerciseName, weight, weightUnit, sets, reps, notes = null) {
  const { data } = await supabase
    .from('exercise_history')
    .insert({
      user_id: userId,
      exercise_name: exerciseName,
      weight,
      weight_unit: weightUnit,
      sets,
      reps,
      notes
    })
    .select()
    .single()
  return data
}

// Récupérer l'historique d'un exercice
export async function getExerciseHistory(userId, exerciseName, limit = 10) {
  const { data } = await supabase
    .from('exercise_history')
    .select('*')
    .eq('user_id', userId)
    .eq('exercise_name', exerciseName)
    .order('performed_at', { ascending: false })
    .limit(limit)
  return data || []
}

// Récupérer le dernier poids utilisé pour un exercice
export async function getLastWeight(userId, exerciseName) {
  const { data } = await supabase
    .from('exercise_history')
    .select('weight, weight_unit')
    .eq('user_id', userId)
    .eq('exercise_name', exerciseName)
    .order('performed_at', { ascending: false })
    .limit(1)
    .single()
  return data
}

// Suggérer une augmentation de poids intelligente
export async function suggestWeightIncrease(userId, exerciseName) {
  const history = await getExerciseHistory(userId, exerciseName, 10)
  
  if (history.length < 3) {
    return null // Pas assez de données
  }

  const lastWeight = parseFloat(history[0].weight)
  const lastUnit = history[0].weight_unit
  
  // Analyser les 5 dernières séances
  const recentSessions = history.slice(0, Math.min(5, history.length))
  
  // Calculer le taux de réussite (3+ séries ET 10+ reps)
  const successfulSessions = recentSessions.filter(h => {
    const sets = parseInt(h.sets)
    const reps = h.reps.toString()
    const minReps = parseInt(reps.split('-')[0]) || parseInt(reps)
    return sets >= 3 && minReps >= 10
  })
  
  const successRate = (successfulSessions.length / recentSessions.length) * 100
  
  // Calculer la tendance de poids
  const weights = recentSessions.map(h => parseFloat(h.weight))
  const avgRecent = weights.slice(0, 3).reduce((a, b) => a + b, 0) / Math.min(3, weights.length)
  const avgPrevious = weights.slice(3, 6).reduce((a, b) => a + b, 0) / Math.max(1, weights.slice(3, 6).length)
  const trend = avgPrevious > 0 ? ((avgRecent - avgPrevious) / avgPrevious) * 100 : 0
  
  // Logique de suggestion intelligente
  let suggestion = null
  
  if (successRate >= 80 && trend >= -5) {
    // Excellent : 80%+ de réussite et tendance stable/positive
    suggestion = {
      weight: lastWeight + 2.5,
      unit: lastUnit,
      confidence: 'high',
      reason: `🔥 Excellent ! ${successRate.toFixed(0)}% de réussite sur vos dernières séances. Augmentez de 2.5${lastUnit} !`,
      color: 'var(--success)'
    }
  } else if (successRate >= 60 && trend >= 0) {
    // Bon : 60%+ de réussite et tendance positive
    suggestion = {
      weight: lastWeight + 1.25,
      unit: lastUnit,
      confidence: 'medium',
      reason: `💪 Bien joué ! ${successRate.toFixed(0)}% de réussite. Essayez +1.25${lastUnit} pour progresser.`,
      color: 'var(--primary)'
    }
  } else if (successRate >= 40) {
    // Moyen : maintenir le poids actuel
    suggestion = {
      weight: lastWeight,
      unit: lastUnit,
      confidence: 'low',
      reason: `⚡ Continuez à ${lastWeight}${lastUnit} pour consolider votre technique.`,
      color: 'var(--warning)'
    }
  } else {
    // Difficile : réduire légèrement
    suggestion = {
      weight: Math.max(lastWeight - 2.5, 0),
      unit: lastUnit,
      confidence: 'low',
      reason: `🎯 Réduisez à ${Math.max(lastWeight - 2.5, 0)}${lastUnit} pour mieux maîtriser le mouvement.`,
      color: 'var(--info)'
    }
  }
  
  return {
    ...suggestion,
    successRate,
    trend,
    sessionsAnalyzed: recentSessions.length
  }
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

// ===================================
// EXERCISE SETS (Séries individuelles)
// ===================================

// Ajouter un set à un exercice
export async function addExerciseSet(exerciseId, setNumber, reps, weight, weightUnit = 'kg') {
  const { data } = await supabase
    .from('exercise_sets')
    .insert({
      exercise_id: exerciseId,
      set_number: setNumber,
      reps,
      weight,
      weight_unit: weightUnit
    })
    .select()
    .single()
  return data
}

// Ajouter plusieurs sets en une fois
export async function addExerciseSets(exerciseId, sets) {
  // sets = [{ reps: 12, weight: 50, weight_unit: 'kg' }, ...]
  const setsData = sets.map((set, index) => ({
    exercise_id: exerciseId,
    set_number: index + 1,
    reps: set.reps,
    weight: set.weight,
    weight_unit: set.weight_unit || 'kg'
  }))
  
  const { data, error } = await supabase
    .from('exercise_sets')
    .insert(setsData)
    .select()
  
  if (error) {
    throw error
  }
  
  return data
}

// Récupérer tous les sets d'un exercice
export async function getExerciseSets(exerciseId) {
  const { data } = await supabase
    .from('exercise_sets')
    .select('*')
    .eq('exercise_id', exerciseId)
    .order('set_number', { ascending: true })
  return data || []
}

// Mettre à jour un set
export async function updateExerciseSet(setId, reps, weight, weightUnit) {
  const { data } = await supabase
    .from('exercise_sets')
    .update({ 
      reps, 
      weight, 
      weight_unit: weightUnit 
    })
    .eq('id', setId)
    .select()
    .single()
  return data
}

// Supprimer un set
export async function deleteExerciseSet(setId) {
  await supabase
    .from('exercise_sets')
    .delete()
    .eq('id', setId)
}

// Supprimer tous les sets d'un exercice
export async function deleteAllExerciseSets(exerciseId) {
  await supabase
    .from('exercise_sets')
    .delete()
    .eq('exercise_id', exerciseId)
}

// Mettre à jour les sets d'un exercice (ajouter, modifier, supprimer)
export async function updateExerciseSets(exerciseId, sets, deletedSetIds = []) {
  try {
    // 1. Supprimer les sets marqués pour suppression
    if (deletedSetIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('exercise_sets')
        .delete()
        .in('id', deletedSetIds)
      
      if (deleteError) throw deleteError
    }
    
    // 2. Séparer les sets existants et nouveaux
    const existingSets = sets.filter(set => set.id)
    const newSets = sets.filter(set => !set.id)
    
    // 3. Mettre à jour les sets existants
    if (existingSets.length > 0) {
      for (const set of existingSets) {
        const { error: updateError } = await supabase
          .from('exercise_sets')
          .update({
            reps: set.reps,
            weight: set.weight || null,
            weight_unit: set.weight_unit || 'kg'
          })
          .eq('id', set.id)
        
        if (updateError) throw updateError
      }
    }
    
    // 4. Insérer les nouveaux sets
    if (newSets.length > 0) {
      const setsData = newSets.map((set, index) => ({
        exercise_id: exerciseId,
        set_number: existingSets.length + index + 1,
        reps: set.reps,
        weight: set.weight || null,
        weight_unit: set.weight_unit || 'kg'
      }))
      
      const { error: insertError } = await supabase
        .from('exercise_sets')
        .insert(setsData)
      
      if (insertError) throw insertError
    }
    
    // 5. Renumeroter tous les sets
    const allSets = await getExerciseSets(exerciseId)
    for (let i = 0; i < allSets.length; i++) {
      await supabase
        .from('exercise_sets')
        .update({ set_number: i + 1 })
        .eq('id', allSets[i].id)
    }
    
    return true
  } catch (error) {
    console.error('Error updating exercise sets:', error)
    throw error
  }
}
