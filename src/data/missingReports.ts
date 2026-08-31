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
}

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
  },
  {
    id: 'BLOOD-20260825-1190',
    kind: '헌혈',
    petName: '초코',
    info: '골든리트리버 · AB형 요청',
    location: '구미시 인동동',
    status: '매칭완료',
    reportedAt: '6일 전',
  },
  {
    id: 'MISSING-20260822-0093',
    kind: '실종',
    petName: '두부',
    info: '코리안숏헤어 · 2세 · 고등어',
    location: '경주시 성건동',
    status: '진행중',
    reportedAt: '9일 전',
  },
]
