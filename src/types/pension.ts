export type EffectiveDate = '2026-06' | '2024-03'
export type HousingType = 'general' | 'officetel'
export type PlanType = 'standard' | 'preferential'
export type UserMode = 'self' | 'child'
export type BequestPref = 'want' | 'neutral' | 'max_income'

export type ConcernId =
  | 'inheritance'
  | 'price_rise'
  | 'longevity'
  | 'child_opposition'
  | 'fees'
  | 'complex_process'
  | 'other'

export interface PaymentTableRow {
  effective_date: EffectiveDate
  housing_type: HousingType
  plan_type: PlanType
  age: number
  house_price_eok: number
  monthly_payment_won: number
  max_withdrawal_won: number
}

export interface StageDurationRow {
  stage: number
  stage_name: string
  median_days: number
  min_days: number
  max_days: number
  description: string
  required_docs: string[]
  is_sample: boolean
}

export interface FaqItem {
  id: string
  category: string
  concern_tags: string[]
  question: string
  summary: string
  answer: string
  keywords: string[]
  source: string
  verified: boolean
  needs_verification: boolean
}

export interface EstimateInput {
  age: number
  spouseAge?: number | null
  housePriceManwon: number // 만원 단위 (예: 30000 = 3억원)
  loanBalanceManwon: number // 만원 단위 (예: 5000 = 5천만원)
  desiredMonthlyManwon?: number // 만원 단위 (선택)
  housingType?: HousingType
  planType?: PlanType
  effectiveDate?: EffectiveDate
  bequestPref?: BequestPref
  stayPref?: boolean
}

export interface PayoutComparison {
  id: 'lifetime' | 'mixed' | 'fixed_15y'
  name: string
  monthlyMinWon: number
  monthlyMaxWon: number
  monthlyBaseWon: number
  withdrawalLimitWon: number
  feature: string
  suitableFor: string
  verified: boolean
  note?: string
}

export interface PriceScenarioResult {
  id: 'up' | 'flat' | 'down'
  label: string
  annualGrowthRate: number
  simulationYears: number
  projectedHouseValueWon: number
  totalCashReceivedWon: number
  estimatedDebtBalanceWon: number
  netInheritanceWon: number
  shortfallWaivedWon: number
}

export interface SettlementSimulation {
  simulationYears: number
  assumedAnnualRate: number
  verified: boolean
  initialHouseValueWon: number
  totalCashReceivedWon: number
  estimatedRepaymentWon: number
  scenarios: {
    up: PriceScenarioResult
    flat: PriceScenarioResult
    down: PriceScenarioResult
  }
}

export interface AlternativeComparison {
  id: 'reverse_mortgage' | 'sell_and_move' | 'hold'
  title: string
  monthlyCashflowSummary: string
  housingStability: string
  inheritanceImpact: string
  considerations: string[]
}

export interface EstimateResult {
  eligible: boolean
  eligibilityWarnings: string[]
  effectiveAge: number
  effectiveDate: EffectiveDate
  housingType: HousingType
  planType: PlanType
  appliedPlanType: PlanType
  tableBaseMonthlyWon: number
  tableMaxWithdrawalWon: number
  monthlyBaseWon: number
  monthlyMinWon: number
  monthlyMaxWon: number
  availableExtraWithdrawalWon: number
  loanStatus: 'none' | 'within_standard_limit' | 'needs_loan_repayment_plan' | 'exceeds_max_limit'
  loanStatusMessage: string
  desiredMonthlyGapWon: number | null
  payoutComparisons: PayoutComparison[]
  priceScenarios: PriceScenarioResult[]
  settlement: SettlementSimulation
  alternatives: AlternativeComparison[]
  privacyBands: {
    ageBand: string
    housePriceBand: string
    loanBand: string
  }
  disclaimer: string
}
