import {
  CONCERN_LABEL,
  fmtMan,
  fmtWon,
  type FindInput,
  type FindResult,
} from './estimate'
import type { Mode } from '../context/ModeContext'

export type DocLevel = 'required' | 'maybe' | 'na'

export interface DocItem {
  id: string
  name: string
  qty: string
  level: DocLevel
  reason: string
  details: string[]
}

export interface DocNote {
  text: string
  highlight: boolean
}

/** 내 조건에 따라 제출서류 목록(필수/해당 가능/해당 없음)을 계산한다. */
export function buildDocuments(input: FindInput, r: FindResult): DocItem[] {
  const joint = input.ownership === 'joint'
  const spouse = input.hasSpouse
  const trust = input.collateral === 'trust'
  const mortgage = input.collateral === 'mortgage'
  const undecided = input.collateral === 'undecided'
  const officetel = input.houseKind === 'officetel'

  const docs: DocItem[] = []

  docs.push({
    id: 'resident',
    name: '주민등록등본',
    qty: '2부 (공사 1부 · 은행 1부)',
    level: 'required',
    reason: '신청 시 기본 제출 서류예요.',
    details: [
      spouse
        ? '배우자가 다른 세대로 되어 있으면 배우자 등본이 따로 필요한지 확인하세요.'
        : '배우자가 없어 배우자 등본은 해당하지 않아요.',
      '행정정보 공동이용 사전동의서를 제출하면 공사가 직접 발급할 수 있어요.',
    ],
  })

  docs.push({
    id: 'abstract',
    name: '주민등록초본',
    qty: joint ? '부부 각 1부' : '1부',
    level: 'required',
    reason: joint ? '공동소유라 부부 각각 1부가 필요해요.' : '신청 시 기본 제출 서류예요.',
    details: [
      '주소변동내역이 포함된 초본이어야 해요.',
      input.overseas ? '재외국민이라 초본 1부가 추가로 필요해요.' : '재외국민인 경우 초본 1부가 추가로 필요해요.',
    ],
  })

  docs.push({
    id: 'jeonip',
    name: '전입세대확인서',
    qty: '1부 (공사 제출용)',
    level: 'required',
    reason: '신청 시 기본 제출 서류예요.',
    details: [],
  })

  docs.push({
    id: 'seal',
    name: '인감증명서',
    qty: joint ? '부부 각 2부' : '2부',
    level: 'required',
    reason: joint ? '공동소유라 부부 각각 2부가 필요해요.' : '신청 시 기본 제출 서류예요.',
    details: [
      '보증약정을 직접 서명(자서)으로 하면 1부를 생략할 수 있어요.',
      '본인서명사실확인서 또는 전자본인서명확인서로 대체할 수 있어요.',
    ],
  })

  docs.push({
    id: 'family',
    name: '가족관계증명서',
    qty: trust ? (spouse ? '부부 각 1부' : '1부') : mortgage ? (joint ? '부부 각 1부' : '1부 (확인 필요)') : '1부 이상',
    level: trust || (mortgage && joint) ? 'required' : 'maybe',
    reason: trust
      ? '신탁방식은 배우자가 있으면 부부 각 1부가 필요해요.'
      : mortgage
        ? joint
          ? '저당권방식 + 공동소유라 부부 각 1부가 필요해요.'
          : '저당권방식은 공동소유일 때 부부 각 1부가 필요해요. 단독소유는 상담에서 확인하세요.'
        : '담보방식에 따라 달라져요. 저당권방식은 공동소유 부부 각 1부, 신탁방식은 배우자가 있으면 부부 각 1부예요.',
    details: [],
  })

  docs.push({
    id: 'localtax',
    name: '지방세납세증명서',
    qty: joint ? '부부 각 1부 (등기소 1부 · 심사용)' : '1부 (등기소 1부 · 심사용)',
    level: trust ? 'required' : undecided ? 'maybe' : 'na',
    reason: trust
      ? '신탁방식 신청 시에 필요해요.'
      : undecided
        ? '신탁방식을 선택하면 필요해요.'
        : '저당권방식에서는 필요하지 않아요. (신탁방식 신청 시에 한함)',
    details: ['공동소유라면 각각 1부가 필요해요.'],
  })

  docs.push({
    id: 'localtax2',
    name: '지방세세목별 과세증명서',
    qty: '1부',
    level: officetel ? 'required' : 'na',
    reason: officetel ? '주거목적 오피스텔 신청 시에 필요해요.' : '오피스텔 신청 시에만 필요해요.',
    details: [],
  })

  docs.push({
    id: 'basicpension',
    name: '기초연금수급 확인서',
    qty: '1부',
    level: r.prefEligible ? 'required' : 'na',
    reason: r.prefEligible
      ? '우대형 신청 시에 필요해요.'
      : '우대형 신청 시에만 필요해요. (현재 입력 기준 우대형 요건에 해당하지 않아요)',
    details: [],
  })

  docs.push({
    id: 'deed',
    name: '등기권리증 원본',
    qty: '1부',
    level: 'required',
    reason: '담보 주택의 소유를 확인하는 서류예요.',
    details: ['사용 후 돌려받아요.', '분실했다면 확인 서면으로 대신할 수 있어요.'],
  })

  return docs
}

export function buildDocNotes(input: FindInput): DocNote[] {
  return [
    { text: '방문하실 때 신분증을 꼭 가져가세요.', highlight: false },
    {
      text: '담보 주택을 임대 중이거나 임대할 계획이라면 임대 관련 서류를 따로 확인해야 해요.',
      highlight: input.rental,
    },
    {
      text: '주택담보대출·소상공인대출 상환 자금을 신청하면 추가 서류가 필요할 수 있어요.',
      highlight: input.loanManwon > 0,
    },
    { text: '지사에 방문하기 전에 사전 안내를 한 번 더 확인하세요.', highlight: false },
  ]
}

export const LEVEL_LABEL: Record<DocLevel, string> = {
  required: '필수',
  maybe: '해당 가능',
  na: '해당 없음',
}

// ───────────── 사전 상담 요약서 ─────────────

export interface SummarySection {
  title: string
  rows?: [string, string][]
  list?: { mark: string; text: string; sub?: string }[]
  note?: string
}

export interface SummaryData {
  title: string
  banner: string
  generatedAt: string
  sections: SummarySection[]
  disclaimer: string
}

const HOUSE_KIND: Record<FindInput['houseKind'], string> = {
  house: '주택법 제2조제1호 주택',
  senior: '노인복지주택',
  officetel: '주거목적 오피스텔',
}
const RESIDENCE = { living: '실제 거주 중', exception: '거주하지 않음 (예외 사유 확인 필요)', unsure: '잘 모르겠음' }
const STAY = { stay: '계속 거주하고 싶음', move: '이사 가능성 있음', unsure: '아직 정하지 못함' }
const BEQUEST = { want: '집을 물려주고 싶음', neutral: '상관없음', max_income: '최대한 많이 받고 싶음' }
const COLLATERAL = { mortgage: '저당권방식', trust: '신탁방식', undecided: '아직 정하지 않음' }
const CHECK_ICON = { ok: '✅', warn: '⚠️', ng: '⛔', info: 'ℹ️' }

export function buildSummary(
  input: FindInput,
  r: FindResult,
  docs: DocItem[],
  checked: Set<string>,
  mode: Mode,
  today = new Date()
): SummaryData {
  const mon = r.pref ?? r.base
  const concerns = input.concerns
    .map((c) => (c === 'other' ? `기타${input.concernOther ? `(${input.concernOther})` : ''}` : CONCERN_LABEL[c]))
    .join(', ')

  const conditions: [string, string][] = [
    ['상담 대상', input.target === 'self' ? '본인' : '부모님 (자녀가 대신 입력)'],
    ['화면 모드', mode === 'parent' ? '부모세대 모드' : '자녀세대 모드'],
    ['주택 소유자 생년월일', `${input.ownerBirth || '미입력'}${r.ownerAge !== null ? ` (만 ${r.ownerAge}세)` : ''}`],
    ['배우자', input.hasSpouse ? `있음 · ${input.spouseBirth || '미입력'}${r.spouseAge !== null ? ` (만 ${r.spouseAge}세)` : ''}` : '없음'],
    ['계산 기준 연령(연소자)', `만 ${r.ageUsed}세`],
    ['주택 구분', `${HOUSE_KIND[input.houseKind]}${input.houseKind === 'house' && input.isApartment ? ' · 아파트' : ''}${input.lowestFloor ? ' · 최저층' : ''}`],
    ['주택 가격(시세 참고)', fmtMan(input.priceManwon)],
    ['보유 주택 수', input.houseCount === 3 ? '3채 이상' : `${input.houseCount}채`],
    ['부부합산 공시가격', fmtMan(input.publicPriceManwon)],
    ['소유 형태', input.ownership === 'joint' ? '공동소유 (부부 공동명의)' : '단독소유'],
    ['희망 담보방식', COLLATERAL[input.collateral]],
    ['거주 요건', RESIDENCE[input.residence]],
    ['계약 능력', input.capacity === 'ok' ? '문제 없음' : '판단이 어려운 부분 있음 (성년후견제도 안내 필요)'],
    ['기초연금 수급', input.basicPension ? '수급권자' : '해당 없음 / 모름'],
    ['주택담보대출 잔액', input.loanManwon > 0 ? fmtMan(input.loanManwon) : '없음'],
    ['계속 거주 의향', STAY[input.stay]],
    ['상속 선호', BEQUEST[input.bequest]],
    ['걱정되는 것', concerns || '선택 없음'],
  ]
  if (input.overseas) conditions.push(['재외국민', '해당'])
  if (input.rental) conditions.push(['담보주택 임대', '임대 중 또는 계획 있음'])

  const loanText = {
    none: '대출 없음',
    within_50: '대출 잔액이 인출한도(대출한도의 50%) 이내',
    within_90: '대출한도의 50% 초과~90% 이하 → 대출 상환용 이용 가능',
    over_90: '대출한도의 90% 초과 → 일부 직접 상환 필요 가능',
  }[r.loanState]

  const result: SummarySection = {
    title: '2. 맞춤 추천 결과 (참고용 시뮬레이션)',
    rows: [
      ['가입 요건 종합', { ok: '큰 문제 없어 보임', conditional: '추가 확인 필요 항목 있음', unlikely: '가입이 어려울 수 있는 항목 있음' }[r.overall]],
      [`예상 월 수령액 (${r.pref ? '우대형' : '일반형'} · 종신지급)`, `${fmtWon(mon.min)} ~ ${fmtWon(mon.max)} (약 ${fmtWon(mon.monthly)})`],
      ['최대 인출한도(대출한도 50% 기준)', fmtWon(r.maxWithdrawalWon)],
      ['대출 상태', loanText],
      ['추천 상품', r.products.filter((p) => p.status === 'recommend').map((p) => p.name).join(', ') || '해당 없음'],
      ['검토 상품', r.products.filter((p) => p.status === 'consider').map((p) => p.name).join(', ') || '해당 없음'],
      [
        '추천 지급방식',
        r.methods
          .filter((m) => m.recommended)
          .map((m) => `${m.name}${m.monthlyWon !== null ? ` (월 약 ${fmtWon(m.monthlyWon)}${m.estimated ? ', 참고 추정' : ''})` : ''}`)
          .join(', ') || '상담에서 확인',
      ],
    ],
    list: r.checks.map((c) => ({ mark: CHECK_ICON[c.status], text: c.label, sub: c.detail })),
    note: '일람표(2026.6.1 신청 접수분) 기준 참고 계산이며 최종 조건은 공사 심사 결과에 따릅니다.',
  }

  const required = docs.filter((d) => d.level === 'required')
  const maybe = docs.filter((d) => d.level === 'maybe')
  const docSection: SummarySection = {
    title: `3. 제출서류 체크리스트 (필수 ${required.length}개 · 해당 가능 ${maybe.length}개)`,
    list: [...required, ...maybe].map((d) => ({
      mark: checked.has(d.id) ? '☑' : '☐',
      text: `[${LEVEL_LABEL[d.level]}] ${d.name} — ${d.qty}`,
      sub: [d.reason, ...d.details].join(' / '),
    })),
    note:
      docs.filter((d) => d.level === 'na').length > 0
        ? `내 조건에서 해당 없음: ${docs.filter((d) => d.level === 'na').map((d) => d.name).join(', ')}`
        : undefined,
  }

  const notes = buildDocNotes(input)
  const noteSection: SummarySection = {
    title: '4. 유의사항',
    list: notes.map((n) => ({ mark: n.highlight ? '★' : '•', text: n.text })),
  }

  return {
    title: '주택연금 사전 상담 요약서',
    banner: '공식 심사 확정 서류가 아닌 사전 상담 참고용 요약지입니다.',
    generatedAt: today.toLocaleString('ko-KR'),
    sections: [{ title: '1. 입력하신 조건', rows: conditions }, result, docSection, noteSection],
    disclaimer:
      '이 요약지는 내 기기에서만 만들어지며 서버로 전송되지 않습니다. 모든 수치는 참고용 시뮬레이션이고, 실제 가입 여부와 조건은 한국주택금융공사 심사 결과에 따라 달라질 수 있습니다. (시연용 프로토타입)',
  }
}

export function summaryToText(d: SummaryData): string {
  const lines: string[] = [d.title, '='.repeat(30), `※ ${d.banner}`, `작성일시: ${d.generatedAt}`, '']
  for (const s of d.sections) {
    lines.push(`■ ${s.title}`)
    s.rows?.forEach(([k, v]) => lines.push(`  - ${k}: ${v}`))
    s.list?.forEach((it) => {
      lines.push(`  ${it.mark} ${it.text}`)
      if (it.sub) lines.push(`      ${it.sub}`)
    })
    if (s.note) lines.push(`  ※ ${s.note}`)
    lines.push('')
  }
  lines.push(d.disclaimer)
  return lines.join('\r\n')
}
