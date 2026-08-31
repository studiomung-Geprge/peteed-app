import { useState, useEffect } from 'react'
import { fetchFacilities } from '../lib/petData'
import { SUPABASE_ENABLED } from '../lib/supabase'

interface Facility {
  name: string
  status: string
  chipClass: string
  sub: string
  img: string
  disabled: boolean
  url?: string
}

// Thumbnail images are kept locally rather than in the `facilities` table:
// the Claude Artifact preview inlines these exact Unsplash URLs as data URIs
// at build time (see build_artifact.py), so images need to stay stable
// string literals in the bundle regardless of where the rest of the row's
// data comes from.
const FACILITY_IMAGES: Record<string, string> = {
  '의성 펫월드': 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=200&fit=crop',
  '문경새재 힐링센터': 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=200&fit=crop',
  '경주 펫피아': 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&h=200&fit=crop',
  '포항 숲강아지': 'https://images.unsplash.com/photo-1594004844563-536a03a6e532?w=400&h=200&fit=crop',
}

// Static fallback — used whenever Supabase isn't reachable (e.g. inside a
// Claude Artifact preview, whose sandbox blocks calls to *.supabase.co) so
// the tab still renders the same content it always has.
const FALLBACK_FACILITIES: Facility[] = [
  { name: '의성 펫월드', status: '운영중', chipClass: 'teal', sub: '의성군 · 테마파크 · 캠핑장', img: FACILITY_IMAGES['의성 펫월드'], disabled: false, url: 'https://www.usc.go.kr/petworld/index.do' },
  { name: '문경새재 힐링센터', status: '운영중', chipClass: 'teal', sub: '문경시 · 호텔 · 미용 · 잔디운동장', img: FACILITY_IMAGES['문경새재 힐링센터'], disabled: false },
  { name: '경주 펫피아', status: '조성중', chipClass: 'gold', sub: '경주시 · 테마파크', img: FACILITY_IMAGES['경주 펫피아'], disabled: true },
  { name: '포항 숲강아지', status: '운영중', chipClass: 'teal', sub: '포항시 · 유기동물 입양센터', img: FACILITY_IMAGES['포항 숲강아지'], disabled: false },
]

function WebviewModal({ facility, onClose }: { facility: Facility; onClose: () => void }) {
  const [loading, setLoading] = useState(true)
  const [blocked, setBlocked] = useState(false)

  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        position: 'absolute', inset: 0, zIndex: 200,
        background: '#FFFAF7',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        animation: 'slideUp .28s cubic-bezier(.32,1,.56,1)',
      }}
    >
      <style>{`
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '62px 16px 12px',
          borderBottom: '1px solid rgba(0,0,0,.07)',
          background: '#fff',
          flexShrink: 0,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,#FF6B4A,#E8521F)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#1C1C1A', lineHeight: 1.2 }}>{facility.name}</div>
            <div style={{
              fontSize: 10, color: '#999', marginTop: 2,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{facility.url}</div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: '50%',
              border: 'none', background: '#F0F0EE',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* URL bar */}
        <div style={{
          padding: '8px 14px',
          background: '#F8F4F1',
          borderBottom: '1px solid rgba(0,0,0,.06)',
          flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span style={{ fontSize: 11, color: '#555', fontFamily: 'monospace' }}>www.usc.go.kr/petworld</span>
        </div>

        {/* Content area */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {loading && !blocked && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 2,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: '#FFFAF7', gap: 14,
            }}>
              <svg width="40" height="40" viewBox="0 0 48 48" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                <circle cx="24" cy="24" r="20" stroke="#F0E8E4" strokeWidth="4"/>
                <path d="M44 24A20 20 0 0 0 24 4" stroke="#FF6B4A" strokeWidth="4" strokeLinecap="round"/>
              </svg>
              <p style={{ fontSize: 12, color: '#999', margin: 0 }}>페이지를 불러오는 중...</p>
            </div>
          )}

          {blocked ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              height: '100%', padding: '0 28px', textAlign: 'center', gap: 16,
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 20,
                background: 'linear-gradient(135deg,#FFF0EB,#FFE0D4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#FF6B4A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, margin: '0 0 6px', color: '#1C1C1A' }}>페이지를 표시할 수 없어요</p>
                <p style={{ fontSize: 12, color: '#888', margin: '0 0 4px', lineHeight: 1.6 }}>
                  해당 사이트가 앱 내 표시를 제한하고 있어요.<br/>아래 버튼으로 외부 브라우저에서 여세요.
                </p>
              </div>
              <div style={{
                width: '100%', background: '#F8F4F1', borderRadius: 14, padding: '14px 16px',
                display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                {[
                  { label: '시설명', value: facility.name },
                  { label: '위치', value: facility.sub },
                  { label: '예약', value: '온라인 예약 가능' },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#999' }}>{r.label}</span>
                    <span style={{ fontWeight: 600, color: '#1C1C1A' }}>{r.value}</span>
                  </div>
                ))}
              </div>
              <a
                href={facility.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block', width: '100%', padding: '13px',
                  background: 'linear-gradient(135deg,#FF6B4A,#E8521F)',
                  borderRadius: 14, textDecoration: 'none',
                  color: 'white', fontWeight: 700, fontSize: 14, textAlign: 'center',
                  fontFamily: "'Noto Sans KR', sans-serif",
                }}
              >
                외부 브라우저로 열기
              </a>
            </div>
          ) : (
            <iframe
              src={facility.url}
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              onLoad={() => setLoading(false)}
              onError={() => { setLoading(false); setBlocked(true) }}
              title={facility.name}
            />
          )}
        </div>

        {/* Bottom safe area */}
        <div style={{ height: 20, background: '#fff', flexShrink: 0 }} />
    </div>
  )
}


export default function FacilitiesTab() {
  const [webview, setWebview] = useState<Facility | null>(null)
  const [facilities, setFacilities] = useState<Facility[]>(FALLBACK_FACILITIES)

  useEffect(() => {
    if (!SUPABASE_ENABLED) return
    fetchFacilities()
      .then(rows => {
        if (!rows.length) return
        setFacilities(rows.map(row => ({
          name: row.name,
          status: row.status === 'open' ? '운영중' : '조성중',
          chipClass: row.status === 'open' ? 'teal' : 'gold',
          sub: [row.region, row.category].filter(Boolean).join(' · '),
          img: FACILITY_IMAGES[row.name] ?? FALLBACK_FACILITIES[0].img,
          disabled: !row.is_bookable,
          url: row.website_url ?? undefined,
        })))
      })
      .catch(err => console.warn('fetchFacilities failed, using fallback list:', err))
  }, [])

  return (
    <>
      {webview && <WebviewModal facility={webview} onClose={() => setWebview(null)} />}

      <p className="eyebrow">PETEED HUB</p>
      <h1 className="page-title">시설 예약</h1>
      <p className="sub">경북 7개 반려동물 공공시설을 한 곳에서 예약하세요</p>

      {facilities.map((f, i) => (
        <div key={i} className="card fac-card">
          <img className="thumb" src={f.img} alt={f.name} />
          <div className="fac-meta">
            <p className="row-title" style={{ margin: 0 }}>{f.name}</p>
            <span className={`chip ${f.chipClass}`}>{f.status}</span>
          </div>
          <p className="row-sub">{f.sub}</p>
          <button
            className="book-btn"
            disabled={f.disabled}
            onClick={() => !f.disabled && f.url && setWebview(f)}
          >
            {f.disabled ? '오픈 알림 받기' : '예약하기'}
          </button>
        </div>
      ))}
    </>
  )
}
