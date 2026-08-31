import { useRef, useState } from 'react'
import PeteedLogo from './PeteedLogo'

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

function GeminiLogo() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gem1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4285F4"/>
          <stop offset="50%" stopColor="#9B72CB"/>
          <stop offset="100%" stopColor="#D96570"/>
        </linearGradient>
      </defs>
      <path d="M24 4 C24 4 26.5 16 36 24 C26.5 32 24 44 24 44 C24 44 21.5 32 12 24 C21.5 16 24 4 24 4Z" fill="url(#gem1)"/>
      <path d="M24 10 C24 10 25.5 18 32 24 C25.5 30 24 38 24 38 C24 38 22.5 30 16 24 C22.5 18 24 10 24 10Z" fill="white" opacity="0.25"/>
    </svg>
  )
}
const SvgPaw = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7" cy="7" r="1.5"/><circle cx="12" cy="5" r="1.5"/><circle cx="17" cy="7" r="1.5"/>
    <path d="M12 22c-3 0-7-3-7-8a5 5 0 0 1 10 0c0 5-4 8-7 8z"/>
  </svg>
)
const SvgCake = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/>
    <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2 1 2 1"/>
    <path d="M2 21h20M12 3v4M10 5l2-2 2 2"/>
  </svg>
)
const SvgGender = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="14" r="5"/>
    <path d="M19 5l-5.5 5.5M15 5h4v4"/>
  </svg>
)
const SvgWeight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2h12l2 6H4L6 2z"/>
    <path d="M4 8l1 12h14l1-12"/>
    <path d="M10 12h4"/>
  </svg>
)
const SvgInfo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="8.01"/>
    <line x1="12" y1="12" x2="12" y2="16"/>
  </svg>
)

interface AiResult {
  breed: string
  breedEn: string
  age: string
  gender: string
  weight: string
  confidence: number
  traits: string[]
}

interface PetPhotoCaptureProps {
  onClose: () => void
  onRegister: (photo: string, result: AiResult) => void
}

// Simulated AI breed detection — cycles through realistic results based on image hash
const AI_PRESETS: AiResult[] = [
  { breed: '사모예드', breedEn: 'Samoyed', age: '3~4세 추정', gender: '남아', weight: '20~25kg 추정', confidence: 96, traits: ['대형견','온순한 성격','활동적','털 관리 필요'] },
  { breed: '포메라니안', breedEn: 'Pomeranian', age: '2~3세 추정', gender: '여아', weight: '2~3kg 추정', confidence: 91, traits: ['소형견','활발한 성격','털 많음','훈련 용이'] },
  { breed: '비숑프리제', breedEn: 'Bichon Frisé', age: '1~2세 추정', gender: '남아', weight: '4~6kg 추정', confidence: 88, traits: ['소형견','친화적','저알레르기','그루밍 필요'] },
  { breed: '시바이누', breedEn: 'Shiba Inu', age: '4~5세 추정', gender: '남아', weight: '8~10kg 추정', confidence: 96, traits: ['중형견','독립적 성격','운동 필요','청결함'] },
]

export default function PetPhotoCapture({ onClose, onRegister }: PetPhotoCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<'select' | 'analyzing' | 'result'>('select')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<AiResult | null>(null)
  const [analysisStep, setAnalysisStep] = useState(0)

  const STEPS = ['이미지 전처리 중…', '견종 특징 추출 중…', 'AI 모델 분석 중…', '나이·체형 추정 중…', '분석 완료!']

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file)
    setPhotoUrl(url)
    setPhase('analyzing')
    setProgress(0)
    setAnalysisStep(0)

    // Simulate progressive analysis
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
          const preset = AI_PRESETS[Math.floor(Math.random() * AI_PRESETS.length)]
          setResult(preset)
          setPhase('result')
        }, 400)
      }
      setProgress(Math.min(prog, 100))
    }, 120)
  }

  const triggerCamera = () => fileInputRef.current?.click()

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
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      `}</style>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
      />

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
        {/* Handle bar */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--hair)' }} />
        </div>

        {/* ── PHASE: SELECT ── */}
        {phase === 'select' && (
          <div style={{ padding: '8px 24px 32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 0 6px' }}>
              <PeteedLogo size={120} showTagline={false} />
              <h2 style={{ fontFamily: "'Noto Sans KR'", fontWeight: 900, fontSize: 18, color: 'var(--ink)', margin: '4px 0 0', textAlign: 'center' }}>
                펫 사진 등록
              </h2>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--ink-70)', margin: '0 0 24px', lineHeight: 1.6 }}>
              사진을 촬영하거나 업로드하면 AI가 견종·나이·체형을 자동으로 분석해 드려요
            </p>

            {/* AI feature highlight */}
            <div style={{
              borderRadius: 16, padding: '16px', marginBottom: 20,
              background: 'linear-gradient(135deg, var(--ink-2) 0%, var(--ink) 100%)',
              color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center',
            }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>AI 자동 인식 기능</div>
              <div style={{ fontSize: 11, opacity: .8, lineHeight: 1.55 }}>견종 판별 · 나이 추정 · 체형 분석 · 특성 분류를 자동으로 처리하고 등록 정보를 추천해 드립니다</div>
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
              <span style={{ fontFamily: "'Noto Sans KR'", fontWeight: 700, fontSize: 15 }}>카메라로 촬영하기</span>
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
              AI 분석 중…
            </h2>

            {/* Photo preview */}
            <div style={{ position: 'relative', marginBottom: 20 }}>
              <img
                src={photoUrl}
                alt="업로드된 사진"
                style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 16, display: 'block' }}
              />
              {/* Scanning overlay */}
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

            {/* Steps */}
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

            {/* Progress bar */}
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
        {phase === 'result' && result && photoUrl && (
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

            {/* Photo + breed badge */}
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <img
                src={photoUrl}
                alt="펫 사진"
                style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 16, display: 'block' }}
              />
              <div style={{
                position: 'absolute', bottom: 10, left: 10,
                background: 'rgba(10,16,30,.75)', backdropFilter: 'blur(8px)',
                borderRadius: 10, padding: '6px 12px', color: '#fff',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ color: '#fff' }}><SvgPaw /></span>
                <div>
                  <div style={{ fontFamily: "'Noto Sans KR'", fontWeight: 700, fontSize: 13 }}>{result.breed}</div>
                  <div style={{ fontSize: 10, opacity: .7 }}>{result.breedEn}</div>
                </div>
                <div style={{
                  marginLeft: 6, padding: '2px 7px', borderRadius: 20,
                  background: 'rgba(201,154,61,.3)', color: '#EAD09B',
                  fontSize: 10, fontWeight: 700,
                }}>신뢰도 {result.confidence}%</div>
              </div>
            </div>

            {/* Confidence bar */}
            <div style={{ marginBottom: 16, padding: '12px 14px', background: '#fff', borderRadius: 14, border: '1px solid var(--hair)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink)' }}>AI 인식 신뢰도</span>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--teal)' }}>{result.confidence}%</span>
              </div>
              <div style={{ height: 5, borderRadius: 3, background: 'var(--paper-2)' }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  background: 'linear-gradient(90deg, var(--teal), var(--gold))',
                  width: `${result.confidence}%`,
                }} />
              </div>
            </div>

            {/* Detected info */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--hair)', marginBottom: 12, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--hair)', fontSize: 11, fontWeight: 900, color: 'var(--ink-45)', letterSpacing: '.06em' }}>
                AI 분석 결과 — 수정 후 등록 가능
              </div>
              {[
                { label: '견종', value: `${result.breed} (${result.breedEn})`, icon: <SvgPaw /> },
                { label: '추정 나이', value: result.age, icon: <SvgCake /> },
                { label: '성별', value: result.gender, icon: <SvgGender /> },
                { label: '추정 체중', value: result.weight, icon: <SvgWeight /> },
              ].map(({ label, value, icon }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 14px', borderBottom: '1px solid var(--hair)',
                }}>
                  <span style={{ width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-70)' }}>{icon}</span>
                  <span style={{ fontSize: 12, color: 'var(--ink-45)', flex: '0 0 70px' }}>{label}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)', flex: 1 }}>{value}</span>
                  <span style={{ fontSize: 10, color: 'var(--ink-45)' }}>수정 ›</span>
                </div>
              ))}
            </div>

            {/* Trait chips */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-45)', margin: '0 0 8px', letterSpacing: '.04em' }}>AI 분석 특성</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {result.traits.map(t => (
                  <span key={t} style={{
                    fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
                    background: 'var(--teal-light)', color: 'var(--teal)',
                  }}>{t}</span>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <p style={{ fontSize: 10.5, color: 'var(--ink-45)', lineHeight: 1.6, margin: '0 0 16px' }}>
              <span style={{ display:'inline-flex', alignItems:'center', gap:5, verticalAlign:'middle', color:'var(--ink-45)' }}><SvgInfo /></span>{' '}AI 분석 결과는 참고용이에요. 정확한 정보는 직접 수정하여 등록해 주세요.
            </p>

            {/* CTA buttons */}
            <button
              onClick={() => onRegister(photoUrl, result)}
              style={{
                width: '100%', border: 'none', borderRadius: 16, padding: '15px',
                background: 'linear-gradient(135deg, var(--ink-2) 0%, var(--ink) 100%)',
                color: '#fff', cursor: 'pointer', marginBottom: 8,
                fontFamily: "'Noto Sans KR'", fontWeight: 700, fontSize: 15,
                boxShadow: '0 10px 24px -10px rgba(22,35,61,.5)',
              }}
            >
              이 정보로 등록하기
            </button>
            <button
              onClick={() => { setPhase('select'); setPhotoUrl(null) }}
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
