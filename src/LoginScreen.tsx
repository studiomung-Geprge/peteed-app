import { useState } from 'react'
import PeteedLogo from './PeteedLogo'
import { supabase, SUPABASE_ENABLED } from './lib/supabase'
import { startNaverLogin } from './lib/naverAuth'
import { GoogleIcon, KakaoIcon, NaverIcon } from './components/ProviderIcons'
import ForgotPasswordModal from './modals/ForgotPasswordModal'

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
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [pwError, setPwError] = useState('')
  const [pw2Error, setPw2Error] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingConfirm, setPendingConfirm] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const switchMode = (next: 'login' | 'signup') => {
    setMode(next)
    setEmailError('')
    setPwError('')
    setPw2Error('')
    setPendingConfirm(false)
  }

  const validate = () => {
    let ok = true
    if (!email.includes('@')) { setEmailError('올바른 이메일 주소를 입력해 주세요'); ok = false } else setEmailError('')
    if (password.length < 6) { setPwError('비밀번호를 6자 이상 입력해 주세요'); ok = false } else setPwError('')
    if (mode === 'signup') {
      if (password2 !== password) { setPw2Error('비밀번호가 일치하지 않아요'); ok = false } else setPw2Error('')
    }
    return ok
  }

  const submitAuth = async () => {
    if (!validate()) return
    setLoading(true)

    if (!SUPABASE_ENABLED || !supabase) {
      // No backend configured in this environment (e.g. env vars missing) —
      // fall back to the original simulated login.
      setTimeout(() => { setLoading(false); onLogin() }, 900)
      return
    }

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        })
        if (error) {
          const msg = error.message.toLowerCase()
          if (msg.includes('already registered') || msg.includes('already exists')) {
            setLoading(false)
            setEmailError('이미 가입된 이메일이에요. 로그인해 주세요')
            return
          }
          throw error
        }
        // Supabase deliberately does NOT return an error when the email is
        // already registered — to avoid leaking which emails exist, it
        // returns a fake "success" with no session and a user whose
        // identities array is empty (no confirmation email is actually
        // sent). A genuinely new signup's user always has at least one
        // identity, so an empty array is the documented way to tell the
        // two apart client-side — without this, the screen shows "인증
        // 메일을 보냈어요" for an email that was never sent anything.
        if (data.user && data.user.identities?.length === 0) {
          setLoading(false)
          setEmailError('이미 가입된 이메일이에요. 로그인해 주세요')
          return
        }
        setLoading(false)
        if (!data.session) {
          // Email confirmation is required — Supabase just sent the link.
          setPendingConfirm(true)
        } else {
          onLogin()
        }
        return
      }

      // mode === 'login'
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        const msg = error.message.toLowerCase()
        if (msg.includes('email not confirmed')) {
          // Account exists but hasn't clicked the confirmation link yet.
          setLoading(false)
          setPendingConfirm(true)
          return
        }
        setLoading(false)
        setPwError('이메일 또는 비밀번호가 올바르지 않아요')
        return
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
        setPwError(mode === 'signup'
          ? '회원가입에 실패했어요. 잠시 후 다시 시도해 주세요'
          : '로그인에 실패했어요. 이메일과 비밀번호를 확인해 주세요')
      }
    }
  }

  const handleGoogleLogin = async () => {
    if (!SUPABASE_ENABLED || !supabase) {
      // No backend configured — keep the original simulated flow.
      onLogin()
      return
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      })
      if (error) {
        // e.g. the Google provider isn't enabled in the Supabase dashboard yet.
        console.warn('Google OAuth error:', error)
        onLogin()
      }
      // On success the browser navigates away to Google, so nothing else
      // needs to run here — App.tsx picks up the session via onAuthStateChange
      // once the user is redirected back.
    } catch (err) {
      console.warn('Google OAuth exception:', err)
      onLogin()
    }
  }

  const handleKakaoLogin = async () => {
    if (!SUPABASE_ENABLED || !supabase) {
      // No backend configured — keep the original simulated flow.
      onLogin()
      return
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: { redirectTo: window.location.origin },
      })
      if (error) {
        // e.g. the Kakao provider isn't enabled in the Supabase dashboard yet.
        console.warn('Kakao OAuth error:', error)
        onLogin()
      }
      // On success the browser navigates away to Kakao, so nothing else
      // needs to run here — App.tsx picks up the session via onAuthStateChange
      // once the user is redirected back.
    } catch (err) {
      console.warn('Kakao OAuth exception:', err)
      onLogin()
    }
  }

  const handleNaverLogin = () => {
    if (!SUPABASE_ENABLED || !supabase) {
      // No backend configured — keep the original simulated flow.
      onLogin()
      return
    }

    // Naver isn't a built-in Supabase Auth provider (unlike Google/Kakao), so
    // this app talks to it directly: redirect to Naver's own consent screen,
    // and our `naver-auth` Supabase Edge Function (registered as Naver's
    // 콜백 URL) exchanges the code and hands a session back to App.tsx.
    const started = startNaverLogin()
    if (!started) {
      console.warn('Naver login: VITE_NAVER_CLIENT_ID이 설정되지 않았어요.')
      onLogin()
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
          /* 16px avoids iOS Safari's auto-zoom-on-focus behavior, which
             kicks in for any focused input/textarea below that size. */
          font-size:16px; color:#1C1C1A; background:#fff;
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
          {showForgotPassword && (
            <ForgotPasswordModal initialEmail={email} onClose={() => setShowForgotPassword(false)} />
          )}
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
          <div className="pl-content" style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: '5%' }}>

            {/* ── PETEED Logo ── */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: 8, animation: 'fadeUp .45s ease' }}>
              <PeteedLogo size={230} showTagline />
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
                  onClick={() => switchMode('login')}
                  className="login-submit-btn"
                  style={{ marginTop: 6 }}
                >
                  다시 로그인하기
                </button>
              </div>
            ) : (
              <>
                {/* Mode heading */}
                <p style={{
                  textAlign: 'center', margin: '0 0 8px', animation: 'fadeUp .5s ease',
                  fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 900, fontSize: 17, color: '#1C1C1A',
                }}>
                  {mode === 'login' ? '로그인' : '이메일로 회원가입'}
                </p>

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
                        placeholder={mode === 'login' ? '비밀번호' : '비밀번호 (6자 이상)'}
                        value={password}
                        onChange={e => { setPassword(e.target.value); setPwError('') }}
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        style={{ paddingRight: 42 }}
                      />
                      <span onClick={() => setShowPw(v => !v)}
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        {showPw ? <EyeOffIcon /> : <EyeIcon />}
                      </span>
                    </div>
                    {pwError && <p style={{ fontSize: 11, color: '#E8521F', margin: '4px 4px 0', fontWeight: 700 }}>{pwError}</p>}
                  </div>

                  {mode === 'signup' && (
                    <div>
                      <div className="pl-input-wrap">
                        <input
                          className={`pl-input${pw2Error ? ' error' : ''}`}
                          type={showPw ? 'text' : 'password'}
                          placeholder="비밀번호 확인"
                          value={password2}
                          onChange={e => { setPassword2(e.target.value); setPw2Error('') }}
                          autoComplete="new-password"
                        />
                      </div>
                      {pw2Error && <p style={{ fontSize: 11, color: '#E8521F', margin: '4px 4px 0', fontWeight: 700 }}>{pw2Error}</p>}
                    </div>
                  )}

                  {mode === 'login' && (
                    <div style={{ textAlign: 'right', marginTop: -2 }}>
                      <span
                        onClick={() => setShowForgotPassword(true)}
                        style={{ fontSize: 11.5, color: '#FF6B4A', fontWeight: 700, cursor: 'pointer' }}
                      >
                        비밀번호 찾기
                      </span>
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="login-submit-btn">
                    {loading
                      ? <><span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,.35)', borderTopColor: '#fff', display: 'inline-block', animation: 'spin .7s linear infinite' }} />{mode === 'login' ? '로그인 중…' : '가입 중…'}</>
                      : (mode === 'login' ? '로그인' : '가입하기')
                    }
                  </button>
                </form>

                <p style={{ textAlign: 'center', fontSize: 12, color: '#BFA99E', margin: '10px 0 0', animation: 'fadeUp .6s ease' }}>
                  {mode === 'login' ? (
                    <>
                      계정이 없으신가요?{' '}
                      <span
                        onClick={() => switchMode('signup')}
                        style={{ color: '#FF6B4A', fontWeight: 700, cursor: 'pointer' }}
                      >
                        이메일로 회원가입
                      </span>
                    </>
                  ) : (
                    <>
                      이미 계정이 있으신가요?{' '}
                      <span
                        onClick={() => switchMode('login')}
                        style={{ color: '#FF6B4A', fontWeight: 700, cursor: 'pointer' }}
                      >
                        로그인
                      </span>
                    </>
                  )}
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
              <button className="social-btn" onClick={handleGoogleLogin} style={{ background: '#fff', border: '1.5px solid #F2DDD6', boxShadow: '0 4px 12px -8px rgba(0,0,0,.1)' }}>
                <GoogleIcon />
                <span style={{ flex: 1, textAlign: 'center', fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 13.5, color: '#1C1C1A', marginRight: 22 }}>구글로 시작하기</span>
              </button>
              <button className="social-btn" onClick={handleKakaoLogin} style={{ background: '#FEE500', boxShadow: '0 4px 12px -6px rgba(254,229,0,.55)' }}>
                <KakaoIcon />
                <span style={{ flex: 1, textAlign: 'center', fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 13.5, color: 'rgba(0,0,0,.85)', marginRight: 22 }}>카카오로 시작하기</span>
              </button>
              <button className="social-btn" onClick={handleNaverLogin} style={{ background: '#03C75A', boxShadow: '0 4px 12px -6px rgba(3,199,90,.4)' }}>
                <NaverIcon />
                <span style={{ flex: 1, textAlign: 'center', fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 13.5, color: '#fff', marginRight: 22 }}>네이버로 시작하기</span>
              </button>
            </div>

            {/* Terms */}
            <p style={{ fontSize: 10, color: '#BFA99E', textAlign: 'center', lineHeight: 1.6, marginTop: 10, fontFamily: "'Noto Sans KR',sans-serif" }}>
              로그인 시 <span style={{ color: '#7A5C52', fontWeight: 700 }}>이용약관</span> 및{' '}
              <span style={{ color: '#7A5C52', fontWeight: 700 }}>개인정보처리방침</span>에 동의하게 됩니다
            </p>

            {/* Gov logo */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 16px' }}>
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
