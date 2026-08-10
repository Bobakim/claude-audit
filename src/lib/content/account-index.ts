import { cache } from 'react'

import { ACCOUNT_DICTIONARY } from '@/lib/content/account-dictionary'
import { getAuditCases } from '@/lib/content/get-audit-cases'
import type { AccountItem, AuditCase } from '@/types/audit-case'

export interface NormalizeAccountsResult {
  items: AccountItem[]
  unclassified: string[]
}

// 사전에 없는 표기를 만나도 throw하지 않고 격리만 한다(서비스 중단이 아니라
// docs/ROADMAP.md가 요구하는 '미분류' 처리). 빌드 전체를 멈추는 하드 assert는
// getAccountIndex()에서 기본 62건 데이터셋에 한해서만 별도로 수행한다.
export function normalizeAccounts(
  rawLabels: string[],
  caseId: string
): NormalizeAccountsResult {
  const items: AccountItem[] = []
  const unclassified: string[] = []

  for (const raw of rawLabels) {
    const mapped = ACCOUNT_DICTIONARY[raw]
    if (mapped) {
      items.push(...mapped)
    } else {
      unclassified.push(raw)
      console.warn(`${caseId}: 미분류 계정과목 표기 '${raw}'`)
    }
  }

  return { items, unclassified }
}

export interface AccountIndexEntry {
  account: AccountItem
  cases: AuditCase[]
}

export interface AccountIndex {
  forward: Map<string, AccountItem[]>
  reverse: AccountIndexEntry[]
  coverage: { totalRaw: number; unclassified: number }
}

const DEFAULT_CASE_COUNT = 62

/**
 * 사례→계정과목 정인덱스와 계정과목→사례 역인덱스를 동시에 만든다.
 * 기본 62건 데이터셋(cases 인자를 생략한 경우)에서 미분류 표기가 하나라도
 * 나오면 빌드를 에러로 중단해, 향후 원본 데이터가 늘어날 때 사람이
 * account-dictionary.ts를 직접 갱신하도록 강제한다(자동 병합 금지 원칙).
 */
export const getAccountIndex = cache(
  (cases: AuditCase[] = getAuditCases()): AccountIndex => {
    const forward = new Map<string, AccountItem[]>()
    const reverseMap = new Map<string, AccountIndexEntry>()
    let totalRaw = 0
    let totalUnclassified = 0

    for (const auditCase of cases) {
      const { items, unclassified } = normalizeAccounts(
        auditCase.relatedAccounts,
        auditCase.caseId
      )
      totalRaw += auditCase.relatedAccounts.length
      totalUnclassified += unclassified.length
      forward.set(auditCase.caseId, items)

      for (const item of items) {
        const entry = reverseMap.get(item.id) ?? { account: item, cases: [] }
        entry.cases.push(auditCase)
        reverseMap.set(item.id, entry)
      }
    }

    if (cases.length === DEFAULT_CASE_COUNT && totalUnclassified > 0) {
      throw new Error(
        `계정과목 미분류 ${totalUnclassified}건 발생 — src/lib/content/account-dictionary.ts 갱신이 필요합니다`
      )
    }

    return {
      forward,
      reverse: Array.from(reverseMap.values()),
      coverage: { totalRaw, unclassified: totalUnclassified },
    }
  }
)
