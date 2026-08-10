import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { FindingType } from '@/types/audit-case'

// globals.css의 chart-1~5 5개 토큰만으로 6종을 표현해야 해서, 강조가 가장 필요한
// "부정관련 자산 허위계상"은 destructive 토큰에 배정하고 나머지 5종을 chart-1~5에 배정한다.
// 새 CSS 변수를 추가하지 않는다.
const FINDING_TYPE_DOT: Record<FindingType, string> = {
  자산평가: 'bg-chart-1',
  수익인식: 'bg-chart-2',
  부채인식: 'bg-chart-3',
  공시누락: 'bg-chart-4',
  '연결범위·연결처리 오류': 'bg-chart-5',
  '부정관련 자산 허위계상': 'bg-destructive',
}

interface FindingTypeBadgeProps {
  findingType: FindingType
  className?: string
}

export function FindingTypeBadge({
  findingType,
  className,
}: FindingTypeBadgeProps) {
  return (
    <Badge variant="outline" className={cn('gap-1.5', className)}>
      <span
        aria-hidden="true"
        className={cn('size-2 rounded-full', FINDING_TYPE_DOT[findingType])}
      />
      {findingType}
    </Badge>
  )
}
