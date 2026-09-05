import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, ChefHat, CookingPot, Trash } from '@phosphor-icons/react'
import { useAuth } from '../context/AuthContext'
import { getRecipes, deleteRecipe, calculateRecipeNutrition, addRecipeToMeal } from '../services/recipeService'
import { createMeal } from '../services/mealService'
import { useNutrition } from '../context/NutritionContext'
import CreateRecipeModal from '../components/CreateRecipeModal'
import RecipeDetailModal from '../components/RecipeDetailModal'

function Recipes() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { refreshNutrition } = useNutrition()

    const [recipes, setRecipes] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedRecipe, setSelectedRecipe] = useState(null)
    const [showCreate, setShowCreate] = useState(false)
    const [showDetail, setShowDetail] = useState(false)
    const [showEdit, setShowEdit] = useState(false)
    const [recipeToEdit, setRecipeToEdit] = useState(null)
    const [deletingId, setDeletingId] = useState(null)

    const today = new Date().toISOString().split('T')[0]

    useEffect(() => {
        const main = document.querySelector('main')
        if (main) main.scrollTo({ top: 0, behavior: 'instant' })
        loadRecipes()
    }, [])

    const loadRecipes = async () => {
        if (!user) return
        setLoading(true)
        try {
            const data = await getRecipes(user.id)
            setRecipes(data)
        } catch (err) {
            console.error('Erreur chargement recettes:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (recipeId) => {
        if (!window.confirm('Supprimer cette recette ?')) return
        setDeletingId(recipeId)
        try {
            await deleteRecipe(recipeId)
            setRecipes(prev => prev.filter(r => r.id !== recipeId))
            setShowDetail(false)
            setSelectedRecipe(null)
        } catch (err) {
            console.error('Erreur suppression:', err)
        } finally {
            setDeletingId(null)
        }
    }

    const handleAddToMeal = async (recipe, servings, mealType) => {
        // Trouver ou créer le repas du jour
        const { createMeal: cm } = await import('../services/mealService')
        // On utilise directement createMeal
        const meal = await createMeal(user.id, mealType, today)
        await addRecipeToMeal(meal.id, recipe, servings)
        await refreshNutrition()
    }

    const handleOpenDetail = (recipe) => {
        setSelectedRecipe(recipe)
        setShowDetail(true)
    }

    const handleEdit = (recipe) => {
        setRecipeToEdit(recipe)
        setShowDetail(false)
        setShowEdit(true)
    }

    const handleEditSaved = () => {
        setShowEdit(false)
        setRecipeToEdit(null)
        loadRecipes()
    }

    if (loading) {
        return (
            <div className="page">
                <div style={{
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    padding: '80px', flexDirection: 'column', gap: '16px'
                }}>
                    <div style={{
                        width: '44px', height: '44px', border: '3px solid rgba(255,255,255,0.08)',
                        borderTopColor: 'var(--accent)', borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                    }} />
                    <div style={{
                        color: 'var(--text-tertiary)', fontWeight: '700', fontSize: '12px',
                        letterSpacing: '1px', textTransform: 'uppercase'
                    }}>Chargement...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="page">
            <div className="page-header">
                <button
                    onClick={() => navigate('/nutrition')}
                    style={{
                        background: 'none', border: 'none', color: 'var(--text-primary)',
                        cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center',
                        gap: '8px', fontSize: '16px', fontWeight: '600', marginBottom: '16px'
                    }}
                >
                    <ArrowLeft weight="bold" size={20} />
                    Nutrition
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1>Mes Recettes</h1>
                        <p className="subtitle">{recipes.length} recette{recipes.length !== 1 ? 's' : ''} enregistrée{recipes.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="cta cta-primary cta-compact"
                        >
                            <Plus weight="bold" size={18} />
                            Nouvelle
                        </button>
                    </div>
                </div>
            </div>

            <div className="page-content">
                {recipes.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '56px 20px',
                        border: '1px dashed var(--border-strong)', borderRadius: 'var(--r-lg)'
                    }}>
                        <div style={{
                            width: '72px', height: '72px', borderRadius: '50%',
                            background: 'var(--accent-ghost)',
                            border: '1px solid var(--accent-line)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 20px'
                        }}>
                            <ChefHat size={34} style={{ color: 'var(--accent)' }} />
                        </div>
                        <h3 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '8px' }}>Aucune recette</h3>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', marginBottom: '24px' }}>
                            Créez vos premières recettes en combinant vos aliments favoris
                        </p>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="cta cta-primary cta-compact"
                            style={{ margin: '0 auto', padding: '13px 26px', fontSize: '14px' }}
                        >
                            Créer ma première recette
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {recipes.map(recipe => {
                            const nutrition = calculateRecipeNutrition(recipe, 1)
                            return (
                                <div
                                    key={recipe.id}
                                    onClick={() => handleOpenDetail(recipe)}
                                    className="recipe-card"
                                    style={{ opacity: deletingId === recipe.id ? 0.5 : 1 }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                                <CookingPot size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                                                <h3 className="recipe-name">{recipe.name}</h3>
                                            </div>
                                            {recipe.description && (
                                                <p className="recipe-desc">
                                                    {recipe.description}
                                                </p>
                                            )}
                                            <div className="macro-badges" style={{ marginTop: 0 }}>
                                                <span className="macro-badge badge-kcal">
                                                    {Math.round(nutrition.calories)} kcal
                                                </span>
                                                <span className="macro-badge badge-pro">
                                                    P {Math.round(nutrition.proteins)}g
                                                </span>
                                                <span className="macro-badge badge-car">
                                                    G {Math.round(nutrition.carbs)}g
                                                </span>
                                                <span className="macro-badge badge-fat">
                                                    L {Math.round(nutrition.fats)}g
                                                </span>
                                            </div>
                                        </div>
                                        <div className="recipe-meta">
                                            <div>
                                                {recipe.recipe_ingredients?.length || 0} ingr.
                                            </div>
                                            <div style={{ marginTop: '4px' }}>
                                                {recipe.servings} portion{recipe.servings > 1 ? 's' : ''}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            <CreateRecipeModal
                isOpen={showCreate}
                onClose={() => setShowCreate(false)}
                onCreated={loadRecipes}
            />

            <CreateRecipeModal
                isOpen={showEdit}
                recipe={recipeToEdit}
                onClose={() => { setShowEdit(false); setRecipeToEdit(null) }}
                onCreated={handleEditSaved}
            />

            <RecipeDetailModal
                recipe={selectedRecipe}
                isOpen={showDetail}
                onClose={() => { setShowDetail(false); setSelectedRecipe(null) }}
                onDelete={handleDelete}
                onAddToMeal={handleAddToMeal}
                onEdit={handleEdit}
            />
        </div>
    )
}

export default Recipes
