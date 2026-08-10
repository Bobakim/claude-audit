import type { CaseSections } from '@/types/audit-case'

// 본문 '## ' 헤딩 → CaseSections 키. 접두어(prefix) 매칭이라 '(원문)' / '원문 발췌' 등
// 부가 문구 변형(62건 실사로 확인됨)을 흡수한다.
const SECTION_PREFIX_MAP: Array<[string, keyof CaseSections]> = [
  ['요약', '요약'],
  ['사실관계 요약', '사실관계요약'],
  ['근거 문장', '근거문장'],
  ['판단 근거', '판단근거'],
  ['감사절차 미흡사항', '감사절차미흡사항'],
  ['시사점', '시사점'],
  ['확인 필요', '확인필요'],
]

// frontmatter 필드를 본문에서 다시 설명하는 섹션 — CaseSections에 담지 않고 무시한다.
const IGNORED_HEADING_PREFIXES = [
  '지적유형 / 조치수준',
  '지적연도 / 감독기관',
  '관련 계정과목',
]

const REQUIRED_SECTION_KEYS = SECTION_PREFIX_MAP.map(([, key]) => key).filter(
  key => key !== '확인필요'
)

export interface ParseSectionsResult {
  sections: Partial<CaseSections>
  warnings: string[]
  missing: string[]
}

export function parseSections(
  body: string,
  filePath: string
): ParseSectionsResult {
  const sections: Partial<CaseSections> = {}
  const warnings: string[] = []

  const matches = [...body.matchAll(/^## (.+)$/gm)]

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i]
    const heading = match[1].trim()
    const start = (match.index ?? 0) + match[0].length
    const end =
      i + 1 < matches.length
        ? (matches[i + 1].index ?? body.length)
        : body.length
    const content = body.slice(start, end).trim()

    const mapped = SECTION_PREFIX_MAP.find(([prefix]) =>
      heading.startsWith(prefix)
    )
    if (mapped) {
      sections[mapped[1]] = content
      continue
    }

    if (IGNORED_HEADING_PREFIXES.some(prefix => heading.startsWith(prefix))) {
      continue
    }

    warnings.push(`${filePath}: 알 수 없는 섹션 '${heading}'`)
  }

  const missing = REQUIRED_SECTION_KEYS.filter(key => !(key in sections))

  return { sections, warnings, missing }
}
