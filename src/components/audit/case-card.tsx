import { FindingTypeBadge } from '@/components/audit/finding-type-badge'
import { ReviewStatusBadge } from '@/components/audit/review-status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AuditCase } from '@/types/audit-case'

interface CaseCardProps {
  auditCase: AuditCase
  className?: string
}

export function CaseCard({ auditCase, className }: CaseCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <FindingTypeBadge findingType={auditCase.findingType} />
          <ReviewStatusBadge reviewStatus={auditCase.reviewStatus} />
        </div>
        <CardTitle>{auditCase.caseName}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-2 text-sm">
          {auditCase.sections.요약}
        </p>
      </CardContent>
    </Card>
  )
}
