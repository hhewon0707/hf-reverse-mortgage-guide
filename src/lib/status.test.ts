import { describe, expect, it } from 'vitest'
import {
  ALL_STEPS,
  STAGES,
  addBusinessDays,
  buildCurrentPositionSentence,
  buildShareText,
  buildSubStepAriaLabel,
  groupDocsByIssuer,
  lookupApplication,
  normalizeCode,
} from './status'

describe('진행 현황 도메인 모델 및 조회 로직', () => {
  const fixedToday = new Date(2026, 10, 24) // 2026-11-24 (화)

  it('공식 3단계 및 12개 세부 단계 ID·이름·순서를 정확히 유지한다', () => {
    expect(STAGES).toHaveLength(3)
    expect(STAGES.map((s) => s.simpleTitle)).toEqual([
      '① 가입상담·접수',
      '② 심사·보증서 발급',
      '③ 대출 실행',
    ])
    expect(ALL_STEPS.map((s) => [s.id, s.name, s.actor])).toEqual([
      ['s1-1', '상담·신청서 작성', 'customer'],
      ['s1-2', '서류 준비', 'customer'],
      ['s2-1', '상담(저당권방식·신탁방식)', 'hf'],
      ['s2-2', '시세확인(감정평가 의뢰)', 'hf'],
      ['s2-3', '담보주택 조사', 'hf'],
      ['s2-4', '보증심사 및 승인', 'hf'],
      ['s2-5', '보증서 발급(금융기관 통지)', 'hf'],
      ['s2-6', '고객 은행 방문 통지', 'hf'],
      ['s3-1', '보증서 내용 조회(전문통지)', 'bank'],
      ['s3-2', '대출약정(신분증, 등본 1부, 도장)', 'customer'],
      ['s3-3', '월 지급 및 개별인출금 수령(선순위 대출 상환)', 'bank'],
      ['s3-4', '비용 정산(인지세, 등기비용 등, 감정평가비)', 'bank'],
    ])
  })

  it('대소문자 무시·공백 제거 및 별칭으로 조회할 수 있고 잘못된 코드는 null을 반환한다', () => {
    expect(normalizeCode(' hf-2026-demo01 ')).toBe('HF-2026-DEMO01')
    expect(lookupApplication('  hf-2026-demo01  ', fixedToday)?.code).toBe('HF-2026-DEMO01')
    expect(lookupApplication('HF-2024-DEMO02', fixedToday)?.code).toBe('HF-2026-DEMO02')
    expect(lookupApplication('demo03', fixedToday)?.code).toBe('HF-2026-DEMO03')
    expect(lookupApplication('HF-2026-UNKNOWN', fixedToday)).toBeNull()
    expect(lookupApplication('   ', fixedToday)).toBeNull()
  })

  it('영업일 계산은 주말(토·일)을 건너뛴다', () => {
    const friday = new Date(2026, 10, 27) // 2026-11-27 (금)
    const nextBiz = addBusinessDays(friday, 1)
    expect(nextBiz.getFullYear()).toBe(2026)
    expect(nextBiz.getMonth()).toBe(10)
    expect(nextBiz.getDate()).toBe(30) // 월요일
  })

  it('시연 사례 3종은 각각 정상(공사)·보완(고객)·지연(금융기관) 상태와 범위 완료일을 반환한다', () => {
    const demo1 = lookupApplication('HF-2026-DEMO01', fixedToday)!
    expect(demo1.currentStep.id).toBe('s2-4')
    expect(demo1.currentRecord.status).toBe('active')
    expect(demo1.currentStep.actor).toBe('hf')
    expect(demo1.completedCount).toBe(5)
    expect(demo1.remainingMinDays).toBeLessThan(demo1.remainingMaxDays)
    expect(demo1.expectedMinDate < demo1.expectedMaxDate).toBe(true)
    expect(buildCurrentPositionSentence(demo1)).toBe('지금은 ② 공사 — 보증심사 및 승인 단계예요.')

    const demo2 = lookupApplication('HF-2026-DEMO02', fixedToday)!
    expect(demo2.currentStep.id).toBe('s1-2')
    expect(demo2.currentRecord.status).toBe('needsAction')
    expect(demo2.currentStep.actor).toBe('customer')
    expect(demo2.completedCount).toBe(1)
    expect(demo2.supplementDocs.length).toBeGreaterThan(0)
    expect(demo2.remainingMinDays).toBeLessThan(demo2.remainingMaxDays)

    const demo3 = lookupApplication('HF-2026-DEMO03', fixedToday)!
    expect(demo3.currentStep.id).toBe('s3-1')
    expect(demo3.currentRecord.status).toBe('delayed')
    expect(demo3.currentStep.actor).toBe('bank')
    expect(demo3.completedCount).toBe(8)
    expect(demo3.reasonCode).toBe('BANK_REVIEW_DELAY')
    expect(demo3.remainingMinDays).toBeLessThan(demo3.remainingMaxDays)
  })

  it('aria-label, 서류 발급처 그룹화, 개인정보 없는 공유 문구를 올바르게 생성한다', () => {
    const demo1 = lookupApplication('HF-2026-DEMO01', fixedToday)!
    const aria = buildSubStepAriaLabel(demo1.currentStep, demo1.currentRecord)
    expect(aria).toBe('보증심사 및 승인, 진행 중, 시작한 지 2일째, 담당 공사, 예상 2~4영업일')

    const s12 = ALL_STEPS.find((s) => s.id === 's1-2')!
    const grouped = groupDocsByIssuer(s12.docs)
    expect(grouped['주민센터'].length).toBeGreaterThan(0)
    expect(grouped['금융기관'].length).toBeGreaterThan(0)
    expect(grouped['본인 준비'].length).toBeGreaterThan(0)

    const shareText = buildShareText(demo1)
    expect(shareText).toContain('HF-2026-DEMO01')
    expect(shareText).toContain('보증심사 및 승인')
    expect(shareText).toContain('개인정보')
  })
})
