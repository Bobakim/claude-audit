# Task 009: 검수 상태 관리 및 데이터 품질 표시

> `docs/ROADMAP.md` Phase 4. Task 008(원문 PDF 출처 열람)이 완료된 상태에서 착수한다.

## 개요 (고수준 명세서)

`data/audit-cases/knowledge/verification-report.md`는 현재 62건 중 17건(제1장 배치)에 대해서만 원문 대조 검증 판정(일치/부분일치/불일치)을 담고 있다. 이 판정을 사례 상세 UI에 노출해, 아직 원문 대조가 끝나지 않은 45건을 실무자가 검증완료 사례와 혼동하지 않도록 한다. `reviewStatus`(초안/검수중/공개, Task 003~004에서 이미 구현됨)와는 별개 축으로, "원문과 실제로 대조됐는가"를 나타내는 `VerificationStatus`를 신설했다.

## 관련 파일

**신규 생성**

- `src/lib/content/verification-report.ts` — `getVerificationReport()`(React `cache()`, `Map<caseId, {status, note}>`), `getVerificationStatus(caseId)`
- `src/components/audit/verification-badge.tsx` — 검증완료/미검증/불일치/부분일치 4종 배지(`FindingTypeBadge`/`ReviewStatusBadge`와 동일 컨벤션)

**수정**

- `src/types/audit-case.ts` — `VerificationStatus` 타입 추가
- `src/components/audit/case-detail.tsx` — 최상단에 미검증 경고 배너 / 불일치·부분일치 강조 Alert(리포트 비고 노출), 기존 배지 줄에 `VerificationBadge` 추가
- `src/app/taxonomy/page.tsx` — 원문 대조 검증 진행률(`Progress` 컴포넌트, 17/62건·27%)

## 현재 상태 (착수 전 확인 사항)

- `case-detail.tsx`의 확인필요(`sections.확인필요`) Alert는 Task 003/004에서 이미 구현되어 있어 이번 Task에서 재작업하지 않는다. 신규 검증 배너/Alert는 기존 확인필요 Alert보다 **위쪽**(article 최상단)에 배치해 두 종류의 경고가 시각적으로 겹치지 않게 순서를 고정했다.
- `verification-report.md` 마크다운 표 파싱 함정: `'일치'`가 `'부분일치'`·`'불일치'`의 부분 문자열이라 `includes()`를 쓰면 오분류된다 — 굵게(`**`) 표기 제거 후 공백 기준 첫 토큰을 엄격 비교(`parseVerdict`)해 해결했다.

## 수락 기준

- [x] `getVerificationReport()`가 실제 17건 판정(검증완료 12·부분일치 3·불일치 2)을 정확히 파싱하고 나머지 45건은 조회 시 '미검증'으로 보완
- [x] `VerificationBadge`가 4종을 기존 chart-2/chart-4/destructive 토큰만으로 구분(신규 CSS 변수 없음)
- [x] 사례 상세: 미검증 배너, 불일치/부분일치 강조 Alert(비고 내용 포함), 기존 확인필요 Alert와 비충돌 배치
- [x] `/taxonomy`에 검증 진행률(17/62, 27%) 노출
- [x] `npm run check-all` 통과
- [x] `npm run build` 성공

## 구현 단계

1. [x] `VerificationStatus` 타입 추가 + `verification-report.ts` 파서 구현 — 임시 API 라우트로 62건 전수 실행, 17건 판정·note 내용까지 원문과 정확히 일치 확인 후 라우트 삭제
2. [x] `verification-badge.tsx` 구현 — 기존 배지 컴포넌트 컨벤션(`VariantProps<typeof badgeVariants>`) 그대로 재사용
3. [x] `case-detail.tsx`에 배지·배너·Alert 배치, `taxonomy/page.tsx`에 `Progress` 진행률 추가
4. [x] `npm run build` 성공 확인
5. [x] Playwright MCP로 검증완료(FSS/2106-02)·미검증(FSS/2405-14)·불일치(FSS/2106-01)·부분일치(FSS/2106-04) 4종 실사례 배지·배너 노출 차이 확인, `/taxonomy` 진행률 확인
6. [x] `tasks/009-verification-status.md` 작성

## 테스트 체크리스트 (Playwright MCP)

- [x] `npm run build` 성공 — 62건 데이터로 정상 빌드
- [x] FSS/2106-02(검증완료): "검증완료" 배지 노출, 검증 관련 경고 배너 없음(확인필요 Alert만 기존대로 노출) — 정상 사례와 미검증/불일치 사례가 시각적으로 구분됨을 확인
- [x] FSS/2405-14(미검증, 62번째 마지막 사례): "미검증" 배지 + "원문 대조 검증이 완료되지 않은 초안입니다..." 배너 노출, 기존 확인필요 Alert와 순서상 겹치지 않고 함께 노출
- [x] FSS/2106-01(불일치): "불일치" 배지 + 강조 Alert에 리포트 비고("시사점 섹션 없음... PDF 10(인쇄 4)에 `5 시사점` 섹션이 실재") 그대로 노출
- [x] FSS/2106-04(부분일치): "부분일치" 배지 + 강조 Alert에 비고("사례명 필드: 원문 헤더는...") 그대로 노출
- [x] `/taxonomy`에서 "원문 대조 검증 진행률 17/62건 (27%)" 텍스트 확인

## 변경 사항 요약

`verification-report.md`의 판정 표를 자체 정규식 파서로 읽어 `VerificationStatus`(검증완료/미검증/불일치/부분일치)로 정규화하고, 사례 상세와 `/taxonomy`에 노출했다. `'일치'` vs `'부분일치'`/`'불일치'` 부분 문자열 함정은 엄격 토큰 비교로 회피했다. 기존 `reviewStatus`(초안/검수중/공개)·확인필요 Alert와는 독립된 축으로 설계해 기존 UI를 재작업하지 않았다. 임시 API 라우트로 62건 실제 데이터에 대해 파서를 실행해 17/45건 분포와 note 내용을 원문과 대조 검증했고, 구현 후에는 프로덕션 서버+Playwright MCP로 4개 판정 유형 전부를 실사례로 렌더링 확인했다.

다음은 Task 010(성능 최적화 및 배포 파이프라인)이다.
