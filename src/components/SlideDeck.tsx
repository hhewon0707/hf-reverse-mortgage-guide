import { useCallback, useEffect, useState, type ReactNode } from 'react'

export interface Slide {
  key: string
  label: string
  node: ReactNode
  /** false면 '다음' 버튼 비활성 (필수 입력 미완료) */
  canNext?: boolean
}

interface Props {
  slides: Slide[]
  /** 마지막 슬라이드에서 '다음' 대신 표시할 버튼 */
  finishLabel?: string
  onFinish?: () => void
  onIndexChange?: (i: number) => void
}

export default function SlideDeck({ slides, finishLabel, onFinish, onIndexChange }: Props) {
  const [i, setI] = useState(0)
  const last = i === slides.length - 1
  const slide = slides[i]
  const canNext = slide.canNext !== false

  const go = useCallback(
    (n: number) => {
      const next = Math.max(0, Math.min(slides.length - 1, n))
      setI(next)
      onIndexChange?.(next)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [slides.length, onIndexChange]
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.key === 'ArrowRight' && canNext && !last) go(i + 1)
      if (e.key === 'ArrowLeft') go(i - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [i, canNext, last, go])

  return (
    <div>
      {/* 단계 인디케이터 */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-bold text-brand-700">{slide.label}</span>
          <span className="text-gray-500 num">
            {i + 1} / {slides.length}
          </span>
        </div>
        <div className="flex gap-1.5" role="progressbar" aria-valuenow={i + 1} aria-valuemax={slides.length}>
          {slides.map((s, idx) => (
            <button
              key={s.key}
              onClick={() => idx <= i && go(idx)}
              aria-label={`${idx + 1}번째 단계: ${s.label}`}
              className={`h-2 flex-1 rounded-full transition-colors ${
                idx < i ? 'bg-brand-400 cursor-pointer' : idx === i ? 'bg-warm-500' : 'bg-gray-200 cursor-default'
              }`}
            />
          ))}
        </div>
      </div>

      <div key={slide.key} className="slide-in">
        {slide.node}
      </div>

      <div className="flex items-center justify-between gap-3 mt-6">
        <button className={`btn-ghost ${i === 0 ? 'btn-disabled' : ''}`} onClick={() => go(i - 1)}>
          ← 이전
        </button>
        {last ? (
          onFinish && (
            <button className="btn-accent" onClick={onFinish}>
              {finishLabel ?? '완료'}
            </button>
          )
        ) : (
          <button className={`btn-accent ${canNext ? '' : 'btn-disabled'}`} onClick={() => go(i + 1)}>
            다음 →
          </button>
        )}
      </div>
    </div>
  )
}
