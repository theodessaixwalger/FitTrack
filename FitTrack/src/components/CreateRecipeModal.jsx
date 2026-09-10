import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Plus, Minus, MagnifyingGlass, Trash, ChefHat, PencilSimple, ArrowLeft, ArrowRight, Check } from '@phosphor-icons/react'
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
        <div className="sheet-overlay">
            <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="recipe-form-title">
                {/* Header */}
                <div className="sheet-header" style={{ alignItems: 'center' }}>
                    <div className="sheet-title-group">
                        <div className="sheet-icon">
                            {isEditMode ? <PencilSimple size={20} /> : <ChefHat size={22} />}
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <h2 id="recipe-form-title" className="sheet-title">{isEditMode ? 'Modifier la recette' : 'Nouvelle recette'}</h2>
                            <p className="sheet-subtitle">
                                Étape {step} / 2 · {step === 1 ? 'Informations' : 'Ingrédients'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="icon-btn icon-btn-ghost" aria-label="Fermer">
                        <X weight="bold" size={16} />
                    </button>
                </div>

                <div className="sheet-body" style={{ gap: '16px' }}>
                    {step === 1 ? (
                        /* Étape 1 : Informations */
                        <>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label htmlFor="recipe-name">Nom de la recette *</label>
                                <input
                                    id="recipe-name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ex: Poulet grillé aux légumes"
                                    autoFocus
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label htmlFor="recipe-description">Description (optionnel)</label>
                                <textarea
                                    id="recipe-description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Notes, instructions..."
                                    rows={3}
                                    style={{ resize: 'none' }}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Nombre de portions</label>
                                <div className="stepper stepper-lg">
                                    <button
                                        onClick={() => setServings(Math.max(1, servings - 1))}
                                        disabled={servings <= 1}
                                        className="stepper-btn"
                                        aria-label="Retirer une portion"
                                    >
                                        <Minus weight="bold" size={16} />
                                    </button>
                                    <span className="stepper-value">{servings}</span>
                                    <button
                                        onClick={() => setServings(servings + 1)}
                                        className="stepper-btn is-accent"
                                        aria-label="Ajouter une portion"
                                    >
                                        <Plus weight="bold" size={16} />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Étape 2 : Ingrédients */
                        <>
                            {/* Recherche */}
                            <div style={{ position: 'relative' }}>
                                <MagnifyingGlass size={18} style={{
                                    position: 'absolute', left: '14px', top: '50%',
                                    transform: 'translateY(-50%)', color: 'var(--text-tertiary)'
                                }} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Rechercher un aliment..."
                                    className="search-field"
                                    style={{ padding: '12px 14px 12px 44px' }}
                                />
                            </div>

                            {/* Résultats de recherche */}
                            {searchResults.length > 0 && (
                                <div className="food-results">
                                    {searchResults.map(food => (
                                        <button key={food.id} onClick={() => handleAddIngredient(food)} className="food-result">
                                            <div style={{ minWidth: 0 }}>
                                                <div className="ingredient-name">{food.name}</div>
                                                {food.brand && <div className="ingredient-sub">{food.brand}</div>}
                                            </div>
                                            <div className="food-result-side">
                                                <span>{food.calories} kcal/{food.serving_size}{food.serving_unit}</span>
                                                <Plus weight="bold" size={16} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {searching && (
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center', color: 'var(--text-tertiary)', fontSize: '13px', fontWeight: '600' }}>
                                    <div className="spinner" style={{ width: '16px', height: '16px' }} />
                                    Recherche...
                                </div>
                            )}

                            {/* Liste des ingrédients ajoutés */}
                            {ingredients.length > 0 && (
                                <div>
                                    <h4 className="sheet-section-title">
                                        Ingrédients
                                        <span className="chip-more">{ingredients.length}</span>
                                    </h4>
                                    <div className="ingredient-list">
                                        {ingredients.map(({ food, quantity }) => (
                                            <div key={food.id} className="ingredient-row">
                                                <div className="ingredient-info">
                                                    <div className="ingredient-name">{food.name}</div>
                                                    <div className="ingredient-kcal">
                                                        {Math.round(food.calories * (parseFloat(quantity) || 0) / food.serving_size)}
                                                        <span>kcal</span>
                                                    </div>
                                                </div>
                                                <div className="ingredient-edit">
                                                    <input
                                                        type="number"
                                                        value={quantity}
                                                        min="1"
                                                        onChange={(e) => handleQuantityChange(food.id, e.target.value)}
                                                        className="qty-input"
                                                        aria-label={`Quantité de ${food.name}`}
                                                    />
                                                    <span className="qty-unit">{food.serving_unit}</span>
                                                    <button
                                                        onClick={() => handleRemoveIngredient(food.id)}
                                                        className="btn-remove"
                                                        aria-label={`Retirer ${food.name}`}
                                                    >
                                                        <Trash size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Aperçu macros */}
                            {ingredients.length > 0 && (
                                <div className="recipe-macros">
                                    <div className="tile-label" style={{ marginBottom: '10px' }}>Aperçu · 1 portion</div>
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
                            )}

                            {ingredients.length === 0 && !searchQuery && (
                                <div className="sheet-empty">
                                    Recherchez et ajoutez des aliments
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="sheet-footer">
                    {error && <div className="form-error">{error}</div>}
                    <div className="sheet-footer-row">
                        {step === 2 && (
                            <button onClick={() => setStep(1)} className="btn btn-secondary" style={{ flex: 1 }}>
                                <ArrowLeft weight="bold" size={16} />
                                Retour
                            </button>
                        )}
                        <button
                            onClick={step === 1 ? () => { if (!name.trim()) { setError('Donnez un nom à votre recette'); return }; setError(''); setStep(2) } : handleSave}
                            disabled={saving}
                            className="btn btn-primary"
                            style={{ flex: 2 }}
                        >
                            {step === 1 ? (
                                <>Suivant : ingrédients <ArrowRight weight="bold" size={16} /></>
                            ) : saving ? (
                                <><div className="loading-spinner" /> Enregistrement...</>
                            ) : (
                                <><Check weight="bold" size={16} /> {isEditMode ? 'Enregistrer' : 'Créer la recette'}</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}

export default CreateRecipeModal
