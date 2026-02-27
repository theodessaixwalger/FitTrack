import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Trash2, ChefHat, Pencil } from 'lucide-react'
import { calculateRecipeNutrition } from '../services/recipeService'

function RecipeDetailModal({ recipe, isOpen, onClose, onDelete, onAddToMeal, onEdit }) {
    const [servings, setServings] = useState(1)
    const [adding, setAdding] = useState(false)

    if (!isOpen || !recipe) return null

    const nutrition = calculateRecipeNutrition(recipe, servings)

    const handleAddToMeal = async (mealType) => {
        setAdding(true)
        try {
            await onAddToMeal(recipe, servings, mealType)
            onClose()
        } catch (err) {
            console.error('Erreur ajout recette:', err)
        } finally {
            setAdding(false)
        }
    }

    const mealTypes = [
        { type: 'breakfast', label: '🌅 Petit-déjeuner' },
        { type: 'lunch', label: '☀️ Déjeuner' },
        { type: 'dinner', label: '🌙 Dîner' },
        { type: 'snack', label: '🍎 Collation' },
    ]

    return createPortal(
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                background: 'white', borderRadius: '24px 24px 0 0',
                width: '100%', maxWidth: '480px',
                maxHeight: '92vh', display: 'flex', flexDirection: 'column',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px 20px 16px',
                    borderBottom: '1px solid var(--border-light)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    flexShrink: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <div style={{
                            width: '44px', height: '44px', borderRadius: '12px',
                            background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <ChefHat size={22} style={{ color: 'white' }} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{recipe.name}</h2>
                            {recipe.description && (
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>{recipe.description}</p>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0, marginLeft: '12px' }}>
                        <button onClick={() => onEdit(recipe)} style={{
                            background: 'rgba(255,107,53,0.1)', border: 'none', borderRadius: '10px',
                            width: '36px', height: '36px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', cursor: 'pointer', color: 'var(--primary)'
                        }}>
                            <Pencil size={16} />
                        </button>
                        <button onClick={() => onDelete(recipe.id)} style={{
                            background: '#fee', border: 'none', borderRadius: '10px',
                            width: '36px', height: '36px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', cursor: 'pointer', color: '#EF4444'
                        }}>
                            <Trash2 size={16} />
                        </button>
                        <button onClick={onClose} style={{
                            background: 'var(--bg-secondary)', border: 'none', borderRadius: '50%',
                            width: '36px', height: '36px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', cursor: 'pointer'
                        }}>
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {/* Macros pour N portions */}
                    <div style={{ padding: '20px 20px 0' }}>
                        <div style={{
                            padding: '16px',
                            background: 'linear-gradient(135deg, rgba(255,107,53,0.08), rgba(247,147,30,0.08))',
                            borderRadius: '16px', border: '2px solid rgba(255,107,53,0.15)'
                        }}>
                            {/* Sélecteur de portions */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                                    MACROS POUR
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <button onClick={() => setServings(Math.max(1, servings - 1))} style={{
                                        width: '28px', height: '28px', borderRadius: '50%',
                                        border: '2px solid var(--border-light)', background: 'white',
                                        cursor: 'pointer', fontSize: '16px', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center'
                                    }}>−</button>
                                    <span style={{ fontWeight: '800', fontSize: '16px', minWidth: '60px', textAlign: 'center' }}>
                                        {servings} portion{servings > 1 ? 's' : ''}
                                    </span>
                                    <button onClick={() => setServings(servings + 1)} style={{
                                        width: '28px', height: '28px', borderRadius: '50%',
                                        border: '2px solid var(--primary)', background: 'var(--primary)',
                                        color: 'white', cursor: 'pointer', fontSize: '16px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>+</button>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
                                {[
                                    { label: 'Calories', value: Math.round(nutrition.calories), unit: 'kcal' },
                                    { label: 'Protéines', value: Math.round(nutrition.proteins), unit: 'g' },
                                    { label: 'Glucides', value: Math.round(nutrition.carbs), unit: 'g' },
                                    { label: 'Lipides', value: Math.round(nutrition.fats), unit: 'g' },
                                ].map(m => (
                                    <div key={m.label}>
                                        <div style={{ fontSize: '18px', fontWeight: '800' }}>{m.value}<span style={{ fontSize: '11px' }}>{m.unit}</span></div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>{m.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Liste des ingrédients */}
                    <div style={{ padding: '20px' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                            INGRÉDIENTS ({recipe.recipe_ingredients?.length || 0})
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {recipe.recipe_ingredients?.map(ingredient => (
                                <div key={ingredient.id} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '12px', background: '#f8f8f8', borderRadius: '12px'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '14px' }}>{ingredient.foods.name}</div>
                                        {ingredient.foods.brand && (
                                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{ingredient.foods.brand}</div>
                                        )}
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '14px', fontWeight: '700' }}>
                                            {ingredient.quantity}{ingredient.foods.serving_unit}
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                            {Math.round(ingredient.foods.calories * ingredient.quantity / ingredient.foods.serving_size)} kcal
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Ajouter au repas */}
                    <div style={{ padding: '0 20px 20px' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                            AJOUTER AU REPAS
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            {mealTypes.map(({ type, label }) => (
                                <button key={type} onClick={() => handleAddToMeal(type)} disabled={adding} style={{
                                    padding: '14px', background: 'white',
                                    border: '2px solid var(--border-light)', borderRadius: '12px',
                                    fontSize: '14px', fontWeight: '700', cursor: adding ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s', textAlign: 'center',
                                    opacity: adding ? 0.6 : 1
                                }}
                                    onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }}
                                    onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'inherit' }}
                                >
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
