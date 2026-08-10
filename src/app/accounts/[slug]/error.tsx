'use client'

import { Container } from '@/components/layout/container'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <Container>
      <div className="py-16">
        <Alert variant="destructive">
          <AlertTitle>문제가 발생했습니다</AlertTitle>
          <AlertDescription>
            {error.message || '페이지를 불러오는 중 오류가 발생했습니다.'}
          </AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => reset()}>
          다시 시도
        </Button>
      </div>
    </Container>
  )
}
