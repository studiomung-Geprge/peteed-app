import { useRef, useState } from 'react'
import PeteedLogo from './PeteedLogo'
import type { HealthRecord } from './data/healthRecords'

const SvgCamera = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
    <circle cx="12" cy="13" r="3.5"/>
  </svg>
)
const SvgGallery = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)
const SvgDoc = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>
  </svg>
)
const SvgHospital = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)
const SvgCalendarIc = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const SvgPill = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4.5" y="4.5" width="15" height="15" rx="7.5" transform="rotate(45 12 12)"/><line x1="8" y1="16" x2="16" y2="8"/>
  </svg>
)
const SvgInfo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="8.01"/>
    <line x1="12" y1="12" x2="12" y2="16"/>
  </svg>
)

interface DocPreset {
  docType: string
  type: '진료' | '예방접종' | '처방'
  title: string
  hospital: string
  vet: string
  details: { label: string; value: string; icon: 'hospital' | 'calendar' | 'pill' | 'doc' }[]
  memo: string
  confidence: number
}

const TYPE_COLOR: Record<string, string> = { '진료': 'var(--ink)', '예방접종': 'var(--teal)', '처방': 'var(--gold)' }

// Simulated OCR document classification — cycles through realistic vet-document results.
const DOC_PRESETS: DocPreset[] = [
  {
    docType: '진단서', type: '진료', title: '정기 진료 소견서',
    hospital: '중앙동물병원', vet: '최유나 수의사', confidence: 94,
    details: [
      { label: '진단명', value: '경미한 피부염 (좌측 옆구리)', icon: 'doc' },
      { label: '처치 내용', value: '국소 소독 및 연고 처방', icon: 'hospital' },
      { label: '다음 내원', value: '2주 후 경과 관찰', icon: 'calendar' },
    ],
    memo: '증상 악화 시 즉시 내원 바랍니다. 환부 긁지 않도록 넥카라 권장.',
  },
  {
    docType: '접종증명서', type: '예방접종', title: '켄넬코프 예방접종 증명서',
    hospital: '해피동물병원', vet: '정다운 수의사', confidence: 97,
    details: [
      { label: '접종 항목', value: '켄넬코프 (Bordetella)', icon: 'doc' },
      { label: '백신 제조사', value: 'Bronchi-Shield III', icon: 'hospital' },
      { label: '다음 접종', value: '1년 후', icon: 'calendar' },
    ],
    memo: '접종 후 발열·기력저하 등 이상 반응 시 병원에 문의해 주세요.',
  },
  {
    docType: '처방전', type: '처방', title: '피부 소양증 처방전',
    hospital: '중앙동물병원', vet: '최유나 수의사', confidence: 92,
    details: [
      { label: '처방약', value: '항히스타민제 10일분', icon: 'pill' },
      { label: '복용법', value: '1일 1회, 아침 공복', icon: 'doc' },
      { label: '유효기간', value: '처방일로부터 30일', icon: 'calendar' },
    ],
    memo: '복용 후 구토·설사 등 증상 있으면 복용 중단 후 문의하세요.',
  },
  {
    docType: '예약증', type: '진료', title: '슬개골 재검진 예약증',
    hospital: '안동동물병원', vet: '김민준 수의사', confidence: 90,
    details: [
      { label: '예약 일시', value: '2주 후 오후 2시', icon: 'calendar' },
      { label: '예약 항목', value: '슬개골 경과 관찰', icon: 'doc' },
      { label: '준비 사항', value: '공복 상태로 내원', icon: 'hospital' },
    ],
    memo: '예약 변경은 하루 전까지 병원에 연락 바랍니다.',
  },
]

const ICONS = { hospital: <SvgHospital />, calendar: <SvgCalendarIc />, pill: <SvgPill />, doc: <SvgDoc /> }

function todayLabel() {
  const d = new Date()
  const pad2 = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}`
}

interface Props {
  onClose: () => void
  onRegister: (record: HealthRecord) => void
}

export default function HealthDocCapture({ onClose, onRegister }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<'select' | 'analyzing' | 'result'>('select')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [preset, setPreset] = useState<DocPreset | null>(null)
  const [analysisStep, setAnalysisStep] = useState(0)

  const STEPS = ['이미지 전처리 중…', '문서 텍스트 인식(OCR) 중…', '병원·날짜 정보 추출 중…', '진료 항목 자동 분류 중…', '분석 완료!']

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file)
    setPhotoUrl(url)
    setPhase('analyzing')
    setProgress(0)
    setAnalysisStep(0)

    let step = 0
    let prog = 0
    const stepInterval = setInterval(() => {
      step += 1
      setAnalysisStep(step)
      if (step >= STEPS.length - 1) clearInterval(stepInterval)
    }, 600)

    const progInterval = setInterval(() => {
      prog += Math.random() * 8 + 3
      if (prog >= 100) {
        prog = 100
        clearInterval(progInterval)
        clearInterval(stepInterval)
        setAnalysisStep(STEPS.length - 1)
        setProgress(100)
        setTimeout(() => {
          const chosen = DOC_PRESETS[Math.floor(Math.random() * DOC_PRESETS.length)]
          setPreset(chosen)
          setPhase('result')
        }, 400)
      }
      setProgress(Math.min(prog, 100))
    }, 120)
  }

  const triggerCamera = () => fileInputRef.current?.click()

  const handleRegisterClick = () => {
    if (!preset || !photoUrl) return
    const record: HealthRecord = {
      date: todayLabel(),
      title: preset.title,
      type: preset.type,
      hospital: preset.hospital,
      vet: preset.vet,
      img: photoUrl,
      details: preset.details.map(({ label, value }) => ({ label, value })),
      memo: preset.memo,
    }
    onRegister(record)
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute', inset: 0, zIndex: 200,
        background: 'rgba(10,16,30,.88)',
        backdropFilter: 'blur(14px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-end',
        animation: 'fadeIn .22s ease',
      }}
    >
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:.5;transform:scale(.95)} 50%{opacity:1;transform:scale(1.05)} }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          background: 'var(--paper)',
          borderRadius: '28px 28px 0 0',
          overflow: 'hidden',
          maxHeight: '88%',
          display: 'flex', flexDirection: 'column',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
        />

        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--hair)' }} />
        </div>

        {/* ── PHASE: SELECT ── */}
        {phase === 'select' && (
          <div style={{ padding: '8px 24px 32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 0 6px' }}>
              <PeteedLogo size={120} showTagline={false} />
              <h2 style={{ fontFamily: "'Noto Sans KR'", fontWeight: 900, fontSize: 18, color: 'var(--ink)', margin: '4px 0 0', textAlign: 'center' }}>
                건강기록 촬영
              </h2>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--ink-70)', margin: '0 0 24px', lineHeight: 1.6, textAlign: 'center' }}>
              진단서 · 접종증명서 · 처방전 · 예약증을 촬영하면<br />AI가 자동으로 읽어서 정리해 드려요
            </p>

            <div style={{
              borderRadius: 16, padding: '16px', marginBottom: 20,
              background: 'linear-gradient(135deg, var(--ink-2) 0%, var(--ink) 100%)',
              color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center',
            }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>AI 문서 인식 기능</div>
              <div style={{ fontSize: 11, opacity: .8, lineHeight: 1.55 }}>문서 종류 판별 · 병원명 추출 · 진료일 인식 · 진료 항목 자동 분류를 처리해 건강기록에 등록해 드립니다</div>
            </div>

            <button
              onClick={triggerCamera}
              style={{
                width: '100%', border: 'none', borderRadius: 18, padding: '20px 16px',
                background: 'linear-gradient(135deg, var(--gold) 0%, var(--teal) 100%)',
                color: '#fff', cursor: 'pointer', marginBottom: 10,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                boxShadow: '0 10px 28px -8px rgba(255,107,74,.5)',
              }}
            >
              <span style={{ color: '#fff', display: 'flex' }}><SvgCamera size={36} /></span>
              <span style={{ fontFamily: "'Noto Sans KR'", fontWeight: 700, fontSize: 15 }}>서류 촬영하기</span>
            </button>

            <button
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.removeAttribute('capture')
                  fileInputRef.current.click()
                  setTimeout(() => fileInputRef.current?.setAttribute('capture', 'environment'), 500)
                }
              }}
              style={{
                width: '100%', border: '1.5px solid var(--hair)', borderRadius: 18, padding: '16px',
                background: '#fff', color: 'var(--ink)', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              }}
            >
              <span style={{ color: 'var(--ink)', display: 'flex' }}><SvgGallery size={28} /></span>
              <span style={{ fontFamily: "'Noto Sans KR'", fontWeight: 700, fontSize: 14 }}>갤러리에서 선택하기</span>
            </button>
          </div>
        )}

        {/* ── PHASE: ANALYZING ── */}
        {phase === 'analyzing' && photoUrl && (
          <div style={{ padding: '8px 24px 32px' }}>
            <h2 style={{ fontFamily: "'Noto Sans KR'", fontWeight: 900, fontSize: 20, color: 'var(--ink)', margin: '0 0 20px' }}>
              문서 분석 중…
            </h2>

            <div style={{ position: 'relative', marginBottom: 20 }}>
              <img
                src={photoUrl}
                alt="촬영된 서류"
                style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 16, display: 'block' }}
              />
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 16,
                background: 'linear-gradient(180deg, rgba(47,111,98,.2) 0%, transparent 100%)',
                border: '2px solid rgba(47,111,98,.5)',
              }} />
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                width: 56, height: 56, borderRadius: '50%',
                border: '3px solid var(--teal)',
                borderTopColor: 'transparent',
                animation: 'spin .9s linear infinite',
              }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
              {STEPS.map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
                    background: analysisStep > i ? 'var(--teal)' : analysisStep === i ? 'var(--gold)' : 'var(--paper-2)',
                    color: analysisStep >= i ? '#fff' : 'var(--ink-45)',
                    transition: 'all .3s ease',
                    animation: analysisStep === i ? 'pulse .8s ease infinite' : 'none',
                  }}>
                    {analysisStep > i ? '✓' : i + 1}
                  </div>
                  <span style={{
                    fontSize: 12.5, fontWeight: analysisStep === i ? 700 : 400,
                    color: analysisStep >= i ? 'var(--ink)' : 'var(--ink-45)',
                    transition: 'all .3s ease',
                  }}>{step}</span>
                </div>
              ))}
            </div>

            <div style={{ height: 6, borderRadius: 3, background: 'var(--paper-2)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 3,
                background: 'linear-gradient(90deg, var(--teal), var(--gold))',
                width: `${progress}%`, transition: 'width .15s ease',
              }} />
            </div>
            <p style={{ fontSize: 11, color: 'var(--ink-45)', textAlign: 'right', margin: '6px 0 0' }}>
              {Math.round(progress)}%
            </p>
          </div>
        )}

        {/* ── PHASE: RESULT ── */}
        {phase === 'result' && preset && photoUrl && (
          <div style={{ overflowY: 'auto', padding: '8px 24px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <h2 style={{ fontFamily: "'Noto Sans KR'", fontWeight: 900, fontSize: 20, color: 'var(--ink)', margin: 0 }}>
                분석 완료!
              </h2>
              <div style={{
                fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                background: 'var(--teal-light)', color: 'var(--teal)',
              }}>AI 인식</div>
            </div>

            <div style={{ position: 'relative', marginBottom: 16 }}>
              <img
                src={photoUrl}
                alt="촬영된 서류"
                style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 16, display: 'block' }}
              />
              <div style={{
                position: 'absolute', bottom: 10, left: 10,
                background: 'rgba(10,16,30,.75)', backdropFilter: 'blur(8px)',
                borderRadius: 10, padding: '6px 12px', color: '#fff',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ color: '#fff' }}><SvgDoc /></span>
                <div>
                  <div style={{ fontFamily: "'Noto Sans KR'", fontWeight: 700, fontSize: 13 }}>{preset.docType}</div>
                  <div style={{ fontSize: 10, opacity: .7 }}>{preset.title}</div>
                </div>
                <div style={{
                  marginLeft: 6, padding: '2px 7px', borderRadius: 20,
                  background: 'rgba(201,154,61,.3)', color: '#EAD09B',
                  fontSize: 10, fontWeight: 700,
                }}>신뢰도 {preset.confidence}%</div>
              </div>
            </div>

            <div style={{ marginBottom: 16, padding: '12px 14px', background: '#fff', borderRadius: 14, border: '1px solid var(--hair)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink)' }}>OCR 인식 신뢰도</span>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--teal)' }}>{preset.confidence}%</span>
              </div>
              <div style={{ height: 5, borderRadius: 3, background: 'var(--paper-2)' }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  background: 'linear-gradient(90deg, var(--teal), var(--gold))',
                  width: `${preset.confidence}%`,
                }} />
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--hair)', marginBottom: 12, overflow: 'hidden' }}>
              <div style={{
                padding: '10px 14px', borderBottom: '1px solid var(--hair)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--ink-45)', letterSpacing: '.06em' }}>
                  AI 분석 결과 — 수정 후 등록 가능
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                  background: TYPE_COLOR[preset.type], color: '#fff',
                }}>{preset.type}</span>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '11px 14px', borderBottom: '1px solid var(--hair)',
              }}>
                <span style={{ width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-70)' }}><SvgHospital /></span>
                <span style={{ fontSize: 12, color: 'var(--ink-45)', flex: '0 0 70px' }}>병원</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)', flex: 1 }}>{preset.hospital} · {preset.vet}</span>
                <span style={{ fontSize: 10, color: 'var(--ink-45)' }}>수정 ›</span>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '11px 14px', borderBottom: '1px solid var(--hair)',
              }}>
                <span style={{ width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-70)' }}><SvgCalendarIc /></span>
                <span style={{ fontSize: 12, color: 'var(--ink-45)', flex: '0 0 70px' }}>인식 날짜</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)', flex: 1 }}>{todayLabel()}</span>
                <span style={{ fontSize: 10, color: 'var(--ink-45)' }}>수정 ›</span>
              </div>
              {preset.details.map(({ label, value, icon }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 14px', borderBottom: '1px solid var(--hair)',
                }}>
                  <span style={{ width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-70)' }}>{ICONS[icon]}</span>
                  <span style={{ fontSize: 12, color: 'var(--ink-45)', flex: '0 0 70px' }}>{label}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)', flex: 1 }}>{value}</span>
                  <span style={{ fontSize: 10, color: 'var(--ink-45)' }}>수정 ›</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 10.5, color: 'var(--ink-45)', lineHeight: 1.6, margin: '0 0 16px' }}>
              <span style={{ display:'inline-flex', alignItems:'center', gap:5, verticalAlign:'middle', color:'var(--ink-45)' }}><SvgInfo /></span>{' '}OCR 분석 결과는 참고용이에요. 정확한 정보는 직접 수정하여 등록해 주세요.
            </p>

            <button
              onClick={handleRegisterClick}
              style={{
                width: '100%', border: 'none', borderRadius: 16, padding: '15px',
                background: 'linear-gradient(135deg, var(--ink-2) 0%, var(--ink) 100%)',
                color: '#fff', cursor: 'pointer', marginBottom: 8,
                fontFamily: "'Noto Sans KR'", fontWeight: 700, fontSize: 15,
                boxShadow: '0 10px 24px -10px rgba(22,35,61,.5)',
              }}
            >
              이 정보로 건강기록에 추가하기
            </button>
            <button
              onClick={() => { setPhase('select'); setPhotoUrl(null); setPreset(null) }}
              style={{
                width: '100%', border: '1.5px solid var(--hair)', borderRadius: 16, padding: '13px',
                background: '#fff', color: 'var(--ink)', cursor: 'pointer',
                fontFamily: "'Noto Sans KR'", fontWeight: 700, fontSize: 14,
              }}
            >
              다시 촬영하기
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
