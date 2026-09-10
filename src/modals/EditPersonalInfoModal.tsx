import { useState } from 'react'

interface Props {
  guardianName: string
  phone: string
  address: string
  onClose: () => void
  onSave: (guardianName: string, phone: string, address: string) => void | Promise<void>
}

export default function EditPersonalInfoModal({ guardianName, phone, address, onClose, onSave }: Props) {
  const [name, setName] = useState(guardianName)
  const [phoneVal, setPhoneVal] = useState(phone)
  const [addressVal, setAddressVal] = useState(address)
  const [nameError, setNameError] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!name.trim()) { setNameError('이름을 입력해 주세요'); return }
    setNameError('')

    setSaving(true)
    try {
      await onSave(name.trim(), phoneVal.trim(), addressVal.trim())
    } finally {
      setSaving(false)
    }
  }

  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 200,
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
        .epi-input-wrap { position:relative; width:100%; }
        .epi-input {
          width:100%; padding:13px 14px; border:1.8px solid #E8D5CE;
          border-radius:13px; font-family:'Noto Sans KR',sans-serif;
          /* 16px avoids iOS Safari's auto-zoom-on-focus behavior, which
             kicks in for any focused input/textarea below that size. */
          font-size:16px; color:#1C1C1A; background:#fff;
          outline:none; box-sizing:border-box; transition:border-color .2s, box-shadow .2s;
        }
        .epi-input:focus { border-color:#FF6B4A; box-shadow:0 0 0 3px rgba(255,107,74,.15); }
        .epi-input.error { border-color:#F87171; }
        .epi-input::placeholder { color:#BFA99E; }
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
            <div style={{ color: 'white', fontWeight: 800, fontSize: 16, fontFamily: "'Noto Sans KR', sans-serif" }}>개인 회원 정보 수정</div>
            <div style={{ color: 'rgba(255,255,255,.8)', fontSize: 11, marginTop: 2 }}>이름과 연락처 정보를 관리해요</div>
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

        <form
          onSubmit={e => { e.preventDefault(); submit() }}
          style={{ padding: '20px 20px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <div>
            <label style={{ display: 'block', margin: '0 0 6px 2px', fontFamily: "'Noto Sans KR',sans-serif", fontSize: 11.5, fontWeight: 700, color: '#7A5C52' }}>
              이름
            </label>
            <div className="epi-input-wrap">
              <input
                className={`epi-input${nameError ? ' error' : ''}`}
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setNameError('') }}
                autoComplete="name"
              />
            </div>
            {nameError && <p style={{ fontSize: 11, color: '#E8521F', margin: '4px 4px 0', fontWeight: 700 }}>{nameError}</p>}
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '0 0 6px 2px', fontFamily: "'Noto Sans KR',sans-serif", fontSize: 11.5, fontWeight: 700, color: '#7A5C52' }}>
              핸드폰번호
              <span style={{
                fontSize: 9.5, fontWeight: 700, color: '#A08A82',
                background: '#F2E6DF', borderRadius: 6, padding: '2px 6px',
              }}>
                선택사항
              </span>
            </label>
            <div className="epi-input-wrap">
              <input
                className="epi-input"
                type="tel"
                placeholder="예: 010-1234-5678"
                value={phoneVal}
                onChange={e => setPhoneVal(e.target.value)}
                autoComplete="tel"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '0 0 6px 2px', fontFamily: "'Noto Sans KR',sans-serif", fontSize: 11.5, fontWeight: 700, color: '#7A5C52' }}>
              주소
              <span style={{
                fontSize: 9.5, fontWeight: 700, color: '#A08A82',
                background: '#F2E6DF', borderRadius: 6, padding: '2px 6px',
              }}>
                선택사항
              </span>
            </label>
            <div className="epi-input-wrap">
              <input
                className="epi-input"
                type="text"
                placeholder="예: 경상북도 안동시 ..."
                value={addressVal}
                onChange={e => setAddressVal(e.target.value)}
                autoComplete="street-address"
              />
            </div>
          </div>

          <button type="submit" disabled={saving} style={{
            width: '100%', border: 'none', borderRadius: 14, padding: 15, marginTop: 4,
            background: 'linear-gradient(135deg,#FF6B4A 0%,#E8521F 100%)',
            color: '#fff', cursor: saving ? 'default' : 'pointer',
            fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            opacity: saving ? 0.7 : 1,
          }}>
            {saving
              ? <><span style={{ width: 15, height: 15, borderRadius: '50%', border: '2px solid rgba(255,255,255,.35)', borderTopColor: '#fff', display: 'inline-block', animation: 'spin .7s linear infinite' }} />저장 중…</>
              : '저장하기'
            }
          </button>
        </form>
      </div>
    </div>
  )
}
