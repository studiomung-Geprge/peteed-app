// Shared helpers for talking to Naver's OAuth authorize endpoint. Naver
// isn't a native Supabase Auth provider, so both places in the app that
// start a Naver hand-off (the login button in LoginScreen, and the
// "네이버 연결" button in My Page) build the same kind of URL — they just
// differ in what they pass as `state` and what they store beforehand:
//
//   - LOGIN (startNaverLogin): `state` is a random CSRF token we stash in
//     sessionStorage and re-check when the browser comes back.
//   - LINK (startNaverLink): `state` is a one-time ticket id that the
//     naver-link-start Edge Function minted for the *currently signed-in*
//     user. naver-auth recognizes a ticket id and attaches the Naver
//     account to that user instead of starting a fresh login.
export function naverLoginConfigured(): boolean {
  return Boolean(
    (import.meta.env.VITE_NAVER_CLIENT_ID as string | undefined) &&
    (import.meta.env.VITE_SUPABASE_URL as string | undefined)
  )
}

function buildNaverAuthorizeUrl(state: string): string | null {
  const clientId = import.meta.env.VITE_NAVER_CLIENT_ID as string | undefined
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
  if (!clientId || !supabaseUrl) return null

  const redirectUri = `${supabaseUrl}/functions/v1/naver-auth`
  const authorizeUrl = new URL('https://nid.naver.com/oauth2.0/authorize')
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('client_id', clientId)
  authorizeUrl.searchParams.set('redirect_uri', redirectUri)
  authorizeUrl.searchParams.set('state', state)
  return authorizeUrl.toString()
}

/** Redirects the browser to Naver for a normal login. Returns false (and does
 * nothing) if Naver login isn't configured in this environment. */
export function startNaverLogin(): boolean {
  const state = crypto.randomUUID()
  const url = buildNaverAuthorizeUrl(state)
  if (!url) return false
  sessionStorage.setItem('naver_oauth_state', state)
  window.location.href = url
  return true
}

/** Redirects the browser to Naver to link it to the already-signed-in user,
 * using a server-issued ticket id (from naver-link-start) as `state`. */
export function startNaverLink(ticket: string): boolean {
  const url = buildNaverAuthorizeUrl(ticket)
  if (!url) return false
  window.location.href = url
  return true
}
