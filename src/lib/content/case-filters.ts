import type { AuditCase, FindingType, ReviewStatus } from '@/types/audit-case'

export interface CaseFilterParams {
  findingTypes: FindingType[]
  years: number[]
  reviewStatuses: ReviewStatus[]
}

type SearchParamValue = string | string[] | undefined

// searchParams 값은 문자열(예: /taxonomy가 만든 단일값 링크) 또는 배열(반복 키
// ?findingType=A&findingType=B)로 들어올 수 있어 양쪽을 방어한다. 각 값은 쉼표로
// 추가 구분해 ?findingType=자산평가,수익인식 같은 다중 선택도 하나의 파라미터로 표현한다.
function parseListParam(raw: SearchParamValue): string[] {
  if (!raw) return []
  const parts = Array.isArray(raw)
    ? raw.flatMap(value => value.split(','))
    : raw.split(',')
  return parts.map(part => part.trim()).filter(Boolean)
}

export function parseCaseFilterParams(
  searchParams: Record<string, SearchParamValue>
): CaseFilterParams {
  // 사전 정의된 유니온 타입으로 캐스팅만 하고 별도 검증은 하지 않는다 — 잘못된 값이
  // 들어와도 아래 applyCaseFilters의 includes() 비교가 그냥 매칭 실패로 처리하므로
  // 크래시 위험이 없다(최악의 경우 그 축의 필터 결과가 0건이 될 뿐).
  return {
    findingTypes: parseListParam(searchParams.findingType) as FindingType[],
    years: parseListParam(searchParams.year)
      .map(Number)
      .filter(year => !Number.isNaN(year)),
    reviewStatuses: parseListParam(searchParams.reviewStatus) as ReviewStatus[],
  }
}

/**
 * 지적유형·지적연도·검수상태 카테고리 필터를 AND로 결합해 적용한다.
 * 조치수준은 62건 전량 [확인필요]라 필터 축에 포함하지 않는다(docs/ROADMAP.md Task 007).
 * enforceGate가 true면 검수상태=공개인 사례만 먼저 남긴 뒤 나머지 필터를 적용한다.
 */
export function applyCaseFilters(
  cases: AuditCase[],
  params: CaseFilterParams,
  enforceGate: boolean
): AuditCase[] {
  let result = enforceGate
    ? cases.filter(auditCase => auditCase.reviewStatus === '공개')
    : cases

  if (params.findingTypes.length > 0) {
    // FSS/2311-17처럼 findingType(주 유형) 외에 additionalFindingTypes(보조 유형,
    // Task 006)를 갖는 복합 사례도 걸리도록 두 필드 모두 검사한다. 이 검사를
    // findingType만으로 하면 /taxonomy의 실집계(getAuditCases 기반 이중집계)와
    // 이 필터의 결과 건수가 어긋난다(실사로 확인된 버그: 공시누락 5건 중 1건 누락).
    result = result.filter(
      auditCase =>
        params.findingTypes.includes(auditCase.findingType) ||
        (auditCase.additionalFindingTypes?.some(type =>
          params.findingTypes.includes(type)
        ) ??
          false)
    )
  }
  if (params.years.length > 0) {
    result = result.filter(auditCase =>
      params.years.includes(auditCase.findingYear)
    )
  }
  if (params.reviewStatuses.length > 0) {
    result = result.filter(auditCase =>
      params.reviewStatuses.includes(auditCase.reviewStatus)
    )
  }

  return result
}
