import { Barcode, SealWarning, ArrowSquareOut } from '@phosphor-icons/react'
import { NOVA_GROUPS, NUTRISCORE_GRADES, offProductUrl } from '../utils/barcode'

const round = (value, decimals = 1) => Math.round(value * 10 ** decimals) / 10 ** decimals

// En-tête et valeurs nutritionnelles d'un aliment identifié par code-barres,
// affichés au-dessus du choix de quantité dans AddFoodModal.
function ProductDetails({ food }) {
  const grade = NUTRISCORE_GRADES.includes(food.nutriscore_grade) ? food.nutriscore_grade : null
  const nova = NOVA_GROUPS.includes(food.nova_group) ? food.nova_group : null
  const isOff = food.source === 'off'

  // Les fiches OFF sont pour 100 g ; une fiche créée à la main peut avoir une
  // autre portion de référence : on ramène à 100 g/ml quand c'est possible.
  const perUnit = food.serving_unit === 'unit'
  const factor = perUnit ? 1 / food.serving_size : 100 / food.serving_size
  const per = (value, decimals = 1) => (value == null ? '—' : `${round(value * factor, decimals)} g`)

  const rows = [
    { label: 'Énergie', value: food.calories == null ? '—' : `${Math.round(food.calories * factor)} kcal` },
    { label: 'Protéines', value: per(food.proteins) },
    { label: 'Glucides', value: per(food.carbs) },
    { label: 'Lipides', value: per(food.fats) },
    // Détail seulement pour les fiches OFF : le formulaire manuel ne les demande pas
    ...(isOff ? [
      { label: 'dont sucres', value: per(food.sugar) },
      { label: 'dont AG saturés', value: per(food.saturated_fat) },
      { label: 'Fibres', value: per(food.fiber) },
      { label: 'Sel', value: per(food.salt, 2) },
    ] : []),
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div className="product-head">
        {food.image_url ? (
          <img className="product-image" src={food.image_url} alt="" loading="lazy" />
        ) : (
          <div className="product-image product-image-placeholder" aria-hidden="true">
            <Barcode size={28} />
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <p className="product-name">{food.name}</p>
          {food.brand && <p className="product-brand">{food.brand}</p>}
          {(grade || nova || !food.verified) && (
            <div className="product-badges">
              {grade && (
                <span className="score-badge" aria-label={`Nutri-Score ${grade.toUpperCase()}`}>
                  Nutri-Score
                  <span className={`score-badge-value nutriscore-${grade}`}>{grade.toUpperCase()}</span>
                </span>
              )}
              {nova && (
                <span className="score-badge" aria-label={`Groupe NOVA ${nova}`}>
                  NOVA
                  <span className={`score-badge-value nova-${nova}`}>{nova}</span>
                </span>
              )}
              {!food.verified && (
                <span className="badge badge-warning" style={{ gap: '4px' }}>
                  <SealWarning size={13} />
                  Non vérifié
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="product-per100">
        <div className="product-per100-title">
          {perUnit ? 'Pour 1 unité' : `Pour 100 ${food.serving_unit === 'ml' ? 'ml' : 'g'}`}
        </div>
        <div className="product-per100-grid">
          {rows.map((row) => (
            <div key={row.label} className="product-per100-row">
              <span>{row.label}</span>
              <strong>{row.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Mention obligatoire (licence ODbL) pour les données issues d'Open Food Facts
export function OffAttribution({ code }) {
  return (
    <p className="product-source">
      Données :{' '}
      <a href={offProductUrl(code)} target="_blank" rel="noopener noreferrer">
        Open Food Facts
        <ArrowSquareOut size={12} />
      </a>
    </p>
  )
}

export default ProductDetails
