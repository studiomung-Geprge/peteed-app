import StampBadges from '../StampBadges'
import { Icons } from '../icons'

interface Props {
  petPhoto: string
  petBreed: string
  petName: string
  guardianName: string
  onPhotoClick: () => void
  onQRClick: () => void
  onViewAllClick: () => void
  onQuickAction: (key: 'health' | 'facilities' | 'missing' | 'blood') => void
  onLogout: () => void
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

export default function HomeTab({ petPhoto, petBreed, petName, guardianName, onPhotoClick, onQRClick, onViewAllClick, onQuickAction, onLogout }: Props) {
  return (
    <>
      <p className="eyebrow">GYEONGSANGBUK-DO · PETEED</p>
      <h1 className="page-title">안녕하세요, {guardianName} 보호자님</h1>
      <p className="sub">경상북도 안동시 · 오늘도 {petName}와 좋은 하루 보내세요</p>

      <div className="passport-card">
        <div className="passport-top">
          <div className="gov-mark">
            <div className="txt">PETEED에서 발급한<b>반려동물 디지털 신분증</b></div>
          </div>
          <div className="status-chip">등록완료</div>
        </div>
        <div className="passport-body">
          <div style={{ flexShrink: 0 }}>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={onPhotoClick}>
              <img className="pet-photo" src={petPhoto} alt={petName} />
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 15,
                background: 'rgba(0,0,0,.38)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0, transition: 'opacity .2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="3.5"/>
                </svg>
              </div>
            </div>
            <div onClick={onPhotoClick} style={{
              marginTop: 7,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              cursor: 'pointer', width: '100%',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="3"/>
              </svg>
              <span style={{ fontSize: 10, color: 'var(--gold)', fontWeight: 600, whiteSpace: 'nowrap' }}>프로필 사진 변경</span>
            </div>
          </div>
          <div className="pet-id-info">
            <p className="pet-name">{petName}</p>
            <p className="pet-breed">{petBreed}</p>
            <div className="id-row"><span>동물등록번호</span><b>41000-1234567</b></div>
            <div className="id-row"><span>PETEED</span><b>GPET-2026-000124</b></div>
          </div>
        </div>
        <div className="passport-foot">
          <StampBadges />
          <div onClick={onQRClick} style={{ cursor: 'pointer', transition: 'transform .15s', borderRadius: 10 }} title="신분증 QR 확대">
            <QRCode />
          </div>
        </div>
      </div>

      <div className="section-label">빠른 실행</div>
      <div className="quick-grid">
        <div className="quick-item" role="button" tabIndex={0} style={{ cursor: 'pointer' }}
          onClick={() => onQuickAction('health')}
          onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onQuickAction('health')}
        >
          <div className="quick-icon" style={{ background: 'var(--teal-light)' }}>{Icons.camera('#E8521F')}</div>
          <span className="quick-label">건강기록<br />추가</span>
        </div>
        <div className="quick-item" role="button" tabIndex={0} style={{ cursor: 'pointer' }}
          onClick={() => onQuickAction('facilities')}
          onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onQuickAction('facilities')}
        >
          <div className="quick-icon" style={{ background: 'var(--gold-light)' }}>{Icons.pin('#FF6B4A')}</div>
          <span className="quick-label">시설<br />예약</span>
        </div>
        <div className="quick-item" role="button" tabIndex={0} style={{ cursor: 'pointer' }}
          onClick={() => onQuickAction('missing')}
          onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onQuickAction('missing')}
        >
          <div className="quick-icon" style={{ background: 'var(--coral-light)' }}>{Icons.alert('#C1442E')}</div>
          <span className="quick-label">실종<br />신고</span>
        </div>
        <div className="quick-item" role="button" tabIndex={0} style={{ cursor: 'pointer' }}
          onClick={() => onQuickAction('blood')}
          onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onQuickAction('blood')}
        >
          <div className="quick-icon" style={{ background: 'var(--paper-2)' }}>{Icons.drop('#8B2020')}</div>
          <span className="quick-label">헌혈<br />매칭</span>
        </div>
      </div>

      <div className="section-label">알림 <span className="more" style={{ cursor: 'pointer' }} onClick={onViewAllClick}>전체보기</span></div>
      <div className="card" style={{ padding: '2px 15px' }}>
        <div className="notif">
          <div className="dot2" /><div><b>DHPP 예방접종 예정 · D-5</b><span>2026.06.05 · 안동동물병원</span></div>
        </div>
        <div className="notif">
          <div className="dot2" /><div><b>동물등록 갱신 안내</b><span>등록 유효기간 만료 30일 전</span></div>
        </div>
        <div className="notif">
          <div className="dot2" /><div><b>영양 동물복지센터 신규 개장</b><span>디지털 예약이 오픈되었어요</span></div>
        </div>
      </div>

      <div style={{ textAlign: 'center', margin: '18px 0 4px' }}>
        <span onClick={onLogout} style={{ fontSize: 11, color: 'var(--ink-45)', cursor: 'pointer', textDecoration: 'underline' }}>
          로그아웃
        </span>
      </div>
    </>
  )
}
