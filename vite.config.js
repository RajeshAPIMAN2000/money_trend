import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Works for both:
 * - Local:  npm run dev  → Vite proxies /api → http://localhost:4000
 * - Server: npm run build → VITE_API_BASE_URL=/api → Nginx proxies to Node
 *
 * Browser calls: /api/credit-check, /api/auth/...
 * Proxy rewrites /api prefix so Express routes like /credit-check and /auth receive the path.
 * (If your backend mounts under /api, remove the rewrite line.)
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_DEV_API_TARGET || 'http://localhost:4000'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/uploads': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
