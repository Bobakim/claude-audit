# Task 005: 마크다운 콘텐츠 파이프라인 구축

> `docs/ROADMAP.md` Phase 3(핵심 기능 구현) — 우선순위 작업. Phase 2(Task 003·004)가 선행 완료된 상태에서 착수한다.

## 개요 (고수준 명세서)

`data/audit-cases/knowledge/cases/`의 마크다운 62개 파일을 빌드타임에 파싱해 `AuditCase[]`로 변환하는 로더를 `src/lib/content/`에 신설하고, `/cases`·`/cases/[caseId]` 두 라우트를 더미 데이터에서 실데이터로 전환한다. 착수 전 62개 원본 파일을 grep으로 실사해 헤딩 표기 변형·복합 지적유형 케이스를 확인했고, 이를 반영한 두 가지 사용자 결정(gray-matter 미도입, FSS/2311-17 단일값+보조필드 처리)을 구현에 그대로 반영했다.

## 관련 파일

**신규 생성**

- `src/lib/content/parse-frontmatter-yaml.ts` — frontmatter YAML 서브셋 파서(자체 구현, gray-matter 미사용)
- `src/lib/content/parse-sections.ts` — 본문 `## ` 헤딩 → `CaseSections` 매퍼(접두어 매칭으로 표기 변형 흡수)
- `src/lib/content/get-audit-cases.ts` — 오케스트레이터(`getAuditCases()`, React `cache()`로 메모이제이션, 62건/지적유형 분포 assert)

**수정**

- `src/types/audit-case.ts` — `AuditCase`에 `additionalFindingTypes?: FindingType[]` 추가
- `src/app/cases/page.tsx` — `dummyCases` → `getAuditCases()`, 링크 `encodeURIComponent(caseId)` 적용
- `src/app/cases/[caseId]/page.tsx` — `dummyCases` → `getAuditCases()`

**무수정(범위 제외, 계획대로)**

- `src/app/page.tsx`, `src/app/accounts/page.tsx`, `src/app/accounts/[slug]/page.tsx`, `src/app/taxonomy/page.tsx` — 계정과목 정규화(Task 006) 전까지 더미 데이터 유지
- `src/lib/dummy/cases.ts`, `src/lib/dummy/accounts.ts` — 위 4개 라우트가 계속 참조하므로 삭제하지 않음
- `src/components/audit/*`, `src/lib/schemas/case-frontmatter.ts` — 전부 그대로 재사용

## 현재 상태 (착수 전 확인 사항)

- 62개 원본 파일을 grep으로 전수 조사한 결과: 헤딩 "시사점 (원문)"(36건)/"시사점 원문 발췌"(26건) 두 변형, "감사절차 미흡사항" 표기 변형 1건, 표준 밖 11번째 섹션("주요 쟁점 및 결과") 1건, 복합 지적유형("부정관련 자산 허위계상(횡령손실 미인식) + 공시누락") 1건(FSS/2311-17)을 확인했다.
- 사용자 결정: (A) gray-matter 미도입, 자체 파서 유지 (B) FSS/2311-17은 `findingType` 단일값(주 유형) + `additionalFindingTypes` 보조 필드로 표현, 기존 UI 컴포넌트 무수정.
- `src/lib/schemas/case-frontmatter.ts`의 `parseCaseFrontmatter`/`parseActionLevel`/`parseSource`는 이미 "raw 객체 → AuditCaseFrontmatter" 변환을 구현하고 있어 무수정 재사용했다.

## 수락 기준

- [x] 62개 파일 전건이 예외 없이 파싱됨(빌드타임 assert 포함)
- [x] 지적유형별 건수(자산평가 20·수익인식 17·부정관련 자산 허위계상 9·부채인식 8·공시누락 5·연결범위·연결처리 오류 4)가 `taxonomy.md`와 정확히 일치(FSS/2311-17 이중집계 포함)
- [x] frontmatter 검증 실패·본문 섹션 누락 시 파일 경로·필드명·기대값을 포함한 Error로 빌드가 실제로 중단됨(손상 파일 유도 테스트로 확인)
- [x] `/cases`가 실데이터 62건을 카드로 렌더링(더미 아님)
- [x] `/cases/[caseId]`가 실제 caseId(`FSS/xxxx-xx`, 슬래시 포함)로 정상 진입해 frontmatter·본문 내용이 원본과 일치
- [x] `gray-matter` 등 신규 npm 의존성 미추가(`package.json` 무변경)
- [x] `data/audit-cases/` 원본 무수정
- [x] `npm run check-all` 통과
- [x] `npm run build` 성공(62건 assert가 빌드 중 실행됨)

## 구현 단계

1. [x] `parse-frontmatter-yaml.ts` 구현 — `key: value` + 블록 리스트 두 패턴 지원, 62건 실행 검증
2. [x] `parse-sections.ts` 구현 — 헤딩 접두어 매칭, 62건 실행 검증(경고 1건만 발생 확인)
3. [x] `get-audit-cases.ts` 오케스트레이터 구현 + `AuditCase.additionalFindingTypes` 타입 추가 + `COMPOSITE_FINDING_TYPE_OVERRIDES`(FSS/2311-17) + React `cache()` — 임시 API 라우트로 Next.js 런타임에서 실행 검증(62건, 분포 일치, 복합 케이스 반영 확인 후 라우트 삭제)
4. [x] `/cases`, `/cases/[caseId]` 페이지를 `getAuditCases()`로 배선 — 실데이터 caseId의 슬래시(`FSS/2106-01`) 때문에 발생하는 라우팅 버그를 발견해 `encodeURIComponent`로 수정
5. [x] `npm run build` 성공 확인
6. [x] 손상 파일 유도 테스트(스크래치패드에서 임시 파일 생성 → 임시 API 라우트로 `getAuditCases(임시경로)` 호출 → Error 발생 확인 → 즉시 정리)
7. [x] Playwright MCP로 `/cases` 62건 카드 확인 + 사례 상세 4건(FSS/2106-07, FSS/2206-11, FSS/2311-17[복합 케이스], FSS/2405-14) frontmatter·본문 대조
8. [x] `tasks/005-markdown-content-pipeline.md` 작성

## 테스트 체크리스트 (Playwright MCP)

- [x] `npm run build` 성공(62건/지적유형 분포 assert가 빌드 중 통과)
- [x] 손상된 frontmatter(6종+예외 어디에도 속하지 않는 지적유형)를 스크래치패드 임시 파일로 주입 → `getAuditCases(임시경로)` 호출 시 실제로 Error가 발생함을 확인(에러 메시지에 파일명 `broken-case.md`, 필드명 `지적유형`, 기대값 6종 목록 전부 포함) → 임시 파일·디렉터리 즉시 삭제, `data/audit-cases/` 원본 무변경 확인
- [x] `npx next start`(프로덕션 서버)로 `/cases` 접속 → `document.querySelectorAll('a[href^="/cases/"]').length === 62` 확인
- [x] 임의 사례 상세 4건 진입 → 원본 `.md` 파일과 사례명·지적유형·검수상태·관련 계정과목·출처(인쇄쪽/PDF쪽) 전부 대조 일치 확인:
  - FSS/2106-07(`2020-관계기업투자주식-손상차손미인식.md`) — 일치
  - FSS/2206-11(`2021-매출채권대손충당금-과소계상.md`) — 일치
  - FSS/2311-17(`2022-횡령손실-특수관계자거래미기재.md`, 복합 지적유형 케이스) — 화면에 "부정관련 자산 허위계상" 단일 배지만 노출(계획대로), 관련 계정과목·출처 일치
  - FSS/2405-14(`2023-특수관계자주석-지급보증유상증자미기재.md`) — 일치
- [x] 원본에 `## 확인 필요` 섹션이 있는 사례(FSS/2106-07)에서 해당 섹션 내용이 화면에 정확히 렌더링됨을 확인

## 변경 사항 요약

`src/lib/content/`에 자체 YAML 서브셋 파서·본문 섹션 파서·React `cache()` 기반 오케스트레이터 3개 파일을 신설해 62개 마크다운 카드를 빌드타임에 `AuditCase[]`로 파싱하는 파이프라인을 완성했다. `/cases`·`/cases/[caseId]` 두 라우트만 실데이터로 전환했고(`/`, `/accounts/*`, `/taxonomy`는 Task 006 전까지 더미 데이터 유지, 계획대로), `src/types/audit-case.ts`에 `additionalFindingTypes?` 선택적 필드를 추가해 복합 지적유형 사례(FSS/2311-17) 1건을 기존 UI 컴포넌트 무수정으로 흡수했다.

계획에 없던 실전 버그 하나를 구현 중 발견해 수정했다: 실제 `caseId`(`FSS/2106-01`)가 슬래시를 포함해 인코딩 없이 링크를 만들면 Next.js 동적 라우팅이 깨지는 문제였다(`encodeURIComponent`로 해결). 모든 단계에서 컴파일 통과에 그치지 않고 실제로 함수를 실행했다 — frontmatter/섹션 파서는 62개 원본 파일 전체에 직접 돌려 검증했고, 오케스트레이터와 손상 파일 유도 테스트는 임시 API 라우트로 Next.js 런타임에서 실제 실행해 확인한 뒤 흔적 없이 정리했다. 최종적으로 프로덕션 서버를 띄워 Playwright MCP로 `/cases` 62건 카드와 사례 상세 4건(복합 케이스 포함)을 원본 마크다운과 직접 대조해 전부 일치함을 확인했다.

이로써 `docs/ROADMAP.md` Task 005가 완료됐다. 다음은 Task 006(계정과목 정규화 사전 및 N:M 인덱스 구축 — 로드맵상 최고 리스크 Task)이다.
