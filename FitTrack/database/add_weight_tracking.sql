-- ============================================================================
-- AJOUT DU SYSTÈME DE SUIVI DES POIDS
-- ============================================================================
-- Ce script ajoute les colonnes nécessaires pour enregistrer les poids
-- utilisés pour chaque exercice (haltères, barres, machines)
-- ============================================================================

-- Ajouter les colonnes de poids à la table day_exercises
ALTER TABLE public.day_exercises
ADD COLUMN IF NOT EXISTS weight DECIMAL(6,2),
ADD COLUMN IF NOT EXISTS weight_unit TEXT DEFAULT 'kg';

-- Créer un index pour optimiser les requêtes sur le poids
CREATE INDEX IF NOT EXISTS idx_day_exercises_weight ON public.day_exercises(weight);

-- Créer une table pour l'historique des poids (pour suivre la progression)
CREATE TABLE IF NOT EXISTS public.exercise_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  weight DECIMAL(6,2),
  weight_unit TEXT DEFAULT 'kg',
  sets INTEGER,
  reps TEXT,
  notes TEXT,
  performed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les requêtes d'historique
CREATE INDEX IF NOT EXISTS idx_exercise_history_user_id ON public.exercise_history(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_history_exercise_name ON public.exercise_history(exercise_name);
CREATE INDEX IF NOT EXISTS idx_exercise_history_performed_at ON public.exercise_history(performed_at);

-- Activer RLS sur la table exercise_history
ALTER TABLE public.exercise_history ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques si elles existent déjà (pour éviter les erreurs)
DROP POLICY IF EXISTS "Users can view their own exercise history" ON public.exercise_history;
DROP POLICY IF EXISTS "Users can create their own exercise history" ON public.exercise_history;
DROP POLICY IF EXISTS "Users can delete their own exercise history" ON public.exercise_history;

-- Politique SELECT: Les utilisateurs peuvent voir uniquement leur historique
CREATE POLICY "Users can view their own exercise history"
  ON public.exercise_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique INSERT: Les utilisateurs peuvent créer leur propre historique
CREATE POLICY "Users can create their own exercise history"
  ON public.exercise_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique DELETE: Les utilisateurs peuvent supprimer leur propre historique
CREATE POLICY "Users can delete their own exercise history"
  ON public.exercise_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================

-- Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'day_exercises'
AND column_name IN ('weight', 'weight_unit');

-- Vérifier que la table exercise_history a été créée
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'exercise_history';

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================
