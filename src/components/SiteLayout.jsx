import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import TopBar from './TopBar'
import Navbar from './Navbar'
import Footer from './Footer'
import StickyBottomBar from './StickyBottomBar'
import FloatingPhoneIcon from './FloatingPhoneIcon'
import LoginModal from './LoginModal'
import { useScrollDirection } from '../hooks/useScrollDirection'

export default function SiteLayout() {
  const headerVisible = useScrollDirection()
  const [loginOpen, setLoginOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col pb-48 md:pb-20">
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full bg-white transition-transform duration-300 ease-in-out ${
          headerVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <TopBar />
        <Navbar onLoginClick={() => setLoginOpen(true)} />
      </header>
      <main className="flex-1 pt-[108px]">
        <Outlet />
      </main>
      <Footer />
      <StickyBottomBar />
      <FloatingPhoneIcon />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  )
}
