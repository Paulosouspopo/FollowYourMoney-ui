import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App.tsx'
import { router } from './app/router'
import { registerServiceWorker } from './shared/pwa/push'
import './index.css'

registerServiceWorker(path => router.navigate(path))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
