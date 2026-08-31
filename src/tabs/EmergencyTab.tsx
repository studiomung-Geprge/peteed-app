import { useState, useRef, useEffect, type PointerEvent as ReactPointerEvent } from 'react'
import MissingReportModal from '../modals/MissingReportModal'

const DEFAULT_LOCATION = '경상북도 의성군 의성읍 군청길 31 의성군청'
const makeMapSrc = (q: string) => `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed&hl=ko&z=16`

interface Props {
  petName: string
  petPhoto: string
  petBreed: string
  petBloodType: string
  onOpenMap: (location: string) => void
}

const CENTER_PIN = { x: 50, y: 46 }

export default function EmergencyTab({ petName, petPhoto, petBreed, petBloodType, onOpenMap }: Props) {
  const [searchInput, setSearchInput] = useState('')
  const [searchedAddress, setSearchedAddress] = useState('')
  const [mapSrc, setMapSrc] = useState(makeMapSrc(DEFAULT_LOCATION))
  const [mapLoading, setMapLoading] = useState(true)
  const [activePin, setActivePin] = useState<'current' | 'searched'>('current')
  const [showMissingModal, setShowMissingModal] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Custom draggable pin overlaid on the map, so a searched-by-name result
  // can be nudged to the exact spot rather than trusting the geocoder alone.
  const mapAreaRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const [pinPos, setPinPos] = useState(CENTER_PIN)
  const [draftPos, setDraftPos] = useState<{ x: number; y: number } | null>(null)
  const [showLabelEditor, setShowLabelEditor] = useState(false)
  const [labelDraft, setLabelDraft] = useState('')

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
    setPinPos(CENTER_PIN)
    setDraftPos(null)
    setShowLabelEditor(false)
  }

  const handleCurrentLocation = () => {
    setMapSrc(makeMapSrc(DEFAULT_LOCATION))
    setActivePin('current')
    setMapLoading(true)
    setPinPos(CENTER_PIN)
    setDraftPos(null)
    setShowLabelEditor(false)
  }

  const clampPct = (v: number) => Math.min(96, Math.max(4, v))

  const posFromPointer = (e: { clientX: number; clientY: number }) => {
    const el = mapAreaRef.current
    if (!el) return CENTER_PIN
    const rect = el.getBoundingClientRect()
    return {
      x: clampPct(((e.clientX - rect.left) / rect.width) * 100),
      y: clampPct(((e.clientY - rect.top) / rect.height) * 100),
    }
  }

  const handlePinPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    draggingRef.current = true
    setDraftPos(posFromPointer(e))
  }
  const handlePinPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    setDraftPos(posFromPointer(e))
  }
  const handlePinPointerUp = () => {
    if (!draggingRef.current) return
    draggingRef.current = false
    setLabelDraft(searchedAddress)
    setShowLabelEditor(true)
  }

  const confirmPinLabel = () => {
    if (draftPos) setPinPos(draftPos)
    const label = labelDraft.trim()
    if (label) {
      setSearchedAddress(label)
      setActivePin('searched')
    }
    setShowLabelEditor(false)
    setDraftPos(null)
  }
  const cancelPinLabel = () => {
    setShowLabelEditor(false)
    setDraftPos(null)
  }

  const currentMapLocation = activePin === 'searched' && searchedAddress ? searchedAddress : DEFAULT_LOCATION

  return (
    <>
      {showMissingModal && (
        <MissingReportModal
          petName={petName}
          petPhoto={petPhoto}
          petBreed={petBreed}
          petBloodType={petBloodType}
          location={currentMapLocation}
          onClose={() => setShowMissingModal(false)}
        />
      )}

      <p className="eyebrow">EMERGENCY</p>
      <h1 className="page-title">응급 · 실종</h1>
      <p className="sub">위치기반 실종 신고와 응급 헌혈 매칭을 지원해요</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {/* Registered pet mini-card */}
        <div style={{
          flexShrink: 0, width: 78,
          borderRadius: 18, padding: '10px 6px',
          background: '#fff', border: '1.5px solid var(--hair)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
        }}>
          <img src={petPhoto} alt={petName} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{petName}</span>
          <span style={{
            fontSize: 8.5, fontWeight: 700, padding: '2px 6px', borderRadius: 20,
            background: '#FDEEEE', color: '#B8342A', whiteSpace: 'nowrap',
          }}>{petBloodType}</span>
        </div>

        <button className="sos-btn" style={{ flex: 1, margin: 0 }} onClick={() => setShowMissingModal(true)}>
          <div className="ic">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div><b>실종 신고하기</b><span>QR 태그 · GPS 반경 10km/30km 알림</span></div>
        </button>
      </div>

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

          {/* Draggable pin overlay — lets a name search result be nudged to
              the exact spot instead of trusting the geocoder alone */}
          {!mapLoading && (
            <div
              ref={mapAreaRef}
              onPointerDown={handlePinPointerDown}
              onPointerMove={handlePinPointerMove}
              onPointerUp={handlePinPointerUp}
              onPointerCancel={handlePinPointerUp}
              style={{ position: 'absolute', inset: 0, zIndex: 1, cursor: 'grab', touchAction: 'none' }}
            >
              <div style={{
                position: 'absolute',
                left: `${(draftPos ?? pinPos).x}%`,
                top: `${(draftPos ?? pinPos).y}%`,
                transform: 'translate(-50%, -100%)',
                pointerEvents: 'none',
                transition: draftPos ? 'none' : 'left .18s ease, top .18s ease',
              }}>
                <svg width="28" height="36" viewBox="0 0 30 38" style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,.35))' }}>
                  <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 23 15 23s15-12.5 15-23C30 6.7 23.3 0 15 0z" fill={activePin === 'current' ? '#2563EB' : '#FF6B4A'}/>
                  <circle cx="15" cy="15" r="6.5" fill="#fff"/>
                </svg>
              </div>
            </div>
          )}

          {/* Pin label editor — appears right after the pin is dropped */}
          {showLabelEditor && (
            <div style={{
              position: 'absolute', left: 8, right: 8, bottom: 8, zIndex: 6,
              background: '#fff', borderRadius: 12, padding: 8,
              boxShadow: '0 8px 22px rgba(0,0,0,.28)',
              display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: '#999', paddingLeft: 2 }}>이 위치를 무엇이라고 부를까요?</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  autoFocus
                  value={labelDraft}
                  onChange={e => setLabelDraft(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && confirmPinLabel()}
                  placeholder="예: 정문 앞 화단, 놀이터 벤치"
                  style={{
                    flex: 1, border: '1.5px solid #E8D5CE', borderRadius: 8, padding: '7px 9px',
                    fontSize: 11.5, outline: 'none', fontFamily: "'Noto Sans KR', sans-serif", color: '#1C1C1A',
                  }}
                />
                <button onClick={cancelPinLabel} style={{
                  padding: '0 10px', borderRadius: 8, border: '1.5px solid #E0E0E0',
                  background: '#fff', color: '#888', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  fontFamily: "'Noto Sans KR', sans-serif",
                }}>취소</button>
                <button onClick={confirmPinLabel} style={{
                  padding: '0 12px', borderRadius: 8, border: 'none',
                  background: 'linear-gradient(135deg,#FF6B4A,#E8521F)', color: '#fff',
                  fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  fontFamily: "'Noto Sans KR', sans-serif",
                }}>설정</button>
              </div>
            </div>
          )}

          {/* Active pin badge — zIndex above the drag-capture overlay so it
              stays visible and doesn't intercept its clicks */}
          {!mapLoading && (
            <div style={{
              position: 'absolute', bottom: 10, left: 10, zIndex: 3,
              background: activePin === 'current' ? 'rgba(37,99,235,.9)' : 'rgba(255,107,74,.9)',
              borderRadius: 8, padding: '5px 9px',
              display: 'flex', alignItems: 'center', gap: 5,
              backdropFilter: 'blur(4px)',
              boxShadow: '0 2px 8px rgba(0,0,0,.2)',
              transition: 'background .3s',
              pointerEvents: 'none',
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
          )}

          {/* 지도에서 열기 → App 레벨 팝업 (드래그 오버레이보다 위에 두어 클릭 가능하게 유지) */}
          {!mapLoading && (
            <button
              onClick={() => onOpenMap(currentMapLocation)}
              style={{
                position: 'absolute', bottom: 10, right: 10, zIndex: 3,
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
          )}
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
        <p style={{ margin: 0, padding: '0 12px 9px', fontSize: 9.5, color: '#bbb', background: '#fff' }}>
          📍 지도 위 핀을 드래그하면 정확한 위치로 조정할 수 있어요
        </p>
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
