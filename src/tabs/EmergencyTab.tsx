import { useState, useRef, useEffect } from 'react'
import MissingReportModal from '../modals/MissingReportModal'
import { SAMPLE_REPORTS, type MissingReport, type ReportStatus } from '../data/missingReports'

const STATUS_STYLE: Record<ReportStatus, { bg: string; fg: string }> = {
  '진행중': { bg: '#FFF0EB', fg: '#E8521F' },
  '발견완료': { bg: '#E9F7EF', fg: '#1E9E5A' },
  '매칭완료': { bg: '#EBF5FF', fg: '#2563EB' },
}

const DEFAULT_LOCATION = '경상북도 의성군 의성읍 군청길 31 의성군청'
const makeMapSrc = (q: string) => `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed&hl=ko&z=16`

interface Props {
  petName: string
  petPhoto: string
  petBreed: string
  petBloodType: string
  onOpenMap: (location: string) => void
}

export default function EmergencyTab({ petName, petPhoto, petBreed, petBloodType, onOpenMap }: Props) {
  const [searchInput, setSearchInput] = useState('')
  const [searchedAddress, setSearchedAddress] = useState('')
  const [mapSrc, setMapSrc] = useState(makeMapSrc(DEFAULT_LOCATION))
  const [mapLoading, setMapLoading] = useState(true)
  const [activePin, setActivePin] = useState<'current' | 'searched'>('current')
  const [showMissingModal, setShowMissingModal] = useState(false)
  const [showActionMenu, setShowActionMenu] = useState(false)
  const [bloodHighlight, setBloodHighlight] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const bloodCardRef = useRef<HTMLDivElement>(null)

  // 실종/응급 신청 리스트 — 내가 접수한 신고가 맨 앞에 추가되고, 나머지는 샘플 데이터
  const [reports, setReports] = useState<MissingReport[]>(SAMPLE_REPORTS)
  const [confirmingCancelId, setConfirmingCancelId] = useState<string | null>(null)

  const handleReported = (report: { id: string; location: string; notes: string }) => {
    const entry: MissingReport = {
      id: report.id,
      kind: '실종',
      petName,
      info: `${petBreed} · ${petBloodType}`,
      location: report.location,
      status: '진행중',
      reportedAt: '방금 전',
      notes: report.notes || undefined,
      mine: true,
    }
    setReports(prev => [entry, ...prev])
  }

  const requestCancelReport = (id: string) => setConfirmingCancelId(id)
  const dismissCancelReport = () => setConfirmingCancelId(null)
  const confirmCancelReport = (id: string) => {
    setReports(prev => prev.map(r => (r.id === id ? { ...r, status: '발견완료', reportedAt: '방금 전' } : r)))
    setConfirmingCancelId(null)
  }

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

  // 현재 위치 / 검색된 위치 중 선택된 쪽의 주소가 그대로 응급·실종 신고의 위치로 등록돼요.
  const currentMapLocation = activePin === 'searched' && searchedAddress ? searchedAddress : DEFAULT_LOCATION

  const openMissingReport = () => {
    setShowActionMenu(false)
    setShowMissingModal(true)
  }

  const requestBloodMatch = () => {
    setShowActionMenu(false)
    bloodCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setBloodHighlight(true)
    setTimeout(() => setBloodHighlight(false), 1600)
  }

  return (
    <>
      {showMissingModal && (
        <MissingReportModal
          petName={petName}
          petPhoto={petPhoto}
          petBreed={petBreed}
          petBloodType={petBloodType}
          location={currentMapLocation}
          onReported={handleReported}
          onClose={() => setShowMissingModal(false)}
        />
      )}

      <p className="eyebrow">EMERGENCY</p>
      <h1 className="page-title">응급 · 실종</h1>
      <p className="sub">위치기반 실종 신고와 응급 헌혈 매칭을 지원해요</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, position: 'relative' }}>
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

        <button className="sos-btn" style={{ flex: 1, margin: 0 }} onClick={() => setShowActionMenu(v => !v)}>
          <div className="ic">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div><b>응급/실종 신고하기</b><span>탭하여 실종 신고 · 헌혈 요청 중 선택</span></div>
        </button>

        {showActionMenu && (
          <>
            <div onClick={() => setShowActionMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 150 }} />
            <div style={{
              position: 'absolute', top: '100%', marginTop: 8, left: 86, right: 0, zIndex: 151,
              background: '#fff', borderRadius: 16, border: '1px solid var(--hair)',
              boxShadow: '0 16px 36px -10px rgba(0,0,0,.3)', overflow: 'hidden',
            }}>
              <button
                onClick={openMissingReport}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 14px', background: '#fff', border: 'none', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  background: '#FFF0EB', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E8521F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 12.5, fontWeight: 800, color: '#1C1C1A', fontFamily: "'Noto Sans KR',sans-serif" }}>실종 신고</p>
                  <p style={{ margin: '1px 0 0', fontSize: 10.5, color: '#999' }}>반려동물을 잃어버렸어요</p>
                </div>
              </button>
              <div style={{ height: 1, background: 'var(--hair)' }} />
              <button
                onClick={requestBloodMatch}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 14px', background: '#fff', border: 'none', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  background: '#FDEEEE', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B8342A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                  </svg>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 12.5, fontWeight: 800, color: '#1C1C1A', fontFamily: "'Noto Sans KR',sans-serif" }}>응급 헌혈 요청</p>
                  <p style={{ margin: '1px 0 0', fontSize: 10.5, color: '#999' }}>혈액이 급히 필요해요</p>
                </div>
              </button>
            </div>
          </>
        )}
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

          {/* Active pin badge */}
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

          {/* 지도에서 열기 → App 레벨 팝업 */}
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
      </div>

      {/* 실종/응급 신청 리스트 */}
      <div className="section-label">
        최근 실종 · 응급 신청
        <span className="more">샘플</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 4 }}>
        {reports.slice(0, 3).map(r => {
          const st = STATUS_STYLE[r.status]
          const confirming = confirmingCancelId === r.id
          const mineActive = r.mine && r.status === '진행중'
          return (
            <div
              key={r.id}
              style={{
                background: '#fff', borderRadius: 14, padding: '11px 12px',
                border: mineActive ? '1.5px solid rgba(255,107,74,.35)' : '1px solid var(--hair)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  background: r.kind === '실종' ? '#FFF0EB' : '#FDEEEE',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {r.kind === '실종' ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E8521F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B8342A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12.5, fontWeight: 800, color: '#1C1C1A' }}>{r.kind} · {r.petName}</span>
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                      background: st.bg, color: st.fg, whiteSpace: 'nowrap',
                    }}>{r.status}</span>
                    {r.mine && <span style={{ fontSize: 9, fontWeight: 700, color: '#FF6B4A' }}>내 신고</span>}
                  </div>
                  <div style={{
                    fontSize: 10.5, color: '#888', marginTop: 2,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {r.info} · {r.location}
                  </div>
                  {r.notes && (
                    <div style={{ fontSize: 10, color: '#B8342A', marginTop: 3, lineHeight: 1.4 }}>“{r.notes}”</div>
                  )}
                </div>
                <span style={{ fontSize: 9.5, color: '#bbb', flexShrink: 0, marginTop: 1 }}>{r.reportedAt}</span>
              </div>

              {mineActive && (
                confirming ? (
                  <div style={{ marginTop: 9, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 10.5, color: '#7A5C52' }}>정말 찾으셨나요? 신고를 종료할게요</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={dismissCancelReport}
                        style={{
                          flex: 1, padding: '7px 0', borderRadius: 8, border: '1.5px solid #E0E0E0',
                          background: '#fff', color: '#888', fontSize: 10.5, fontWeight: 700, cursor: 'pointer',
                          fontFamily: "'Noto Sans KR', sans-serif",
                        }}
                      >아니오</button>
                      <button
                        onClick={() => confirmCancelReport(r.id)}
                        style={{
                          flex: 1, padding: '7px 0', borderRadius: 8, border: 'none',
                          background: '#1E9E5A', color: '#fff', fontSize: 10.5, fontWeight: 700, cursor: 'pointer',
                          fontFamily: "'Noto Sans KR', sans-serif",
                        }}
                      >네, 찾았어요</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => requestCancelReport(r.id)}
                    style={{
                      marginTop: 9, width: '100%', padding: '7px 0', borderRadius: 9,
                      border: '1.5px solid #1E9E5A', background: '#F2FBF6', color: '#1E9E5A',
                      fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      fontFamily: "'Noto Sans KR', sans-serif",
                    }}
                  >찾았어요 · 신고 취소</button>
                )
              )}
            </div>
          )
        })}
      </div>

      <div className="section-label">응급 헌혈 매칭</div>
      <div
        ref={bloodCardRef}
        className="blood-card"
        style={{
          transition: 'box-shadow .3s, transform .3s',
          boxShadow: bloodHighlight ? '0 0 0 3px rgba(255,107,74,.45)' : 'none',
          transform: bloodHighlight ? 'scale(1.015)' : 'scale(1)',
        }}
      >
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
