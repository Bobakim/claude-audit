# Task 001: 라우트 구조 및 레이아웃 골격 구축

> `docs/ROADMAP.md` Phase 1(애플리케이션 골격 구축) — 우선순위 작업.

## 개요 (고수준 명세서)

`audit-case-explorer`의 정보 구조(IA)를 이루는 App Router 라우트 6종의 빈 페이지 골격을 만들고,
기존 스타터 킷의 레이아웃(header/footer/container)·내비게이션(main-nav/mobile-nav) 컴포넌트를
"계정과목 / 사례 / 분류체계" 앱 IA에 맞게 갱신한다. 신규 레이아웃 컴포넌트를 새로 만들지 않고
기존 파일을 수정하는 것이 원칙이다. 이 작업이 끝나야 Phase 2(더미 데이터 UI)를 얹을 뼈대가 생긴다.

## 관련 파일

**신규 생성**

- `src/app/accounts/page.tsx` — 계정과목 인덱스
- `src/app/accounts/[slug]/page.tsx` — 과목별 사례 목록
- `src/app/cases/page.tsx` — 전체 사례 목록
- `src/app/cases/[caseId]/page.tsx` — 사례 상세
- `src/app/taxonomy/page.tsx` — 지적유형 분류체계
- `src/app/accounts/loading.tsx`, `src/app/accounts/[slug]/loading.tsx`, `src/app/cases/loading.tsx`, `src/app/cases/[caseId]/loading.tsx`, `src/app/taxonomy/loading.tsx` — shadcn `skeleton` 기반
- `src/app/accounts/error.tsx`, `src/app/accounts/[slug]/error.tsx`, `src/app/cases/error.tsx`, `src/app/cases/[caseId]/error.tsx`, `src/app/taxonomy/error.tsx` — 클라이언트 컴포넌트(`'use client'`)
- `src/app/not-found.tsx` — 앱 루트 404

**수정**

- `src/app/page.tsx` — 대시보드(`/`)로 채움 (현재 빈 플레이스홀더)
- `src/components/layout/header.tsx` — 로고/타이틀은 이미 "감리지적사례 조회"로 반영됨, 추가 IA 요소 필요 시 조정
- `src/components/layout/footer.tsx` — 필요 시 앱 IA 링크 보강
- `src/components/navigation/main-nav.tsx` — `navItems`를 6개 라우트 기준으로 교체, 활성 경로 하이라이트(기존 `pathname === item.href` 로직을 `startsWith`로 확장 필요 — `[slug]`/`[caseId]` 하위 경로 대응)
- `src/components/navigation/mobile-nav.tsx` — 위와 동일한 `navItems` 교체

**삭제(정리) — 이미 워킹트리에서 삭제 상태, 커밋만 필요**

- `src/app/login/page.tsx`, `src/app/signup/page.tsx`
- `src/components/login-form.tsx`, `src/components/signup-form.tsx`
- `src/components/sections/hero.tsx`, `features.tsx`, `cta.tsx`
- `public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`

## 현재 상태 (착수 전 확인 사항)

`git status` 기준으로 스타터 정리가 **부분적으로 이미 진행되어 있고 아직 커밋되지 않음**:

- 랜딩용 hero/features/cta 섹션, login/signup 라우트·폼 컴포넌트, 미사용 스타터 SVG는 이미 삭제됨(워킹트리 반영, 미커밋)
- `src/app/layout.tsx`의 `metadata`가 이미 "감리지적사례 조회 시스템"으로 갱신됨
- `src/components/layout/header.tsx`가 이미 로고 텍스트 "감리지적사례 조회"로 갱신되고 `MainNav`/`MobileNav`/`ThemeToggle`을 사용하는 반응형 헤더로 구성됨
- `src/components/navigation/main-nav.tsx`, `mobile-nav.tsx`의 `navItems`는 아직 `[{ title: '홈', href: '/' }]` 1개뿐 — **이번 Task의 핵심 남은 작업**
- `src/app/page.tsx`는 `Header`/`Container`/`Footer`만 있는 빈 껍데기(`{null}`) — 대시보드 콘텐츠 없음
- `src/app/accounts/`, `src/app/cases/`, `src/app/taxonomy/` 라우트 자체가 아직 없음(신규 생성 대상)
- `/tasks` 디렉토리가 이번 Task 착수와 함께 최초 생성됨

## 수락 기준

- [ ] 라우트 6종(`/`, `/accounts`, `/accounts/[slug]`, `/cases`, `/cases/[caseId]`, `/taxonomy`) 전부 200 응답
- [ ] 헤더 데스크톱 내비 + 모바일 시트 내비에서 6개 라우트 전부로 이동 가능, 활성 경로 하이라이트 동작
- [ ] 각 동적/목록 라우트 세그먼트에 `loading.tsx`(skeleton)·`error.tsx`(client) 배치, 앱 루트에 `not-found.tsx` 배치
- [ ] 스타터 잔여물(hero/features/cta, login/signup, 미사용 SVG) 삭제가 커밋에 반영됨
- [ ] `npm run check-all` 통과
- [ ] `npm run build` 성공

## 구현 단계

1. [ ] `src/app/accounts/page.tsx`, `src/app/accounts/[slug]/page.tsx` 빈 페이지 생성(placeholder 텍스트만)
2. [ ] `src/app/cases/page.tsx`, `src/app/cases/[caseId]/page.tsx` 빈 페이지 생성
3. [ ] `src/app/taxonomy/page.tsx` 빈 페이지 생성
4. [ ] `src/app/page.tsx`를 대시보드 placeholder로 채움(현재 `{null}` 제거)
5. [ ] 위 4개 라우트 세그먼트에 `loading.tsx`(shadcn `Skeleton` 사용) 배치
6. [ ] 위 4개 라우트 세그먼트에 `error.tsx`(`'use client'`, `reset()` 버튼 포함) 배치
7. [ ] `src/app/not-found.tsx` 생성
8. [ ] `main-nav.tsx`·`mobile-nav.tsx`의 `navItems`를 6개 라우트로 교체, 활성 경로 판정을 하위 경로까지 포함하도록 수정(`pathname.startsWith(item.href)` 등, `/`는 완전 일치 유지)
9. [ ] 스타터 잔여물 삭제분 확인 후 커밋 대상으로 스테이징(코드 추가 삭제 없이 기존 워킹트리 상태 확정)
10. [ ] `npm run check-all` 실행, 실패 시 수정
11. [ ] `npm run build` 실행, 성공 확인
12. [ ] 개발 서버 기동 후 헤더/모바일 내비로 6개 라우트 전부 수동 내비게이션 확인

## 변경 사항 요약

> 작업 완료 후 채운다. 시작 시점에는 비워 둔다.
