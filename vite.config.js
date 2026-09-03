import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Works for both:
 * - Local:  npm run dev  → Vite proxies /api → VITE_DEV_API_TARGET (default :4000)
 * - Server: npm run build → VITE_API_BASE_URL=/api → Nginx proxies to Node
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_DEV_API_TARGET || 'http://localhost:4000'

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Browser: /api/... → Backend (local :4000; production uses nginx /api)
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        // Static uploads from the API server
        '/uploads': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
