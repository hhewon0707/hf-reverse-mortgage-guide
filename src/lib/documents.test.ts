import { describe, expect, it } from 'vitest'
import { DEFAULT_INPUT, estimate, type FindInput } from './estimate'
import { buildDocuments, buildSummary, summaryToText } from './documents'

const base: FindInput = { ...DEFAULT_INPUT, ownerBirth: '1956-01-01' }
const level = (inp: FindInput, id: string) => {
  const docs = buildDocuments(inp, estimate(inp))
  return docs.find((d) => d.id === id)!.level
}

describe('제출서류 조건 분기', () => {
  it('신탁방식이면 지방세납세증명서가 필수, 저당권이면 해당 없음', () => {
    expect(level({ ...base, collateral: 'trust' }, 'localtax')).toBe('required')
    expect(level({ ...base, collateral: 'mortgage' }, 'localtax')).toBe('na')
    expect(level({ ...base, collateral: 'undecided' }, 'localtax')).toBe('maybe')
  })
  it('오피스텔이면 지방세세목별 과세증명서가 필수', () => {
    expect(level({ ...base, houseKind: 'officetel' }, 'localtax2')).toBe('required')
    expect(level(base, 'localtax2')).toBe('na')
  })
  it('우대형 요건이면 기초연금수급 확인서가 필수', () => {
    expect(level({ ...base, basicPension: true, priceManwon: 20000 }, 'basicpension')).toBe('required')
    expect(level(base, 'basicpension')).toBe('na')
  })
  it('공동소유면 초본·인감증명서가 부부 각각', () => {
    const inp = { ...base, ownership: 'joint' as const }
    const docs = buildDocuments(inp, estimate(inp))
    expect(docs.find((d) => d.id === 'abstract')!.qty).toBe('부부 각 1부')
    expect(docs.find((d) => d.id === 'seal')!.qty).toBe('부부 각 2부')
  })
  it('요약서에 참고용 문구와 체크 상태가 담긴다', () => {
    const r = estimate(base)
    const docs = buildDocuments(base, r)
    const txt = summaryToText(buildSummary(base, r, docs, new Set(['deed']), 'parent'))
    expect(txt).toContain('공식 심사 확정 서류가 아닌 사전 상담 참고용 요약지')
    expect(txt).toContain('☑ [필수] 등기권리증 원본')
  })
})
