export type ReportKind = '실종' | '헌혈'
export type ReportStatus = '진행중' | '발견완료' | '매칭완료'

export interface MissingReport {
  id: string
  kind: ReportKind
  petName: string
  info: string
  location: string
  status: ReportStatus
  reportedAt: string
  notes?: string
  mine?: boolean
  photo: string
}

// Shown in place of a report photo if the real image fails to load (e.g. no
// network reachability) — a simple flat paw icon so the layout never breaks.
export const FALLBACK_PHOTO = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <rect width="400" height="400" fill="#F5EFEA"/>
    <g fill="#D8CCC2">
      <circle cx="150" cy="150" r="26"/><circle cx="250" cy="150" r="26"/>
      <circle cx="118" cy="218" r="22"/><circle cx="282" cy="218" r="22"/>
      <ellipse cx="200" cy="266" rx="62" ry="46"/>
    </g>
  </svg>`
)}`

// Sample community activity shown below the map — a mix of missing-pet
// reports and emergency blood-donation requests from other guardians.
// Photos are real, freely-licensed Unsplash photos (Unsplash License —
// free for commercial & personal use, no attribution required).
export const SAMPLE_REPORTS: MissingReport[] = [
  {
    id: 'MISSING-20260828-4821',
    kind: '실종',
    petName: '보리',
    info: '말티즈 · 3세 · 흰색',
    location: '안동시 옥동',
    status: '발견완료',
    reportedAt: '3일 전',
    notes: '동네 주민이 발견해 안전하게 보호자 품으로 돌아갔어요.',
    photo: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=400&h=400&fit=crop',
  },
  {
    id: 'BLOOD-20260825-1190',
    kind: '헌혈',
    petName: '초코',
    info: '골든리트리버 · AB형 요청',
    location: '구미시 인동동',
    status: '매칭완료',
    reportedAt: '6일 전',
    notes: '혈액은행 매칭 성공 — 헌혈 완료했어요.',
    photo: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=400&h=400&fit=crop',
  },
  {
    id: 'MISSING-20260822-0093',
    kind: '실종',
    petName: '두부',
    info: '코리안숏헤어 · 2세 · 고등어',
    location: '경주시 성건동',
    status: '진행중',
    reportedAt: '9일 전',
    notes: '마지막 목격 장소는 성건동 놀이터 근처예요.',
    photo: 'https://images.unsplash.com/photo-1675504661658-33940d979a6a?w=400&h=400&fit=crop',
  },
]
