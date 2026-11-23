import { HashRouter, Routes, Route } from 'react-router-dom'
import { ModeProvider } from './context/ModeContext'
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
    <ModeProvider>
      <HashRouter>
        <div className="min-h-screen flex flex-col">
          <DemoBadge />
          <Header />
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
    </ModeProvider>
  )
}
