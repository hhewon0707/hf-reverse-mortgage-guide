/**
 * 시연용 규칙 기반 챗봇. 아래 2개 Q&A와 키워드만 사용하며 외부 API·서버가 필요 없다.
 */
export interface QA {
  id: number
  chip: string
  question: string
  answer: string
  keywords: string[]
}

export const QA_LIST: QA[] = [
  {
    id: 1,
    chip: '치매·성년후견제도',
    question: '치매를 앓고 계신데 주택연금에 가입 가능할까요?',
    answer:
      '치매 등으로 인해 의사 능력이나 행위 능력이 부족하신 경우에는 ‘성년후견제도’를 이용하여 가입하실 수 있습니다. 법원에 청구하여 후견인으로 지정되면, 그 후견인을 통해 가입 절차를 진행하게 됩니다.',
    keywords: ['치매', '의사능력', '의사 능력', '행위능력', '행위 능력', '성년후견', '후견인', '법원'],
  },
  {
    id: 2,
    chip: '주택담보대출 상환',
    question: '주택담보대출이 있어도 주택연금 가입 가능한가요?',
    answer:
      '가능합니다. 기존의 주택담보대출을 상환하시는 조건으로 가입할 수 있습니다. ‘인출한도’를 설정하여 초기 인출금으로 선순위 대출을 상환하시면 됩니다.',
    keywords: ['담보대출', '주택담보대출', '대출', '인출한도', '선순위'],
  },
]

export const FALLBACK_TEXT =
  '시연용 챗봇으로 제공된 2가지 자주 하는 질문(치매·성년후견제도, 주택담보대출 상환) 범위에 해당하는 내용만 안내할 수 있습니다. 자세한 내용은 한국주택금융공사 공식 홈페이지(https://www.hf.go.kr/ko/sub03/sub03_02_05_04.do) 또는 지사 상담을 통해 확인해 주세요.'

export const GREETING = '안녕하세요. HF주택연금 비서입니다. 주택연금에 대해 궁금한 점을 입력해 주세요.'

export interface ChatAnswer {
  matched: QA | null
  text: string
}

function compact(value: string) {
  return value.replace(/\s+/g, '')
}

export function answerQuestion(input: string): ChatAnswer {
  const q = input.trim()
  if (!q) return { matched: null, text: FALLBACK_TEXT }

  const compactQ = compact(q)
  let best: QA | null = null
  let bestCount = 0
  let bestLen = 0

  for (const qa of QA_LIST) {
    const seen = new Set<string>()
    let count = 0
    let len = 0
    for (const keyword of qa.keywords) {
      const compactKeyword = compact(keyword)
      if (!compactKeyword || seen.has(compactKeyword) || !compactQ.includes(compactKeyword)) continue
      seen.add(compactKeyword)
      count += 1
      len += compactKeyword.length
    }
    if (count > bestCount || (count === bestCount && count > 0 && len > bestLen)) {
      best = qa
      bestCount = count
      bestLen = len
    }
  }

  if (best && bestCount > 0) return { matched: best, text: best.answer }
  return { matched: null, text: FALLBACK_TEXT }
}
