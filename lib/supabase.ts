import { createClient } from '@supabase/supabase-js'
import { Database } from '@/data/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client for client-side operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations only
export const supabaseAdmin = typeof window === 'undefined' 
  ? createClient<Database>(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_KEY!
    )
  : null;

// Development toggle
export const USE_DATABASE = process.env.NEXT_PUBLIC_USE_DATABASE === 'true'