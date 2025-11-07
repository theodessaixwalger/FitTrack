import { supabase } from '../config/supabase';

export const getUserProfile = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Non authentifié');

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur getUserProfile:', error);
    throw error;
  }
};

export const createUserProfile = async (profileData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Non authentifié');

    const { data, error } = await supabase
      .from('user_profiles')
      .insert([
        {
          user_id: user.id,
          ...profileData
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur createUserProfile:', error);
    throw error;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Non authentifié');

    const { data, error } = await supabase
      .from('user_profiles')
      .update(profileData)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur updateUserProfile:', error);
    throw error;
  }
};

export const checkProfileExists = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    if (error && error.code === 'PGRST116') {
      // Aucune ligne trouvée
      return false;
    }

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Erreur checkProfileExists:', error);
    return false;
  }
};
