export default function DemoBadge() {
  return (
    <div className="bg-warm-50 border-b border-warm-100 py-1.5 px-4 text-center" role="status">
      <span className="inline-flex items-center gap-2 text-xs sm:text-sm text-warm-600 font-semibold">
        <span className="bg-warm-500 text-white text-[0.7rem] font-bold px-2 py-0.5 rounded-full">시연용</span>
        모든 수치·사례는 가상 데이터이며 참고용 시뮬레이션입니다.
      </span>
    </div>
  )
}
