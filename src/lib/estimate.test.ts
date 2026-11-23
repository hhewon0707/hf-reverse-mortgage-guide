import { describe, expect, it } from 'vitest'
import { DEFAULT_INPUT, calcAge, estimate, tableLookup, type FindInput } from './estimate'

describe('tableLookup (2026.6 일람표)', () => {
  it('표에 있는 값은 그대로 반환한다 (70세·3억·일반)', () => {
    const r = tableLookup('general', 'standard', 70, 3)
    expect(Math.round(r.monthly)).toBe(923000)
  })
  it('표 사이 가격은 선형 보간한다 (70세·3.5억)', () => {
    const r = tableLookup('general', 'standard', 70, 3.5)
    expect(Math.round(r.monthly)).toBe(Math.round((923000 + 1231000) / 2))
  })
  it('오피스텔은 일반주택보다 적다', () => {
    expect(tableLookup('officetel', 'standard', 70, 3).monthly).toBeLessThan(
      tableLookup('general', 'standard', 70, 3).monthly
    )
  })
  it('우대형은 일반형보다 많다 (70세·2억)', () => {
    expect(tableLookup('general', 'preferential', 70, 2).monthly).toBeGreaterThan(
      tableLookup('general', 'standard', 70, 2).monthly
    )
  })
})

describe('calcAge', () => {
  it('만 나이를 계산한다', () => {
    expect(calcAge('1960-06-15', new Date('2026-06-14'))).toBe(65)
    expect(calcAge('1960-06-15', new Date('2026-06-15'))).toBe(66)
    expect(calcAge('invalid')).toBeNull()
  })
})

describe('estimate 샘플 5건', () => {
  const base: FindInput = { ...DEFAULT_INPUT, ownerBirth: '1956-01-01' }
  const cases: [string, FindInput][] = [
    ['단독 70세 3억', base],
    ['부부(연소자 63세) 4억', { ...base, hasSpouse: true, spouseBirth: '1963-01-01', priceManwon: 40000 }],
    ['기초연금 2억 우대', { ...base, basicPension: true, priceManwon: 20000, publicPriceManwon: 20000 }],
    ['대출 1억 5억집', { ...base, priceManwon: 50000, loanManwon: 10000 }],
    ['오피스텔 3억', { ...base, houseKind: 'officetel' }],
  ]
  for (const [name, inp] of cases) {
    it(name, () => {
      const r = estimate(inp)
      console.log(name, '→ 연령', r.ageUsed, '월', Math.round(r.base.monthly), r.pref ? `우대 ${Math.round(r.pref.monthly)}` : '', r.loanState)
      expect(r.base.monthly).toBeGreaterThan(0)
      expect(r.base.min).toBeLessThan(r.base.max)
    })
  }
  it('12억 초과 1주택은 가입 어려움으로 판정', () => {
    expect(estimate({ ...base, publicPriceManwon: 150000 }).overall).toBe('unlikely')
  })
  it('12억 초과 2주택은 조건부', () => {
    expect(estimate({ ...base, publicPriceManwon: 150000, houseCount: 2 }).overall).toBe('conditional')
  })
})
