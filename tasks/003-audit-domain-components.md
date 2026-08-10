# Task 003: 감리사례 도메인 컴포넌트 구현

> `docs/ROADMAP.md` Phase 2(UI/UX 완성 — 더미 데이터 활용). Phase 1(Task 001 라우트 골격, Task 002 도메인 타입·프론트매터 스키마)이 선행 완료된 상태에서 착수한다.

## 개요 (고수준 명세서)

`src/components/audit/`를 신설해 감리지적사례 도메인 컴포넌트 7종(`finding-type-badge`, `review-status-badge`, `evidence-quote`, `account-chip`, `account-grid`, `case-card`, `case-detail`)을 구현하고, 이를 검증할 더미 데이터(`src/lib/dummy/cases.ts`)를 작성한다. 모든 컴포넌트는 기존 `src/components/ui/` 프리미티브(Badge/Card/Alert 등) 위에 **조합**으로만 구현하며 새 shadcn 프리미티브를 추가하지 않는다. 이 작업이 끝나야 Task 004(전 페이지 UI 배선)를 진행할 수 있다.

## 관련 파일

**신규 생성**

- `src/lib/dummy/cases.ts` — `AuditCase[]` 더미 데이터 5건
- `src/components/audit/finding-type-badge.tsx` — 지적유형 6종 배지(자산평가/수익인식/부채인식/공시누락/연결범위·연결처리 오류 → `chart-1`~`chart-5`, 부정관련 자산 허위계상 → `destructive`)
- `src/components/audit/review-status-badge.tsx` — 검수상태 3종(초안/검수중/공개) 배지
- `src/components/audit/evidence-quote.tsx` — 원문 인용 블록(인쇄쪽·PDF쪽 캡션 포함)
- `src/components/audit/account-chip.tsx` — 계정과목 단일 칩
- `src/components/audit/account-grid.tsx` — 계정과목 칩 그리드
- `src/components/audit/case-card.tsx` — 사례 목록용 요약 카드
- `src/components/audit/case-detail.tsx` — 사례 상세(고정 섹션 순서 렌더링)

**참고(수정 없음)**

- `src/types/audit-case.ts` — `AuditCase`/`FindingType`/`ReviewStatus`/`MaybeUnknown`/`isUnknown` 재사용
- `src/components/ui/badge.tsx`, `card.tsx`, `alert.tsx` — 재사용 대상 프리미티브
- `src/app/globals.css` — `chart-1`~`chart-5`, `destructive` CSS 변수 토큰(신규 추가 없이 그대로 사용)

## 현재 상태 (착수 전 확인 사항)

- Task 001/002가 이미 완료되어 있어 6개 라우트 골격과 `AuditCase` 타입, `case-frontmatter.ts` 파싱 유틸이 존재한다.
- `src/app/globals.css`의 색상 토큰이 `chart-1`~`chart-5` 5개뿐이라 지적유형 6종에 그대로 1:1 매핑되지 않는다 — "부정관련 자산 허위계상"을 `destructive`에 매핑하는 방식으로 해결(신규 CSS 변수 추가 없음).
- `src/components/audit/` 디렉터리는 아직 없음(이번 작업으로 신설).
- `src/lib/dummy/` 디렉터리도 아직 없음(이번 작업으로 신설).

## 수락 기준

- [x] `src/lib/dummy/cases.ts`에 `AuditCase[]` 5건, `findingType` 5종 이상 포함, `reviewStatus`에 `초안` 포함, `actionLevel`에 `unknown` 상태 최소 1건 포함
- [x] 7개 도메인 컴포넌트가 더미 데이터 타입과 컴파일 타임에 100% 매칭됨(`npm run typecheck` 통과) — **실제 브라우저 렌더링 육안 확인은 Task 004-4로 이연**(아래 변경 사항 요약 참고)
- [x] `case-detail`의 섹션 순서가 요약 → 지적유형·조치수준 → 관련 계정과목 → 근거 문장(+원문 출처) → (사실관계요약/판단근거/감사절차미흡사항/시사점/확인필요) 순서를 지킴
- [x] `actionLevel`이 `unknown`인 경우 "확인 필요" 배지 + 사유가, `known`인 경우 값이 표시됨(값 없음과 값이 "없음"인 것을 구분)
- [x] `src/components/ui/badge.tsx`의 `badgeVariants` 원본 미수정, 새 shadcn 프리미티브 미추가
- [x] `npm run check-all` 통과

## 구현 단계

1. [x] `src/lib/dummy/cases.ts` 작성 — `AuditCase[]` 5건(지적유형 5종, 검수상태 초안/검수중/공개 혼합, 조치수준 unknown/known 혼합)
2. [x] `finding-type-badge.tsx` 작성 — `Record<FindingType, string>`(dot 색상) 매핑 테이블, `Badge` 조합
3. [x] `review-status-badge.tsx` 작성 — `Record<ReviewStatus, BadgeProps['variant']>` 매핑
4. [x] `evidence-quote.tsx` 작성 — `blockquote` + `figcaption`(인쇄쪽/PDF쪽) 구조
5. [x] `account-chip.tsx`, `account-grid.tsx` 작성 — `Badge` 기반 칩 + 반응형 `flex-wrap` 그리드
6. [x] `case-card.tsx` 작성 — `Card` 조합, `FindingTypeBadge`/`ReviewStatusBadge` + 요약 1~2줄
7. [x] `case-detail.tsx` 작성 — 고정 섹션 순서, `isUnknown()` 분기로 조치수준 렌더링, `확인필요` 섹션은 `Alert`로 분리
8. [x] `npm run check-all` 실행 — 통과
9. [ ] 개발 서버에서 임시 페이지 또는 스토리성 렌더링으로 7개 컴포넌트 육안 확인 — **미실행. Task 004(페이지 배선) 완료 후 Task 004-4의 Playwright MCP 검증에서 실제 페이지 문맥으로 확인 예정이라 중복 작업을 피하기 위해 의도적으로 이연**

## 변경 사항 요약

`src/components/audit/`에 도메인 컴포넌트 7종(`finding-type-badge`, `review-status-badge`, `evidence-quote`, `account-chip`, `account-grid`, `case-card`, `case-detail`)과 `src/lib/dummy/cases.ts`(더미 5건)를 신규 생성했다. 모두 기존 `ui/` 프리미티브(Badge/Card/Alert/Separator) 조합으로만 구현했고 `badgeVariants` 등 프리미티브 원본은 수정하지 않았다.

**주요 설계 결정**

- 지적유형 6종 vs `globals.css`의 `chart-1~5`(5개) 불일치 문제를 "부정관련 자산 허위계상 → `destructive`, 나머지 5종 → `chart-1~5`"로 해결해 신규 CSS 변수 추가를 피했다.
- 지적유형 배지의 색상 구분을 텍스트 색이 아니라 장식용 dot(`aria-hidden`)에 배정해, `chart-4`/`chart-5`처럼 밝은 톤에서 텍스트 대비가 라이트 모드에 취약해지는 문제를 원천 차단했다(배지 텍스트는 항상 검증된 `outline` variant 대비 유지).
- pseudocode의 prop명 `case`는 JS 예약어라 구조분해 시 `SyntaxError`가 나므로 `auditCase`로 변경했다.

**이연된 항목**: 컴포넌트의 실제 브라우저 렌더링 육안 확인(수락 기준 항목 2, 구현 단계 9)은 아직 페이지에 배선되지 않아 수행하지 않았다. Task 004에서 페이지에 연결한 뒤 Task 004-4(Playwright MCP, 반응형·다크모드·3클릭 KPI 검증)에서 함께 확인하는 것이 중복 작업을 피하는 길이라 판단해 의도적으로 미룬 것이며, 누락이 아니다.
