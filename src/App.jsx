import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import TopBar from './components/TopBar'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import StickyBottomBar from './components/StickyBottomBar'
import FloatingPhoneIcon from './components/FloatingPhoneIcon'
import SplashScreen from './components/SplashScreen'
import UpcomingTours from './pages/UpcomingTours'
import Itinerary from './pages/Itinerary'
import { useScrollDirection } from './hooks/useScrollDirection'

const SPLASH_DURATION_MS = 2500
const SPLASH_FADEOUT_MS = 500

function App() {
  const headerVisible = useScrollDirection()
  const [splashVisible, setSplashVisible] = useState(true)
  const [splashRemoved, setSplashRemoved] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setSplashVisible(false), SPLASH_DURATION_MS)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!splashVisible) {
      const t = setTimeout(() => setSplashRemoved(true), SPLASH_FADEOUT_MS)
      return () => clearTimeout(t)
    }
  }, [splashVisible])

  return (
    <>
      {!splashRemoved && <SplashScreen visible={splashVisible} />}
      <div className="min-h-screen flex flex-col pb-48 md:pb-20">
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full bg-white transition-transform duration-300 ease-in-out ${
          headerVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <TopBar />
        <Navbar />
      </header>
      <main className="flex-1 pt-[108px]">
        <Routes>
          <Route path="/" element={<UpcomingTours />} />
          <Route path="/itinerary/:id" element={<Itinerary />} />
        </Routes>
      </main>
      <Footer />
      <StickyBottomBar />
      <FloatingPhoneIcon />
    </div>
    </>
  )
}

export default App
