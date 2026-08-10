# Task 010: 성능 최적화 및 배포 파이프라인

> `docs/ROADMAP.md` Phase 4의 마지막 Task. Task 009(검수 상태 관리)가 완료된 상태에서 착수했다. ROADMAP에 등록된 11개 Task 전체의 마지막이다.

## 개요 (고수준 명세서)

`/cases/[caseId]`·`/accounts/[slug]`를 빌드타임 SSG로 전환(`generateStaticParams` + `dynamicParams = false`)해 62건 사례·45개 계정과목 페이지를 정적으로 생성하고, `generateMetadata()`로 사례명/계정과목명 기반 메타데이터(noindex)를 추가했다. `dynamicParams = false`는 Task 005~007-1에서 3차례 재확인된 "`notFound()`가 스트리밍 SSR 환경에서 상태 코드 200을 반환하는" 버그의 근본 해결책이다. `.github/workflows/ci.yml`을 신규 작성했으나 커밋·푸시는 하지 않았다.

## 관련 파일

**신규 생성**

- `.github/workflows/ci.yml` — push(main)/PR 트리거, `npm ci → npm run check-all → npm run build` 3단계, Node 22

**수정**

- `src/app/cases/[caseId]/page.tsx` — `generateStaticParams()`, `dynamicParams = false`, `generateMetadata()`(noindex)
- `src/app/accounts/[slug]/page.tsx` — 동일 패턴

## 현재 상태 (착수 전 확인 사항)

- `package.json`에 `engines`/`.nvmrc`가 없어 CI에 Node 22(Active LTS)를 명시적으로 고정했다.
- `git add`/`commit`/`push`는 이 Task 범위가 아니다 — `.github/workflows/ci.yml`은 로컬 파일로만 존재하며, 실제 커밋 여부는 사용자가 결정한다.
- `docs/ROADMAP.md` 하단 진행 상황 갱신은 `/update-roadmap` 커맨드의 몫이므로 이 Task에서 직접 수정하지 않았다.

## 수락 기준

- [x] `/cases/[caseId]`(62건)·`/accounts/[slug]`(45개) 합계 107경로가 빌드타임 SSG(●)로 생성
- [x] 목록 밖 caseId/slug 접근 시 실제 HTTP 404 반환(기존 200 버그 해소)
- [x] 기존 유효 경로(앱이 실제로 생성하는 `encodeURIComponent` 단일 인코딩 링크)는 여전히 200
- [x] `.github/workflows/ci.yml` 로컬 생성(커밋·푸시 안 함)
- [x] `npm run check-all` 통과
- [x] `npm run build` 성공
- [x] SSG 전환 후 주 플로우(계정과목→사례 3클릭)·필터·검색 회귀 없음
- [x] 배포 환경변수 문서화

## 구현 단계

1. [x] `cases/[caseId]/page.tsx`·`accounts/[slug]/page.tsx`에 `generateStaticParams`+`dynamicParams=false`+`generateMetadata` 추가
2. [x] `npm run build`로 정적 생성 확인 — **버그 발견 및 수정**: `generateStaticParams`가 caseId를 `encodeURIComponent`한 값으로 반환하자 Next.js가 이를 다시 인코딩(`FSS%252F2106-07`)해, 실제 앱 링크(단일 인코딩 `FSS%2F2106-01`)로 접근한 유효 사례가 404가 되는 회귀가 발생했다. Next.js가 요청 시 `%2F`를 params에 넘길 때 이미 단일 디코딩하는 내부 동작에 맞춰 `generateStaticParams`가 raw(디코딩된) caseId를 반환하도록 수정
3. [x] 프로덕션 서버 + curl -D로 404/200 재검증
4. [x] `.github/workflows/ci.yml` 작성(커밋 안 함)
5. [x] `npm run check-all`+`npm run build` 최종 재확인, Playwright MCP로 회귀 검증, 배포 환경변수 문서화, 이 작업 파일 작성

## 테스트 체크리스트 (Playwright MCP + curl)

- [x] `npm run build` 성공 — 빌드 로그: `● /cases/[caseId]` 62경로, `● /accounts/[slug]` 45경로(합계 107)
- [x] `curl -D`: 존재하지 않는 caseId(`/cases/NOT-EXIST`)·slug(`/accounts/not-exist-slug`) → **404 Not Found** (버그 해소 확인)
- [x] `curl -D`: 유효 사례(`FSS%2F2106-01`, `FSS%2F2405-14`)·유효 계정과목(`sales`) → 200 OK
- [x] Playwright: `/accounts` → "매출" 링크(19건) 클릭 → `/accounts/sales`(title "매출") → 사례 링크 클릭 → `/cases/FSS%2F2106-04`(title "수익인식(총액·순액) 오류") — 3클릭 주 플로우 정상
- [x] Playwright: `/cases?findingType=공시누락` → 5건(복합 사례 FSS/2311-17 포함) — Task 007-1-a 필터 수정 회귀 없음
- [x] Playwright: `/cases` 검색창에 "밀어내기" 입력 → 1건(FSS/2311-02)으로 정상 필터링 — 검색 기능 회귀 없음

## 배포 환경변수 가이드

`src/lib/env.ts`가 Zod로 검증하는 환경변수 중 배포 시 결정이 필요한 것은 `NEXT_PUBLIC_ENFORCE_PUBLISH_GATE` 하나다.

| 변수                               | 기본값            | 용도                                                                                                                                                                          |
| ---------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_ENFORCE_PUBLISH_GATE` | 미설정(→ `false`) | `true`로 설정하면 `/cases`가 `reviewStatus`를 필터링해 `공개` 상태가 아닌 사례(현재 62건 전부가 `초안`)를 목록에서 숨긴다(`case-filters.ts`의 `applyCaseFilters` 3번째 인자). |

- **현재 데이터셋은 62건 전부 `reviewStatus: 초안`** 이므로, `NEXT_PUBLIC_ENFORCE_PUBLISH_GATE=true`로 배포하면 `/cases`가 빈 목록이 되고 `src/app/cases/page.tsx`의 `gateBlocksAll` 분기가 안내 Alert를 노출한다. 검수 완료 전에는 **설정하지 않거나 `false`로 유지**해야 실사용 가능한 목록이 노출된다.
- 검수 워크플로가 도입되어 일부 사례가 `검수중`→`공개`로 전환된 뒤, 실제 배포 환경(예: Vercel 프로젝트 설정)에서 `NEXT_PUBLIC_ENFORCE_PUBLISH_GATE=true`로 전환하는 것을 권장한다.
- `NEXT_PUBLIC_APP_URL`은 선택 항목(옵션)이며 현재 앱 코드에서 실사용처가 없어 이번 배포에서는 설정 불필요.
- CI(`ci.yml`)는 환경변수 없이 `npm ci → check-all → build` 3단계만 실행하므로 위 게이트 값과 무관하게 통과한다(빌드타임에 `NEXT_PUBLIC_ENFORCE_PUBLISH_GATE`가 없으면 Zod가 `false`로 처리).

## 변경 사항 요약

`/cases/[caseId]`·`/accounts/[slug]`를 `generateStaticParams`+`dynamicParams=false`로 SSG 전환해 107개 페이지를 빌드타임에 정적 생성했고, `generateMetadata()`로 noindex 메타데이터를 추가했다. 검증 과정에서 caseId에 포함된 `/`를 `encodeURIComponent`로 이중 인코딩해 반환하던 실질적 버그(유효 사례가 404가 되는 회귀)를 발견해 raw caseId 반환으로 수정했고, 수정 후 재빌드·재기동해 존재하지 않는 경로는 진짜 404, 유효 경로는 200임을 curl -D로 확인했다 — Task 005~007-1에서 3차례 재확인된 `notFound()` 200 버그가 이 Task에서 실제로 해소됐다. `.github/workflows/ci.yml`을 신규 작성(커밋·푸시는 하지 않음)했고, Playwright MCP로 SSG 전환 후에도 계정과목→사례 3클릭 플로우·지적유형 필터(복합 사례 포함)·검색 기능에 회귀가 없음을 확인했다. 배포 시 `NEXT_PUBLIC_ENFORCE_PUBLISH_GATE`를 문서화했다.

이로써 `docs/ROADMAP.md`에 등록된 Phase 1~4, Task 001~010(및 007-1) 전체가 완료됐다. `docs/ROADMAP.md` 진행 상황 갱신은 `/update-roadmap` 커맨드로 별도 수행한다.
