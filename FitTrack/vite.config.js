import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// En dev, sert /api/foods/barcode/:code avec le même handler que la fonction
// Vercel : `npm run dev` suffit, pas besoin de `vercel dev`.
function barcodeApiDev() {
  return {
    name: 'fittrack-barcode-api-dev',
    apply: 'serve',
    configureServer(server) {
      // '' : charge aussi les variables sans préfixe VITE_ (clé service_role, email OFF)
      const env = { ...process.env, ...loadEnv(server.config.mode, process.cwd(), '') }

      server.middlewares.use('/api/foods/barcode', async (req, res, next) => {
        try {
          const { handleBarcodeRequest } = await server.ssrLoadModule('/api/_lib/barcodeHandler.js')
          const request = new Request(new URL(req.originalUrl ?? req.url, 'http://localhost'), {
            method: req.method,
            headers: req.headers,
          })
          const response = await handleBarcodeRequest(request, env)
          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          res.end(await response.text())
        } catch (err) {
          next(err)
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), barcodeApiDev()],
  server: {
    // Tunnels HTTPS (cloudflared, ngrok) : la caméra exige HTTPS pour tester sur iPhone
    allowedHosts: ['.trycloudflare.com', '.ngrok-free.app'],
  },
})
