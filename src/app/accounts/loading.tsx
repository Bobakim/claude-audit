import { Container } from '@/components/layout/container'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <Container>
      <div className="space-y-4 py-16">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="h-4 w-full max-w-sm" />
      </div>
    </Container>
  )
}
