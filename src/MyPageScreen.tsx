import { useCallback, useEffect, useRef, useState, type ChangeEvent, type ReactElement } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, SUPABASE_ENABLED } from './lib/supabase'
import { startNaverLink, naverLoginConfigured } from './lib/naverAuth'
import { uploadAvatar } from './lib/petData'
import { Icons } from './icons'
import { GoogleIcon, KakaoIcon, NaverIcon } from './components/ProviderIcons'
import { DEFAULT_AVATAR } from './assets/defaultAvatar'

const MAX_AVATAR_BYTES = 8 * 1024 * 1024

type ProviderKey = 'google' | 'kakao' | 'naver'

const PROVIDER_META: Record<ProviderKey, { label: string; color: string; chipBg: string; rowBg: string; rowBorder?: string; icon: () => ReactElement }> = {
  google: { label: '구글', color: '#EA4335', chipBg: '#FDEEED', rowBg: '#fff', rowBorder: '1.5px solid #E5E7EB', icon: GoogleIcon },
  kakao: { label: '카카오', color: 'rgba(0,0,0,.72)', chipBg: '#FFF6D2', rowBg: '#FEE500', icon: KakaoIcon },
  naver: { label: '네이버', color: '#03C75A', chipBg: '#E7F9EF', rowBg: '#03C75A', icon: NaverIcon },
}

interface Props {
  session: Session | null
  demoLoggedIn: boolean
  guardianName: string
  petName: string
  petPhoto: string
  avatarUrl: string
  onAvatarChange: (url: string) => void
  onBack: () => void
  onEditProfile: () => void
  onEditPersonalInfo: () => void
  onLogout: () => void
}

export default function MyPageScreen({
  session, demoLoggedIn, guardianName, petName, petPhoto, avatarUrl, onAvatarChange, onBack, onEditProfile, onEditPersonalInfo, onLogout,
}: Props) {
  const user = session?.user
  const [avatarBusy, setAvatarBusy] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const avatarInputRef = useRef<HTMLInputElement | null>(null)
  // "Native" here means a real Supabase auth.identities row — Google/Kakao
  // (and email/password). Naver is deliberately NOT one of these (see the
  // naver-auth Edge Function) — we track it ourselves via user_metadata.
  const [nativeProviders, setNativeProviders] = useState<string[]>([])
  const [naverConnected, setNaverConnected] = useState<boolean>(Boolean(user?.user_metadata?.naver_id))
  const [busy, setBusy] = useState<ProviderKey | null>(null)
  const [message, setMessage] = useState<{ type: 'error' | 'info'; text: string } | null>(null)
  const [highlighted, setHighlighted] = useState<ProviderKey | null>(null)
  const providerRowRefs = useRef<Record<ProviderKey, HTMLDivElement | null>>({ google: null, kakao: null, naver: null })
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const refreshIdentities = useCallback(async () => {
    if (!supabase || !session) return
    const { data, error } = await supabase.auth.getUserIdentities()
    if (!error && data) setNativeProviders(data.identities.map(i => i.provider))
  }, [session])

  useEffect(() => { refreshIdentities() }, [refreshIdentities])
  useEffect(() => {
    setNaverConnected(Boolean(user?.user_metadata?.naver_id))
  }, [user?.user_metadata?.naver_id])

  useEffect(() => () => {
    if (highlightTimer.current) clearTimeout(highlightTimer.current)
  }, [])

  const isConnected = (p: ProviderKey) =>
    p === 'naver' ? naverConnected : nativeProviders.includes(p)

  const connectedCount = (['google', 'kakao', 'naver'] as ProviderKey[]).filter(isConnected).length
  const currentProvider = (user?.app_metadata?.provider as string | undefined) ?? null

  const jumpToProvider = (p: ProviderKey) => {
    const el = providerRowRefs.current[p]
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setHighlighted(p)
    if (highlightTimer.current) clearTimeout(highlightTimer.current)
    highlightTimer.current = setTimeout(() => setHighlighted(null), 1600)
  }

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

  const handleAvatarFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file) return
    setAvatarError('')

    if (!file.type.startsWith('image/')) {
      setAvatarError('이미지 파일만 업로드할 수 있어요.')
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError('파일 크기가 너무 커요. 8MB 이하의 이미지를 선택해 주세요.')
      return
    }

    if (!SUPABASE_ENABLED || !supabase || !user) {
      // Demo mode (or Supabase unreachable) — nothing to persist to, but
      // still preview the chosen photo locally so the button doesn't feel
      // broken.
      onAvatarChange(URL.createObjectURL(file))
      setAvatarError(demoLoggedIn ? '데모 로그인 상태에서는 사진이 저장되지 않아요.' : '')
      return
    }

    setAvatarBusy(true)
    try {
      const url = await uploadAvatar(user.id, file)
      onAvatarChange(url)
    } catch (err) {
      console.warn('프로필 사진 업로드 실패:', err)
      setAvatarError('프로필 사진 업로드에 실패했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setAvatarBusy(false)
    }
  }

  const identifier = user?.email ?? (demoLoggedIn ? '데모 로그인' : '')
  const showsSyntheticEmail = Boolean(user?.email?.endsWith('@users.peteed.app'))
  const canJumpToProvider = SUPABASE_ENABLED && Boolean(session) && currentProvider && (currentProvider in PROVIDER_META)

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
        @keyframes mp-highlight {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,107,74,0); }
          20%, 60% { box-shadow: 0 0 0 3px rgba(255,107,74,.45); }
        }
        .mp-row-highlight { animation: mp-highlight 1.6s ease; border-radius: 16px; }
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
        {/* ── Current account → opens personal info edit ── */}
        <div
          className="card"
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
          onClick={onEditPersonalInfo}
        >
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 46, height: 46, borderRadius: '50%', overflow: 'hidden',
              background: 'var(--paper-2)', color: 'var(--gold)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img
                src={avatarUrl}
                alt=""
                onError={e => { (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <button
              onClick={e => { e.stopPropagation(); if (!avatarBusy) avatarInputRef.current?.click() }}
              disabled={avatarBusy}
              aria-label="프로필 사진 변경"
              style={{
                position: 'absolute', right: -2, bottom: -2,
                width: 20, height: 20, borderRadius: '50%', padding: 0,
                border: '2px solid #fff', background: 'var(--gold)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: avatarBusy ? 'default' : 'pointer',
              }}
            >
              {avatarBusy
                ? <span style={{ width: 9, height: 9, borderRadius: '50%', border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', display: 'inline-block', animation: 'mp-spin .7s linear infinite' }} />
                : (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="3.5"/>
                  </svg>
                )}
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarFileChange}
              onClick={e => e.stopPropagation()}
              style={{ display: 'none' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="row-title" style={{ fontSize: 14 }}>{guardianName} 보호자님</p>
            <p className="row-sub" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {showsSyntheticEmail ? '네이버 계정 (이메일 미동의)' : identifier}
            </p>
          </div>
          {currentProvider && (
            <span
              className="chip"
              onClick={e => {
                if (!canJumpToProvider) return
                e.stopPropagation()
                jumpToProvider(currentProvider as ProviderKey)
              }}
              style={{
                background: PROVIDER_META[currentProvider as ProviderKey]?.chipBg ?? 'var(--paper-2)',
                color: PROVIDER_META[currentProvider as ProviderKey]?.color ?? 'var(--ink-70)',
                cursor: canJumpToProvider ? 'pointer' : 'default',
              }}
            >
              {PROVIDER_META[currentProvider as ProviderKey]?.label ?? currentProvider} 로그인 중
            </span>
          )}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-45)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
        {avatarError && (
          <p style={{ margin: '4px 2px 0', fontSize: 11.5, fontWeight: 600, lineHeight: 1.6, color: '#C1442E' }}>
            {avatarError}
          </p>
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
              const Icon = meta.icon
              return (
                <div
                  key={p}
                  ref={el => { providerRowRefs.current[p] = el }}
                  className={`card${highlighted === p ? ' mp-row-highlight' : ''}`}
                >
                  <div className="row">
                    <div style={{
                      width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                      background: meta.rowBg, border: meta.rowBorder,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon />
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
