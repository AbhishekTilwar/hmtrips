import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import SplashScreen from './components/SplashScreen'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}
import SiteLayout from './components/SiteLayout'
import UpcomingTours from './pages/UpcomingTours'
import Itinerary from './pages/Itinerary'
import AdminLayout from './pages/admin/AdminLayout'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminTrips from './pages/admin/AdminTrips'
import AdminInquiries from './pages/admin/AdminInquiries'
import AdminOrders from './pages/admin/AdminOrders'
import AdminPayments from './pages/admin/AdminPayments'

const SPLASH_DURATION_MS = 2500
const SPLASH_FADEOUT_MS = 500

function App() {
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
      <ScrollToTop />
      {!splashRemoved && <SplashScreen visible={splashVisible} />}
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="trips" element={<AdminTrips />} />
          <Route path="inquiries" element={<AdminInquiries />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="payments" element={<AdminPayments />} />
        </Route>
        <Route path="/" element={<SiteLayout />}>
          <Route index element={<UpcomingTours />} />
          <Route path="itinerary/:id" element={<Itinerary />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
