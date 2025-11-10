import { useState } from 'react'
import { Plus, Trash2, Settings } from 'lucide-react'
import AddFoodModal from '../components/AddFoodModal'
import EditMacrosModal from '../components/EditMacrosModal'
import { createMeal, addFoodToMeal, removeFoodFromMeal } from '../services/mealService'
import { useNutrition } from '../context/NutritionContext'
import { useAuth } from '../context/AuthContext'

function Nutrition() {
  const { user } = useAuth()
  const {
    meals,
    dailyNutrition,
    loading,
    calorieGoal,
    proteinGoal,
    carbsGoal,
    fatsGoal,
    refreshNutrition,
    calculateProgress,
    getRemainingCalories,
    updateNutritionGoals
  } = useNutrition()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMacrosModalOpen, setIsMacrosModalOpen] = useState(false)
  const [selectedMealType, setSelectedMealType] = useState(null)
  const [deletingItem, setDeletingItem] = useState(null)

  const today = new Date().toISOString().split('T')[0]

  const handleAddFood = async (food) => {
    try {
      let meal = meals.find(m => m.meal_type === selectedMealType)

      if (!meal) {
        meal = await createMeal(user.id, selectedMealType, today)
      }

      await addFoodToMeal(meal.id, food.id, food.serving_size)
      await refreshNutrition()
    } catch (error) {
      console.error('Erreur ajout aliment:', error)
    }
  }

  const handleDeleteFood = async (mealFoodId) => {
    try {
      setDeletingItem(mealFoodId)
      await removeFoodFromMeal(mealFoodId)
      await refreshNutrition()
    } catch (error) {
      console.error('Erreur suppression aliment:', error)
    } finally {
      setDeletingItem(null)
    }
  }

  const handleUpdateMacros = async (newGoals) => {
    await updateNutritionGoals(newGoals)
  }

  const openModalForMeal = (mealType) => {
    setSelectedMealType(mealType)
    setIsModalOpen(true)
  }

  const getMealsByType = (type) => {
    return meals.filter(m => m.meal_type === type)
  }

  const MealSection = ({ title, emoji, mealType }) => {
    const mealData = getMealsByType(mealType)
    const hasMeals = mealData.length > 0 && mealData.some(m => m.meal_foods.length > 0)

    return (
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">{emoji} {title}</h2>
          <button 
            onClick={() => openModalForMeal(mealType)}
            style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Plus size={20} />
          </button>
        </div>

        {hasMeals ? (
          <div className="card">
            <div className="card-body" style={{ padding: '0' }}>
              {mealData.map((meal) => (
                meal.meal_foods.map((mealFood) => (
                  <div 
                    key={mealFood.id} 
                    className="list-item"
                    style={{
                      position: 'relative',
                      transition: 'all 0.2s ease',
                      opacity: deletingItem === mealFood.id ? 0.5 : 1
                    }}
                  >
                    <div className="list-item-left" style={{ flex: 1 }}>
                      <div className="list-item-info">
                        <h3>{mealFood.foods.name}</h3>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{mealFood.quantity}{mealFood.foods.serving_unit}</span>
                          {mealFood.foods.brand && (
                            <>
                              <span style={{ opacity: 0.5 }}>•</span>
                              <span>{mealFood.foods.brand}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px' 
                    }}>
                      <div style={{ textAlign: 'right' }}>
                        <div className="list-item-value">
                          {Math.round((mealFood.foods.calories * mealFood.quantity) / mealFood.foods.serving_size)} kcal
                        </div>
                        <div style={{ 
                          fontSize: '11px', 
                          color: 'var(--text-secondary)',
                          fontWeight: '600',
                          marginTop: '2px'
                        }}>
                          P: {Math.round((mealFood.foods.proteins * mealFood.quantity) / mealFood.foods.serving_size)}g • 
                          G: {Math.round((mealFood.foods.carbs * mealFood.quantity) / mealFood.foods.serving_size)}g • 
                          L: {Math.round((mealFood.foods.fats * mealFood.quantity) / mealFood.foods.serving_size)}g
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteFood(mealFood.id)}
                        disabled={deletingItem === mealFood.id}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#EF4444',
                          cursor: 'pointer',
                          padding: '8px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease',
                          opacity: deletingItem === mealFood.id ? 0.5 : 1
                        }}
                        onMouseOver={(e) => {
                          if (deletingItem !== mealFood.id) {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                          }
                        }}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        {deletingItem === mealFood.id ? (
                          <div style={{
                            width: '20px',
                            height: '20px',
                            border: '2px solid currentColor',
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            animation: 'spin 0.6s linear infinite'
                          }} />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              ))}
            </div>
          </div>
        ) : (
          <div style={{
            padding: '32px',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontSize: '14px',
            fontWeight: '600',
            background: 'var(--surface)',
            borderRadius: '16px',
            border: '2px dashed var(--border-light)'
          }}>
            Aucun aliment ajouté
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="page">
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid var(--border-light)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <div style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>
            Chargement...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Nutrition</h1>
        <p className="subtitle">Suivez votre alimentation quotidienne</p>
      </div>

      <div className="page-content">
        {/* Hero Card - Calories du jour */}
        <div className="hero-card">
          <div className="label">Calories aujourd'hui</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span className="value">{Math.round(dailyNutrition.calories)}</span>
            <span className="unit">/ {calorieGoal.toLocaleString()} kcal</span>
          </div>
          <div style={{ marginTop: '24px' }}>
            <div className="progress-bar" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <div className="progress-fill" style={{ 
                width: `${calculateProgress()}%`,
                background: 'rgba(255,255,255,0.9)',
                transition: 'width 0.5s ease'
              }}></div>
            </div>
            <div style={{ 
              marginTop: '12px', 
              fontSize: '14px', 
              opacity: '0.9',
              fontWeight: '600'
            }}>
              {getRemainingCalories() > 0
                ? `Plus que ${Math.round(getRemainingCalories())} kcal pour atteindre votre objectif 🎯`
                : `Objectif atteint ! 🎉`
              }
            </div>
          </div>
        </div>

        {/* Macros avec bouton de modification */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Macronutriments</h2>
            <button 
              onClick={() => setIsMacrosModalOpen(true)}
              style={{
                background: 'var(--surface)',
                color: 'var(--text-primary)',
                border: '2px solid var(--border-light)',
                borderRadius: '12px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)'
                e.currentTarget.style.color = 'var(--primary)'
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-light)'
                e.currentTarget.style.color = 'var(--text-primary)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <Settings size={18} />
            </button>
          </div>
          <div className="macros-grid">
            <div className="macro-item">
              <div className="macro-circle" style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)' }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800' }}>{Math.round(dailyNutrition.proteins)}g</div>
                  <div style={{ fontSize: '11px', opacity: '0.9', fontWeight: '600' }}>Protéines</div>
                </div>
              </div>
              <div className="macro-value">{Math.round(dailyNutrition.proteins)} / {proteinGoal}g</div>
            </div>
            <div className="macro-item">
              <div className="macro-circle" style={{ background: 'linear-gradient(135deg, #4ECDC4 0%, #44A9A3 100%)' }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800' }}>{Math.round(dailyNutrition.carbs)}g</div>
                  <div style={{ fontSize: '11px', opacity: '0.9', fontWeight: '600' }}>Glucides</div>
                </div>
              </div>
              <div className="macro-value">{Math.round(dailyNutrition.carbs)} / {carbsGoal}g</div>
            </div>
            <div className="macro-item">
              <div className="macro-circle" style={{ background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)' }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800' }}>{Math.round(dailyNutrition.fats)}g</div>
                  <div style={{ fontSize: '11px', opacity: '0.9', fontWeight: '600' }}>Lipides</div>
                </div>
              </div>
              <div className="macro-value">{Math.round(dailyNutrition.fats)} / {fatsGoal}g</div>
            </div>
          </div>
        </div>

        {/* Sections de repas */}
        <MealSection title="Petit-déjeuner" emoji="🌅" mealType="breakfast" />
        <MealSection title="Déjeuner" emoji="☀️" mealType="lunch" />
        <MealSection title="Dîner" emoji="🌙" mealType="dinner" />
        <MealSection title="Collations" emoji="🍎" mealType="snack" />
      </div>

      <AddFoodModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddFood={handleAddFood}
      />

      <EditMacrosModal
        isOpen={isMacrosModalOpen}
        onClose={() => setIsMacrosModalOpen(false)}
        currentGoals={{
          calorieGoal,
          proteinGoal,
          carbsGoal,
          fatsGoal
        }}
        onSave={handleUpdateMacros}
      />
    </div>
  )
}

export default Nutrition
