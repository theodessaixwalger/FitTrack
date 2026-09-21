import { useState, useEffect, lazy, Suspense } from 'react'
import { createPortal } from 'react-dom'
import { X, Plus, MagnifyingGlass, CookingPot, ForkKnife, Barcode, WarningCircle } from '@phosphor-icons/react'
import { searchFoods, addFood, getFoodByBarcode, findFoodByBarcode } from '../services/foodService'
import { getRecipes, calculateRecipeNutrition } from '../services/recipeService'
import { normalizeBarcode } from '../utils/barcode'
import ProductDetails, { OffAttribution } from './ProductDetails'

// Chargé à la demande : la lib de scan et son décodeur WebAssembly pèsent lourd
const BarcodeScanner = lazy(() => import('./BarcodeScanner'))

// Le mobile décharge parfois la page quand on change d'app (mémoire faible) :
// on garde le brouillon en sessionStorage pour le restaurer au retour.
const DRAFT_KEY = 'fittrack_add_food_draft'

const defaultNewFood = {
  name: '',
  brand: '',
  category: 'other',
  serving_size: 100,
  serving_unit: 'g',
  calories: 0,
  proteins: 0,
  carbs: 0,
  fats: 0
}

const loadDraft = () => {
  try {
    const saved = sessionStorage.getItem(DRAFT_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

function AddFoodModal({ isOpen, onClose, onAddFood, onAddRecipe, userId }) {
  const draft = loadDraft()
  const [activeTab, setActiveTab] = useState(draft?.activeTab || 'food') // 'food' | 'recipe'
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(draft?.showAddForm || false)
  const [selectedFood, setSelectedFood] = useState(draft?.selectedFood || null)  // aliment sélectionné en attente de quantité
  const [quantity, setQuantity] = useState(draft?.quantity || '')
  const [recipes, setRecipes] = useState([])
  const [recipesLoading, setRecipesLoading] = useState(false)
  const [recipeSearch, setRecipeSearch] = useState('')
  const [newFood, setNewFood] = useState(draft?.newFood || defaultNewFood)
  const [selectedRecipe, setSelectedRecipe] = useState(draft?.selectedRecipe || null) // recette sélectionnée en attente de portions
  const [recipeServings, setRecipeServings] = useState(draft?.recipeServings || '1')
  const [scannerOpen, setScannerOpen] = useState(false)
  const [createError, setCreateError] = useState('')

  // Sauvegarde continue du brouillon tant que la modal est ouverte
  useEffect(() => {
    if (!isOpen) return
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ activeTab, showAddForm, selectedFood, quantity, newFood, selectedRecipe, recipeServings }))
    } catch {
      // sessionStorage indisponible (navigation privée, quota) : brouillon simplement non sauvegardé
    }
  }, [isOpen, activeTab, showAddForm, selectedFood, quantity, newFood, selectedRecipe, recipeServings])

  const clearDraft = () => {
    try {
      sessionStorage.removeItem(DRAFT_KEY)
    } catch {
      // sessionStorage indisponible : rien à nettoyer
    }
  }

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

  // Normalise une saisie décimale : autorise la virgule (clavier FR) en plus du point
  const sanitizeDecimal = (value) => {
    let v = value.replace(',', '.').replace(/[^0-9.]/g, '')
    const parts = v.split('.')
    if (parts.length > 2) v = parts[0] + '.' + parts.slice(1).join('')
    return v
  }

  const handleSelectFood = (food) => {
    setSelectedFood(food)
    // quantité par défaut = portion de l'emballage (produits scannés), sinon portion de référence
    setQuantity(String(food.serving_quantity || food.serving_size))
  }

  const closeModal = () => {
    setScannerOpen(false)
    clearDraft()
    onClose()
  }

  // Appelé par le scanner : une erreur levée ici y est affichée avec « Réessayer »
  const handleBarcode = async (rawCode) => {
    const code = normalizeBarcode(rawCode)
    if (!code) throw new Error('Code-barres invalide.')

    const result = await getFoodByBarcode(code)
    setScannerOpen(false)

    if (result.found) {
      handleSelectFood(result.food)
      return
    }

    // Introuvable ou incomplet sur Open Food Facts : formulaire de création pré-rempli
    const partial = result.partial ?? {}
    setNewFood({
      ...defaultNewFood,
      name: partial.name ?? '',
      brand: partial.brand ?? '',
      calories: partial.calories ?? 0,
      proteins: partial.proteins ?? 0,
      carbs: partial.carbs ?? 0,
      fats: partial.fats ?? 0,
      barcode: code,
    })
    setCreateError('')
    setShowAddForm(true)
  }

  const openCreateForm = () => {
    // Un code-barres resté d'un scan abandonné ne doit pas suivre une création manuelle
    setNewFood(food => (food.barcode ? defaultNewFood : food))
    setCreateError('')
    setShowAddForm(true)
  }

  const cancelCreateForm = () => {
    if (newFood.barcode) setNewFood(defaultNewFood)
    setCreateError('')
    setShowAddForm(false)
  }

  const handleConfirmFood = () => {
    const qty = parseFloat(quantity)
    if (!qty || qty <= 0) return
    onAddFood({ ...selectedFood, serving_size: qty })
    clearDraft()
    onClose()
  }

  const handleBackFromQuantity = () => {
    setSelectedFood(null)
    setQuantity('')
  }

  const handleSelectRecipe = (recipe) => {
    setSelectedRecipe(recipe)
    setRecipeServings('1')
  }

  const handleBackFromRecipeQty = () => {
    setSelectedRecipe(null)
    setRecipeServings('1')
  }

  const handleConfirmRecipe = () => {
    const servings = parseFloat(recipeServings)
    if (!servings || servings <= 0) return
    if (onAddRecipe) onAddRecipe(selectedRecipe, servings)
    setSelectedRecipe(null)
    setRecipeServings('1')
    clearDraft()
    onClose()
  }

  const handleCreateFood = async () => {
    setCreateError('')
    try {
      const createdFood = await addFood({
        ...newFood,
        serving_size: parseFloat(newFood.serving_size) || 0,
        calories: parseFloat(newFood.calories) || 0,
        proteins: parseFloat(newFood.proteins) || 0,
        carbs: parseFloat(newFood.carbs) || 0,
        fats: parseFloat(newFood.fats) || 0,
        // Produit scanné introuvable : il rejoint la base partagée, marqué non vérifié
        ...(newFood.barcode && { source: 'user', verified: false }),
      })
      onAddFood(createdFood)
      setNewFood(defaultNewFood)
      clearDraft()
      onClose()
    } catch (error) {
      // Code-barres enregistré entre-temps par un autre user : on reprend sa fiche
      if (newFood.barcode && error?.code === '23505') {
        try {
          const existing = await findFoodByBarcode(newFood.barcode)
          if (existing) {
            setNewFood(defaultNewFood)
            setShowAddForm(false)
            handleSelectFood(existing)
            return
          }
        } catch (lookupError) {
          console.error('Erreur lecture aliment existant:', lookupError)
        }
      }
      console.error('Erreur création aliment:', error)
      setCreateError("Impossible de créer l'aliment. Réessaie dans un instant.")
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

  // Macros prévisualisées selon le nombre de portions de recette saisi
  const previewRecipeMacros = selectedRecipe && recipeServings ? (() => {
    const servings = parseFloat(recipeServings) || 0
    const nutrition = calculateRecipeNutrition(selectedRecipe, servings)
    return {
      calories: Math.round(nutrition.calories),
      proteins: Math.round(nutrition.proteins * 10) / 10,
      carbs: Math.round(nutrition.carbs * 10) / 10,
      fats: Math.round(nutrition.fats * 10) / 10,
    }
  })() : null

  if (!isOpen) return null

  const tabStyle = (tab) => ({
    flex: '1 1 0',
    // Le bouton est lui-meme le conteneur flex : padding symetrique et
    // contenu centre sur les deux axes, identique pour les deux onglets.
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 12px',
    minHeight: '38px',
    lineHeight: 1,
    borderRadius: '999px',
    fontSize: '14px',
    fontWeight: '700',
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'all 0.2s',
    // Meme traitement que la pilule active de la nav du bas :
    // fond accent tres dilue + texte lime, plutot que du blanc sur lime.
    background: activeTab === tab ? 'var(--accent-ghost)' : 'transparent',
    border: activeTab === tab ? '1px solid var(--accent-line)' : '1px solid transparent',
    color: activeTab === tab ? 'var(--accent)' : 'var(--text-secondary)'
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
            {showAddForm ? 'Nouvel aliment' : selectedFood ? 'Quantité' : selectedRecipe ? 'Portions' : 'Ajouter'}
          </h2>
          <button
            onClick={closeModal}
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
            <X weight="bold" size={20} />
          </button>
        </div>

        {/* Tabs - masqués quand on saisit une quantité */}
        {!showAddForm && !selectedFood && !selectedRecipe && (
          <div style={{
            // Inset uniforme sur les 4 cotes : les pilules etaient collees
            // au bord bas (padding 12px en haut, 0 en bas).
            padding: '5px',
            display: 'flex',
            alignItems: 'stretch',
            gap: '5px',
            background: 'var(--bg-secondary)',
            borderRadius: '999px',
            margin: '12px 20px 0',
          }}>
            <button style={tabStyle('food')} onClick={() => setActiveTab('food')}>
              {/* Libelle dans son propre span : l'espacement vient du gap,
                  pas d'un espace de texte a la largeur variable. */}
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', lineHeight: 1 }}>
                <ForkKnife size={14} />
                <span>Aliments</span>
              </span>
            </button>
            <button style={tabStyle('recipe')} onClick={() => setActiveTab('recipe')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', lineHeight: 1 }}>
                <CookingPot size={14} />
                <span>Recettes</span>
              </span>
            </button>
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          {/* ÉCRAN SAISIE QUANTITÉ */}
          {selectedFood ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

              {selectedFood.barcode ? (
                /* Produit identifié par code-barres : fiche détaillée */
                <ProductDetails food={selectedFood} />
              ) : (
              /* Identité de l'aliment : même icône que l'onglet Aliments, pas de tuile décorative */
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <ForkKnife size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <span style={{ fontWeight: '800', fontSize: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedFood.name}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600', margin: 0, marginLeft: '24px' }}>
                  {selectedFood.brand && `${selectedFood.brand} · `}Réf. {selectedFood.serving_size}{selectedFood.serving_unit} · {selectedFood.calories} kcal
                </p>
              </div>
              )}

              {/* Stepper de quantité */}
              <div style={{
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--r-md)',
                padding: '20px',
              }}>
                <div style={{ textAlign: 'center', marginBottom: '16px', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Quantité
                </div>

                {/* Contrôle principal */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <button
                    onClick={() => setQuantity(q => String(Math.max(0.1, Math.round(((parseFloat(q) || 0) - 5) * 10) / 10)))}
                    style={{
                      width: '52px', height: '52px', borderRadius: 'var(--r-sm)', flexShrink: 0,
                      border: 'none', background: 'var(--surface)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                      fontSize: '24px', fontWeight: '300', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--text-primary)', transition: 'transform 0.15s'
                    }}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  >−</button>

                  <div style={{ flex: 1, position: 'relative' }}>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={quantity}
                      onChange={e => setQuantity(sanitizeDecimal(e.target.value))}
                      autoFocus
                      style={{
                        width: '100%', padding: '14px 48px 14px 16px',
                        borderRadius: 'var(--r-sm)',
                        border: '1.5px solid var(--border-strong)',
                        fontSize: '28px', fontWeight: '900',
                        fontVariantNumeric: 'tabular-nums',
                        textAlign: 'center', outline: 'none',
                        color: 'var(--text-primary)',
                        background: 'var(--surface)',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
                    />
                    <span style={{
                      position: 'absolute', right: '14px', top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '14px', fontWeight: '700',
                      color: 'var(--text-secondary)', pointerEvents: 'none'
                    }}>{selectedFood.serving_unit}</span>
                  </div>

                  <button
                    onClick={() => setQuantity(q => String(Math.round(((parseFloat(q) || 0) + 5) * 10) / 10))}
                    style={{
                      width: '52px', height: '52px', borderRadius: 'var(--r-sm)', flexShrink: 0,
                      border: 'none', background: 'var(--surface)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                      fontSize: '24px', fontWeight: '300', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--text-primary)', transition: 'transform 0.15s'
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
                          border: `1.5px solid ${active ? 'var(--accent-deep)' : 'var(--border-light)'}`,
                          background: active ? 'var(--accent-ghost)' : 'transparent',
                          color: active ? 'var(--accent)' : 'var(--text-secondary)'
                        }}
                      >{v}{selectedFood.serving_unit}</button>
                    )
                  })}
                </div>
              </div>

              {/* Résumé nutritionnel : une seule bande, pas de bannière colorée */}
              {previewMacros && (
                <div style={{
                  display: 'flex',
                  borderRadius: 'var(--r-md)',
                  border: '1px solid var(--border-light)',
                  overflow: 'hidden'
                }}>
                  <div style={{ flex: '1.2 1 0', padding: '14px 12px', borderRight: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                      {previewMacros.calories}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      kcal
                    </div>
                  </div>
                  {[
                    { label: 'Protéines', value: previewMacros.proteins },
                    { label: 'Glucides', value: previewMacros.carbs },
                    { label: 'Lipides', value: previewMacros.fats },
                  ].map((macro, i) => (
                    <div key={i} style={{
                      flex: '1 1 0', padding: '14px 8px', textAlign: 'center',
                      borderRight: i < 2 ? '1px solid var(--border-light)' : 'none'
                    }}>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                        {macro.value}g
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {macro.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Boutons */}
              <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
                <button onClick={handleBackFromQuantity} className="btn btn-outline" style={{ flex: 1 }}>
                  ← Retour
                </button>
                <button
                  onClick={handleConfirmFood}
                  className="btn"
                  style={{ flex: 2 }}
                  disabled={!quantity || parseFloat(quantity) <= 0}
                >
                  Ajouter au repas
                </button>
              </div>

              {selectedFood.source === 'off' && selectedFood.barcode && (
                <OffAttribution code={selectedFood.barcode} />
              )}
            </div>

          ) : selectedRecipe ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

              {/* Identité de la recette : même icône que dans la liste, pas de tuile décorative */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <CookingPot size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <span style={{ fontWeight: '800', fontSize: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedRecipe.name}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600', margin: 0, marginLeft: '24px' }}>
                  Recette de {selectedRecipe.servings} portion{selectedRecipe.servings > 1 ? 's' : ''} · {Math.round(calculateRecipeNutrition(selectedRecipe, 1).calories)} kcal/portion
                </p>
              </div>

              {/* Stepper de portions */}
              <div style={{
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--r-md)',
                padding: '20px',
              }}>
                <div style={{ textAlign: 'center', marginBottom: '16px', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Combien de portions ?
                </div>

                {/* Contrôle principal */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <button
                    onClick={() => setRecipeServings(s => String(Math.max(0.5, Math.round(((parseFloat(s) || 0) - 0.5) * 10) / 10)))}
                    style={{
                      width: '52px', height: '52px', borderRadius: 'var(--r-sm)', flexShrink: 0,
                      border: 'none', background: 'var(--surface)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                      fontSize: '24px', fontWeight: '300', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--text-primary)', transition: 'transform 0.15s'
                    }}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  >−</button>

                  <div style={{ flex: 1, position: 'relative' }}>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={recipeServings}
                      onChange={e => setRecipeServings(sanitizeDecimal(e.target.value))}
                      autoFocus
                      style={{
                        width: '100%', padding: '14px 78px 14px 16px',
                        borderRadius: 'var(--r-sm)',
                        border: '1.5px solid var(--border-strong)',
                        fontSize: '28px', fontWeight: '900',
                        fontVariantNumeric: 'tabular-nums',
                        textAlign: 'center', outline: 'none',
                        color: 'var(--text-primary)',
                        background: 'var(--surface)',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
                    />
                    <span style={{
                      position: 'absolute', right: '14px', top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '14px', fontWeight: '700',
                      color: 'var(--text-secondary)', pointerEvents: 'none'
                    }}>portion{parseFloat(recipeServings) > 1 ? 's' : ''}</span>
                  </div>

                  <button
                    onClick={() => setRecipeServings(s => String(Math.round(((parseFloat(s) || 0) + 0.5) * 10) / 10))}
                    style={{
                      width: '52px', height: '52px', borderRadius: 'var(--r-sm)', flexShrink: 0,
                      border: 'none', background: 'var(--surface)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                      fontSize: '24px', fontWeight: '300', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--text-primary)', transition: 'transform 0.15s'
                    }}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  >+</button>
                </div>

                {/* Raccourcis rapides */}
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {[0.5, 1, 1.5, 2, 3].map(v => {
                    const active = recipeServings === String(v)
                    return (
                      <button
                        key={v}
                        onClick={() => setRecipeServings(String(v))}
                        style={{
                          padding: '7px 13px', borderRadius: '20px', fontSize: '12px',
                          fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s',
                          border: `1.5px solid ${active ? 'var(--accent-deep)' : 'var(--border-light)'}`,
                          background: active ? 'var(--accent-ghost)' : 'transparent',
                          color: active ? 'var(--accent)' : 'var(--text-secondary)'
                        }}
                      >{v}</button>
                    )
                  })}
                </div>
              </div>

              {/* Résumé nutritionnel : une seule bande, pas de bannière colorée */}
              {previewRecipeMacros && (
                <div style={{
                  display: 'flex',
                  borderRadius: 'var(--r-md)',
                  border: '1px solid var(--border-light)',
                  overflow: 'hidden'
                }}>
                  <div style={{ flex: '1.2 1 0', padding: '14px 12px', borderRight: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                      {previewRecipeMacros.calories}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      kcal
                    </div>
                  </div>
                  {[
                    { label: 'Protéines', value: previewRecipeMacros.proteins },
                    { label: 'Glucides', value: previewRecipeMacros.carbs },
                    { label: 'Lipides', value: previewRecipeMacros.fats },
                  ].map((macro, i) => (
                    <div key={i} style={{
                      flex: '1 1 0', padding: '14px 8px', textAlign: 'center',
                      borderRight: i < 2 ? '1px solid var(--border-light)' : 'none'
                    }}>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                        {macro.value}g
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {macro.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Boutons */}
              <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
                <button onClick={handleBackFromRecipeQty} className="btn btn-outline" style={{ flex: 1 }}>
                  ← Retour
                </button>
                <button
                  onClick={handleConfirmRecipe}
                  className="btn"
                  style={{ flex: 2 }}
                  disabled={!recipeServings || parseFloat(recipeServings) <= 0}
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
              {/* Search Bar + scan */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
                  <MagnifyingGlass
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
                    className="search-field"
                    style={{ padding: '14px 16px 14px 48px' }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setScannerOpen(true)}
                  className="icon-btn icon-btn-ghost is-accent"
                  style={{ width: '50px', height: 'auto', minHeight: '50px', borderRadius: 'var(--r-md)' }}
                  aria-label="Scanner un code-barres"
                >
                  <Barcode size={24} />
                </button>
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
                onClick={openCreateForm}
                className="btn"
                style={{ marginTop: '20px' }}
              >
                <Plus weight="bold" size={20} />
                Créer un nouvel aliment
              </button>
            </>
          ) : activeTab === 'recipe' ? (
            /* TAB RECETTES */
            <div>
              {/* Barre de recherche recettes */}
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <MagnifyingGlass size={18} style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-tertiary)'
                }} />
                <input
                  type="text"
                  placeholder="Rechercher une recette..."
                  value={recipeSearch}
                  onChange={e => setRecipeSearch(e.target.value)}
                  className="search-field"
                  style={{ padding: '12px 14px 12px 44px' }}
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
                          <CookingPot size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
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
              {newFood.barcode && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                  <span className="barcode-chip">
                    <Barcode size={18} />
                    {newFood.barcode}
                  </span>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    Produit introuvable ou incomplet. Complète sa fiche avec les valeurs de l'emballage : elle sera disponible pour tous au prochain scan.
                  </p>
                </div>
              )}

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
                    type="text"
                    inputMode="decimal"
                    value={newFood.serving_size}
                    onChange={(e) => setNewFood({ ...newFood, serving_size: sanitizeDecimal(e.target.value) })}
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
                    type="text"
                    inputMode="decimal"
                    value={newFood.calories}
                    onChange={(e) => setNewFood({ ...newFood, calories: sanitizeDecimal(e.target.value) })}
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
                    type="text"
                    inputMode="decimal"
                    value={newFood.proteins}
                    onChange={(e) => setNewFood({ ...newFood, proteins: sanitizeDecimal(e.target.value) })}
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
                    type="text"
                    inputMode="decimal"
                    value={newFood.carbs}
                    onChange={(e) => setNewFood({ ...newFood, carbs: sanitizeDecimal(e.target.value) })}
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
                    type="text"
                    inputMode="decimal"
                    value={newFood.fats}
                    onChange={(e) => setNewFood({ ...newFood, fats: sanitizeDecimal(e.target.value) })}
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

              {createError && (
                <div className="scan-error" role="alert" style={{ marginBottom: 0 }}>
                  <WarningCircle size={18} />
                  {createError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  onClick={cancelCreateForm}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateFood}
                  className="btn"
                  style={{ flex: 1 }}
                  disabled={!newFood.name || !parseFloat(newFood.calories)}
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

      {/* Démonté à la fermeture : la caméra est libérée */}
      {scannerOpen && (
        <Suspense fallback={<div className="scanner-screen" />}>
          <BarcodeScanner onClose={() => setScannerOpen(false)} onResult={handleBarcode} />
        </Suspense>
      )}
    </div>,
    document.body
  )
}

export default AddFoodModal
