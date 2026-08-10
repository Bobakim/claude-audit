'use client'

import Link from 'next/link'
import { useState } from 'react'

import { CaseCard } from '@/components/audit/case-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { AuditCase } from '@/types/audit-case'

interface CaseSearchableListProps {
  cases: AuditCase[]
}

// props로 받는 cases는 이미 서버(cases/page.tsx)에서 카테고리 필터+게이트가
// 적용된 결과다. 여기서는 검색어로 추가 좁히기만 한다(URL에는 반영하지 않음).
export function CaseSearchableList({ cases }: CaseSearchableListProps) {
  const [query, setQuery] = useState('')
  const trimmedQuery = query.trim()

  const filtered = trimmedQuery
    ? cases.filter(
        auditCase =>
          auditCase.caseName.includes(trimmedQuery) ||
          auditCase.sections.요약.includes(trimmedQuery) ||
          auditCase.relatedAccounts.some(account =>
            account.includes(trimmedQuery)
          )
      )
    : cases

  return (
    <div className="flex flex-col gap-6">
      <Input
        type="search"
        placeholder="사례명, 요약, 계정과목으로 검색"
        value={query}
        onChange={event => setQuery(event.target.value)}
        className="max-w-sm"
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-start gap-3 py-8">
          <p className="text-muted-foreground text-sm">
            {trimmedQuery
              ? `검색어 "${trimmedQuery}"에 대한 결과가 없습니다.`
              : '조건에 맞는 감리지적사례가 없습니다.'}
          </p>
          {trimmedQuery ? (
            // 검색어는 클라이언트 로컬 상태라 URL 이동(Link)만으로는 지워지지
            // 않는다(Next.js 클라이언트 라우팅에서 이 컴포넌트가 리마운트되지
            // 않고 리렌더만 되어 useState가 유지됨) — 직접 초기화한다.
            <Button variant="outline" size="sm" onClick={() => setQuery('')}>
              검색어 지우기
            </Button>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href="/cases">필터 초기화</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(auditCase => (
            <Link
              key={auditCase.caseId}
              href={`/cases/${encodeURIComponent(auditCase.caseId)}`}
            >
              <CaseCard
                auditCase={auditCase}
                className="hover:bg-accent h-full transition-colors"
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
