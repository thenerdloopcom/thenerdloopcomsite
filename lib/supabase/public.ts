import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

/**
 * Anon-key client with NO cookie/session handling. Safe to call from
 * anywhere, including build-time contexts like generateStaticParams
 * where there is no incoming request to read cookies from. Still
 * respects RLS — this is just for public reads (active products,
 * active categories), never for user-specific or write queries.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}