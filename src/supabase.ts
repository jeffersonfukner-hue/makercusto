import { createClient } from '@supabase/supabase-js'
import { createCloud } from './cloud'

// Sem as variáveis o app funciona só com salvamento local, sem botão de entrar.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const supabase = url && key ? createClient(url, key, { auth: { flowType: 'pkce' } }) : null
export const cloud = supabase ? createCloud(supabase) : null

export const signInWithGoogle = () =>
  void supabase?.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + location.pathname } })
export const signOut = () => void supabase?.auth.signOut()

export function onUser(cb: (email: string | null) => void): () => void {
  if (!supabase) return () => {}
  void supabase.auth.getSession().then(({ data }) => cb(data.session?.user.email ?? null))
  const { data } = supabase.auth.onAuthStateChange((_e, s) => cb(s?.user.email ?? null))
  return () => data.subscription.unsubscribe()
}
