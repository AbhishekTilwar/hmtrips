import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import TopBar from './TopBar'
import Navbar from './Navbar'
import Footer from './Footer'
import StickyBottomBar from './StickyBottomBar'
import FloatingPhoneIcon from './FloatingPhoneIcon'
import LoginModal from './LoginModal'
import PageTransition from './PageTransition'
import { useScrollDirection } from '../hooks/useScrollDirection'

export default function SiteLayout() {
  const headerVisible = useScrollDirection()
  const [loginOpen, setLoginOpen] = useState(false)

  return (
    <div className="min-h-screen min-h-screen-mobile flex flex-col pb-4 md:pb-0 overflow-x-hidden">
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full bg-[#fbf8f3]/95 backdrop-blur-md transition-transform duration-500 ease-out ${
          headerVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <TopBar />
        <Navbar onLoginClick={() => setLoginOpen(true)} />
      </header>
      <main className="flex-1 pt-[88px]">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
      <StickyBottomBar />
      <FloatingPhoneIcon />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  )
}
