import { useState } from 'react'

interface Props { location: string; onClose: () => void }

const makeMapSrc = (q: string) =>
  `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed&hl=ko&z=16`

export default function MapPopupModal({ location, onClose }: Props) {
  const [loading, setLoading] = useState(true)

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute', inset: 0, zIndex: 200,
        background: '#fff',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        animation: 'mpSlideUp .28s cubic-bezier(.32,1,.56,1)',
      }}
    >
      <style>{`
        @keyframes mpSlideUp { from { transform:translateY(40px); opacity:0 } to { transform:translateY(0); opacity:1 } }
        @keyframes mpSpin { to { transform:rotate(360deg) } }
      `}</style>

      {/* Header */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '56px 14px 12px',
          background: '#fff',
          borderBottom: '1px solid rgba(0,0,0,.07)',
          flexShrink: 0,
        }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: '#fff', border: '1.5px solid #E8E0DC',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#1C1C1A' }}>Google Maps</div>
          <div style={{ fontSize: 10, color: '#999', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {location}
          </div>
        </div>
        <button onClick={onClose} style={{
          width: 28, height: 28, borderRadius: '50%',
          border: 'none', background: '#F0F0EE',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Map iframe */}
      <div onClick={e => e.stopPropagation()} style={{ flex: 1, position: 'relative' }}>
        {loading && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: '#F8F4F1', gap: 12,
          }}>
            <svg width="36" height="36" viewBox="0 0 48 48" fill="none" style={{ animation: 'mpSpin 1s linear infinite' }}>
              <circle cx="24" cy="24" r="18" stroke="#E8E0DC" strokeWidth="4"/>
              <path d="M42 24A18 18 0 0 0 24 6" stroke="#4285F4" strokeWidth="4" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: 11, color: '#aaa' }}>지도 불러오는 중...</span>
          </div>
        )}
        <iframe
          src={makeMapSrc(location)}
          width="100%"
          height="100%"
          style={{ border: 'none', display: 'block', height: '100%' }}
          onLoad={() => setLoading(false)}
          title="Google Maps"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* Bottom bar */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          padding: '10px 14px 28px',
          background: '#fff', borderTop: '1px solid rgba(0,0,0,.06)',
          display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF6B4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span style={{ fontSize: 11, color: '#888', flex: 1 }}>일부 콘텐츠는 앱 내 표시가 제한될 수 있어요</span>
        <button onClick={onClose} style={{
          padding: '7px 14px', borderRadius: 10, border: 'none',
          background: 'linear-gradient(135deg,#FF6B4A,#E8521F)',
          color: '#fff', fontSize: 11, fontWeight: 700,
          fontFamily: "'Noto Sans KR', sans-serif", cursor: 'pointer',
        }}>닫기</button>
      </div>
    </div>
  )
}
