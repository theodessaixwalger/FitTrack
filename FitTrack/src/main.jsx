import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'  // ✅ Important !
import { AuthProvider } from './context/AuthContext'
import { NutritionProvider } from './context/NutritionContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <NutritionProvider>
        <App />
      </NutritionProvider>
    </AuthProvider>
  </React.StrictMode>,
)
