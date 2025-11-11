import { supabase } from '../config/supabase';

export const saveWeightProgress = async (weight, notes = '') => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('weight_progress')
    .insert([
      {
        user_id: user.id,
        weight: weight,
        notes: notes,
        recorded_at: new Date().toISOString()
      }
    ])
    .select();

  if (error) throw error;
  return data;
};

export const getWeightProgress = async (days = 30) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('weight_progress')
    .select('*')
    .eq('user_id', user.id)
    .gte('recorded_at', startDate.toISOString())
    .order('recorded_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const deleteWeightProgress = async (id) => {
  const { error } = await supabase
    .from('weight_progress')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
