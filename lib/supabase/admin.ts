import 'server-only'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

/**
 * Privileged client using the SERVICE ROLE key. This BYPASSES Row Level
 * Security entirely.
 *
 * - Import this ONLY inside app/api/** route handlers, server actions,
 *   or scripts/ — never in a client component, never in anything that
 *   could end up in a browser bundle.
 * - This is the only client allowed to write orders, order_items,
 *   order_addresses, payments, and shipments.
 * - The `import 'server-only'` line above will throw a build error if
 *   this file is ever imported from client-side code.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}
