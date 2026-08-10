export type FindingType =
  | '자산평가'
  | '수익인식'
  | '부정관련 자산 허위계상'
  | '부채인식'
  | '공시누락'
  | '연결범위·연결처리 오류'

export type ReviewStatus = '초안' | '검수중' | '공개'

// verification-report.md의 판정("일치"/"부분일치"/"불일치")을 UI 배지용으로
// 재명명한 것. 리포트 표에 아직 등재되지 않은 사례는 전부 '미검증'이다.
export type VerificationStatus = '검증완료' | '미검증' | '불일치' | '부분일치'

// 원문 PDF에 필드 자체가 없어 [확인필요]로만 남는 값(조치수준 등)을 빈 문자열/null과
// 구분해서 표현하기 위한 판별 유니온.
export type MaybeUnknown<T> =
  | { status: 'known'; value: T }
  | { status: 'unknown'; reason?: string }

export function isUnknown<T>(
  value: MaybeUnknown<T>
): value is { status: 'unknown'; reason?: string } {
  return value.status === 'unknown'
}

export interface AccountItem {
  id: string
  label: string
  tags?: string[]
}

export interface CaseSections {
  요약: string
  사실관계요약: string
  근거문장: string
  판단근거: string
  감사절차미흡사항: string
  시사점: string
  확인필요?: string
}

export interface AuditCase {
  caseId: string
  caseName: string
  findingType: FindingType
  // FSS/2311-17처럼 원문 지적유형이 두 유형의 결합으로 taxonomy.md에서 양쪽에
  // 중복 집계되는 극소수 복합 사례를 위한 보조 필드. findingType(주 유형)은
  // 그대로 단일값을 유지하고, 배지·필터 등 기존 UI는 이 필드를 무시해도 무방하다.
  additionalFindingTypes?: FindingType[]
  actionLevel: MaybeUnknown<string>
  findingYear: number
  supervisor: string
  relatedAccounts: string[]
  reviewStatus: ReviewStatus
  source: {
    printPage: string
    pdfPage: string
  }
  sections: CaseSections
}
