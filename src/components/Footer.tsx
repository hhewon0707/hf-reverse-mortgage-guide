import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="no-print bg-brand-900 text-brand-100 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-white/10 rounded-2xl p-4 mb-8 border-l-4 border-warm-400">
          <p className="text-sm text-warm-100 font-bold mb-1">⚠️ 면책 안내</p>
          <p className="text-sm text-brand-100 leading-relaxed">
            이 서비스의 모든 예상 월 수령액·추천 결과는 <strong className="text-white">참고용 시뮬레이션</strong>이며,
            실제 지급 조건은 한국주택금융공사의 심사 결과에 따라 달라질 수 있습니다. 가입을 권유하거나
            특정 선택을 단정하지 않고, 판단에 필요한 비교 정보를 제공합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-sm">
          <div>
            <h3 className="font-bold text-white mb-2">주택연금 안내 서비스</h3>
            <p className="text-brand-200">주택연금 가입 의사결정 지원 및 고객 소통 통합 플랫폼</p>
            <p className="text-xs text-brand-300 mt-2">공모전·기획 시연용 프로토타입 (가상 데이터)</p>
          </div>
          <div>
            <h3 className="font-bold text-white mb-2">바로가기</h3>
            <ul className="space-y-1">
              <li><Link to="/find" className="hover:text-white">AI 맞춤 상담</Link></li>
              <li><Link to="/chat" className="hover:text-white">HF주택연금 비서</Link></li>
              <li><Link to="/consult" className="hover:text-white">상담 예약</Link></li>
              <li><Link to="/status" className="hover:text-white">진행 현황</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white mb-2">관련 기관</h3>
            <a href="https://www.hf.go.kr" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              한국주택금융공사 공식 홈페이지 →
            </a>
          </div>
        </div>

        <p className="border-t border-white/10 pt-4 text-xs text-brand-300 text-center">
          © 주택연금 안내 서비스 — 프로토타입 · 개인정보는 수집하지 않으며 입력값은 구간화되어 처리됩니다.
        </p>
      </div>
    </footer>
  )
}
