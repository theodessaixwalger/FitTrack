import { supabase } from '../config/supabase'

export async function getUserNote() {
  try {
    const { data, error } = await supabase
      .from('user_notes')
      .select('*')
      .maybeSingle()  // ✅ Utilisez maybeSingle() au lieu de single()

    if (error) {
      throw error
    }

    return data  // Retourne null si pas de note, c'est normal
  } catch (error) {
    console.error('Erreur récupération note:', error)
    return null
  }
}

export async function saveUserNote(content) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('Utilisateur non connecté')

    const { data, error } = await supabase
      .from('user_notes')
      .upsert({
        user_id: user.id,
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
