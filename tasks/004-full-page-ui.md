# Task 004: 전 페이지 UI 완성 (더미 데이터)

> `docs/ROADMAP.md` Phase 2(UI/UX 완성 — 더미 데이터 활용). Task 003(감리사례 도메인 컴포넌트 7종 + 더미 데이터)이 선행 완료된 상태에서 착수한다.

## 개요 (고수준 명세서)

이미 존재하는 6개 라우트(`/`, `/accounts`, `/accounts/[slug]`, `/cases`, `/cases/[caseId]`, `/taxonomy`)의 자리표시자 UI를 Task 003에서 만든 도메인 컴포넌트와 더미 데이터로 실제 UI로 교체한다. 사례 상세는 고정 섹션 순서를 지키고, `[확인필요]` 값은 전용 렌더링으로 구분하며, `/taxonomy`는 지적유형 6종 건수를 노출한다. 이 작업이 끝나면 Phase 3(Task 005~)에서 더미 데이터를 실제 콘텐츠 파이프라인으로 교체할 수 있는 상태가 된다.

## 관련 파일

**신규 생성**

- `src/lib/dummy/accounts.ts` — 더미 계정과목 목록 + `findCasesByAccountLabel` 헬퍼

**수정(자리표시자 → 실제 UI)**

- `src/app/page.tsx` — 홈: `/accounts`·`/cases`·`/taxonomy` 3개 진입 카드
- `src/app/accounts/page.tsx` — 계정과목 인덱스(연결 사례 건수 표시)
- `src/app/accounts/[slug]/page.tsx` — 계정과목별 연결 사례 목록(0건 빈 상태 UI 포함)
- `src/app/cases/page.tsx` — 사례 전체 목록(`CaseCard` 그리드)
- `src/app/cases/[caseId]/page.tsx` — 사례 상세(`CaseDetail`, `notFound()` 처리)
- `src/app/taxonomy/page.tsx` — 지적유형 6종 건수 카드(`/cases?findingType=...` 링크)

## 현재 상태 (착수 전 확인 사항)

- Task 003이 완료되어 `src/components/audit/` 7종 컴포넌트와 `src/lib/dummy/cases.ts`(더미 5건)가 이미 존재한다.
- 6개 라우트는 Task 001에서 만든 자리표시자 텍스트만 있는 상태였다.
- `/cases`는 아직 `searchParams.findingType`으로 필터링하지 않는다(필터 로직은 Task 007 몫). `/taxonomy`의 링크는 URL 형태만 맞춰뒀다.

## 수락 기준

- [x] 6개 라우트 전부 200 응답(개발 서버 + `npm run build` 이후 정적/동적 라우트 확인)
- [x] 사례 상세 페이지가 요약 → 지적유형·조치수준 → 관련 계정과목 → 근거 문장(+원문 출처) → 나머지 섹션 → 확인필요 순서를 지킴
- [x] `[확인필요]`(조치수준) 값이 전용 배지+사유로 렌더링되어 빈칸/일반 텍스트와 구분됨
- [x] `/taxonomy`가 지적유형 6종 건수(20/17/9/8/5/4, 합 62)를 `taxonomy.md` 기준으로 노출하고 각 카드가 `/cases?findingType=...`로 연결됨
- [x] `npm run check-all` 통과
- [x] `npm run build` 성공(정적 페이지 8개 생성 확인: `/`, `/_not-found`, `/accounts`, `/accounts/[slug]`, `/cases`, `/cases/[caseId]`, `/taxonomy` — 동적 2종 포함)
- [x] 반응형(모바일 375px~데스크톱 1440px)·다크모드·3클릭 KPI 실측 — Task 004-4에서 완료(아래 "Task 004-4 검증 결과" 참고)

## 구현 단계

1. [x] `src/lib/dummy/accounts.ts` 작성 — `dummyCases.relatedAccounts`에서 고유 계정과목 파생
2. [x] `src/app/page.tsx` — 3개 진입 카드로 교체
3. [x] `src/app/accounts/page.tsx` — 계정과목 카드 그리드(연결 사례 건수 표시)로 교체
4. [x] `src/app/accounts/[slug]/page.tsx` — `CaseCard` 목록 + 0건 빈 상태 UI로 교체
5. [x] `src/app/cases/page.tsx` — `CaseCard` 그리드로 교체
6. [x] `src/app/cases/[caseId]/page.tsx` — `dummyCases.find` + `notFound()` + `CaseDetail`로 교체
7. [x] `src/app/taxonomy/page.tsx` — 지적유형 6종 카드(`FindingTypeBadge` + 건수 + 링크)로 교체
8. [x] `npm run check-all` 실행 — 통과
9. [x] `npm run build` 실행 — 성공
10. [x] Task 004-4: Playwright MCP로 반응형·다크모드·3클릭 KPI 검증 완료

## Task 004-4 검증 결과 (Playwright MCP)

`npm run build` 성공 후 `npx next start -p 3007`(프로덕션 서버)을 대상으로 실제 브라우저(Playwright MCP)로 검증했다.

**3클릭 KPI 실측**

홈(`/`) → [계정과목] 클릭(1) → `/accounts` → [재고자산 1건] 클릭(2) → `/accounts/재고자산`(연결 사례 `CaseCard` 목록 표시) → [재고자산 저가법 미적용...] 클릭(3) → `/cases/DUMMY-001`(사례 상세 도착). **총 3클릭으로 KPI 기준(3클릭 이내) 충족.** `/accounts/[slug]`가 "계정과목별 사례 목록"과 "사례 목록 진입" 두 역할을 겸해 홈→계정과목→사례목록→사례상세 4단계가 3클릭 안에 들어온다.

**반응형(모바일 375px / 데스크톱 1440px)**

- 모바일(375×812): 홈/`/accounts`/`/cases/DUMMY-001`(known)/`/cases/DUMMY-002`(unknown+확인필요)/`/accounts`(다크) 전부 1컬럼 스택, 텍스트 줄바꿈·카드 여백 정상. 헤더 햄버거 메뉴(`시트`)를 열어 홈/계정과목/사례/분류체계 4개 링크가 전부 노출되는 것도 확인.
- 데스크톱(1440×900): `/cases`, `/taxonomy`가 `lg:grid-cols-3` 3컬럼으로 정상 전환, 카드 간격·타이포그래피 깨짐 없음.

**다크모드**

헤더의 테마 전환(드롭다운: 라이트/다크/시스템) → "다크" 선택 후 `/cases`, `/cases/DUMMY-002`(확인필요 배지+Alert 블록), `/taxonomy`, `/accounts`(모바일)를 재확인. 배경·텍스트·배지(지적유형 dot, 검수상태 배지)·Alert 블록 전부 라이트 대비 대비가 반전되어 유지되고, 가독성 문제나 색상 깨짐은 발견되지 않았다.

**조치수준 known/unknown 분기 및 확인필요 블록 시각 확인**

`/cases/DUMMY-001`(known)은 조치수준에 "감사인 지정 3년" 텍스트가, `/cases/DUMMY-002`(unknown)는 "확인 필요" 배지(title 속성에 사유 포함)가 표시됨을 accessibility snapshot으로 확인. `DUMMY-002`의 `sections.확인필요`는 본문과 분리된 별도 Alert 블록(아이콘+제목+설명)으로 렌더링되어 case-detail.tsx 설계대로 동작함을 확인했다.

**부수 발견(범위 밖, 수정하지 않음)**: 모바일 메뉴(시트) 오픈 시 콘솔에 Radix `DialogContent requires a DialogTitle` 접근성 경고가 뜬다. 이는 Task 001에서 만들어진 `src/components/navigation/mobile-nav.tsx`의 기존 구현 이슈이며 이번 Phase 2 작업 범위(도메인 컴포넌트·더미 데이터 배선) 밖이라 수정하지 않고 기록만 남긴다. 기능(4개 링크 노출·이동)은 정상 동작한다.

## 알려진 이슈 — Task 010 인수인계 메모

**`/cases/[caseId]`의 `notFound()` 호출 시 HTTP 상태 코드가 200으로 반환됨** (화면 콘텐츠는 not-found UI가 정확히 렌더링되지만 상태 코드만 200).

- 재현: `npm run build && npx next start -p <port>` 이후 `curl -D - http://localhost:<port>/cases/NOT-EXIST` → `HTTP/1.1 200 OK`(프로덕션 빌드에서도 재현, dev 서버 한정 현상이 아님)
- 원인: `/cases/[caseId]`가 `generateStaticParams` 없이 요청 시점에 동적 렌더링(SSR)되는 라우트이고, `params`를 `await`하는 비동기 컴포넌트라 Next.js App Router의 스트리밍 렌더링 구조상 상위 셸이 이미 200으로 응답을 시작한 뒤 `notFound()`가 호출되어 상태 코드를 더 이상 바꿀 수 없는, 문서화된 Next.js 프레임워크 제약이다.
- **근본 해결책은 이미 `docs/ROADMAP.md` Task 010에 명시**: "`/cases/[caseId]`와 `/accounts/[slug]`에 `generateStaticParams`를 적용해 62건 사례 + 전 계정과목 페이지를 빌드타임 정적 생성". 알려진 `caseId`가 빌드타임에 정적 생성되면, 그 외 경로 접근만 진짜 404가 된다.
- 이번 Task 004에서는 더미 데이터 기준으로 즉석 `generateStaticParams`를 넣는 대신(Task 005/010에서 다시 버려야 하는 임시 코드가 되므로) 이슈만 기록하고 범위를 지켰다. **Task 010 착수 시 이 항목을 완료 기준에 포함할 것.**

## 변경 사항 요약

Task 003의 도메인 컴포넌트·더미 데이터를 6개 라우트에 전부 배선했다. 홈은 3개 진입 카드, `/accounts`·`/accounts/[slug]`는 계정과목 인덱스와 연결 사례 목록(0건 빈 상태 포함), `/cases`·`/cases/[caseId]`는 사례 목록/상세(`notFound()` 포함), `/taxonomy`는 지적유형 6종 건수 카드로 구성했다. `npm run check-all`과 `npm run build` 모두 통과했고, 개발 서버·프로덕션 서버를 실제로 띄워 curl로 각 라우트의 상태 코드와 렌더링 내용을 직접 확인했다.

발견된 유일한 결함은 위 "알려진 이슈"에 기록한 `notFound()` 상태 코드 200 건으로, 코드 버그가 아니라 SSG 미적용 상태에서 발생하는 Next.js 프레임워크 특성이며 Task 010에서 해결될 예정이다.

Task 004-4에서 Playwright MCP로 3클릭 KPI(홈→계정과목→계정별 사례목록→사례상세, 총 3클릭)를 실측 통과했고, 모바일(375px)·데스크톱(1440px)·다크모드 전 조합에서 시각적 깨짐 없이 렌더링됨을 확인했다. 이로써 `docs/ROADMAP.md` Phase 2(Task 003·004)가 완료됐다.
