import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useMode } from '../context/ModeContext'
import SlideDeck, { type Slide } from '../components/SlideDeck'
import Easy from '../components/Easy'
import { SUMMARY_CSS, SummarySheet, summaryToHtml } from '../components/SummarySheet'
import { estimate, fmtMan, fmtWon, type CheckStatus, type FindInput, type ProductStatus } from '../lib/estimate'
import {
  LEVEL_LABEL,
  buildDocNotes,
  buildDocuments,
  buildSummary,
  summaryToText,
} from '../lib/documents'

function download(name: string, content: string, type: string) {
  // 한글이 깨지지 않도록 BOM 추가
  const blob = new Blob(['\ufeff', content], { type: `${type};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function SimBadge() {
  return <span className="chip-warm">참고용 시뮬레이션</span>
}

const STATUS_STYLE: Record<CheckStatus, { icon: string; cls: string }> = {
  ok: { icon: '✅', cls: 'bg-safe-50' },
  warn: { icon: '⚠️', cls: 'bg-warm-50' },
  ng: { icon: '⛔', cls: 'bg-red-50' },
  info: { icon: 'ℹ️', cls: 'bg-surface' },
}

const PRODUCT_BADGE: Record<ProductStatus, { label: string; cls: string }> = {
  recommend: { label: '추천', cls: 'chip-safe' },
  consider: { label: '검토', cls: 'chip' },
  info: { label: '참고', cls: 'chip-gray' },
  na: { label: '해당 없음', cls: 'chip-gray' },
}

function Title({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        <SimBadge />
      </div>
      <h2 className="text-2xl font-extrabold text-brand-900">{children}</h2>
      {sub && <p className="text-gray-500 mt-1 text-sm">{sub}</p>}
    </div>
  )
}

export default function FindResult({ input, onRestart }: { input: FindInput; onRestart: () => void }) {
  const { mode } = useMode()
  const isChild = mode === 'child'
  const r = useMemo(() => estimate(input), [input])
  const isParentTarget = input.target === 'parent'
  const docs = useMemo(() => buildDocuments(input, r), [input, r])
  const docNotes = useMemo(() => buildDocNotes(input), [input])
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [showSummary, setShowSummary] = useState(false)

  const toggleDoc = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const summaryView = showSummary ? (() => {
    const data = buildSummary(input, r, docs, checked, mode)
    const stamp = new Date().toISOString().slice(0, 10)
    return (
      <div>
        <style>{SUMMARY_CSS}</style>
        <div className="no-print card mb-4">
          <p className="font-extrabold text-brand-900 mb-1">📄 사전 상담 요약서</p>
          <p className="text-sm text-gray-500 mb-4">
            지사 상담 때 보여주시거나 가족에게 공유하세요. 이 파일은 내 기기에서만 만들어져요.
          </p>
          <div className="grid sm:grid-cols-3 gap-2">
            <button className="btn-accent !px-3" onClick={() => window.print()}>🖨️ 인쇄하기</button>
            <button className="btn-primary !px-3" onClick={() => download(`주택연금_상담요약_${stamp}.html`, summaryToHtml(data), 'text/html')}>
              💾 HTML 저장
            </button>
            <button className="btn-ghost !px-3" onClick={() => download(`주택연금_상담요약_${stamp}.txt`, summaryToText(data), 'text/plain')}>
              📝 텍스트 저장
            </button>
          </div>
          <button className="mt-3 text-sm font-bold text-brand-600 hover:underline" onClick={() => setShowSummary(false)}>
            ← 결과로 돌아가기
          </button>
        </div>
        <div className="rounded-3xl shadow-card overflow-hidden print:shadow-none">
          <SummarySheet data={data} />
        </div>
      </div>
    )
  })() : null

  const overallInfo = {
    ok: { label: '가입 요건에 큰 문제는 없어 보여요', cls: 'chip-safe' },
    conditional: { label: '추가 확인이 필요한 항목이 있어요', cls: 'chip-warm' },
    unlikely: { label: '가입이 어려울 수 있는 항목이 있어요', cls: 'chip-gray' },
  }[r.overall]

  const recommendedMethods = r.methods.filter((m) => m.recommended)

  const slides: Slide[] = []

  // 1) 걱정 해소
  if (r.concernCards.length > 0 || input.concerns.includes('other')) {
    slides.push({
      key: 'concerns',
      label: '걱정 해소',
      node: (
        <div>
          <Title sub="선택하신 걱정부터 먼저 풀어 드려요.">먼저, 걱정되시는 부분이에요</Title>
          <div className="grid gap-4">
            {r.concernCards.map((c) => (
              <div key={c.concern} className="rounded-2xl border border-brand-100 bg-brand-50/50 p-5">
                <p className="font-extrabold text-brand-800 mb-2">💭 {c.label}</p>
                {c.faqs.map((f) => (
                  <div key={f.id} className="mb-3 last:mb-0">
                    <p className="font-bold text-gray-800">{f.summary}</p>
                    <p className="text-sm text-gray-600 mt-1">{f.answer}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      출처: {f.source} · {f.id}
                      {f.needs_verification && ' · 공식 확인 필요'}
                    </p>
                  </div>
                ))}
              </div>
            ))}
            {input.concerns.includes('other') && (
              <div className="rounded-2xl border border-gray-200 p-5">
                <p className="font-extrabold text-gray-800 mb-1">💭 기타 걱정{input.concernOther ? `: “${input.concernOther}”` : ''}</p>
                <p className="text-sm text-gray-600">정확한 안내를 위해 상담 전문가 연결을 권해드려요.</p>
                <Link to="/consult" className="btn-ghost mt-3 !py-2">상담 예약하기</Link>
              </div>
            )}
          </div>
        </div>
      ),
    })
  }

  // 2) 가입 가능성 점검
  slides.push({
    key: 'checks',
    label: '가입 요건 점검',
    node: (
      <div>
        <Title sub="입력하신 내용으로 기본 요건을 점검했어요. 최종 판단은 공사 심사에서 이뤄져요.">가입 요건 점검</Title>
        <p className={`${overallInfo.cls} mb-4`}>{overallInfo.label}</p>
        <div className="grid gap-2.5">
          {r.checks.map((c) => (
            <div key={c.id} className={`rounded-2xl p-4 ${STATUS_STYLE[c.status].cls}`}>
              <p className="font-bold text-gray-800">
                {STATUS_STYLE[c.status].icon} {c.label}
              </p>
              <p className="text-sm text-gray-600 mt-0.5">{c.detail}</p>
            </div>
          ))}
        </div>
        {input.capacity === 'limited' && (
          <p className="text-sm text-gray-500 mt-3">
            성년후견제도는 법원을 통해 대신 판단·계약해 줄 사람을 정해 두는 제도예요. 자세한 절차는 상담에서 안내받으세요.
          </p>
        )}
      </div>
    ),
  })

  // 3) 월 수령액
  slides.push({
    key: 'amount',
    label: '예상 월 수령액',
    node: (
      <div>
        <Title sub={r.ageNote}>예상 월 수령액</Title>
        <div className="rounded-3xl bg-gradient-to-br from-brand-700 to-brand-500 text-white p-6 text-center">
          <p className="text-brand-100 text-sm mb-1">
            {r.pref ? '우대형 기준' : '일반형 기준'} · 종신지급 · 연소자 만 {r.ageUsed}세 · 집값 {fmtMan(input.priceManwon)}
          </p>
          <p className="num text-4xl md:text-5xl">
            {fmtWon((r.pref ?? r.base).min)} ~ {fmtWon((r.pref ?? r.base).max)}
          </p>
          <p className="text-brand-100 mt-1">
            매달 약 <span className="num text-warm-400 text-2xl">{fmtWon((r.pref ?? r.base).monthly)}</span>
          </p>
        </div>
        <p className="text-sm text-gray-500 mt-3">참고용 예상치이며 최종 조건은 한국주택금융공사 심사 결과 기준이에요. (2026.6.1 신청 접수분 일람표 적용)</p>

        {r.pref && (
          <div className="grid grid-cols-2 gap-3 mt-4 text-center">
            <div className="bg-surface rounded-2xl p-4">
              <p className="text-xs text-gray-500">일반형이라면</p>
              <p className="num text-lg text-gray-700">{fmtWon(r.base.monthly)}</p>
            </div>
            <div className="bg-safe-50 rounded-2xl p-4">
              <p className="text-xs text-safe-600 font-bold">우대형 (더 받아요)</p>
              <p className="num text-lg text-safe-600">{fmtWon(r.pref.monthly)}</p>
            </div>
          </div>
        )}

        <div className="bg-surface rounded-2xl p-4 mt-4 text-sm text-gray-600">
          <p>
            <Easy word="최대 인출한도" easy="목돈으로 한꺼번에 꺼낼 수 있는 최대 금액" /> (대출한도의 50% 기준):{' '}
            <strong className="text-brand-800">{fmtWon(r.maxWithdrawalWon)}</strong>
          </p>
          {r.loanState !== 'none' && (
            <p className="mt-1">
              입력하신 대출 {fmtMan(input.loanManwon)} →{' '}
              {r.loanState === 'within_50' && '인출한도 이내로 상환할 수 있어요.'}
              {r.loanState === 'within_90' && `대출한도의 50% 초과~90% 이하(약 ${fmtWon(r.loanLimit90Won)} 이내)라 대출 상환용으로 이용할 수 있어요.`}
              {r.loanState === 'over_90' && `대출한도의 90%(약 ${fmtWon(r.loanLimit90Won)})를 넘어 일부는 직접 상환해야 할 수 있어요.`}
            </p>
          )}
        </div>
      </div>
    ),
  })

  // 4) 추천 상품
  slides.push({
    key: 'products',
    label: '추천 상품',
    node: (
      <div>
        <Title sub="내 조건에 맞는 상품을 먼저, 나머지는 참고용으로 보여드려요.">추천 상품</Title>
        <div className="grid gap-3">
          {[...r.products]
            .sort((a, b) => ['recommend', 'consider', 'info', 'na'].indexOf(a.status) - ['recommend', 'consider', 'info', 'na'].indexOf(b.status))
            .map((p) => (
              <div key={p.id} className={`rounded-2xl border p-4 ${p.status === 'recommend' ? 'border-safe-500 bg-safe-50/50' : 'border-gray-200'} ${p.status === 'na' ? 'opacity-60' : ''}`}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="font-extrabold text-brand-900">{p.name}</p>
                  <span className={PRODUCT_BADGE[p.status].cls}>{PRODUCT_BADGE[p.status].label}</span>
                </div>
                <p className="text-sm text-gray-700">{p.summary}</p>
                <ul className="text-sm text-gray-500 list-disc pl-5 mt-1">
                  {p.reasons.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      </div>
    ),
  })

  // 5) 지급방식
  slides.push({
    key: 'methods',
    label: '지급방식·지급유형',
    node: (
      <div>
        <Title sub="‘참고 추정’은 일람표에 없는 방식을 단순 계산한 값이에요. 정확한 금액은 공식 모의계산으로 확인하세요.">지급방식 비교</Title>
        {recommendedMethods.length > 0 && (
          <p className="chip-safe mb-3">추천: {recommendedMethods.map((m) => m.name).join(' · ')}</p>
        )}
        <div className="grid gap-3">
          {r.methods.map((m) => (
            <div key={m.id} className={`rounded-2xl border p-4 ${m.recommended ? 'border-safe-500 bg-safe-50/50' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between gap-2">
                <p className="font-extrabold text-brand-900">{m.name}</p>
                {m.recommended && <span className="chip-safe shrink-0">추천</span>}
              </div>
              <p className="num text-xl text-brand-700 my-1">
                {m.monthlyWon === null ? '-' : `월 약 ${fmtWon(m.monthlyWon)}`}
                {m.estimated && <span className="chip-gray ml-2 align-middle">참고 추정</span>}
              </p>
              <p className="text-sm text-gray-700">{m.desc}</p>
              <p className="text-sm text-gray-500 mt-1">👍 {m.fit}</p>
              <p className="text-xs text-gray-400 mt-1">지급유형: {m.payTypes}</p>
            </div>
          ))}
        </div>
        <div className="bg-surface rounded-2xl p-4 mt-4 text-sm text-gray-600">
          <p className="font-bold text-gray-700 mb-1">지급유형이란?</p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li><strong>정액형</strong>: 매달 같은 금액</li>
            <li><strong>초기증액형</strong>: 처음 일정 기간 더 받고 이후 줄어드는 방식</li>
            <li><strong>정기증가형</strong>: 일정 주기마다 금액이 늘어나는 방식 (처음엔 정액형보다 적음)</li>
          </ul>
          <p className="text-xs text-gray-400 mt-2">초기증액형·정기증가형은 종신지급·종신혼합 방식에서만 선택할 수 있고, 나머지 방식은 정액형이에요.</p>
        </div>
      </div>
    ),
  })

  // 6) 담보제공 방식
  slides.push({
    key: 'collateral',
    label: '담보제공 방식',
    node: (
      <div>
        <Title sub="집을 담보로 맡기는 방법은 두 가지예요.">저당권방식 vs 신탁방식</Title>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            {
              name: '저당권방식',
              icon: '🔑',
              rows: [
                ['담보제공/소유권', '집 소유권은 그대로 본인 명의로 두고, 담보(저당권)만 설정해요.'],
                ['사망 시 배우자 승계', '배우자가 연금을 이어받으려면 승계 절차를 거쳐야 해요.'],
                ['보증금 있는 일부 임대', '불가'],
                ['담보방식 변경', '이용 중에도 신탁방식으로 바꿀 수 있어요.'],
              ],
            },
            {
              name: '신탁방식',
              icon: '🤝',
              rows: [
                ['담보제공/소유권', '공사에 집을 신탁해 두는 방식이에요. (소유권은 실질적으로 가입자가 유지)'],
                ['사망 시 배우자 승계', '별도 절차 없이 자동으로 승계돼요.'],
                ['보증금 있는 일부 임대', '가능'],
                ['담보방식 변경', '이용 중에도 저당권방식으로 바꿀 수 있어요.'],
              ],
            },
          ].map((c) => (
            <div key={c.name} className="rounded-2xl border border-gray-200 p-4">
              <p className="font-extrabold text-brand-900 text-lg mb-2">
                {c.icon} {c.name}
              </p>
              <dl className="grid gap-2 text-sm">
                {c.rows.map(([k, v]) => (
                  <div key={k}>
                    <dt className="font-bold text-gray-700">{k}</dt>
                    <dd className="text-gray-600">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">세부 요건과 비용은 공사 최신 안내를 확인해 주세요. (공식 확인 필요)</p>
      </div>
    ),
  })

  // 7) 비용·계좌·절세
  slides.push({
    key: 'costs',
    label: '비용·계좌·절세',
    node: (
      <div>
        <Title sub="요율은 바뀔 수 있어 금액은 적지 않았어요. 정확한 수치는 상담에서 확인하세요.">비용 · 계좌 · 절세 혜택</Title>
        <div className="grid gap-3">
          <div className="rounded-2xl border border-gray-200 p-4">
            <p className="font-extrabold text-brand-900 mb-1">💸 드는 비용</p>
            <ul className="text-sm text-gray-600 list-disc pl-5 space-y-0.5">
              <li><Easy word="초기보증료" easy="가입할 때 한 번 내는 보증 비용" />·<Easy word="연보증료" easy="매년 내는 보증 비용" />·대출이자</li>
              <li>감정평가수수료, 등록면허세 등 등기·평가 비용</li>
              <li>부부합산 시가 2.5억 미만 1주택은 <strong>감정평가수수료 지원</strong>을 받을 수 있어요.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-gray-200 p-4">
            <p className="font-extrabold text-brand-900 mb-1">🛡️ 주택연금 지킴이 통장</p>
            <p className="text-sm text-gray-600">월 지급금 중 최저생계비 <strong>250만 원 한도</strong>는 압류가 방지돼요.</p>
          </div>
          <div className="rounded-2xl border border-safe-500 bg-safe-50/50 p-4">
            <p className="font-extrabold text-brand-900 mb-1">🧾 세금 혜택</p>
            <ul className="text-sm text-gray-600 list-disc pl-5 space-y-0.5">
              <li><strong>재산세 25% 감면</strong> (공시가격 9억 이하 등 지방세법 기준)</li>
              <li>주택연금 가입 주택은 <strong>종합부동산세 절감</strong> 효과를 기대할 수 있어요.</li>
            </ul>
            <p className="text-xs text-gray-400 mt-1">감면 요건과 한도는 지방세법·종부세법 기준에 따라 달라져요. (공식 확인 필요)</p>
          </div>
        </div>
      </div>
    ),
  })

  // 7-2) 신청 시 제출서류
  const usable = docs.filter((d) => d.level !== 'na')
  const doneCount = usable.filter((d) => checked.has(d.id)).length
  const ordered = [...docs.filter((d) => d.level === 'required'), ...docs.filter((d) => d.level === 'maybe'), ...docs.filter((d) => d.level === 'na')]
  slides.push({
    key: 'docs',
    label: '신청 시 제출서류',
    node: (
      <div>
        <Title sub="내 조건에 맞춰 필요한 서류를 골라 보여드려요. 챙긴 서류는 체크해 두세요.">신청 시 제출서류</Title>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="chip-warm">필수 {docs.filter((d) => d.level === 'required').length}개</span>
          <span className="chip">해당 가능 {docs.filter((d) => d.level === 'maybe').length}개</span>
          <span className="chip-safe">챙김 {doneCount} / {usable.length}</span>
        </div>
        <div className="grid gap-2.5">
          {ordered.map((d) => {
            const na = d.level === 'na'
            const box =
              d.level === 'required'
                ? 'border-warm-500 bg-warm-50/60'
                : d.level === 'maybe'
                  ? 'border-brand-300 bg-brand-50/50'
                  : 'border-gray-200 bg-white opacity-55'
            return (
              <label key={d.id} className={`flex gap-3 rounded-2xl border-2 p-4 ${box} ${na ? '' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  className="mt-1.5 w-5 h-5 shrink-0 accent-[#1a4aa6]"
                  checked={checked.has(d.id)}
                  disabled={na}
                  onChange={() => toggleDoc(d.id)}
                  aria-label={`${d.name} 챙김`}
                />
                <span className="block">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className={`font-extrabold text-brand-900 ${checked.has(d.id) ? 'line-through opacity-60' : ''}`}>{d.name}</span>
                    <span className={d.level === 'required' ? 'chip-warm' : d.level === 'maybe' ? 'chip' : 'chip-gray'}>{LEVEL_LABEL[d.level]}</span>
                  </span>
                  <span className="block num text-lg text-brand-700">{d.qty}</span>
                  <span className="block text-sm text-gray-700">{d.reason}</span>
                  {d.details.length > 0 && !na && (
                    <ul className="text-sm text-gray-500 list-disc pl-5 mt-1">
                      {d.details.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  )}
                </span>
              </label>
            )
          })}
        </div>
        <div className="bg-surface rounded-2xl p-4 mt-4">
          <p className="font-bold text-gray-700 mb-1">유의사항</p>
          <ul className="text-sm text-gray-600 space-y-1">
            {docNotes.map((n) => (
              <li key={n.text} className={n.highlight ? 'font-bold text-warm-600' : ''}>
                {n.highlight ? '★ ' : '• '}
                {n.text}
              </li>
            ))}
          </ul>
        </div>
        <button className="btn-ghost w-full mt-4" onClick={() => setShowSummary(true)}>
          📄 상담 요약 저장·인쇄하기
        </button>
        <p className="text-xs text-gray-400 mt-2">서류 종류와 부수는 신청 시점의 공사 안내에 따라 달라질 수 있어요. (사전 상담 참고용)</p>
      </div>
    ),
  })

  // 8) 자녀세대 전용
  if (isChild) {
    slides.push({
      key: 'family',
      label: '가족과 나눌 이야기',
      node: (
        <div>
          <Title sub="부모님께 설명하기 쉽도록 정리했어요.">가족과 나눌 이야기</Title>
          <div className="grid gap-3">
            <div className="rounded-2xl bg-brand-50 p-4">
              <p className="font-extrabold text-brand-800 mb-1">🗣️ 부모님과 나눌 질문</p>
              <ul className="text-sm text-gray-700 list-disc pl-5 space-y-0.5">
                <li>앞으로 매달 생활비는 얼마가 있으면 안심이 될까요?</li>
                <li>이 집에 계속 살고 싶으신가요, 이사 계획이 있으신가요?</li>
                <li>집을 자녀에게 물려주는 것이 얼마나 중요하신가요?</li>
                <li>걱정되는 점을 함께 상담받아 볼까요?</li>
              </ul>
            </div>
            <div className="rounded-2xl bg-surface p-4">
              <p className="font-extrabold text-brand-800 mb-1">☑️ 가족 동의·상속 체크리스트</p>
              <ul className="text-sm text-gray-700 space-y-1">
                {['사후 정산 방식 함께 이해하기', '형제·자매에게 가입 계획 공유하기', '담보 방식(저당권/신탁) 비교하기', '필요 서류 미리 확인하기'].map((t) => (
                  <li key={t} className="flex gap-2"><input type="checkbox" className="mt-1.5" aria-label={t} />{t}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-warm-100 bg-warm-50 p-4">
              <p className="font-extrabold text-warm-600 mb-1">🏡 세대이음 포인트</p>
              <p className="text-sm text-gray-700">
                부모님 사망 후 만 55세 이상 자녀가 같은 주택을 담보로 다시 가입할 수 있어요. 부모님이 근저당권방식을 이용 중일 때 가능하고,
                인출한도는 50% 초과~90% 이하까지 설정할 수 있어요.
              </p>
            </div>
          </div>
        </div>
      ),
    })
  }

  // 9) 다음 단계
  slides.push({
    key: 'next',
    label: '다음 단계',
    node: (
      <div className="text-center py-2">
        <Title>이제 어떻게 해볼까요?</Title>
        <div className="text-6xl mb-3">🏠</div>
        <p className="text-gray-600 mb-5">
          이 결과는 {isParentTarget ? '부모님' : '본인'}의 입력값으로 계산한 <strong>참고용 시뮬레이션</strong>이에요.
          가입 여부는 충분히 비교한 뒤 결정하세요.
        </p>
        <div className="grid gap-3 max-w-sm mx-auto">
          <Link to="/consult" className="btn-accent">📅 상담 예약하기</Link>
          <button className="btn-primary" onClick={() => setShowSummary(true)}>📄 상담 요약 저장·인쇄하기</button>
          <Link to="/chat" className="btn-ghost">💬 HF주택연금 비서에게 물어보기</Link>
          <button className="btn-ghost" onClick={onRestart}>🔄 처음부터 다시 입력</button>
        </div>
      </div>
    ),
  })

  return (
    <div>
      {summaryView}
      <div className={showSummary ? 'hidden' : ''}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-extrabold text-brand-900">맞춤 추천 결과</h1>
          <button className="text-sm font-bold text-brand-600 hover:underline" onClick={onRestart}>
            ← 입력으로 돌아가기
          </button>
        </div>
        <div className="card">
          <SlideDeck slides={slides} />
        </div>
      </div>
    </div>
  )
}
