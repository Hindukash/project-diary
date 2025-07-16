import { createClient } from '@supabase/supabase-js'
import { Database } from '@/data/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Development toggle
export const USE_DATABASE = process.env.NEXT_PUBLIC_USE_DATABASE === 'true'