import { useState, useEffect } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import AddFoodModal from '../components/AddFoodModal'
import { getMealsByDate, createMeal, addFoodToMeal, removeFoodFromMeal, calculateDailyNutrition } from '../services/mealService'

function Nutrition() {
  const [meals, setMeals] = useState([])
  const [dailyNutrition, setDailyNutrition] = useState({
    calories: 0,
    proteins: 0,
    carbs: 0,
    fats: 0
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMealType, setSelectedMealType] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deletingItem, setDeletingItem] = useState(null)

  const userId = 'user-demo' // À remplacer par l'ID réel de l'utilisateur connecté
  const today = new Date().toISOString().split('T')[0]

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
    } catch (error) {
      console.error('Erreur chargement repas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddFood = async (food) => {
    try {
      // Trouver ou créer le repas
      let meal = meals.find(m => m.meal_type === selectedMealType)
      
      if (!meal) {
        meal = await createMeal(userId, selectedMealType, today)
      }

      // Ajouter l'aliment au repas
      await addFoodToMeal(meal.id, food.id, food.serving_size)
      
      // Recharger les repas
      await loadMeals()
    } catch (error) {
      console.error('Erreur ajout aliment:', error)
    }
  }

  const handleDeleteFood = async (mealFoodId) => {
    try {
      setDeletingItem(mealFoodId)
      await removeFoodFromMeal(mealFoodId)
      await loadMeals()
    } catch (error) {
      console.error('Erreur suppression aliment:', error)
    } finally {
      setDeletingItem(null)
    }
  }

  const openModalForMeal = (mealType) => {
    setSelectedMealType(mealType)
    setIsModalOpen(true)
  }

  const getMealsByType = (type) => {
    return meals.filter(m => m.meal_type === type)
  }

  const calculateProgress = () => {
    const goal = 2200
    return Math.min((dailyNutrition.calories / goal) * 100, 100)
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
            <span className="unit">/ 2,200 kcal</span>
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
              {dailyNutrition.calories < 2200 
                ? `Plus que ${Math.round(2200 - dailyNutrition.calories)} kcal pour atteindre votre objectif 🎯`
                : `Objectif atteint ! 🎉`
              }
            </div>
          </div>
        </div>

        {/* Macros */}
        <div className="section">
          <h2 className="section-title">Macronutriments</h2>
          <div className="macros-grid">
            <div className="macro-item">
              <div className="macro-circle" style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)' }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800' }}>{Math.round(dailyNutrition.proteins)}g</div>
                  <div style={{ fontSize: '11px', opacity: '0.9', fontWeight: '600' }}>Protéines</div>
                </div>
              </div>
              <div className="macro-value">{Math.round(dailyNutrition.proteins)} / 150g</div>
            </div>
            <div className="macro-item">
              <div className="macro-circle" style={{ background: 'linear-gradient(135deg, #4ECDC4 0%, #44A9A3 100%)' }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800' }}>{Math.round(dailyNutrition.carbs)}g</div>
                  <div style={{ fontSize: '11px', opacity: '0.9', fontWeight: '600' }}>Glucides</div>
                </div>
              </div>
              <div className="macro-value">{Math.round(dailyNutrition.carbs)} / 250g</div>
            </div>
            <div className="macro-item">
              <div className="macro-circle" style={{ background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)' }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800' }}>{Math.round(dailyNutrition.fats)}g</div>
                  <div style={{ fontSize: '11px', opacity: '0.9', fontWeight: '600' }}>Lipides</div>
                </div>
              </div>
              <div className="macro-value">{Math.round(dailyNutrition.fats)} / 70g</div>
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
    </div>
  )
}

export default Nutrition
