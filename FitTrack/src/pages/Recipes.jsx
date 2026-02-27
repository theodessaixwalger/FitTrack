import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, ChefHat, Trash2 } from 'lucide-react'
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
                        width: '48px', height: '48px', border: '4px solid var(--border-light)',
                        borderTopColor: 'var(--primary)', borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                    }} />
                    <div style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Chargement...</div>
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
                    <ArrowLeft size={20} />
                    Nutrition
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1>Mes Recettes</h1>
                        <p className="subtitle">{recipes.length} recette{recipes.length !== 1 ? 's' : ''} enregistrée{recipes.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        style={{
                            background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
                            border: 'none', borderRadius: '14px', color: 'white',
                            padding: '12px 18px', cursor: 'pointer', fontWeight: '700',
                            fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px',
                            boxShadow: '0 4px 14px rgba(255,107,53,0.35)'
                        }}
                    >
                        <Plus size={18} />
                        Nouvelle
                    </button>
                </div>
            </div>

            <div className="page-content">
                {recipes.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '60px 20px',
                        border: '2px dashed var(--border-light)', borderRadius: '20px'
                    }}>
                        <div style={{
                            width: '72px', height: '72px', borderRadius: '20px',
                            background: 'linear-gradient(135deg, rgba(255,107,53,0.1), rgba(247,147,30,0.1))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 20px'
                        }}>
                            <ChefHat size={36} style={{ color: 'var(--primary)' }} />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Aucune recette</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                            Créez vos premières recettes en combinant vos aliments favoris
                        </p>
                        <button
                            onClick={() => setShowCreate(true)}
                            style={{
                                background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
                                border: 'none', borderRadius: '14px', color: 'white',
                                padding: '14px 28px', cursor: 'pointer', fontWeight: '700', fontSize: '15px'
                            }}
                        >
                            Créer ma première recette
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {recipes.map(recipe => {
                            const nutrition = calculateRecipeNutrition(recipe, 1)
                            return (
                                <div
                                    key={recipe.id}
                                    onClick={() => handleOpenDetail(recipe)}
                                    style={{
                                        background: 'var(--surface)', borderRadius: '16px',
                                        padding: '16px 20px', cursor: 'pointer',
                                        border: '2px solid var(--border-light)', transition: 'all 0.2s',
                                        opacity: deletingId === recipe.id ? 0.5 : 1
                                    }}
                                    onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                                    onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.transform = 'translateY(0)' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                                <ChefHat size={16} style={{ color: 'var(--primary)' }} />
                                                <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>{recipe.name}</h3>
                                            </div>
                                            {recipe.description && (
                                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 10px', lineHeight: '1.4' }}>
                                                    {recipe.description}
                                                </p>
                                            )}
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                <span style={{
                                                    fontSize: '12px', fontWeight: '700', padding: '4px 10px',
                                                    background: 'rgba(255,107,53,0.1)', color: 'var(--primary)',
                                                    borderRadius: '20px'
                                                }}>
                                                    {Math.round(nutrition.calories)} kcal
                                                </span>
                                                <span style={{ fontSize: '12px', fontWeight: '600', padding: '4px 10px', background: '#f0f0f0', borderRadius: '20px', color: 'var(--text-secondary)' }}>
                                                    P: {Math.round(nutrition.proteins)}g
                                                </span>
                                                <span style={{ fontSize: '12px', fontWeight: '600', padding: '4px 10px', background: '#f0f0f0', borderRadius: '20px', color: 'var(--text-secondary)' }}>
                                                    G: {Math.round(nutrition.carbs)}g
                                                </span>
                                                <span style={{ fontSize: '12px', fontWeight: '600', padding: '4px 10px', background: '#f0f0f0', borderRadius: '20px', color: 'var(--text-secondary)' }}>
                                                    L: {Math.round(nutrition.fats)}g
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                                                {recipe.recipe_ingredients?.length || 0} ingr.
                                            </div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
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
