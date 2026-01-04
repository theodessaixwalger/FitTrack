import { supabase } from '../config/supabase'

// Créer ou mettre à jour le profil
export async function saveUserProfile(profileData) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('Auth error:', authError)
      throw new Error('Erreur d\'authentification')
    }

    if (!user) throw new Error('Utilisateur non connecté')

    // Mettre à jour les métadonnées utilisateur
    const fullName = `${profileData.first_name} ${profileData.last_name}`;
    await supabase.auth.updateUser({
      data: { full_name: fullName }
    });

    const profileToSave = {
      user_id: user.id,
      ...profileData,
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

    if (error) {
      console.error('Upsert error:', error)
      throw error
    }


    return data
  } catch (error) {
    console.error('Erreur sauvegarde profil:', error)
    throw error
  }
}

// Récupérer le profil utilisateur
export async function getUserProfile() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('Auth error:', authError)
      throw new Error('Erreur d\'authentification')
    }

    if (!user) {

      throw new Error('Utilisateur non connecté')
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      console.error('Profile fetch error:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Erreur récupération profil:', error)
    throw error
  }
}

// Mettre à jour le profil utilisateur (fonction spécifique pour l'édition)
export async function updateUserProfile(updates) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('Auth error:', authError)
      throw new Error('Erreur d\'authentification')
    }

    if (!user) throw new Error('Utilisateur non connecté')

    // Mettre à jour les métadonnées utilisateur si nom/prénom changent
    if (updates.first_name || updates.last_name) {
      const fullName = `${updates.first_name} ${updates.last_name}`;
      await supabase.auth.updateUser({
        data: { full_name: fullName }
      });
    }

    const profileToUpdate = {
      ...updates,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update(profileToUpdate)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Update error:', error)
      throw error
    }


    return data
  } catch (error) {
    console.error('Erreur mise à jour profil:', error)
    throw error
  }
}
