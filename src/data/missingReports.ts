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

// Simple flat-illustration avatar, drawn inline so it never depends on a
// network image load — matches the app's own illustrated-portrait style.
function animalAvatar(opts: { bg: string; fur: string; furDark: string; isCat?: boolean }): string {
  const { bg, fur, furDark, isCat } = opts
  const ears = isCat
    ? `<path d="M118 96 L86 26 L152 68 Z" fill="${furDark}"/><path d="M282 96 L314 26 L248 68 Z" fill="${furDark}"/>
       <path d="M122 90 L102 46 L146 72 Z" fill="#FBD9DC"/><path d="M278 90 L298 46 L254 72 Z" fill="#FBD9DC"/>`
    : `<ellipse cx="113" cy="112" rx="40" ry="56" fill="${furDark}" transform="rotate(-20 113 112)"/>
       <ellipse cx="287" cy="112" rx="40" ry="56" fill="${furDark}" transform="rotate(20 287 112)"/>`
  const whiskers = isCat
    ? `<g stroke="#2E2E2B" stroke-width="2" opacity=".55">
         <path d="M138 232 L96 224 M138 240 L92 240 M138 248 L96 256"/>
         <path d="M262 232 L304 224 M262 240 L308 240 M262 248 L304 256"/>
       </g>`
    : ''
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <rect width="400" height="400" fill="${bg}"/>
    <circle cx="340" cy="60" r="30" fill="#ffffff" opacity=".12"/>
    <circle cx="34" cy="356" r="24" fill="#1C1C1A" opacity=".05"/>
    ${ears}
    <circle cx="200" cy="200" r="112" fill="${fur}"/>
    <ellipse cx="150" cy="192" rx="14" ry="17" fill="#1C1C1A"/>
    <ellipse cx="250" cy="192" rx="14" ry="17" fill="#1C1C1A"/>
    <circle cx="145" cy="186" r="4" fill="#fff"/>
    <circle cx="245" cy="186" r="4" fill="#fff"/>
    <ellipse cx="200" cy="240" rx="56" ry="42" fill="#FBEBD8"/>
    <path d="M185 217 Q200 208 215 217 Q215 232 200 236 Q185 232 185 217 Z" fill="#1C1C1A"/>
    <path d="M200 236 L200 246 M200 246 Q181 257 166 246 M200 246 Q219 257 234 246" stroke="#2E2E2B" stroke-width="4" stroke-linecap="round" fill="none"/>
    ${whiskers}
  </svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const AVATAR_BORI = animalAvatar({ bg: '#FFF3E9', fur: '#FFFFFF', furDark: '#F0DFC8' })
const AVATAR_CHOCO = animalAvatar({ bg: '#FFEBD9', fur: '#E8B784', furDark: '#C98F5C' })
const AVATAR_DUBU = animalAvatar({ bg: '#EAEFF3', fur: '#B8C0CB', furDark: '#8D97A3', isCat: true })

// Sample community activity shown below the map — a mix of missing-pet
// reports and emergency blood-donation requests from other guardians.
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
    photo: AVATAR_BORI,
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
    photo: AVATAR_CHOCO,
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
    photo: AVATAR_DUBU,
  },
]
