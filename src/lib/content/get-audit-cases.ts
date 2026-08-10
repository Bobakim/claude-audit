import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { cache } from 'react'

import { parseFrontmatterYaml } from '@/lib/content/parse-frontmatter-yaml'
import { parseSections } from '@/lib/content/parse-sections'
import { verifyPageOffset } from '@/lib/content/page-offset'
import { parseCaseFrontmatter } from '@/lib/schemas/case-frontmatter'
import type { AuditCase, CaseSections, FindingType } from '@/types/audit-case'

const DEFAULT_CASES_DIR = path.join(
  process.cwd(),
  'data/audit-cases/knowledge/cases'
)

const FRONTMATTER_PATTERN = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/

// taxonomy.md 근거: FSS/2311-17의 원문 지적유형은 "부정관련 자산 허위계상(횡령손실 미인식) + 공시누락"
// 라는 복합 문자열이며, taxonomy.md도 이 사례를 두 유형 양쪽 집계에 포함시킨다(제5장 "FSS/2311-17은
// 공시누락과 중복 분류"). 6종 enum 어디에도 원문 그대로는 속하지 않으므로 이 1건만 하드코딩으로 정규화한다.
const COMPOSITE_FINDING_TYPE_OVERRIDES: Record<
  string,
  { findingType: FindingType; additionalFindingTypes: FindingType[] }
> = {
  'FSS/2311-17': {
    findingType: '부정관련 자산 허위계상',
    additionalFindingTypes: ['공시누락'],
  },
}

const EXPECTED_FINDING_TYPE_COUNTS: Record<FindingType, number> = {
  자산평가: 20,
  수익인식: 17,
  '부정관련 자산 허위계상': 9,
  부채인식: 8,
  공시누락: 5,
  '연결범위·연결처리 오류': 4,
}

/**
 * data/audit-cases/knowledge/cases/의 마크다운 카드를 빌드타임에 파싱해 AuditCase[]로 반환한다.
 * 파싱 실패(frontmatter 검증 실패·본문 섹션 누락)가 하나라도 있으면 전부 모아 하나의 Error로 throw한다.
 * dir 인자는 테스트 전용이며, 생략 시 기본 디렉터리에 대해서만 62건·지적유형 분포 assert를 수행한다.
 */
export const getAuditCases = cache(
  (dir: string = DEFAULT_CASES_DIR): AuditCase[] => {
    const files = readdirSync(dir).filter(file => file.endsWith('.md'))
    const errors: string[] = []
    const cases: AuditCase[] = []

    for (const file of files) {
      const raw = readFileSync(path.join(dir, file), 'utf-8')
      const match = raw.match(FRONTMATTER_PATTERN)
      if (!match) {
        errors.push(`${file}: frontmatter 구분자(---)를 찾을 수 없습니다`)
        continue
      }

      const [, frontmatterBlock, body] = match
      const frontmatterRaw = parseFrontmatterYaml(frontmatterBlock)
      const caseId = String(frontmatterRaw['사례ID'] ?? '')
      const override = COMPOSITE_FINDING_TYPE_OVERRIDES[caseId]
      if (override) {
        frontmatterRaw['지적유형'] = override.findingType
      }

      try {
        const frontmatter = parseCaseFrontmatter(frontmatterRaw, file)
        const { sections, warnings, missing } = parseSections(body, file)
        warnings.forEach(warning => console.warn(warning))

        if (missing.length > 0) {
          errors.push(`${file}: 본문 섹션 누락 - ${missing.join(', ')}`)
          continue
        }

        cases.push({
          ...frontmatter,
          sections: sections as CaseSections,
          ...(override
            ? { additionalFindingTypes: override.additionalFindingTypes }
            : {}),
        })
      } catch (error) {
        errors.push(`${file}: ${(error as Error).message}`)
      }
    }

    if (errors.length > 0) {
      throw new Error(
        `콘텐츠 파이프라인 파싱 실패 (${errors.length}건):\n${errors.join('\n')}`
      )
    }

    if (dir === DEFAULT_CASES_DIR) {
      assertExpectedCaseCount(cases)
      assertExpectedFindingTypeDistribution(cases)
      assertPageOffsetIntegrity(cases)
    }

    return cases
  }
)

function assertExpectedCaseCount(cases: AuditCase[]): void {
  if (cases.length !== 62) {
    throw new Error(
      `파싱된 사례 수(${cases.length}건)가 기대값(62건)과 다릅니다`
    )
  }
}

function assertPageOffsetIntegrity(cases: AuditCase[]): void {
  const errors: string[] = []
  for (const auditCase of cases) {
    const result = verifyPageOffset(
      auditCase.source.printPage,
      auditCase.source.pdfPage
    )
    if (!result.valid) {
      errors.push(`${auditCase.caseId}: ${result.reason}`)
    }
  }
  if (errors.length > 0) {
    throw new Error(
      `출처 페이지 오프셋 무결성 검증 실패 (${errors.length}건):\n${errors.join('\n')}`
    )
  }
}

function assertExpectedFindingTypeDistribution(cases: AuditCase[]): void {
  const counts: Partial<Record<FindingType, number>> = {}
  for (const auditCase of cases) {
    counts[auditCase.findingType] = (counts[auditCase.findingType] ?? 0) + 1
    auditCase.additionalFindingTypes?.forEach(type => {
      counts[type] = (counts[type] ?? 0) + 1
    })
  }

  for (const [type, expectedCount] of Object.entries(
    EXPECTED_FINDING_TYPE_COUNTS
  ) as [FindingType, number][]) {
    const actualCount = counts[type] ?? 0
    if (actualCount !== expectedCount) {
      throw new Error(
        `지적유형 '${type}' 건수(${actualCount}건)가 taxonomy.md 기대값(${expectedCount}건)과 다릅니다`
      )
    }
  }
}
