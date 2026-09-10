import { useCallback, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, SUPABASE_ENABLED } from './lib/supabase'
import { startNaverLink, naverLoginConfigured } from './lib/naverAuth'
import { Icons } from './icons'

type ProviderKey = 'google' | 'kakao' | 'naver'

const PROVIDER_META: Record<ProviderKey, { label: string; color: string; bg: string }> = {
  google: { label: '구글', color: '#EA4335', bg: '#FDEEED' },
  kakao: { label: '카카오', color: 'rgba(0,0,0,.72)', bg: '#FFF6D2' },
  naver: { label: '네이버', color: '#03C75A', bg: '#E7F9EF' },
}

interface Props {
  session: Session | null
  demoLoggedIn: boolean
  guardianName: string
  petName: string
  petPhoto: string
  onBack: () => void
  onEditProfile: () => void
  onLogout: () => void
}

export default function MyPageScreen({
  session, demoLoggedIn, guardianName, petName, petPhoto, onBack, onEditProfile, onLogout,
}: Props) {
  const user = session?.user
  // "Native" here means a real Supabase auth.identities row — Google/Kakao
  // (and email/password). Naver is deliberately NOT one of these (see the
  // naver-auth Edge Function) — we track it ourselves via user_metadata.
  const [nativeProviders, setNativeProviders] = useState<string[]>([])
  const [naverConnected, setNaverConnected] = useState<boolean>(Boolean(user?.user_metadata?.naver_id))
  const [busy, setBusy] = useState<ProviderKey | null>(null)
  const [message, setMessage] = useState<{ type: 'error' | 'info'; text: string } | null>(null)

  const refreshIdentities = useCallback(async () => {
    if (!supabase || !session) return
    const { data, error } = await supabase.auth.getUserIdentities()
    if (!error && data) setNativeProviders(data.identities.map(i => i.provider))
  }, [session])

  useEffect(() => { refreshIdentities() }, [refreshIdentities])
  useEffect(() => {
    setNaverConnected(Boolean(user?.user_metadata?.naver_id))
  }, [user?.user_metadata?.naver_id])

  const isConnected = (p: ProviderKey) =>
    p === 'naver' ? naverConnected : nativeProviders.includes(p)

  const connectedCount = (['google', 'kakao', 'naver'] as ProviderKey[]).filter(isConnected).length
  const currentProvider = (user?.app_metadata?.provider as string | undefined) ?? null

  const handleConnect = async (p: ProviderKey) => {
    if (!supabase || !session) return
    setMessage(null)
    setBusy(p)
    // Every path below leaves the page entirely (redirect to the provider's
    // consent screen), so we can't rely on in-memory state to bring the user
    // back to My Page afterward — App.tsx picks this flag up on the next
    // load and reopens My Page instead of landing on Home.
    sessionStorage.setItem('mypage_return_pending', '1')
    try {
      if (p === 'naver') {
        if (!naverLoginConfigured()) {
          sessionStorage.removeItem('mypage_return_pending')
          setMessage({ type: 'error', text: '네이버 로그인이 아직 이 환경에 설정되지 않았어요.' })
          setBusy(null)
          return
        }
        const { data, error } = await supabase.functions.invoke('naver-link-start')
        if (error || !data?.ticket) throw error ?? new Error('ticket 발급 실패')
        // Browser leaves for Naver's consent screen from here — on success it
        // comes back to App.tsx with ?naver_linked=1, which refreshes the
        // session and re-renders this screen automatically.
        startNaverLink(data.ticket)
        return
      }
      const { error } = await supabase.auth.linkIdentity({
        provider: p,
        options: { redirectTo: window.location.origin },
      })
      if (error) throw error
      // Browser leaves for the provider's consent screen — nothing else runs.
    } catch (err) {
      sessionStorage.removeItem('mypage_return_pending')
      console.warn(`${p} 연결 실패:`, err)
      const raw = err instanceof Error ? err.message : ''
      const text = raw.toLowerCase().includes('manual linking')
        ? `${PROVIDER_META[p].label} 연결이 아직 서버에서 활성화되지 않았어요. 관리자에게 문의해 주세요.`
        : `${PROVIDER_META[p].label} 연결에 실패했어요. 잠시 후 다시 시도해 주세요.`
      setMessage({ type: 'error', text })
      setBusy(null)
    }
  }

  const handleDisconnect = async (p: ProviderKey) => {
    if (!supabase || !session) return
    if (connectedCount <= 1) {
      setMessage({ type: 'error', text: '마지막 남은 로그인 수단은 연결을 해제할 수 없어요. 다른 계정을 먼저 연결해 주세요.' })
      return
    }
    setMessage(null)
    setBusy(p)
    try {
      if (p === 'naver') {
        const { data, error } = await supabase.functions.invoke('naver-unlink')
        if (error) throw error
        if (data?.error) throw new Error(data.error)
        setNaverConnected(false)
        await supabase.auth.refreshSession()
      } else {
        const { data } = await supabase.auth.getUserIdentities()
        const identity = data?.identities.find(i => i.provider === p)
        if (!identity) throw new Error('identity not found')
        const { error } = await supabase.auth.unlinkIdentity(identity)
        if (error) throw error
        await refreshIdentities()
      }
      setMessage({ type: 'info', text: `${PROVIDER_META[p].label} 연결을 해제했어요.` })
    } catch (err) {
      console.warn(`${p} 연결 해제 실패:`, err)
      const raw = err instanceof Error ? err.message : ''
      setMessage({
        type: 'error',
        text: raw || `${PROVIDER_META[p].label} 연결 해제에 실패했어요.`,
      })
    } finally {
      setBusy(null)
    }
  }

  const identifier = user?.email ?? (demoLoggedIn ? '데모 로그인' : '')
  const showsSyntheticEmail = Boolean(user?.email?.endsWith('@users.peteed.app'))

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 150,
      background: 'var(--paper)',
      display: 'flex', flexDirection: 'column',
      animation: 'mp-in .22s ease',
    }}>
      <style>{`
        @keyframes mp-in { from { opacity:0; transform: translateX(16px) } to { opacity:1; transform: translateX(0) } }
        @keyframes mp-spin { to { transform: rotate(360deg) } }
      `}</style>

      <div style={{ flexShrink: 0, height: 54 }} />

      <div style={{
        flexShrink: 0, padding: '4px 22px 14px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <button onClick={onBack} aria-label="뒤로" style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          border: '1px solid var(--hair)', background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--ink)',
        }}>
          {Icons.chevronLeft('currentColor')}
        </button>
        <h1 className="page-title" style={{ margin: 0, fontSize: 19 }}>마이페이지</h1>
      </div>

      <div className="pl-content" style={{ padding: '0 22px 24px' }}>
        {/* ── Current account ── */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
            background: 'var(--paper-2)', color: 'var(--gold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ transform: 'scale(1.3)' }}>{Icons.user('currentColor')}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="row-title" style={{ fontSize: 14 }}>{guardianName} 보호자님</p>
            <p className="row-sub" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {showsSyntheticEmail ? '네이버 계정 (이메일 미동의)' : identifier}
            </p>
          </div>
          {currentProvider && (
            <span className="chip" style={{
              background: PROVIDER_META[currentProvider as ProviderKey]?.bg ?? 'var(--paper-2)',
              color: PROVIDER_META[currentProvider as ProviderKey]?.color ?? 'var(--ink-70)',
            }}>
              {PROVIDER_META[currentProvider as ProviderKey]?.label ?? currentProvider} 로그인 중
            </span>
          )}
        </div>

        {/* ── Identity linking ── */}
        <div className="section-label">계정 연동</div>
        {!SUPABASE_ENABLED || !session ? (
          <div className="card">
            <p className="row-sub" style={{ margin: 0, lineHeight: 1.6 }}>
              {demoLoggedIn
                ? '지금은 데모 로그인 상태라 계정 연동은 사용할 수 없어요. 구글·카카오·네이버로 로그인하면 하나의 계정으로 통합할 수 있어요.'
                : '계정 연동을 사용할 수 없는 환경이에요.'}
            </p>
          </div>
        ) : (
          <>
            <p className="sub" style={{ margin: '0 0 12px' }}>
              구글·카카오·네이버 중 어떤 계정으로 로그인하더라도 같은 계정으로 이어져요. 여기서 계정을 추가로 연결하거나 해제할 수 있어요.
            </p>
            {(['google', 'kakao', 'naver'] as ProviderKey[]).map(p => {
              const connected = isConnected(p)
              const meta = PROVIDER_META[p]
              const isBusy = busy === p
              return (
                <div key={p} className="card">
                  <div className="row">
                    <div className="row-icon" style={{ background: meta.bg, color: meta.color, fontWeight: 800, fontSize: 13 }}>
                      {meta.label[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="row-title">{meta.label}</p>
                      <p className="row-sub">{connected ? '연결됨' : '연결 안 됨'}</p>
                    </div>
                    <button
                      onClick={() => connected ? handleDisconnect(p) : handleConnect(p)}
                      disabled={isBusy}
                      style={{
                        flexShrink: 0,
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '7px 12px', borderRadius: 20,
                        border: connected ? '1.5px solid var(--hair)' : '1.5px solid var(--gold)',
                        background: connected ? '#fff' : 'var(--gold)',
                        color: connected ? 'var(--ink-70)' : '#fff',
                        fontFamily: "'Noto Sans KR', sans-serif", fontSize: 11.5, fontWeight: 700,
                        cursor: isBusy ? 'default' : 'pointer',
                        opacity: isBusy ? 0.65 : 1,
                      }}
                    >
                      {isBusy
                        ? <span style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(0,0,0,.2)', borderTopColor: connected ? 'var(--ink-45)' : '#fff', display: 'inline-block', animation: 'mp-spin .7s linear infinite' }} />
                        : connected ? '해제' : '연결'}
                    </button>
                  </div>
                </div>
              )
            })}
            {message && (
              <p style={{
                margin: '4px 2px 0', fontSize: 11.5, fontWeight: 600, lineHeight: 1.6,
                color: message.type === 'error' ? '#C1442E' : '#3a7d4f',
              }}>
                {message.text}
              </p>
            )}
          </>
        )}

        {/* ── Pet info ── */}
        <div className="section-label">반려동물 정보</div>
        <div className="card" style={{ cursor: 'pointer' }} onClick={onEditProfile}>
          <div className="row">
            <img src={petPhoto} alt={petName} style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="row-title">{petName}</p>
              <p className="row-sub">보호자 · 반려동물 이름과 혈액형 수정</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-45)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>

        {/* ── Logout ── */}
        <button
          onClick={onLogout}
          style={{
            width: '100%', marginTop: 18, padding: '13px', borderRadius: 14,
            border: '1.5px solid var(--hair)', background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 700, fontSize: 13, color: '#C1442E',
            cursor: 'pointer',
          }}
        >
          {Icons.logout('#C1442E')}
          로그아웃
        </button>
      </div>
    </div>
  )
}
