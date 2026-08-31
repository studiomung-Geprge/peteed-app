import { useState, useRef, useEffect } from 'react'

const DEFAULT_LOCATION = '경상북도 의성군 의성읍 군청길 31 의성군청'
const makeMapSrc = (q: string) => `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed&hl=ko&z=16`

interface Props { onOpenMap: (location: string) => void }

export default function EmergencyTab({ onOpenMap }: Props) {
  const [searchInput, setSearchInput] = useState('')
  const [searchedAddress, setSearchedAddress] = useState('')
  const [mapSrc, setMapSrc] = useState(makeMapSrc(DEFAULT_LOCATION))
  const [mapLoading, setMapLoading] = useState(true)
  const [activePin, setActivePin] = useState<'current' | 'searched'>('current')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMapSrc(makeMapSrc(DEFAULT_LOCATION))
    setMapLoading(true)
  }, [])

  const handleSearch = () => {
    const q = searchInput.trim()
    if (!q) return
    setMapSrc(makeMapSrc(q))
    setSearchedAddress(q)
    setActivePin('searched')
    setMapLoading(true)
  }

  const handleCurrentLocation = () => {
    setMapSrc(makeMapSrc(DEFAULT_LOCATION))
    setActivePin('current')
    setMapLoading(true)
  }

  const currentMapLocation = activePin === 'searched' && searchedAddress ? searchedAddress : DEFAULT_LOCATION

  return (
    <>
      <p className="eyebrow">EMERGENCY</p>
      <h1 className="page-title">응급 · 실종</h1>
      <p className="sub">위치기반 실종 신고와 응급 헌혈 매칭을 지원해요</p>

      <button className="sos-btn">
        <div className="ic">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div><b>실종 신고하기</b><span>QR 태그 · GPS 반경 10km/30km 알림</span></div>
      </button>

      {/* Map section */}
      <div style={{ margin: '12px 0 0', borderRadius: 18, overflow: 'hidden', border: '1.5px solid rgba(0,0,0,.07)', background: '#F8F4F1' }}>

        {/* Search bar */}
        <div style={{ padding: '10px 10px 8px', background: '#fff', borderBottom: '1px solid rgba(0,0,0,.06)' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: 7,
              background: '#F5F1EE', borderRadius: 10, padding: '0 10px',
              border: '1.5px solid rgba(255,107,74,.15)',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                ref={inputRef}
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="주소 또는 장소 검색..."
                style={{
                  flex: 1, border: 'none', background: 'transparent', outline: 'none',
                  fontSize: 12, color: '#1C1C1A', padding: '9px 0',
                  fontFamily: "'Noto Sans KR', sans-serif",
                }}
              />
              {searchInput && (
                <button onClick={() => setSearchInput('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              style={{
                padding: '0 14px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg,#FF6B4A,#E8521F)',
                color: 'white', fontSize: 11, fontWeight: 700,
                cursor: 'pointer', whiteSpace: 'nowrap',
                fontFamily: "'Noto Sans KR', sans-serif",
              }}
            >검색</button>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 10, marginTop: 7, paddingLeft: 2 }}>
            <button
              onClick={handleCurrentLocation}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: activePin === 'current' ? '#EBF5FF' : 'transparent',
                border: activePin === 'current' ? '1.5px solid #3B82F6' : '1.5px solid #E0E0E0',
                borderRadius: 8, padding: '4px 9px', cursor: 'pointer',
              }}
            >
              <div style={{
                width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                background: '#3B82F6',
                boxShadow: activePin === 'current' ? '0 0 0 3px rgba(59,130,246,.25)' : 'none',
              }} />
              <span style={{ fontSize: 10.5, fontWeight: 600, color: activePin === 'current' ? '#2563EB' : '#888' }}>현재 위치</span>
            </button>

            <button
              onClick={() => searchedAddress && setActivePin('searched')}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: activePin === 'searched' ? '#FFF3F0' : 'transparent',
                border: activePin === 'searched' ? '1.5px solid #FF6B4A' : '1.5px solid #E0E0E0',
                borderRadius: 8, padding: '4px 9px', cursor: searchedAddress ? 'pointer' : 'default',
                opacity: searchedAddress ? 1 : 0.4,
              }}
            >
              <svg width="9" height="12" viewBox="0 0 10 14" fill={activePin === 'searched' ? '#FF6B4A' : '#ccc'}>
                <path d="M5 0C2.24 0 0 2.24 0 5c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5zm0 6.5A1.5 1.5 0 1 1 5 3.5a1.5 1.5 0 0 1 0 3z"/>
              </svg>
              <span style={{ fontSize: 10.5, fontWeight: 600, color: activePin === 'searched' ? '#FF6B4A' : '#888' }}>검색된 위치</span>
            </button>

            {searchedAddress && (
              <span style={{
                fontSize: 9.5, color: '#999', alignSelf: 'center',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 90,
              }}>
                {searchedAddress}
              </span>
            )}
          </div>
        </div>

        {/* Google Maps iframe */}
        <div style={{ position: 'relative', height: 200 }}>
          {mapLoading && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 2,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: '#F8F4F1', gap: 10,
            }}>
              <svg width="32" height="32" viewBox="0 0 48 48" fill="none" style={{ animation: 'mapSpin 1s linear infinite' }}>
                <style>{`@keyframes mapSpin { to { transform: rotate(360deg) } }`}</style>
                <circle cx="24" cy="24" r="18" stroke="#E8E0DC" strokeWidth="4"/>
                <path d="M42 24A18 18 0 0 0 24 6" stroke="#FF6B4A" strokeWidth="4" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: 11, color: '#aaa' }}>지도 불러오는 중...</span>
            </div>
          )}
          <iframe
            key={mapSrc}
            src={mapSrc}
            width="100%"
            height="200"
            style={{ border: 'none', display: 'block' }}
            onLoad={() => setMapLoading(false)}
            title="위치 지도"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          {/* Active pin badge */}
          <div style={{
            position: 'absolute', bottom: 10, left: 10,
            background: activePin === 'current' ? 'rgba(37,99,235,.9)' : 'rgba(255,107,74,.9)',
            borderRadius: 8, padding: '5px 9px',
            display: 'flex', alignItems: 'center', gap: 5,
            backdropFilter: 'blur(4px)',
            boxShadow: '0 2px 8px rgba(0,0,0,.2)',
            transition: 'background .3s',
          }}>
            {activePin === 'current' ? (
              <>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'white', flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: 'white', fontWeight: 600 }}>현재 위치 · 의성군청</span>
              </>
            ) : (
              <>
                <svg width="8" height="10" viewBox="0 0 10 14" fill="white" style={{ flexShrink: 0 }}>
                  <path d="M5 0C2.24 0 0 2.24 0 5c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5zm0 6.5A1.5 1.5 0 1 1 5 3.5a1.5 1.5 0 0 1 0 3z"/>
                </svg>
                <span style={{ fontSize: 10, color: 'white', fontWeight: 600, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  검색 결과 · {searchedAddress}
                </span>
              </>
            )}
          </div>

          {/* 지도에서 열기 → App 레벨 팝업 */}
          <button
            onClick={() => onOpenMap(currentMapLocation)}
            style={{
              position: 'absolute', bottom: 10, right: 10,
              background: 'rgba(255,255,255,.92)', borderRadius: 8,
              padding: '5px 9px', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
              boxShadow: '0 2px 8px rgba(0,0,0,.15)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#4285F4' }}>지도에서 열기</span>
          </button>
        </div>

        {/* Address info strip */}
        <div style={{
          padding: '8px 12px',
          background: '#fff',
          borderTop: '1px solid rgba(0,0,0,.05)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              background: activePin === 'current' ? '#3B82F6' : '#FF6B4A',
              boxShadow: activePin === 'current' ? '0 0 0 2px rgba(59,130,246,.3)' : '0 0 0 2px rgba(255,107,74,.3)',
            }} />
            <span style={{ fontSize: 11, color: '#555', fontWeight: 500 }}>
              {activePin === 'current' ? `현재 위치 · ${DEFAULT_LOCATION}` : `검색 위치 · ${searchedAddress}`}
            </span>
          </div>
          <span style={{ fontSize: 10, color: '#bbb' }}>
            {activePin === 'current' ? 'GPS 5분 전' : '검색 결과'}
          </span>
        </div>
      </div>

      <div className="section-label">응급 헌혈 매칭</div>
      <div className="blood-card">
        <div className="row">
          <div className="row-icon" style={{ background: '#fff' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--coral)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p className="row-title">전국 최초 지자체 주도 네트워크</p>
            <p className="row-sub">공혈견 매칭 · 혈액형 인증 · 실시간 알림</p>
          </div>
        </div>
        <button className="book-btn" style={{ background: 'var(--coral)' }}>긴급 매칭 요청</button>
      </div>
    </>
  )
}
