interface Props {
  label: string
  busy: boolean
  onCancel: () => void
  onConfirm: () => void
}

// 계정 연동 스위치를 OFF로 누르면 바로 해제해버리지 않고 이 확인 팝업을
// 먼저 띄운다 — 해제하면 연결 정보가 지워지고, 다시 연동하려면 해당
// 플랫폼 로그인 창을 처음부터 다시 거쳐야 한다는 걸 미리 알려주기 위함.
export default function ConfirmDisconnectModal({ label, busy, onCancel, onConfirm }: Props) {
  return (
    <div onClick={busy ? undefined : onCancel} style={{
      position: 'absolute', inset: 0, zIndex: 210,
      background: 'rgba(10,16,30,.78)',
      backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 24px',
      animation: 'fadeIn .2s ease',
    }}>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:scale(.94) } to { opacity:1; transform:scale(1) } }`}</style>

      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 320,
        background: '#FFFAF7',
        borderRadius: 22,
        padding: '24px 22px 20px',
        boxShadow: '0 24px 56px -16px rgba(0,0,0,.5)',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', margin: '0 0 14px',
          background: '#FDEAE6', color: '#C1442E',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v4"/><path d="M12 17h.01"/>
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/>
          </svg>
        </div>
        <h2 style={{ margin: '0 0 8px', fontFamily: "'Noto Sans KR', sans-serif", fontSize: 15.5, fontWeight: 800, color: '#1C1C1A' }}>
          {label} 연동을 해제할까요?
        </h2>
        <p style={{ margin: '0 0 20px', fontFamily: "'Noto Sans KR', sans-serif", fontSize: 12.5, lineHeight: 1.65, color: '#7A5C52' }}>
          지금 해제하면 {label} 계정과의 연결 정보가 삭제돼요. 나중에 다시 연동하려면 {label} 로그인 화면에서 처음부터 새로 연동해야 해요.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            style={{
              flex: 1, padding: '12px', borderRadius: 13,
              border: '1.5px solid var(--hair)', background: '#fff', color: 'var(--ink-70)',
              fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 700, fontSize: 13,
              cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1,
            }}
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            style={{
              flex: 1, padding: '12px', borderRadius: 13, border: 'none',
              background: '#C1442E', color: '#fff',
              fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 700, fontSize: 13,
              cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.75 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            }}
          >
            {busy && (
              <span style={{
                width: 13, height: 13, borderRadius: '50%',
                border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff',
                display: 'inline-block', animation: 'mp-spin .7s linear infinite',
              }} />
            )}
            해제하기
          </button>
        </div>
      </div>
    </div>
  )
}
