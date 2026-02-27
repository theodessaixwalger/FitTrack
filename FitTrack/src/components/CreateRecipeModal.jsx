import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Plus, Search, Trash2, ChefHat, Pencil } from 'lucide-react'
import { searchFoods } from '../services/foodService'
import { createRecipe, updateRecipe, clearRecipeIngredients, addIngredientToRecipe, calculateRecipeNutrition } from '../services/recipeService'
import { useAuth } from '../context/AuthContext'

function CreateRecipeModal({ isOpen, onClose, onCreated, recipe = null }) {
    const { user } = useAuth()
    const isEditMode = !!recipe
    const [step, setStep] = useState(1) // 1 = infos, 2 = ingrédients
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [servings, setServings] = useState(1)
    const [ingredients, setIngredients] = useState([]) // { food, quantity }
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [searching, setSearching] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!isOpen) {
            setStep(1); setName(''); setDescription(''); setServings(1)
            setIngredients([]); setSearchQuery(''); setSearchResults([]); setError('')
        } else if (isOpen && recipe) {
            // Pré-remplir avec les données existantes
            setName(recipe.name || '')
            setDescription(recipe.description || '')
            setServings(recipe.servings || 1)
            setIngredients((recipe.recipe_ingredients || []).map(ing => ({
                food: ing.foods,
                quantity: ing.quantity
            })))
        }
    }, [isOpen])

    useEffect(() => {
        if (searchQuery.length >= 2) {
            const timeout = setTimeout(async () => {
                setSearching(true)
                try {
                    const results = await searchFoods(searchQuery)
                    // Exclure les aliments déjà ajoutés
                    const existing = ingredients.map(i => i.food.id)
                    setSearchResults(results.filter(f => !existing.includes(f.id)))
                } catch {
                    setSearchResults([])
                } finally {
                    setSearching(false)
                }
            }, 300)
            return () => clearTimeout(timeout)
        } else {
            setSearchResults([])
        }
    }, [searchQuery, ingredients])

    const handleAddIngredient = (food) => {
        setIngredients(prev => [...prev, { food, quantity: food.serving_size }])
        setSearchQuery('')
        setSearchResults([])
    }

    const handleRemoveIngredient = (foodId) => {
        setIngredients(prev => prev.filter(i => i.food.id !== foodId))
    }

    const handleQuantityChange = (foodId, value) => {
        setIngredients(prev => prev.map(i =>
            i.food.id === foodId ? { ...i, quantity: value === '' ? '' : parseFloat(value) } : i
        ))
    }

    const previewNutrition = () => {
        const fakeRecipe = {
            servings,
            recipe_ingredients: ingredients.map(i => ({
                foods: i.food,
                quantity: i.quantity
            }))
        }
        return calculateRecipeNutrition(fakeRecipe, 1)
    }

    const handleSave = async () => {
        setError('')
        if (!name.trim()) { setError('Donnez un nom à votre recette'); return }
        if (ingredients.length === 0) { setError('Ajoutez au moins un ingrédient'); return }

        setSaving(true)
        try {
            if (isEditMode) {
                await updateRecipe(recipe.id, { name: name.trim(), description, servings })
                await clearRecipeIngredients(recipe.id)
                for (const ing of ingredients) {
                    await addIngredientToRecipe(recipe.id, ing.food.id, ing.quantity)
                }
            } else {
                const newRecipe = await createRecipe(user.id, { name: name.trim(), description, servings })
                for (const ing of ingredients) {
                    await addIngredientToRecipe(newRecipe.id, ing.food.id, ing.quantity)
                }
            }
            onCreated()
            onClose()
        } catch (err) {
            setError((isEditMode ? 'Erreur lors de la modification : ' : 'Erreur lors de la création : ') + err.message)
        } finally {
            setSaving(false)
        }
    }

    if (!isOpen) return null

    const nutrition = previewNutrition()

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
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    flexShrink: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '12px',
                            background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <ChefHat size={20} style={{ color: 'white' }} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{isEditMode ? 'Modifier la recette' : 'Nouvelle recette'}</h2>
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                                Étape {step} / 2
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'var(--bg-secondary)', border: 'none', borderRadius: '50%',
                        width: '36px', height: '36px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', cursor: 'pointer'
                    }}>
                        <X size={18} />
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                    {step === 1 ? (
                        /* Étape 1 : Informations */
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                    Nom de la recette *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ex: Poulet grillé aux légumes"
                                    style={{
                                        width: '100%', padding: '14px', fontSize: '15px',
                                        border: '2px solid var(--border-light)', borderRadius: '12px',
                                        outline: 'none', fontFamily: 'inherit',
                                        boxSizing: 'border-box'
                                    }}
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                    Description (optionnel)
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Notes, instructions..."
                                    rows={3}
                                    style={{
                                        width: '100%', padding: '14px', fontSize: '15px',
                                        border: '2px solid var(--border-light)', borderRadius: '12px',
                                        outline: 'none', fontFamily: 'inherit', resize: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                    Nombre de portions
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <button onClick={() => setServings(Math.max(1, servings - 1))} style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        border: '2px solid var(--border-light)', background: 'white',
                                        fontSize: '20px', cursor: 'pointer', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center'
                                    }}>−</button>
                                    <span style={{ fontSize: '24px', fontWeight: '800', minWidth: '40px', textAlign: 'center' }}>{servings}</span>
                                    <button onClick={() => setServings(servings + 1)} style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        border: '2px solid var(--primary)', background: 'var(--primary)',
                                        fontSize: '20px', color: 'white', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>+</button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Étape 2 : Ingrédients */
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Recherche */}
                            <div style={{ position: 'relative' }}>
                                <Search size={16} style={{
                                    position: 'absolute', left: '14px', top: '50%',
                                    transform: 'translateY(-50%)', color: 'var(--text-secondary)'
                                }} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Rechercher un aliment..."
                                    style={{
                                        width: '100%', padding: '12px 12px 12px 42px',
                                        border: '2px solid var(--border-light)', borderRadius: '12px',
                                        fontSize: '14px', outline: 'none', fontFamily: 'inherit',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            {/* Résultats de recherche */}
                            {searchResults.length > 0 && (
                                <div style={{
                                    border: '2px solid var(--border-light)', borderRadius: '12px',
                                    overflow: 'hidden', maxHeight: '200px', overflowY: 'auto'
                                }}>
                                    {searchResults.map(food => (
                                        <button key={food.id} onClick={() => handleAddIngredient(food)} style={{
                                            width: '100%', padding: '12px 16px', background: 'white',
                                            border: 'none', borderBottom: '1px solid var(--border-light)',
                                            textAlign: 'left', cursor: 'pointer', display: 'flex',
                                            justifyContent: 'space-between', alignItems: 'center',
                                            transition: 'background 0.15s'
                                        }}
                                            onMouseOver={e => e.currentTarget.style.background = '#f8f8f8'}
                                            onMouseOut={e => e.currentTarget.style.background = 'white'}
                                        >
                                            <div>
                                                <div style={{ fontWeight: '700', fontSize: '14px' }}>{food.name}</div>
                                                {food.brand && <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{food.brand}</div>}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                                                <span>{food.calories} kcal/{food.serving_size}{food.serving_unit}</span>
                                                <Plus size={16} style={{ color: 'var(--primary)' }} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {searching && (
                                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>Recherche...</div>
                            )}

                            {/* Liste des ingrédients ajoutés */}
                            {ingredients.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', margin: 0 }}>
                                        Ingrédients ({ingredients.length})
                                    </h4>
                                    {ingredients.map(({ food, quantity }) => (
                                        <div key={food.id} style={{
                                            display: 'flex', alignItems: 'center', gap: '12px',
                                            padding: '12px', background: '#f8f8f8', borderRadius: '12px'
                                        }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: '700', fontSize: '14px' }}>{food.name}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                    {Math.round(food.calories * (parseFloat(quantity) || 0) / food.serving_size)} kcal
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <input
                                                    type="number"
                                                    value={quantity}
                                                    min="1"
                                                    onChange={(e) => handleQuantityChange(food.id, e.target.value)}
                                                    style={{
                                                        width: '70px', padding: '6px 8px', borderRadius: '8px',
                                                        border: '2px solid var(--border-light)', fontSize: '14px',
                                                        fontWeight: '700', textAlign: 'center', outline: 'none',
                                                        fontFamily: 'inherit'
                                                    }}
                                                />
                                                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', minWidth: '20px' }}>{food.serving_unit}</span>
                                                <button onClick={() => handleRemoveIngredient(food.id)} style={{
                                                    background: 'none', border: 'none', color: '#EF4444',
                                                    cursor: 'pointer', padding: '4px', borderRadius: '6px',
                                                    display: 'flex', alignItems: 'center'
                                                }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Aperçu macros */}
                                    <div style={{
                                        padding: '16px', background: 'linear-gradient(135deg, rgba(255,107,53,0.08), rgba(247,147,30,0.08))',
                                        borderRadius: '12px', border: '2px solid rgba(255,107,53,0.15)'
                                    }}>
                                        <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)', marginBottom: '10px' }}>
                                            APERÇU MACROS (1 PORTION)
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
                                            {[
                                                { label: 'Calories', value: Math.round(nutrition.calories), unit: 'kcal' },
                                                { label: 'Protéines', value: Math.round(nutrition.proteins), unit: 'g' },
                                                { label: 'Glucides', value: Math.round(nutrition.carbs), unit: 'g' },
                                                { label: 'Lipides', value: Math.round(nutrition.fats), unit: 'g' },
                                            ].map(m => (
                                                <div key={m.label}>
                                                    <div style={{ fontSize: '16px', fontWeight: '800' }}>{m.value}<span style={{ fontSize: '11px', fontWeight: '600' }}>{m.unit}</span></div>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>{m.label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {ingredients.length === 0 && !searchQuery && (
                                <div style={{
                                    textAlign: 'center', padding: '32px',
                                    color: 'var(--text-secondary)', fontSize: '14px',
                                    fontWeight: '600', border: '2px dashed var(--border-light)',
                                    borderRadius: '12px'
                                }}>
                                    Recherchez et ajoutez des aliments
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 20px', borderTop: '1px solid var(--border-light)',
                    flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '10px'
                }}>
                    {error && (
                        <div style={{
                            padding: '10px 14px', background: '#fee', borderRadius: '10px',
                            fontSize: '13px', color: '#EF4444', fontWeight: '600'
                        }}>{error}</div>
                    )}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {step === 2 && (
                            <button onClick={() => setStep(1)} style={{
                                flex: 1, padding: '14px', background: 'white',
                                border: '2px solid var(--border-light)', borderRadius: '12px',
                                fontSize: '15px', fontWeight: '700', cursor: 'pointer'
                            }}>
                                ← Retour
                            </button>
                        )}
                        <button
                            onClick={step === 1 ? () => { if (!name.trim()) { setError('Donnez un nom à votre recette'); return }; setError(''); setStep(2) } : handleSave}
                            disabled={saving}
                            style={{
                                flex: 2, padding: '14px',
                                background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
                                border: 'none', borderRadius: '12px', color: 'white',
                                fontSize: '15px', fontWeight: '800', cursor: saving ? 'not-allowed' : 'pointer',
                                opacity: saving ? 0.7 : 1
                            }}
                        >
                            {step === 1 ? 'Suivant → Ingrédients' : saving ? 'Enregistrement...' : isEditMode ? '✓ Enregistrer les modifications' : '✓ Créer la recette'}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}

export default CreateRecipeModal
