import { CircleAlert } from 'lucide-react'

import { AccountGrid } from '@/components/audit/account-grid'
import { EvidenceQuote } from '@/components/audit/evidence-quote'
import { FindingTypeBadge } from '@/components/audit/finding-type-badge'
import { ReviewStatusBadge } from '@/components/audit/review-status-badge'
import { VerificationBadge } from '@/components/audit/verification-badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { getVerificationStatus } from '@/lib/content/verification-report'
import { cn } from '@/lib/utils'
import { isUnknown, type AuditCase } from '@/types/audit-case'

interface CaseDetailProps {
  auditCase: AuditCase
  className?: string
}

// 사례 상세는 요약 → 지적유형·조치수준 → 관련 계정과목 → 근거 문장(+원문 출처) → 나머지 섹션 →
// 확인 필요 순서를 강제한다(docs/ROADMAP.md Task 004). 순서를 바꾸지 않는다.
export function CaseDetail({ auditCase, className }: CaseDetailProps) {
  const relatedAccounts = auditCase.relatedAccounts.map(label => ({
    id: label,
    label,
  }))
  const verification = getVerificationStatus(auditCase.caseId)

  return (
    <article className={cn('flex flex-col gap-6', className)}>
      {verification.status === '미검증' ? (
        <Alert>
          <CircleAlert />
          <AlertTitle>미검증 초안</AlertTitle>
          <AlertDescription>
            원문 대조 검증이 완료되지 않은 초안입니다. 실무 판단의 근거로
            사용하기 전 원문을 확인하세요.
          </AlertDescription>
        </Alert>
      ) : null}

      {(verification.status === '불일치' ||
        verification.status === '부분일치') &&
      verification.note ? (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>{verification.status}</AlertTitle>
          <AlertDescription>{verification.note}</AlertDescription>
        </Alert>
      ) : null}

      <section>
        <h2 className="text-lg font-semibold">요약</h2>
        <p className="text-foreground mt-2">{auditCase.sections.요약}</p>
      </section>

      <section className="flex flex-wrap items-center gap-3">
        <FindingTypeBadge findingType={auditCase.findingType} />
        <ReviewStatusBadge reviewStatus={auditCase.reviewStatus} />
        <VerificationBadge status={verification.status} />
        <span className="text-muted-foreground text-sm">조치수준:</span>
        {isUnknown(auditCase.actionLevel) ? (
          <Badge
            variant="outline"
            title={
              auditCase.actionLevel.reason ?? '원문에 조치수준 정보가 없습니다.'
            }
          >
            확인 필요
          </Badge>
        ) : (
          <span className="text-foreground text-sm">
            {auditCase.actionLevel.value}
          </span>
        )}
      </section>

      <Separator />

      <section>
        <h2 className="text-lg font-semibold">관련 계정과목</h2>
        <AccountGrid accounts={relatedAccounts} className="mt-2" />
      </section>

      <Separator />

      <section>
        <h2 className="text-lg font-semibold">근거 문장</h2>
        <EvidenceQuote
          quote={auditCase.sections.근거문장}
          source={auditCase.source}
          className="mt-2"
        />
        <p className="text-muted-foreground mt-2 text-xs">
          원문 PDF는 금융감독원 저작물로 사내 열람 전용이며 외부 재배포가
          금지됩니다. 원문은 사내 자료실 또는 담당자를 통해 확인하시고, 위
          인쇄쪽·PDF쪽 번호를 참고하세요.
        </p>
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <div>
          <h3 className="font-semibold">사실관계 요약</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            {auditCase.sections.사실관계요약}
          </p>
        </div>
        <div>
          <h3 className="font-semibold">판단 근거</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            {auditCase.sections.판단근거}
          </p>
        </div>
        <div>
          <h3 className="font-semibold">감사절차 미흡사항</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            {auditCase.sections.감사절차미흡사항}
          </p>
        </div>
        <div>
          <h3 className="font-semibold">시사점</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            {auditCase.sections.시사점}
          </p>
        </div>
      </section>

      {auditCase.sections.확인필요 ? (
        <Alert>
          <CircleAlert />
          <AlertTitle>확인 필요</AlertTitle>
          <AlertDescription>{auditCase.sections.확인필요}</AlertDescription>
        </Alert>
      ) : null}
    </article>
  )
}
