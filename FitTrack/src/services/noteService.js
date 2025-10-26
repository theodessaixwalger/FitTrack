import { supabase } from '../config/supabase'

export async function getUserNote(userId) {
  try {
    const { data, error } = await supabase
      .from('user_notes')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    return data
  } catch (error) {
    console.error('Erreur récupération note:', error)
    return null
  }
}

export async function saveUserNote(userId, content) {
  try {
    const { data, error } = await supabase
      .from('user_notes')
      .upsert({
        user_id: userId,
        content: content,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erreur sauvegarde note:', error)
    throw error
  }
}
