interface Props {
  onOpenCamera: () => void
  onSelectRecord: (id: number) => void
}

const RECORDS = [
  { id: 0, date: '2026.06.02', title: '슬개골 정기 검진', chip: 'ink', label: '진료' },
  { id: 1, date: '2026.05.20', title: '종합백신(DHPP) 2차', chip: 'teal', label: '예방접종' },
  { id: 2, date: '2026.05.02', title: '심장사상충 예방약 처방', chip: 'gold', label: '처방' },
  { id: 3, date: '2026.04.11', title: '스케일링 · 구강 검진', chip: 'ink', label: '진료' },
]

export default function HealthTab({ onOpenCamera, onSelectRecord }: Props) {
  return (
    <>
      <p className="eyebrow">HEALTH RECORD</p>
      <h1 className="page-title">건강기록</h1>
      <p className="sub">진료 서류를 촬영하면 AI가 자동으로 정리해요</p>

      <div className="flow-cta" style={{ cursor: 'pointer' }} onClick={onOpenCamera}>
        <div className="ic">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="3.5"/>
          </svg>
        </div>
        <div><b>사진으로 기록 추가</b><span>진료확인서 · 접종증명서 촬영</span></div>
      </div>

      <div className="flow-steps">
        <div className="flow-step"><div className="num">1</div><span className="lbl">사진<br />촬영</span></div>
        <div className="flow-arrow">→</div>
        <div className="flow-step"><div className="num">2</div><span className="lbl">OCR<br />인식</span></div>
        <div className="flow-arrow">→</div>
        <div className="flow-step"><div className="num">3</div><span className="lbl">AI 데이터<br />분류</span></div>
        <div className="flow-arrow">→</div>
        <div className="flow-step"><div className="num">4</div><span className="lbl">건강기록<br />자동저장</span></div>
      </div>

      <div className="section-label">최근 기록</div>
      {RECORDS.map(rec => (
        <div key={rec.id} className="tl-item" style={{ alignItems: 'center' }}>
          <div className="tl-dot" />
          <div style={{ flex: 1 }}>
            <p className="tl-date">{rec.date}</p>
            <p className="tl-title">{rec.title}</p>
            <span className={`chip ${rec.chip}`}>{rec.label}</span>
          </div>
          <button
            onClick={() => onSelectRecord(rec.id)}
            style={{
              flexShrink: 0, marginLeft: 8,
              padding: '5px 10px', borderRadius: 8,
              border: '1.5px solid var(--gold)',
              background: 'transparent', cursor: 'pointer',
              fontSize: 10.5, fontWeight: 700, color: 'var(--gold)',
              fontFamily: "'Roboto Mono', monospace", letterSpacing: '.04em',
            }}
          >VIEW</button>
        </div>
      ))}
    </>
  )
}
