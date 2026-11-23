import Papa from 'papaparse'
import paymentTableRaw from '../../data/payment_table.csv?raw'
import stageDurationRaw from '../../data/stage_duration.csv?raw'
import rulesJson from '../../data/rules.json'
import faqJson from '../../data/faq.json'
import type {
  EffectiveDate,
  FaqItem,
  HousingType,
  PaymentTableRow,
  PlanType,
  StageDurationRow,
} from '../types/pension'

let cachedPaymentTable: PaymentTableRow[] | null = null
let cachedStageDurations: StageDurationRow[] | null = null

export function loadPaymentTable(): PaymentTableRow[] {
  if (cachedPaymentTable) return cachedPaymentTable

  const parsed = Papa.parse<Record<string, string>>(paymentTableRaw.trim(), {
    header: true,
    skipEmptyLines: true,
  })

  cachedPaymentTable = parsed.data.map((row) => ({
    effective_date: row.effective_date as EffectiveDate,
    housing_type: row.housing_type as HousingType,
    plan_type: row.plan_type as PlanType,
    age: Number(row.age),
    house_price_eok: Number(row.house_price_eok),
    monthly_payment_won: Number(row.monthly_payment_won),
    max_withdrawal_won: Number(row.max_withdrawal_won),
  }))

  return cachedPaymentTable
}

export function loadRules() {
  return rulesJson
}

export function loadFaqs(): FaqItem[] {
  return faqJson as FaqItem[]
}

export function getFaqsByConcern(concernId: string): FaqItem[] {
  return loadFaqs().filter((item) => item.concern_tags.includes(concernId))
}

export function loadStageDurations(): StageDurationRow[] {
  if (cachedStageDurations) return cachedStageDurations

  const parsed = Papa.parse<Record<string, string>>(stageDurationRaw.trim(), {
    header: true,
    skipEmptyLines: true,
  })

  cachedStageDurations = parsed.data.map((row) => ({
    stage: Number(row.stage),
    stage_name: row.stage_name,
    median_days: Number(row.median_days),
    min_days: Number(row.min_days),
    max_days: Number(row.max_days),
    description: row.description,
    required_docs: row.required_docs
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    is_sample: row.is_sample === 'true',
  }))

  return cachedStageDurations
}
