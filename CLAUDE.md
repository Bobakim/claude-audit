# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# 🤖 Claude Code 개발 지침

**claude-nextjs-starters**는 Next.js 15.5.3 + React 19 기반 모던 웹 애플리케이션 스타터 템플릿입니다.

## ⚠️ 이 저장소는 두 개의 독립된 작업 트랙을 담고 있음

1. **Next.js 앱** (`src/`, `docs/guides/*`) — 아래 설명하는 실제 빌드 대상 코드
2. **감리지적사례 지식 추출 파이프라인** (`data/audit-cases/`, `.claude/agents/docs/audit-case-ingestor.md`·`audit-case-verifier.md`·`notion-database-expert.md`) — 금융감독원 감리지적사례집 PDF를 읽어 별도의 **Notion 워크스페이스 기반 시스템**(`docs/PRD.md`, `docs/PRD_PROMPT.md`에 정의됨)에 넣을 지식 카드를 만드는 완전히 별개의 작업이다. Next.js 앱의 코드와 아무 의존관계가 없다.

**`docs/PRD.md`는 이 Next.js 앱의 요구사항 문서가 아니다** — "감리지적사례 조회 시스템"이라는 별도 Notion 프로젝트의 PRD이므로, Next.js 앱 작업 시 참조하지 않는다. `data/audit-cases/knowledge/`(사례 카드·분류체계·검증 리포트)의 최신 상태를 파악하려면 그 안의 `sourcebook-index.md`·`taxonomy.md`·`verification-report.md`를 직접 참고한다.

## 🛠️ 핵심 기술 스택 (Next.js 앱)

- **Framework**: Next.js 15.5.3 (App Router + Turbopack)
- **Runtime**: React 19.1.0 + TypeScript 5 (strict 모드)
- **Styling**: TailwindCSS v4(설정파일 없는 CSS 기반 엔진) + shadcn/ui (`new-york` 스타일, base color `neutral`)
- **Forms**: React Hook Form + Zod + Server Actions
- **UI Components**: Radix UI + Lucide Icons
- **Development**: ESLint(flat config) + Prettier(+ `prettier-plugin-tailwindcss`) + Husky + lint-staged

## 📚 개발 가이드 (Next.js 앱 전용)

- 🗺️ 개발 로드맵: `@/docs/ROADMAP.md` (아직 생성 전 — `/docs:update-roadmap` 커맨드로 생성/갱신)
- 📁 프로젝트 구조: `@/docs/guides/project-structure.md`
- 🎨 스타일링 가이드: `@/docs/guides/styling-guide.md`
- 🧩 컴포넌트 패턴: `@/docs/guides/component-patterns.md`
- ⚡ Next.js 15.5.3 전문 가이드: `@/docs/guides/nextjs-15.md`
- 📝 폼 처리 완전 가이드: `@/docs/guides/forms-react-hook-form.md`

## ⚡ 자주 사용하는 명령어

```bash
# 개발
npm run dev         # 개발 서버 (Turbopack, http://localhost:3000)
npm run build        # 프로덕션 빌드 (Turbopack)
npm run start        # 프로덕션 서버 실행 (build 이후)

# 코드 품질 (개별 실행)
npm run lint          # ESLint 검사
npm run lint:fix       # ESLint 자동 수정
npm run format         # Prettier 포맷 적용
npm run format:check    # Prettier 포맷 검사만
npm run typecheck       # tsc --noEmit

npm run check-all       # typecheck + lint + format:check 순차 실행 (권장)

# UI 컴포넌트
npx shadcn@latest add button    # 새 shadcn/ui 컴포넌트 추가
```

- **테스트 러너 미구성** — Jest/Vitest 등 테스트 프레임워크가 아직 설정되어 있지 않다. 테스트 관련 요청이 오면 먼저 어떤 러너를 도입할지 확인한다.
- **pre-commit 훅**: Husky가 커밋 시 `npx lint-staged`를 실행해 스테이징된 `*.{js,jsx,ts,tsx}`는 `eslint --fix` + `prettier --write`, `*.{json,css,md}`는 `prettier --write`를 자동 적용한다. 훅을 우회(`--no-verify`)하지 않는다.

## ✅ 작업 완료 체크리스트

```bash
npm run check-all   # 모든 검사 통과 확인
npm run build       # 빌드 성공 확인
```

## 🏗️ 아키텍처 개요 (Next.js 앱)

- **경로 별칭**: `@/*` → `src/*` (`tsconfig.json`). 상대 경로 대신 항상 `@/` 별칭을 사용한다 (`docs/guides/project-structure.md`에 상세 컨벤션).
- **컴포넌트 레이어링** (`src/components/`): `ui/`(shadcn 기반 순수 프리미티브, 비즈니스 로직 없음) · `layout/`(헤더·푸터·컨테이너) · `navigation/` · `sections/`(페이지 섹션 블록) · `providers/`(Context 프로바이더) + 최상위에 폼 등 페이지 전용 컴포넌트. 이 분류 기준과 네이밍 컨벤션(kebab-case 파일명, PascalCase 컴포넌트명)은 `docs/guides/project-structure.md`가 정본이다.
- **테마**: `src/app/layout.tsx`의 루트에서 `next-themes`의 `ThemeProvider`(`attribute="class"`, `defaultTheme="system"`)가 전체 앱을 감싼다. 다크모드는 `class` 전략이므로 색상 토큰은 `src/app/globals.css`의 CSS 변수로 정의한다.
- **환경변수 검증**: `src/lib/env.ts`에서 Zod 스키마로 `process.env`를 파싱해 `env` 객체로 노출한다. 새 환경변수를 추가할 때는 여기 스키마부터 확장하고, `process.env`를 직접 참조하지 않는다.
- **보안 헤더**: `next.config.ts`의 `headers()`에서 `X-Frame-Options`, `X-Content-Type-Options` 등 전역 보안 헤더를 설정한다.
- **shadcn/ui 별칭**: `components.json`에 `@/components`, `@/components/ui`, `@/lib`, `@/hooks` 별칭이 정의되어 있으며, `npx shadcn@latest add`로 추가되는 컴포넌트는 이 별칭 기준으로 생성된다.

## 🧩 Claude Code 서브에이전트 / 커맨드

- `.claude/agents/dev/*` — Next.js 앱 개발용(앱 구조 설계, UI 마크업, 스타터 정리, 로드맵 관리, 코드 리뷰)
- `.claude/agents/docs/*` — `prd-generator`/`prd-validator`(범용 PRD 생성·검증)와 `notion-database-expert`/`audit-case-ingestor`/`audit-case-verifier`(위 "감리지적사례 지식 추출 파이프라인" 전용, Next.js 앱과 무관)
- `.claude/commands/git/*`, `.claude/commands/docs/update-roadmap.md` — git 브랜치/커밋/머지/PR, 로드맵 갱신 커맨드
