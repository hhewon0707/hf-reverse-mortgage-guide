import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Mode = 'parent' | 'child'

interface ModeCtx {
  mode: Mode
  setMode: (m: Mode) => void
}

const Ctx = createContext<ModeCtx>({ mode: 'parent', setMode: () => {} })

const KEY = 'hf-mode'

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>(() => {
    try {
      return localStorage.getItem(KEY) === 'child' ? 'child' : 'parent'
    } catch {
      return 'parent'
    }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode)
    try {
      localStorage.setItem(KEY, mode)
    } catch {
      /* 저장 불가 환경은 무시 */
    }
  }, [mode])

  return <Ctx.Provider value={{ mode, setMode: setModeState }}>{children}</Ctx.Provider>
}

export const useMode = () => useContext(Ctx)
