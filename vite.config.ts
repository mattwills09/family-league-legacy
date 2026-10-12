import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { handleStandings } from './server/standings-handler.ts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load only server-side ESPN variables, never VITE_* credentials.
  const env = { ...loadEnv(mode, process.cwd(), 'ESPN_'), ...process.env }
  return {
    plugins: [react(), {
      name: 'league-api',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.split('?')[0] !== '/api/standings') return next()
          void handleStandings(req, res, env)
        })
      },
    }],
  }
})
