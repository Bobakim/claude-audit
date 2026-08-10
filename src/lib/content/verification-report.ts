import { readFileSync } from 'node:fs'
import path from 'node:path'
import { cache } from 'react'

import type { VerificationStatus } from '@/types/audit-case'

const DEFAULT_REPORT_PATH = path.join(
  process.cwd(),
  'data/audit-cases/knowledge/verification-report.md'
)

const ROW_PATTERN = /^\|\s*\d+\s*\|.*\|$/gm

export interface VerificationEntry {
  status: VerificationStatus
  note?: string
}

// '일치'가 '부분일치'·'불일치'의 부분 문자열이므로 includes()로는 구분할 수
// 없다 — 굵게(**) 표기를 제거한 뒤 공백 기준 첫 토큰만 엄격 비교한다.
function parseVerdict(raw: string): '일치' | '부분일치' | '불일치' | null {
  const token = raw.replace(/\*\*/g, '').trim().split(/\s/)[0]
  if (token === '불일치') return '불일치'
  if (token === '부분일치') return '부분일치'
  if (token === '일치') return '일치'
  return null
}

/**
 * verification-report.md의 판정 표를 파싱해 caseId → 검증 상태 Map을 만든다.
 * 리포트에 등재된 사례(현재 17건)만 담기며, 나머지는 getVerificationStatus()가
 * '미검증'으로 보완한다. reportPath 인자는 테스트 전용이다.
 */
export const getVerificationReport = cache(
  (
    reportPath: string = DEFAULT_REPORT_PATH
  ): Map<string, VerificationEntry> => {
    const raw = readFileSync(reportPath, 'utf-8')
    const rows = raw.match(ROW_PATTERN) ?? []
    const map = new Map<string, VerificationEntry>()

    for (const row of rows) {
      const cols = row.split('|').map(col => col.trim())
      const caseId = cols[2]
      const verdictRaw = cols[5]
      const note = cols[6]
      if (!caseId || !/^FSS\//.test(caseId)) continue

      const verdict = parseVerdict(verdictRaw ?? '')
      const status: VerificationStatus =
        verdict === '일치'
          ? '검증완료'
          : verdict === '부분일치'
            ? '부분일치'
            : verdict === '불일치'
              ? '불일치'
              : '미검증'

      map.set(caseId, { status, note: note || undefined })
    }

    return map
  }
)

export function getVerificationStatus(caseId: string): VerificationEntry {
  return getVerificationReport().get(caseId) ?? { status: '미검증' }
}
