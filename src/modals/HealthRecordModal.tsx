import { HEALTH_RECORDS } from '../data/healthRecords'

interface Props { id: number; onClose: () => void }

export default function HealthRecordModal({ id, onClose }: Props) {
  const rec = HEALTH_RECORDS[id]
  if (!rec) return null
  const chipColors: Record<string, string> = { '진료': 'var(--ink)', '예방접종': 'var(--teal)', '처방': 'var(--gold)' }
  const chipColor = chipColors[rec.type] ?? 'var(--ink)'

  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 200,
      background: 'rgba(10,16,30,.80)',
      backdropFilter: 'blur(10px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '0 16px',
      animation: 'fadeIn .2s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 320,
        background: '#FFFAF7',
        borderRadius: 22,
        overflow: 'hidden',
        boxShadow: '0 24px 56px -16px rgba(0,0,0,.55)',
        maxHeight: '88vh',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img src={rec.img} alt={rec.title} style={{ width: '100%', height: 148, objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.55) 0%, transparent 55%)' }} />
          <button onClick={onClose} style={{
            position: 'absolute', top: 10, right: 10,
            width: 30, height: 30, borderRadius: '50%',
            background: 'rgba(0,0,0,.4)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <div style={{ position: 'absolute', bottom: 12, left: 14, right: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: chipColor, color: 'white' }}>{rec.type}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,.8)' }}>{rec.date}</span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 15, fontWeight: 700, color: 'white' }}>{rec.title}</p>
          </div>
        </div>

        <div style={{ overflowY: 'auto', padding: '16px 18px 20px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, padding: '10px 12px', background: '#FFF3F0', borderRadius: 10 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#1C1C1A' }}>{rec.hospital}</p>
              <p style={{ margin: 0, fontSize: 10.5, color: '#888' }}>{rec.vet}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', borderRadius: 12, overflow: 'hidden', border: '1px solid #F0E8E4' }}>
            {rec.details.map((d, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                padding: '10px 12px',
                background: i % 2 === 0 ? '#FFFAF7' : '#FFF5F2',
                borderBottom: i < rec.details.length - 1 ? '1px solid #F0E8E4' : 'none',
              }}>
                <span style={{ fontSize: 11, color: '#888', flexShrink: 0, marginRight: 12 }}>{d.label}</span>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: '#1C1C1A', textAlign: 'right' }}>{d.value}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12, padding: '10px 12px', background: '#FFF8F0', borderRadius: 10, borderLeft: '3px solid var(--gold)' }}>
            <p style={{ margin: '0 0 3px', fontSize: 10, fontWeight: 700, color: 'var(--gold)', letterSpacing: '.05em' }}>수의사 메모</p>
            <p style={{ margin: 0, fontSize: 11.5, color: '#555', lineHeight: 1.6 }}>{rec.memo}</p>
          </div>

          <button onClick={onClose} style={{
            marginTop: 16, width: '100%', padding: '12px',
            background: 'linear-gradient(135deg,#FF6B4A,#E8521F)',
            border: 'none', borderRadius: 12, cursor: 'pointer',
            color: 'white', fontWeight: 700, fontSize: 14,
            fontFamily: "'Noto Sans KR', sans-serif",
          }}>닫기</button>
        </div>
      </div>
    </div>
  )
}
