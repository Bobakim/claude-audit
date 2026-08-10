export type FrontmatterValue = string | string[] | number

/**
 * data/audit-cases/knowledge/cases/*.md의 frontmatter 블록 전용 YAML 서브셋 파서.
 * 'key: value' 최상위 필드와 'key:' 다음 줄의 '  - item' 블록 리스트만 지원한다
 * (62건 실사 결과 인라인 배열·멀티라인 값·중첩 객체·큰따옴표는 쓰이지 않음).
 */
export function parseFrontmatterYaml(
  block: string
): Record<string, FrontmatterValue> {
  const lines = block.split('\n')
  const result: Record<string, FrontmatterValue> = {}
  let currentListKey: string | null = null

  for (const line of lines) {
    const listItemMatch = line.match(/^ {2}- (.+)$/)
    if (listItemMatch && currentListKey) {
      const list = result[currentListKey]
      if (Array.isArray(list)) {
        list.push(listItemMatch[1].trim())
      }
      continue
    }

    const kvMatch = line.match(/^([^:]+):\s?(.*)$/)
    if (!kvMatch) continue

    const [, rawKey, rawValue] = kvMatch
    const key = rawKey.trim()
    const trimmedValue = rawValue.trim()

    if (trimmedValue === '') {
      result[key] = []
      currentListKey = key
      continue
    }

    currentListKey = null
    const unquoted = trimmedValue.replace(/^'(.*)'$/, '$1')
    result[key] = key === '지적연도' ? Number(unquoted) : unquoted
  }

  return result
}
