import { useState, useEffect } from 'react'
import { X, Search, Plus } from 'lucide-react'
import { searchFoods, addFood } from '../services/foodService'

function AddFoodModal({ isOpen, onClose, onAddFood }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
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
    onAddFood(food)
    onClose()
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

  if (!isOpen) return null

  return (
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
      zIndex: 2000,
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
            {showAddForm ? 'Nouvel aliment' : 'Ajouter un aliment'}
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

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          {!showAddForm ? (
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
        </div>
      </div>
    </div>
  )
}

export default AddFoodModal
