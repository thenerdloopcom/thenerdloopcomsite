import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/types/database'

/**
 * Server client — still uses the anon key and still respects RLS, but
 * reads the user's session from cookies so server components / route
 * handlers can query "as" the signed-in user (e.g. "my orders").
 *
 * This is NOT privileged. Use lib/supabase/admin.ts for anything that
 * must bypass RLS (creating orders, writing payments, etc).
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Called from a Server Component that can't set cookies —
            // safe to ignore if you have middleware refreshing sessions.
          }
        },
      },
    },
  )
}
