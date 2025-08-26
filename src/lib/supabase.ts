import { createClient } from '@supabase/supabase-js'

export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

// Export a proxy object that creates the client when needed
export const supabase = new Proxy({} as any, {
  get(target, prop) {
    if (prop === 'rpc') {
      return (...args: any[]) => getSupabaseClient().rpc(...args)
    }
    if (prop === 'from') {
      return (...args: any[]) => getSupabaseClient().from(...args)
    }
    if (prop === 'auth') {
      return getSupabaseClient().auth
    }
    if (prop === 'storage') {
      return getSupabaseClient().storage
    }
    return getSupabaseClient()[prop]
  }
})
