import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CaseDetail } from '@/components/audit/case-detail'
import { Container } from '@/components/layout/container'
import { getAuditCases } from '@/lib/content/get-audit-cases'

interface CaseDetailPageProps {
  params: Promise<{ caseId: string }>
}

// Next.js는 동적 세그먼트 값에 포함된 '/'(%2F)를 요청 시점에 이미 단일
// 디코딩해 params로 넘긴다(예: 요청 경로의 'FSS%2F2106-01' → params.caseId
// 'FSS/2106-01'). generateStaticParams에 encodeURIComponent된 값을 넘기면
// Next.js가 이를 다시 인코딩해(FSS%252F2106-01) 실제 요청과 매칭되지 않는
// 이중 인코딩 버그가 발생하므로, 원본(디코딩된) caseId를 그대로 반환한다.
export async function generateStaticParams() {
  return getAuditCases().map(auditCase => ({
    caseId: auditCase.caseId,
  }))
}

// generateStaticParams가 반환한 62건 외 경로는 빌드타임에 존재하지 않는 것으로
// 확정해, 목록 밖 caseId 요청 시 실제 404를 반환하게 한다(스트리밍 SSR 환경에서
// notFound()가 200을 반환하던 문제의 근본 해결책).
export const dynamicParams = false

export async function generateMetadata({
  params,
}: CaseDetailPageProps): Promise<Metadata> {
  const { caseId } = await params
  const decodedCaseId = decodeURIComponent(caseId)
  const auditCase = getAuditCases().find(c => c.caseId === decodedCaseId)

  return {
    title: auditCase?.caseName ?? '사례를 찾을 수 없음',
    description: auditCase?.sections.요약,
    robots: { index: false, follow: false },
  }
}

export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { caseId } = await params
  const decodedCaseId = decodeURIComponent(caseId)
  const auditCase = getAuditCases().find(c => c.caseId === decodedCaseId)

  if (!auditCase) {
    notFound()
  }

  return (
    <Container>
      <div className="py-16">
        <h1 className="text-3xl font-bold tracking-tight">
          {auditCase.caseName}
        </h1>
        <p className="text-muted-foreground mt-2">
          {auditCase.findingYear}년 · {auditCase.supervisor}
        </p>

        <CaseDetail auditCase={auditCase} className="mt-8" />
      </div>
    </Container>
  )
}
