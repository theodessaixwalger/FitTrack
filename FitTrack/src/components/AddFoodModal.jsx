import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Plus, Search, ChefHat, Utensils } from 'lucide-react'
import { searchFoods, addFood } from '../services/foodService'
import { getRecipes, calculateRecipeNutrition } from '../services/recipeService'

function AddFoodModal({ isOpen, onClose, onAddFood, onAddRecipe, userId }) {
  const [activeTab, setActiveTab] = useState('food') // 'food' | 'recipe'
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedFood, setSelectedFood] = useState(null)  // aliment sélectionné en attente de quantité
  const [quantity, setQuantity] = useState('')
  const [recipes, setRecipes] = useState([])
  const [recipesLoading, setRecipesLoading] = useState(false)
  const [recipeSearch, setRecipeSearch] = useState('')
  const [newFood, setNewFood] = useState({
    name: '',
    brand: '',
    category: 'other',
    serving_size: 100,
    serving_unit: 'g',
    calories: 0,
    proteins: 0,
    carbs: 0,
    fats: 0
  })

  useEffect(() => {
    if (searchQuery.length >= 2) {
      handleSearch()
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  useEffect(() => {
    if (isOpen && activeTab === 'recipe' && userId) {
      loadRecipes()
    }
  }, [isOpen, activeTab, userId])

  const loadRecipes = async () => {
    setRecipesLoading(true)
    try {
      const data = await getRecipes(userId)
      setRecipes(data)
    } catch (err) {
      console.error('Erreur chargement recettes:', err)
    } finally {
      setRecipesLoading(false)
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    try {
      const results = await searchFoods(searchQuery)
      setSearchResults(results)
    } catch (error) {
      console.error('Erreur de recherche:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectFood = (food) => {
    setSelectedFood(food)
    setQuantity(String(food.serving_size)) // quantité par défaut = portion
  }

  const handleConfirmFood = () => {
    const qty = parseFloat(quantity)
    if (!qty || qty <= 0) return
    onAddFood({ ...selectedFood, serving_size: qty })
    onClose()
  }

  const handleBackFromQuantity = () => {
    setSelectedFood(null)
    setQuantity('')
  }

  const handleSelectRecipe = (recipe) => {
    if (onAddRecipe) {
      onAddRecipe(recipe)
      onClose()
    }
  }

  const handleCreateFood = async () => {
    try {
      const createdFood = await addFood(newFood)
      onAddFood(createdFood)
      onClose()
    } catch (error) {
      console.error('Erreur création aliment:', error)
    }
  }

  const filteredRecipes = recipes.filter(r =>
    r.name.toLowerCase().includes(recipeSearch.toLowerCase())
  )

  // Macros prévisualisées selon la quantité saisie
  const previewMacros = selectedFood && quantity ? (() => {
    const qty = parseFloat(quantity) || 0
    const ratio = qty / selectedFood.serving_size
    return {
      calories: Math.round(selectedFood.calories * ratio),
      proteins: Math.round(selectedFood.proteins * ratio * 10) / 10,
      carbs: Math.round(selectedFood.carbs * ratio * 10) / 10,
      fats: Math.round(selectedFood.fats * ratio * 10) / 10,
    }
  })() : null

  if (!isOpen) return null

  const tabStyle = (tab) => ({
    flex: 1,
    padding: '10px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: activeTab === tab ? 'var(--primary)' : 'transparent',
    color: activeTab === tab ? 'white' : 'var(--text-secondary)'
  })

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      zIndex: 10000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'var(--surface)',
        width: '100%',
        maxWidth: '480px',
        maxHeight: '85vh',
        borderRadius: '24px 24px 0 0',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800' }}>
            {showAddForm ? 'Nouvel aliment' : selectedFood ? 'Quantité' : 'Ajouter'}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              border: 'none',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs - masqués quand on saisit une quantité */}
        {!showAddForm && !selectedFood && (
          <div style={{
            padding: '12px 20px 0',
            display: 'flex',
            gap: '6px',
            background: 'var(--bg-secondary)',
            borderRadius: '16px',
            margin: '12px 20px 0',
          }}>
            <button style={tabStyle('food')} onClick={() => setActiveTab('food')}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Utensils size={14} /> Aliments
              </span>
            </button>
            <button style={tabStyle('recipe')} onClick={() => setActiveTab('recipe')}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <ChefHat size={14} /> Recettes
              </span>
            </button>
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          {/* ÉCRAN SAISIE QUANTITÉ */}
          {selectedFood ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Carte aliment avec gradient subtil */}
              <div style={{
                padding: '16px 18px',
                background: 'linear-gradient(135deg, rgba(255,107,53,0.08) 0%, rgba(247,147,30,0.04) 100%)',
                borderRadius: '18px',
                border: '1.5px solid rgba(255,107,53,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '14px',
                  background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', flexShrink: 0, boxShadow: '0 4px 12px rgba(255,107,53,0.3)'
                }}>🥗</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '800', fontSize: '15px', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedFood.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    {selectedFood.brand && `${selectedFood.brand} · `}Réf. {selectedFood.serving_size}{selectedFood.serving_unit}
                  </div>
                </div>
              </div>

              {/* Stepper de quantité */}
              <div style={{
                background: 'var(--bg-secondary)',
                borderRadius: '20px',
                padding: '20px',
              }}>
                <div style={{ textAlign: 'center', marginBottom: '16px', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Quantité
                </div>

                {/* Contrôle principal */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <button
                    onClick={() => setQuantity(q => String(Math.max(1, (parseFloat(q) || 0) - 10)))}
                    style={{
                      width: '52px', height: '52px', borderRadius: '16px', flexShrink: 0,
                      border: 'none', background: 'var(--surface)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      fontSize: '24px', fontWeight: '300', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--text-primary)', transition: 'all 0.15s'
                    }}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  >−</button>

                  <div style={{ flex: 1, position: 'relative' }}>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={e => setQuantity(e.target.value)}
                      autoFocus
                      style={{
                        width: '100%', padding: '14px 48px 14px 16px',
                        borderRadius: '16px',
                        border: '2.5px solid var(--primary)',
                        fontSize: '28px', fontWeight: '900',
                        textAlign: 'center', outline: 'none',
                        color: 'var(--text-primary)',
                        background: 'var(--surface)',
                        boxShadow: '0 0 0 4px rgba(255,107,53,0.1)',
                        transition: 'all 0.2s'
                      }}
                    />
                    <span style={{
                      position: 'absolute', right: '14px', top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '14px', fontWeight: '700',
                      color: 'var(--text-secondary)', pointerEvents: 'none'
                    }}>{selectedFood.serving_unit}</span>
                  </div>

                  <button
                    onClick={() => setQuantity(q => String((parseFloat(q) || 0) + 10))}
                    style={{
                      width: '52px', height: '52px', borderRadius: '16px', flexShrink: 0,
                      border: 'none',
                      background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
                      boxShadow: '0 4px 12px rgba(255,107,53,0.35)',
                      fontSize: '24px', fontWeight: '300', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', transition: 'all 0.15s'
                    }}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  >+</button>
                </div>

                {/* Raccourcis rapides */}
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {[25, 50, 100, 150, 200].map(v => {
                    const active = quantity === String(v)
                    return (
                      <button
                        key={v}
                        onClick={() => setQuantity(String(v))}
                        style={{
                          padding: '7px 13px', borderRadius: '20px', fontSize: '12px',
                          fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s',
                          border: `2px solid ${active ? 'var(--primary)' : 'transparent'}`,
                          background: active ? 'rgba(255,107,53,0.12)' : 'var(--surface)',
                          color: active ? 'var(--primary)' : 'var(--text-secondary)',
                          boxShadow: active ? '0 0 0 1px rgba(255,107,53,0.2)' : 'none'
                        }}
                      >{v}{selectedFood.serving_unit}</button>
                    )
                  })}
                </div>
              </div>

              {/* Prévisualisation macros */}
              {previewMacros && (
                <div style={{
                  borderRadius: '18px',
                  overflow: 'hidden',
                  border: '1.5px solid var(--border-light)',
                }}>
                  {/* Calories en en-tête */}
                  <div style={{
                    padding: '14px 18px',
                    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: '700' }}>
                      Pour {quantity || '0'}{selectedFood.serving_unit}
                    </span>
                    <span style={{ color: 'white', fontSize: '22px', fontWeight: '900' }}>
                      {previewMacros.calories} <span style={{ fontSize: '13px', fontWeight: '600', opacity: 0.85 }}>kcal</span>
                    </span>
                  </div>

                  {/* Macros en grille */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: 'var(--bg-secondary)' }}>
                    {[
                      { label: 'Protéines', value: previewMacros.proteins, color: '#FF6B35', bg: 'rgba(255,107,53,0.06)' },
                      { label: 'Glucides', value: previewMacros.carbs, color: '#4ECDC4', bg: 'rgba(78,205,196,0.06)' },
                      { label: 'Lipides', value: previewMacros.fats, color: '#667EEA', bg: 'rgba(102,126,234,0.06)' },
                    ].map((macro, i) => (
                      <div key={i} style={{
                        padding: '14px 8px',
                        textAlign: 'center',
                        background: macro.bg,
                        borderLeft: i > 0 ? '1px solid var(--border-light)' : 'none'
                      }}>
                        <div style={{ fontSize: '18px', fontWeight: '900', color: macro.color, marginBottom: '3px' }}>
                          {macro.value}g
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {macro.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Boutons */}
              <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
                <button
                  onClick={handleBackFromQuantity}
                  style={{
                    flex: 1, padding: '14px', borderRadius: '16px',
                    border: '2px solid var(--border-light)',
                    background: 'transparent', cursor: 'pointer',
                    fontWeight: '700', fontSize: '15px',
                    color: 'var(--text-secondary)', transition: 'all 0.2s'
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--text-secondary)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                >
                  ← Retour
                </button>
                <button
                  onClick={handleConfirmFood}
                  disabled={!quantity || parseFloat(quantity) <= 0}
                  style={{
                    flex: 2, padding: '14px', borderRadius: '16px',
                    border: 'none',
                    background: (!quantity || parseFloat(quantity) <= 0)
                      ? 'var(--border-light)'
                      : 'linear-gradient(135deg, #FF6B35, #F7931E)',
                    cursor: (!quantity || parseFloat(quantity) <= 0) ? 'not-allowed' : 'pointer',
                    fontWeight: '800', fontSize: '15px', color: 'white',
                    boxShadow: (!quantity || parseFloat(quantity) <= 0)
                      ? 'none'
                      : '0 4px 16px rgba(255,107,53,0.4)',
                    transition: 'all 0.2s'
                  }}
                >
                  Ajouter au repas
                </button>
              </div>
            </div>


          ) : (
          <>
          {/* TAB ALIMENTS */}
          {activeTab === 'food' && !showAddForm ? (
            <>
              {/* Search Bar */}
              <div style={{
                position: 'relative',
                marginBottom: '20px'
              }}>
                <Search
                  size={20}
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-tertiary)'
                  }}
                />
                <input
                  type="text"
                  placeholder="Rechercher un aliment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 48px',
                    borderRadius: '16px',
                    border: '2px solid var(--border-light)',
                    fontSize: '15px',
                    fontWeight: '500',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
                />
              </div>

              {/* Search Results */}
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  Recherche en cours...
                </div>
              ) : searchResults.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {searchResults.map((food) => (
                    <div
                      key={food.id}
                      onClick={() => handleSelectFood(food)}
                      style={{
                        padding: '16px',
                        background: 'var(--surface)',
                        border: '2px solid var(--border-light)',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                      onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-light)'}
                    >
                      <div style={{ fontWeight: '700', marginBottom: '4px' }}>
                        {food.name}
                      </div>
                      {food.brand && (
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>
                          {food.brand}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '16px', fontSize: '13px', fontWeight: '600' }}>
                        <span>{food.calories} kcal</span>
                        <span>P: {food.proteins}g</span>
                        <span>G: {food.carbs}g</span>
                        <span>L: {food.fats}g</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery.length >= 2 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  Aucun résultat trouvé
                </div>
              ) : null}

              {/* Button to create new food */}
              <button
                onClick={() => setShowAddForm(true)}
                className="btn"
                style={{ marginTop: '20px' }}
              >
                <Plus size={20} />
                Créer un nouvel aliment
              </button>
            </>
          ) : activeTab === 'recipe' ? (
            /* TAB RECETTES */
            <div>
              {/* Barre de recherche recettes */}
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <Search size={18} style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-tertiary)'
                }} />
                <input
                  type="text"
                  placeholder="Rechercher une recette..."
                  value={recipeSearch}
                  onChange={e => setRecipeSearch(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 14px 12px 44px',
                    borderRadius: '14px', border: '2px solid var(--border-light)',
                    fontSize: '15px', fontWeight: '500', outline: 'none',
                    transition: 'all 0.2s ease',
                    background: 'var(--bg-secondary)', color: 'var(--text-primary)'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-light)'}
                />
              </div>

              {recipesLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  Chargement...
                </div>
              ) : filteredRecipes.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '40px',
                  color: 'var(--text-secondary)', fontSize: '14px'
                }}>
                  {recipes.length === 0
                    ? 'Aucune recette créée. Créez vos recettes depuis la page Recettes.'
                    : 'Aucune recette correspondante'}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {filteredRecipes.map(recipe => {
                    const nutrition = calculateRecipeNutrition(recipe, 1)
                    return (
                      <div
                        key={recipe.id}
                        onClick={() => handleSelectRecipe(recipe)}
                        style={{
                          padding: '14px 16px',
                          background: 'var(--bg-secondary)',
                          border: '2px solid var(--border-light)',
                          borderRadius: '16px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={e => {
                          e.currentTarget.style.borderColor = 'var(--primary)'
                          e.currentTarget.style.transform = 'translateY(-1px)'
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.borderColor = 'var(--border-light)'
                          e.currentTarget.style.transform = 'translateY(0)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                          <ChefHat size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                          <span style={{ fontWeight: '800', fontSize: '15px' }}>{recipe.name}</span>
                        </div>
                        {recipe.description && (
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 8px 26px', lineHeight: '1.4' }}>
                            {recipe.description}
                          </p>
                        )}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginLeft: '26px' }}>
                          <span style={{
                            fontSize: '12px', fontWeight: '700', padding: '3px 10px',
                            background: 'rgba(255,107,53,0.12)', color: 'var(--primary)',
                            borderRadius: '20px'
                          }}>
                            {Math.round(nutrition.calories)} kcal
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: '600', padding: '3px 10px', background: 'rgba(0,0,0,0.06)', borderRadius: '20px', color: 'var(--text-secondary)' }}>
                            P: {Math.round(nutrition.proteins)}g
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: '600', padding: '3px 10px', background: 'rgba(0,0,0,0.06)', borderRadius: '20px', color: 'var(--text-secondary)' }}>
                            G: {Math.round(nutrition.carbs)}g
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: '600', padding: '3px 10px', background: 'rgba(0,0,0,0.06)', borderRadius: '20px', color: 'var(--text-secondary)' }}>
                            L: {Math.round(nutrition.fats)}g
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: '600', padding: '3px 10px', background: 'rgba(0,0,0,0.06)', borderRadius: '20px', color: 'var(--text-secondary)' }}>
                            {recipe.servings} portion{recipe.servings > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Add Food Form */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                  Nom de l'aliment *
                </label>
                <input
                  type="text"
                  value={newFood.name}
                  onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '2px solid var(--border-light)',
                    fontSize: '15px',
                    fontWeight: '500',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                  Marque
                </label>
                <input
                  type="text"
                  value={newFood.brand}
                  onChange={(e) => setNewFood({ ...newFood, brand: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '2px solid var(--border-light)',
                    fontSize: '15px',
                    fontWeight: '500',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                  Catégorie *
                </label>
                <select
                  value={newFood.category}
                  onChange={(e) => setNewFood({ ...newFood, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '2px solid var(--border-light)',
                    fontSize: '15px',
                    fontWeight: '500',
                    outline: 'none'
                  }}
                >
                  <option value="fruits">Fruits</option>
                  <option value="vegetables">Légumes</option>
                  <option value="proteins">Protéines</option>
                  <option value="dairy">Produits laitiers</option>
                  <option value="grains">Céréales</option>
                  <option value="snacks">Snacks</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                    Portion *
                  </label>
                  <input
                    type="number"
                    value={newFood.serving_size}
                    onChange={(e) => setNewFood({ ...newFood, serving_size: parseFloat(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '2px solid var(--border-light)',
                      fontSize: '15px',
                      fontWeight: '500',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                    Unité
                  </label>
                  <select
                    value={newFood.serving_unit}
                    onChange={(e) => setNewFood({ ...newFood, serving_unit: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '2px solid var(--border-light)',
                      fontSize: '15px',
                      fontWeight: '500',
                      outline: 'none'
                    }}
                  >
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                    <option value="unit">unité</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                    Calories *
                  </label>
                  <input
                    type="number"
                    value={newFood.calories}
                    onChange={(e) => setNewFood({ ...newFood, calories: parseFloat(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '2px solid var(--border-light)',
                      fontSize: '15px',
                      fontWeight: '500',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                    Protéines (g) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newFood.proteins}
                    onChange={(e) => setNewFood({ ...newFood, proteins: parseFloat(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '2px solid var(--border-light)',
                      fontSize: '15px',
                      fontWeight: '500',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                    Glucides (g) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newFood.carbs}
                    onChange={(e) => setNewFood({ ...newFood, carbs: parseFloat(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '2px solid var(--border-light)',
                      fontSize: '15px',
                      fontWeight: '500',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                    Lipides (g) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newFood.fats}
                    onChange={(e) => setNewFood({ ...newFood, fats: parseFloat(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '2px solid var(--border-light)',
                      fontSize: '15px',
                      fontWeight: '500',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateFood}
                  className="btn"
                  style={{ flex: 1 }}
                  disabled={!newFood.name || !newFood.calories}
                >
                  Créer
                </button>
              </div>
            </div>
          )}
          </>
          )}
        </div>

      </div>
    </div>,
    document.body
  )
}

export default AddFoodModal
