import StampBadges from './StampBadges'

interface QRModalProps {
  onClose: () => void
  petName: string
  petPhoto: string
  guardianName: string
}

export default function QRModal({ onClose, petName, petPhoto, guardianName }: QRModalProps) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute', inset: 0, zIndex: 200,
        background: 'rgba(10,16,30,.82)',
        backdropFilter: 'blur(12px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 20px',
        animation: 'fadeIn .22s ease',
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:scale(.94) } to { opacity:1; transform:scale(1) } }
        @keyframes scanLine { 0%,100%{top:10%} 50%{top:82%} }
      `}</style>

      {/* Card */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 320,
          borderRadius: 24,
          background: 'radial-gradient(120% 140% at 100% 0%, #274571 0%, transparent 55%), linear-gradient(155deg, #1F3A5F 0%, #16233D 78%)',
          boxShadow: '0 32px 64px -24px rgba(0,0,0,.7)',
          overflow: 'hidden',
          color: '#FAF7EF',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 12, right: 12, zIndex: 10,
          width: 26, height: 26, borderRadius: '50%',
          background: 'rgba(255,255,255,.15)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Stripe pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(115deg, rgba(201,154,61,.07) 0 2px, transparent 2px 26px)',
          pointerEvents: 'none',
        }} />

        {/* Header */}
        <div style={{ padding: '20px 20px 16px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div>
                <div style={{ fontSize: 9.5, letterSpacing: '.06em', color: 'rgba(250,247,239,.6)' }}>GYEONGSANGBUK-DO</div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>PETEED · PETEED DIGITAL ID</div>
              </div>
            </div>
            <div style={{
              fontSize: 9, fontWeight: 700, padding: '4px 9px', borderRadius: 20,
              background: 'rgba(201,154,61,.18)', color: '#EAD09B',
              border: '1px solid rgba(201,154,61,.4)',
              fontFamily: "'Roboto Mono', monospace", letterSpacing: '.03em',
            }}>등록완료</div>
          </div>

          {/* Pet info row */}
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <img
              src={petPhoto}
              alt={petName}
              style={{ width: 64, height: 64, borderRadius: 14, objectFit: 'cover', border: '2px solid rgba(234,208,155,.45)', flexShrink: 0 }}
            />
            <div>
              <div style={{ fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 900, fontSize: 20, marginBottom: 3 }}>{petName}</div>
              <div style={{ fontSize: 11, color: 'rgba(250,247,239,.65)', marginBottom: 8 }}>사모예드 · 2022.05.06생 · 남아(중성화)</div>
              <div style={{ fontSize: 10, color: 'rgba(250,247,239,.5)', display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span>등록번호 <span style={{ fontFamily: "'Roboto Mono', monospace", color: '#FAF7EF', fontWeight: 700 }}>41000-1234567</span></span>
                <span>PETEED <span style={{ fontFamily: "'Roboto Mono', monospace", color: '#FAF7EF', fontWeight: 700 }}>GPET-2026-000124</span></span>
                <span>보호자 <span style={{ fontFamily: "'Noto Sans KR', sans-serif", color: '#FAF7EF', fontWeight: 700 }}>{guardianName}</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px dashed rgba(234,208,155,.25)', margin: '0 20px' }} />

        {/* QR section */}
        <div style={{ padding: '18px 20px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
          <p style={{ fontSize: 10.5, color: 'rgba(250,247,239,.55)', margin: '0 0 14px', letterSpacing: '.04em', textTransform: 'uppercase', fontFamily: "'Roboto Mono', monospace" }}>
            Scan to Verify · Official Document
          </p>

          {/* QR frame */}
          <div style={{ position: 'relative' }}>
            <div style={{
              background: '#fff', borderRadius: 18, padding: 14,
              boxShadow: '0 12px 32px -8px rgba(0,0,0,.4)',
            }}>
              <LargeQRCode />
            </div>
            {/* Scan animation line */}
            <div style={{
              position: 'absolute', left: 14, right: 14,
              height: 2,
              background: 'linear-gradient(90deg, transparent, #C99A3D, transparent)',
              borderRadius: 2,
              animation: 'scanLine 2.4s ease-in-out infinite',
              opacity: .8,
            }} />
            {/* Corner markers */}
            {[['0%','0%','row'],['100%','0%','row-reverse'],['0%','100%','row'],['100%','100%','row-reverse']].map(([x,y,dir],i)=>(
              <div key={i} style={{
                position: 'absolute',
                top: y === '0%' ? -4 : 'auto',
                bottom: y === '100%' ? -4 : 'auto',
                left: x === '0%' ? -4 : 'auto',
                right: x === '100%' ? -4 : 'auto',
                width: 20, height: 20,
                borderTop: y === '0%' ? '3px solid #C99A3D' : 'none',
                borderBottom: y === '100%' ? '3px solid #C99A3D' : 'none',
                borderLeft: x === '0%' ? '3px solid #C99A3D' : 'none',
                borderRight: x === '100%' ? '3px solid #C99A3D' : 'none',
                borderRadius: x === '0%' && y === '0%' ? '4px 0 0 0' : x === '100%' && y === '0%' ? '0 4px 0 0' : x === '0%' && y === '100%' ? '0 0 0 4px' : '0 0 4px 0',
              }} />
            ))}
          </div>

          <p style={{ fontSize: 9.5, color: 'rgba(250,247,239,.4)', margin: '14px 0 0', fontFamily: "'Roboto Mono', monospace", letterSpacing: '.05em' }}>
            GPET-2026-000124 · 경상북도
          </p>
        </div>

        {/* Vaccine stamps bar */}
        <div style={{
          borderTop: '1px solid rgba(234,208,155,.15)',
          padding: '12px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'relative', zIndex: 2,
        }}>
          <div style={{ fontSize: 10, color: 'rgba(250,247,239,.5)', fontWeight: 700 }}>접종 스탬프</div>
          <StampBadges />
        </div>
      </div>

      {/* Close hint */}
      <p style={{
        marginTop: 20, color: 'rgba(250,247,239,.4)',
        fontSize: 11.5, fontFamily: "'Noto Sans KR', sans-serif",
        letterSpacing: '.04em',
      }}>화면을 탭하면 닫힙니다</p>
    </div>
  )
}

function LargeQRCode() {
  return (
    <svg width="160" height="160" viewBox="0 0 60 60">
      <rect width="60" height="60" fill="#fff"/>
      <g fill="#16233D">
        <rect x="6" y="6" width="16" height="16"/>
        <rect x="38" y="6" width="16" height="16"/>
        <rect x="6" y="38" width="16" height="16"/>
        <rect x="10" y="10" width="8" height="8" fill="#fff"/>
        <rect x="42" y="10" width="8" height="8" fill="#fff"/>
        <rect x="10" y="42" width="8" height="8" fill="#fff"/>
        <rect x="26" y="6" width="4" height="4"/>
        <rect x="26" y="14" width="4" height="4"/>
        <rect x="34" y="26" width="4" height="4"/>
        <rect x="26" y="34" width="4" height="4"/>
        <rect x="34" y="42" width="4" height="4"/>
        <rect x="42" y="34" width="4" height="4"/>
        <rect x="26" y="48" width="4" height="4"/>
        <rect x="34" y="50" width="4" height="4"/>
        <rect x="26" y="26" width="4" height="4"/>
        <rect x="30" y="22" width="4" height="4"/>
        <rect x="22" y="26" width="4" height="4"/>
        <rect x="22" y="30" width="4" height="4"/>
        <rect x="30" y="30" width="4" height="4"/>
        <rect x="38" y="26" width="4" height="4"/>
        <rect x="38" y="34" width="4" height="4"/>
        <rect x="22" y="38" width="4" height="4"/>
        <rect x="50" y="38" width="4" height="4"/>
        <rect x="46" y="30" width="4" height="4"/>
        <rect x="50" y="22" width="4" height="4"/>
        <rect x="6" y="26" width="4" height="4"/>
        <rect x="14" y="30" width="4" height="4"/>
        <rect x="6" y="34" width="4" height="4"/>
      </g>
    </svg>
  )
}
