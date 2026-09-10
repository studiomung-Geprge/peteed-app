import { useState } from 'react'
import { openAddressSearch } from '../lib/daumPostcode'

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
  // 주소는 다음 우편번호 검색으로 채워지는 기본주소(읽기전용)와, 동/호수처럼
  // 검색으로는 알 수 없는 나머지를 직접 입력하는 상세주소 두 칸으로 나뉜다.
  // 기존에 저장된 주소는 두 값으로 나뉘어 있지 않으므로 일단 기본주소 칸에
  // 그대로 불러와서 보여주고, 저장할 때 두 값을 합쳐 하나의 문자열로 만든다.
  const [addressVal, setAddressVal] = useState(address)
  const [addressDetail, setAddressDetail] = useState('')
  const [addressError, setAddressError] = useState('')
  const [nameError, setNameError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleAddressSearch = async () => {
    setAddressError('')
    try {
      await openAddressSearch(result => {
        setAddressVal(result.roadAddress || result.jibunAddress || result.address)
      })
    } catch (err) {
      console.warn('주소 검색 실패:', err)
      setAddressError('주소 검색을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.')
    }
  }

  const submit = async () => {
    if (!name.trim()) { setNameError('이름을 입력해 주세요'); return }
    setNameError('')

    const combinedAddress = [addressVal.trim(), addressDetail.trim()].filter(Boolean).join(' ')

    setSaving(true)
    try {
      await onSave(name.trim(), phoneVal.trim(), combinedAddress)
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
            <div style={{ display: 'flex', gap: 6 }}>
              <div className="epi-input-wrap" style={{ flex: 1 }}>
                <input
                  className="epi-input"
                  type="text"
                  placeholder="주소 검색을 눌러 주소를 찾아 주세요"
                  value={addressVal}
                  readOnly
                  onClick={handleAddressSearch}
                  style={{ cursor: 'pointer', background: '#FFF9F6' }}
                  autoComplete="off"
                />
              </div>
              <button
                type="button"
                onClick={handleAddressSearch}
                style={{
                  flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
                  padding: '0 14px', borderRadius: 13,
                  border: '1.8px solid #E8D5CE', background: '#fff',
                  color: '#7A5C52', cursor: 'pointer',
                  fontFamily: "'Noto Sans KR',sans-serif", fontSize: 12.5, fontWeight: 700,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                검색
              </button>
            </div>
            {addressError && <p style={{ fontSize: 11, color: '#E8521F', margin: '4px 4px 0', fontWeight: 700 }}>{addressError}</p>}

            <div className="epi-input-wrap" style={{ marginTop: 8 }}>
              <input
                className="epi-input"
                type="text"
                placeholder="상세주소 (동/호수 등, 선택)"
                value={addressDetail}
                onChange={e => setAddressDetail(e.target.value)}
                autoComplete="address-line2"
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
