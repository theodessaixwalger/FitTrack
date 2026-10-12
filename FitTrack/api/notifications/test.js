import { handleTestRequest } from '../_lib/notificationsHandler.js'

// Fonction Vercel : POST /api/notifications/test
export function POST(request) {
  return handleTestRequest(request)
}
