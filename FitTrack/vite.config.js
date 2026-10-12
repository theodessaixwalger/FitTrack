import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// En dev, sert les routes /api avec les mêmes handlers que les fonctions
// Vercel : `npm run dev` suffit, pas besoin de `vercel dev`.
const DEV_API_ROUTES = [
  { path: '/api/foods/barcode', module: '/api/_lib/barcodeHandler.js', handler: 'handleBarcodeRequest' },
  { path: '/api/notifications/cron', module: '/api/_lib/notificationsHandler.js', handler: 'handleCronRequest' },
]

function apiDev() {
  return {
    name: 'fittrack-api-dev',
    apply: 'serve',
    configureServer(server) {
      // '' : charge aussi les variables sans préfixe VITE_ (clé service_role, email OFF, clés VAPID)
      const env = { ...process.env, ...loadEnv(server.config.mode, process.cwd(), '') }

      for (const route of DEV_API_ROUTES) {
        server.middlewares.use(route.path, async (req, res, next) => {
          try {
            const handlers = await server.ssrLoadModule(route.module)
            const request = new Request(new URL(req.originalUrl ?? req.url, 'http://localhost'), {
              method: req.method,
              headers: req.headers,
            })
            const response = await handlers[route.handler](request, env)
            res.statusCode = response.status
            response.headers.forEach((value, key) => res.setHeader(key, value))
            res.end(await response.text())
          } catch (err) {
            next(err)
          }
        })
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiDev()],
  server: {
    // Tunnels HTTPS (cloudflared, ngrok) : la caméra exige HTTPS pour tester sur iPhone
    allowedHosts: ['.trycloudflare.com', '.ngrok-free.app'],
  },
})
