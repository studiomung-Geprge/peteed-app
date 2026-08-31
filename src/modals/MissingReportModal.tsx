import { useState } from 'react'

interface Props {
  petName: string
  petPhoto: string
  petBreed: string
  petBloodType: string
  location: string
  onClose: () => void
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function makeReportId() {
  const d = new Date()
  const stamp = `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`
  const rand = String(Math.floor(Math.random() * 9000) + 1000)
  return `MISSING-${stamp}-${rand}`
}

export default function MissingReportModal({ petName, petPhoto, petBreed, petBloodType, location, onClose }: Props) {
  const [phase, setPhase] = useState<'confirm' | 'submitting' | 'done'>('confirm')
  const [reportId] = useState(makeReportId)

  const submit = () => {
    setPhase('submitting')
    setTimeout(() => setPhase('done'), 1100)
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
        @keyframes popIn { from { opacity:0; transform:scale(.7) } to { opacity:1; transform:scale(1) } }
      `}</style>

      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 320,
        background: '#FFFAF7',
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 24px 56px -16px rgba(0,0,0,.5)',
      }}>
        <div style={{
          background: 'linear-gradient(135deg,#D5533B 0%,#C1442E 100%)',
          padding: '20px 20px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 16, fontFamily: "'Noto Sans KR', sans-serif" }}>
              {phase === 'done' ? '신고 접수 완료' : '실종 신고'}
            </div>
            <div style={{ color: 'rgba(255,255,255,.85)', fontSize: 11, marginTop: 2 }}>
              {phase === 'done' ? '반경 내 알림이 발송됐어요' : '등록된 반려동물 정보로 신고서를 작성해요'}
            </div>
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

        {phase !== 'done' ? (
          <div style={{ padding: '20px 20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Pet summary */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', background: '#fff', borderRadius: 14, border: '1px solid var(--hair)',
            }}>
              <img src={petPhoto} alt={petName} style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 800, fontSize: 14, color: '#1C1C1A' }}>{petName}</span>
                  <span style={{
                    fontSize: 9.5, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                    background: '#FDEEEE', color: '#B8342A', whiteSpace: 'nowrap',
                  }}>{petBloodType}</span>
                </div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{petBreed}</div>
              </div>
            </div>

            {/* Location */}
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '12px 14px', background: '#fff', borderRadius: 14, border: '1px solid var(--hair)',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--coral)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 10.5, color: '#999', fontWeight: 700 }}>실종 위치</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, fontWeight: 600, color: '#1C1C1A', lineHeight: 1.4 }}>{location}</p>
              </div>
            </div>

            <p style={{ fontSize: 10.5, color: '#A08A82', margin: 0, lineHeight: 1.6 }}>
              신고 접수 시 이 위치를 기준으로 반경 10km 이내 보호소·동물병원과 반경 30km 이내 PETEED 사용자에게 실시간 알림이 전송돼요.
            </p>

            <button
              onClick={submit}
              disabled={phase === 'submitting'}
              style={{
                width: '100%', border: 'none', borderRadius: 14, padding: 15,
                background: 'linear-gradient(135deg,#D5533B 0%,#C1442E 100%)',
                color: '#fff', cursor: phase === 'submitting' ? 'default' : 'pointer',
                fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: phase === 'submitting' ? 0.75 : 1,
              }}
            >
              {phase === 'submitting'
                ? <><span style={{ width: 15, height: 15, borderRadius: '50%', border: '2px solid rgba(255,255,255,.35)', borderTopColor: '#fff', display: 'inline-block', animation: 'spin .7s linear infinite' }} />신고 접수 중…</>
                : '신고 접수하기'
              }
            </button>
          </div>
        ) : (
          <div style={{ padding: '22px 20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--coral-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'popIn .3s cubic-bezier(.34,1.56,.64,1)',
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--coral)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 800, fontSize: 15, color: '#1C1C1A' }}>
                {petName} 실종 신고가 접수됐어요
              </p>
              <p style={{ margin: 0, fontSize: 11.5, color: '#888', lineHeight: 1.6 }}>
                반경 10km 보호소·동물병원, 30km PETEED 사용자에게<br/>알림이 발송됐어요
              </p>
            </div>

            <div style={{
              width: '100%', background: '#fff', borderRadius: 12, border: '1px solid var(--hair)',
              padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <span style={{ color: '#999' }}>신고 번호</span>
                <span style={{ fontWeight: 700, color: '#1C1C1A', fontFamily: "'Roboto Mono', monospace" }}>{reportId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <span style={{ color: '#999' }}>위치</span>
                <span style={{ fontWeight: 600, color: '#1C1C1A', textAlign: 'right', maxWidth: 190 }}>{location}</span>
              </div>
            </div>

            <button onClick={onClose} style={{
              width: '100%', border: 'none', borderRadius: 14, padding: 14,
              background: 'linear-gradient(135deg,#D5533B 0%,#C1442E 100%)',
              color: '#fff', cursor: 'pointer',
              fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 14,
            }}>확인</button>
          </div>
        )}
      </div>
    </div>
  )
}
