import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'

import { CaseCard } from '@/components/audit/case-card'
import { Container } from '@/components/layout/container'
import { getAccountIndex } from '@/lib/content/account-index'

interface AccountDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAccountIndex().reverse.map(entry => ({
    slug: encodeURIComponent(entry.account.id),
  }))
}

// cases/[caseId]/page.tsx와 동일한 이유로 목록 밖 slug는 진짜 404로 확정한다.
export const dynamicParams = false

export async function generateMetadata({
  params,
}: AccountDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const entry = getAccountIndex().reverse.find(
    r => r.account.id === decodedSlug
  )

  return {
    title: entry?.account.label ?? '계정과목을 찾을 수 없음',
    description: entry
      ? `${entry.account.label} 계정과목에 연결된 감리지적사례 목록`
      : undefined,
    robots: { index: false, follow: false },
  }
}

export default async function AccountDetailPage({
  params,
}: AccountDetailPageProps) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const { reverse } = getAccountIndex()
  const entry = reverse.find(r => r.account.id === decodedSlug)

  if (!entry) {
    notFound()
  }

  return (
    <Container>
      <div className="py-16">
        <h1 className="text-3xl font-bold tracking-tight">
          계정과목: {entry.account.label}
        </h1>
        <p className="text-muted-foreground mt-2">
          해당 계정과목에 연결된 감리지적사례 목록입니다.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entry.cases.map(auditCase => (
            <Link
              key={auditCase.caseId}
              href={`/cases/${encodeURIComponent(auditCase.caseId)}`}
            >
              <CaseCard
                auditCase={auditCase}
                className="hover:bg-accent transition-colors"
              />
            </Link>
          ))}
        </div>
      </div>
    </Container>
  )
}
