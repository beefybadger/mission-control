import { createClient } from '@supabase/supabase-js'

// Use placeholder values during build to prevent createClient from throwing.
// At runtime, NEXT_PUBLIC_* env vars are injected by Next.js and will be real.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
