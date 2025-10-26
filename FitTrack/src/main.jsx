import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { NutritionProvider } from './context/NutritionContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NutritionProvider>
      <App />
    </NutritionProvider>
  </StrictMode>,
)
