// 카카오(다음) 우편번호 서비스 — 대한민국에서 가장 널리 쓰이는 범용 주소 검색
// 위젯. 회원정보 수정 등 주소 입력이 필요한 곳마다 새로 만들지 않고 이 모듈
// 하나로 스크립트 로딩과 팝업 호출을 공유한다.
// https://postcode.map.daum.net/guide

export interface DaumPostcodeResult {
  zonecode: string
  address: string
  roadAddress: string
  jibunAddress: string
  userSelectedType: 'R' | 'J'
  buildingName: string
  apartment: 'Y' | 'N'
}

interface DaumPostcodeInstance {
  open: () => void
}

interface DaumPostcodeOptions {
  oncomplete: (data: DaumPostcodeResult) => void
  onclose?: () => void
  width?: string | number
  height?: string | number
}

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: DaumPostcodeOptions) => DaumPostcodeInstance
    }
  }
}

const SCRIPT_SRC = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'

let loadPromise: Promise<void> | null = null

function loadScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('브라우저 환경이 아니에요'))
  if (window.daum?.Postcode) return Promise.resolve()
  if (loadPromise) return loadPromise

  const promise: Promise<void> = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('script load failed')))
      return
    }
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('script load failed'))
    document.head.appendChild(script)
  })

  loadPromise = promise.catch((err: unknown) => {
    loadPromise = null // allow a retry on the next call instead of failing forever
    throw err
  })

  return loadPromise
}

// 팝업으로 주소 검색창을 띄우고, 사용자가 주소를 선택하면 onSelect로 결과를
// 돌려준다. 스크립트가 아직 로드되지 않았다면 처음 호출될 때 한 번만 불러온다.
export async function openAddressSearch(onSelect: (result: DaumPostcodeResult) => void): Promise<void> {
  await loadScript()
  if (!window.daum?.Postcode) throw new Error('주소 검색 서비스를 사용할 수 없어요')
  new window.daum.Postcode({ oncomplete: onSelect }).open()
}
