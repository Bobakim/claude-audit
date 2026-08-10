# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# 🤖 Claude Code 개발 지침

**audit-case-explorer**는 계정과목을 시작점으로 금융감독원 감리지적사례를 3클릭 안에 찾아내는 내부 지식 웹앱이다(Next.js 15.5.3 + React 19). `docs/ROADMAP.md`에 등록된 Phase 1~4(Task 001~010)가 전부 완료된 상태이며, 새 작업은 이 로드맵의 다음 단계이거나 완료된 기능의 유지보수다.

## ⚠️ 이 저장소는 두 개의 독립된 작업 트랙을 담고 있음

1. **Next.js 앱** (`src/`, `docs/guides/*`, `docs/ROADMAP.md`) — 아래 설명하는 실제 빌드 대상 코드
2. **감리지적사례 지식 추출 파이프라인** (`data/audit-cases/`, `.claude/agents/docs/audit-case-ingestor.md`·`audit-case-verifier.md`·`notion-database-expert.md`) — 금융감독원 감리지적사례집 PDF를 읽어 별도의 **Notion 워크스페이스 기반 시스템**(`docs/PRD.md`, `docs/PRD_PROMPT.md`에 정의됨)에 넣을 지식 카드를 만드는 완전히 별개의 작업이다. Next.js 앱의 코드와 아무 의존관계가 없다.

**`docs/PRD.md`는 이 Next.js 앱의 요구사항 문서가 아니다** — "감리지적사례 조회 시스템"이라는 별도 Notion 프로젝트의 PRD이므로, Next.js 앱 작업 시 참조하지 않는다. **`docs/ROADMAP.md`가 이 Next.js 앱의 실제 요구사항·설계 결정·PRD와의 의도적 차이점(구현 매체를 Notion 대신 Next.js로 결정한 근거 등)의 정본이다.** `data/audit-cases/knowledge/`(사례 카드·분류체계·검증 리포트)의 최신 상태를 파악하려면 그 안의 `sourcebook-index.md`·`taxonomy.md`·`verification-report.md`를 직접 참고한다. `verification-report.md`는 62/62건(100%) 검증 완료 상태다.

## 🛠️ 핵심 기술 스택 (Next.js 앱)

- **Framework**: Next.js 15.5.3 (App Router + Turbopack)
- **Runtime**: React 19.1.0 + TypeScript 5 (strict 모드)
- **Styling**: TailwindCSS v4(설정파일 없는 CSS 기반 엔진) + shadcn/ui (`new-york` 스타일, base color `neutral`)
- **Forms**: React Hook Form + Zod + Server Actions
- **UI Components**: Radix UI + Lucide Icons
- **Development**: ESLint(flat config) + Prettier(+ `prettier-plugin-tailwindcss`) + Husky + lint-staged

## 📚 개발 가이드 (Next.js 앱 전용)

- 🗺️ 개발 로드맵·완료 현황: `@/docs/ROADMAP.md` (`/docs:update-roadmap` 커맨드로 갱신)
- 📁 프로젝트 구조: `@/docs/guides/project-structure.md`
- 🎨 스타일링 가이드: `@/docs/guides/styling-guide.md`
- 🧩 컴포넌트 패턴: `@/docs/guides/component-patterns.md`
- ⚡ Next.js 15.5.3 전문 가이드: `@/docs/guides/nextjs-15.md`
- 📝 폼 처리 완전 가이드: `@/docs/guides/forms-react-hook-form.md`
- 📄 각 기능의 구현 히스토리·발견된 버그·검증 방법: `@/tasks/*.md` (Task 번호별 1파일, ROADMAP 각 Task의 상세 기록)

## ⚡ 자주 사용하는 명령어

```bash
# 개발
npm run dev         # 개발 서버 (Turbopack, http://localhost:3000)
npm run build        # 프로덕션 빌드 (Turbopack) — 빌드타임 데이터 무결성 assert 포함
npm run start        # 프로덕션 서버 실행 (build 이후)

# 코드 품질 (개별 실행)
npm run lint          # ESLint 검사
npm run lint:fix       # ESLint 자동 수정
npm run format         # Prettier 포맷 적용
npm run format:check    # Prettier 포맷 검사만
npm run typecheck       # tsc --noEmit

npm run check-all       # typecheck + lint + format:check 순차 실행 (권장, CI에서도 동일하게 실행됨)

# UI 컴포넌트
npx shadcn@latest add button    # 새 shadcn/ui 컴포넌트 추가
```

- **테스트 러너 미구성** — Jest/Vitest 등 테스트 프레임워크가 없다(도입하지 않기로 최종 결정됨, `docs/ROADMAP.md` TBD-1 참고). 기능 검증은 **Playwright MCP를 통한 브라우저 E2E 확인**으로 수행한다. 단일 함수를 빠르게 확인하고 싶으면 `src/app/api/debug-*/route.ts`에 임시 API 라우트를 만들어 `curl`로 호출한 뒤 검증이 끝나면 반드시 삭제하는 패턴을 사용한다(레포에 남기지 않음).
- **pre-commit 훅**: Husky가 커밋 시 `npx lint-staged`를 실행해 스테이징된 `*.{js,jsx,ts,tsx}`는 `eslint --fix` + `prettier --write`, `*.{json,css,md}`는 `prettier --write`를 자동 적용한다. 훅을 우회(`--no-verify`)하지 않는다.
- **CI**: `.github/workflows/ci.yml`이 push(main)·PR 트리거에서 Node 22로 `npm ci → npm run check-all → npm run build`를 실행한다.

## ✅ 작업 완료 체크리스트

```bash
npm run check-all   # 모든 검사 통과 확인
npm run build       # 빌드 성공 확인(데이터 무결성 assert 포함, 아래 참고)
```

## 🏗️ 아키텍처 개요 (Next.js 앱)

- **경로 별칭**: `@/*` → `src/*` (`tsconfig.json`). 상대 경로 대신 항상 `@/` 별칭을 사용한다 (`docs/guides/project-structure.md`에 상세 컨벤션).
- **컴포넌트 레이어링** (`src/components/`): `ui/`(shadcn 기반 순수 프리미티브, 비즈니스 로직 없음) · `layout/`(헤더·푸터·컨테이너) · `navigation/` · `audit/`(감리사례 도메인 컴포넌트: `case-card`·`case-detail`·`finding-type-badge`·`review-status-badge`·`verification-badge`·`evidence-quote`·`account-chip`/`account-grid`·`case-filter-bar`·`case-searchable-list`) · `providers/`(Context 프로바이더). 신규 shadcn 프리미티브 추가는 원칙적으로 지양하고 기존 프리미티브를 조합해 도메인 컴포넌트를 만든다.
- **테마**: `src/app/layout.tsx`의 루트에서 `next-themes`의 `ThemeProvider`(`attribute="class"`, `defaultTheme="system"`)가 전체 앱을 감싼다. 다크모드는 `class` 전략이므로 색상 토큰은 `src/app/globals.css`의 CSS 변수로 정의한다.
- **환경변수 검증**: `src/lib/env.ts`에서 Zod 스키마로 `process.env`를 파싱해 `env` 객체로 노출한다. 새 환경변수를 추가할 때는 여기 스키마부터 확장하고, `process.env`를 직접 참조하지 않는다. `NEXT_PUBLIC_ENFORCE_PUBLISH_GATE`(기본 `false`)가 `true`면 `/cases`가 `reviewStatus !== '공개'`인 사례를 숨긴다 — 현재 62건 전부 `초안`이므로 `true`로 배포하면 목록이 빈다(`tasks/010-performance-and-deployment.md`의 배포 환경변수 가이드 참고).
- **보안 헤더**: `next.config.ts`의 `headers()`에서 `X-Frame-Options`, `X-Content-Type-Options` 등 전역 보안 헤더를 설정한다.
- **shadcn/ui 별칭**: `components.json`에 `@/components`, `@/components/ui`, `@/lib`, `@/hooks` 별칭이 정의되어 있으며, `npx shadcn@latest add`로 추가되는 컴포넌트는 이 별칭 기준으로 생성된다.

### 콘텐츠 파이프라인 — 마크다운 → 타입 도메인 객체 (`src/lib/content/`)

앱의 데이터 원천은 **런타임 fetch도 Notion API도 아니고, `data/audit-cases/knowledge/cases/`의 62개 마크다운 파일**이다. 이 디렉터리는 위에서 말한 지식 파이프라인 트랙의 산출물이며, Next.js 앱 쪽에서는 **읽기 전용 입력 데이터**로만 취급한다(앱 코드에서 이 파일들을 수정하지 않는다).

- `get-audit-cases.ts`가 오케스트레이터다: 각 파일을 `parse-frontmatter-yaml.ts`(자체 YAML 파서, `gray-matter` 등 의존성 미도입)와 `parse-sections.ts`(본문 8개 고정 섹션 헤딩 분해)로 파싱하고, `src/lib/schemas/case-frontmatter.ts`의 Zod 스키마로 검증한 뒤 `AuditCase[]`(`src/types/audit-case.ts`)를 반환한다. React `cache()`로 빌드 중 중복 파싱을 막는다.
- **빌드타임 하드 assert 패턴**: 기본 데이터셋(인자 생략 시)에 한해 `getAuditCases()`가 (1) 정확히 62건 (2) `taxonomy.md` 기준 지적유형 6종 분포(20/17/9/8/5/4) (3) `page-offset.ts`의 `+6` 오프셋 규칙을 62건 전수 만족하는지를 assert해, 데이터가 조용히 깨진 채로 빌드가 성공하는 일을 막는다. `account-index.ts`도 같은 패턴으로 계정과목 미분류 0건을 assert한다. 테스트용으로 다른 디렉터리를 넘기면(예: 손상 파일 fixture) 이 assert들이 스킵된다 — **기본 인자를 생략한 호출만 하드 게이트가 걸린다**는 점을 새 콘텐츠 함수를 추가할 때도 유지한다.
- **계정과목 정규화**: 원문 `관련계정과목`은 자유 텍스트(`매출액(연결)`, `금융자산(FVOCI/FVPL/AC 분류)` 등 표기가 제각각)라, `account-dictionary.ts`의 **사람이 검토한 명시적 매핑 사전**(자동 유사도 추론 금지)으로 45개 정규 계정과목으로 정규화한다. 사전에 없는 표기는 임의 병합하지 않고 "미분류"로 격리한다. `account-index.ts`가 이 정규화 결과로 계정과목↔사례 N:M 정/역인덱스를 만든다.
- **검증 상태**: `verification-report.ts`가 `data/audit-cases/knowledge/verification-report.md`의 마크다운 판정 표를 파싱해 `VerificationStatus`(검증완료/미검증/불일치/부분일치)를 사례별로 부여한다. 파싱 시 `'일치'`가 `'부분일치'`·`'불일치'`의 부분 문자열이라 `includes()`가 아니라 **공백 기준 첫 토큰 엄격 비교**를 쓴다 — 이 함정은 유사한 마크다운 표 파서를 새로 만들 때마다 재발하기 쉬우니 주의한다.
- **복합 지적유형**: `FSS/2311-17`처럼 원문 지적유형이 두 유형에 걸치는 극소수 사례는 `get-audit-cases.ts`의 `COMPOSITE_FINDING_TYPE_OVERRIDES`에 하드코딩으로 정규화하고 `additionalFindingTypes` 보조 필드로 부가 유형을 표현한다(주 `findingType`은 단일값 유지).
- **필터**: `case-filters.ts`의 `applyCaseFilters()`는 지적유형 필터링 시 `findingType`뿐 아니라 `additionalFindingTypes`도 확인해야 복합 사례가 두 필터 모두에서 정확히 집계된다(과거 이 부분을 놓쳐 회귀가 났던 지점).

### 동적 라우트 — SSG와 caseId 인코딩

`/cases/[caseId]`(62)·`/accounts/[slug]`(45)는 `generateStaticParams` + `export const dynamicParams = false`로 빌드타임 정적 생성된다(합계 107페이지). `caseId`는 `FSS/2106-01`처럼 `/`를 포함해 URL 세그먼트와 충돌하므로 앱 링크는 항상 `encodeURIComponent(caseId)`로 생성한다.

**주의**: `generateStaticParams`는 **디코딩된 원본 caseId를 그대로 반환**해야 한다(`encodeURIComponent`로 다시 인코딩해서 넘기면 안 됨). Next.js는 요청 시 `%2F`를 이미 단일 디코딩해 `params.caseId`로 넘기는데, `generateStaticParams`에 인코딩된 값을 주면 Next가 이를 재인코딩해(`FSS%252F...`) 실제 앱 링크(`FSS%2F...`)와 매칭되지 않는 404 회귀가 생긴다. `dynamicParams = false`는 Task 005~007-1에서 반복 발견된 "존재하지 않는 caseId 접근 시 `notFound()`가 스트리밍 SSR 환경에서 상태 코드 200을 반환하는" 버그의 근본 해결책이기도 하다.

## 🧩 Claude Code 서브에이전트 / 커맨드

- `.claude/agents/dev/*` — Next.js 앱 개발용(앱 구조 설계, UI 마크업, 스타터 정리, 로드맵 관리, 코드 리뷰)
- `.claude/agents/docs/*` — `prd-generator`/`prd-validator`(범용 PRD 생성·검증)와 `notion-database-expert`/`audit-case-ingestor`/`audit-case-verifier`(위 "감리지적사례 지식 추출 파이프라인" 전용, Next.js 앱과 무관). `audit-case-ingestor`는 카드 생성·수정(초안만, 검수상태 전환은 절대 하지 않음), `audit-case-verifier`는 읽기 전용 원문 대조 검증(카드를 스스로 고치지 않고 `verification-report.md`에만 기록) — 자기검증 편향을 피하려 역할이 의도적으로 분리되어 있다.
- `.claude/commands/git/*`, `.claude/commands/docs/update-roadmap.md` — git 브랜치/커밋/머지/PR, 로드맵 갱신 커맨드
