import { useState } from 'react'
import PeteedLogo from './PeteedLogo'
import { supabase, SUPABASE_ENABLED } from './lib/supabase'

interface LoginScreenProps {
  onLogin: () => void
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#BFA99E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#BFA99E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-6.5 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [pwError, setPwError] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingConfirm, setPendingConfirm] = useState(false)

  const validate = () => {
    let ok = true
    if (!email.includes('@')) { setEmailError('올바른 이메일 주소를 입력해 주세요'); ok = false } else setEmailError('')
    if (password.length < 6) { setPwError('비밀번호를 6자 이상 입력해 주세요'); ok = false } else setPwError('')
    return ok
  }

  const submitAuth = async () => {
    if (!validate()) return
    setPwError('')
    setPendingConfirm(false)
    setLoading(true)

    if (!SUPABASE_ENABLED || !supabase) {
      // No backend configured in this environment (e.g. env vars missing) —
      // fall back to the original simulated login.
      setTimeout(() => { setLoading(false); onLogin() }, 900)
      return
    }

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        const msg = signInError.message.toLowerCase()

        if (msg.includes('email not confirmed')) {
          // Account exists but hasn't clicked the confirmation link yet.
          setLoading(false)
          setPendingConfirm(true)
          return
        }

        if (msg.includes('invalid login credentials')) {
          // Could be a brand-new email (demo convenience: first login with a
          // given email creates the account, no separate sign-up screen) OR
          // an existing account with a wrong password. Try sign-up to tell
          // the two apart.
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin },
          })
          if (signUpError) {
            if (signUpError.message.toLowerCase().includes('already registered')) {
              setLoading(false)
              setPwError('비밀번호가 올바르지 않아요')
              return
            }
            throw signUpError
          }
          setLoading(false)
          if (!signUpData.session) {
            // Email confirmation is required — Supabase just sent the link.
            setPendingConfirm(true)
          } else {
            onLogin()
          }
          return
        }

        throw signInError
      }
      setLoading(false)
      onLogin()
    } catch (err) {
      const message = err instanceof Error ? err.message.toLowerCase() : ''
      const isNetworkError = message.includes('fetch') || message.includes('network')
      console.warn('Supabase auth error:', err)
      setLoading(false)
      if (isNetworkError) {
        // Supabase itself unreachable — e.g. a Claude Artifact preview's
        // sandbox blocks calls to *.supabase.co. Fall back to demo mode
        // instead of leaving the user stuck on a spinner.
        onLogin()
      } else {
        setPwError('로그인에 실패했어요. 이메일과 비밀번호를 확인해 주세요')
      }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

        .pl-input-wrap { position:relative; width:100%; }
        .pl-input {
          width:100%; padding:13px 14px; border:1.8px solid #E8D5CE;
          border-radius:13px; font-family:'Noto Sans KR',sans-serif;
          font-size:13.5px; color:#1C1C1A; background:#fff;
          outline:none; box-sizing:border-box; transition:border-color .2s, box-shadow .2s;
        }
        .pl-input:focus { border-color:#FF6B4A; box-shadow:0 0 0 3px rgba(255,107,74,.15); }
        .pl-input.error { border-color:#F87171; }
        .pl-input::placeholder { color:#BFA99E; }
        .pl-divider { display:flex; align-items:center; gap:10px; width:100%; margin:14px 0; }
        .pl-divider-line { flex:1; height:1px; background:#F2DDD6; }
        .pl-divider-txt { font-size:11px; color:#BFA99E; font-weight:700; white-space:nowrap; }
        .social-btn { display:flex; align-items:center; gap:8px; width:100%; border:none; border-radius:13px; padding:12px 16px; cursor:pointer; }
        .login-submit-btn {
          width:100%; border:none; border-radius:14px; padding:15px;
          background:linear-gradient(135deg,#FF6B4A 0%,#E8521F 100%);
          color:#fff; cursor:pointer;
          font-family:'Noto Sans KR',sans-serif; font-weight:700; font-size:15px;
          box-shadow:0 8px 20px -6px rgba(255,107,74,.55);
          display:flex; align-items:center; justify-content:center; gap:8px;
          transition:transform .15s, box-shadow .15s;
        }
        .login-submit-btn:hover { transform:translateY(-1px); box-shadow:0 12px 24px -6px rgba(255,107,74,.6); }
        .login-submit-btn:disabled { background:#FFBDAF; box-shadow:none; cursor:default; transform:none; }
      `}</style>

      <div className="pl-device">
        <div className="pl-screen" style={{ background: '#FFF8F5' }}>
          <div className="pl-dyn-island" />

          {/* Status bar */}
          <div className="pl-status-bar" style={{ color: '#1C1C1A' }}>
            <span>9:41</span>
            <div className="icons">
              <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
                <rect x="0" y="7" width="3" height="5" rx="0.5" fill="#1C1C1A"/>
                <rect x="5" y="5" width="3" height="7" rx="0.5" fill="#1C1C1A"/>
                <rect x="10" y="2" width="3" height="10" rx="0.5" fill="#1C1C1A"/>
                <rect x="15" y="0" width="3" height="12" rx="0.5" fill="#1C1C1A"/>
              </svg>
              <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
                <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="#1C1C1A"/>
                <rect x="2" y="2" width="14" height="8" rx="1.6" fill="#1C1C1A"/>
                <rect x="22.5" y="4" width="1.5" height="4" rx="0.7" fill="#1C1C1A"/>
              </svg>
            </div>
          </div>

          {/* Scrollable content — vertically centred */}
          <div className="pl-content" style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: '18%' }}>

            {/* ── PETEED Logo ── */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: 16, animation: 'fadeUp .45s ease' }}>
              <PeteedLogo size={270} showTagline />
            </div>

            {/* ── Email / PW form, or the post-signup "check your email" state ── */}
            {pendingConfirm ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                textAlign: 'center', padding: '22px 18px', borderRadius: 16,
                background: '#FFF1EC', border: '1.5px solid #FFD9CB', animation: 'fadeUp .5s ease',
              }}>
                <span style={{ fontSize: 30 }}>📩</span>
                <p style={{ margin: 0, fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 14, color: '#1C1C1A' }}>
                  인증 메일을 보냈어요
                </p>
                <p style={{ margin: 0, fontFamily: "'Noto Sans KR',sans-serif", fontSize: 12.5, color: '#7A5C52', lineHeight: 1.6 }}>
                  <strong>{email}</strong> 주소로 인증 링크를 보냈어요.<br />
                  메일함에서 링크를 눌러 인증을 완료한 뒤 다시 로그인해 주세요.
                </p>
                <button
                  onClick={() => setPendingConfirm(false)}
                  className="login-submit-btn"
                  style={{ marginTop: 6 }}
                >
                  다시 로그인하기
                </button>
              </div>
            ) : (
              <>
                <form onSubmit={e => { e.preventDefault(); submitAuth() }} style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'fadeUp .55s ease' }}>
                  <div>
                    <div className="pl-input-wrap">
                      <input
                        className={`pl-input${emailError ? ' error' : ''}`}
                        type="email"
                        placeholder="이메일 주소"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setEmailError('') }}
                        autoComplete="email"
                      />
                      {email && (
                        <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#BFA99E', cursor: 'pointer' }}
                          onClick={() => setEmail('')}>✕</span>
                      )}
                    </div>
                    {emailError && <p style={{ fontSize: 11, color: '#E8521F', margin: '4px 4px 0', fontWeight: 700 }}>{emailError}</p>}
                  </div>

                  <div>
                    <div className="pl-input-wrap">
                      <input
                        className={`pl-input${pwError ? ' error' : ''}`}
                        type={showPw ? 'text' : 'password'}
                        placeholder="비밀번호"
                        value={password}
                        onChange={e => { setPassword(e.target.value); setPwError('') }}
                        autoComplete="current-password"
                        style={{ paddingRight: 42 }}
                      />
                      <span onClick={() => setShowPw(v => !v)}
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        {showPw ? <EyeOffIcon /> : <EyeIcon />}
                      </span>
                    </div>
                    {pwError && <p style={{ fontSize: 11, color: '#E8521F', margin: '4px 4px 0', fontWeight: 700 }}>{pwError}</p>}
                  </div>

                  <div style={{ textAlign: 'right', marginTop: -2 }}>
                    <span style={{ fontSize: 11.5, color: '#FF6B4A', fontWeight: 700, cursor: 'pointer' }}>비밀번호 찾기</span>
                  </div>

                  <button type="submit" disabled={loading} className="login-submit-btn">
                    {loading
                      ? <><span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,.35)', borderTopColor: '#fff', display: 'inline-block', animation: 'spin .7s linear infinite' }} />로그인 중…</>
                      : '로그인'
                    }
                  </button>
                </form>

                <p style={{ textAlign: 'center', fontSize: 12, color: '#BFA99E', margin: '10px 0 0', animation: 'fadeUp .6s ease' }}>
                  계정이 없으신가요?{' '}
                  <span
                    onClick={() => submitAuth()}
                    style={{ color: '#FF6B4A', fontWeight: 700, cursor: 'pointer' }}
                    title="위 이메일·비밀번호를 입력한 뒤 눌러주세요 — 처음 가입하는 이메일이면 인증 메일이 발송됩니다"
                  >
                    이메일로 회원가입
                  </span>
                </p>
              </>
            )}

            {/* Divider */}
            <div className="pl-divider" style={{ animation: 'fadeUp .65s ease' }}>
              <div className="pl-divider-line" />
              <span className="pl-divider-txt">간편 로그인 · 회원가입</span>
              <div className="pl-divider-line" />
            </div>

            {/* Social buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, animation: 'fadeUp .7s ease' }}>
              <button className="social-btn" onClick={onLogin} style={{ background: '#FEE500', boxShadow: '0 4px 12px -6px rgba(254,229,0,.55)' }}>
                <KakaoIcon />
                <span style={{ flex: 1, textAlign: 'center', fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 13.5, color: 'rgba(0,0,0,.85)', marginRight: 22 }}>카카오로 시작하기</span>
              </button>
              <button className="social-btn" onClick={onLogin} style={{ background: '#03C75A', boxShadow: '0 4px 12px -6px rgba(3,199,90,.4)' }}>
                <NaverIcon />
                <span style={{ flex: 1, textAlign: 'center', fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 13.5, color: '#fff', marginRight: 22 }}>네이버로 시작하기</span>
              </button>
              <button className="social-btn" onClick={onLogin} style={{ background: '#fff', border: '1.5px solid #F2DDD6', boxShadow: '0 4px 12px -8px rgba(0,0,0,.1)' }}>
                <GoogleIcon />
                <span style={{ flex: 1, textAlign: 'center', fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 13.5, color: '#1C1C1A', marginRight: 22 }}>구글로 시작하기</span>
              </button>
            </div>

            {/* Terms */}
            <p style={{ fontSize: 10, color: '#BFA99E', textAlign: 'center', lineHeight: 1.6, marginTop: 14, fontFamily: "'Noto Sans KR',sans-serif" }}>
              로그인 시 <span style={{ color: '#7A5C52', fontWeight: 700 }}>이용약관</span> 및{' '}
              <span style={{ color: '#7A5C52', fontWeight: 700 }}>개인정보처리방침</span>에 동의하게 됩니다
            </p>

            {/* Gov logo */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 24px' }}>
              <img
                src="https://www.gb.go.kr/Main/Images/new/ko2025/layout/logo.png"
                alt="경상북도 공식 로고"
                style={{ height: 32, objectFit: 'contain', mixBlendMode: 'multiply' }}
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
              />
            </div>
          </div>
        </div>
        <div className="pl-home-indicator" />
      </div>
      <div className="device-label">iPhone 17 Pro · 402 × 874pt viewport</div>
    </div>
  )
}


function KakaoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2C5.582 2 2 4.91 2 8.5c0 2.26 1.424 4.245 3.574 5.43L4.8 17.1a.3.3 0 0 0 .448.33L9.1 15.02c.296.026.597.04.9.04 4.418 0 8-2.91 8-6.5S14.418 2 10 2Z" fill="rgba(0,0,0,.85)"/>
    </svg>
  )
}

function NaverIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M11.4 10.34 8.16 5H5v10h3.6V9.66L11.84 15H15V5h-3.6v5.34Z" fill="white"/>
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M18.17 10.2c0-.63-.06-1.24-.16-1.83H10v3.46h4.59a3.93 3.93 0 0 1-1.7 2.58v2.14h2.74c1.6-1.48 2.54-3.65 2.54-6.35Z" fill="#4285F4"/>
      <path d="M10 18.5c2.3 0 4.23-.76 5.64-2.06l-2.74-2.14c-.77.52-1.75.82-2.9.82-2.23 0-4.12-1.51-4.79-3.53H2.38v2.2A8.5 8.5 0 0 0 10 18.5Z" fill="#34A853"/>
      <path d="M5.21 11.59A5.12 5.12 0 0 1 4.94 10c0-.55.1-1.08.27-1.59V6.21H2.38A8.5 8.5 0 0 0 1.5 10c0 1.37.33 2.67.88 3.79l2.83-2.2Z" fill="#FBBC05"/>
      <path d="M10 4.88c1.26 0 2.38.43 3.27 1.28l2.45-2.45C14.22 2.34 12.3 1.5 10 1.5A8.5 8.5 0 0 0 2.38 6.21l2.83 2.2C5.88 6.39 7.77 4.88 10 4.88Z" fill="#EA4335"/>
    </svg>
  )
}
