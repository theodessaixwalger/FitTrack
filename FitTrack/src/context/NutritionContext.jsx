// src/context/NutritionContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { getMealsByDate, calculateDailyNutrition } from '../services/mealService'
import { getUserProfile, updateUserProfile } from '../services/profileService'
import { logActivity } from '../services/streakService'
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
  const { user } = useAuth()

  const [meals, setMeals] = useState([])
  const [dailyNutrition, setDailyNutrition] = useState({
    calories: 0,
    proteins: 0,
    carbs: 0,
    fats: 0
  })

  const [nutritionGoals, setNutritionGoals] = useState({
    calorieGoal: 2700,
    proteinGoal: 120,
    carbsGoal: 400,
    fatsGoal: 70
  })

  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(Date.now())

  const today = new Date().toISOString().split('T')[0]

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

  useEffect(() => {
    if (user) {
      loadMeals()
    }
  }, [user])

  const loadMeals = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await getMealsByDate(user.id, today)
      setMeals(data)
      const nutrition = calculateDailyNutrition(data)
      setDailyNutrition(nutrition)
      setLastUpdate(Date.now())
      
      // Logger l'activité pour le streak si des repas sont présents
      if (data && data.length > 0) {
        try {
          await logActivity(user.id, false, true) // has_logged_nutrition = true
        } catch (error) {
          console.error('Error logging nutrition activity for streak:', error)
          // Ne pas bloquer si le logging échoue
        }
      }
    } catch (error) {
      console.error('Erreur chargement repas:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshNutrition = async () => {
    await loadMeals()
  }

  // ✅ Nouvelle fonction pour mettre à jour les objectifs
  const updateNutritionGoals = async (newGoals) => {
    try {
      await updateUserProfile({
        daily_calorie_goal: newGoals.calorieGoal,
        daily_protein_goal: newGoals.proteinGoal,
        daily_carbs_goal: newGoals.carbsGoal,
        daily_fats_goal: newGoals.fatsGoal
      })
      
      setNutritionGoals(newGoals)
    } catch (error) {
      console.error('Erreur mise à jour objectifs:', error)
      throw error
    }
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
    calorieGoal: nutritionGoals.calorieGoal,
    proteinGoal: nutritionGoals.proteinGoal,
    carbsGoal: nutritionGoals.carbsGoal,
    fatsGoal: nutritionGoals.fatsGoal,
    lastUpdate,
    refreshNutrition,
    updateNutritionGoals,  // ✅ Ajout de la nouvelle fonction
    calculateProgress,
    getRemainingCalories
  }

  return (
    <NutritionContext.Provider value={value}>
      {children}
    </NutritionContext.Provider>
  )
}
