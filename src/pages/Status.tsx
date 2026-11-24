import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMode } from '../context/ModeContext'
import {
  ACTOR_INFO,
  CODE_FORMAT_GUIDE,
  DEMO_CASES,
  INVALID_CODE_MESSAGE,
  NOTIFICATION_PREP_MESSAGE,
  SAMPLE_DURATION_BADGE,
  STAGES,
  STATUS_META,
  STEP_BY_ID,
  buildCurrentPositionSentence,
  buildShareText,
  buildSubStepAriaLabel,
  formatKoreanMonthDay,
  groupDocsByIssuer,
  lookupApplication,
  type ApplicationStatus,
  type DocIssuer,
  type StageDocItem,
  type SubStepDef,
} from '../lib/status'

const ISSUER_ORDER: DocIssuer[] = ['주민센터', '금융기관', '본인 준비']

const ISSUER_STYLE: Record<DocIssuer, { icon: string; badgeClass: string }> = {
  주민센터: { icon: '🏛️', badgeClass: 'chip' },
  금융기관: { icon: '🏦', badgeClass: 'chip-warm' },
  '본인 준비': { icon: '🪪', badgeClass: 'chip-safe' },
}

function DocsByIssuerBlock({ docs }: { docs: StageDocItem[] }) {
  const grouped = groupDocsByIssuer(docs)
  const nonEmptyIssuers = ISSUER_ORDER.filter((issuer) => grouped[issuer].length > 0)

  if (nonEmptyIssuers.length === 0) return null

  return (
    <div className="grid sm:grid-cols-3 gap-3">
      {nonEmptyIssuers.map((issuer) => {
        const meta = ISSUER_STYLE[issuer]
        return (
          <div key={issuer} className="rounded-2xl border border-gray-200 bg-surface/60 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span aria-hidden="true">{meta.icon}</span>
              <span className={meta.badgeClass}>{issuer}</span>
            </div>
            <ul className="space-y-2.5 text-sm">
              {grouped[issuer].map((doc) => (
                <li key={doc.id} className="border-b border-gray-200/70 last:border-b-0 pb-2 last:pb-0">
                  <p className="font-bold text-gray-900">{doc.name}</p>
                  <p className="text-xs text-brand-700 font-semibold mt-0.5">{doc.qty}</p>
                  {doc.condition && (
                    <p className="text-xs text-warm-600 font-semibold mt-0.5">※ {doc.condition}</p>
                  )}
                  {doc.note && <p className="text-xs text-gray-500 mt-0.5">{doc.note}</p>}
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

export default function Status() {
  const { mode } = useMode()
  const isParent = mode === 'parent'
  const [searchParams, setSearchParams] = useSearchParams()

  const initialQueryCode = searchParams.get('code') ?? DEMO_CASES[0].code
  const [inputCode, setInputCode] = useState(initialQueryCode)
  const [activeCode, setActiveCode] = useState(initialQueryCode)
  const [errorMsg, setErrorMsg] = useState<string | null>(() =>
    lookupApplication(initialQueryCode) ? null : INVALID_CODE_MESSAGE
  )
  const [app, setApp] = useState<ApplicationStatus | null>(() =>
    lookupApplication(initialQueryCode)
  )

  const [selectedStepId, setSelectedStepId] = useState<string>(
    () => lookupApplication(initialQueryCode)?.currentStep.id ?? 's2-4'
  )
  const [openStages, setOpenStages] = useState<number[]>(() => {
    const found = lookupApplication(initialQueryCode)
    if (!found || isParent) return []
    return [found.currentStage.stageNum]
  })
  const [checkedSupplements, setCheckedSupplements] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState(false)

  const stageRefs = useRef<Record<number, HTMLElement | null>>({})
  const stepBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const shouldScrollRef = useRef(false)

  // 모드 또는 조회 사례 변경 시 스테퍼 펼침 규칙 동기화
  useEffect(() => {
    if (!app) {
      setOpenStages([])
      return
    }
    setSelectedStepId(app.currentStep.id)
    setCheckedSupplements({})
    setCopied(false)

    if (isParent) {
      setOpenStages([])
    } else {
      setOpenStages([app.currentStage.stageNum])
      if (shouldScrollRef.current) {
        shouldScrollRef.current = false
        requestAnimationFrame(() => {
          stageRefs.current[app.currentStage.stageNum]?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          })
        })
      }
    }
  }, [app, isParent])

  const runLookup = (raw: string, scrollToCurrent = true) => {
    setInputCode(raw)
    const found = lookupApplication(raw)
    if (!found) {
      setApp(null)
      setActiveCode('')
      setErrorMsg(INVALID_CODE_MESSAGE)
      return
    }
    shouldScrollRef.current = scrollToCurrent
    setErrorMsg(null)
    setApp(found)
    setActiveCode(found.code)
    setInputCode(found.code)
    setSearchParams({ code: found.code }, { replace: true })
  }

  const toggleStage = (stageNum: number) => {
    setOpenStages((prev) => {
      const isOpen = prev.includes(stageNum)
      if (isParent) {
        return isOpen ? [] : [stageNum]
      }
      return isOpen ? prev.filter((n) => n !== stageNum) : [...prev, stageNum]
    })
  }

  const handleStepKeyDown = (
    e: KeyboardEvent<HTMLButtonElement>,
    stageSteps: SubStepDef[],
    idx: number
  ) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = stageSteps[Math.min(stageSteps.length - 1, idx + 1)]
      stepBtnRefs.current[next.id]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = stageSteps[Math.max(0, idx - 1)]
      stepBtnRefs.current[prev.id]?.focus()
    }
  }

  const handleCopyShare = async () => {
    if (!app) return
    const text = buildShareText(app)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
    }
    setTimeout(() => setCopied(false), 2600)
  }

  const selectedStep = useMemo(() => {
    if (!app) return null
    return STEP_BY_ID[selectedStepId] ?? app.currentStep
  }, [app, selectedStepId])

  const selectedRecord = useMemo(() => {
    if (!app || !selectedStep) return null
    return app.recordsByStepId[selectedStep.id]
  }, [app, selectedStep])

  const historyEntries = useMemo(() => {
    if (!app) return []
    return STAGES.flatMap((stage) =>
      stage.steps
        .map((step) => ({
          stage,
          step,
          record: app.recordsByStepId[step.id],
        }))
        .filter((item) => item.record.status !== 'upcoming')
    )
  }, [app])

  const progressPercent = app ? Math.round((app.completedCount / app.totalCount) * 100) : 0

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-6">
      {/* 4-1. 조회 카드 */}
      <section className="card no-print" aria-labelledby="status-lookup-heading">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <span className="chip mb-2">공식 신청절차 3단계 · 12세부단계 기준</span>
            <h1
              id="status-lookup-heading"
              className={`font-extrabold text-brand-900 ${isParent ? 'text-2xl md:text-3xl' : 'text-2xl'}`}
            >
              내 주택연금 진행 현황
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              지금 어디까지 진행됐는지, 누가 처리 중인지, 언제쯤 끝나는지 한눈에 확인하세요.
            </p>
          </div>
        </div>

        {/* 시연용 예시 코드 버튼 3개 */}
        <div className="mb-4">
          <p className="text-xs font-bold text-gray-500 mb-2">
            시연용 예시 바로 보기 (클릭하면 바로 열립니다)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {DEMO_CASES.map((demo) => {
              const selected = activeCode === demo.code
              return (
                <button
                  key={demo.code}
                  type="button"
                  onClick={() => runLookup(demo.code, true)}
                  aria-pressed={selected}
                  className={`text-left rounded-2xl border-2 px-4 py-3 transition-all ${
                    selected
                      ? 'border-brand-600 bg-brand-50 ring-2 ring-brand-100'
                      : 'border-gray-200 bg-white hover:border-brand-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-brand-900">{demo.label}</span>
                    <span className="text-xs font-mono font-bold text-brand-700 bg-white px-2 py-0.5 rounded-full border border-brand-100">
                      {demo.code}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{demo.summaryTag}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* 코드 직접 입력 */}
        <form
          className="flex flex-col sm:flex-row gap-2.5"
          onSubmit={(e) => {
            e.preventDefault()
            runLookup(inputCode, true)
          }}
        >
          <label htmlFor="status-code-input" className="sr-only">
            조회 코드 입력
          </label>
          <input
            id="status-code-input"
            className="input flex-1 font-mono"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="조회 코드 입력 (예: HF-2026-DEMO01)"
            autoComplete="off"
          />
          <button type="submit" className="btn-primary shrink-0">
            🔍 조회하기
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-2">{CODE_FORMAT_GUIDE} · 대소문자와 공백은 구분하지 않습니다.</p>

        {errorMsg && (
          <div
            role="alert"
            className="mt-4 rounded-2xl border-2 border-warm-400 bg-warm-50 px-4 py-3.5 text-warm-600"
          >
            <p className="font-bold">⚠️ {errorMsg}</p>
            <p className="text-sm mt-1 text-gray-700">{CODE_FORMAT_GUIDE}</p>
          </div>
        )}
      </section>

      {app && (
        <>
          {/* 4-2. 요약 카드 */}
          <section className="card space-y-5" aria-labelledby="status-summary-heading">
            {/* 지연 / 보완 최상단 배너 */}
            {app.currentRecord.status === 'delayed' && (
              <div
                className="rounded-2xl border-2 border-warm-400 bg-warm-50 p-4 md:p-5"
                role="status"
              >
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="chip-warm font-extrabold">▲ 예상보다 지연 중이에요</span>
                  {app.reasonCode && (
                    <span className="text-xs font-mono text-gray-500">{app.reasonCode}</span>
                  )}
                </div>
                <p className="text-gray-800 font-semibold">{app.reasonMessage}</p>
              </div>
            )}

            {app.currentRecord.status === 'needsAction' && (
              <div
                className="rounded-2xl border-2 border-warm-500 bg-warm-50 p-4 md:p-5"
                role="status"
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="chip-warm font-extrabold">! 보완이 필요해요</span>
                  {app.reasonCode && (
                    <span className="text-xs font-mono text-gray-500">{app.reasonCode}</span>
                  )}
                </div>
                {app.reasonMessage && (
                  <p className="text-gray-800 font-semibold mb-3">{app.reasonMessage}</p>
                )}
                {app.supplementDocs.length > 0 && (
                  <ul className="space-y-1.5 bg-white/80 rounded-xl p-3 border border-warm-100">
                    {app.supplementDocs.map((doc) => (
                      <li key={doc.id} className="text-sm text-gray-800 flex flex-wrap items-center gap-2">
                        <span className="font-bold text-warm-600">• {doc.name}</span>
                        <span className="text-xs text-gray-500">
                          ({doc.issuer} · {doc.qty})
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* 현재 위치 + 주체 */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip font-extrabold">
                    {ACTOR_INFO[app.currentStep.actor].badge}
                  </span>
                  <span className="text-sm font-bold text-gray-700">
                    {ACTOR_INFO[app.currentStep.actor].summary}
                  </span>
                </div>
                <h2
                  id="status-summary-heading"
                  className={`font-extrabold text-brand-900 leading-snug ${
                    isParent ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'
                  }`}
                >
                  {buildCurrentPositionSentence(app)}
                </h2>
              </div>

              <span className="chip-gray self-start shrink-0 font-mono">
                코드 {app.code}
              </span>
            </div>

            {/* 예상 완료일 범위 + 샘플 배지 */}
            <div className="rounded-2xl bg-brand-50/70 border border-brand-100 p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-brand-700 mb-1">예상 완료일 (참고용 범위)</p>
                <p className={`font-extrabold text-brand-900 ${isParent ? 'text-xl' : 'text-lg'}`}>
                  대출 실행까지 약 {app.remainingMinDays}~{app.remainingMaxDays}영업일 (
                  {formatKoreanMonthDay(app.expectedMinDate)} ~{' '}
                  {formatKoreanMonthDay(app.expectedMaxDate)})
                </p>
              </div>
              <span className="chip-warm self-start md:self-center shrink-0">
                ⏱️ {SAMPLE_DURATION_BADGE}
              </span>
            </div>

            {/* 전체 진행률 바 */}
            <div>
              <div className="flex items-center justify-between text-sm font-bold mb-2">
                <span className="text-gray-700">
                  전체 진행률 ({app.completedCount}/{app.totalCount} 세부 단계 완료)
                </span>
                <span className="num text-brand-800">{progressPercent}%</span>
              </div>
              <div
                className="w-full h-3.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200/70"
                role="progressbar"
                aria-label="전체 신청 진행률"
                aria-valuemin={0}
                aria-valuemax={app.totalCount}
                aria-valuenow={app.completedCount}
                aria-valuetext={`${app.totalCount}단계 중 ${app.completedCount}단계 완료`}
              >
                <div
                  className="h-full bg-gradient-to-r from-brand-700 to-brand-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(8, progressPercent)}%` }}
                />
              </div>
            </div>
          </section>

          {/* 4-5. 부모님 모드: 지금 하실 일 강조 카드 */}
          {isParent && (
            <section
              className="card border-2 border-brand-200 bg-brand-50/40"
              aria-labelledby="parent-action-heading"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="chip font-extrabold">👵 지금 하실 일</span>
                <span className="text-xs text-gray-500">부모세대 쉬운 안내</span>
              </div>
              <h2 id="parent-action-heading" className="text-xl font-extrabold text-brand-900 mb-2">
                {ACTOR_INFO[app.currentStep.actor].summary}
              </h2>
              <p className="text-lg text-gray-800 font-semibold leading-relaxed">
                {app.currentStep.customerActionHint}
              </p>
            </section>
          )}

          {/* 4-3. 3단계 스테퍼 */}
          <section aria-labelledby="stepper-heading" className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 id="stepper-heading" className="text-xl font-extrabold text-brand-900">
                  3단계 진행 절차
                </h2>
                <p className="text-xs text-gray-500">
                  {isParent
                    ? '궁금한 단계를 눌러 세부 내용을 펼쳐 보세요. 한 번에 한 단계씩 열립니다.'
                    : '세부 단계를 누르면 아래 상세 패널에서 설명과 필요 서류를 볼 수 있어요.'}
                </p>
              </div>
              <span className="text-xs text-gray-400">
                ✓ 완료 · ● 진행 중 · ○ 예정 · ▲ 지연 · ! 조치 필요
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
              {STAGES.map((stage) => {
                const isOpen = openStages.includes(stage.stageNum)
                const doneInStage = stage.steps.filter(
                  (s) => app.recordsByStepId[s.id]?.status === 'done'
                ).length
                const isCurrentStage = app.currentStage.stageNum === stage.stageNum
                const stageHasDelay = stage.steps.some(
                  (s) => app.recordsByStepId[s.id]?.status === 'delayed'
                )
                const stageNeedsAction = stage.steps.some(
                  (s) => app.recordsByStepId[s.id]?.status === 'needsAction'
                )

                return (
                  <article
                    key={stage.stageNum}
                    ref={(el) => {
                      stageRefs.current[stage.stageNum] = el
                    }}
                    className={`rounded-3xl bg-white shadow-card border-2 transition-colors overflow-hidden ${
                      isCurrentStage ? 'border-brand-500' : 'border-gray-100'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleStage(stage.stageNum)}
                      aria-expanded={isOpen}
                      className="w-full text-left p-5 hover:bg-brand-50/40 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={isCurrentStage ? 'chip font-extrabold' : 'chip-gray'}>
                          {ACTOR_INFO[stage.actor].label} 담당
                        </span>
                        <span className="text-xs font-bold text-gray-500 num">
                          {doneInStage}/{stage.steps.length} 완료 {isOpen ? '▲' : '▼'}
                        </span>
                      </div>
                      <h3 className="text-lg font-extrabold text-brand-900">
                        {stage.simpleTitle}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">{stage.officialTitle}</p>
                      {(stageHasDelay || stageNeedsAction || isCurrentStage) && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {isCurrentStage && (
                            <span className="chip">● 현재 진행 단계</span>
                          )}
                          {stageNeedsAction && (
                            <span className="chip-warm">! 고객 조치 필요</span>
                          )}
                          {stageHasDelay && <span className="chip-warm">▲ 지연</span>}
                        </div>
                      )}
                    </button>

                    {isOpen && (
                      <div
                        className="border-t border-gray-100 bg-surface/50 p-3 space-y-2"
                        role="list"
                        aria-label={`${stage.simpleTitle} 세부 단계`}
                      >
                        {stage.steps.map((step, idx) => {
                          const rec = app.recordsByStepId[step.id]
                          const meta = STATUS_META[rec.status]
                          const isSelected = selectedStep?.id === step.id
                          const durationText =
                            step.minDays === step.maxDays
                              ? `예상 ${step.minDays}영업일`
                              : `예상 ${step.minDays}~${step.maxDays}영업일`

                          return (
                            <button
                              key={step.id}
                              ref={(el) => {
                                stepBtnRefs.current[step.id] = el
                              }}
                              type="button"
                              role="listitem"
                              onClick={() => setSelectedStepId(step.id)}
                              onKeyDown={(e) => handleStepKeyDown(e, stage.steps, idx)}
                              aria-label={buildSubStepAriaLabel(step, rec)}
                              aria-current={isSelected ? 'step' : undefined}
                              className={`w-full text-left rounded-2xl border p-3.5 transition-all ${
                                isSelected
                                  ? 'border-brand-600 bg-white ring-2 ring-brand-100 shadow-sm'
                                  : 'border-gray-200/80 bg-white/85 hover:border-brand-300'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className={`${meta.chipClass} shrink-0`}>
                                  <span aria-hidden="true">{meta.icon}</span>
                                  <span>{meta.label}</span>
                                </span>
                                <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                  {ACTOR_INFO[step.actor].label}
                                </span>
                              </div>
                              <p className="font-bold text-gray-900 mt-2 text-sm leading-snug">
                                {step.name}
                              </p>
                              <div className="flex flex-wrap items-center justify-between gap-2 mt-2 text-xs text-gray-500">
                                <span>
                                  {rec.status === 'done' && rec.completedAt
                                    ? `완료: ${formatKoreanMonthDay(rec.completedAt)}`
                                    : rec.elapsedDays !== undefined
                                      ? `시작 ${rec.startedAt ? formatKoreanMonthDay(rec.startedAt) : ''} · ${rec.elapsedDays}일째`
                                      : '진행 예정'}
                                </span>
                                <span className="text-brand-700 font-semibold">
                                  {durationText} (샘플)
                                </span>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          </section>

          {/* 4-4. 단계 상세 패널 */}
          {selectedStep && selectedRecord && (
            <section className="card space-y-6" aria-labelledby="detail-panel-heading">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className={STATUS_META[selectedRecord.status].chipClass}>
                      {STATUS_META[selectedRecord.status].icon}{' '}
                      {STATUS_META[selectedRecord.status].label}
                    </span>
                    <span className="chip-gray">
                      담당: {ACTOR_INFO[selectedStep.actor].label}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">{selectedStep.id}</span>
                  </div>
                  <h2
                    id="detail-panel-heading"
                    className={`font-extrabold text-brand-900 ${isParent ? 'text-2xl' : 'text-xl'}`}
                  >
                    {selectedStep.name}
                  </h2>
                </div>
                <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-3 py-1.5 rounded-full">
                  예상 소요일(샘플):{' '}
                  {selectedStep.minDays === selectedStep.maxDays
                    ? `${selectedStep.minDays}영업일`
                    : `${selectedStep.minDays}~${selectedStep.maxDays}영업일`}
                </span>
              </div>

              {/* 이 단계에서 하는 일 */}
              <div>
                <h3 className="font-extrabold text-brand-800 mb-1.5">이 단계에서 하는 일</h3>
                <p className="text-gray-700 leading-relaxed">{selectedStep.description}</p>
              </div>

              {/* 지연 사유 · 보완 사항 (해당 단계가 지연 또는 보완 필요이거나 현재 사례 사유에 해당할 때) */}
              {(selectedRecord.status === 'delayed' || selectedRecord.status === 'needsAction') && (
                <div className="rounded-2xl border border-warm-200 bg-warm-50/60 p-4 space-y-3">
                  <h3 className="font-extrabold text-warm-600">
                    {selectedRecord.status === 'delayed' ? '지연 사유 안내' : '보완 사항 체크리스트'}
                  </h3>
                  {app.reasonCode && (
                    <p className="text-sm text-gray-800">
                      <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-warm-200 mr-2">
                        {app.reasonCode}
                      </span>
                      {app.reasonMessage}
                    </p>
                  )}
                  {app.supplementDocs.length > 0 && (
                    <div className="space-y-2">
                      {app.supplementDocs.map((doc) => {
                        const checked = Boolean(checkedSupplements[doc.id])
                        return (
                          <label
                            key={doc.id}
                            className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                              checked
                                ? 'border-safe-500 bg-safe-50/70'
                                : 'border-warm-200 bg-white'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="mt-1 w-4 h-4 accent-brand-700"
                              checked={checked}
                              onChange={(e) =>
                                setCheckedSupplements((prev) => ({
                                  ...prev,
                                  [doc.id]: e.target.checked,
                                }))
                              }
                            />
                            <div className="text-sm">
                              <p className="font-bold text-gray-900">
                                {doc.name}{' '}
                                <span className="text-xs font-semibold text-brand-700">
                                  ({doc.issuer} · {doc.qty})
                                </span>
                              </p>
                              {doc.note && <p className="text-xs text-gray-600 mt-0.5">{doc.note}</p>}
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 다음에 필요한 서류 (발급처별) */}
              <div>
                <h3 className="font-extrabold text-brand-800 mb-2">
                  필요 서류 안내 (발급처별)
                </h3>
                {selectedStep.docs.length > 0 ? (
                  <DocsByIssuerBlock docs={selectedStep.docs} />
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 bg-surface rounded-2xl px-4 py-3">
                      이 단계에서는 고객님이 추가로 내실 서류가 없어요.
                      {selectedStep.nextDocsStepId && STEP_BY_ID[selectedStep.nextDocsStepId] && (
                        <>
                          {' '}
                          다음 고객 방문 단계(
                          <strong>{STEP_BY_ID[selectedStep.nextDocsStepId].name}</strong>)에 필요한
                          서류를 미리 확인해 두세요.
                        </>
                      )}
                    </p>
                    {selectedStep.nextDocsStepId &&
                      STEP_BY_ID[selectedStep.nextDocsStepId] && (
                        <DocsByIssuerBlock docs={STEP_BY_ID[selectedStep.nextDocsStepId].docs} />
                      )}
                  </div>
                )}
              </div>

              {/* 이력 타임라인 */}
              {(!isParent || historyEntries.length > 0) && (
                <div>
                  <h3 className="font-extrabold text-brand-800 mb-3">진행 이력 타임라인</h3>
                  <ol className="space-y-2.5 border-l-2 border-brand-200 pl-4">
                    {historyEntries.map(({ stage, step, record }) => {
                      const meta = STATUS_META[record.status]
                      return (
                        <li key={step.id} className="relative">
                          <span
                            className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-brand-600 ring-4 ring-white"
                            aria-hidden="true"
                          />
                          <div className="flex flex-wrap items-center justify-between gap-2 bg-surface/60 rounded-xl px-3.5 py-2.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={meta.chipClass}>
                                {meta.icon} {meta.label}
                              </span>
                              <span className="text-sm font-bold text-gray-900">
                                {stage.symbol} {step.name}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 tabular-nums">
                              {record.startedAt ? `시작 ${formatKoreanMonthDay(record.startedAt)}` : ''}
                              {record.completedAt
                                ? ` → 완료 ${formatKoreanMonthDay(record.completedAt)}`
                                : record.elapsedDays !== undefined
                                  ? ` (${record.elapsedDays}일째)`
                                  : ''}
                            </span>
                          </div>
                        </li>
                      )
                    })}
                  </ol>
                </div>
              )}
            </section>
          )}

          {/* 4-5. 자녀 모드: 가족 공유 & 알림 안내 */}
          {!isParent && (
            <section
              className="card no-print flex flex-col md:flex-row md:items-center justify-between gap-4 border border-brand-100"
              aria-labelledby="family-share-heading"
            >
              <div>
                <h2 id="family-share-heading" className="text-lg font-extrabold text-brand-900">
                  👨‍👩‍👧 가족과 함께 확인·공유하기
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  개인정보 없이 조회 코드와 현재 진행 상태만 복사해 부모님·형제와 나눌 수 있어요.
                </p>
                <p className="text-xs text-gray-500 mt-2 font-semibold">
                  🔔 {NOTIFICATION_PREP_MESSAGE}
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5 shrink-0">
                <button type="button" className="btn-primary" onClick={handleCopyShare}>
                  {copied ? '✅ 복사 완료!' : '📋 조회 방법 복사하기'}
                </button>
                <button type="button" className="btn-ghost" onClick={() => window.print()}>
                  🖨️ 인쇄·PDF 저장
                </button>
              </div>
            </section>
          )}
        </>
      )}

      {/* 개인정보 및 본인인증 안내 (화면 하단 작은 글씨) */}
      <footer className="text-center text-xs text-gray-400 space-y-1 pt-2">
        <p>
          이 프로토타입은 이름·전화번호·주민등록번호·주소 등 개인 식별정보를 입력받지도 저장하지도 않으며 조회 코드만으로 확인합니다.
        </p>
        <p>
          실제 한국주택금융공사 서비스에서는 본인인증 절차를 거친 뒤 신청 현황을 안전하게 조회하실 수 있습니다.
        </p>
      </footer>
    </div>
  )
}
