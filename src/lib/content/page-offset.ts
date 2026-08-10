/**
 * 카드 frontmatter의 출처(인쇄쪽/PDF쪽) 표기 사이의 오프셋 규칙.
 * 원문 PDF(data/audit-cases/raw/)는 표지·목차 등으로 인쇄쪽보다 6쪽 앞서 시작한다.
 */
export const PDF_PAGE_OFFSET = 6

export interface PageOffsetResult {
  valid: boolean
  reason?: string
}

// printPage/pdfPage는 항상 "N~M" 범위가 아니라 단일 숫자("145")로만 표기된
// 사례도 있다(실사로 확인됨) — "~" 유무와 무관하게 숫자만 추출해 처리한다.
function extractPageNumbers(raw: string): number[] {
  return (raw.match(/\d+/g) ?? []).map(Number)
}

/**
 * 인쇄쪽/PDF쪽 raw 문자열 쌍이 PDF_PAGE_OFFSET 규칙을 만족하는지 검증한다.
 * 원문 PDF를 직접 렌더링해 대표 사례(첫 사례·마지막 사례)에서 이 규칙을 실측 확인했다.
 */
export function verifyPageOffset(
  printPage: string,
  pdfPage: string
): PageOffsetResult {
  const printNums = extractPageNumbers(printPage)
  const pdfNums = extractPageNumbers(pdfPage)

  if (printNums.length === 0 || printNums.length !== pdfNums.length) {
    return {
      valid: false,
      reason: `페이지 개수 불일치(인쇄쪽 ${printNums.length}개, PDF쪽 ${pdfNums.length}개) — 원문: 인쇄쪽 ${printPage}, PDF쪽 ${pdfPage}`,
    }
  }

  for (let i = 0; i < printNums.length; i++) {
    if (pdfNums[i] - printNums[i] !== PDF_PAGE_OFFSET) {
      return {
        valid: false,
        reason: `${printNums[i]}쪽 기준 PDF쪽이 ${printNums[i] + PDF_PAGE_OFFSET}이어야 하는데 ${pdfNums[i]}`,
      }
    }
  }

  return { valid: true }
}
