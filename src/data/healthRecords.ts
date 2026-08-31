export interface HealthRecord {
  date: string
  title: string
  type: string
  hospital: string
  vet: string
  img: string
  details: { label: string; value: string }[]
  memo: string
}

export const HEALTH_RECORDS: HealthRecord[] = [
  {
    date: '2026.06.02', title: '슬개골 정기 검진', type: '진료',
    hospital: '안동동물병원', vet: '김민준 수의사',
    img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop',
    details: [
      { label: '진단명', value: '슬개골 탈구 1도 (경과 관찰)' },
      { label: '처치 내용', value: '방사선 촬영, 관절 가동 범위 측정' },
      { label: '처방약', value: '관절 영양제 30일분' },
      { label: '다음 예약', value: '2026.09.02 (3개월 후)' },
      { label: '비용', value: '₩ 48,000' },
    ],
    memo: '체중 감량 권고. 운동은 하루 30분 이내 산책으로 제한.',
  },
  {
    date: '2026.05.20', title: '종합백신(DHPP) 2차', type: '예방접종',
    hospital: '안동동물병원', vet: '박서연 수의사',
    img: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&h=400&fit=crop',
    details: [
      { label: '접종 항목', value: 'DHPP (홍역·간염·파보·파라인플루엔자)' },
      { label: '백신 제조사', value: 'Nobivac DHPPi' },
      { label: '로트번호', value: 'NV-2026-0512' },
      { label: '다음 접종', value: '2027.05.20 (1년 후)' },
      { label: '비용', value: '₩ 35,000' },
    ],
    memo: '접종 후 24시간 격렬한 운동 자제. 이상 반응 시 즉시 내원.',
  },
  {
    date: '2026.05.02', title: '심장사상충 예방약 처방', type: '처방',
    hospital: '경북동물메디컬센터', vet: '이지훈 수의사',
    img: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=600&h=400&fit=crop',
    details: [
      { label: '처방약', value: 'Heartgard Plus (6개월분)' },
      { label: '용량', value: '체중 5kg 이하 — 파란색 박스' },
      { label: '투약 주기', value: '매월 1회 경구 투약' },
      { label: '유효기간', value: '2026.05.02 ~ 2026.11.02' },
      { label: '비용', value: '₩ 72,000' },
    ],
    memo: '매월 첫째 주 투약. 모기 활동 시즌(4~11월) 필수 지속.',
  },
  {
    date: '2026.04.11', title: '스케일링 · 구강 검진', type: '진료',
    hospital: '안동동물병원', vet: '김민준 수의사',
    img: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&h=400&fit=crop',
    details: [
      { label: '시술 내용', value: '초음파 스케일링, 구강 전체 검진' },
      { label: '치석 단계', value: '경도 (Grade 1)' },
      { label: '발치', value: '없음' },
      { label: '마취 여부', value: '전신 마취 (30분)' },
      { label: '비용', value: '₩ 130,000' },
    ],
    memo: '6개월 주기 스케일링 권장. 덴탈껌 및 양치 습관화 필요.',
  },
  {
    date: '2026.06.05', title: '광견병 백신 (예정)', type: '예방접종',
    hospital: '안동동물병원', vet: '박서연 수의사',
    img: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&h=400&fit=crop',
    details: [
      { label: '접종 항목', value: '광견병 (Rabies)' },
      { label: '백신 제조사', value: 'Nobivac Rabies' },
      { label: '접종 예정일', value: '2026.06.05 (D-5)' },
      { label: '다음 접종', value: '2027.06.05 (1년 후)' },
      { label: '예상 비용', value: '₩ 20,000' },
    ],
    memo: '광견병 예방접종은 동물보호법 의무 사항입니다. 예약 변경은 병원에 사전 연락 바랍니다.',
  },
]
