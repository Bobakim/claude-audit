import { dummyCases } from '@/lib/dummy/cases'
import type { AccountItem } from '@/types/audit-case'

/**
 * 더미 계정과목 목록 — dummyCases의 relatedAccounts(자유 텍스트)에서 고유 표기를 그대로 뽑는다.
 * 정규화 사전(원문 표기 → 정규 계정과목)은 docs/ROADMAP.md Task 006에서 구축하며,
 * 이 Phase에서는 표기가 곧 id(슬러그)다.
 */
export const dummyAccounts: AccountItem[] = Array.from(
  new Set(dummyCases.flatMap(auditCase => auditCase.relatedAccounts))
).map(label => ({ id: label, label }))

export function findCasesByAccountLabel(label: string) {
  return dummyCases.filter(auditCase =>
    auditCase.relatedAccounts.includes(label)
  )
}
