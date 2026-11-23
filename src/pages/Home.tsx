import { Link } from 'react-router-dom'

const faqTop5 = [
  { q: '주택연금이란 무엇인가요?', category: '기본 정보' },
  { q: '얼마나 받을 수 있나요?', category: '월 지급액' },
  { q: '가입 조건이 어떻게 되나요?', category: '가입 조건' },
  { q: '집값이 오르면 손해 아닌가요?', category: '걱정 해소' },
  { q: '돌아가신 후 자녀가 빚을 갚아야 하나요?', category: '상속·정산' },
]

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* 히어로 섹션 */}
      <section className="text-center mb-14">
        <h1 className="text-3xl md:text-4xl font-bold text-hf-blue mb-4 leading-tight">
          내 집에 살면서<br />매달 연금을 받을 수 있습니다
        </h1>
        <p className="text-gray-600 text-lg mb-8 max-w-xl mx-auto">
          주택연금에 대해 한 곳에서 쉽게 알아보고,<br />
          나에게 맞는지 직접 확인해 보세요.
        </p>
        {/* 핵심 CTA 버튼 2개 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/find"
            className="inline-flex items-center justify-center gap-2 bg-hf-blue text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:bg-hf-lightblue transition-colors"
          >
            <span>💰</span>
            내 월 수령액 알아보기
          </Link>
          <Link
            to="/status"
            className="inline-flex items-center justify-center gap-2 bg-white text-hf-blue border-2 border-hf-blue px-8 py-4 rounded-xl text-lg font-bold shadow hover:bg-blue-50 transition-colors"
          >
            <span>📋</span>
            내 신청 진행 상황 보기
          </Link>
        </div>
      </section>

      {/* 자녀 모드 진입 */}
      <section className="bg-green-50 border border-green-200 rounded-xl p-5 mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-green-800 text-lg">👨‍👩‍👧 부모님을 위해 알아보는 자녀분이신가요?</p>
          <p className="text-green-700 text-sm mt-1">부모님께 맞는 조건과 가족 동의 가이드를 확인해 드립니다.</p>
        </div>
        <Link
          to="/find?mode=child"
          className="shrink-0 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          자녀 모드로 시작하기 →
        </Link>
      </section>

      {/* 주택연금 3줄 요약 카드 */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-800 mb-5">주택연금이란?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: '🏠',
              title: '내 집에 계속 살며',
              desc: '주택 소유권은 그대로 유지하고, 담보로만 제공합니다.',
            },
            {
              icon: '💳',
              title: '매달 연금을 받고',
              desc: '사망할 때까지 매달 약정된 금액을 지급받습니다.',
            },
            {
              icon: '✅',
              title: '자녀에게 빚은 없어요',
              desc: '집을 처분해 정산하며, 부족해도 자녀에게 청구되지 않습니다.',
            },
          ].map((card) => (
            <div key={card.title} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="text-3xl mb-3">{card.icon}</div>
              <h3 className="font-bold text-gray-800 mb-2">{card.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 자주 묻는 질문 Top 5 */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-5">
          자주 묻는 질문 Top 5
          <span className="ml-2 text-sm text-gray-400 font-normal">(챗봇 질문 집계 기반)</span>
        </h2>
        <ul className="space-y-3">
          {faqTop5.map((item, i) => (
            <li key={i}>
              <Link
                to={`/chat?q=${encodeURIComponent(item.q)}`}
                className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-hf-blue hover:shadow-md transition-all group"
              >
                <span className="text-2xl font-bold text-hf-blue opacity-40 group-hover:opacity-100 w-8 shrink-0">
                  {i + 1}
                </span>
                <span className="flex-1 font-medium text-gray-800 group-hover:text-hf-blue">
                  {item.q}
                </span>
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full shrink-0">
                  {item.category}
                </span>
                <span className="text-gray-400 group-hover:text-hf-blue">→</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="text-center mt-6">
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 text-hf-blue font-semibold hover:underline"
          >
            💬 더 궁금한 점은 챗봇에게 물어보기 →
          </Link>
        </div>
      </section>
    </div>
  )
}
