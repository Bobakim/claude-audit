import Link from 'next/link'

import { FindingTypeBadge } from '@/components/audit/finding-type-badge'
import { Container } from '@/components/layout/container'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { getAuditCases } from '@/lib/content/get-audit-cases'
import { getVerificationReport } from '@/lib/content/verification-report'
import type { FindingType } from '@/types/audit-case'

// 표시 순서(고정). 건수는 getAuditCases()에서 실시간 집계한다.
const FINDING_TYPE_ORDER: FindingType[] = [
  '자산평가',
  '수익인식',
  '부정관련 자산 허위계상',
  '부채인식',
  '공시누락',
  '연결범위·연결처리 오류',
]

function countByFindingType(): Record<FindingType, number> {
  const counts: Record<FindingType, number> = {
    자산평가: 0,
    수익인식: 0,
    '부정관련 자산 허위계상': 0,
    부채인식: 0,
    공시누락: 0,
    '연결범위·연결처리 오류': 0,
  }

  for (const auditCase of getAuditCases()) {
    counts[auditCase.findingType] += 1
    auditCase.additionalFindingTypes?.forEach(type => {
      counts[type] += 1
    })
  }

  return counts
}

const TOTAL_CASE_COUNT = 62

export default function TaxonomyPage() {
  const counts = countByFindingType()
  const verifiedCount = getVerificationReport().size
  const verifiedRatio = Math.round((verifiedCount / TOTAL_CASE_COUNT) * 100)

  return (
    <Container>
      <div className="py-16">
        <h1 className="text-3xl font-bold tracking-tight">지적유형 분류체계</h1>
        <p className="text-muted-foreground mt-2">
          감리지적사례 62건을 지적유형 6종으로 분류한 현황입니다.
        </p>

        <div className="mt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">원문 대조 검증 진행률</span>
            <span className="text-muted-foreground">
              {verifiedCount}/{TOTAL_CASE_COUNT}건 ({verifiedRatio}%)
            </span>
          </div>
          <Progress value={verifiedRatio} className="mt-2" />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FINDING_TYPE_ORDER.map(findingType => (
            <Link
              key={findingType}
              href={`/cases?findingType=${encodeURIComponent(findingType)}`}
            >
              <Card className="hover:bg-accent h-full transition-colors">
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle>
                    <FindingTypeBadge findingType={findingType} />
                  </CardTitle>
                  <span className="text-muted-foreground text-sm">
                    {counts[findingType]}건
                  </span>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </Container>
  )
}
