import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/css/index.css' // 引入 Tailwind
import './assets/css/styles.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
