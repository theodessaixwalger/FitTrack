# FitTrack — Documentation fonctionnelle

Application mobile-first de suivi fitness & nutrition (React + Vite + Supabase).
Document généré à partir de l'analyse complète du code source (`src/`, `database/`, configuration).

---

## 1. Vue d'ensemble

| | |
|---|---|
| **Nom** | FitTrack — *Application Fitness Mobile* |
| **Type** | Web app mobile-first (PWA partielle), 100 % client + Supabase |
| **Langue UI** | Français |
| **Version affichée** | 2.1.0 (`Profile.jsx`) |
| **Déploiement** | Vercel (SPA rewrite `/(.*) → /index.html`, cache long sur `/assets`) |

### Stack technique

| Couche | Technologie |
|---|---|
| Framework | React 19 + Vite 7 |
| Routing | React Router DOM 7 |
| Backend / BDD / Auth | Supabase (`@supabase/supabase-js` 2.x) |
| Graphiques | Recharts 3 |
| Icônes | Phosphor Icons (`duotone` par défaut) + Lucide React |
| Dates | date-fns 4 (locale `fr`) |
| Styles | CSS custom (design tokens), Tailwind installé mais non utilisé |
| Qualité | ESLint 9 |

### Architecture

```
src/
├── main.jsx                 Point d'entrée : IconContext → AuthProvider → NutritionProvider
├── App.jsx                  MobileOnly → Router → gardes de routes
├── config/supabase.js       Client Supabase (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)
├── context/                 AuthContext, NutritionContext (état global)
├── services/                8 services = toute la logique d'accès aux données
├── pages/                   9 écrans
└── components/              16 composants (modales, cartes, widgets)
```

### Routes

| Route | Écran | Protection |
|---|---|---|
| `/auth` | Connexion / Inscription | Publique (redirige vers `/` si déjà connecté) |
| `/onboarding` | Configuration du profil | Connecté uniquement |
| `/` | Accueil (dashboard) | Connecté + onboarding terminé |
| `/nutrition` | Suivi alimentaire | idem |
| `/exercise` | Programme d'entraînement | idem |
| `/recipes` | Bibliothèque de recettes | idem |
| `/profile` | Profil & progression | idem |
| `/settings` | Paramètres | idem |
| `/privacy` | Confidentialité & sécurité | idem |
| `*` | Redirection vers `/` | — |

Trois gardes distinctes : `ProtectedRoute` (session + `onboarding_completed`), `PublicRoute`, `OnboardingRoute`. Un spinner s'affiche pendant la vérification de session et de profil.

---

## 2. Authentification & compte

### Inscription
- Email + mot de passe + pseudo (stocké dans `user_metadata.full_name`).
- Validations client : champs requis, mot de passe ≥ 6 caractères, pseudo requis.
- Message de confirmation invitant à valider l'email.

### Connexion
- Email + mot de passe, avec bascule afficher/masquer le mot de passe (œil).
- Messages d'erreur traduits et contextualisés :
  - email non confirmé → « Veuillez confirmer votre email… »
  - identifiants invalides → « Email ou mot de passe incorrect. »
- Basculement Connexion ⇄ Inscription sur le même écran.

### Session
- Session restaurée au chargement (`getSession`) et suivie en temps réel (`onAuthStateChange`).
- Déconnexion depuis le profil.
- Changement de mot de passe depuis les Paramètres (validation longueur + confirmation, message de succès temporisé).

---

## 3. Onboarding (4 étapes)

Assistant obligatoire au premier lancement, avec barre de progression (`Étape X sur 4`, pourcentage) et boutons Retour / Continuer désactivés tant que l'étape est invalide.

| Étape | Contenu | Validations |
|---|---|---|
| **1 — Identité** | Prénom, Nom, Date de naissance, Genre (Homme / Femme / Autre) | 2–50 caractères pour les noms ; âge entre 13 et 120 ans |
| **2 — Mensurations** | Taille (cm), Poids actuel (kg), Poids cible (kg) | Taille 100–250 cm ; poids 20–300 kg ; cible 30–300 kg |
| **3 — Objectif** | Objectif fitness + niveau d'activité | Les deux requis |
| **4 — Récapitulatif** | Relecture avant enregistrement | — |

**Objectifs fitness proposés :** Perte de poids · Prise de masse · Maintien · Recomposition.
**Niveaux d'activité :** Sédentaire · Léger (1-3 j/sem) · Modéré (3-5 j/sem) · Actif (6-7 j/sem) · Très actif.

À la validation : `user_profiles` est créé/mis à jour (`upsert` sur `user_id`), `onboarding_completed = true`, et `full_name` est propagé dans les métadonnées Supabase.

---

## 4. Accueil — Dashboard (`/`)

- **Salutation personnalisée** : « Bonjour, {prénom} 👋 ».
- **Actions rapides** : « Ajouter un repas » → `/nutrition`, « Entraînement » → `/exercise`.
- **Indicateur de série (streak)** — voir §9.
- **Anneau de calories** : pourcentage de l'objectif atteint, calories restantes, bascule en « Objectif atteint 🎉 » une fois le but dépassé.
- **Bento de macronutriments** : trois anneaux (Protéines / Glucides / Lipides), valeur consommée sur objectif, une couleur dédiée par macro.
- **Notes personnelles** — voir §10.

---

## 5. Nutrition (`/nutrition`)

### Suivi journalier
- Chargement automatique des repas du jour (`meals` de la date courante).
- Anneau de calories + note contextuelle (« Plus que X kcal… » / « Objectif atteint ! »).
- Trois anneaux de macros avec valeurs consommées / objectifs.

### Quatre repas
Petit-déjeuner · Déjeuner · Dîner · Collations — chacun avec son bouton d'ajout et sa liste.

Chaque ligne d'aliment affiche : nom, calories recalculées selon la quantité, quantité + unité, marque, et trois badges macro (P / G / L). Suppression avec indicateur de chargement inline. État vide explicite (« Aucun aliment ajouté »).

### Ajout d'aliment (`AddFoodModal`)
Modale en bottom-sheet avec deux onglets :

**Onglet Aliments**
- Recherche déclenchée à partir de 2 caractères, sur le nom *et* la marque (`ilike`), 20 résultats max.
- Sélection d'un aliment → écran de saisie de quantité : quantité pré-remplie avec la portion de référence, raccourcis de quantités, et **prévisualisation en direct des macros** pour la quantité saisie.
- **Création d'un nouvel aliment** : nom, marque, catégorie (Fruits, Légumes, Protéines, Produits laitiers, Céréales, Snacks, Autre), portion de référence, unité (g / ml / unité), calories, protéines, glucides, lipides.

**Onglet Recettes**
- Liste des recettes de l'utilisateur avec recherche par nom, ajout en un clic au repas sélectionné.

### Objectifs de macros (`EditMacrosModal`)
Édition des quatre objectifs quotidiens (calories, protéines, glucides, lipides). Persistés dans `user_profiles` (`daily_calorie_goal`, `daily_protein_goal`, `daily_carbs_goal`, `daily_fats_goal`) et rechargés à chaque session.
Valeurs par défaut : **2700 kcal · 120 g P · 400 g G · 70 g L**.

### Calcul nutritionnel
Les totaux agrègent **aliments + recettes** :
- aliment : `valeur × (quantité / portion de référence)`
- recette : macros de tous les ingrédients, divisées par le nombre de portions, multipliées par les portions consommées.

---

## 6. Recettes (`/recipes`)

- **Liste** : carte par recette avec nom, description, badges kcal/P/G/L pour une portion, nombre d'ingrédients et de portions. État vide avec CTA « Créer ma première recette ».
- **Création / édition (`CreateRecipeModal`)** — assistant en 2 étapes :
  1. Nom, description, nombre de portions.
  2. Recherche d'aliments (debounce 300 ms, exclusion des ingrédients déjà ajoutés), ajout, quantité modifiable par ingrédient, suppression, **prévisualisation des macros de la recette en temps réel**.
- **Détail (`RecipeDetailModal`)** : macros recalculées selon le nombre de portions choisi, puis ajout direct à un repas (Petit-déjeuner / Déjeuner / Dîner / Collation). Boutons Modifier et Supprimer.
- **Suppression** avec confirmation ; les ingrédients sont supprimés en cascade.
- Deux modes d'ajout au repas coexistent : en **entrée-recette** unique (`meal_recipes`, depuis la page Nutrition) ou en **éclatement des ingrédients** en aliments individuels (`addRecipeToMeal`, depuis le détail de recette).

---

## 7. Entraînement (`/exercise`)

### Programmes
- Un seul **programme actif** à la fois : créer un nouveau programme désactive automatiquement les autres.
- Carte du programme actif avec compteurs : nombre de jours, nombre total d'exercices.
- État vide guidé si aucun programme.

### Jours d'entraînement
- Ajout d'un jour : jour de la semaine (Lundi → Dimanche) + nom libre (ex. « Pectoraux / Triceps »).
- Le **jour du jour** est marqué d'une ⭐.
- Modification (nom + jour) et suppression (avec confirmation, supprime les exercices associés).
- Chaque jour est **repliable/dépliable** via un chevron animé.

### Exercices
- Liste numérotée, chaque exercice **repliable** avec résumé compact :
  - musculation → « 3 séries · 50 kg »
  - cardio → « ❤️ 4 intervalles »
- Détail déplié : liste des séries (`Set n : X reps × Y kg`, ou durée `MM:SS` en cardio), puis trois actions — **Historique**, **Modifier**, **Supprimer**.

### Ajout d'exercice (`AddExerciseModal`)
- **Bibliothèque d'exercices** filtrable par groupe musculaire (Tous, Pectoraux, Dos, Jambes, Épaules, Biceps, Triceps, Abdominaux, Cardio) et par recherche texte, avec icône dédiée par groupe.
- **Création d'un exercice personnalisé** : nom, groupe musculaire, matériel, description.
- **Deux modes de saisie** :
  - **Musculation** — séries individuelles : répétitions + charge + unité, ajout/suppression de séries à la volée.
  - **Cardio** — intervalles en minutes + secondes (stockés en secondes, marqués par `weight_unit = 'sec'`).
- Champs complémentaires : temps de repos (défaut 60 s) et notes libres.
- Chaque série renseignée avec une charge est **automatiquement journalisée dans l'historique** de l'exercice.

### Modification d'exercice (`EditExerciseModal`)
Édition des séries existantes, ajout de nouvelles, suppression (avec suivi des ids supprimés), puis **renumérotation automatique** des séries.

### Historique & progression (`ExerciseHistoryModal`)
- **Statistiques** : charge max, min, moyenne, et tendance (moyenne des 3 dernières séances vs les 3 précédentes).
- **Courbe d'évolution** des charges (Recharts, 20 derniers points).
- **Liste paginée** des séances (« voir plus »).
- **Suggestion intelligente de charge** (`suggestWeightIncrease`) — nécessite au moins 3 séances. L'algorithme calcule un taux de réussite (séances à ≥ 3 séries et ≥ 10 reps) sur les 5 dernières séances, ainsi qu'une tendance de charge, puis recommande :

  | Taux de réussite | Tendance | Recommandation | Confiance |
  |---|---|---|---|
  | ≥ 80 % | ≥ −5 % | **+2,5 kg** | Haute |
  | ≥ 60 % | ≥ 0 % | **+1,25 kg** | Moyenne |
  | ≥ 40 % | — | **Maintenir** la charge | Basse |
  | < 40 % | — | **−2,5 kg** (technique) | Basse |

### Chronomètre flottant (`Stopwatch`)
Bouton flottant permanent sur la page Entraînement, dépliable en panneau : affichage `MM:SS.cc` (bascule en `HH:MM:SS` au-delà d'une heure), Démarrer / Pause / Réinitialiser, point pulsant et couleur d'accent quand il tourne, repli en pastille avec témoin d'activité.

### Bibliothèque par défaut
`initializeDefaultExercises` prépare 24 exercices prêts à l'emploi répartis sur 7 groupes musculaires (développé couché, tractions, squat, développé militaire, curl barre, dips, planche…).

---

## 8. Profil & progression (`/profile`)

- **En-tête** : initiales en avatar, nom complet, email, et trois stats — Taille (cm), Poids (kg), Objectif (kg).
- **Édition du profil** (modale) : prénom, nom, date de naissance, taille, poids actuel, objectif de poids, objectif fitness, niveau d'activité.
- **Carte Premium** : « Passer à Premium » — **placeholder visuel, sans logique associée**.
- **Suivi du poids** :
  - Bouton « Ajouter » → modale de pesée (poids au dixième + note optionnelle).
  - **Graphique d'évolution** (`ProgressChart`, aire Recharts) avec ligne d'objectif, tooltip personnalisé (date complète + poids + objectif) et calcul de tendance (hausse / baisse).
  - **Sélecteur de période** : 7 jours · 30 jours · 3 mois.
  - **Historique paginé** : 3 entrées par défaut, « Voir tout » déplie une pagination à 5 par page, avec suppression unitaire de chaque pesée.
  - État vide illustré si aucune donnée.
- **Menu Paramètres** : Paramètres généraux → `/settings`, Notifications *(non branché)*, Confidentialité & Sécurité → `/privacy`, Aide & Support *(non branché)*.
- **Déconnexion** et mention de version en pied de page.

---

## 9. Série d'activité — Streak (`StreakIndicator`)

- **Compteur de jours consécutifs** avec message motivationnel évolutif :
  - 0 jour → « Commence ton streak aujourd'hui ! »
  - 1 jour → « Premier jour, continue ! »
  - < 7 jours → « Continue comme ça ! »
  - < 30 jours → « Incroyable régularité ! »
  - ≥ 30 jours → « Tu es une machine ! »
- **Mini-calendrier des 7 derniers jours** : case cochée pour chaque jour actif, jour courant entouré, animation en cascade.
- **Journalisation automatique** : un jour compte comme actif dès qu'il y a un entraînement (`has_workout`, déclenché à l'ajout d'un exercice) **ou** un repas enregistré (`has_logged_nutrition`, déclenché au chargement des repas). Un enregistrement par utilisateur et par date (`upsert` sur `user_id, activity_date`).
- La série s'interrompt dès qu'un jour de la chaîne est manquant ou inactif ; historique analysé sur 365 jours max.

---

## 10. Notes personnelles (`PersonalNote`)

Bloc de note libre sur l'accueil, en lecture seule par défaut, passage en édition via « Modifier », zone de texte redimensionnable, sauvegarde avec indicateur, message de confirmation temporisé (2 s) et annulation possible. Une note unique par utilisateur (`upsert` sur `user_id`).

---

## 11. Paramètres (`/settings`)

| Section | Fonctionnalité | État |
|---|---|---|
| **Langue** | Choix Français 🇫🇷 / English 🇬🇧, persisté en `localStorage` | Stocké mais **aucune traduction appliquée** (pas d'i18n) |
| **Notifications** | 4 interrupteurs : rappels de repas, rappels d'exercices, alertes de streak, rappels de pesée — persistés en `localStorage` | Préférences stockées, **aucune notification réellement envoyée** |
| **Sécurité** | Changement de mot de passe (validation ≥ 6 caractères + confirmation) | Fonctionnel |
| **Maintenance** | Vider le cache `localStorage` (préserve langue et préférences de notification) | Fonctionnel |

Retour vers `/profile` et remontée automatique du scroll à l'ouverture.

---

## 12. Confidentialité & sécurité (`/privacy`)

- **Transparence** : liste des données collectées (profil, programmes, repas, poids, notes) et explication de leur usage.
- **Rassurance sécurité** : chiffrement des données, données privées.
- **Export des données** : génère et télécharge un fichier `fittrack-data-AAAA-MM-JJ.json` regroupant profil, programmes, repas, poids et notes.
- **Suppression du compte** : confirmation en deux temps, puis suppression en cascade des données et déconnexion.

---

## 13. Expérience transverse

### Mobile-only strict (`MobileOnly`)
L'application ne s'affiche **que sous 480 px de large**. Au-delà, un écran d'invitation à ouvrir l'app sur mobile remplace entièrement l'interface (avec suivi du redimensionnement en direct).

### Navigation
Barre de navigation basse persistante à 4 onglets : **Accueil · Nutrition · Exercice · Profil**, avec état actif mis en évidence. Conteneur centré, largeur max 480 px, zone de contenu scrollable avec inertie iOS.

### PWA
`manifest.json` (mode `standalone`, orientation portrait, thème `#0f172a`, icônes 192/512), métadonnées `apple-mobile-web-app-*`, `theme-color: #0D0D0D`, zoom désactivé.
⚠️ Pas de service worker : **pas de fonctionnement hors ligne**.

### Design system
Thème sombre néon avec accent chartreuse `#D4FF3F` sur fond `#0D0D0D`, police Inter (300→900). Tokens CSS complets : rayons, ombres, halos.
**Une couleur par métrique** pour séparer visuellement les blocs : streak (lime), calories (orange `#FF8A3D`), protéines (`#A8E01F`), glucides (cyan `#3DD9D6`), lipides (violet `#9B8CFF`).
Composants récurrents : cartes à halo (`glow-card`), anneaux de progression, badges macro, bottom-sheets, boutons segmentés, états vides en pointillés, spinners, animations d'apparition.

### Retours utilisateur
Spinners de chargement par écran, opacité réduite pendant les suppressions, confirmations avant les actions destructives, états vides toujours accompagnés d'un CTA.

---

## 14. Modèle de données (Supabase)

| Table | Rôle |
|---|---|
| `user_profiles` | Profil : identité, mensurations, objectifs, objectifs macro, `onboarding_completed` |
| `foods` | Base d'aliments (nom, marque, catégorie, portion, unité, macros) |
| `meals` | Repas d'une date (`meal_type`: breakfast / lunch / dinner / snack) |
| `meal_foods` | Aliments d'un repas + quantité |
| `meal_recipes` | Recettes d'un repas + portions |
| `recipes` | Recettes utilisateur (nom, description, portions) |
| `recipe_ingredients` | Ingrédients d'une recette + quantité |
| `workout_programs` | Programmes (`is_active`) |
| `program_days` | Jours d'un programme (`day_of_week`, nom) |
| `day_exercises` | Exercices d'un jour |
| `exercise_sets` | Séries individuelles (`set_number`, reps, poids, unité) |
| `exercises` | Bibliothèque d'exercices (nom, groupe musculaire, matériel) |
| `exercise_history` | Historique des charges par exercice (`performed_at`) |
| `weight_progress` | Pesées (`weight`, `notes`, `recorded_at`) |
| `user_activity` | Activité quotidienne pour le streak |
| `user_notes` | Note personnelle unique par utilisateur |

**Sécurité** : Row Level Security activée avec policies par utilisateur sur `recipes`, `recipe_ingredients` et `user_activity` (scripts dans [database/](database/)). Les scripts SQL des autres tables ne sont pas versionnés — le dossier `database/` est dans le `.gitignore`.

---

## 15. Points d'attention identifiés

Ces incohérences ont été relevées pendant l'analyse ; elles n'ont pas été corrigées.

1. **Noms de tables divergents.** Trois écrans interrogent des tables qui ne correspondent pas à celles utilisées par les services :
   - [Home.jsx:45](src/pages/Home.jsx#L45) lit `profiles.full_name` alors que le profil vit dans `user_profiles` (prénom/nom séparés) → le prénom retombe sur « utilisateur ».
   - [Privacy.jsx](src/pages/Privacy.jsx) (export et suppression) référence `profiles`, `weight_logs` et `personal_notes` au lieu de `user_profiles`, `weight_progress` et `user_notes` → export incomplet et suppression partielle.

2. **Bug de sauvegarde des notes.** [PersonalNote.jsx:39](src/components/PersonalNote.jsx#L39) appelle `saveUserNote(userId, editedNote)` alors que la signature du service est `saveUserNote(content)` ([noteService.js:20](src/services/noteService.js#L20)) : c'est **l'identifiant utilisateur qui est enregistré comme contenu de la note**, pas le texte saisi.

3. **Suppression de compte impossible côté client.** [Privacy.jsx:46](src/pages/Privacy.jsx#L46) appelle `supabase.auth.admin.deleteUser()`, une API réservée à la `service_role` : elle échouera avec la clé anonyme. Le compte d'authentification survit à la suppression des données.

4. **Fonctionnalités affichées mais non branchées** : bouton « Passer à Premium », entrées de menu « Notifications » et « Aide & Support », sélecteur de langue (aucune traduction), préférences de notification (aucun envoi).

5. **Code mort** : `BottomNav.jsx` (dupliqué dans `Layout.jsx`), `ProtectedRoute.jsx` (une version locale est redéfinie dans `App.jsx` et redirige vers `/login`, route inexistante), `AddDayModal.jsx` et `CreateProgramModal.jsx` (jamais importés ; `AddDayModal` importe même un `getDayName` absent du service).

6. **Doublon de providers** : `AuthProvider` est monté deux fois — dans [main.jsx](src/main.jsx) et de nouveau dans [App.jsx](src/App.jsx).

7. **Performance** : le chargement du programme d'entraînement fait un appel réseau par exercice pour récupérer ses séries ([Exercise.jsx:94](src/pages/Exercise.jsx#L94)), et la renumérotation des séries en fait un par série.

8. **Recherche d'aliments** : la requête `ilike` est construite par interpolation de la saisie utilisateur dans `.or(...)` ([foodService.js:18](src/services/foodService.js#L18)) — des caractères comme `,` ou `)` peuvent casser le filtre.

9. **README** : encore le template Vite par défaut, sans documentation du projet.

---

*Document généré le 8 septembre 2026 à partir du commit `2158806`.*
