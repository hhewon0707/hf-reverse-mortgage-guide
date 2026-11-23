import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: '홈' },
  { to: '/find', label: '내 연금 알아보기' },
  { to: '/chat', label: '질문하기' },
  { to: '/status', label: '진행 현황' },
  { to: '/consult', label: '상담 예약' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link to="/" className="flex items-center gap-2 font-bold text-hf-blue text-lg min-h-0 min-w-0">
            <span className="text-2xl">🏠</span>
            <span className="hidden sm:block">주택연금 안내</span>
          </Link>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center gap-1" aria-label="주요 메뉴">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors min-h-0 ${
                    isActive
                      ? 'bg-hf-blue text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* 오른쪽: 글자 크기 + 햄버거 */}
          <div className="flex items-center gap-2">
            <FontSizeControl />
            {/* 모바일 햄버거 */}
            <button
              className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
              aria-expanded={menuOpen}
            >
              <span className="text-xl">{menuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>

        {/* 모바일 드롭다운 메뉴 */}
        {menuOpen && (
          <nav
            className="md:hidden border-t border-gray-200 py-2"
            aria-label="모바일 메뉴"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 text-base font-medium border-l-4 ${
                    isActive
                      ? 'border-hf-blue text-hf-blue bg-blue-50'
                      : 'border-transparent text-gray-700 hover:bg-gray-50'
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

/* 글자 크기 조절 버튼 */
function FontSizeControl() {
  const sizes = [
    { key: 'normal', label: '가', title: '기본 글자 크기' },
    { key: 'large', label: '가+', title: '큰 글자' },
    { key: 'xlarge', label: '가++', title: '매우 큰 글자' },
  ] as const

  const [current, setCurrent] = useState<'normal' | 'large' | 'xlarge'>('normal')

  const handleChange = (size: typeof current) => {
    setCurrent(size)
    document.documentElement.setAttribute('data-font-size', size)
  }

  return (
    <div className="flex items-center gap-1" role="group" aria-label="글자 크기 조절">
      {sizes.map((s) => (
        <button
          key={s.key}
          onClick={() => handleChange(s.key)}
          title={s.title}
          aria-pressed={current === s.key}
          className={`px-2 py-1 rounded text-xs font-bold border transition-colors min-h-0 min-w-0 ${
            current === s.key
              ? 'bg-hf-blue text-white border-hf-blue'
              : 'bg-white text-gray-600 border-gray-300 hover:border-hf-blue'
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}
