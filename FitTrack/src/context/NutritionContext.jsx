import { createContext, useContext, useState, useEffect } from 'react'
import { getMealsByDate, calculateDailyNutrition } from '../services/mealService'

const NutritionContext = createContext()

export function useNutrition() {
  const context = useContext(NutritionContext)
  if (!context) {
    throw new Error('useNutrition must be used within a NutritionProvider')
  }
  return context
}

export function NutritionProvider({ children }) {
  const [meals, setMeals] = useState([])
  const [dailyNutrition, setDailyNutrition] = useState({
    calories: 0,
    proteins: 0,
    carbs: 0,
    fats: 0
  })
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(Date.now())

  const userId = 'user-demo' // À remplacer par l'ID réel de l'utilisateur connecté
  const today = new Date().toISOString().split('T')[0]

  const calorieGoal = 2700
  const proteinGoal = 120
  const carbsGoal = 400
  const fatsGoal = 70

  useEffect(() => {
    loadMeals()
  }, [])

  const loadMeals = async () => {
    try {
      setLoading(true)
      const data = await getMealsByDate(userId, today)
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
    return Math.min((dailyNutrition.calories / calorieGoal) * 100, 100)
  }

  const getRemainingCalories = () => {
    return Math.max(calorieGoal - dailyNutrition.calories, 0)
  }

  const value = {
    meals,
    dailyNutrition,
    loading,
    calorieGoal,
    proteinGoal,
    carbsGoal,
    fatsGoal,
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
