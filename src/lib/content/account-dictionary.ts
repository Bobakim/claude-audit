import type { AccountItem } from '@/types/audit-case'

/**
 * data/audit-cases/knowledge/cases/*.md 62건의 관련계정과목 원문 표기 54종을
 * 사람이 직접 검토해 정규 계정과목(영문 slug)으로 매핑한 사전.
 *
 * 원칙(docs/ROADMAP.md Task 006):
 * - 문자열 유사도 등 자동 추론 금지 — 여기 없는 표기는 미분류로 격리한다.
 * - 괄호 부기((연결), (FVOCI, ...) 등)는 정규 과목에서 분리해 tags로 보존한다
 *   (정보 손실 금지 — 원문 세부 내용을 버리지 않는다).
 * - 겉보기에 비슷해도 서로 다른 계정과목일 수 있는 쌍은 병합하지 않는다:
 *   매도가능증권 ≠ 매도가능금융자산, 대손충당금 ≠ 손실충당금(둘 다 사용자 확인 결과 별도 유지).
 *   FVOCI/FVPL/AC 금융자산 3분류도 FSS/2405-13 사례 자체가 "분류 오류"를 지적하므로
 *   병합하면 사례의 핵심 내용이 지워진다 — 반드시 3개 별도 slug.
 */
export const ACCOUNT_DICTIONARY: Record<string, AccountItem[]> = {
  // --- 매출 계열 ---
  매출: [{ id: 'sales', label: '매출' }],
  '매출액(연결)': [{ id: 'sales', label: '매출', tags: ['연결'] }],
  '매출(연결)': [{ id: 'sales', label: '매출', tags: ['연결'] }],
  '매출(연결, 종속회사 허위계상분)': [
    { id: 'sales', label: '매출', tags: ['연결', '종속회사 허위계상분'] },
  ],
  매출원가: [{ id: 'cost-of-sales', label: '매출원가' }],
  '매출원가(연결)': [
    { id: 'cost-of-sales', label: '매출원가', tags: ['연결'] },
  ],
  매출채권: [{ id: 'accounts-receivable', label: '매출채권' }],
  매입채무: [{ id: 'accounts-payable', label: '매입채무' }],
  '매입(원재료, B사로부터 고가매입)': [
    {
      id: 'purchases',
      label: '매입',
      tags: ['원재료', 'B사로부터 고가매입'],
    },
  ],
  '관광알선수입(매출)': [
    {
      id: 'tourism-brokerage-revenue',
      label: '관광알선수입',
      tags: ['매출로 분류됨'],
    },
  ],

  // --- 채권/충당금 ---
  대손충당금: [{ id: 'allowance-for-doubtful-accounts', label: '대손충당금' }],
  손실충당금: [{ id: 'loss-allowance', label: '손실충당금' }],
  대손상각비: [{ id: 'bad-debt-expense', label: '대손상각비' }],
  대여금: [{ id: 'loans-receivable', label: '대여금' }],
  '대여금(연결재무제표, 종속회사 앞)': [
    {
      id: 'loans-receivable',
      label: '대여금',
      tags: ['연결재무제표', '종속회사 앞'],
    },
  ],
  대출채권: [{ id: 'bank-loans-receivable', label: '대출채권' }],
  선급금: [{ id: 'advance-payments', label: '선급금' }],
  미지급금: [{ id: 'other-payables', label: '미지급금' }],
  선수금: [{ id: 'advance-received', label: '선수금' }],

  // --- 투자자산 ---
  관계기업투자주식: [{ id: 'associate-investment', label: '관계기업투자주식' }],
  종속기업투자주식: [
    { id: 'subsidiary-investment', label: '종속기업투자주식' },
  ],
  지분법적용투자주식: [
    { id: 'equity-method-investment', label: '지분법적용투자주식' },
  ],
  '주식(E사 주식 담보제공/F사 주식 인수)': [
    {
      id: 'equity-securities-holdings',
      label: '주식',
      tags: ['E사 주식 담보제공', 'F사 주식 인수'],
    },
  ],

  // --- 금융자산/파생상품 (매도가능증권/금융자산, FVOCI/FVPL/AC는 절대 병합 금지) ---
  매도가능증권: [
    { id: 'available-for-sale-securities', label: '매도가능증권' },
  ],
  매도가능금융자산: [
    { id: 'available-for-sale-financial-assets', label: '매도가능금융자산' },
  ],
  파생상품자산: [{ id: 'derivative-assets', label: '파생상품자산' }],
  파생상품부채: [{ id: 'derivative-liabilities', label: '파생상품부채' }],
  '기타포괄손익-공정가치 측정 금융자산': [
    {
      id: 'fvoci-financial-assets',
      label: '기타포괄손익-공정가치측정금융자산',
    },
  ],
  '기타포괄손익-공정가치측정금융자산(FVOCI, 비상장주식)': [
    {
      id: 'fvoci-financial-assets',
      label: '기타포괄손익-공정가치측정금융자산',
      tags: ['FVOCI', '비상장주식'],
    },
  ],
  '당기손익-공정가치측정금융자산(FVPL, 수익증권출자금·프로젝트투자금 재분류 대상)':
    [
      {
        id: 'fvpl-financial-assets',
        label: '당기손익-공정가치측정금융자산',
        tags: ['FVPL', '수익증권출자금·프로젝트투자금 재분류 대상'],
      },
    ],
  '상각후원가측정금융자산(AC, 프로젝트투자금 오분류)': [
    {
      id: 'amortized-cost-financial-assets',
      label: '상각후원가측정금융자산',
      tags: ['AC', '프로젝트투자금 오분류'],
    },
  ],

  // --- 유형/무형자산 ---
  유형자산: [{ id: 'tangible-assets', label: '유형자산' }],
  감가상각비: [{ id: 'depreciation-expense', label: '감가상각비' }],
  건설중인자산: [{ id: 'construction-in-progress', label: '건설중인자산' }],
  무형자산: [{ id: 'intangible-assets', label: '무형자산' }],
  영업권: [{ id: 'goodwill', label: '영업권' }],
  재고자산: [{ id: 'inventory', label: '재고자산' }],
  외주가공비: [{ id: 'outsourced-processing-cost', label: '외주가공비' }],

  // --- 부채 ---
  퇴직급여충당부채: [
    { id: 'severance-benefit-liability', label: '퇴직급여충당부채' },
  ],
  '퇴직급여(비용, 종속회사 과소계상분)': [
    {
      id: 'severance-benefit-expense',
      label: '퇴직급여',
      tags: ['비용', '종속회사 과소계상분'],
    },
  ],
  전환사채: [{ id: 'convertible-bonds', label: '전환사채' }],
  '전환사채(D사 발행분)': [
    { id: 'convertible-bonds', label: '전환사채', tags: ['D사 발행분'] },
  ],
  이연법인세부채: [{ id: 'deferred-tax-liabilities', label: '이연법인세부채' }],
  '이연법인세자산(이월결손금·세액공제)': [
    {
      id: 'deferred-tax-assets',
      label: '이연법인세자산',
      tags: ['이월결손금·세액공제'],
    },
  ],
  '법인세비용(종속기업)': [
    { id: 'income-tax-expense', label: '법인세비용', tags: ['종속기업'] },
  ],
  '지급보증(채무보증, S사가 R사에 제공)': [
    {
      id: 'guarantee-liabilities',
      label: '지급보증',
      tags: ['채무보증', 'S사가 R사에 제공'],
    },
  ],

  // --- 자본/손익 ---
  '자기자본(연결재무제표)': [
    { id: 'equity', label: '자기자본', tags: ['연결재무제표'] },
  ],
  '당기순이익(연결재무제표)': [
    { id: 'net-income', label: '당기순이익', tags: ['연결재무제표'] },
  ],
  '유상증자(자본, S사 참여분)': [
    {
      id: 'paid-in-capital-increase',
      label: '유상증자',
      tags: ['자본', 'S사 참여분'],
    },
  ],
  판매관리비: [{ id: 'sg-and-a-expenses', label: '판매관리비' }],
  '판매비와관리비(급여·보증수리비)': [
    {
      id: 'sg-and-a-expenses',
      label: '판매관리비',
      tags: ['급여·보증수리비'],
    },
  ],

  // --- 여행업 특유 계정(일반 매출과 분리 유지) ---
  관광전수금: [{ id: 'tourism-deposits-received', label: '관광전수금' }],

  // --- 공시성 서술(대차대조표 계정이 아니지만 미분류 처리하지 않고 명시 정규화) ---
  '특수관계자거래 주석(임직원 자금유용 관련 공시 누락)': [
    {
      id: 'related-party-transaction-disclosure',
      label: '특수관계자거래 주석',
      tags: ['임직원 자금유용 관련 공시 누락'],
    },
  ],

  // --- 1:N 특수 케이스: FSS/2311-17 전용. 리스트 항목 1개에 계정과목 2개가
  // "/"로 결합된 자유 텍스트 — 당기순이익·자기자본 두 정규 계정과목으로 분리한다. ---
  '당기순이익/자기자본(횡령손실 미인식으로 과대계상)': [
    {
      id: 'net-income',
      label: '당기순이익',
      tags: ['횡령손실 미인식으로 과대계상'],
    },
    { id: 'equity', label: '자기자본', tags: ['횡령손실 미인식으로 과대계상'] },
  ],
}
