import type { VariantProps } from 'class-variance-authority'

import { Badge, badgeVariants } from '@/components/ui/badge'
import type { ReviewStatus } from '@/types/audit-case'

const REVIEW_STATUS_VARIANT: Record<
  ReviewStatus,
  NonNullable<VariantProps<typeof badgeVariants>['variant']>
> = {
  초안: 'outline',
  검수중: 'secondary',
  공개: 'default',
}

interface ReviewStatusBadgeProps {
  reviewStatus: ReviewStatus
  className?: string
}

export function ReviewStatusBadge({
  reviewStatus,
  className,
}: ReviewStatusBadgeProps) {
  return (
    <Badge variant={REVIEW_STATUS_VARIANT[reviewStatus]} className={className}>
      {reviewStatus}
    </Badge>
  )
}
