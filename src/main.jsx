import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import '@fontsource-variable/figtree'
import '@fontsource-variable/source-serif-4'
import './index.css'
import App from './App'

const root = document.getElementById('root')
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// u produkciji je HTML početne stranice već unapred napravljen (prerender), pa ga React samo "oživi";
// na ostalim stranicama (/naruci, /prijava...) taj HTML ne odgovara, pa se crta ispočetka
if (root.hasChildNodes() && location.pathname === '/') hydrateRoot(root, app)
else {
  root.replaceChildren()
  createRoot(root).render(app)
}
