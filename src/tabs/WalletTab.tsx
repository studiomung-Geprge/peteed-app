import StampBadges from '../StampBadges'

interface Props {
  petName: string
  petPhoto: string
  guardianName: string
  onQRClick: () => void
  onSelectRecord: (id: number) => void
  onSelectGuardian: (g: 'A' | 'B') => void
}

function QRCode({ size = 50 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" style={{ borderRadius: 10, background: '#fff', padding: 5 }}>
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
      </g>
    </svg>
  )
}

const ViewBtn = ({ onClick }: { onClick: () => void }) => (
  <button onClick={e => { e.stopPropagation(); onClick() }} style={{
    padding: '3px 8px', borderRadius: 6,
    border: '1.5px solid var(--gold)', background: 'transparent',
    fontSize: 10, fontWeight: 700, color: 'var(--gold)',
    fontFamily: "'Roboto Mono', monospace", cursor: 'pointer',
  }}>VIEW</button>
)

const PulseIcon = (color: string) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>
)

export default function WalletTab({ petName, petPhoto, guardianName, onQRClick, onSelectRecord, onSelectGuardian }: Props) {
  return (
    <>
      <p className="eyebrow">PETEED</p>
      <h1 className="page-title">{petName}의 ID</h1>
      <p className="sub">PETEED에서 발급한 반려동물 디지털 신분증이에요</p>

      <div className="passport-card">
        <div className="passport-top">
          <div className="gov-mark">
            <div className="txt">GYEONGSANGBUK-DO<b>PETEED DIGITAL ID</b></div>
          </div>
          <div className="status-chip">GPET-2026-000124</div>
        </div>
        <div className="passport-body">
          <img className="pet-photo" src={petPhoto} alt={petName} />
          <div className="pet-id-info">
            <p className="pet-name">{petName}</p>
            <p className="pet-breed">사모예드 · 2022.05.06생</p>
            <div className="id-row"><span>동물등록번호</span><b>41000-1234567</b></div>
            <div className="id-row"><span>최초등록일</span><b>2024.05.06</b></div>
            <div className="id-row"><span>보호자</span><b>{guardianName}</b></div>
          </div>
        </div>
        <div className="passport-foot">
          <StampBadges />
          <div onClick={onQRClick} style={{ cursor: 'pointer', transition: 'transform .15s', borderRadius: 10 }}>
            <QRCode size={56} />
          </div>
        </div>
      </div>

      <div className="section-label">예방접종 이력</div>
      <div className="card" style={{ cursor: 'pointer' }} onClick={() => onSelectRecord(1)}>
        <div className="row" style={{ alignItems: 'center' }}>
          <div className="row-icon" style={{ background: 'var(--teal-light)' }}>{PulseIcon('var(--teal)')}</div>
          <div style={{ flex: 1 }}>
            <p className="row-title">종합백신(DHPP) 2차</p>
            <p className="row-sub">2026.05.20 · 안동동물병원 · 박서연 수의사</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
            <div className="chip teal">완료</div>
            <ViewBtn onClick={() => onSelectRecord(1)} />
          </div>
        </div>
      </div>
      <div className="card" style={{ cursor: 'pointer' }} onClick={() => onSelectRecord(4)}>
        <div className="row" style={{ alignItems: 'center' }}>
          <div className="row-icon" style={{ background: 'var(--gold-light)' }}>{PulseIcon('var(--gold)')}</div>
          <div style={{ flex: 1 }}>
            <p className="row-title">광견병 백신</p>
            <p className="row-sub">2026.06.05 예정 · D-5 · 안동동물병원</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
            <div className="chip gold">예정</div>
            <ViewBtn onClick={() => onSelectRecord(4)} />
          </div>
        </div>
      </div>

      <div className="section-label">가족 구성원</div>
      <div className="card" style={{ cursor: 'pointer' }} onClick={() => onSelectGuardian('A')}>
        <div className="row">
          <div className="row-icon" style={{ background: 'var(--paper-2)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}><p className="row-title">보호자 A · {guardianName} (주보호자)</p><p className="row-sub">010-xxxx-xxxx · 정부24 연동</p></div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-45)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
      <div className="card" style={{ cursor: 'pointer' }} onClick={() => onSelectGuardian('B')}>
        <div className="row">
          <div className="row-icon" style={{ background: 'var(--paper-2)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}><p className="row-title">보호자 B · 공동 관리자</p><p className="row-sub">가족 공유 3건 · 정부24 연동</p></div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-45)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
    </>
  )
}
