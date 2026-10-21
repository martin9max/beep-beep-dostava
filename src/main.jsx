import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import '@fontsource-variable/figtree'
import '@fontsource-variable/source-serif-4'
import './index.css'
import App from './App'

// Ovaj sajt nema service worker. Ako je neki drugi sajt ranije na istoj adresi ostavio svoj
// (npr. na localhost:5173), on može da servira njegove stare fajlove i ikonicu, pa se uklanja.
navigator.serviceWorker?.getRegistrations().then((list) => list.forEach((r) => r.unregister()))

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
