# 감리지적사례 조회 시스템 (audit-case-explorer)

계정과목별 금융감독원 감리지적사례를 조회하는 내부 지식 시스템의 Next.js 프론트엔드입니다.

## 🛠️ 기술 스택

- **Framework**: Next.js 15.5.3 (App Router + Turbopack)
- **Runtime**: React 19.1.0
- **Language**: TypeScript 5 (strict 모드)
- **Styling**: Tailwind CSS v4 (설정파일 없는 CSS 기반 엔진)
- **UI Components**: shadcn/ui (`new-york` 스타일, base color `neutral`) + Radix UI + Lucide Icons
- **Forms**: React Hook Form + Zod
- **Development**: ESLint(flat config) + Prettier(+ `prettier-plugin-tailwindcss`) + Husky + lint-staged

## 🚀 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:3000)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행 (build 이후)
npm run start
```

## ✅ 코드 품질

```bash
npm run typecheck      # tsc --noEmit
npm run lint            # ESLint 검사
npm run lint:fix         # ESLint 자동 수정
npm run format           # Prettier 포맷 적용
npm run format:check      # Prettier 포맷 검사만

npm run check-all         # typecheck + lint + format:check 순차 실행 (권장)
```

커밋 시 Husky pre-commit 훅이 `npx lint-staged`를 자동 실행해 스테이징된 파일에
`eslint --fix` / `prettier --write`를 적용합니다. `--no-verify`로 훅을 우회하지 마세요.

## 📁 디렉터리 구조

```
src/
  app/                # App Router 라우트 (layout.tsx, page.tsx, globals.css)
  components/
    ui/                # shadcn/ui 기반 순수 프리미티브
    layout/             # 헤더·푸터·컨테이너
    navigation/          # 내비게이션 메뉴
    providers/            # Context 프로바이더 (ThemeProvider 등)
  lib/                 # 유틸리티, 환경변수 스키마(env.ts)
```

경로 별칭 `@/*`는 `src/*`를 가리키며, 상대 경로 대신 항상 `@/` 별칭을 사용합니다.

더 자세한 컨벤션은 아래 가이드 문서를 참고하세요.

- [프로젝트 구조 가이드](./docs/guides/project-structure.md)
- [스타일링 가이드](./docs/guides/styling-guide.md)
- [컴포넌트 패턴 가이드](./docs/guides/component-patterns.md)
- [Next.js 15.5.3 전문 가이드](./docs/guides/nextjs-15.md)
- [폼 처리 완전 가이드](./docs/guides/forms-react-hook-form.md)

## ⚠️ 주의: 이 저장소의 두 개 트랙

이 저장소는 서로 독립된 두 작업 트랙을 담고 있습니다.

1. **이 Next.js 앱** (`src/`, `docs/guides/*`) — 위에서 설명한 실제 빌드 대상 코드
2. **감리지적사례 지식 추출 파이프라인** (`data/audit-cases/`, `docs/PRD.md`, `docs/PRD_PROMPT.md`) —
   금융감독원 감리지적사례집 PDF를 읽어 별도의 **Notion 워크스페이스 기반 시스템**에 넣을 지식
   카드를 만드는 완전히 별개의 작업입니다.

`data/audit-cases/`와 `docs/PRD.md`는 이 Next.js 앱과 코드 의존관계가 전혀 없으며, 앱 개발 시
참조하지 않습니다. 자세한 원칙은 [`CLAUDE.md`](./CLAUDE.md)를 참고하세요.
