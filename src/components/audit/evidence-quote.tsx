import { cn } from '@/lib/utils'
import type { AuditCase } from '@/types/audit-case'

interface EvidenceQuoteProps {
  quote: string
  source: AuditCase['source']
  className?: string
}

// 앱이 생성한 요약과 원문 인용 문장을 시각적으로 명확히 구분하기 위한 인용 블록.
export function EvidenceQuote({
  quote,
  source,
  className,
}: EvidenceQuoteProps) {
  return (
    <figure className={cn('border-border border-l-2 pl-4', className)}>
      <blockquote className="text-foreground italic">{quote}</blockquote>
      <figcaption className="text-muted-foreground mt-1 text-sm">
        인쇄쪽 {source.printPage} (PDF쪽 {source.pdfPage})
      </figcaption>
    </figure>
  )
}
