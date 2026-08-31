import type { MissingReport, ReportStatus } from '../data/missingReports'

interface Props {
  report: MissingReport
  onClose: () => void
  mineActive?: boolean
  confirming?: boolean
  onRequestCancel?: () => void
  onConfirmCancel?: () => void
  onDismissCancel?: () => void
}

const STATUS_STYLE: Record<ReportStatus, { bg: string; fg: string }> = {
  '진행중': { bg: '#FFF0EB', fg: '#E8521F' },
  '발견완료': { bg: '#E9F7EF', fg: '#1E9E5A' },
  '매칭완료': { bg: '#EBF5FF', fg: '#2563EB' },
}

export default function ReportDetailModal({
  report, onClose, mineActive, confirming, onRequestCancel, onConfirmCancel, onDismissCancel,
}: Props) {
  const st = STATUS_STYLE[report.status]

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
      <style>{`@keyframes fadeIn { from { opacity:0; transform:scale(.94) } to { opacity:1; transform:scale(1) } }`}</style>

      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 320, maxHeight: '88%', overflowY: 'auto',
        background: '#FFFAF7',
        borderRadius: 24,
        boxShadow: '0 24px 56px -16px rgba(0,0,0,.5)',
      }}>
        {/* Hero photo */}
        <div style={{ position: 'relative' }}>
          <img src={report.photo} alt={report.petName} style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,.42) 100%)' }} />
          <button onClick={onClose} style={{
            position: 'absolute', top: 12, right: 12,
            width: 28, height: 28, borderRadius: '50%',
            background: 'rgba(0,0,0,.42)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <div style={{ position: 'absolute', bottom: 10, left: 12, display: 'flex', gap: 6 }}>
            <span style={{
              fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 20,
              background: report.kind === '실종' ? 'rgba(232,82,31,.92)' : 'rgba(184,52,42,.92)', color: '#fff',
            }}>{report.kind}</span>
            <span style={{
              fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 20,
              background: st.bg, color: st.fg,
            }}>{report.status}</span>
          </div>
        </div>

        <div style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: '#1C1C1A', fontFamily: "'Noto Sans KR',sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
              {report.petName}
              {report.mine && <span style={{ fontSize: 10, fontWeight: 700, color: '#FF6B4A' }}>내 신고</span>}
            </h2>
            <span style={{ fontSize: 10.5, color: '#bbb', flexShrink: 0 }}>{report.reportedAt}</span>
          </div>

          <p style={{ margin: 0, fontSize: 12.5, color: '#7A5C52', fontFamily: "'Noto Sans KR',sans-serif" }}>{report.info}</p>

          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            padding: '12px 14px', background: '#fff', borderRadius: 14, border: '1px solid var(--hair)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--coral)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 10.5, color: '#999', fontWeight: 700 }}>위치</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, fontWeight: 600, color: '#1C1C1A', lineHeight: 1.4 }}>{report.location}</p>
            </div>
          </div>

          {report.notes && (
            <div style={{ background: '#FFF7F4', borderRadius: 12, padding: '10px 12px' }}>
              <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: '#B8342A' }}>특이사항</p>
              <p style={{ margin: '4px 0 0', fontSize: 11.5, color: '#7A5C52', lineHeight: 1.6 }}>“{report.notes}”</p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: '#bbb' }}>
            <span>신고 번호</span>
            <span style={{ fontFamily: "'Roboto Mono',monospace", color: '#999' }}>{report.id}</span>
          </div>

          {mineActive && (
            confirming ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 10.5, color: '#7A5C52' }}>정말 찾으셨나요? 신고를 종료할게요</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={onDismissCancel}
                    style={{
                      flex: 1, padding: '9px 0', borderRadius: 10, border: '1.5px solid #E0E0E0',
                      background: '#fff', color: '#888', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      fontFamily: "'Noto Sans KR', sans-serif",
                    }}
                  >아니오</button>
                  <button
                    onClick={onConfirmCancel}
                    style={{
                      flex: 1, padding: '9px 0', borderRadius: 10, border: 'none',
                      background: '#1E9E5A', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      fontFamily: "'Noto Sans KR', sans-serif",
                    }}
                  >네, 찾았어요</button>
                </div>
              </div>
            ) : (
              <button
                onClick={onRequestCancel}
                style={{
                  width: '100%', padding: '11px 0', borderRadius: 12,
                  border: '1.5px solid #1E9E5A', background: '#F2FBF6', color: '#1E9E5A',
                  fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                  fontFamily: "'Noto Sans KR', sans-serif",
                }}
              >찾았어요 · 신고 취소</button>
            )
          )}

          {!mineActive && (
            <button
              onClick={onClose}
              style={{
                width: '100%', padding: '12px 0', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg,#FF6B4A,#E8521F)', color: '#fff',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                fontFamily: "'Noto Sans KR', sans-serif",
              }}
            >닫기</button>
          )}
        </div>
      </div>
    </div>
  )
}
