# Task 007-1: 핵심 플로우 통합 테스트

> `docs/ROADMAP.md` Phase 3. Task 007(검색 및 필터 기능)이 완료된 상태에서 착수한다. 이 Task는 신규 UI/로직을 추가하지 않는 순수 검증 Task다 — 발견된 버그는 즉시 해당 산출물(코드)에서 수정하고 이 파일에 정직하게 기록한다.

## 개요 (고수준 명세서)

Task 001~007로 완성된 `audit-case-explorer` 전체를 Playwright MCP로 총점검한다: 주 플로우 E2E, 대표 계정과목 5개의 3클릭 KPI 실측, 총 사례 수·지적유형별 건수·계정과목별 건수의 데이터 정합성 교차 검증, 엣지 케이스(404/0건/URL 인코딩/긴 사례명), 에러 핸들링(`error.tsx`/`loading.tsx`) 구조 확인, 모바일(375px)·데스크톱(1440px) 반응형 재실행. 발견된 이슈는 새 코드를 만들지 않는 한도 내에서 그 자리에서 수정하고, 근본 원인과 수정 내용을 이 문서에 기록한다.

## 관련 파일

**수정(이 Task 도중 발견한 버그 수정)**

- `src/lib/content/case-filters.ts` — `applyCaseFilters()`의 지적유형 필터가 `additionalFindingTypes`(Task 006)를 검사하지 않던 버그 수정

**신규 생성**

- `tasks/007-1-integration-testing.md` — 이 작업 파일

**참고(코드 리뷰만, 무수정)**

- `src/app/cases/[caseId]/error.tsx`, `src/app/cases/loading.tsx`, `src/app/cases/[caseId]/loading.tsx`

## 현재 상태 (착수 전 확인 사항)

- Task 007까지 완료되어 6개 라우트 전부 실데이터(`getAuditCases()`, `getAccountIndex()`)로 동작하는 상태였다.
- 이 Task는 새 기능을 만들지 않으므로 "구현 단계"가 곧 "검증 시나리오 실행"이다.

## 수락 기준

- [x] 주 플로우(홈→계정과목→계정과목 클릭→사례 목록→사례 상세→원문 출처) 끊김 없이 통과
- [x] 대표 계정과목 5개 전부 3클릭 이내로 사례 상세 도달
- [x] 총 사례 수 62, 지적유형별 건수 20/17/9/8/5/4가 화면과 정확히 일치
- [x] 존재하지 않는 caseId/slug 접근 시 not-found UI 렌더링(상태 코드 이슈는 기존 기록 참조)
- [x] 검수상태 필터 결과 0건 + 빈 상태 UI 확인
- [x] 특수문자(슬래시) 포함 caseId의 URL 인코딩 정상 동작 재확인
- [x] 가장 긴 사례명(30자)에서 레이아웃 깨짐 없음
- [x] `error.tsx`/`loading.tsx` 구조 확인
- [x] 모바일(375px)·데스크톱(1440px) 양쪽에서 주 플로우 재실행
- [x] 계정과목 연결 사례 0건 케이스는 재현 불가능함을 사유와 함께 기록(인위 데이터 생성 안 함)
- [x] `npm run check-all` 통과

## 구현 단계 (= 검증 시나리오 실행 순서)

1. [x] 대표 계정과목 5개(`sales`, `inventory`, `subsidiary-investment`, `deferred-tax-liabilities`, `equity`) 각각 홈→계정과목→해당 슬러그→사례 클릭까지 실제 클릭 이벤트로 3클릭 실측
2. [x] 임의 사례 상세(FSS/2106-04)에서 원문 출처 캡션 노출 확인
3. [x] `/cases`에서 총 62건 확인
4. [x] 지적유형 6종 전부 `?findingType=...`로 개별 필터링해 `taxonomy.md` 기대값과 전수 대조 — **불일치 발견 및 수정**(아래 참고)
5. [x] `/cases/NOT-EXIST` 접근 → not-found UI 확인
6. [x] `/cases?reviewStatus=공개` → 0건 + 빈 상태 UI 확인
7. [x] 가장 긴 사례명(FSS/2311-18, 30자) 상세 페이지 레이아웃 확인
8. [x] `error.tsx`/`loading.tsx` 코드 리뷰
9. [x] 모바일(375px)/데스크톱(1440px) 뷰포트에서 `/`, `/cases`, `/cases/[caseId]` 재확인
10. [x] `tasks/007-1-integration-testing.md` 작성

## 발견한 이슈 (정직하게 기록)

### 1. 지적유형 필터가 `additionalFindingTypes`를 누락(수정 완료)

**증상**: `/cases?findingType=공시누락` 필터 결과가 4건(기대값 5건, `taxonomy.md` 근거).

**원인**: `case-filters.ts`의 `applyCaseFilters()`가 `auditCase.findingType`(주 유형)만 검사하고, Task 006에서 FSS/2311-17에 부여한 `additionalFindingTypes`(보조 유형, 이 사례는 `공시누락`을 보조로 가짐)를 검사하지 않았다. `/taxonomy`의 실집계 로직(`countByFindingType`)은 이미 두 필드를 이중집계하고 있었는데, Task 007에서 새로 만든 필터 로직만 이 패턴을 놓쳤다.

**수정**: `applyCaseFilters()`의 지적유형 필터 조건에 `auditCase.additionalFindingTypes?.some(...)` 검사를 추가했다. 재빌드 후 지적유형 6종 전부(20/17/9/8/5/4)가 `taxonomy.md`와 정확히 일치함을 재확인했다. (`tasks/007-search-and-filter.md`에도 추록으로 동일 내용을 기록했다 — 그 Task의 산출물이 사후 변경됐기 때문.)

### 2. `notFound()` 상태 코드가 200으로 반환됨(신규 아님, 참조만)

`/cases/NOT-EXIST` 접근 시 화면은 not-found UI가 정확히 렌더링되지만 HTTP 상태 코드가 200이다. 이는 `tasks/005-full-page-ui.md`에 이미 상세히 기록된 Next.js App Router의 스트리밍 렌더링 제약과 동일 원인(동적 라우트+`generateStaticParams` 미적용)이며, 근본 해결책은 `docs/ROADMAP.md` Task 010에 이미 인수인계돼 있다. 이 문서에서는 재발견 사실만 남기고 중복 기록하지 않는다.

## 확인 불가능한 항목 (임의로 재현하지 않고 사유만 기록)

**계정과목 연결 사례 0건 시나리오**: `src/lib/content/account-index.ts`의 `getAccountIndex()`가 만드는 역인덱스(`reverse`)는 `getAuditCases()`를 순회하며 실제로 사례가 있는 계정과목만 항목으로 추가하는 구조다(`reverseMap.get(item.id) ?? { account: item, cases: [] }` 후 `cases.push`). 따라서 인덱스에 존재하는 계정과목은 정의상 항상 사례 1건 이상을 갖는다 — "존재하지만 0건"인 상태는 현재 45개 정규 계정과목 중 어디에서도 재현되지 않는다. 인위적으로 사전에 없는 더미 계정과목을 추가하는 것은 `data/audit-cases/` 원본이나 검증된 사전(`account-dictionary.ts`)을 왜곡하는 것이라 시도하지 않았다. 이 시나리오는 향후 정규화 사전에 실제로 연결 사례가 없는 계정과목이 추가되는 경우(예: 계정과목만 미리 등록하고 사례가 아직 없는 경우)에만 자연 발생하며, 그때 재검증하는 것이 타당하다.

## 테스트 체크리스트 (Playwright MCP)

- [x] 대표 계정과목 5개 3클릭 KPI 실측(전부 통과, 도착 caseId: FSS/2106-04, FSS/2206-07, FSS/2106-06, FSS/2311-12, FSS/2106-14)
- [x] 지적유형 6종 전수 필터 대조(20/17/9/8/5/4, 수정 후 전부 일치)
- [x] `/cases/NOT-EXIST` not-found UI 확인
- [x] `/cases?reviewStatus=공개` 0건+빈 상태 확인
- [x] 가장 긴 사례명 레이아웃 확인(깨짐 없음)
- [x] `error.tsx`/`loading.tsx` 구조 확인
- [x] 모바일 375px: 홈→계정과목→sales→사례상세 재실행, `/cases` 필터 바 세로 배치 확인
- [x] 데스크톱 1440px: `/cases` 사이드바+3열 그리드 레이아웃 확인

## 변경 사항 요약

Task 001~007 전체를 대상으로 Playwright MCP 통합 검증을 수행했다. 대표 계정과목 5개 전부 정확히 3클릭으로 사례 상세에 도달함을 실측해 3클릭 KPI를 재확인했고, 총 사례 수 62건과 원문 출처 표기가 정상임을 확인했다.

검증 도중 실제 버그 1건(지적유형 필터가 `additionalFindingTypes`를 누락해 공시누락 필터 결과가 4건으로 나오던 문제)을 발견해 `case-filters.ts`를 수정하고 재빌드 후 6종 전부 일치함을 재확인했다. `notFound()` 상태 코드 200 건은 기존에 이미 기록된 이슈와 동일 원인이라 중복 기록하지 않았다. 계정과목 연결 사례 0건 시나리오는 `account-index.ts`의 역인덱스 구조상 현재 데이터로는 재현이 원천적으로 불가능함을 확인하고 그 이유를 정직하게 남겼다(인위 데이터 생성 없음). 모바일·데스크톱 양쪽에서 필터 UI와 카드 그리드 레이아웃 모두 깨짐 없이 정상 동작함을 확인했다.

이로써 `docs/ROADMAP.md` Phase 3(Task 005~007-1)이 전부 완료됐다. 다음은 Phase 4 Task 008(원문 PDF 출처 열람 기능)이다.
