# PETEED — 반려동물 디지털 신분증

Figma Make로 만든 디자인을 실제로 동작하는 React + Vite + TypeScript 웹앱으로 옮긴 프로젝트입니다.
로그인 화면, 홈(패스포트 카드), 신분증(지갑), 건강기록, 시설예약, 응급·실종 5개 화면과
QR/건강기록/정부24 연동 모달까지 전부 포함되어 있습니다.

**Supabase(Postgres) 백엔드가 연결되어 있습니다.** 로그인/회원가입, 반려동물(pet) 데이터,
시설예약 목록은 실제 DB에서 읽고 씁니다. 그 외 일부 화면(건강기록 상세, 알림, 실종신고,
헌혈매칭 등)은 아직 목업 데이터로 남아있습니다 — 아래 "다음 단계"를 참고하세요.

## 로컬에서 실행하기

```bash
npm install
npm run dev
```

`http://localhost:5173` 에서 바로 확인할 수 있습니다. Supabase 접속 정보는 `.env`에 이미
채워져 있습니다 (`.env.example` 참고).

## 배포용으로 빌드하기

```bash
npm run build
```

`dist/` 폴더에 정적 파일이 생성됩니다. 이 폴더를 그대로 아무 정적 호스팅에 올리면 됩니다.

## 무료로 실제 서버에 올리는 방법 (택 1)

이 세션(클라우드 샌드박스)은 보안 정책상 Vercel·Netlify·surge.sh 같은 외부 배포 서비스로 직접
접속할 수 없어서, 아래 방법 중 하나로 본인 계정으로 배포해 주세요. 셋 다 신용카드 없이 무료입니다.

### 1) Vercel (추천 — 가장 간단)
1. https://vercel.com 에 GitHub 계정으로 가입
2. 이 프로젝트 폴더를 GitHub 저장소로 push
3. Vercel에서 "Add New Project" → 저장소 선택 → 그대로 Deploy
   (Framework Preset: Vite 로 자동 인식됨)
4. 몇 분 안에 `https://프로젝트명.vercel.app` 주소가 생성됩니다

### 2) Netlify
1. https://app.netlify.com 가입
2. "Add new site" → "Deploy manually" → 위에서 만든 `dist/` 폴더를 그대로 드래그 앤 드롭
   (GitHub 연동도 가능, Build command: `npm run build`, Publish directory: `dist`)
3. 즉시 `https://프로젝트명.netlify.app` 주소가 생성됩니다

### 3) GitHub Pages
1. GitHub 저장소에 push
2. `npm run build` 후 `dist/` 내용을 `gh-pages` 브랜치에 올리거나
   `gh-pages` 패키지(`npm i -D gh-pages`)로 `npm run deploy` 스크립트를 추가해 배포
3. 저장소 Settings → Pages 에서 활성화

## Supabase 백엔드

- **프로젝트**: `studiomung-George` (리전: `ap-northeast-2`, 서울)
- **연결 방식**: `src/lib/supabase.ts`가 `.env`의 `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`로
  클라이언트를 만듭니다. 두 값이 없으면 `SUPABASE_ENABLED`가 `false`가 되어 아래 "그레이스풀 폴백"이 동작합니다.
- **인증**: `LoginScreen.tsx`의 이메일/비밀번호 로그인이 실제 `supabase.auth.signInWithPassword`를 호출합니다.
  처음 보는 이메일이면 자동으로 `signUp`을 시도해서 별도 회원가입 화면 없이 바로 계정이 만들어집니다
  (데모 편의를 위한 단순화이며, 실서비스에서는 이메일 인증 절차를 추가하는 걸 권장합니다).
  카카오/네이버/구글 버튼은 실제 OAuth 프로바이더가 Supabase 대시보드에 설정되어 있지 않아
  기존과 동일하게 시뮬레이션(즉시 로그인)으로 남아있습니다.
- **DB 스키마** (`public` 스키마, 전부 RLS 활성화):
  `profiles`(보호자), `pets`, `pet_guardians`(반려동물↔보호자 다대다), `health_records`,
  `facilities`(공공시설, 목업과 동일한 4곳 시드 완료), `facility_reservations`, `notifications`,
  `missing_reports`(실종신고), `blood_donation_requests`(헌혈매칭). auth.users에 새 계정이 생기면
  트리거가 자동으로 `profiles` 행을 만듭니다.
- **연동 완료된 화면**: 로그인/회원가입/로그아웃, 홈 화면의 반려동물 사진(최초 로그인 시 "만두" pet
  레코드를 자동 생성), 시설예약 탭 목록(`facilities` 테이블에서 조회, 로그아웃 버튼은 홈 화면 알림 카드
  아래에 추가했습니다).
- **아직 목업인 화면 (다음 단계)**: 건강기록 상세(`data/healthRecords.ts`, `type`/`memo`/`details` 등
  스키마 확장이 필요), 알림, 실종신고 접수 폼, 헌혈매칭 요청, 시설예약 실제 예약 흐름 — 테이블은
  이미 만들어져 있어서 프런트엔드만 연결하면 됩니다.
- **그레이스풀 폴백**: 로그인·시설목록 호출 모두 실패 시(네트워크 차단 등) 예외를 잡아서 기존
  목업 동작으로 자동 전환합니다. 즉 Supabase가 전혀 연결되지 않은 환경에서도 앱 자체는 항상 정상
  작동합니다.

## 참고

- AI 견종 분석·정부24 연동은 여전히 프런트엔드 시뮬레이션(setTimeout)입니다. 실제 서비스로
  운영하려면 실제 AI 이미지 분석 API, 정부24 공식 연동 API 등이 별도로 필요합니다.
- 반려동물 사진·건강기록 사진·시설 사진: 원본 Figma 파일은 Unsplash 외부 이미지 URL을 그대로
  참조하는 구조입니다. 이 개발 환경은 네트워크 정책상 Unsplash를 포함한 외부 이미지 서버에
  직접 접근할 수 없고(Figma MCP의 이미지 리소스 캐시도 로그인 화면 미리보기만 포함하고 있어
  대체 경로가 되지 못했습니다), Figma Make 코드 내보내기(zip)에도 이미지 바이너리 자체는
  포함되어 있지 않습니다. 그래서 `build_artifact.py`에서 해당 9개 이미지를 직접 그린 벡터
  일러스트(만두 캐릭터 초상, 건강기록 4종, 시설 4종)로 교체해 인라인했습니다. 실제 서비스로
  운영할 때는 실사 사진으로 교체하는 것을 권장합니다.

### ⚠️ Claude Artifact로 게시한 버전의 제약사항

Claude Artifact는 보안 정책(CSP)상 `maps.google.com`, `*.supabase.co` 등 허용되지 않은 외부
도메인으로의 iframe/네트워크 요청을 전부 차단합니다. 그 결과 Artifact 게시본에서는:

- 응급 탭의 실시간 구글맵, 시설예약 탭의 실제 시설 웹사이트 iframe → 빈 화면으로 보입니다.
- Supabase 로그인/시설목록 조회 → 네트워크 요청이 차단되어 자동으로 목업 동작으로 폴백됩니다
  (에러 없이 기존처럼 동작하지만, 실제 계정이 생기거나 DB에 저장되지는 않습니다).

코드 자체는 정상이며, 실제 지도·웹사이트·Supabase 연동이 전부 살아있는 버전이 필요하면 아래
"무료로 실제 서버에 올리는 방법"으로 Vercel/Netlify 등에 별도 배포하면 됩니다 (배포 시 `.env`의
두 값을 해당 서비스의 환경변수로 등록해 주세요).
