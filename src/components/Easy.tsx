import { useMode } from '../context/ModeContext'

/** 어려운 금융 용어 + 쉬운 말 풀이. 부모세대 모드에서는 풀이를 항상 보여줍니다. */
export default function Easy({ word, easy }: { word: string; easy: string }) {
  const { mode } = useMode()
  if (mode === 'parent') {
    return (
      <span>
        <strong className="text-brand-800">{word}</strong>
        <span className="ml-1 text-warm-600 text-[0.85em] font-semibold">(쉬운 말: {easy})</span>
      </span>
    )
  }
  return (
    <span title={easy} className="underline decoration-dotted decoration-brand-300 underline-offset-4 cursor-help">
      {word}
    </span>
  )
}
