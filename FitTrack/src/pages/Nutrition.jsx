import { useState } from 'react'
import { Plus, Trash, Gear, ChefHat, CookingPot, SunHorizon, Sun, MoonStars, Cookie } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import AddFoodModal from '../components/AddFoodModal'
import EditMacrosModal from '../components/EditMacrosModal'
import { createMeal, addFoodToMeal, removeFoodFromMeal, addRecipeEntryToMeal, removeRecipeFromMeal } from '../services/mealService'
import { calculateRecipeNutrition } from '../services/recipeService'
import { useNutrition } from '../context/NutritionContext'
import { useAuth } from '../context/AuthContext'

function Nutrition() {
  const navigate = useNavigate()
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

  const handleAddRecipe = async (recipe) => {
    try {
      let meal = meals.find(m => m.meal_type === selectedMealType)
      if (!meal) {
        meal = await createMeal(user.id, selectedMealType, today)
      }
      await addRecipeEntryToMeal(meal.id, recipe.id, 1)
      await refreshNutrition()
    } catch (error) {
      console.error('Erreur ajout recette:', error)
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

  const handleDeleteRecipe = async (mealRecipeId) => {
    try {
      setDeletingItem(mealRecipeId)
      await removeRecipeFromMeal(mealRecipeId)
      await refreshNutrition()
    } catch (error) {
      console.error('Erreur suppression recette:', error)
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

  // Helper d'affichage : pourcentage borné pour les anneaux de progression
  const ringPct = (value, goal) =>
    goal > 0 ? Math.min((value / goal) * 100, 100) : 0

  const MealSection = ({ title, emoji, mealType }) => {
    const mealData = getMealsByType(mealType)
    const hasMeals = mealData.length > 0 && mealData.some(m =>
      m.meal_foods.length > 0 || (m.meal_recipes && m.meal_recipes.length > 0)
    )

    return (
      <div className="section span-6">
        <div className="section-header">
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span style={{ color: 'var(--accent)', display: 'flex' }}>{emoji}</span>
            {title}
          </h2>
          <button
            onClick={() => openModalForMeal(mealType)}
            className="icon-btn icon-btn-accent"
          >
            <Plus weight="bold" size={19} />
          </button>
        </div>

        {hasMeals ? (
          <div className="card">
            <div className="card-body" style={{ padding: '10px' }}>
              {mealData.map((meal) => (
                <>
                  {/* Aliments individuels */}
                  {meal.meal_foods.map((mealFood) => (
                    <div
                      key={`food-${mealFood.id}`}
                      className="meal-row"
                      style={{ opacity: deletingItem === mealFood.id ? 0.5 : 1 }}
                    >
                      <div className="meal-row-main">
                        <div className="meal-row-head">
                          <h3 className="meal-row-name">{mealFood.foods.name}</h3>
                          <div className="meal-row-kcal">
                            {Math.round((mealFood.foods.calories * mealFood.quantity) / mealFood.foods.serving_size)}
                            <span>kcal</span>
                          </div>
                        </div>

                        <div className="meal-row-meta">
                          <span>{mealFood.quantity}{mealFood.foods.serving_unit}</span>
                          {mealFood.foods.brand && (
                            <>
                              <span style={{ opacity: 0.5 }}>•</span>
                              <span className="truncate">{mealFood.foods.brand}</span>
                            </>
                          )}
                        </div>

                        <div className="macro-badges">
                          <span className="macro-badge badge-pro">
                            P {Math.round((mealFood.foods.proteins * mealFood.quantity) / mealFood.foods.serving_size)}g
                          </span>
                          <span className="macro-badge badge-car">
                            G {Math.round((mealFood.foods.carbs * mealFood.quantity) / mealFood.foods.serving_size)}g
                          </span>
                          <span className="macro-badge badge-fat">
                            L {Math.round((mealFood.foods.fats * mealFood.quantity) / mealFood.foods.serving_size)}g
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteFood(mealFood.id)}
                        disabled={deletingItem === mealFood.id}
                        className="btn-remove"
                        style={{ opacity: deletingItem === mealFood.id ? 0.5 : 1 }}
                      >
                        {deletingItem === mealFood.id ? (
                          <div style={{ width: '20px', height: '20px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                        ) : (
                          <Trash size={18} />
                        )}
                      </button>
                    </div>
                  ))}

                  {/* Recettes */}
                  {(meal.meal_recipes || []).map((mealRecipe) => {
                    const recipe = mealRecipe.recipes
                    const nutrition = calculateRecipeNutrition(recipe, mealRecipe.servings)
                    return (
                      <div
                        key={`recipe-${mealRecipe.id}`}
                        className="meal-row meal-row-recipe"
                        style={{ opacity: deletingItem === mealRecipe.id ? 0.5 : 1 }}
                      >
                        <div className="meal-row-main">
                          <div className="meal-row-head">
                            <h3 className="meal-row-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <CookingPot size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                              <span className="truncate">{recipe.name}</span>
                            </h3>
                            <div className="meal-row-kcal">
                              {Math.round(nutrition.calories)}
                              <span>kcal</span>
                            </div>
                          </div>

                          <div className="meal-row-meta">
                            <span>{mealRecipe.servings} portion{mealRecipe.servings > 1 ? 's' : ''}</span>
                            {(() => {
                              // Affichage : 2 premiers ingredients + compte du reste.
                              // Repli sur la description si la recette n'en liste aucun.
                              const ingredients = recipe.recipe_ingredients || []
                              const shown = ingredients.slice(0, 2).map(i => i.foods?.name).filter(Boolean)
                              const rest = ingredients.length - shown.length

                              if (shown.length === 0) {
                                return recipe.description ? (
                                  <>
                                    <span style={{ opacity: 0.4 }}>•</span>
                                    <span className="truncate">{recipe.description}</span>
                                  </>
                                ) : null
                              }

                              return (
                                <>
                                  <span style={{ opacity: 0.4 }}>•</span>
                                  <span className="truncate">{shown.join(' • ')}</span>
                                  {rest > 0 && <span className="chip-more">+{rest}</span>}
                                </>
                              )
                            })()}
                          </div>

                          <div className="macro-badges">
                            <span className="macro-badge badge-pro">P {Math.round(nutrition.proteins)}g</span>
                            <span className="macro-badge badge-car">G {Math.round(nutrition.carbs)}g</span>
                            <span className="macro-badge badge-fat">L {Math.round(nutrition.fats)}g</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteRecipe(mealRecipe.id)}
                          disabled={deletingItem === mealRecipe.id}
                          className="btn-remove"
                          style={{ opacity: deletingItem === mealRecipe.id ? 0.5 : 1 }}
                        >
                          {deletingItem === mealRecipe.id ? (
                            <div style={{ width: '20px', height: '20px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                          ) : (
                            <Trash size={18} />
                          )}
                        </button>
                      </div>
                    )
                  })}
                </>
              ))}
            </div>
          </div>
        ) : (
          <div style={{
            padding: '28px',
            textAlign: 'center',
            color: 'var(--text-tertiary)',
            fontSize: '13px',
            fontWeight: '600',
            background: 'var(--surface)',
            borderRadius: 'var(--r-lg)',
            border: '1px dashed var(--border-strong)'
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
            width: '44px',
            height: '44px',
            border: '3px solid rgba(255,255,255,0.08)',
            borderTopColor: 'var(--accent)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <div style={{
            color: 'var(--text-tertiary)',
            fontWeight: '700',
            fontSize: '12px',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            Chargement...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Nutrition</h1>
            <p className="subtitle">Suivez votre alimentation quotidienne</p>
          </div>
          <button
            onClick={() => navigate('/recipes')}
            className="cta cta-ghost cta-compact"
          >
            <ChefHat size={16} />
            Recettes
          </button>
        </div>
      </div>

      <div className="page-content bento">
        {/* Hero Card - Calories du jour */}
        <div className="hero-card glow-card glow-cal span-6">
          <div className="hero-layout">
            <div
              className="ring ring-glow hero-ring"
              style={{ '--ring-pct': calculateProgress() }}
            >
              <div className="ring-content">
                <span className="ring-value">{Math.round(calculateProgress())}</span>
                <span className="ring-unit">%</span>
              </div>
            </div>

            <div className="hero-meta">
              <div className="label">Calories aujourd'hui</div>
              <div className="value">{Math.round(dailyNutrition.calories)}</div>
              <div className="unit">/ {calorieGoal.toLocaleString()} kcal</div>
            </div>
          </div>

          <div className={`hero-note ${getRemainingCalories() > 0 ? '' : 'is-done'}`}>
            {getRemainingCalories() > 0
              ? `Plus que ${Math.round(getRemainingCalories())} kcal pour atteindre votre objectif 🎯`
              : `Objectif atteint ! 🎉`
            }
          </div>
        </div>

        {/* Macros avec bouton de modification */}
        <div className="section span-6">
          <div className="section-header">
            <h2 className="section-title">Macronutriments</h2>
            <button
              onClick={() => setIsMacrosModalOpen(true)}
              className="icon-btn icon-btn-ghost"
            >
              <Gear size={18} />
            </button>
          </div>
          <div className="macros-grid">
            <div className="macro-item macro-protein glow-card glow-pro">
              <div
                className="ring macro-circle"
                style={{ '--ring-pct': ringPct(dailyNutrition.proteins, proteinGoal) }}
              >
                <div className="ring-content">
                  <span className="ring-value">{Math.round(dailyNutrition.proteins)}</span>
                  <span className="ring-unit">g</span>
                </div>
              </div>
              <div className="macro-value">{Math.round(dailyNutrition.proteins)} / {proteinGoal}g</div>
              <div className="macro-label">Protéines</div>
            </div>
            <div className="macro-item macro-carbs glow-card glow-car">
              <div
                className="ring macro-circle"
                style={{ '--ring-pct': ringPct(dailyNutrition.carbs, carbsGoal) }}
              >
                <div className="ring-content">
                  <span className="ring-value">{Math.round(dailyNutrition.carbs)}</span>
                  <span className="ring-unit">g</span>
                </div>
              </div>
              <div className="macro-value">{Math.round(dailyNutrition.carbs)} / {carbsGoal}g</div>
              <div className="macro-label">Glucides</div>
            </div>
            <div className="macro-item macro-fats glow-card glow-fat">
              <div
                className="ring macro-circle"
                style={{ '--ring-pct': ringPct(dailyNutrition.fats, fatsGoal) }}
              >
                <div className="ring-content">
                  <span className="ring-value">{Math.round(dailyNutrition.fats)}</span>
                  <span className="ring-unit">g</span>
                </div>
              </div>
              <div className="macro-value">{Math.round(dailyNutrition.fats)} / {fatsGoal}g</div>
              <div className="macro-label">Lipides</div>
            </div>
          </div>
        </div>

        {/* Sections de repas */}
        <MealSection title="Petit-déjeuner" emoji={<SunHorizon size={16} />} mealType="breakfast" />
        <MealSection title="Déjeuner" emoji={<Sun size={16} />} mealType="lunch" />
        <MealSection title="Dîner" emoji={<MoonStars size={16} />} mealType="dinner" />
        <MealSection title="Collations" emoji={<Cookie size={16} />} mealType="snack" />
      </div>

      <AddFoodModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddFood={handleAddFood}
        onAddRecipe={handleAddRecipe}
        userId={user?.id}
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
