import Link from 'next/link'

import { Container } from '@/components/layout/container'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const ENTRY_POINTS = [
  {
    href: '/accounts',
    title: '계정과목',
    description: '계정과목을 클릭해 연결된 감리지적사례로 진입합니다.',
  },
  {
    href: '/cases',
    title: '감리지적사례',
    description: '전체 감리지적사례 목록을 지적유형·연도로 살펴봅니다.',
  },
  {
    href: '/taxonomy',
    title: '지적유형 분류체계',
    description: '지적유형 6종별 건수와 사례 분포를 확인합니다.',
  },
] as const

export default function Home() {
  return (
    <Container>
      <div className="py-16">
        <h1 className="text-3xl font-bold tracking-tight">감리지적사례 조회</h1>
        <p className="text-muted-foreground mt-2">
          계정과목을 시작점으로 금융감독원 감리지적사례를 3클릭 안에 찾아보세요.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ENTRY_POINTS.map(entry => (
            <Link key={entry.href} href={entry.href}>
              <Card className="hover:bg-accent h-full transition-colors">
                <CardHeader>
                  <CardTitle>{entry.title}</CardTitle>
                  <CardDescription>{entry.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </Container>
  )
}
