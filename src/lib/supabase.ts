import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

// SUPABASE_ENABLED is false when env vars are missing (e.g. this app is running
// somewhere the Supabase network call itself is blocked, such as inside a
// Claude Artifact preview — its sandbox only allows a fixed CDN/font
// allowlist, so requests to *.supabase.co never leave the page). Every call
// site in this app checks this flag and/or catches fetch failures so the UI
// still works with local/demo behaviour instead of hanging or crashing.
export const SUPABASE_ENABLED = Boolean(url && key)

export const supabase = SUPABASE_ENABLED
  ? createClient(url as string, key as string, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null
