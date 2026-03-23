import { createClient } from '@/lib/supabase/server'

/**
 * Checks whether the currently authenticated user has the admin role.
 *
 * Role is set via the Supabase dashboard:
 *   Authentication → Users → select a user → Edit → app_metadata → { "role": "admin" }
 *
 * Works in both Server Components and API routes (uses the server-side Supabase client).
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.app_metadata?.role === 'admin'
}
