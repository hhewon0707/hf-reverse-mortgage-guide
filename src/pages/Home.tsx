import { Link, useNavigate } from 'react-router-dom'
import { useMode } from '../context/ModeContext'
import SlideDeck, { type Slide } from '../components/SlideDeck'
import Easy from '../components/Easy'
import { loadFaqs } from '../lib/dataLoader'

/** 챗봇 로그 집계 전 시드 데이터 (질문 횟수는 가상 값) */
const FAQ_TOP5 = [
  { id: 'FAQ-003', count: 128 },
  { id: 'FAQ-006', count: 104 },
  { id: 'FAQ-008', count: 87 },
  { id: 'FAQ-010', count: 71 },
  { id: 'FAQ-015', count: 63 },
]

const features = [
  { to: '/find', icon: '🧭', title: 'AI 맞춤 상담', desc: '질문에 답하면 내게 맞는 상품·지급방식을 비교해 드려요.', tag: '핵심' },
  { to: '/chat', icon: '💬', title: '질문하기', desc: '궁금한 점을 바로 물어보세요. 근거와 함께 답해요.', tag: '' },
  { to: '/status', icon: '📍', title: '진행 현황', desc: '내 신청이 어디까지 왔는지, 언제 끝나는지 확인해요.', tag: '' },
  { to: '/consult', icon: '📅', title: '상담 예약', desc: '방문·전화·화상 중 편한 방법으로 예약해요.', tag: '' },
]

function RoofHero() {
  return (
    <svg viewBox="0 0 400 220" className="absolute right-0 bottom-0 w-[70%] max-w-md opacity-20 pointer-events-none" aria-hidden="true">
      <path d="M10 120 200 15l190 105" fill="none" stroke="#fff" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="70" y="120" width="260" height="100" rx="14" fill="#fff" />
    </svg>
  )
}

export default function Home() {
  const { mode, setMode } = useMode()
  const navigate = useNavigate()
  const isParent = mode === 'parent'
  const faqs = loadFaqs()

  const summarySlides: Slide[] = [
    {
      key: 's1',
      label: '주택연금이란?',
      node: (
        <div className="text-center py-4">
          <div className="text-6xl mb-4">🏡</div>
          <h3 className="text-2xl font-extrabold text-brand-800 mb-3">내 집에 살면서, 매달 연금을 받아요</h3>
          <p className="text-gray-600 max-w-xl mx-auto">
            집을 팔지 않고 <Easy word="담보로 맡기고" easy="집을 보증처럼 맡겨 두는 것" />, 평생 또는 정해진 기간 동안 매달 생활비를 받는 제도예요.
            한국주택금융공사가 보증합니다.
          </p>
        </div>
      ),
    },
    {
      key: 's2',
      label: '누가 신청할 수 있나요?',
      node: (
        <div className="text-center py-4">
          <div className="text-6xl mb-4">👫</div>
          <h3 className="text-2xl font-extrabold text-brand-800 mb-3">부부 중 한 분이 만 55세 이상이면 살펴볼 수 있어요</h3>
          <p className="text-gray-600 max-w-xl mx-auto">
            <Easy word="공시가격" easy="나라에서 정한 집값 기준" /> 합산 12억 이하 주택이 기본 기준이에요. 월 수령액은
            부부 중 <strong>나이가 적은 분</strong> 기준으로 정해져요.
          </p>
        </div>
      ),
    },
    {
      key: 's3',
      label: '집은 어떻게 되나요?',
      node: (
        <div className="text-center py-4">
          <div className="text-6xl mb-4">👨‍👩‍👧</div>
          <h3 className="text-2xl font-extrabold text-brand-800 mb-3">돌아가신 뒤 정산하고, 남으면 자녀에게 돌아가요</h3>
          <p className="text-gray-600 max-w-xl mx-auto">
            집을 처분해 정산한 뒤 남는 금액은 상속인에게 돌아가고, 부족해도 자녀에게 청구하지 않는 구조예요.
            <span className="block text-sm text-gray-400 mt-2">세부 정산 절차는 공식 약관 확인이 필요해요.</span>
          </p>
        </div>
      ),
    },
  ]

  const faqSlides: Slide[] = FAQ_TOP5.map((t, idx) => {
    const f = faqs.find((x) => x.id === t.id)!
    return {
      key: t.id,
      label: `자주 묻는 질문 ${idx + 1}위`,
      node: (
        <div className="py-2">
          <div className="flex items-center gap-2 mb-3">
            <span className="chip-warm">TOP {idx + 1}</span>
            <span className="chip-gray">{f.category}</span>
            <span className="text-xs text-gray-400">시연용 질문 {t.count}회</span>
          </div>
          <h3 className="text-xl font-extrabold text-brand-800 mb-3">Q. {f.question}</h3>
          <p className="text-gray-700 font-semibold mb-3">{f.summary}</p>
          <p className="text-gray-600 text-[0.95rem]">{f.answer}</p>
          <p className="text-xs text-gray-400 mt-3">
            출처: {f.source} · {f.id}
            {f.needs_verification && ' · 공식 확인 필요'}
          </p>
        </div>
      ),
    }
  })

  return (
    <div>
      {/* 히어로 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-500 text-white">
        <RoofHero />
        <div className="relative max-w-6xl mx-auto px-4 py-14 md:py-20">
          <span className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-sm font-semibold mb-5">
            🏠 HF 주택연금 · 참고용 시뮬레이션
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
            내 집에 살면서
            <br />
            <span className="text-warm-400">매달 받을 수 있는 금액</span>을
            <br />
            바로 확인해 보세요
          </h1>
          <p className="text-brand-100 text-lg mb-8 max-w-xl">
            {isParent
              ? '질문에 하나씩 답하시면 됩니다. 어려운 말은 쉬운 말로 풀어 드려요.'
              : '조건 입력 → 추천 상품·지급방식 비교 → 비용·절세 혜택까지 슬라이드로 빠르게 훑어보세요.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/find" className="btn-accent text-lg">
              💰 내 월 수령액 알아보기
            </Link>
            <Link to="/status" className="btn bg-white/15 text-white hover:bg-white/25 text-lg">
              📍 내 신청 진행 상황 보기
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">
        {/* 자녀 진입 */}
        <section className="-mt-8 relative z-10">
          <div className="card flex flex-col md:flex-row md:items-center justify-between gap-4 border border-warm-100">
            <div>
              <p className="text-lg font-extrabold text-brand-800">👨‍👩‍👧 부모님을 위해 알아보는 자녀분이신가요?</p>
              <p className="text-gray-500 text-sm">자녀세대 모드로 바꾸면 비교 카드와 대화 가이드, 세대이음 포인트를 빠르게 볼 수 있어요.</p>
            </div>
            <button
              className="btn-primary shrink-0"
              onClick={() => {
                setMode('child')
                navigate('/find')
              }}
            >
              자녀세대 모드로 시작
            </button>
          </div>
        </section>

        {/* 기능 소개 */}
        <section className="mt-14">
          <h2 className="text-2xl font-extrabold text-brand-900 mb-1">한 곳에서 끝내는 주택연금</h2>
          <p className="text-gray-500 mb-5">알아보기 → 질문하기 → 신청 → 진행 확인까지 이어져요.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <Link key={f.to} to={f.to} className="card !p-6 hover:-translate-y-1 transition-transform block">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-4xl">{f.icon}</span>
                  {f.tag && <span className="chip-warm">{f.tag}</span>}
                </div>
                <h3 className="text-lg font-extrabold text-brand-800 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* 핵심 요약 + FAQ */}
        <section className="mt-14 grid lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-2xl font-extrabold text-brand-900 mb-4">주택연금 핵심 요약</h2>
            <div className="card">
              <SlideDeck slides={summarySlides} />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-brand-900 mb-4">자주 묻는 질문 TOP 5</h2>
            <div className="card">
              <SlideDeck slides={faqSlides} />
            </div>
          </div>
        </section>

        <section className="mt-14 card bg-gradient-to-r from-brand-50 to-warm-50 text-center">
          <h2 className="text-2xl font-extrabold text-brand-900 mb-2">3분이면 충분해요</h2>
          <p className="text-gray-600 mb-5">생년월일·집값 같은 기본 정보만 입력해도 예상 월 수령액을 볼 수 있어요.</p>
          <Link to="/find" className="btn-accent text-lg">
            AI 맞춤 상담 시작하기 →
          </Link>
        </section>
      </div>
    </div>
  )
}
