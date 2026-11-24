/**
 * 진행 현황(/status) 도메인 모델 및 시연용 조회 데이터.
 * 공사 홈페이지 "신청절차" 안내(확인일 2026-11-23) 3단계 · 12세부단계 기준.
 * 개인 식별정보(이름·전화번호·주민번호·주소)는 수집·저장하지 않는다.
 */

export type Actor = 'customer' | 'hf' | 'bank'

export type StepStatus = 'done' | 'active' | 'upcoming' | 'delayed' | 'needsAction'

export type DocIssuer = '주민센터' | '금융기관' | '본인 준비'

export type ReasonCode =
  | 'DOC_SUPPLEMENT_REQUIRED'
  | 'BANK_REVIEW_DELAY'
  | 'APPRAISAL_DELAY'

export interface StageDocItem {
  id: string
  name: string
  qty: string
  issuer: DocIssuer
  note?: string
  condition?: string
}

export interface SubStepDef {
  id: string
  stageNum: 1 | 2 | 3
  order: number
  name: string
  actor: Actor
  minDays: number
  maxDays: number
  description: string
  customerActionHint: string
  docs: StageDocItem[]
  nextDocsStepId?: string
}

export interface StageGroupDef {
  stageNum: 1 | 2 | 3
  symbol: '①' | '②' | '③'
  simpleTitle: string
  officialTitle: string
  actor: Actor
  steps: SubStepDef[]
}

export interface SubStepRecord {
  stepId: string
  status: StepStatus
  startedAt?: string
  completedAt?: string
  elapsedDays?: number
}

export interface DemoCaseSpec {
  code: string
  aliases: string[]
  label: string
  summaryTag: string
  currentStepId: string
  reasonCode?: ReasonCode
  supplementDocs?: StageDocItem[]
  records: Record<string, Omit<SubStepRecord, 'stepId' | 'startedAt' | 'completedAt'> & { startOffset?: number; endOffset?: number }>
}

export interface ApplicationStatus {
  code: string
  label: string
  summaryTag: string
  currentStage: StageGroupDef
  currentStep: SubStepDef
  currentRecord: SubStepRecord
  completedCount: number
  totalCount: number
  remainingMinDays: number
  remainingMaxDays: number
  expectedMinDate: string
  expectedMaxDate: string
  reasonCode?: ReasonCode
  reasonMessage?: string
  supplementDocs: StageDocItem[]
  recordsByStepId: Record<string, SubStepRecord>
}

export const SAMPLE_DURATION_BADGE = '시연용 샘플 처리기간 — 실제 업무 데이터로 교체 예정'

export const INVALID_CODE_MESSAGE =
  '조회 코드를 찾지 못했어요. 상담 예약 때 받으신 코드를 다시 확인해 주세요'

export const CODE_FORMAT_GUIDE =
  '코드 형식: HF-연도-영문·숫자 6자리 (예: HF-2026-DEMO01)'

export const NOTIFICATION_PREP_MESSAGE = '단계가 바뀌면 알려드리는 기능은 준비 중이에요'

export const ACTOR_INFO: Record<
  Actor,
  { label: string; badge: string; summary: string }
> = {
  customer: {
    label: '고객',
    badge: '고객 차례',
    summary: '고객님이 하실 일이 있어요',
  },
  hf: {
    label: '공사',
    badge: '공사 처리 중',
    summary: '공사가 처리 중이에요. 지금 고객님이 하실 일은 없어요',
  },
  bank: {
    label: '금융기관',
    badge: '금융기관 차례',
    summary: '금융기관(은행) 차례예요',
  },
}

export const STATUS_META: Record<
  StepStatus,
  { icon: string; label: string; chipClass: string }
> = {
  done: { icon: '✓', label: '완료', chipClass: 'chip-safe' },
  active: { icon: '●', label: '진행 중', chipClass: 'chip' },
  upcoming: { icon: '○', label: '예정', chipClass: 'chip-gray' },
  delayed: { icon: '▲', label: '지연', chipClass: 'chip-warm' },
  needsAction: { icon: '!', label: '고객 조치 필요', chipClass: 'chip-warm' },
}

export const REASON_MESSAGES: Record<ReasonCode, string> = {
  DOC_SUPPLEMENT_REQUIRED:
    '제출하신 서류 중 확인이 더 필요한 항목이 있어 고객님의 서류 보완을 기다리고 있어요.',
  BANK_REVIEW_DELAY:
    '취급 금융기관(은행)의 보증서 전문 확인 및 대출 약정 일정 조율이 평소보다 조금 더 걸리고 있어요.',
  APPRAISAL_DELAY:
    '담보 주택의 시세 확인 및 감정평가 기관 배정 물량이 많아 심사가 평소보다 지연되고 있어요.',
}

const STEP_DOCS_S1_1: StageDocItem[] = [
  {
    id: 's1-1-id',
    name: '신분증',
    qty: '1부 (본인 확인용)',
    issuer: '본인 준비',
    note: '지사 방문 또는 상담 시 본인 확인을 위해 필요해요.',
  },
  {
    id: 's1-1-addr',
    name: '담보 주택 주소·기본 정보 메모',
    qty: '참고용',
    issuer: '본인 준비',
    note: '집 시세와 기존 대출 대략 금액을 알고 계시면 상담이 빨라요.',
  },
]

const STEP_DOCS_S1_2: StageDocItem[] = [
  {
    id: 'doc-resident',
    name: '주민등록등본',
    qty: '2부 (공사 1부 · 은행 1부)',
    issuer: '주민센터',
    note: '행정정보 공동이용 사전동의서를 제출하면 공사가 직접 발급할 수 있어요.',
  },
  {
    id: 'doc-abstract',
    name: '주민등록초본',
    qty: '1부 (공동소유 시 부부 각 1부)',
    issuer: '주민센터',
    note: '주소변동내역이 반드시 포함되어야 해요.',
  },
  {
    id: 'doc-jeonip',
    name: '전입세대확인서',
    qty: '1부 (공사 제출용)',
    issuer: '주민센터',
  },
  {
    id: 'doc-seal',
    name: '인감증명서',
    qty: '2부 (공동소유 시 부부 각 2부)',
    issuer: '주민센터',
    note: '본인서명사실확인서 또는 전자본인서명확인서로 대체할 수 있어요.',
  },
  {
    id: 'doc-family',
    name: '가족관계증명서',
    qty: '1부 (신탁방식·공동소유 시 부부 각 1부)',
    issuer: '주민센터',
    condition: '담보방식·소유형태에 따라 필수',
  },
  {
    id: 'doc-localtax',
    name: '지방세납세증명서',
    qty: '1부 (공동소유 시 부부 각 1부)',
    issuer: '주민센터',
    condition: '신탁방식 신청 시 필요',
  },
  {
    id: 'doc-localtax2',
    name: '지방세세목별 과세증명서',
    qty: '1부',
    issuer: '주민센터',
    condition: '주거목적 오피스텔 신청 시 필요',
  },
  {
    id: 'doc-basicpension',
    name: '기초연금수급 확인서',
    qty: '1부',
    issuer: '주민센터',
    condition: '우대형 신청 시 필요',
  },
  {
    id: 'doc-deed',
    name: '등기권리증 원본',
    qty: '1부',
    issuer: '본인 준비',
    note: '확인 후 돌려받으며, 분실 시 확인 서면으로 대체 가능해요.',
  },
  {
    id: 'doc-loan-balance',
    name: '기존 주택담보대출 잔액 확인서',
    qty: '1부',
    issuer: '금융기관',
    condition: '선순위 대출 상환(인출한도 설정) 시 필요',
  },
]

const STEP_DOCS_S3_2: StageDocItem[] = [
  {
    id: 's3-2-id',
    name: '신분증',
    qty: '본인 지참 (공동소유 시 부부 함께)',
    issuer: '본인 준비',
  },
  {
    id: 's3-2-seal',
    name: '도장 (인감도장)',
    qty: '1개',
    issuer: '본인 준비',
    note: '약정 시 본인 서명 또는 인감도장이 필요해요.',
  },
  {
    id: 's3-2-resident',
    name: '주민등록등본',
    qty: '1부',
    issuer: '주민센터',
    note: '최근 1개월 이내 발급본으로 지참하세요.',
  },
  {
    id: 's3-2-account',
    name: '연금 수령 계좌 통장 사본',
    qty: '1부',
    issuer: '금융기관',
    note: '대출 실행 은행의 본인 명의 입출금 계좌를 미리 확인하세요.',
  },
]

const STEP_DOCS_S3_3: StageDocItem[] = [
  {
    id: 's3-3-repay',
    name: '기존 대출 상환 영수증·완납 확인 안내',
    qty: '1부 (은행 처리)',
    issuer: '금융기관',
    condition: '초기 인출금으로 선순위 대출을 상환하는 경우에 해당해요.',
  },
]

export const STAGES: StageGroupDef[] = [
  {
    stageNum: 1,
    symbol: '①',
    simpleTitle: '① 가입상담·접수',
    officialTitle: '고객 — 공사(지사) 상담 (방문·전화·인터넷신청)',
    actor: 'customer',
    steps: [
      {
        id: 's1-1',
        stageNum: 1,
        order: 1,
        name: '상담·신청서 작성',
        actor: 'customer',
        minDays: 1,
        maxDays: 2,
        description:
          '한국주택금융공사 지사 방문, 전화 또는 인터넷으로 가입 조건을 상담하고 보증신청서를 작성하는 단계예요.',
        customerActionHint: '신분증을 지참해 예약하신 방법으로 상담을 진행하고 신청서를 작성해 주세요.',
        docs: STEP_DOCS_S1_1,
      },
      {
        id: 's1-2',
        stageNum: 1,
        order: 2,
        name: '서류 준비',
        actor: 'customer',
        minDays: 2,
        maxDays: 4,
        description:
          '신청에 필요한 주민등록등·초본, 인감증명서, 등기권리증 등 기본 서류를 준비해 공사에 제출하는 단계예요.',
        customerActionHint: '아래 보완·필요 서류를 확인해 주민센터나 은행에서 발급받아 제출해 주세요.',
        docs: STEP_DOCS_S1_2,
      },
    ],
  },
  {
    stageNum: 2,
    symbol: '②',
    simpleTitle: '② 심사·보증서 발급',
    officialTitle: '공사 — 보증신청접수 및 보증서발급',
    actor: 'hf',
    steps: [
      {
        id: 's2-1',
        stageNum: 2,
        order: 3,
        name: '상담(저당권방식·신탁방식)',
        actor: 'hf',
        minDays: 1,
        maxDays: 2,
        description:
          '담보 설정 방식(저당권방식 또는 신탁방식)과 월지급금 지급유형을 최종 확인해 보증 접수를 마치는 단계예요.',
        customerActionHint: '공사가 접수 내용을 확인 중이에요. 지금은 기다리시면 됩니다.',
        docs: [],
        nextDocsStepId: 's3-2',
      },
      {
        id: 's2-2',
        stageNum: 2,
        order: 4,
        name: '시세확인(감정평가 의뢰)',
        actor: 'hf',
        minDays: 3,
        maxDays: 6,
        description:
          '공사가 한국부동산원 시세·KB시세 또는 감정평가를 의뢰해 담보 주택 가격을 객관적으로 확인하는 단계예요.',
        customerActionHint: '공사가 집값을 확인하고 있어요. 감정평가 방문 연락이 오면 협조해 주세요.',
        docs: [],
        nextDocsStepId: 's3-2',
      },
      {
        id: 's2-3',
        stageNum: 2,
        order: 5,
        name: '담보주택 조사',
        actor: 'hf',
        minDays: 2,
        maxDays: 3,
        description:
          '주택의 실제 거주 여부, 임대차 현황, 권리관계(근저당 등)를 서류와 현장 확인으로 점검하는 단계예요.',
        customerActionHint: '공사가 담보주택 현황을 조사 중이에요. 추가 확인 요청이 없으면 기다리시면 됩니다.',
        docs: [],
        nextDocsStepId: 's3-2',
      },
      {
        id: 's2-4',
        stageNum: 2,
        order: 6,
        name: '보증심사 및 승인',
        actor: 'hf',
        minDays: 2,
        maxDays: 4,
        description:
          '공사가 가입 자격, 담보가치, 지급 조건을 종합 심사해 보증을 최종 승인하는 단계예요.',
        customerActionHint: '공사가 최종 보증 심사를 진행 중이에요. 지금은 고객님이 하실 일이 없어요.',
        docs: [],
        nextDocsStepId: 's3-2',
      },
      {
        id: 's2-5',
        stageNum: 2,
        order: 7,
        name: '보증서 발급(금융기관 통지)',
        actor: 'hf',
        minDays: 1,
        maxDays: 2,
        description:
          '보증 승인 후 공사가 보증서를 발급해 선택하신 금융기관(은행)으로 전자 통지하는 단계예요.',
        customerActionHint: '공사가 은행으로 보증서를 보내고 있어요. 곧 은행 방문 안내를 받게 됩니다.',
        docs: [],
        nextDocsStepId: 's3-2',
      },
      {
        id: 's2-6',
        stageNum: 2,
        order: 8,
        name: '고객 은행 방문 통지',
        actor: 'hf',
        minDays: 1,
        maxDays: 1,
        description:
          '공사가 고객님께 보증서 발급 완료와 금융기관(은행) 방문 약정 일정을 안내해 드리는 단계예요.',
        customerActionHint: '은행 방문 안내를 받으시면 신분증, 등본 1부, 도장을 미리 챙겨 주세요.',
        docs: [],
        nextDocsStepId: 's3-2',
      },
    ],
  },
  {
    stageNum: 3,
    symbol: '③',
    simpleTitle: '③ 대출 실행',
    officialTitle: '금융기관 — 대출약정 및 대출 실행(보증서 발급 이후)',
    actor: 'bank',
    steps: [
      {
        id: 's3-1',
        stageNum: 3,
        order: 9,
        name: '보증서 내용 조회(전문통지)',
        actor: 'bank',
        minDays: 1,
        maxDays: 2,
        description:
          '금융기관(은행)이 공사에서 보낸 보증서 전문을 조회하고 대출 약정 서류를 준비하는 단계예요.',
        customerActionHint: '은행에서 보증서를 확인하고 약정 일정을 조율 중이에요. 안내 연락을 기다려 주세요.',
        docs: [],
        nextDocsStepId: 's3-2',
      },
      {
        id: 's3-2',
        stageNum: 3,
        order: 10,
        name: '대출약정(신분증, 등본 1부, 도장)',
        actor: 'customer',
        minDays: 1,
        maxDays: 2,
        description:
          '고객님이 취급 금융기관(은행)에 방문해 신분증, 주민등록등본 1부, 도장을 지참하고 주택연금 대출약정을 체결하는 단계예요.',
        customerActionHint: '신분증, 주민등록등본 1부, 도장을 챙겨 지정하신 은행 지점에 방문해 약정해 주세요.',
        docs: STEP_DOCS_S3_2,
      },
      {
        id: 's3-3',
        stageNum: 3,
        order: 11,
        name: '월 지급 및 개별인출금 수령(선순위 대출 상환)',
        actor: 'bank',
        minDays: 1,
        maxDays: 2,
        description:
          '금융기관이 첫 월지급금을 지급하고, 기존 선순위 주택담보대출이 있는 경우 개별인출금으로 상환을 실행하는 단계예요.',
        customerActionHint: '은행이 첫 연금 지급과 기존 대출 상환을 처리하고 있어요.',
        docs: STEP_DOCS_S3_3,
      },
      {
        id: 's3-4',
        stageNum: 3,
        order: 12,
        name: '비용 정산(인지세, 등기비용 등, 감정평가비)',
        actor: 'bank',
        minDays: 1,
        maxDays: 2,
        description:
          '인지세, 근저당권 설정(또는 신탁) 등기비용, 감정평가비 등 부대 비용을 최종 정산해 모든 절차를 마무리하는 단계예요.',
        customerActionHint: '은행에서 인지세·등기비용·감정평가비 정산 내역을 안내받고 절차가 마무리됩니다.',
        docs: [],
      },
    ],
  },
]

export const ALL_STEPS: SubStepDef[] = STAGES.flatMap((s) => s.steps)

export const STEP_BY_ID: Record<string, SubStepDef> = Object.fromEntries(
  ALL_STEPS.map((s) => [s.id, s])
)

export const DEMO_CASES: DemoCaseSpec[] = [
  {
    code: 'HF-2026-DEMO01',
    aliases: ['HF-2024-DEMO01', 'DEMO01'],
    label: '정상 진행',
    summaryTag: '공사 심사 정상 진행 중',
    currentStepId: 's2-4',
    records: {
      's1-1': { status: 'done', startOffset: -12, endOffset: -11 },
      's1-2': { status: 'done', startOffset: -11, endOffset: -8 },
      's2-1': { status: 'done', startOffset: -8, endOffset: -7 },
      's2-2': { status: 'done', startOffset: -7, endOffset: -3 },
      's2-3': { status: 'done', startOffset: -3, endOffset: -1 },
      's2-4': { status: 'active', startOffset: -1, elapsedDays: 2 },
      's2-5': { status: 'upcoming' },
      's2-6': { status: 'upcoming' },
      's3-1': { status: 'upcoming' },
      's3-2': { status: 'upcoming' },
      's3-3': { status: 'upcoming' },
      's3-4': { status: 'upcoming' },
    },
  },
  {
    code: 'HF-2026-DEMO02',
    aliases: ['HF-2024-DEMO02', 'DEMO02'],
    label: '서류 보완 필요',
    summaryTag: '고객님 서류 보완 필요',
    currentStepId: 's1-2',
    reasonCode: 'DOC_SUPPLEMENT_REQUIRED',
    supplementDocs: [
      {
        id: 'sup-abstract',
        name: '주민등록초본 (과거 주소변동내역 전체 포함)',
        qty: '1부',
        issuer: '주민센터',
        note: '기존 제출본에 과거 주소 변동 이력이 빠져 있어 재발급이 필요해요.',
      },
      {
        id: 'sup-seal',
        name: '인감증명서 (또는 본인서명사실확인서)',
        qty: '1부',
        issuer: '주민센터',
        note: '최근 3개월 이내 발급본으로 준비해 주세요.',
      },
      {
        id: 'sup-loan',
        name: '기존 주택담보대출 잔액 확인서',
        qty: '1부',
        issuer: '금융기관',
        note: '선순위 대출 상환 금액 확정을 위해 대출 금융기관에서 발급받아 주세요.',
      },
    ],
    records: {
      's1-1': { status: 'done', startOffset: -4, endOffset: -3 },
      's1-2': { status: 'needsAction', startOffset: -2, elapsedDays: 3 },
      's2-1': { status: 'upcoming' },
      's2-2': { status: 'upcoming' },
      's2-3': { status: 'upcoming' },
      's2-4': { status: 'upcoming' },
      's2-5': { status: 'upcoming' },
      's2-6': { status: 'upcoming' },
      's3-1': { status: 'upcoming' },
      's3-2': { status: 'upcoming' },
      's3-3': { status: 'upcoming' },
      's3-4': { status: 'upcoming' },
    },
  },
  {
    code: 'HF-2026-DEMO03',
    aliases: ['HF-2024-DEMO03', 'DEMO03'],
    label: '지연 사례',
    summaryTag: '금융기관 확인 지연 중',
    currentStepId: 's3-1',
    reasonCode: 'BANK_REVIEW_DELAY',
    records: {
      's1-1': { status: 'done', startOffset: -19, endOffset: -18 },
      's1-2': { status: 'done', startOffset: -18, endOffset: -15 },
      's2-1': { status: 'done', startOffset: -15, endOffset: -14 },
      's2-2': { status: 'done', startOffset: -14, endOffset: -10 },
      's2-3': { status: 'done', startOffset: -10, endOffset: -8 },
      's2-4': { status: 'done', startOffset: -8, endOffset: -6 },
      's2-5': { status: 'done', startOffset: -6, endOffset: -5 },
      's2-6': { status: 'done', startOffset: -5, endOffset: -4 },
      's3-1': { status: 'delayed', startOffset: -4, elapsedDays: 5 },
      's3-2': { status: 'upcoming' },
      's3-3': { status: 'upcoming' },
      's3-4': { status: 'upcoming' },
    },
  },
]

export function normalizeCode(raw: string): string {
  return raw.replace(/\s+/g, '').toUpperCase()
}

function toIsoDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** 주말(토·일)을 제외한 영업일 기준 날짜를 더하거나 뺀다. */
export function addBusinessDays(base: Date, offset: number): Date {
  const result = new Date(base.getFullYear(), base.getMonth(), base.getDate())
  if (offset === 0) return result
  const step = offset > 0 ? 1 : -1
  let remaining = Math.abs(offset)
  while (remaining > 0) {
    result.setDate(result.getDate() + step)
    const day = result.getDay()
    if (day !== 0 && day !== 6) {
      remaining -= 1
    }
  }
  return result
}

export function formatKoreanMonthDay(iso: string): string {
  const [, m, d] = iso.split('-').map(Number)
  if (!m || !d) return iso
  return `${m}월 ${d}일`
}

export function lookupApplication(
  rawCode: string,
  today: Date = new Date()
): ApplicationStatus | null {
  const normalized = normalizeCode(rawCode)
  if (!normalized) return null

  const spec = DEMO_CASES.find(
    (c) => c.code === normalized || c.aliases.includes(normalized)
  )
  if (!spec) return null

  const currentStep = STEP_BY_ID[spec.currentStepId]
  const currentStage = STAGES.find((s) => s.stageNum === currentStep.stageNum)!

  const recordsByStepId: Record<string, SubStepRecord> = {}
  let completedCount = 0
  let remainingMinDays = 0
  let remainingMaxDays = 0

  for (const step of ALL_STEPS) {
    const raw = spec.records[step.id] ?? { status: 'upcoming' as StepStatus }
    const rec: SubStepRecord = {
      stepId: step.id,
      status: raw.status,
      elapsedDays: raw.elapsedDays,
      startedAt:
        raw.startOffset !== undefined
          ? toIsoDate(addBusinessDays(today, raw.startOffset))
          : undefined,
      completedAt:
        raw.endOffset !== undefined
          ? toIsoDate(addBusinessDays(today, raw.endOffset))
          : undefined,
    }
    recordsByStepId[step.id] = rec

    if (rec.status === 'done') {
      completedCount += 1
    } else if (rec.status === 'upcoming') {
      remainingMinDays += step.minDays
      remainingMaxDays += step.maxDays
    } else {
      const elapsed = Math.max(1, rec.elapsedDays ?? 1)
      let curMin = Math.max(1, step.minDays - (elapsed - 1))
      let curMax = Math.max(curMin + 1, step.maxDays - Math.floor((elapsed - 1) / 2))
      if (rec.status === 'needsAction') {
        curMin += 1
        curMax += 3
      } else if (rec.status === 'delayed') {
        curMin += 1
        curMax += 4
      }
      remainingMinDays += curMin
      remainingMaxDays += curMax
    }
  }

  if (remainingMaxDays <= remainingMinDays) {
    remainingMaxDays = remainingMinDays + 2
  }

  const expectedMinDate = toIsoDate(addBusinessDays(today, remainingMinDays))
  const expectedMaxDate = toIsoDate(addBusinessDays(today, remainingMaxDays))

  return {
    code: spec.code,
    label: spec.label,
    summaryTag: spec.summaryTag,
    currentStage,
    currentStep,
    currentRecord: recordsByStepId[currentStep.id],
    completedCount,
    totalCount: ALL_STEPS.length,
    remainingMinDays,
    remainingMaxDays,
    expectedMinDate,
    expectedMaxDate,
    reasonCode: spec.reasonCode,
    reasonMessage: spec.reasonCode ? REASON_MESSAGES[spec.reasonCode] : undefined,
    supplementDocs: spec.supplementDocs ?? [],
    recordsByStepId,
  }
}

export function buildCurrentPositionSentence(app: ApplicationStatus): string {
  const actorLabel = ACTOR_INFO[app.currentStep.actor].label
  return `지금은 ${app.currentStage.symbol} ${actorLabel} — ${app.currentStep.name} 단계예요.`
}

export function buildSubStepAriaLabel(
  step: SubStepDef,
  record: SubStepRecord
): string {
  const statusMeta = STATUS_META[record.status]
  const actorLabel = ACTOR_INFO[step.actor].label
  const parts = [step.name, statusMeta.label]
  if (record.status === 'done' && record.completedAt) {
    parts.push(`완료일 ${formatKoreanMonthDay(record.completedAt)}`)
  } else if (record.elapsedDays !== undefined) {
    parts.push(`시작한 지 ${record.elapsedDays}일째`)
  }
  parts.push(`담당 ${actorLabel}`)
  const rangeText =
    step.minDays === step.maxDays
      ? `예상 ${step.minDays}영업일`
      : `예상 ${step.minDays}~${step.maxDays}영업일`
  parts.push(rangeText)
  return parts.join(', ')
}

export function groupDocsByIssuer(
  docs: StageDocItem[]
): Record<DocIssuer, StageDocItem[]> {
  const grouped: Record<DocIssuer, StageDocItem[]> = {
    주민센터: [],
    금융기관: [],
    '본인 준비': [],
  }
  for (const doc of docs) {
    grouped[doc.issuer].push(doc)
  }
  return grouped
}

export function buildShareText(app: ApplicationStatus): string {
  const minDate = formatKoreanMonthDay(app.expectedMinDate)
  const maxDate = formatKoreanMonthDay(app.expectedMaxDate)
  return [
    '[HF 주택연금 진행 현황 공유]',
    `현재 상태: ${buildCurrentPositionSentence(app)}`,
    `예상 완료(참고): 약 ${app.remainingMinDays}~${app.remainingMaxDays}영업일 (${minDate} ~ ${maxDate})`,
    `조회 코드: ${app.code}`,
    `바로 확인하기: https://hhewon0707.github.io/hf-reverse-mortgage-guide/#/status?code=${app.code}`,
    '※ 개인정보(이름·전화번호·주소 등)는 포함되지 않으며, 조회 코드만으로 확인할 수 있습니다.',
  ].join('\n')
}
