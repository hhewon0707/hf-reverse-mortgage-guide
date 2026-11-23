import { loadFaqs, loadPaymentTable, loadRules } from './dataLoader'
import type { FaqItem, HousingType, PaymentTableRow, PlanType } from '../types/pension'

export type Target = 'self' | 'parent'
export type HouseKind = 'house' | 'senior' | 'officetel'
export type ResidenceState = 'living' | 'exception' | 'unsure'
export type Bequest = 'want' | 'neutral' | 'max_income'
export type StayPref = 'stay' | 'move' | 'unsure'
export type Concern = 'inheritance' | 'price_rise' | 'child_opposition' | 'fees' | 'complex_process' | 'other'
export type Capacity = 'ok' | 'limited'

export interface FindInput {
  target: Target
  ownerBirth: string
  hasSpouse: boolean
  spouseBirth: string
  houseKind: HouseKind
  isApartment: boolean
  lowestFloor: boolean
  priceManwon: number
  houseCount: 1 | 2 | 3
  publicPriceManwon: number
  residence: ResidenceState
  capacity: Capacity
  basicPension: boolean
  loanManwon: number
  stay: StayPref
  bequest: Bequest
  concerns: Concern[]
  concernOther: string
}

export const DEFAULT_INPUT: FindInput = {
  target: 'self',
  ownerBirth: '',
  hasSpouse: false,
  spouseBirth: '',
  houseKind: 'house',
  isApartment: true,
  lowestFloor: false,
  priceManwon: 30000,
  houseCount: 1,
  publicPriceManwon: 20000,
  residence: 'living',
  capacity: 'ok',
  basicPension: false,
  loanManwon: 0,
  stay: 'stay',
  bequest: 'neutral',
  concerns: [],
  concernOther: '',
}

export const EFFECTIVE_DATE = '2026-06'
const PUBLIC_PRICE_CAP_MANWON = 120000 // 부부합산 공시가격 12억
const PREF_PRICE_CAP_MANWON = 25000 // 우대형 시가 2.5억 미만

/** 생년월일(YYYY-MM-DD) → 만 나이 */
export function calcAge(birth: string, today = new Date()): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birth)) return null
  const [y, m, d] = birth.split('-').map(Number)
  if (y < 1900 || m < 1 || m > 12 || d < 1 || d > 31) return null
  let age = today.getFullYear() - y
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age -= 1
  return age >= 0 ? age : null
}

export function fmtWon(won: number): string {
  return fmtMan(Math.round(won / 10000))
}

/** 만원 단위 숫자 → "3억 2,000만원" */
export function fmtMan(manwon: number): string {
  const n = Math.round(manwon)
  if (n <= 0) return '0원'
  const eok = Math.floor(n / 10000)
  const man = n % 10000
  if (eok > 0 && man > 0) return `${eok}억 ${man.toLocaleString()}만원`
  if (eok > 0) return `${eok}억원`
  return `${man.toLocaleString()}만원`
}

interface Point {
  eok: number
  monthly: number
  maxWithdrawal: number
}

function pointsFor(rows: PaymentTableRow[], housing: HousingType, plan: PlanType, age: number): Point[] {
  return rows
    .filter(
      (r) =>
        r.effective_date === EFFECTIVE_DATE && r.housing_type === housing && r.plan_type === plan && r.age === age
    )
    .map((r) => ({ eok: r.house_price_eok, monthly: r.monthly_payment_won, maxWithdrawal: r.max_withdrawal_won }))
    .sort((a, b) => a.eok - b.eok)
}

/** 일람표 값 조회 (주택가격은 표의 억원 단위 사이를 선형 보간) */
export function tableLookup(housing: HousingType, plan: PlanType, age: number, priceEok: number) {
  const a = Math.min(90, Math.max(55, Math.floor(age)))
  const pts = pointsFor(loadPaymentTable(), housing, plan, a)
  if (pts.length === 0) return { monthly: 0, maxWithdrawal: 0 }
  const first = pts[0]
  const last = pts[pts.length - 1]
  const maxEok = plan === 'preferential' ? 2.5 : last.eok
  const eok = Math.min(priceEok, maxEok)

  if (eok <= first.eok) {
    const k = eok / first.eok
    return { monthly: first.monthly * k, maxWithdrawal: first.maxWithdrawal * k }
  }
  if (eok >= last.eok) {
    // 우대형은 표가 2억까지만 있어 2~2.5억은 2억 값을 가격 비례로 확장(근사)
    const k = plan === 'preferential' ? eok / last.eok : 1
    return { monthly: last.monthly * k, maxWithdrawal: last.maxWithdrawal * k }
  }
  const lo = [...pts].reverse().find((p) => p.eok <= eok)!
  const hi = pts.find((p) => p.eok > eok)!
  const t = (eok - lo.eok) / (hi.eok - lo.eok)
  return {
    monthly: lo.monthly + (hi.monthly - lo.monthly) * t,
    maxWithdrawal: lo.maxWithdrawal + (hi.maxWithdrawal - lo.maxWithdrawal) * t,
  }
}

export type CheckStatus = 'ok' | 'warn' | 'ng' | 'info'
export interface Check {
  id: string
  label: string
  status: CheckStatus
  detail: string
}

export type ProductStatus = 'recommend' | 'consider' | 'info' | 'na'
export interface Product {
  id: string
  name: string
  status: ProductStatus
  summary: string
  reasons: string[]
}

export interface Method {
  id: string
  name: string
  monthlyWon: number | null
  estimated: boolean
  recommended: boolean
  desc: string
  fit: string
  payTypes: string
}

export interface ConcernCard {
  concern: Concern
  label: string
  faqs: FaqItem[]
}

export const CONCERN_LABEL: Record<Concern, string> = {
  inheritance: '상속 문제',
  price_rise: '집값이 오를 때 손해',
  child_opposition: '자녀의 반대',
  fees: '비용·수수료',
  complex_process: '절차의 복잡성',
  other: '기타',
}

export interface FindResult {
  age: number | null
  ownerAge: number | null
  spouseAge: number | null
  ageUsed: number
  ageNote: string
  priceEok: number
  overall: 'ok' | 'conditional' | 'unlikely'
  checks: Check[]
  prefEligible: boolean
  base: { monthly: number; min: number; max: number }
  pref: { monthly: number; min: number; max: number } | null
  maxWithdrawalWon: number
  loanLimit90Won: number
  loanState: 'none' | 'within_50' | 'within_90' | 'over_90'
  products: Product[]
  methods: Method[]
  concernCards: ConcernCard[]
}

export function estimate(input: FindInput): FindResult {
  const rules = loadRules()
  const variance = rules.estimation_params.range_variance_ratio
  const ownerAge = calcAge(input.ownerBirth)
  const spouseAge = input.hasSpouse ? calcAge(input.spouseBirth) : null
  const ages = [ownerAge, spouseAge].filter((a): a is number => a !== null)
  const youngest = ages.length ? Math.min(...ages) : null
  const oldest = ages.length ? Math.max(...ages) : null
  const ageUsed = Math.min(90, Math.max(55, youngest ?? 65))

  let ageNote = '부부 중 연소자 기준으로 산정합니다.'
  if (youngest === null) ageNote = '생년월일이 없어 만 65세 기준으로 가정했습니다.'
  else if (youngest < 55) ageNote = '연소자가 만 55세 미만이라 일람표 최저 연령(55세) 기준으로 참고했습니다. 정확한 산정은 상담이 필요합니다.'
  else if (youngest > 90) ageNote = '일람표 최고 연령(90세) 기준으로 참고했습니다.'

  const housing: HousingType = input.houseKind === 'officetel' ? 'officetel' : 'general'
  const priceEok = Math.max(0.1, input.priceManwon / 10000)

  // ── 자격 점검 ──
  const checks: Check[] = []
  if (oldest === null) {
    checks.push({ id: 'age', label: '연령 요건', status: 'warn', detail: '생년월일을 입력하면 연령 요건을 확인할 수 있어요.' })
  } else if (oldest >= 55) {
    checks.push({
      id: 'age',
      label: '연령 요건 (만 55세 이상)',
      status: 'ok',
      detail: `주택소유자 또는 배우자 중 만 55세 이상이 있습니다. 월 수령액은 연소자(만 ${ageUsed}세) 기준으로 계산했어요.`,
    })
  } else {
    checks.push({ id: 'age', label: '연령 요건 (만 55세 이상)', status: 'ng', detail: '부부 모두 만 55세 미만이라 현재는 가입 대상이 아닐 수 있어요.' })
  }

  checks.push({
    id: 'kind',
    label: '주택 종류',
    status: 'ok',
    detail:
      input.houseKind === 'house'
        ? '주택법상 주택은 가입 대상입니다.'
        : input.houseKind === 'senior'
          ? '노인복지주택도 대상입니다. (월 수령액은 일반주택 일람표로 참고 계산)'
          : '주거목적 오피스텔은 대상이며, 오피스텔 일람표로 계산했어요.',
  })

  const overCap = input.publicPriceManwon > PUBLIC_PRICE_CAP_MANWON
  if (!overCap) {
    checks.push({
      id: 'public',
      label: '공시가격 (부부합산 12억 이하)',
      status: 'ok',
      detail: `입력하신 합산 공시가격 ${fmtMan(input.publicPriceManwon)}은 기준 이내입니다.`,
    })
  } else if (input.houseCount === 2) {
    checks.push({
      id: 'public',
      label: '공시가격 (부부합산 12억 이하)',
      status: 'warn',
      detail: '12억 초과 2주택자는 신규 가입 후 3년 이내에 1주택을 처분하는 조건으로 가입할 수 있습니다. 처분 계획을 상담에서 확인하세요.',
    })
  } else {
    checks.push({
      id: 'public',
      label: '공시가격 (부부합산 12억 이하)',
      status: 'ng',
      detail: '합산 공시가격이 12억을 넘으면 가입이 어려울 수 있어요. 정확한 판단은 상담이 필요합니다.',
    })
  }

  if (input.houseCount >= 2 && !overCap) {
    checks.push({ id: 'count', label: '주택 보유 수', status: 'info', detail: '다주택이라도 합산 공시가격이 기준 이내인 경우가 있어 상담에서 최종 확인합니다.' })
  }

  checks.push(
    input.residence === 'living'
      ? { id: 'residence', label: '거주 요건', status: 'ok', detail: '현재 실제로 거주 중이십니다.' }
      : input.residence === 'exception'
        ? {
            id: 'residence',
            label: '거주 요건',
            status: 'warn',
            detail:
              '실거주 예외 사유(질병 치료 입원·요양시설, 자녀 봉양을 위한 장기 체류, 노인주거복지시설 이주 등)에 해당하는지 확인이 필요해요. 부부합산 1주택자에 적용되는 예외입니다.',
          }
        : { id: 'residence', label: '거주 요건', status: 'warn', detail: '거주 요건이 불확실해요. 실거주 여부와 예외 사유를 상담에서 확인하세요.' }
  )

  checks.push(
    input.capacity === 'ok'
      ? { id: 'capacity', label: '채무관계자 자격', status: 'ok', detail: '의사능력·행위능력에 문제가 없는 경우입니다.' }
      : {
          id: 'capacity',
          label: '채무관계자 자격',
          status: 'warn',
          detail: '의사능력·행위능력이 부족하면 직접 계약이 어려워요. 치매 등이 걱정되면 성년후견제도를 활용하는 방법을 안내받으세요.',
        }
  )

  // ── 우대형 ──
  const prefEligible =
    input.basicPension && input.houseCount === 1 && input.priceManwon < PREF_PRICE_CAP_MANWON
  checks.push(
    prefEligible
      ? { id: 'pref', label: '우대형 요건', status: 'ok', detail: '기초연금 수급권자 + 1주택 + 시가 2.5억 미만으로 우대형을 검토할 수 있어요.' }
      : {
          id: 'pref',
          label: '우대형 요건',
          status: 'info',
          detail: !input.basicPension
            ? '기초연금 수급권자가 아니라 우대형 대상이 아닙니다.'
            : input.houseCount !== 1
              ? '우대형은 부부합산 1주택자만 해당돼요.'
              : '우대형은 시가 2.5억 미만 주택만 해당돼요.',
        }
  )

  const overall: FindResult['overall'] = checks.some((c) => c.status === 'ng')
    ? 'unlikely'
    : checks.some((c) => c.status === 'warn')
      ? 'conditional'
      : 'ok'

  // ── 월 수령액 ──
  const std = tableLookup(housing, 'standard', ageUsed, priceEok)
  const base = { monthly: std.monthly, min: std.monthly * (1 - variance), max: std.monthly * (1 + variance) }
  let pref: FindResult['pref'] = null
  if (prefEligible) {
    const p = tableLookup(housing, 'preferential', ageUsed, priceEok)
    pref = { monthly: p.monthly, min: p.monthly * (1 - variance), max: p.monthly * (1 + variance) }
  }

  const loanWon = input.loanManwon * 10000
  const loanLimit = std.maxWithdrawal / 0.5 // 최대 인출한도(50%) → 대출한도 환산
  const loanLimit90 = loanLimit * 0.9
  const loanState: FindResult['loanState'] =
    loanWon <= 0 ? 'none' : loanWon <= std.maxWithdrawal ? 'within_50' : loanWon <= loanLimit90 ? 'within_90' : 'over_90'

  const afterLoan = (monthly: number, limit: number) =>
    loanWon > 0 && limit > 0 ? Math.max(0, monthly * (1 - loanWon / limit)) : monthly

  // ── 상품 추천 ──
  const products: Product[] = []
  products.push({
    id: 'general',
    name: '일반형 주택연금',
    status: overall === 'unlikely' ? 'na' : pref || loanState !== 'none' ? 'consider' : 'recommend',
    summary: '가장 기본이 되는 주택연금으로, 위 월 수령액 일람표가 그대로 적용돼요.',
    reasons: ['부부 중 연소자 연령과 주택가격으로 월 수령액이 결정돼요.'],
  })
  products.push({
    id: 'preferential',
    name: '우대형 주택연금',
    status: prefEligible ? 'recommend' : 'na',
    summary: '기초연금 수급권자이면서 부부합산 시가 2.5억 미만 1주택이면 월 수령액을 더 받을 수 있어요.',
    reasons: prefEligible
      ? [
          input.priceManwon < 18000
            ? '시가 1.8억 미만 구간으로, 일반형 대비 최대 약 25% 우대가 안내되는 구간이에요.'
            : '시가 1.8억~2.5억 미만 구간으로, 일반형 대비 최대 약 20% 우대가 안내되는 구간이에요.',
          '표의 우대형 금액으로 계산했습니다.',
        ]
      : ['기초연금 수급권자 + 부부합산 시가 2.5억 미만 1주택일 때 해당돼요.'],
  })
  products.push({
    id: 'loan',
    name: '주택담보대출 상환용 주택연금',
    status: loanState === 'none' ? 'na' : loanState === 'over_90' ? 'consider' : 'recommend',
    summary: '기존 주택담보대출을 연금 인출한도로 갚고 남은 금액으로 월 수령액을 받는 방식이에요.',
    reasons:
      loanState === 'none'
        ? ['주택담보대출이 없다면 해당하지 않아요.']
        : loanState === 'within_50'
          ? ['대출 잔액이 인출한도(대출한도의 50%) 이내예요.']
          : loanState === 'within_90'
            ? ['대출 잔액이 대출한도의 50% 초과~90% 이하 구간이라 이 방식을 이용할 수 있어요.']
            : ['대출 잔액이 대출한도의 90%를 넘어 일부는 직접 상환해야 할 수 있어요.'],
  })
  products.push({
    id: 'business',
    name: '소상공인대출 상환용 주택연금',
    status: 'info',
    summary: '소상공인 사업자 대출을 연금으로 갚는 방식이에요.',
    reasons: ['최초 연금대출 실행일로부터 6개월 이내에 대출을 상환하고 폐업 신고를 해야 해요.', '사업자 대출이 있는 경우에만 해당돼요.'],
  })
  const wantsSuccession = input.target === 'parent' || input.bequest === 'want'
  products.push({
    id: 'succession',
    name: '세대이음 주택연금',
    status: wantsSuccession ? 'consider' : 'info',
    summary: '부모님 사망 후 만 55세 이상 자녀가 같은 주택을 담보로 다시 가입하는 방식이에요.',
    reasons: [
      '부모님이 근저당권(저당권)방식을 이용 중일 때 가입할 수 있어요.',
      '인출한도는 대출한도의 50% 초과~90% 이하까지 설정할 수 있어요.',
      wantsSuccession ? '집을 가족에게 이어주고 싶다는 선택과 잘 맞는 구조예요.' : '집을 물려주고 싶은 마음이 생기면 함께 살펴보세요.',
    ],
  })

  // ── 지급방식 ──
  const mixedRatio = 0.5
  const mixedEst = base.monthly * (1 - mixedRatio)
  const fixedMult = rules.estimation_params.fixed_term_multipliers['15']
  const prefMixedEst = pref ? pref.monthly * (1 - mixedRatio) : null
  const prefLoan = pref ? afterLoan(pref.monthly, loanLimit) : null

  const methods: Method[] = []
  const hasLoan = loanState !== 'none' && loanState !== 'over_90'
  methods.push({
    id: 'lifetime',
    name: '종신지급방식',
    monthlyWon: base.monthly,
    estimated: false,
    recommended: !hasLoan && input.bequest !== 'want',
    desc: '평생 매달 받는 가장 기본 방식이에요. 일람표 금액이 그대로 적용돼요.',
    fit: input.bequest === 'max_income' ? '최대한 많이 받고 싶은 분께 맞아요.' : '오래 사실수록 안정적인 생활비가 필요한 분께 맞아요.',
    payTypes: '정액형 · 초기증액형 · 정기증가형',
  })
  methods.push({
    id: 'mixed',
    name: '종신혼합방식',
    monthlyWon: mixedEst,
    estimated: true,
    recommended: input.bequest === 'want' && !hasLoan,
    desc: '인출한도(대출한도의 50%, 재건축 분담금 용도는 70%)를 정해 두고 필요할 때 목돈을 꺼내 쓰고, 남은 금액은 평생 매달 받아요.',
    fit: '병원비·수리비 같은 목돈이 걱정되는 분께 맞아요.',
    payTypes: '정액형 · 초기증액형 · 정기증가형',
  })
  methods.push({
    id: 'fixed',
    name: '확정기간혼합방식',
    monthlyWon: mixedEst * fixedMult,
    estimated: true,
    recommended: false,
    desc: '정해진 기간(예: 15년) 동안 월 수령액을 더 받는 방식이에요. 인출한도 50%/70% 중 선택하며, 기간이 끝나면 월지급이 멈추고 관리비·의료비용 의무설정인출한도 5%가 남아 있어요.',
    fit: '다른 연금이 나오기 전까지 생활비 공백을 메우고 싶은 분께 맞아요.',
    payTypes: '정액형',
  })
  if (loanState !== 'none') {
    methods.push({
      id: 'loanrepay',
      name: '대출상환방식',
      monthlyWon: afterLoan(base.monthly, loanLimit),
      estimated: true,
      recommended: hasLoan && !pref,
      desc: '기존 주택담보대출을 먼저 갚고, 남은 대출한도로 월 수령액을 받는 방식이에요. 인출한도는 대출한도의 50% 초과~90% 이하까지 설정할 수 있어요.',
      fit: '주택담보대출 때문에 연금 가입이 막막했던 분께 맞아요.',
      payTypes: '정액형',
    })
  }
  if (pref) {
    methods.push({
      id: 'prefpay',
      name: '우대지급방식',
      monthlyWon: pref.monthly,
      estimated: false,
      recommended: !hasLoan && input.bequest !== 'want',
      desc: '우대형 요건을 갖춘 경우 평생 매달 더 많이 받는 방식이에요.',
      fit: '기초연금 수급권자로서 월 수령액을 높이고 싶은 분께 맞아요.',
      payTypes: '정액형',
    })
    methods.push({
      id: 'prefmixed',
      name: '우대혼합방식',
      monthlyWon: prefMixedEst,
      estimated: true,
      recommended: input.bequest === 'want' && !hasLoan,
      desc: '우대형 조건에 인출한도를 함께 두는 방식이에요.',
      fit: '우대형 혜택과 목돈 대비를 함께 원하는 분께 맞아요.',
      payTypes: '정액형',
    })
    if (loanState !== 'none') {
      methods.push({
        id: 'prefloan',
        name: '대출상환우대방식',
        monthlyWon: prefLoan,
        estimated: true,
        recommended: hasLoan,
        desc: '우대형 요건을 갖춘 분이 주택담보대출을 갚으면서 이용하는 방식이에요.',
        fit: '대출 상환과 우대 혜택을 모두 챙기고 싶은 분께 맞아요.',
        payTypes: '정액형',
      })
    }
  }

  // ── 걱정 해소 카드 (faq.json 근거) ──
  const faqs = loadFaqs()
  const tagOf: Partial<Record<Concern, string>> = {
    inheritance: 'inheritance',
    price_rise: 'price_rise',
    child_opposition: 'child_opposition',
    fees: 'fees',
    complex_process: 'complex_process',
  }
  const concernCards: ConcernCard[] = input.concerns
    .filter((c) => c !== 'other')
    .map((c) => ({
      concern: c,
      label: CONCERN_LABEL[c],
      faqs: faqs.filter((f) => f.concern_tags.includes(tagOf[c] ?? '')).slice(0, 2),
    }))

  return {
    age: youngest,
    ownerAge,
    spouseAge,
    ageUsed,
    ageNote,
    priceEok,
    overall,
    checks,
    prefEligible,
    base,
    pref,
    maxWithdrawalWon: std.maxWithdrawal,
    loanLimit90Won: loanLimit90,
    loanState,
    products,
    methods,
    concernCards,
  }
}
