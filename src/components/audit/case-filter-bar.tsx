'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { FindingTypeBadge } from '@/components/audit/finding-type-badge'
import { ReviewStatusBadge } from '@/components/audit/review-status-badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { parseCaseFilterParams } from '@/lib/content/case-filters'
import type { FindingType, ReviewStatus } from '@/types/audit-case'

const FINDING_TYPES: FindingType[] = [
  '자산평가',
  '수익인식',
  '부정관련 자산 허위계상',
  '부채인식',
  '공시누락',
  '연결범위·연결처리 오류',
]

const YEARS = [2020, 2021, 2022, 2023]

const REVIEW_STATUSES: ReviewStatus[] = ['초안', '검수중', '공개']

type FilterCategory = 'findingType' | 'year' | 'reviewStatus'

export function CaseFilterBar() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const current = parseCaseFilterParams(
    Object.fromEntries(searchParams.entries())
  )
  const selected: Record<FilterCategory, Set<string>> = {
    findingType: new Set(current.findingTypes),
    year: new Set(current.years.map(String)),
    reviewStatus: new Set(current.reviewStatuses),
  }

  function toggle(category: FilterCategory, value: string) {
    const next = new Set(selected[category])
    if (next.has(value)) {
      next.delete(value)
    } else {
      next.add(value)
    }

    const params = new URLSearchParams(searchParams.toString())
    if (next.size > 0) {
      params.set(category, [...next].join(','))
    } else {
      params.delete(category)
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function reset() {
    router.replace(pathname, { scroll: false })
  }

  const hasActiveFilters =
    selected.findingType.size > 0 ||
    selected.year.size > 0 ||
    selected.reviewStatus.size > 0

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold">지적유형</h2>
        <div className="mt-2 flex flex-wrap gap-4">
          {FINDING_TYPES.map(type => (
            <div key={type} className="flex items-center gap-2">
              <Checkbox
                id={`finding-type-${type}`}
                checked={selected.findingType.has(type)}
                onCheckedChange={() => toggle('findingType', type)}
              />
              <Label
                htmlFor={`finding-type-${type}`}
                className="cursor-pointer"
              >
                <FindingTypeBadge findingType={type} />
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold">지적연도</h2>
        <div className="mt-2 flex flex-wrap gap-4">
          {YEARS.map(year => (
            <div key={year} className="flex items-center gap-2">
              <Checkbox
                id={`year-${year}`}
                checked={selected.year.has(String(year))}
                onCheckedChange={() => toggle('year', String(year))}
              />
              <Label htmlFor={`year-${year}`} className="cursor-pointer">
                {year}년
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold">검수상태</h2>
        <div className="mt-2 flex flex-wrap gap-4">
          {REVIEW_STATUSES.map(status => (
            <div key={status} className="flex items-center gap-2">
              <Checkbox
                id={`review-status-${status}`}
                checked={selected.reviewStatus.has(status)}
                onCheckedChange={() => toggle('reviewStatus', status)}
              />
              <Label
                htmlFor={`review-status-${status}`}
                className="cursor-pointer"
              >
                <ReviewStatusBadge reviewStatus={status} />
              </Label>
            </div>
          ))}
        </div>
      </div>

      {hasActiveFilters ? (
        <Button variant="outline" size="sm" onClick={reset} className="w-fit">
          필터 초기화
        </Button>
      ) : null}
    </div>
  )
}
