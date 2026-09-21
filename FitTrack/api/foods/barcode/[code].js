import { handleBarcodeRequest } from '../../_lib/barcodeHandler.js'

// Fonction Vercel : GET /api/foods/barcode/:code
export function GET(request) {
  return handleBarcodeRequest(request)
}
