import { AccountChip } from '@/components/audit/account-chip'
import { cn } from '@/lib/utils'
import type { AccountItem } from '@/types/audit-case'

interface AccountGridProps {
  accounts: AccountItem[]
  className?: string
}

export function AccountGrid({ accounts, className }: AccountGridProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {accounts.map(account => (
        <AccountChip key={account.id} account={account} />
      ))}
    </div>
  )
}
