import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// tokom razvoja (npm run dev) API i admin panel rade u istom Vite serveru
const backend = {
  name: 'beep-beep-backend',
  async configureServer(server) {
    Object.assign(process.env, loadEnv(server.config.mode, process.cwd(), ''))
    const { api } = await import('./server/api.js')
    const { admin } = await import('./server/admin.js')
    server.middlewares.use(api)
    server.middlewares.use(admin)
  },
}

export default defineConfig({
  plugins: [react(), tailwindcss(), backend],
  // dostupno i sa telefona u istoj Wi-Fi mreži (http://IP-računara:5173)
  server: { host: true },
})
