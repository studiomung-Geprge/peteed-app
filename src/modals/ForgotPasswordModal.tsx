import { useState } from 'react'
import { supabase, SUPABASE_ENABLED } from '../lib/supabase'

interface Props {
  initialEmail: string
  onClose: () => void
}

// LoginScreen's "비밀번호 찾기" link opens this — asks for the account email
// and sends it Supabase's own password-reset link. The actual "set a new
// password" step happens on ResetPasswordScreen after the user clicks that
// link and lands back in the app with a recovery session.
export default function ForgotPasswordModal({ initialEmail, onClose }: Props) {
  const [email, setEmail] = useState(initialEmail)
  const [emailError, setEmailError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async () => {
    if (!email.includes('@')) { setEmailError('올바른 이메일 주소를 입력해 주세요'); return }
    setEmailError('')

    if (!SUPABASE_ENABLED || !supabase) {
      // Demo/offline environment — there's no real account to reset.
      setEmailError('지금 환경에서는 비밀번호 재설정을 사용할 수 없어요.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      })
      if (error) {
        console.warn('비밀번호 재설정 요청 실패:', error)
        const msg = error.message.toLowerCase()
        setEmailError(
          msg.includes('security') || msg.includes('seconds') || msg.includes('rate')
            ? '요청이 너무 잦아요. 잠시 후 다시 시도해 주세요.'
            : '재설정 메일을 보내지 못했어요. 잠시 후 다시 시도해 주세요.'
        )
        setLoading(false)
        return
      }
      // Supabase doesn't reveal whether the email actually has an account
      // (to avoid leaking which emails are registered), so this same
      // success state shows either way — matching the login screen's own
      // email-obfuscation handling.
      setSent(true)
      setLoading(false)
    } catch (err) {
      console.warn('비밀번호 재설정 요청 오류:', err)
      setEmailError('재설정 메일을 보내지 못했어요. 잠시 후 다시 시도해 주세요.')
      setLoading(false)
    }
  }

  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 220,
      background: 'rgba(10,16,30,.78)',
      backdropFilter: 'blur(10px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '0 24px',
      animation: 'fadeIn .2s ease',
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:scale(.94) } to { opacity:1; transform:scale(1) } }
        @keyframes spin { to { transform: rotate(360deg) } }
        .fpw-input-wrap { position:relative; width:100%; }
        .fpw-input {
          width:100%; padding:13px 14px; border:1.8px solid #E8D5CE;
          border-radius:13px; font-family:'Noto Sans KR',sans-serif;
          font-size:16px; color:#1C1C1A; background:#fff;
          outline:none; box-sizing:border-box; transition:border-color .2s, box-shadow .2s;
        }
        .fpw-input:focus { border-color:#FF6B4A; box-shadow:0 0 0 3px rgba(255,107,74,.15); }
        .fpw-input.error { border-color:#F87171; }
        .fpw-input::placeholder { color:#BFA99E; }
      `}</style>

      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 320,
        background: '#FFFAF7',
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 24px 56px -16px rgba(0,0,0,.5)',
      }}>
        <div style={{
          background: 'linear-gradient(135deg,#FF6B4A 0%,#E8521F 100%)',
          padding: '20px 20px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 16, fontFamily: "'Noto Sans KR', sans-serif" }}>비밀번호 찾기</div>
            <div style={{ color: 'rgba(255,255,255,.8)', fontSize: 11, marginTop: 2 }}>가입한 이메일로 재설정 링크를 보내드려요</div>
          </div>
          <button onClick={onClose} style={{
            width: 26, height: 26, borderRadius: '50%',
            background: 'rgba(255,255,255,.2)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {sent ? (
          <div style={{ padding: '26px 20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
            <span style={{ fontSize: 30 }}>📩</span>
            <p style={{ margin: 0, fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 14, color: '#1C1C1A' }}>
              메일을 확인해 주세요
            </p>
            <p style={{ margin: 0, fontFamily: "'Noto Sans KR',sans-serif", fontSize: 12.5, color: '#7A5C52', lineHeight: 1.6 }}>
              <strong>{email}</strong> 주소로 비밀번호 재설정 링크를 보냈어요.<br />
              메일함(스팸함 포함)에서 링크를 눌러 새 비밀번호를 설정해 주세요.
            </p>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '100%', border: 'none', borderRadius: 14, padding: 14, marginTop: 6,
                background: 'linear-gradient(135deg,#FF6B4A 0%,#E8521F 100%)',
                color: '#fff', cursor: 'pointer',
                fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 14,
              }}
            >
              확인
            </button>
          </div>
        ) : (
          <form
            onSubmit={e => { e.preventDefault(); submit() }}
            style={{ padding: '20px 20px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <div>
              <label style={{ display: 'block', margin: '0 0 6px 2px', fontFamily: "'Noto Sans KR',sans-serif", fontSize: 11.5, fontWeight: 700, color: '#7A5C52' }}>
                가입한 이메일 주소
              </label>
              <div className="fpw-input-wrap">
                <input
                  className={`fpw-input${emailError ? ' error' : ''}`}
                  type="email"
                  placeholder="이메일 주소"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setEmailError('') }}
                  autoComplete="email"
                  autoFocus
                />
              </div>
              {emailError && <p style={{ fontSize: 11, color: '#E8521F', margin: '4px 4px 0', fontWeight: 700 }}>{emailError}</p>}
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', border: 'none', borderRadius: 14, padding: 15, marginTop: 4,
              background: 'linear-gradient(135deg,#FF6B4A 0%,#E8521F 100%)',
              color: '#fff', cursor: loading ? 'default' : 'pointer',
              fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: loading ? 0.7 : 1,
            }}>
              {loading
                ? <><span style={{ width: 15, height: 15, borderRadius: '50%', border: '2px solid rgba(255,255,255,.35)', borderTopColor: '#fff', display: 'inline-block', animation: 'spin .7s linear infinite' }} />보내는 중…</>
                : '재설정 링크 보내기'
              }
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
