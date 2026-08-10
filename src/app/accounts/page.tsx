import Link from 'next/link'

import { Container } from '@/components/layout/container'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { getAccountIndex } from '@/lib/content/account-index'

export default function AccountsPage() {
  const { reverse } = getAccountIndex()

  return (
    <Container>
      <div className="py-16">
        <h1 className="text-3xl font-bold tracking-tight">계정과목</h1>
        <p className="text-muted-foreground mt-2">
          계정과목별 감리지적사례 인덱스입니다.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reverse.map(({ account, cases }) => (
            <Link key={account.id} href={`/accounts/${account.id}`}>
              <Card className="hover:bg-accent h-full transition-colors">
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle>{account.label}</CardTitle>
                  <span className="text-muted-foreground text-sm">
                    {cases.length}건
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
