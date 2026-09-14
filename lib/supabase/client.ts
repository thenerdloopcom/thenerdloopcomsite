'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database'

/**
 * Browser client — uses the anon key, fully subject to Row Level
 * Security. Safe to import in client components. Use this for reading
 * the storefront catalog, and for a signed-in user's own addresses,
 * orders, and uploads.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
