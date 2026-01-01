import { supabase } from '../config/supabase'

// Logger l'activité du jour
export const logActivity = async (userId, hasWorkout = false, hasLoggedNutrition = false) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('user_activity')
      .upsert({
        user_id: userId,
        activity_date: today,
        has_workout: hasWorkout,
        has_logged_nutrition: hasLoggedNutrition
      }, {
        onConflict: 'user_id,activity_date'
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error logging activity:', error)
    throw error
  }
}

// Calculer le streak actuel
export const getCurrentStreak = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_activity')
      .select('activity_date, has_workout, has_logged_nutrition')
      .eq('user_id', userId)
      .order('activity_date', { ascending: false })
      .limit(365) // Limiter à 1 an
    
    if (error) throw error
    
    if (!data || data.length === 0) {
      return { streak: 0, lastActivityDate: null }
    }
    
    // Calculer le streak
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = 0; i < data.length; i++) {
      const activityDate = new Date(data[i].activity_date)
      activityDate.setHours(0, 0, 0, 0)
      
      const expectedDate = new Date(today)
      expectedDate.setDate(today.getDate() - i)
      expectedDate.setHours(0, 0, 0, 0)
      
      // Vérifier si l'activité correspond à la date attendue
      if (activityDate.getTime() === expectedDate.getTime()) {
        // Compter comme actif si workout OU nutrition logged
        if (data[i].has_workout || data[i].has_logged_nutrition) {
          streak++
        } else {
          break
        }
      } else {
        break
      }
    }
    
    return {
      streak,
      lastActivityDate: data[0].activity_date
    }
  } catch (error) {
    console.error('Error getting streak:', error)
    return { streak: 0, lastActivityDate: null }
  }
}

// Récupérer les 7 derniers jours
export const getLast7Days = async (userId) => {
  try {
    const today = new Date()
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(today.getDate() - 6)
    
    const { data, error } = await supabase
      .from('user_activity')
      .select('activity_date, has_workout, has_logged_nutrition')
      .eq('user_id', userId)
      .gte('activity_date', sevenDaysAgo.toISOString().split('T')[0])
      .lte('activity_date', today.toISOString().split('T')[0])
      .order('activity_date', { ascending: true })
    
    if (error) throw error
    
    // Créer un tableau des 7 derniers jours
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(today.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const activity = data?.find(d => d.activity_date === dateStr)
      
      days.push({
        date: dateStr,
        dayName: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][date.getDay()],
        isActive: activity ? (activity.has_workout || activity.has_logged_nutrition) : false,
        isToday: i === 0
      })
    }
    
    return days
  } catch (error) {
    console.error('Error getting last 7 days:', error)
    return []
  }
}
