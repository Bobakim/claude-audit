# Task 008: 원문 PDF 출처 열람 기능

> `docs/ROADMAP.md` Phase 4. Task 007(검색·필터), Task 007-1(통합 테스트)이 완료된 상태에서 착수한다.

## 개요 (고수준 명세서)

ROADMAP 원안은 사례 상세의 출처 표기를 `#page=N` 딥링크로 전환하는 것이었으나, 착수 전 TBD-4(원문 PDF 배포 방식)를 사용자에게 확인한 결과 **"PDF를 앱에 포함하지 않고 링크/안내만 제공"**으로 결정됐다. 이에 따라 이 Task의 실질 범위는 (1) 출처 페이지 번호(`+6` 오프셋)가 실제로 정확한지 62건 전수 데이터 무결성 검증 (2) 원문 열람 방법 안내와 재배포 금지 고지로 조정됐다. 실제 딥링크 앵커나 PDF 서빙 로직은 구현하지 않는다.

## 관련 파일

**신규 생성**

- `src/lib/content/page-offset.ts` — `PDF_PAGE_OFFSET = 6`, `verifyPageOffset()`(숫자 배열 추출 기반, 단일 페이지·범위 페이지 양쪽 대응)

**수정**

- `src/lib/content/get-audit-cases.ts` — `assertPageOffsetIntegrity()` 추가, 기본 62건 데이터셋에서 오프셋 불일치 시 빌드 중단
- `src/components/audit/case-detail.tsx` — 근거 문장 섹션 아래에 열람 안내·재배포 금지 고지 추가
- `src/components/layout/footer.tsx` — 전역 재배포 금지 고지 추가

## 현재 상태 (착수 전 확인 사항)

- **TBD-4 사용자 결정**: PDF는 `public/`에 복사하지 않는다. 구체적 사내 경로는 창작하지 않고 범용 문구("사내 자료실 또는 담당자를 통해 확인")만 사용한다.
- Read 도구로 원문 PDF(`data/audit-cases/raw/`)를 직접 렌더링해 `+6` 오프셋 규칙을 실측 검증했다: PDF쪽 8~10이 FSS/2106-01(frontmatter 출처: 인쇄쪽 2~4)과 정확히 일치했고, PDF쪽 150~151이 마지막(62번째) 사례 FSS/2405-14(taxonomy.md 출처: 인쇄쪽 145)와 정확히 일치했다.
- `source.printPage`/`pdfPage`가 항상 "N~M" 범위 형식은 아니고 단일 숫자("145")인 사례도 있음을 taxonomy.md로 확인했다 — `verifyPageOffset()` 설계에 반영.

## 수락 기준

- [x] `page-offset.ts`가 단일 페이지·범위 페이지 양쪽을 동일 로직으로 정확히 검증
- [x] 62건 전체가 오프셋 무결성 검증을 통과(불일치 시 빌드 중단)
- [x] 사례 상세에 원문 열람 안내(사내 자료실/담당자 확인)와 재배포 금지 고지 노출
- [x] 푸터에 전역 재배포 금지 고지 노출(모든 페이지 공통)
- [x] `npm run check-all` 통과
- [x] `npm run build` 성공(오프셋 무결성 assert 포함)

## 구현 단계

1. [x] `page-offset.ts` 구현 — `extractPageNumbers()`(정규식으로 숫자만 추출) + `verifyPageOffset()`
2. [x] `get-audit-cases.ts`에 `assertPageOffsetIntegrity()` 연결 — 실행 검증: 62건 전체 통과(threw:false), 정상/비정상 5개 케이스(정상 단일·정상 범위·깨진 단일·깨진 범위·개수 불일치) 전부 기대값과 정확히 일치
3. [x] `case-detail.tsx`·`footer.tsx`에 안내·고지 문구 추가 — 구체적 사내 경로 창작 안 함
4. [x] `npm run build` 성공 확인(1차 시도에서 Turbopack 빌드 워커가 세그멘테이션 폴트로 크래시했으나 재시도로 정상 완료 — 아래 "알려진 이슈" 참고)
5. [x] Playwright MCP + curl로 사례 상세 3건(FSS/2106-01, FSS/2206-01, FSS/2405-14) + 푸터(홈/사례 상세 양쪽) 안내 문구 노출 확인
6. [x] `tasks/008-pdf-source-viewing.md` 작성

## 테스트 체크리스트 (Playwright MCP)

- [x] `npm run build` 성공 — 오프셋 무결성 하드 assert가 실제로 62건 전체를 통과함(에러 로그 없음)
- [x] `verifyPageOffset()` 경계값 검증(임시 API 라우트로 실제 실행): 단일 페이지 정상(145→151), 범위 정상(2~4→8~10), 단일 페이지 오류, 범위 오류, 페이지 개수 불일치 — 5가지 전부 기대한 `valid`/`reason` 정확히 반환
- [x] 프로덕션 서버에서 사례 상세 3건(첫 사례 FSS/2106-01, 중간 사례 FSS/2206-01, 마지막 사례 FSS/2405-14) 전부 "사내 열람 전용" 문구 노출 확인(curl)
- [x] 홈과 사례 상세 페이지 양쪽에서 푸터의 재배포 금지 고지 노출 확인(전역 레이아웃이므로 모든 페이지에서 동일하게 노출됨을 2개 라우트로 샘플 확인)
- [x] Playwright 브라우저 렌더링으로 사례 상세 페이지의 안내 문구 두 줄(재배포 금지 + 사내 자료실 확인 안내)이 실제 DOM에 존재함을 최종 확인

## 알려진 이슈 (일회성, 재현 안 됨)

`npm run build` 1차 시도에서 Turbopack 빌드 워커가 `Next.js build worker exited with code: 3221225477 and signal: null`(Windows ACCESS_VIOLATION, 0xC0000005)로 크래시했다. 동일 명령을 바로 재시도하자 정상적으로 성공했고, 이후 서버 기동·Playwright 검증까지 전부 문제없이 진행됐다. 코드 변경과 무관한 일시적 빌드 워커 크래시로 판단되며(재현 시도 없이 재시도만으로 해결됨), 별도 조치 없이 기록만 남긴다. 향후 유사 크래시가 반복되면 `.next` 캐시 삭제 후 재시도를 우선 시도할 것.

## 변경 사항 요약

`page-offset.ts`(오프셋 무결성 검증 유틸)를 신설해 `get-audit-cases.ts`의 기존 하드 assert 체인에 연결했다 — 62건 전체의 출처 페이지 번호가 실제로 `+6` 규칙을 만족하는지 매 빌드마다 자동 검증된다. ROADMAP 원안의 딥링크 기능은 사용자 결정(TBD-4: PDF 미배포)에 따라 범위에서 제외했고, 대신 사례 상세와 푸터에 원문 열람 안내·재배포 금지 고지를 추가했다.

착수 전 Read 도구로 원문 PDF를 직접 렌더링해 오프셋 규칙과 마지막 사례 위치를 실측 검증했고, 구현 후에는 임시 API 라우트로 검증 함수를 실제 62건 데이터에 대해 실행하고 프로덕션 서버+Playwright MCP로 안내 문구 노출을 확인했다. 빌드 중 발생한 일회성 세그멘테이션 폴트는 재시도로 해결됐으며 코드 문제가 아님을 확인했다.

다음은 Task 009(검수 상태 관리 및 데이터 품질 표시)다.
