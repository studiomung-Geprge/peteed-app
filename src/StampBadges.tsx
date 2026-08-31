import { useState } from 'react'

export const STAMPS = [
  {
    id: 'reg',
    label: '동물등록',
    done: true,
    date: '2024.05.06',
    detail: '경상북도 안동시 동물등록 완료',
    note: '등록번호 41000-1234567 · 내장칩 삽입',
    icon: (active: boolean) => (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke={active ? 'white' : '#AAAAAA'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
  {
    id: 'dhpp',
    label: 'DHPP 백신',
    done: true,
    date: '2026.05.20',
    detail: '종합백신(DHPP) 2차 접종 완료',
    note: 'Nobivac DHPPi · 안동동물병원 · 박서연 수의사',
    icon: (active: boolean) => (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke={active ? 'white' : '#AAAAAA'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/>
      </svg>
    ),
  },
  {
    id: 'checkup',
    label: '건강검진',
    done: true,
    date: '2026.06.02',
    detail: '슬개골 정기 검진 완료',
    note: '슬개골 탈구 1도 경과 관찰 · 안동동물병원 · 김민준 수의사',
    icon: (active: boolean) => (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke={active ? 'white' : '#AAAAAA'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
  },
  {
    id: 'rabies',
    label: '광견병 백신',
    done: false,
    date: '2026.06.05 예정',
    detail: '광견병 백신 접종 예정 (D-5)',
    note: 'Nobivac Rabies · 안동동물병원 · 예약 완료',
    icon: (active: boolean) => (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke={active ? 'white' : '#AAAAAA'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
]

export default function StampBadges() {
  const [selected, setSelected] = useState<typeof STAMPS[0] | null>(null)

  return (
    <>
      <div style={{ display: 'flex', gap: 6 }}>
        {STAMPS.map(s => (
          <button
            key={s.id}
            onClick={() => setSelected(s)}
            title={s.label}
            style={{
              width: 30, height: 30, borderRadius: '50%',
              border: s.done ? 'none' : '1.5px solid rgba(180,180,180,.4)',
              background: s.done
                ? 'linear-gradient(135deg,#FF6B4A,#E8521F)'
                : 'rgba(255,255,255,.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', padding: 0,
              boxShadow: s.done ? '0 2px 8px rgba(255,107,74,.4)' : 'none',
              transition: 'transform .15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.12)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {s.icon(s.done)}
          </button>
        ))}
      </div>

      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 400,
            background: 'rgba(10,16,30,.72)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 24px',
            animation: 'fadeIn .18s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 300,
              background: '#FFFAF7',
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: '0 24px 56px -16px rgba(0,0,0,.5)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '18px 18px 16px',
              background: selected.done
                ? 'linear-gradient(135deg,#FF6B4A,#E8521F)'
                : 'linear-gradient(135deg,#9CA3AF,#6B7280)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'rgba(255,255,255,.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {selected.icon(true)}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'white' }}>{selected.label}</p>
                  <p style={{ margin: 0, fontSize: 10.5, color: 'rgba(255,255,255,.75)' }}>{selected.date}</p>
                </div>
              </div>
              <div style={{
                padding: '4px 10px', borderRadius: 20,
                background: 'rgba(255,255,255,.2)',
                fontSize: 11, fontWeight: 700, color: 'white',
              }}>
                {selected.done ? '등록완료' : '등록전'}
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '18px 18px 20px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 14px',
                background: selected.done ? '#FFF3F0' : '#F3F4F6',
                borderRadius: 12, marginBottom: 12,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: selected.done
                    ? 'linear-gradient(135deg,#22C55E,#16A34A)'
                    : 'linear-gradient(135deg,#9CA3AF,#6B7280)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {selected.done ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  )}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: '#1C1C1A' }}>{selected.detail}</p>
                </div>
              </div>

              <div style={{
                padding: '10px 14px',
                background: '#F9F9F9', borderRadius: 10,
                borderLeft: `3px solid ${selected.done ? 'var(--gold, #FF6B4A)' : '#9CA3AF'}`,
                marginBottom: 16,
              }}>
                <p style={{ margin: 0, fontSize: 11.5, color: '#555', lineHeight: 1.6 }}>{selected.note}</p>
              </div>

              {!selected.done && (
                <div style={{
                  padding: '10px 14px', borderRadius: 10,
                  background: '#FFF8E8', border: '1px solid #FDE68A',
                  marginBottom: 16,
                }}>
                  <p style={{ margin: 0, fontSize: 11, color: '#92400E', lineHeight: 1.6 }}>
                    ⏳ 아직 등록되지 않은 항목입니다. 해당 접종/검진 완료 후 자동으로 업데이트됩니다.
                  </p>
                </div>
              )}

              <button
                onClick={() => setSelected(null)}
                style={{
                  width: '100%', padding: '12px',
                  background: selected.done
                    ? 'linear-gradient(135deg,#FF6B4A,#E8521F)'
                    : 'linear-gradient(135deg,#9CA3AF,#6B7280)',
                  border: 'none', borderRadius: 12, cursor: 'pointer',
                  color: 'white', fontWeight: 700, fontSize: 14,
                  fontFamily: "'Noto Sans KR', sans-serif",
                }}
              >확인</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
