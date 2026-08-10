# Task 007: 검색 및 필터 기능 구현

> `docs/ROADMAP.md` Phase 3. Task 006(계정과목 정규화)이 선행 완료된 상태에서 착수한다.

## 개요 (고수준 명세서)

`/cases`에 지적유형(6종)·지적연도(2020~2023 4종)·검수상태(3종) 교차 필터를 URL `searchParams`와 동기화해 구현하고, 그 위에 사례명·요약·계정과목 표기 대상 클라이언트 사이드 검색(URL 비동기화)을 추가한다. `env.NEXT_PUBLIC_ENFORCE_PUBLISH_GATE`(Task 002에서 이미 구현된 공개 게이트)를 소비해 게이트 활성화 시 검수상태=공개만 노출하고, 62건 전량 초안인 현재 데이터에서는 0건이 되는 상황을 전용 배너로 정직하게 안내한다. 조치수준은 어떤 필터/정렬 축에도 포함하지 않는다.

## 관련 파일

**신규 생성**

- `src/lib/content/case-filters.ts` — `parseCaseFilterParams()`(searchParams 파싱, 문자열/배열 방어), `applyCaseFilters()`(AND 결합+게이트)
- `src/components/audit/case-filter-bar.tsx` — 지적유형·지적연도·검수상태 체크박스 그룹, URL 동기화(`use client`)
- `src/components/audit/case-searchable-list.tsx` — 검색창+`CaseCard` 그리드+빈 상태(`use client`)

**수정**

- `src/app/cases/page.tsx` — async Server Component로 재작성, `searchParams` 기반 서버 필터링 + 게이트 배너 분기 + 2단 레이아웃(`lg:grid-cols-[240px_1fr]`)

**무수정(재사용)**

- `src/lib/env.ts`(`NEXT_PUBLIC_ENFORCE_PUBLISH_GATE`, Task 002), `src/lib/content/get-audit-cases.ts`(Task 005), `src/components/audit/{case-card,finding-type-badge,review-status-badge}.tsx`(Task 003)

## 현재 상태 (착수 전 확인 사항)

- `env.ts`에 게이트 플래그가 이미 Zod 스키마로 정의돼 있어(기본값 `false`) 새로 만들 필요가 없었다.
- 착수 전 실제 데이터를 grep으로 조사해 지적연도가 2020(15건)·2021(15건)·2022(18건)·2023(14건) 4종임을 확인했다.
- `src/components/ui/`에 popover/combobox류가 없어, 필터 UI(전부 소수 옵션)는 기존 `Checkbox`+`Label`만으로 구현했다(신규 프리미티브 없음).
- ROADMAP 원문이 "URL 쿼리 동기화"를 카테고리 필터에만 명시하고 검색은 별도로 서술한 점에 근거해, 검색어는 URL에 반영하지 않는 순수 클라이언트 상태로 설계했다(서버 왕복 없는 즉시성).

## 수락 기준

- [x] 지적유형 필터 선택 시 URL에 `?findingType=...` 반영, 카드 건수가 `taxonomy.md` 기대값과 일치
- [x] 새로고침 후 필터(체크박스 상태+카드 수) 완전히 유지
- [x] 지적유형+지적연도 등 복수 필터가 AND로 결합됨(사전 계산값과 UI 결과 일치)
- [x] 검색어 무결과 시 전용 빈 상태 UI + "검색어 지우기" 노출
- [x] "필터 초기화"(상단)로 URL 카테고리 필터 전체 제거, 62건 복원
- [x] 공개 게이트 활성화 시 0건 + 전용 안내 배너, 비활성화(기본값) 시 62건 전체 노출
- [x] 조치수준이 필터/정렬 어디에도 포함되지 않음
- [x] `npm run check-all` 통과
- [x] `npm run build` 성공(기본값 게이트로 원복된 상태)

## 구현 단계

1. [x] `case-filters.ts` 구현 — 임시 API 라우트로 문자열/배열/undefined 입력, 단일 필터(자산평가 20건), AND 결합(자산평가+2020년 4건), 게이트(0건) 전부 실제 62건 데이터로 검증
2. [x] `case-filter-bar.tsx` 구현 — 기존 `Checkbox`/`Label`/`FindingTypeBadge`/`ReviewStatusBadge`/`Button`만 사용, `router.replace(..., {scroll:false})`로 URL 갱신
3. [x] `case-searchable-list.tsx` 구현 + `cases/page.tsx` 재작성 — `searchParams` 기반 서버 필터링, 게이트 배너 분기, 2단 레이아웃
4. [x] `npm run build` 성공 확인
5. [x] Playwright MCP로 URL 동기화·새로고침 유지·AND 결합·검색 무결과 검증 도중 **버그 발견 및 수정**(아래 참고)
6. [x] 게이트 `true`/`false` 별도 빌드로 0건/62건·배너 노출 확인 후 기본값으로 재빌드해 원복
7. [x] `tasks/007-search-and-filter.md` 작성

## 테스트 체크리스트 (Playwright MCP)

- [x] `/cases`에서 지적유형 "자산평가" 체크 → URL이 `?findingType=자산평가`로 정확히 갱신, 카드 20건(taxonomy.md 기대값과 일치)
- [x] 위 상태에서 새로고침(직접 URL 재요청) → 체크박스 `checked` 상태와 카드 20건 완전히 유지
- [x] 지적연도 "2020년"을 추가 체크 → URL이 `?findingType=자산평가&year=2020`, 카드 4건(Task 007-a 순수 함수 검증값과 UI 레벨에서 정확히 일치)
- [x] 검색창에 무의미한 문자열 입력 → `검색어 "..."에 대한 결과가 없습니다.` + "검색어 지우기" 버튼 노출
- [x] "검색어 지우기" 클릭 → 검색어만 지워지고 카테고리 필터(자산평가+2020년)는 유지되어 4건 복원
- [x] 상단 "필터 초기화" 클릭 → URL이 `/cases`로 정리되고 62건 전부 노출
- [x] `NEXT_PUBLIC_ENFORCE_PUBLISH_GATE=true`로 별도 빌드+서버 기동 → `/cases` 0건 + "공개된 사례가 없습니다" 배너 노출 확인
- [x] 검증 후 기본값(`false`)으로 재빌드해 저장소 상태 원복 확인

## 발견한 버그와 수정 (정직하게 기록)

**증상**: 검색어를 입력해 결과가 0건이 된 상태에서 (당시 구현이었던) "필터 초기화" **링크**(`<Link href="/cases">`)를 클릭하면, URL은 정확히 `/cases`로 바뀌고 카테고리 필터도 제거됐지만 **검색창에 입력했던 텍스트와 그로 인한 0건 상태가 그대로 남아있었다**.

**원인**: `<Link>` 클릭은 Next.js App Router의 클라이언트 사이드 네비게이션이라 페이지 전체가 다시 로드되지 않는다. `CaseSearchableList`(`'use client'`)는 새 `searchParams`로 다시 렌더링된 서버 컴포넌트로부터 새 `cases` prop(62건 전체)을 받지만, 컴포넌트 자체는 리마운트되지 않아 `useState(query)` 로컬 상태가 이전 값("ZZZ...")으로 그대로 유지됐다. 그 결과 새로 받은 62건을 여전히 이전 검색어로 필터링해 0건이 표시됐다.

**수정**: 빈 상태 CTA를 상황에 따라 분기했다 — 검색어가 원인이면(`trimmedQuery`가 있으면) `onClick={() => setQuery('')}`로 로컬 상태를 직접 지우는 버튼("검색어 지우기")을, 검색어가 비어 있는데도 0건이면(카테고리 필터가 원인) 기존처럼 `/cases`로 이동하는 링크("필터 초기화")를 보여준다. 재빌드 후 Playwright로 두 경로 모두 재검증해 정상 동작을 확인했다.

## 변경 사항 요약

`case-filters.ts`(순수 필터링 함수), `case-filter-bar.tsx`(URL 동기화 체크박스 그룹), `case-searchable-list.tsx`(클라이언트 검색+빈 상태)를 신설하고 `/cases`를 `searchParams` 기반 서버 필터링 Server Component로 재작성해 지적유형·지적연도·검수상태 교차 필터와 클라이언트 검색, 공개 게이트 연동을 완성했다. 모든 신규 UI는 기존 shadcn 프리미티브(Checkbox/Label/Input/Button)와 Task 003 도메인 컴포넌트만 재사용했다.

Playwright 검증 과정에서 "필터 초기화" 버튼이 URL 카테고리 필터는 정확히 지우지만 클라이언트 로컬 상태인 검색어는 Next.js 클라이언트 라우팅 특성상 지우지 못하는 실제 버그를 발견해 즉시 수정했다(빈 상태 CTA를 원인별로 분기). 게이트 플래그는 `true`/`false` 두 번 별도 빌드로 0건/62건과 배너 노출을 전부 실제 확인한 뒤, 검증이 끝나자마자 기본값(`false`)으로 재빌드해 저장소를 원복했다.

**추록(Task 007-1-a에서 발견)**: 이 Task를 완료 처리한 뒤 이어진 Task 007-1(통합 테스트)에서 지적유형별 필터 결과를 `taxonomy.md` 기대값과 전수 대조하던 중 `공시누락` 필터 결과가 4건(기대값 5건)으로 나오는 추가 버그를 발견했다. 원인은 `applyCaseFilters()`의 지적유형 필터가 `auditCase.findingType`(주 유형)만 검사하고 Task 006에서 도입한 `additionalFindingTypes`(보조 유형 — FSS/2311-17이 `공시누락`을 여기 담고 있음)를 검사하지 않아서였다. `/taxonomy`의 실집계 로직(`countByFindingType`)은 이미 두 필드를 이중집계하고 있었는데 `case-filters.ts`가 그 패턴을 따르지 않아 생긴 불일치였다. `applyCaseFilters()`의 findingType 필터 조건에 `additionalFindingTypes?.some(...)` 검사를 추가해 수정했고, 재빌드 후 6종 전체(20/17/9/8/5/4)가 `taxonomy.md`와 정확히 일치함을 재확인했다.

다음은 Task 007-1(핵심 플로우 통합 테스트)이다.
