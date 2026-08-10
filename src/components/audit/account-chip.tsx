import { Badge } from '@/components/ui/badge'
import type { AccountItem } from '@/types/audit-case'

interface AccountChipProps {
  account: AccountItem
  className?: string
}

// 계정과목 자유 텍스트 정규화(원문 표기 → 정규 계정과목)는 이 컴포넌트의 책임이 아니다.
// 받은 label/tags를 그대로 표시만 한다 — 정규화 사전은 docs/ROADMAP.md Task 006에서 구축한다.
export function AccountChip({ account, className }: AccountChipProps) {
  return (
    <Badge variant="outline" className={className}>
      {account.label}
      {account.tags?.length ? ` (${account.tags.join('/')})` : null}
    </Badge>
  )
}
