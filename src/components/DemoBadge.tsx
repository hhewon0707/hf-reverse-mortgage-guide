/**
 * 화면 상단에 표시되는 "시연용 가상 데이터" 배지
 * 모든 수치는 샘플 데이터임을 항상 사용자에게 알립니다.
 */
export default function DemoBadge() {
  return (
    <div
      className="bg-amber-50 border-b border-amber-300 py-2 px-4 text-center"
      role="status"
      aria-live="polite"
    >
      <span className="inline-flex items-center gap-2 text-sm text-amber-800 font-medium">
        <span className="bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded">시연용</span>
        이 서비스의 모든 수치·사례는 가상 데이터입니다. 실제 주택연금 조건과 다를 수 있습니다.
      </span>
    </div>
  )
}
