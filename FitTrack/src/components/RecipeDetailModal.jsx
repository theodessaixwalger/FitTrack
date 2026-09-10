import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Trash, CookingPot, PencilSimple, Minus, Plus, SunHorizon, Sun, MoonStars, Cookie } from '@phosphor-icons/react'
import { calculateRecipeNutrition } from '../services/recipeService'

function RecipeDetailModal({ recipe, isOpen, onClose, onDelete, onAddToMeal, onEdit }) {
    const [servings, setServings] = useState(1)
    const [adding, setAdding] = useState(null) // type de repas en cours d'ajout

    if (!isOpen || !recipe) return null

    const nutrition = calculateRecipeNutrition(recipe, servings)
    const ingredients = recipe.recipe_ingredients || []

    const handleAddToMeal = async (mealType) => {
        setAdding(mealType)
        try {
            await onAddToMeal(recipe, servings, mealType)
            onClose()
        } catch (err) {
            console.error('Erreur ajout recette:', err)
        } finally {
            setAdding(null)
        }
    }

    // Memes icones que les sections de la page Nutrition
    const mealTypes = [
        { type: 'breakfast', label: 'Petit-déjeuner', icon: <SunHorizon size={18} /> },
        { type: 'lunch', label: 'Déjeuner', icon: <Sun size={18} /> },
        { type: 'dinner', label: 'Dîner', icon: <MoonStars size={18} /> },
        { type: 'snack', label: 'Collation', icon: <Cookie size={18} /> },
    ]

    return createPortal(
        <div className="sheet-overlay">
            <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="recipe-detail-title">
                {/* Header */}
                <div className="sheet-header">
                    <div className="sheet-title-group">
                        <div className="sheet-icon">
                            <CookingPot size={22} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <h2 id="recipe-detail-title" className="sheet-title">{recipe.name}</h2>
                            {recipe.description && (
                                <p className="sheet-subtitle">{recipe.description}</p>
                            )}
                        </div>
                    </div>
                    <div className="sheet-actions">
                        <button onClick={() => onEdit(recipe)} className="icon-btn icon-btn-ghost is-accent" aria-label="Modifier la recette">
                            <PencilSimple size={16} />
                        </button>
                        <button onClick={() => onDelete(recipe.id)} className="icon-btn icon-btn-ghost is-danger" aria-label="Supprimer la recette">
                            <Trash size={16} />
                        </button>
                        <button onClick={onClose} className="icon-btn icon-btn-ghost" aria-label="Fermer">
                            <X weight="bold" size={16} />
                        </button>
                    </div>
                </div>

                <div className="sheet-body">
                    {/* Macros pour N portions */}
                    <div className="recipe-macros">
                        <div className="recipe-macros-head">
                            <span className="tile-label">Portions</span>
                            <div className="stepper">
                                <button
                                    onClick={() => setServings(Math.max(1, servings - 1))}
                                    disabled={servings <= 1}
                                    className="stepper-btn"
                                    aria-label="Retirer une portion"
                                >
                                    <Minus weight="bold" size={14} />
                                </button>
                                <span className="stepper-value">{servings}</span>
                                <button
                                    onClick={() => setServings(servings + 1)}
                                    className="stepper-btn is-accent"
                                    aria-label="Ajouter une portion"
                                >
                                    <Plus weight="bold" size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="recipe-kcal">
                            {Math.round(nutrition.calories)}
                            <span>kcal</span>
                        </div>

                        <div className="recipe-macro-grid">
                            {[
                                { key: 'pro', label: 'Protéines', value: nutrition.proteins },
                                { key: 'car', label: 'Glucides', value: nutrition.carbs },
                                { key: 'fat', label: 'Lipides', value: nutrition.fats },
                            ].map(m => (
                                <div key={m.key} className={`recipe-macro is-${m.key}`}>
                                    <div className="recipe-macro-value">{Math.round(m.value)}g</div>
                                    <div className="recipe-macro-label">{m.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Liste des ingrédients */}
                    <div>
                        <h4 className="sheet-section-title">
                            Ingrédients
                            <span className="chip-more">{ingredients.length}</span>
                        </h4>
                        <div className="ingredient-list">
                            {ingredients.map(ingredient => (
                                <div key={ingredient.id} className="ingredient-row">
                                    <div className="ingredient-info">
                                        <div className="ingredient-name">{ingredient.foods.name}</div>
                                        {ingredient.foods.brand && (
                                            <div className="ingredient-sub">{ingredient.foods.brand}</div>
                                        )}
                                    </div>
                                    <div className="ingredient-side">
                                        <div className="ingredient-qty">
                                            {ingredient.quantity}{ingredient.foods.serving_unit}
                                        </div>
                                        <div className="ingredient-kcal">
                                            {Math.round(ingredient.foods.calories * ingredient.quantity / ingredient.foods.serving_size)}
                                            <span>kcal</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Ajouter au repas */}
                    <div>
                        <h4 className="sheet-section-title">Ajouter au repas</h4>
                        <div className="meal-pick-grid">
                            {mealTypes.map(({ type, label, icon }) => (
                                <button
                                    key={type}
                                    onClick={() => handleAddToMeal(type)}
                                    disabled={adding !== null}
                                    className="meal-pick"
                                >
                                    {adding === type
                                        ? <div className="spinner" style={{ width: '16px', height: '16px' }} />
                                        : icon}
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}

export default RecipeDetailModal
