import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 면책 문구 */}
        <div className="bg-gray-700 rounded-lg p-4 mb-6 border-l-4 border-yellow-400">
          <p className="text-sm text-yellow-300 font-semibold mb-1">⚠️ 면책 안내</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            이 서비스에서 제공하는 모든 예상 월 지급액·시나리오 결과는 <strong className="text-white">참고용 예상치</strong>이며,
            실제 지급 조건은 한국주택금융공사의 심사 결과에 따라 달라질 수 있습니다.
            이 서비스는 가입을 권유하거나 특정 상품을 추천하지 않으며, 판단 근거와 비교 정보만을 제공합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <h3 className="font-bold text-white mb-2">주택연금 안내 서비스</h3>
            <p className="text-sm text-gray-400">
              주택연금 가입 의사결정 지원 및<br />고객 소통 통합 플랫폼
            </p>
            <p className="text-xs text-gray-500 mt-2">본 서비스는 공모전·기획 시연용 프로토타입입니다.</p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-2">바로가기</h3>
            <ul className="space-y-1 text-sm">
              <li><Link to="/find" className="hover:text-white transition-colors">내 연금 알아보기</Link></li>
              <li><Link to="/chat" className="hover:text-white transition-colors">질문하기</Link></li>
              <li><Link to="/consult" className="hover:text-white transition-colors">상담 예약</Link></li>
              <li><Link to="/status" className="hover:text-white transition-colors">진행 현황</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-2">관련 기관</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <a
                  href="https://www.hf.go.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  한국주택금융공사 공식 홈페이지 →
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4 text-xs text-gray-500 text-center">
          <p>© 2024 주택연금 안내 서비스 — 프로토타입 (가상 데이터 사용, 실제 서비스 아님)</p>
          <p className="mt-1">개인정보는 수집하지 않습니다. 입력하신 모든 값은 구간화되어 처리됩니다.</p>
        </div>
      </div>
    </footer>
  )
}
