-- Créer la table pour les sets individuels
CREATE TABLE IF NOT EXISTS public.exercise_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID NOT NULL REFERENCES day_exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight DECIMAL(6,2),
  weight_unit TEXT DEFAULT 'kg',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_exercise_sets_exercise_id ON exercise_sets(exercise_id);

-- Activer RLS
ALTER TABLE exercise_sets ENABLE ROW LEVEL SECURITY;

-- Politique pour voir ses propres sets
DROP POLICY IF EXISTS "Users can view their own sets" ON exercise_sets;
CREATE POLICY "Users can view their own sets"
  ON exercise_sets FOR SELECT
  USING (
    exercise_id IN (
      SELECT de.id FROM day_exercises de
      JOIN program_days pd ON de.day_id = pd.id
      JOIN workout_programs p ON pd.program_id = p.id
      WHERE p.user_id::uuid = auth.uid()
    )
  );

-- Politique pour insérer ses propres sets
DROP POLICY IF EXISTS "Users can insert their own sets" ON exercise_sets;
CREATE POLICY "Users can insert their own sets"
  ON exercise_sets FOR INSERT
  WITH CHECK (
    exercise_id IN (
      SELECT de.id FROM day_exercises de
      JOIN program_days pd ON de.day_id = pd.id
      JOIN workout_programs p ON pd.program_id = p.id
      WHERE p.user_id::uuid = auth.uid()
    )
  );

-- Politique pour mettre à jour ses propres sets
DROP POLICY IF EXISTS "Users can update their own sets" ON exercise_sets;
CREATE POLICY "Users can update their own sets"
  ON exercise_sets FOR UPDATE
  USING (
    exercise_id IN (
      SELECT de.id FROM day_exercises de
      JOIN program_days pd ON de.day_id = pd.id
      JOIN workout_programs p ON pd.program_id = p.id
      WHERE p.user_id::uuid = auth.uid()
    )
  );

-- Politique pour supprimer ses propres sets
DROP POLICY IF EXISTS "Users can delete their own sets" ON exercise_sets;
CREATE POLICY "Users can delete their own sets"
  ON exercise_sets FOR DELETE
  USING (
    exercise_id IN (
      SELECT de.id FROM day_exercises de
      JOIN program_days pd ON de.day_id = pd.id
      JOIN workout_programs p ON pd.program_id = p.id
      WHERE p.user_id::uuid = auth.uid()
    )
  );

-- Migration optionnelle : convertir les exercices existants avec poids global en sets
-- ATTENTION : Exécuter cette requête seulement si vous voulez migrer les données existantes
-- Décommentez les lignes ci-dessous pour migrer :

/*
INSERT INTO exercise_sets (exercise_id, set_number, reps, weight, weight_unit)
SELECT 
  de.id as exercise_id,
  generate_series(1, de.sets) as set_number,
  CASE 
    WHEN de.reps LIKE '%-%' THEN CAST(split_part(de.reps, '-', 1) AS INTEGER)
    ELSE CAST(de.reps AS INTEGER)
  END as reps,
  de.weight,
  de.weight_unit
FROM day_exercises de
WHERE de.weight IS NOT NULL 
  AND de.sets IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM exercise_sets es WHERE es.exercise_id = de.id
  );
*/
