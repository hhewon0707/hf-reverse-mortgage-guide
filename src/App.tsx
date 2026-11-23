import { HashRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import DemoBadge from './components/DemoBadge'
import Home from './pages/Home'
import Find from './pages/Find'
import Chat from './pages/Chat'
import Consult from './pages/Consult'
import Status from './pages/Status'
import Admin from './pages/Admin'

export default function App() {
  return (
    <HashRouter>
      {/* 시연용 가상 데이터 배지 */}
      <DemoBadge />
      {/* 고정 헤더 */}
      <Header />
      {/* 헤더 높이만큼 여백 (헤더 h-16 = 64px + DemoBadge ~40px) */}
      <div className="pt-[104px] min-h-screen flex flex-col">
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/find" element={<Find />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/consult" element={<Consult />} />
            <Route path="/status" element={<Status />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  )
}
