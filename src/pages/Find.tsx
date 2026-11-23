import { useMemo, useState, type ReactNode } from 'react'
import { useMode } from '../context/ModeContext'
import SlideDeck, { type Slide } from '../components/SlideDeck'
import Easy from '../components/Easy'
import FindResult from './FindResult'
import {
  DEFAULT_INPUT,
  calcAge,
  fmtMan,
  type Concern,
  type FindInput,
} from '../lib/estimate'

function Q({ title, hint, children }: { title: ReactNode; hint?: ReactNode; children: ReactNode }) {
  return (
    <div>
      <h2 className="text-2xl font-extrabold text-brand-900 mb-2">{title}</h2>
      {hint && <p className="text-gray-500 mb-5">{hint}</p>}
      <div className="grid gap-3 mt-4">{children}</div>
    </div>
  )
}

function Opt({
  on,
  onClick,
  title,
  desc,
}: {
  on: boolean
  onClick: () => void
  title: ReactNode
  desc?: ReactNode
}) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} className={`opt ${on ? 'opt-on' : ''}`}>
      <span className="flex items-start gap-3">
        <span
          className={`mt-1 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[0.65rem] ${
            on ? 'bg-brand-600 border-brand-600 text-white' : 'border-gray-300'
          }`}
        >
          {on ? '✓' : ''}
        </span>
        <span>
          <span className="block">{title}</span>
          {desc && <span className="block text-sm font-normal text-gray-500 mt-0.5">{desc}</span>}
        </span>
      </span>
    </button>
  )
}

function Money({
  value,
  onChange,
  min,
  max,
  step,
}: {
  value: number
  onChange: (n: number) => void
  min: number
  max: number
  step: number
}) {
  return (
    <div className="bg-surface rounded-2xl p-5">
      <p className="num text-3xl text-brand-700 text-center mb-3">{fmtMan(value)}</p>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={Math.min(max, Math.max(min, value))}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="금액 슬라이더"
      />
      <div className="flex items-center gap-2 mt-3">
        <input
          type="number"
          className="input"
          min={0}
          step={step}
          value={value || ''}
          placeholder="직접 입력"
          onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
          aria-label="금액 직접 입력 (만원)"
        />
        <span className="font-bold text-gray-500 shrink-0">만원</span>
      </div>
    </div>
  )
}

export default function Find() {
  const { mode } = useMode()
  const [input, setInput] = useState<FindInput>(DEFAULT_INPUT)
  const [done, setDone] = useState(false)
  const [deckKey, setDeckKey] = useState(0)

  const set = <K extends keyof FindInput>(k: K, v: FindInput[K]) => setInput((p) => ({ ...p, [k]: v }))

  const ownerAge = calcAge(input.ownerBirth)
  const spouseAge = input.hasSpouse ? calcAge(input.spouseBirth) : null
  const youngest = [ownerAge, spouseAge].filter((a): a is number => a !== null)
  const youngestAge = youngest.length ? Math.min(...youngest) : null
  const isParentTarget = input.target === 'parent'
  const who = isParentTarget ? '부모님' : '본인'

  const toggleConcern = (c: Concern) =>
    setInput((p) => {
      const has = p.concerns.includes(c)
      if (has) return { ...p, concerns: p.concerns.filter((x) => x !== c) }
      if (p.concerns.length >= 3) return p
      return { ...p, concerns: [...p.concerns, c] }
    })

  const slides: Slide[] = useMemo(
    () => [
      {
        key: 'target',
        label: '누구를 위해',
        node: (
          <Q title="누구를 위해 알아보시나요?" hint="선택에 따라 안내 문구가 달라져요.">
            <Opt on={input.target === 'self'} onClick={() => set('target', 'self')} title="🙋 본인을 위해서요" desc="직접 가입을 알아보는 경우" />
            <Opt on={input.target === 'parent'} onClick={() => set('target', 'parent')} title="👨‍👩‍👧 부모님을 위해서요" desc="자녀로서 부모님 가입을 검토하는 경우 (부모님 기준으로 입력해 주세요)" />
          </Q>
        ),
      },
      {
        key: 'birth',
        label: '생년월일',
        canNext: ownerAge !== null && (!input.hasSpouse || spouseAge !== null),
        node: (
          <Q
            title={`${who === '본인' ? '' : '부모님 중 '}주택 소유자의 생년월일을 알려주세요`}
            hint="월 수령액은 부부 중 나이가 적은 분(연소자) 기준으로 계산해요. 입력값은 연령 구간으로만 처리돼요."
          >
            <label className="font-bold text-sm text-gray-600">주택 소유자 생년월일</label>
            <input type="date" className="input" value={input.ownerBirth} max={new Date().toISOString().slice(0, 10)} onChange={(e) => set('ownerBirth', e.target.value)} />
            {ownerAge !== null && <p className="chip w-fit">만 {ownerAge}세</p>}
            <Opt on={input.hasSpouse} onClick={() => set('hasSpouse', !input.hasSpouse)} title="배우자가 있어요" desc="부부 중 연소자 기준 연령이 적용돼요." />
            {input.hasSpouse && (
              <>
                <label className="font-bold text-sm text-gray-600">배우자 생년월일</label>
                <input type="date" className="input" value={input.spouseBirth} max={new Date().toISOString().slice(0, 10)} onChange={(e) => set('spouseBirth', e.target.value)} />
                {spouseAge !== null && <p className="chip w-fit">만 {spouseAge}세</p>}
              </>
            )}
            {youngestAge !== null && (
              <p className="chip-safe w-fit">계산 기준 연령(연소자): 만 {youngestAge}세</p>
            )}
          </Q>
        ),
      },
      {
        key: 'housing',
        label: '주택 구분',
        node: (
          <Q title="어떤 주택인가요?" hint="주택 종류에 따라 월 수령액 일람표가 달라져요.">
            <Opt on={input.houseKind === 'house'} onClick={() => set('houseKind', 'house')} title="주택법 제2조제1호의 주택" desc="아파트·단독·다세대·연립 등" />
            <Opt on={input.houseKind === 'senior'} onClick={() => set('houseKind', 'senior')} title="노인복지주택" />
            <Opt on={input.houseKind === 'officetel'} onClick={() => set('houseKind', 'officetel')} title="주거목적 오피스텔" desc="실제 주거용으로 사용하는 오피스텔" />
            {input.houseKind === 'house' && (
              <Opt on={input.isApartment} onClick={() => set('isApartment', !input.isApartment)} title="아파트예요" desc="아파트는 시세 적용 방식이 달라요 (다음 화면 안내)." />
            )}
            <Opt on={input.lowestFloor} onClick={() => set('lowestFloor', !input.lowestFloor)} title="최저층(1층 등)이에요" desc="주택 가격을 산정할 때 확인될 수 있어 미리 체크해 둬요." />
          </Q>
        ),
      },
      {
        key: 'price',
        label: '주택 가격',
        canNext: input.priceManwon > 0,
        node: (
          <Q title="집값은 어느 정도인가요?" hint="대략적인 시세면 충분해요. 표에 없는 금액은 가까운 구간 값을 이어서 계산해요.">
            <Money value={input.priceManwon} onChange={(n) => set('priceManwon', n)} min={5000} max={150000} step={500} />
            <div className="bg-brand-50 rounded-2xl p-4 text-sm text-brand-800">
              {input.houseKind === 'house' && input.isApartment ? (
                <>📌 아파트는 <strong>한국부동산원 시세</strong>를 먼저 적용하고, 없으면 <strong>KB국민은행 시세</strong>를 적용해요.</>
              ) : (
                <>📌 {input.houseKind === 'officetel' ? '오피스텔' : '아파트 외 주택'}은 <strong>감정평가 시세</strong>로 정해져요. 입력하신 금액은 참고용이에요.</>
              )}
            </div>
          </Q>
        ),
      },
      {
        key: 'count',
        label: '보유 주택',
        node: (
          <Q
            title="보유 중인 주택은 몇 채인가요?"
            hint={<>부부 합산 기준이에요. <Easy word="공시가격" easy="나라에서 정한 집값 기준" />은 합산 12억 이하가 기본 조건이에요.</>}
          >
            <Opt on={input.houseCount === 1} onClick={() => set('houseCount', 1)} title="1채" />
            <Opt on={input.houseCount === 2} onClick={() => set('houseCount', 2)} title="2채" />
            <Opt on={input.houseCount === 3} onClick={() => set('houseCount', 3)} title="3채 이상" />
            <p className="font-bold text-sm text-gray-600 mt-2">보유 주택 공시가격 합계 (부부합산)</p>
            <Money value={input.publicPriceManwon} onChange={(n) => set('publicPriceManwon', n)} min={5000} max={200000} step={1000} />
            {input.publicPriceManwon > 120000 && (
              <div className="bg-warm-50 text-warm-600 rounded-2xl p-4 text-sm font-semibold">
                {input.houseCount === 2
                  ? '12억을 넘는 2주택자는 신규 가입 후 3년 이내에 1주택을 처분하는 조건으로 가입할 수 있어요.'
                  : '합산 공시가격이 12억을 넘으면 가입이 어려울 수 있어요. 결과 화면에서 자세히 안내해 드릴게요.'}
              </div>
            )}
          </Q>
        ),
      },
      {
        key: 'residence',
        label: '거주 요건',
        node: (
          <Q title="지금 그 집에 실제로 살고 계신가요?" hint="주택연금은 실거주가 기본이에요.">
            <Opt on={input.residence === 'living'} onClick={() => set('residence', 'living')} title="네, 살고 있어요" />
            <Opt on={input.residence === 'exception'} onClick={() => set('residence', 'exception')} title="지금은 거주하지 않지만 예외 사유가 있어요" />
            <Opt on={input.residence === 'unsure'} onClick={() => set('residence', 'unsure')} title="잘 모르겠어요" />
            <div className="bg-surface rounded-2xl p-4 text-sm text-gray-600">
              <p className="font-bold text-gray-700 mb-1">실거주 예외로 인정될 수 있는 경우 (부부합산 1주택자)</p>
              <ul className="list-disc pl-5 space-y-0.5">
                <li>질병 치료를 위한 입원 또는 요양시설 이용</li>
                <li>자녀 봉양을 위한 장기 체류</li>
                <li>노인주거복지시설로 이주</li>
              </ul>
            </div>
          </Q>
        ),
      },
      {
        key: 'capacity',
        label: '계약 능력',
        node: (
          <Q title="계약을 직접 하실 수 있는 상태인가요?" hint={<>계약 당사자(<Easy word="채무관계자" easy="계약에 함께 이름을 올리는 사람" />)는 의사능력과 행위능력이 있어야 해요.</>}>
            <Opt on={input.capacity === 'ok'} onClick={() => set('capacity', 'ok')} title="네, 문제없어요" />
            <Opt on={input.capacity === 'limited'} onClick={() => set('capacity', 'limited')} title="치매 등으로 판단이 어려운 부분이 있어요" desc="성년후견제도를 활용하는 방법을 안내해 드려요." />
          </Q>
        ),
      },
      {
        key: 'pension',
        label: '기초연금',
        node: (
          <Q title="기초연금을 받고 계신가요?" hint="기초연금 수급권자이면서 부부합산 시가 2.5억 미만 1주택이면 우대형을 살펴볼 수 있어요.">
            <Opt on={input.basicPension} onClick={() => set('basicPension', true)} title="네, 받고 있어요(수급권자예요)" />
            <Opt on={!input.basicPension} onClick={() => set('basicPension', false)} title="아니요 / 잘 모르겠어요" />
          </Q>
        ),
      },
      {
        key: 'loan',
        label: '주택담보대출',
        node: (
          <Q title="그 집에 남아 있는 주택담보대출이 있나요?" hint="없으면 0으로 두세요. 있으면 '주택담보대출 상환용 주택연금'을 함께 안내해 드려요.">
            <Money value={input.loanManwon} onChange={(n) => set('loanManwon', n)} min={0} max={100000} step={500} />
            {input.loanManwon > 0 && (
              <div className="bg-brand-50 rounded-2xl p-4 text-sm text-brand-800">
                💡 대출 상환용은 인출한도를 대출한도의 <strong>50% 초과~90% 이하</strong>까지 설정할 수 있어요.
              </div>
            )}
          </Q>
        ),
      },
      {
        key: 'stay',
        label: '거주 의향',
        node: (
          <Q title="앞으로도 그 집에서 계속 사실 계획인가요?">
            <Opt on={input.stay === 'stay'} onClick={() => set('stay', 'stay')} title="네, 계속 살고 싶어요" />
            <Opt on={input.stay === 'move'} onClick={() => set('stay', 'move')} title="가까운 시일에 이사할 수도 있어요" />
            <Opt on={input.stay === 'unsure'} onClick={() => set('stay', 'unsure')} title="아직 정하지 못했어요" />
          </Q>
        ),
      },
      {
        key: 'bequest',
        label: '상속 선호',
        node: (
          <Q title="집을 자녀에게 물려주는 것에 대해 어떻게 생각하세요?">
            <Opt on={input.bequest === 'want'} onClick={() => set('bequest', 'want')} title="집을 물려주고 싶어요" />
            <Opt on={input.bequest === 'neutral'} onClick={() => set('bequest', 'neutral')} title="상관없어요" />
            <Opt on={input.bequest === 'max_income'} onClick={() => set('bequest', 'max_income')} title="최대한 많이 받고 싶어요" />
          </Q>
        ),
      },
      {
        key: 'concerns',
        label: '걱정되는 것',
        node: (
          <Q title="가장 걱정되는 것을 골라 주세요" hint={`최대 3개까지 선택할 수 있어요. (${input.concerns.length}/3)`}>
            {(
              [
                ['inheritance', '상속 문제'],
                ['price_rise', '집값이 오를 때 손해'],
                ['child_opposition', '자녀의 반대'],
                ['fees', '비용·수수료'],
                ['complex_process', '절차의 복잡성'],
                ['other', '기타 (직접 입력)'],
              ] as [Concern, string][]
            ).map(([c, label]) => (
              <Opt key={c} on={input.concerns.includes(c)} onClick={() => toggleConcern(c)} title={label} />
            ))}
            {input.concerns.includes('other') && (
              <input
                className="input"
                placeholder="걱정되는 점을 적어 주세요 (개인정보는 적지 마세요)"
                maxLength={100}
                value={input.concernOther}
                onChange={(e) => set('concernOther', e.target.value)}
              />
            )}
          </Q>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input, ownerAge, spouseAge, youngestAge, who]
  )

  if (done) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <FindResult
          key={deckKey}
          input={input}
          onRestart={() => {
            setDone(false)
            setDeckKey((k) => k + 1)
          }}
        />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <span className="chip-warm mb-2">AI 맞춤 주택연금 상담</span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-brand-900">
          몇 가지만 알려주시면 <span className="text-warm-500">맞춤 결과</span>를 보여드려요
        </h1>
        <p className="text-gray-500 mt-1 text-sm">입력하신 정보는 저장되지 않고, 결과는 참고용 시뮬레이션입니다.</p>
      </div>

      {mode === 'child' && (
        <div className="flex flex-wrap gap-2 mb-4" aria-label="입력 요약">
          <span className="chip">{isParentTarget ? '부모님 대상' : '본인 대상'}</span>
          {youngestAge !== null && <span className="chip">연소자 만 {youngestAge}세</span>}
          <span className="chip">집값 {fmtMan(input.priceManwon)}</span>
          {input.loanManwon > 0 && <span className="chip-warm">대출 {fmtMan(input.loanManwon)}</span>}
          {input.basicPension && <span className="chip-safe">기초연금</span>}
        </div>
      )}

      <div className="card">
        <SlideDeck slides={slides} finishLabel="맞춤 결과 보기 ✨" onFinish={() => setDone(true)} />
      </div>
    </div>
  )
}
