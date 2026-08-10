import { CaseFilterBar } from '@/components/audit/case-filter-bar'
import { CaseSearchableList } from '@/components/audit/case-searchable-list'
import { Container } from '@/components/layout/container'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  applyCaseFilters,
  parseCaseFilterParams,
} from '@/lib/content/case-filters'
import { getAuditCases } from '@/lib/content/get-audit-cases'
import { env } from '@/lib/env'

interface CasesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CasesPage({ searchParams }: CasesPageProps) {
  const resolvedSearchParams = await searchParams
  const filterParams = parseCaseFilterParams(resolvedSearchParams)
  const filteredCases = applyCaseFilters(
    getAuditCases(),
    filterParams,
    env.NEXT_PUBLIC_ENFORCE_PUBLISH_GATE
  )

  const gateBlocksAll =
    env.NEXT_PUBLIC_ENFORCE_PUBLISH_GATE && filteredCases.length === 0

  return (
    <Container>
      <div className="py-16">
        <h1 className="text-3xl font-bold tracking-tight">감리지적사례</h1>
        <p className="text-muted-foreground mt-2">
          전체 감리지적사례 목록입니다.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          <CaseFilterBar />

          {gateBlocksAll ? (
            <Alert>
              <AlertTitle>공개된 사례가 없습니다</AlertTitle>
              <AlertDescription>
                현재 공개 게이트가 활성화되어 있고 62건 전량이 검수상태 초안이라
                노출할 사례가 없습니다. 내부 검토 목적이라면 게이트를 끄면
                전건을 볼 수 있습니다.
              </AlertDescription>
            </Alert>
          ) : (
            <CaseSearchableList cases={filteredCases} />
          )}
        </div>
      </div>
    </Container>
  )
}
