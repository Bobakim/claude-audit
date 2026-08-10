# Task 006: 계정과목 정규화 사전 및 N:M 인덱스 구축

> `docs/ROADMAP.md` Phase 3 — ⚠️ **이 로드맵에서 가장 리스크가 큰 Task**. Task 005(마크다운 콘텐츠 파이프라인)가 선행 완료된 상태에서 착수한다.

## 개요 (고수준 명세서)

`data/audit-cases/knowledge/cases/`의 관련계정과목이 자유 텍스트라 표기가 제각각인 문제(`매출액(연결)`, `금융자산(FVOCI/FVPL/AC 분류)` 등)를 해결하기 위해, 실제 62건에서 확인한 원문 표기 54종을 사람이 직접 검토해 정규 계정과목(영문 slug) 45개로 매핑하는 사전(`account-dictionary.ts`)을 구축하고, 이를 기반으로 계정과목↔사례 N:M 인덱스(`account-index.ts`)를 만든다. `/accounts`·`/accounts/[slug]`를 실데이터로 전환해 "계정과목 클릭 → 사례 목록"이라는 제품 핵심 진입점을 완성한다. 부수적으로 `/taxonomy`의 지적유형 건수 하드코딩도 실집계로 교체한다(Task 004에서 남긴 약속 이행).

## 관련 파일

**신규 생성**

- `src/lib/content/account-dictionary.ts` — 54종 원문 표기 → 45개 정규 계정과목 매핑 사전
- `src/lib/content/account-index.ts` — `normalizeAccounts()`, `getAccountIndex()`(정인덱스/역인덱스, React `cache()`)

**수정**

- `src/app/accounts/page.tsx` — `dummyAccounts` → `getAccountIndex()`
- `src/app/accounts/[slug]/page.tsx` — `dummyAccounts` → `getAccountIndex()`, 미존재 슬러그는 `notFound()`
- `src/app/taxonomy/page.tsx` — `FINDING_TYPE_COUNTS` 하드코딩 → `getAuditCases()` 실집계

**무수정(범위 제외/재사용)**

- `src/app/page.tsx` — 데이터 미참조, 변경 없음
- `src/lib/dummy/accounts.ts`, `src/lib/dummy/cases.ts` — 이제 어떤 라우트도 참조하지 않지만 사용자 지시 없는 삭제는 하지 않음(그대로 유지)
- `src/components/audit/*` — Task 003/004 UI 컴포넌트 전부 무수정 재사용

## 현재 상태 (착수 전 확인 사항)

- Task 005가 완료되어 `getAuditCases()`로 실제 62건 `AuditCase[]`를 가져올 수 있는 상태였다.
- 착수 전 `getAuditCases()`를 실행해 실제 관련계정과목 원문 표기를 전수 조사한 결과 54종을 확인했고, 이 중 2쌍(매도가능증권/매도가능금융자산, 대손충당금/손실충당금)은 병합 여부를 회계 지식만으로 확신할 수 없어 사용자에게 확인했다 — **둘 다 별도 유지로 결정**.
- FVOCI/FVPL/AC 3개 금융자산 분류(FSS/2405-13)는 사례 자체가 "분류 오류"를 지적하므로 병합이 원천 금지되는 케이스임을 확인했다.
- FSS/2311-17의 `당기순이익/자기자본(횡령손실 미인식으로 과대계상)`은 리스트 항목 1개에 계정과목 2개가 슬래시로 결합된 자유 텍스트라, 사전이 "원문 1개 → 정규 계정과목 1개 이상(배열)"의 1:N 매핑을 지원해야 함을 확인했다.
- `taxonomy.md`의 "계정과목" 컬럼이 가운뎃점으로 축약한 사람이 읽기 쉬운 요약이라(예: FSS/2405-14를 "지급보증·유상증자(특수관계자거래 주석)"로 합쳐 표기하지만 frontmatter는 별도 2개 리스트 항목) frontmatter 원문과 완전 자동 문자열 대조가 불가능함을 실측으로 확인 — 완료 조건을 "사전 커버리지 100%(미분류 0건)"로 재정의하고, `taxonomy.md` 대조는 이 Task의 Playwright 단계에서 대표 계정과목을 사람이 직접 확인하는 방식으로 대체했다.

## 수락 기준

- [x] 54종 원문 표기 전부가 사전에 존재(커버리지 100%, 미분류 0건)
- [x] 45개 정규 계정과목 slug가 서로 중복 없음
- [x] 매도가능증권/매도가능금융자산, 대손충당금/손실충당금이 각각 별도 계정과목으로 분리됨
- [x] FVOCI/FVPL/AC 3개 금융자산 분류가 별도 계정과목으로 분리됨
- [x] FSS/2311-17이 당기순이익·자기자본 2개 계정과목으로 정확히 전개됨
- [x] `getAccountIndex()`의 forward/reverse 총 등장 횟수가 정확히 일치(무결성)
- [x] `/accounts`가 45개 계정과목 카드를 실데이터로 노출
- [x] `/accounts/[slug]`가 연결 사례 목록을 정확히 표시하고, 한 사례가 여러 계정과목 페이지에서 조회됨(N:M 양방향)
- [x] `/taxonomy`의 지적유형 건수가 실집계 후에도 기존 20/17/9/8/5/4와 동일
- [x] `npm run check-all` 통과
- [x] `npm run build` 성공(미분류 발생 시 빌드 중단되는 하드 assert 포함)

## 구현 단계

1. [x] `account-dictionary.ts` 작성 — 54종 전체 매핑(단순 1:1 29종, 괄호부기 태그분리 9종, 신규 slug 추출 10종, 절대 별도유지 쌍, 1:N 특수케이스 1건). 실행 검증: 커버리지 100%, slug 45개 중복 없음, FVOCI/FVPL/AC 분리 확인
2. [x] `account-index.ts` 작성 — `normalizeAccounts()`(미분류 시 throw 없이 격리+경고) + `getAccountIndex()`(React `cache()`, 기본 62건에서 미분류 0건 하드 assert). 실행 검증: forward 62건, reverse 45개, forward/reverse 총합 125로 일치, FSS/2311-17이 3개 계정과목으로 전개됨을 확인
3. [x] `/accounts`, `/accounts/[slug]`를 `getAccountIndex()`로 배선, `/cases` 링크에 `encodeURIComponent` 적용, 미존재 슬러그는 `notFound()`
4. [x] `/taxonomy`의 `FINDING_TYPE_COUNTS` 하드코딩을 `getAuditCases()` 실집계로 교체(순서 고정 `FINDING_TYPE_ORDER` 유지)
5. [x] `npm run build` 성공 확인(미분류 하드 assert 통과)
6. [x] Playwright MCP로 `/accounts` 45개 카드, 매도가능증권/매도가능금융자산·FVOCI/FVPL/AC 분리, N:M 양방향(FSS/2106-01), 대표 계정과목 건수 대조, `/taxonomy` 재확인
7. [x] `tasks/006-account-normalization.md` 작성

## 테스트 체크리스트 (Playwright MCP)

- [x] `npm run build` 성공 — 미분류 계정과목 발생 시 빌드가 중단되는 하드 assert가 실제로 통과함(로그에 unclassified 관련 에러 없음)
- [x] 프로덕션 서버(`npx next start`)로 `/accounts` 접속 → `document.querySelectorAll('a[href^="/accounts/"]').length === 45` 확인
- [x] `/accounts`에서 `매도가능증권`(href: `available-for-sale-securities`)과 `매도가능금융자산`(href: `available-for-sale-financial-assets`)이 각각 별도 카드로 존재함을 확인
- [x] `/accounts`에서 `대손충당금`(href: `allowance-for-doubtful-accounts`)과 `손실충당금`(href: `loss-allowance`)이 각각 별도 카드로 존재함을 확인
- [x] `/accounts`에서 `기타포괄손익-공정가치측정금융자산`·`당기손익-공정가치측정금융자산`·`상각후원가측정금융자산`(FVOCI/FVPL/AC) 3개가 전부 별도 카드로 존재함을 확인
- [x] N:M 양방향: `/accounts/sales`, `/accounts/cost-of-sales`, `/accounts/accounts-receivable`, `/accounts/allowance-for-doubtful-accounts` 4개 페이지 전부에서 FSS/2106-01(`매출 및 매출원가 허위계상`) 링크가 노출됨을 확인
- [x] 대표 계정과목 건수를 `/accounts` 카드에서 직접 추출해 사전 조사(실제 `getAuditCases()` 실행 결과)와 대조 — 매출 19건, 매출원가 12건, 매출채권 12건, 종속기업투자주식 6건, 재고자산 6건, 이연법인세부채 3건, 자기자본 5건(1:N 결합 케이스 반영), 당기순이익 2건(1:N 결합 케이스 반영), FVOCI 2건/FVPL 1건/AC 1건(FSS/2405-13이 3분류 모두에 걸쳐 있음을 반영) — 전부 사전 조사값과 정확히 일치
- [x] `/taxonomy` 재확인 — 실집계 교체 후에도 20/17/9/8/5/4로 하드코딩 시절과 동일

## 알려진 이슈 (Task 005-5·006-3에서 공통 재확인, 신규 아님)

`/accounts/[slug]`에서 존재하지 않는 슬러그에 접근할 때도 `/cases/[caseId]`와 동일한 Next.js `notFound()` 스트리밍 렌더링 제약(화면은 not-found UI가 정확히 뜨지만 HTTP 상태 코드가 200)이 재현된다. 근본 원인과 해결책(Task 010의 `generateStaticParams`)은 `tasks/005-full-page-ui.md`에 이미 기록돼 있으므로 중복 기록하지 않는다.

## 변경 사항 요약

`src/lib/content/account-dictionary.ts`(54종→45개 정규 계정과목 사전)와 `src/lib/content/account-index.ts`(N:M 인덱스 빌더)를 신설해 계정과목 자유 텍스트 파편화 문제를 해결했다. 회계 지식만으로 확신할 수 없는 2개 쌍(매도가능증권/매도가능금융자산, 대손충당금/손실충당금)은 사용자에게 직접 확인받아 반영했고, FVOCI/FVPL/AC 3분류는 사례의 핵심 지적사항을 보존하기 위해 절대 병합하지 않았다. FSS/2311-17의 슬래시 결합 라벨은 1:N 매핑으로 정보 손실 없이 흡수했다.

`/accounts`·`/accounts/[slug]`를 실데이터로 전환했고, `/taxonomy`의 하드코딩 건수도 실집계로 교체해 Task 004의 약속을 이행했다. 모든 단계에서 컴파일 통과에 그치지 않고 임시 API 라우트·Playwright MCP로 실제 실행 결과를 검증했다 — 사전 커버리지 100%, 인덱스 무결성(forward/reverse 총합 일치), 45개 계정과목 카드, N:M 양방향, 대표 계정과목 건수 전부를 실제 데이터로 확인한 뒤 검증용 임시 파일은 전부 정리했다.

이로써 `docs/ROADMAP.md` Phase 3의 최고 리스크 Task가 완료됐다. 다음은 Task 007(검색 및 필터 기능 구현)이다.
