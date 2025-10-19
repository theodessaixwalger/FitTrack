import { useState, useEffect } from 'react'
import { Plus, Flame, TrendingUp } from 'lucide-react'
import AddFoodModal from '../components/AddFoodModal'
import { getMealsByDate, createMeal, addFoodToMeal, calculateDailyNutrition } from '../services/mealService'

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

  if (loading) {
    return (
      <div className="page">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Chargement...
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
                background: 'rgba(255,255,255,0.9)' 
              }}></div>
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
            </div>
            <div className="macro-item">
              <div className="macro-circle" style={{ background: 'linear-gradient(135deg, #4ECDC4 0%, #44A9A3 100%)' }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800' }}>{Math.round(dailyNutrition.carbs)}g</div>
                  <div style={{ fontSize: '11px', opacity: '0.9', fontWeight: '600' }}>Glucides</div>
                </div>
              </div>
            </div>
            <div className="macro-item">
              <div className="macro-circle" style={{ background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)' }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800' }}>{Math.round(dailyNutrition.fats)}g</div>
                  <div style={{ fontSize: '11px', opacity: '0.9', fontWeight: '600' }}>Lipides</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Petit-déjeuner */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">🌅 Petit-déjeuner</h2>
            <button 
              onClick={() => openModalForMeal('breakfast')}
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
                boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)'
              }}
            >
              <Plus size={20} />
            </button>
          </div>

          {getMealsByType('breakfast').length > 0 ? (
            <div className="card">
              <div className="card-body" style={{ padding: '0' }}>
                {getMealsByType('breakfast').map((meal) => (
                  meal.meal_foods.map((mealFood) => (
                    <div key={mealFood.id} className="list-item">
                      <div className="list-item-left">
                        <div className="list-item-info">
                          <h3>{mealFood.foods.name}</h3>
                          <p>{mealFood.quantity}{mealFood.foods.serving_unit}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="list-item-value">
                          {Math.round((mealFood.foods.calories * mealFood.quantity) / mealFood.foods.serving_size)} kcal
                        </div>
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
              fontWeight: '600'
            }}>
              Aucun aliment ajouté
            </div>
          )}
        </div>

        {/* Déjeuner */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">☀️ Déjeuner</h2>
            <button 
              onClick={() => openModalForMeal('lunch')}
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
                boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)'
              }}
            >
              <Plus size={20} />
            </button>
          </div>

          {getMealsByType('lunch').length > 0 ? (
            <div className="card">
              <div className="card-body" style={{ padding: '0' }}>
                {getMealsByType('lunch').map((meal) => (
                  meal.meal_foods.map((mealFood) => (
                    <div key={mealFood.id} className="list-item">
                      <div className="list-item-left">
                        <div className="list-item-info">
                          <h3>{mealFood.foods.name}</h3>
                          <p>{mealFood.quantity}{mealFood.foods.serving_unit}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="list-item-value">
                          {Math.round((mealFood.foods.calories * mealFood.quantity) / mealFood.foods.serving_size)} kcal
                        </div>
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
              fontWeight: '600'
            }}>
              Aucun aliment ajouté
            </div>
          )}
        </div>

        {/* Dîner */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">🌙 Dîner</h2>
            <button 
              onClick={() => openModalForMeal('dinner')}
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
                boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)'
              }}
            >
              <Plus size={20} />
            </button>
          </div>

          {getMealsByType('dinner').length > 0 ? (
            <div className="card">
              <div className="card-body" style={{ padding: '0' }}>
                {getMealsByType('dinner').map((meal) => (
                  meal.meal_foods.map((mealFood) => (
                    <div key={mealFood.id} className="list-item">
                      <div className="list-item-left">
                        <div className="list-item-info">
                          <h3>{mealFood.foods.name}</h3>
                          <p>{mealFood.quantity}{mealFood.foods.serving_unit}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="list-item-value">
                          {Math.round((mealFood.foods.calories * mealFood.quantity) / mealFood.foods.serving_size)} kcal
                        </div>
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
              fontWeight: '600'
            }}>
              Aucun aliment ajouté
            </div>
          )}
        </div>

        {/* Snacks */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">🍎 Collations</h2>
            <button 
              onClick={() => openModalForMeal('snack')}
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
                boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)'
              }}
            >
              <Plus size={20} />
            </button>
          </div>

          {getMealsByType('snack').length > 0 ? (
            <div className="card">
              <div className="card-body" style={{ padding: '0' }}>
                {getMealsByType('snack').map((meal) => (
                  meal.meal_foods.map((mealFood) => (
                    <div key={mealFood.id} className="list-item">
                      <div className="list-item-left">
                        <div className="list-item-info">
                          <h3>{mealFood.foods.name}</h3>
                          <p>{mealFood.quantity}{mealFood.foods.serving_unit}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="list-item-value">
                          {Math.round((mealFood.foods.calories * mealFood.quantity) / mealFood.foods.serving_size)} kcal
                        </div>
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
              fontWeight: '600'
            }}>
              Aucune collation ajoutée
            </div>
          )}
        </div>
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
