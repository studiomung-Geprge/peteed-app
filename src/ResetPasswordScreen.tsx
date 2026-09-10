import { useState } from 'react'
import PeteedLogo from './PeteedLogo'
import { supabase } from './lib/supabase'

interface ResetPasswordScreenProps {
  onDone: () => void
}

// Shown instead of the normal app when the user arrives via the link from
// ForgotPasswordModal's reset email. Supabase already set a temporary
// "recovery" session on the way in (App.tsx detects that and renders this
// screen) — updateUser({ password }) below uses that session to actually
// change the password, no old password required.
export default function ResetPasswordScreen({ onDone }: ResetPasswordScreenProps) {
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [pwError, setPwError] = useState('')
  const [pw2Error, setPw2Error] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async () => {
    let ok = true
    if (password.length < 6) { setPwError('비밀번호를 6자 이상 입력해 주세요'); ok = false } else setPwError('')
    if (password2 !== password) { setPw2Error('비밀번호가 일치하지 않아요'); ok = false } else setPw2Error('')
    if (!ok) return

    if (!supabase) { setDone(true); return }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        console.warn('비밀번호 변경 실패:', error)
        setPwError('비밀번호를 변경하지 못했어요. 잠시 후 다시 시도해 주세요.')
        setLoading(false)
        return
      }
      setLoading(false)
      setDone(true)
    } catch (err) {
      console.warn('비밀번호 변경 오류:', err)
      setPwError('비밀번호를 변경하지 못했어요. 잠시 후 다시 시도해 주세요.')
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to { transform: rotate(360deg) } }
        .rp-input-wrap { position:relative; width:100%; }
        .rp-input {
          width:100%; padding:13px 14px; border:1.8px solid #E8D5CE;
          border-radius:13px; font-family:'Noto Sans KR',sans-serif;
          font-size:16px; color:#1C1C1A; background:#fff;
          outline:none; box-sizing:border-box; transition:border-color .2s, box-shadow .2s;
        }
        .rp-input:focus { border-color:#FF6B4A; box-shadow:0 0 0 3px rgba(255,107,74,.15); }
        .rp-input.error { border-color:#F87171; }
        .rp-input::placeholder { color:#BFA99E; }
        .rp-submit-btn {
          width:100%; border:none; border-radius:14px; padding:15px;
          background:linear-gradient(135deg,#FF6B4A 0%,#E8521F 100%);
          color:#fff; cursor:pointer;
          font-family:'Noto Sans KR',sans-serif; font-weight:700; font-size:15px;
          box-shadow:0 8px 20px -6px rgba(255,107,74,.55);
          display:flex; align-items:center; justify-content:center; gap:8px;
          transition:transform .15s, box-shadow .15s;
        }
        .rp-submit-btn:disabled { background:#FFBDAF; box-shadow:none; cursor:default; transform:none; }
      `}</style>

      <div className="pl-device">
        <div className="pl-screen" style={{ background: '#FFF8F5' }}>
          <div className="pl-dyn-island" />

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

          <div className="pl-content" style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: '5%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: 8, animation: 'fadeUp .45s ease' }}>
              <PeteedLogo size={230} showTagline />
            </div>

            {done ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                textAlign: 'center', padding: '22px 18px', borderRadius: 16,
                background: '#FFF1EC', border: '1.5px solid #FFD9CB', animation: 'fadeUp .5s ease',
              }}>
                <span style={{ fontSize: 30 }}>✅</span>
                <p style={{ margin: 0, fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 14, color: '#1C1C1A' }}>
                  비밀번호가 변경됐어요
                </p>
                <p style={{ margin: 0, fontFamily: "'Noto Sans KR',sans-serif", fontSize: 12.5, color: '#7A5C52', lineHeight: 1.6 }}>
                  새 비밀번호로 계속 이용하실 수 있어요.
                </p>
                <button onClick={onDone} className="rp-submit-btn" style={{ marginTop: 6 }}>
                  계속하기
                </button>
              </div>
            ) : (
              <>
                <p style={{
                  textAlign: 'center', margin: '0 0 4px', animation: 'fadeUp .5s ease',
                  fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 900, fontSize: 17, color: '#1C1C1A',
                }}>
                  새 비밀번호 설정
                </p>
                <p style={{
                  textAlign: 'center', margin: '0 0 16px',
                  fontFamily: "'Noto Sans KR',sans-serif", fontSize: 12, color: '#BFA99E',
                }}>
                  계정에 사용할 새 비밀번호를 입력해 주세요
                </p>

                <form onSubmit={e => { e.preventDefault(); submit() }} style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'fadeUp .55s ease' }}>
                  <div>
                    <div className="rp-input-wrap">
                      <input
                        className={`rp-input${pwError ? ' error' : ''}`}
                        type="password"
                        placeholder="새 비밀번호 (6자 이상)"
                        value={password}
                        onChange={e => { setPassword(e.target.value); setPwError('') }}
                        autoComplete="new-password"
                        autoFocus
                      />
                    </div>
                    {pwError && <p style={{ fontSize: 11, color: '#E8521F', margin: '4px 4px 0', fontWeight: 700 }}>{pwError}</p>}
                  </div>

                  <div>
                    <div className="rp-input-wrap">
                      <input
                        className={`rp-input${pw2Error ? ' error' : ''}`}
                        type="password"
                        placeholder="새 비밀번호 확인"
                        value={password2}
                        onChange={e => { setPassword2(e.target.value); setPw2Error('') }}
                        autoComplete="new-password"
                      />
                    </div>
                    {pw2Error && <p style={{ fontSize: 11, color: '#E8521F', margin: '4px 4px 0', fontWeight: 700 }}>{pw2Error}</p>}
                  </div>

                  <button type="submit" disabled={loading} className="rp-submit-btn">
                    {loading
                      ? <><span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,.35)', borderTopColor: '#fff', display: 'inline-block', animation: 'spin .7s linear infinite' }} />변경 중…</>
                      : '비밀번호 변경하기'
                    }
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
        <div className="pl-home-indicator" />
      </div>
      <div className="device-label">iPhone 17 Pro · 402 × 874pt viewport</div>
    </div>
  )
}
