import { useState } from 'react'

interface Props { guardian: 'A' | 'B'; onClose: () => void }

export default function GovIdModal({ guardian, onClose }: Props) {
  const [step, setStep] = useState<'intro' | 'connecting' | 'done'>('intro')
  const name = guardian === 'A' ? '죠지' : '공동관리자'

  const connect = () => {
    setStep('connecting')
    setTimeout(() => setStep('done'), 2200)
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
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 320,
        background: '#FFFAF7',
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 24px 56px -16px rgba(0,0,0,.5)',
      }}>
        <div style={{
          background: 'linear-gradient(135deg,#003087 0%,#0052CC 100%)',
          padding: '22px 20px 18px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="8" fill="white" fillOpacity="0.15"/>
              <rect x="7" y="7" width="10" height="10" rx="1.5" fill="white"/>
              <rect x="19" y="7" width="10" height="10" rx="1.5" fill="white"/>
              <rect x="7" y="19" width="10" height="10" rx="1.5" fill="white"/>
              <rect x="19" y="19" width="10" height="10" rx="1.5" fill="white" fillOpacity="0.4"/>
            </svg>
            <div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: 16, lineHeight: 1.1 }}>정부24</div>
              <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 10, letterSpacing: '.04em' }}>대한민국 정부 모바일 신분증</div>
            </div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,.15)', borderRadius: 12, padding: '6px 14px',
            color: 'white', fontSize: 11, fontWeight: 600, letterSpacing: '.03em',
          }}>PETEED 연동 요청</div>
        </div>

        <div style={{ padding: '22px 20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          {step === 'intro' && <>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 700, fontSize: 15, margin: '0 0 6px', color: '#1C1C1A' }}>{name} 보호자 신분 인증</p>
              <p style={{ fontSize: 12, color: '#666', margin: 0, lineHeight: 1.6 }}>
                정부24 모바일 신분증으로 보호자 신원을<br/>안전하게 인증하고 PETEED와 연동합니다.
              </p>
            </div>
            <div style={{ width: '100%', background: '#FFF3F0', borderRadius: 12, padding: '12px 14px' }}>
              {[
                { icon: '🔐', text: '주민등록증 / 운전면허증 진위 확인' },
                { icon: '🛡️', text: '개인정보 암호화 전송 (TLS 1.3)' },
                { icon: '✅', text: '행정안전부 공식 연동 API' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < 2 ? 8 : 0 }}>
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                  <span style={{ fontSize: 11.5, color: '#444' }}>{item.text}</span>
                </div>
              ))}
            </div>
            <button onClick={connect} style={{
              width: '100%', padding: '13px',
              background: 'linear-gradient(135deg,#003087,#0052CC)',
              border: 'none', borderRadius: 12, cursor: 'pointer',
              color: 'white', fontWeight: 700, fontSize: 14,
              fontFamily: "'Noto Sans KR', sans-serif",
            }}>정부24 앱으로 인증하기</button>
            <button onClick={onClose} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, color: '#999', fontFamily: "'Noto Sans KR', sans-serif",
            }}>취소</button>
          </>}

          {step === 'connecting' && (
            <div style={{ padding: '10px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                <circle cx="24" cy="24" r="20" stroke="#E0E0E0" strokeWidth="4"/>
                <path d="M44 24 A20 20 0 0 0 24 4" stroke="#0052CC" strokeWidth="4" strokeLinecap="round"/>
              </svg>
              <p style={{ fontSize: 13, color: '#444', margin: 0, textAlign: 'center', lineHeight: 1.6 }}>
                정부24 앱과 연결 중...<br/><span style={{ fontSize: 11, color: '#999' }}>잠시만 기다려 주세요</span>
              </p>
            </div>
          )}

          {step === 'done' && <>
            <div style={{ padding: '6px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'linear-gradient(135deg,#22C55E,#16A34A)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 700, fontSize: 15, margin: '0 0 5px', color: '#1C1C1A' }}>연동 완료!</p>
                <p style={{ fontSize: 12, color: '#666', margin: 0, lineHeight: 1.6 }}>
                  {name} 보호자 신원이 인증되었습니다.<br/>PETEED와 정부24가 안전하게 연결되었어요.
                </p>
              </div>
              {[
                { label: '인증 수단', value: '정부24 모바일 신분증', ok: true },
                { label: '인증 시각', value: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }), ok: true },
              ].map((r, i) => (
                <div key={i} style={{ width: '100%', background: '#F0FDF4', borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11.5, color: '#555' }}>{r.label}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#16A34A' }}>{r.value}</span>
                </div>
              ))}
            </div>
            <button onClick={onClose} style={{
              width: '100%', padding: '13px',
              background: 'linear-gradient(135deg,#FF6B4A,#E8521F)',
              border: 'none', borderRadius: 12, cursor: 'pointer',
              color: 'white', fontWeight: 700, fontSize: 14,
              fontFamily: "'Noto Sans KR', sans-serif",
            }}>확인</button>
          </>}
        </div>
      </div>
    </div>
  )
}
