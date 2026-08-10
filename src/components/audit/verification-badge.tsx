import type { VariantProps } from 'class-variance-authority'

import { Badge, badgeVariants } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { VerificationStatus } from '@/types/audit-case'

// finding-type-badge.tsx와 동일하게 새 CSS 변수를 추가하지 않고 기존
// chart-2/chart-4/destructive 토큰만으로 4종을 구분한다.
const VERIFICATION_VARIANT: Record<
  VerificationStatus,
  {
    variant: NonNullable<VariantProps<typeof badgeVariants>['variant']>
    className?: string
  }
> = {
  검증완료: { variant: 'outline', className: 'border-chart-2 text-chart-2' },
  미검증: { variant: 'secondary' },
  부분일치: { variant: 'outline', className: 'border-chart-4 text-chart-4' },
  불일치: { variant: 'destructive' },
}

interface VerificationBadgeProps {
  status: VerificationStatus
  className?: string
}

export function VerificationBadge({
  status,
  className,
}: VerificationBadgeProps) {
  const config = VERIFICATION_VARIANT[status]
  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {status}
    </Badge>
  )
}
