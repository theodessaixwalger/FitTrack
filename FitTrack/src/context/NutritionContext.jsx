// src/context/NutritionContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { getMealsByDate, calculateDailyNutrition } from '../services/mealService'
import { getUserProfile } from '../services/profileService'
import { useAuth } from './AuthContext'

const NutritionContext = createContext()

export function useNutrition() {
  const context = useContext(NutritionContext)
  if (!context) {
    throw new Error('useNutrition must be used within a NutritionProvider')
  }
  return context
}

export function NutritionProvider({ children }) {
  const { user } = useAuth() // ✅ Récupérer l'utilisateur connecté
  
  const [meals, setMeals] = useState([])
  const [dailyNutrition, setDailyNutrition] = useState({
    calories: 0,
    proteins: 0,
    carbs: 0,
    fats: 0
  })
  
  // ✅ Objectifs depuis le profil utilisateur
  const [nutritionGoals, setNutritionGoals] = useState({
    calorieGoal: 2700,
    proteinGoal: 120,
    carbsGoal: 400,
    fatsGoal: 70
  })
  
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(Date.now())

  const today = new Date().toISOString().split('T')[0]

  // ✅ Charger le profil utilisateur au démarrage
  useEffect(() => {
    async function loadUserProfile() {
      if (user) {
        try {
          const profile = await getUserProfile()
          if (profile) {
            setNutritionGoals({
              calorieGoal: profile.daily_calorie_goal || 2700,
              proteinGoal: profile.daily_protein_goal || 120,
              carbsGoal: profile.daily_carbs_goal || 400,
              fatsGoal: profile.daily_fats_goal || 70
            })
          }
        } catch (error) {
          console.error('Erreur chargement profil:', error)
        }
      }
    }
    
    loadUserProfile()
  }, [user])

  // ✅ Charger les repas du jour
  useEffect(() => {
    if (user) {
      loadMeals()
    }
  }, [user])

  const loadMeals = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await getMealsByDate(user.id, today) // ✅ Utiliser user.id
      setMeals(data)
      const nutrition = calculateDailyNutrition(data)
      setDailyNutrition(nutrition)
      setLastUpdate(Date.now())
    } catch (error) {
      console.error('Erreur chargement repas:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshNutrition = async () => {
    await loadMeals()
  }

  const calculateProgress = () => {
    return Math.min((dailyNutrition.calories / nutritionGoals.calorieGoal) * 100, 100)
  }

  const getRemainingCalories = () => {
    return Math.max(nutritionGoals.calorieGoal - dailyNutrition.calories, 0)
  }

  const value = {
    meals,
    dailyNutrition,
    loading,
    calorieGoal: nutritionGoals.calorieGoal,      // ✅ Depuis le profil
    proteinGoal: nutritionGoals.proteinGoal,      // ✅ Depuis le profil
    carbsGoal: nutritionGoals.carbsGoal,          // ✅ Depuis le profil
    fatsGoal: nutritionGoals.fatsGoal,            // ✅ Depuis le profil
    lastUpdate,
    refreshNutrition,
    calculateProgress,
    getRemainingCalories
  }

  return (
    <NutritionContext.Provider value={value}>
      {children}
    </NutritionContext.Provider>
  )
}
