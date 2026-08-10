# AI Agent 프로젝트 표준 (shrimp-rules.md)

> 이 문서는 **Coding Agent AI 전용 운영 규칙**이다. 일반 Next.js/React/TypeScript/Tailwind 지식은 다루지 않는다. 이 저장소에서만 유효한 규칙·경계·의사결정 기준만 기술한다.

## 1. 저장소 구조 — 두 개의 독립 트랙 (최우선 규칙)

이 저장소는 서로 의존관계가 없는 두 트랙을 담고 있다. **작업 지시가 어느 트랙인지 모호하면 먼저 확인 없이 임의로 두 트랙을 섞지 마라.**

| 트랙                                  | 소속 경로                                                                                                                                                     | 정본 문서                                                                                            |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Next.js 앱**                        | `src/`, `docs/guides/*`, `docs/ROADMAP.md`, `.claude/agents/dev/*`                                                                                            | `CLAUDE.md`, `docs/ROADMAP.md`, `README.md`                                                          |
| **감리지적사례 지식 추출 파이프라인** | `data/audit-cases/`, `.claude/agents/docs/audit-case-ingestor.md`, `audit-case-verifier.md`, `notion-database-expert.md`, `docs/PRD.md`, `docs/PRD_PROMPT.md` | `docs/PRD.md`, `data/audit-cases/knowledge/{sourcebook-index.md,taxonomy.md,verification-report.md}` |

- **금지**: 파이프라인 트랙 작업(사례 카드 초안 생성·검증)을 Next.js 앱 코드(`src/`) 변경과 같은 작업 단위로 섞지 마라.
- **금지**: Next.js 앱 작업 중 `data/audit-cases/knowledge/cases/*.md`, `data/audit-cases/index.json`, `taxonomy.md`, `verification-report.md`를 수정하지 마라 — 앱 트랙에서는 **읽기 전용 입력 데이터**다.
- `docs/PRD.md`는 **Next.js 앱의 요구사항 문서가 아니다**. Next.js 앱 작업 중 요구사항을 찾을 때는 `docs/PRD.md`의 F-01~F-10 표(요구사항·데이터 모델 정본으로만 인용)와 `docs/ROADMAP.md`의 "PRD 요구사항 추적표"를 함께 봐라. 단독으로 `docs/PRD.md`를 앱 사양으로 취급하지 마라.

## 2. `docs/PRD.md` vs `docs/ROADMAP.md` 충돌 처리 규칙

- `docs/PRD.md` §11은 "웹/모바일 앱 개발"을 MVP 범위 외로 명시하고, 순수 Notion 워크스페이스 구현을 전제한다.
- `docs/ROADMAP.md`는 이 지점에서 **의도적으로 PRD와 다른 방향**(Next.js 웹앱으로 구현)을 취한다고 명시했다.
- **AI 의사결정 기준**: Next.js 앱의 **구현 매체·아키텍처·기술 선택**은 `docs/ROADMAP.md`를 따른다. `docs/PRD.md`는 **기능 요구사항(F-01~F-10)과 데이터 모델의 의미**를 참고할 때만 인용한다. 두 문서가 구현 방식에서 충돌하면 `docs/ROADMAP.md`가 우선한다.
- PRD를 갱신할지 여부는 미결정 사항(ROADMAP TBD-5)이다. 이를 임의로 해결(PRD 수정 등)하지 말고 사용자에게 확인하라.

## 3. `docs/guides/*` 문서 신뢰도 — Stale 여부 반드시 교차 확인

- `docs/guides/project-structure.md`는 **현재 시점 기준으로 낡았다(stale)**: `login/`, `signup/` 페이지, `components/sections/{hero,features,cta}.tsx`, `login-form.tsx`, `signup-form.tsx`를 여전히 정본 구조인 것처럼 서술하지만, 실제로는 `starter-cleaner` 작업으로 삭제 진행 중이다(현재 git status상 `D` 상태, 미커밋).
- **규칙**: `docs/guides/project-structure.md`의 폴더 트리·컴포넌트 목록을 그대로 신뢰하지 마라. 항상 `README.md`의 "디렉터리 구조" 절과 `src/` 실제 상태를 우선한다. 이 문서를 참고 자료로 인용하기 전에 해당 항목이 실제로 존재하는지 확인하라.
- `docs/guides/project-structure.md`를 갱신하는 작업은 `docs/ROADMAP.md` Task 001(라우트 구조 및 레이아웃 골격 구축)의 일부로 예정되어 있다. 이 문서의 정합성을 발견 시 임의로 대규모 재작성하지 말고, Task 001 범위 안에서 처리하거나 사용자에게 알려라.

## 4. 진행 중인 starter 정리 작업 — 다중 파일 동기화 규칙

현재 git 작업 트리에 `starter-cleaner`가 미완료 상태로 남아 있다(미커밋). 이 정리를 이어가거나 라우트를 추가/삭제할 때 **다음 파일들을 항상 함께 갱신**하라 — 하나만 고치면 깨진 상태로 남는다:

- `src/app/` 아래 라우트를 추가/삭제하면 → `src/components/navigation/main-nav.tsx`와 `mobile-nav.tsx`의 링크 목록, `src/components/layout/header.tsx`·`footer.tsx`의 참조를 **동시에** 갱신하라.
- `public/`의 스타터 기본 아이콘(`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`)은 이미 삭제 대상이다 — 새 코드에서 이 아이콘들을 참조하지 마라.
- `src/app/login/`, `src/app/signup/`, `src/components/login-form.tsx`, `src/components/signup-form.tsx`, `src/components/sections/*`는 삭제 대상이다 — 이 경로를 신규 코드에서 import하거나 재생성하지 마라.

## 5. `docs/ROADMAP.md` — Next.js 앱 작업의 정본 워크플로

- Next.js 앱 관련 작업을 시작하기 전 `docs/ROADMAP.md`의 해당 Phase/Task 절을 먼저 읽어라. Task 번호·완료 기준·제약 3가지(검수상태 전량 초안 / 조치수준 전량 `[확인필요]` / 관련계정과목 자유텍스트)는 이 저장소의 데이터 실태에서 파생된 설계 제약이므로 무시하면 화면이 비거나 인덱스가 깨진다.
- 신규 작업 파일은 `/tasks/XXX-description.md` 형식으로 생성한다(디렉터리 미생성 상태 — Task 착수 시 함께 생성). Phase 3(Task 005~009)처럼 데이터·비즈니스 로직을 다루는 작업 파일에는 **"## 테스트 체크리스트" 섹션과 Playwright MCP 시나리오를 반드시 포함**하라.
- 각 구현 단계 완료 후 **`npm run check-all` → `npm run build`**를 통과시키고, 비즈니스 로직/콘텐츠 파이프라인 작업이면 이어서 Playwright MCP E2E를 수행한 뒤에만 완료로 간주하라.
- `/update-roadmap` 커맨드 없이 `docs/ROADMAP.md`의 Task 상태·진행률 두 줄을 직접 임의로 고치지 마라.

## 6. 컴포넌트 재사용 원칙 (Next.js 앱)

- `src/components/ui/`(18종 shadcn 프리미티브: button, card, form, input, select, dialog 등), `src/components/layout/`, `src/components/navigation/`, `src/components/providers/`는 **전부 재사용 대상**이다. **새 shadcn 프리미티브를 임의로 추가하지 마라** — 필요한 것은 대부분 도메인 컴포넌트다.
- 감리지적사례 도메인 UI(`case-card`, `case-detail`, `finding-type-badge`, `review-status-badge`, `evidence-quote`, `account-chip`, `account-grid` 등, ROADMAP Task 003)는 `src/components/audit/`에 신설하고, 기존 `ui/` 프리미티브 위에 **조합**으로 구현하라. 처음부터 새로 만들지 마라.

## 7. 데이터/환경변수 규칙

- 콘텐츠 데이터 소스는 `data/audit-cases/knowledge/cases/`의 **로컬 마크다운 62개 파일을 빌드타임에 파싱**하는 방식이다. **Notion API(`@notionhq/client`)를 Next.js 앱에 도입하지 마라** — `package.json`에 의도적으로 미설치 상태다.
- 새 환경변수는 반드시 `src/lib/env.ts`의 Zod 스키마부터 확장하라. `process.env`를 코드에서 직접 참조하지 마라.
- 공개 게이트 플래그(`NEXT_PUBLIC_ENFORCE_PUBLISH_GATE`, boolean)를 다룰 때 **기본값은 반드시 `false`**로 유지하라(내부 도구 전제, 62건 전량이 `검수상태: 초안`이라 `true`가 기본이면 화면이 빈다). 기본값을 바꾸려면 먼저 사용자에게 확인하라(ROADMAP TBD-2).
- `gray-matter` 등 신규 npm 의존성(특히 마크다운 파서, `package.json` 변경이 필요한 것)을 임의로 추가하지 마라 — 사전 합의가 필요한 미결정 사항이다(ROADMAP TBD-3).

## 8. 테스트 정책

- 이 저장소에는 **Jest/Vitest 등 테스트 프레임워크가 구성되어 있지 않다.** 테스트 관련 요청을 받으면 임의로 러너를 도입하지 말고, 먼저 어떤 러너를 도입할지 사용자에게 확인하라(ROADMAP TBD-1).
- 기능 검증은 **Playwright MCP를 통한 브라우저 E2E 확인**으로 수행한다. UI/비즈니스 로직 변경 후에는 가능하면 Playwright MCP로 실제 동작을 확인하라.

## 9. 완료 전 필수 체크리스트 (Next.js 앱 코드 변경 시)

1. `npm run check-all` (typecheck + lint + format:check) 통과
2. `npm run build` 성공
3. Husky pre-commit 훅을 `--no-verify`로 우회하지 마라. 훅 실패 시 원인을 수정하라.

## 10. 서브에이전트 경계

- `.claude/agents/dev/*` (`nextjs-app-developer`, `ui-markup-specialist`, `code-reviewer`, `development-planner`, `starter-cleaner`): **Next.js 앱 전용.**
- `.claude/agents/docs/{prd-generator,prd-validator}`: 범용 PRD 생성/검증 — 트랙 무관하게 사용 가능.
- `.claude/agents/docs/{audit-case-ingestor,audit-case-verifier,notion-database-expert}`: **감리지적사례 파이프라인 전용**이며 Next.js 앱과 무관하다. Next.js 앱 작업 맥락에서 이 세 에이전트를 호출하지 마라.

## 11. 금지 사항 요약

- Next.js 앱 작업에서 `data/audit-cases/knowledge/cases/*.md`, `index.json`, `taxonomy.md`, `verification-report.md`를 **수정** (읽기만 허용)
- `docs/PRD.md`를 Next.js 앱의 단독 요구사항 정본으로 취급
- `docs/guides/project-structure.md`의 폴더 트리를 검증 없이 그대로 신뢰
- `src/app/login/`, `src/app/signup/`, `src/components/{login-form,signup-form}.tsx`, `src/components/sections/*`, `public/{file,globe,next,vercel,window}.svg` 재생성/참조
- `src/components/ui/`에 불필요한 신규 shadcn 프리미티브 추가
- `@notionhq/client` 등 Notion API 의존성을 Next.js 앱에 추가
- `process.env` 직접 참조 (반드시 `src/lib/env.ts` 경유)
- 사용자 확인 없이 테스트 러너(Jest/Vitest) 도입, `package.json`에 신규 의존성 추가
- `git commit --no-verify`로 Husky pre-commit 훅 우회
- `/update-roadmap` 커맨드 없이 `docs/ROADMAP.md`의 Task 상태 임의 수정
