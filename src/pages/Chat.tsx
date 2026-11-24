import { useEffect, useRef, useState } from 'react'
import { FALLBACK_TEXT, GREETING, answerQuestion } from '../lib/chatbot'
import { useMode } from '../context/ModeContext'

interface Msg {
  id: number
  from: 'user' | 'bot'
  text: string
  time: string
  isFallback?: boolean
}

const OFFICIAL_URL = 'https://www.hf.go.kr/ko/sub03/sub03_02_05_04.do'
const TYPING_DELAY_MS = 360

function formatTime(date: Date = new Date()): string {
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function createInitialMessages(): Msg[] {
  return [{ id: 0, from: 'bot', text: GREETING, time: formatTime() }]
}

function BotAvatar({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'w-11 h-11' : 'w-9 h-9'
  const iconClass = size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
  return (
    <span
      className={`${sizeClass} rounded-2xl bg-gradient-to-br from-brand-700 to-brand-500 text-white flex items-center justify-center shadow-sm shrink-0`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5.5 9.5V19a1.5 1.5 0 0 0 1.5 1.5h10A1.5 1.5 0 0 0 18.5 19V9.5" />
        <path d="M9.5 14.5h5" />
        <circle cx="9.5" cy="11.5" r="0.8" fill="currentColor" stroke="none" />
        <circle cx="14.5" cy="11.5" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    </span>
  )
}

function MessageText({ text }: { text: string }) {
  if (!text.includes(OFFICIAL_URL)) return <>{text}</>
  const [before, after] = text.split(OFFICIAL_URL)
  return (
    <>
      {before}
      <a
        href={OFFICIAL_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-brand-700 font-semibold underline underline-offset-2 hover:text-brand-800 break-all"
      >
        {OFFICIAL_URL}
      </a>
      {after}
    </>
  )
}

export default function Chat() {
  const { mode } = useMode()
  const isParent = mode === 'parent'
  const [msgs, setMsgs] = useState<Msg[]>(createInitialMessages)
  const [text, setText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const nextId = useRef(1)
  const bubbleText = isParent ? 'text-lg leading-relaxed' : 'text-[0.95rem] leading-relaxed'

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [msgs, isTyping])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const resetChat = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setIsTyping(false)
    nextId.current = 1
    setMsgs(createInitialMessages())
    setText('')
    inputRef.current?.focus()
  }

  const ask = (q: string) => {
    const question = q.trim()
    if (!question || isTyping) return
    const userId = nextId.current++
    const now = formatTime()
    setMsgs((prev) => [...prev, { id: userId, from: 'user', text: question, time: now }])
    setText('')
    setIsTyping(true)

    timerRef.current = setTimeout(() => {
      const answer = answerQuestion(question)
      const botId = nextId.current++
      setMsgs((prev) => [
        ...prev,
        {
          id: botId,
          from: 'bot',
          text: answer.text,
          time: formatTime(),
          isFallback: answer.text === FALLBACK_TEXT,
        },
      ])
      setIsTyping(false)
      timerRef.current = null
    }, TYPING_DELAY_MS)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:py-10">
      <div className="rounded-3xl bg-white shadow-card border border-brand-100/80 overflow-hidden flex flex-col">
        {/* 상단 챗봇 헤더 */}
        <header className="bg-gradient-to-r from-brand-800 via-brand-700 to-brand-600 text-white px-5 py-4 md:px-6 md:py-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative shrink-0">
              <BotAvatar size="lg" />
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-safe-500 ring-2 ring-brand-800"
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className={`font-extrabold tracking-tight truncate ${isParent ? 'text-2xl' : 'text-lg md:text-xl'}`}>
                  HF주택연금 비서
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-brand-100 truncate">
                한국주택금융공사 주택연금 안내 비서 · 시연용
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetChat}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-[0.98] px-3.5 py-2 text-xs sm:text-sm font-bold text-white transition-all"
            aria-label="새 대화 시작"
          >
            <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 10a7 7 0 0 1 12.1-4.8L17 7" />
              <path d="M17 3.5V7h-3.5" />
              <path d="M17 10a7 7 0 0 1-12.1 4.8L3 13" />
              <path d="M3 16.5V13h3.5" />
            </svg>
            새 대화
          </button>
        </header>

        {/* 대화 로그 영역 */}
        <div
          className="px-4 py-6 md:px-6 space-y-5 bg-gradient-to-b from-surface to-white/70 min-h-[420px] h-[56vh] max-h-[600px] overflow-y-auto"
          role="log"
          aria-live="polite"
          aria-label="대화 내용"
        >
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 border border-gray-200/80 px-3.5 py-1 text-xs font-medium text-gray-500 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-safe-500" aria-hidden="true" />
              오늘 · HF주택연금 비서와 대화가 시작되었습니다
            </span>
          </div>

          {msgs.map((m) =>
            m.from === 'user' ? (
              <div key={m.id} className="chat-msg-in flex flex-col items-end gap-1">
                <div
                  className={`max-w-[82%] bg-gradient-to-br from-brand-700 to-brand-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 md:px-5 shadow-sm ${bubbleText}`}
                >
                  {m.text}
                </div>
                <span className="text-[11px] text-gray-400 px-1 tabular-nums">{m.time}</span>
              </div>
            ) : (
              <div key={m.id} className="chat-msg-in flex gap-2.5 items-start">
                <BotAvatar />
                <div className="flex flex-col items-start gap-1 max-w-[84%]">
                  <span className="text-xs font-bold text-brand-800 px-1">HF주택연금 비서</span>
                  <div
                    className={`rounded-2xl rounded-tl-sm px-4 py-3 md:px-5 text-gray-800 shadow-[0_2px_10px_rgba(16,40,90,0.06)] border ${bubbleText} ${
                      m.isFallback
                        ? 'border-warm-200 bg-warm-50/40'
                        : 'border-gray-100 bg-white'
                    }`}
                  >
                    <MessageText text={m.text} />
                  </div>
                  <span className="text-[11px] text-gray-400 px-1 tabular-nums">{m.time}</span>
                </div>
              </div>
            )
          )}

          {isTyping && (
            <div className="chat-msg-in flex gap-2.5 items-start" aria-label="HF주택연금 비서가 답변을 입력 중입니다">
              <BotAvatar />
              <div className="flex flex-col items-start gap-1">
                <span className="text-xs font-bold text-brand-800 px-1">HF주택연금 비서</span>
                <div className="rounded-2xl rounded-tl-sm px-4 py-3.5 bg-white border border-gray-100 shadow-[0_2px_10px_rgba(16,40,90,0.06)] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-400 chat-dot" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-brand-400 chat-dot" style={{ animationDelay: '180ms' }} />
                  <span className="w-2 h-2 rounded-full bg-brand-400 chat-dot" style={{ animationDelay: '360ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* 하단 입력 바 */}
        <form
          className="border-t border-gray-100 bg-white px-4 py-3.5 md:px-5 md:py-4"
          onSubmit={(e) => {
            e.preventDefault()
            ask(text)
          }}
        >
          <div className="flex items-center gap-2 rounded-2xl border-2 border-gray-200 bg-surface/60 focus-within:border-brand-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-100/70 px-3 py-1.5 transition-all">
            <input
              ref={inputRef}
              className={`w-full bg-transparent border-0 focus-visible:outline-none text-gray-900 placeholder:text-gray-400 px-1 ${
                isParent ? 'text-lg py-2.5' : 'text-base py-2'
              }`}
              value={text}
              maxLength={200}
              onChange={(e) => setText(e.target.value)}
              placeholder="주택연금에 대해 궁금한 점을 입력해 주세요"
              aria-label="질문 입력"
            />
            <button
              type="submit"
              disabled={!text.trim() || isTyping}
              className={`shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl font-bold transition-all active:scale-[0.98] ${
                isParent ? 'px-5 py-3 text-base' : 'px-4 py-2.5 text-sm'
              } ${
                !text.trim() || isTyping
                  ? 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed'
                  : 'bg-warm-500 hover:bg-warm-600 text-white shadow-pop'
              }`}
            >
              <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.155.75.75 0 0 0 0-1.114A28.897 28.897 0 0 0 3.105 2.288Z" />
              </svg>
              전송
            </button>
          </div>
          <p className="mt-2 px-1 text-[11px] text-gray-400">Enter 키로 질문 전송</p>
        </form>
      </div>
    </div>
  )
}
