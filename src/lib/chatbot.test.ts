import { describe, expect, it } from 'vitest'
import { FALLBACK_TEXT, QA_LIST, answerQuestion } from './chatbot'

describe('챗봇: 제공된 2개 Q&A 키워드만 답한다', () => {
  it('Q&A 목록은 2개만 제공한다', () => {
    expect(QA_LIST).toHaveLength(2)
  })

  it('원문 질문은 각각 자기 공식 답변으로 매칭된다', () => {
    for (const qa of QA_LIST) {
      const result = answerQuestion(qa.question)
      expect(result.matched?.id).toBe(qa.id)
      expect(result.text).toBe(qa.answer)
    }
  })

  const cases: [string, number][] = [
    ['아버지가 치매인데 가입할 수 있나요', 1],
    ['의사 능력이 부족합니다', 1],
    ['행위능력 확인이 필요합니다', 1],
    ['성년후견 신청을 하려고 합니다', 1],
    ['후견인을 법원에서 지정받았어요', 1],
    ['주택담보대출이 남아 있어요', 2],
    ['담보대출을 갚아야 하나요', 2],
    ['대출이 있어도 될까요', 2],
    ['인출한도로 선순위를 갚을 수 있나요', 2],
  ]
  for (const [q, id] of cases) {
    it(`"${q}" → Q${id} 공식 답변`, () => {
      const qa = QA_LIST.find((item) => item.id === id)
      const result = answerQuestion(q)
      expect(result.matched?.id).toBe(id)
      expect(result.text).toBe(qa?.answer)
    })
  }

  it('키워드가 더 많이 겹치면 그 질문을 고른다', () => {
    expect(answerQuestion('치매로 후견인을 법원에서 지정받았어요').matched?.id).toBe(1)
    expect(answerQuestion('주택담보대출을 인출한도로 선순위 상환할 수 있나요').matched?.id).toBe(2)
  })

  const outOfScope = [
    '무상거주자가 살고 있어요',
    '보증기관과 은행 중 어디인가요',
    '근저당이 너무 커요',
    '오늘 날씨 어때?',
    '월 수령액은 얼마인가요',
    '주담대라는 말만 했어요',
    '후견 제도가 궁금해요',
    '',
    '   ',
  ]
  for (const q of outOfScope) {
    it(`범위 밖 "${q}" → 정해진 안내 문구`, () => {
      const result = answerQuestion(q)
      expect(result.matched).toBeNull()
      expect(result.text).toBe(FALLBACK_TEXT)
    })
  }
})
