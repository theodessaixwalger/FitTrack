import React from 'react'
import ReactDOM from 'react-dom/client'
import { IconContext } from '@phosphor-icons/react'
import App from './App.jsx'
import './index.css'  // ✅ Important !
import { AuthProvider } from './context/AuthContext'
import { NutritionProvider } from './context/NutritionContext'

// Réglages par défaut de toutes les icônes Phosphor.
// - weight duotone : chaque call site peut le surcharger avec weight="..."
// - color currentColor : les icônes héritent de la couleur CSS du parent,
//   ce qui préserve les états existants (nav inactive grise, boutons
//   destructifs rouges, accents par métrique).
// - data-ph : marqueur pour cibler le calque secondaire en CSS sans
//   toucher aux SVG de recharts.
const iconDefaults = {
  weight: 'duotone',
  color: 'currentColor',
  'data-ph': '',
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <IconContext.Provider value={iconDefaults}>
      <AuthProvider>
        <NutritionProvider>
          <App />
        </NutritionProvider>
      </AuthProvider>
    </IconContext.Provider>
  </React.StrictMode>,
)
