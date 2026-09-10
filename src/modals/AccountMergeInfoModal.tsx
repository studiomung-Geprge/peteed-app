interface Props {
  onClose: () => void
}

// 계정 연동 섹션의 (?) 버튼으로 열리는 순수 안내 팝업 — 저장/제출 없이
// 계정 통합이 언제 자동으로 되고, 언제 직접 연결해야 하는지만 설명한다.
// 스타일은 EditPersonalInfoModal과 동일한 오버레이/카드 패턴을 따른다.
export default function AccountMergeInfoModal({ onClose }: Props) {
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
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:scale(.94) } to { opacity:1; transform:scale(1) } }
        .ami-section + .ami-section { margin-top: 16px; }
        .ami-section h4 {
          margin: 0 0 5px; font-family:'Noto Sans KR',sans-serif;
          font-size: 12.5px; font-weight: 800; color: #E8521F;
        }
        .ami-section p {
          margin: 0; font-family:'Noto Sans KR',sans-serif;
          font-size: 12px; line-height: 1.65; color: #4A3B34;
        }
        .ami-body::-webkit-scrollbar { width: 5px; }
        .ami-body::-webkit-scrollbar-thumb { background: #E8D5CE; border-radius: 3px; }
      `}</style>

      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 340, maxHeight: '82vh',
        background: '#FFFAF7',
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 24px 56px -16px rgba(0,0,0,.5)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          background: 'linear-gradient(135deg,#FF6B4A 0%,#E8521F 100%)',
          padding: '20px 20px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 16, fontFamily: "'Noto Sans KR', sans-serif" }}>계정 통합 안내</div>
            <div style={{ color: 'rgba(255,255,255,.8)', fontSize: 11, marginTop: 2 }}>여러 로그인 방법을 하나의 계정으로 연결하는 방법</div>
          </div>
          <button onClick={onClose} style={{
            width: 26, height: 26, borderRadius: '50%',
            background: 'rgba(255,255,255,.2)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="ami-body" style={{ padding: '18px 20px 20px', overflowY: 'auto' }}>
          <div className="ami-section">
            <h4>이메일이 같으면 자동으로 통합돼요</h4>
            <p>가입할 때 쓴 이메일 주소가 완전히 같으면, 다른 방법으로 로그인해도 자동으로 같은 계정이 돼요. 예를 들어 abc@gmail.com으로 이메일 가입을 한 뒤, 같은 abc@gmail.com 계정으로 구글 로그인을 하면 자동으로 하나의 계정으로 이어져요.</p>
          </div>
          <div className="ami-section">
            <h4>이메일이 다르면 자동으로 합쳐지지 않아요</h4>
            <p>이메일 주소가 서로 다르면 자동으로는 통합되지 않아요. 예를 들어 이메일 가입은 abc@naver.com으로 했는데 카카오 계정의 이메일이 abc@gmail.com이라면, 시스템은 이 둘을 서로 다른 사람으로 인식해서 별도의 계정으로 남아요.</p>
          </div>
          <div className="ami-section">
            <h4>이럴 땐 이렇게 하세요</h4>
            <p>지금 계속 쓰고 싶은 계정으로 로그인한 상태에서, 계정 연동 목록에 있는 스위치를 켜세요. 해당 플랫폼의 로그인 창이 뜨고, 완료되면 지금 로그인한 계정에 바로 연결돼요. 그다음부터는 그 플랫폼으로 로그인해도 항상 같은 계정으로 들어와요.</p>
          </div>
          <div className="ami-section">
            <h4>알아두면 좋은 점</h4>
            <p>이미 다른 계정에 연결되어 있는 소셜 계정은 중복으로 연결할 수 없어요 — 먼저 그 계정에서 연결을 해제한 뒤 다시 시도해 주세요. 그리고 로그인할 방법이 하나도 없어지지 않도록, 마지막으로 남은 연동 수단은 해제할 수 없어요.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
