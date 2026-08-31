import { useState } from 'react'
import PeteedLogo from './PeteedLogo'

interface OnboardingScreenProps {
  onComplete: (guardianName: string, petName: string) => void | Promise<void>
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [guardianName, setGuardianName] = useState('')
  const [petName, setPetName] = useState('')
  const [guardianError, setGuardianError] = useState('')
  const [petError, setPetError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    let ok = true
    if (!guardianName.trim()) { setGuardianError('보호자 이름을 입력해 주세요'); ok = false } else setGuardianError('')
    if (!petName.trim()) { setPetError('반려동물 이름을 입력해 주세요'); ok = false } else setPetError('')
    if (!ok) return

    setLoading(true)
    try {
      await onComplete(guardianName.trim(), petName.trim())
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to { transform: rotate(360deg) } }
        .ob-input-wrap { position:relative; width:100%; }
        .ob-input {
          width:100%; padding:13px 14px; border:1.8px solid #E8D5CE;
          border-radius:13px; font-family:'Noto Sans KR',sans-serif;
          font-size:13.5px; color:#1C1C1A; background:#fff;
          outline:none; box-sizing:border-box; transition:border-color .2s, box-shadow .2s;
        }
        .ob-input:focus { border-color:#FF6B4A; box-shadow:0 0 0 3px rgba(255,107,74,.15); }
        .ob-input.error { border-color:#F87171; }
        .ob-input::placeholder { color:#BFA99E; }
        .ob-submit-btn {
          width:100%; border:none; border-radius:14px; padding:15px;
          background:linear-gradient(135deg,#FF6B4A 0%,#E8521F 100%);
          color:#fff; cursor:pointer;
          font-family:'Noto Sans KR',sans-serif; font-weight:700; font-size:15px;
          box-shadow:0 8px 20px -6px rgba(255,107,74,.55);
          display:flex; align-items:center; justify-content:center; gap:8px;
          transition:transform .15s, box-shadow .15s;
        }
        .ob-submit-btn:hover { transform:translateY(-1px); box-shadow:0 12px 24px -6px rgba(255,107,74,.6); }
        .ob-submit-btn:disabled { background:#FFBDAF; box-shadow:none; cursor:default; transform:none; }
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

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: 14, animation: 'fadeUp .45s ease' }}>
              <PeteedLogo size={140} />
            </div>

            <p style={{
              textAlign: 'center', margin: '0 0 4px', animation: 'fadeUp .5s ease',
              fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 900, fontSize: 18, color: '#1C1C1A',
            }}>
              반가워요! 👋
            </p>
            <p style={{
              textAlign: 'center', margin: '0 0 22px', animation: 'fadeUp .5s ease',
              fontFamily: "'Noto Sans KR',sans-serif", fontSize: 12.5, color: '#7A5C52', lineHeight: 1.5,
            }}>
              PETEED 디지털 신분증을 만들기 전에<br />보호자님과 반려동물 이름을 알려주세요
            </p>

            <form onSubmit={e => { e.preventDefault(); submit() }} style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'fadeUp .55s ease' }}>
              <div>
                <label style={{ display: 'block', margin: '0 0 6px 2px', fontFamily: "'Noto Sans KR',sans-serif", fontSize: 11.5, fontWeight: 700, color: '#7A5C52' }}>
                  보호자 이름
                </label>
                <div className="ob-input-wrap">
                  <input
                    className={`ob-input${guardianError ? ' error' : ''}`}
                    type="text"
                    placeholder="예: 홍길동"
                    value={guardianName}
                    onChange={e => { setGuardianName(e.target.value); setGuardianError('') }}
                    autoComplete="name"
                  />
                </div>
                {guardianError && <p style={{ fontSize: 11, color: '#E8521F', margin: '4px 4px 0', fontWeight: 700 }}>{guardianError}</p>}
              </div>

              <div>
                <label style={{ display: 'block', margin: '0 0 6px 2px', fontFamily: "'Noto Sans KR',sans-serif", fontSize: 11.5, fontWeight: 700, color: '#7A5C52' }}>
                  반려동물 이름
                </label>
                <div className="ob-input-wrap">
                  <input
                    className={`ob-input${petError ? ' error' : ''}`}
                    type="text"
                    placeholder="예: 초코"
                    value={petName}
                    onChange={e => { setPetName(e.target.value); setPetError('') }}
                    autoComplete="off"
                  />
                </div>
                {petError && <p style={{ fontSize: 11, color: '#E8521F', margin: '4px 4px 0', fontWeight: 700 }}>{petError}</p>}
              </div>

              <button type="submit" disabled={loading} className="ob-submit-btn" style={{ marginTop: 6 }}>
                {loading
                  ? <><span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,.35)', borderTopColor: '#fff', display: 'inline-block', animation: 'spin .7s linear infinite' }} />신분증 만드는 중…</>
                  : '시작하기'
                }
              </button>
            </form>
          </div>
        </div>
        <div className="pl-home-indicator" />
      </div>
    </div>
  )
}
