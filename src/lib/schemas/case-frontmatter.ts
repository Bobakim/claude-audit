import { z } from 'zod'
import type { AuditCase, MaybeUnknown } from '@/types/audit-case'

const caseFrontmatterSchemaKo = z.object({
  사례ID: z.string(),
  사례명: z.string(),
  지적유형: z.enum([
    '자산평가',
    '수익인식',
    '부정관련 자산 허위계상',
    '부채인식',
    '공시누락',
    '연결범위·연결처리 오류',
  ]),
  조치수준: z.string(),
  지적연도: z.number(),
  감독기관: z.string(),
  관련계정과목: z.array(z.string()),
  검수상태: z.enum(['초안', '검수중', '공개']),
  출처: z.string(),
})

export type CaseFrontmatterKo = z.infer<typeof caseFrontmatterSchemaKo>

// 프론트매터만으로 채울 수 있는 AuditCase 프로퍼티. sections는 본문 파싱(Task 005) 몫이라 제외.
export type AuditCaseFrontmatter = Omit<AuditCase, 'sections'>

// 원문 PDF에 조치수준 필드가 없는 카드는 이 접두사로 시작하는 사유 문자열을 남긴다.
const UNKNOWN_ACTION_LEVEL_PREFIX = '[확인필요]'

const SOURCE_PATTERN = /인쇄쪽\s*([^\s(]+)\s*\(PDF쪽\s*([^)]+)\)/

function parseSource(raw: string): { printPage: string; pdfPage: string } {
  const match = raw.match(SOURCE_PATTERN)
  if (!match) {
    throw new Error(
      `출처 형식이 예상(인쇄쪽 N~M (PDF쪽 N~M))과 다릅니다: ${raw}`
    )
  }
  return { printPage: match[1], pdfPage: match[2] }
}

function parseActionLevel(raw: string): MaybeUnknown<string> {
  if (raw.startsWith(UNKNOWN_ACTION_LEVEL_PREFIX)) {
    const reason = raw
      .slice(UNKNOWN_ACTION_LEVEL_PREFIX.length)
      .replace(/^[\s—-]+/, '')
    return { status: 'unknown', reason: reason || undefined }
  }
  return { status: 'known', value: raw }
}

export function parseCaseFrontmatter(
  raw: unknown,
  filePath?: string
): AuditCaseFrontmatter {
  const parsed = caseFrontmatterSchemaKo.safeParse(raw)
  if (!parsed.success) {
    const location = filePath ? ` (${filePath})` : ''
    throw new Error(
      `frontmatter 검증 실패${location}: ${JSON.stringify(parsed.error.issues, null, 2)}`
    )
  }

  const fm = parsed.data

  return {
    caseId: fm.사례ID,
    caseName: fm.사례명,
    findingType: fm.지적유형,
    actionLevel: parseActionLevel(fm.조치수준),
    findingYear: fm.지적연도,
    supervisor: fm.감독기관,
    relatedAccounts: fm.관련계정과목,
    reviewStatus: fm.검수상태,
    source: parseSource(fm.출처),
  }
}
