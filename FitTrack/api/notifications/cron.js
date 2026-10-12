import { handleCronRequest } from '../_lib/notificationsHandler.js'

// Fonction Vercel : appelée chaque heure par pg_cron (Supabase), voir database/push_notifications.sql
export function GET(request) {
  return handleCronRequest(request)
}

export function POST(request) {
  return handleCronRequest(request)
}
