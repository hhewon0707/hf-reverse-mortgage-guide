import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useMode } from '../context/ModeContext'

const navItems = [
  { to: '/', label: '홈' },
  { to: '/find', label: 'AI 맞춤 상담' },
  { to: '/chat', label: '질문하기' },
  { to: '/status', label: '진행 현황' },
  { to: '/consult', label: '상담 예약' },
]

export function RoofLogo({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path d="M3 20 20 5l17 15v3H3z" fill="#12388a" />
      <rect x="9" y="20" width="22" height="15" rx="3" fill="#f97316" />
      <rect x="17" y="26" width="6" height="9" rx="1.5" fill="#fff" />
    </svg>
  )
}

function ModeToggle() {
  const { mode, setMode } = useMode()
  const items = [
    { key: 'parent', label: '부모세대', icon: '👵' },
    { key: 'child', label: '자녀세대', icon: '🧑' },
  ] as const
  return (
    <div
      className="flex bg-gray-100 rounded-full p-1"
      role="group"
      aria-label="화면 모드 전환"
    >
      {items.map((it) => (
        <button
          key={it.key}
          onClick={() => setMode(it.key)}
          aria-pressed={mode === it.key}
          className={`px-3 sm:px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
            mode === it.key ? 'bg-brand-700 text-white shadow' : 'text-gray-600 hover:text-brand-700'
          }`}
        >
          <span className="mr-1">{it.icon}</span>
          {it.label}
        </button>
      ))}
    </div>
  )
}

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="no-print sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-3">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-brand-800 text-lg">
            <RoofLogo />
            <span className="hidden sm:block">주택연금 안내</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1" aria-label="주요 메뉴">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl text-sm font-bold transition-colors ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ModeToggle />
            <button
              className="lg:hidden w-10 h-10 rounded-xl text-gray-600 hover:bg-gray-100 text-xl"
              onClick={() => setOpen(!open)}
              aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
              aria-expanded={open}
            >
              {open ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {open && (
          <nav className="lg:hidden border-t border-gray-100 py-2 grid gap-1" aria-label="모바일 메뉴">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-xl font-bold ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
