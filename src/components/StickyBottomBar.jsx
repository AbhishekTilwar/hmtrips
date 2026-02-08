import { useState, useRef, useEffect } from 'react'

const HIDE_AFTER_MS = 5000

export default function StickyBottomBar() {
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [visible, setVisible] = useState(true)
  const hideTimerRef = useRef(null)

  const resetHideTimer = () => {
    setVisible(true)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => setVisible(false), HIDE_AFTER_MS)
  }

  useEffect(() => {
    hideTimerRef.current = setTimeout(() => setVisible(false), HIDE_AFTER_MS)
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }
  }, [])

  const handleMobileChange = (e) => {
    setMobile(e.target.value)
    resetHideTimer()
  }
  const handleOtpChange = (e) => {
    setOtp(e.target.value)
    resetHideTimer()
  }

  const handleSkip = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    setVisible(false)
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 text-white shadow-[0_-4px_24px_rgba(0,0,0,0.15)] safe-area-inset-bottom transition-transform duration-300 ease-out ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #0ea5e9 100%)' }}
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button
          type="button"
          onClick={handleSkip}
          className="absolute top-3 right-4 text-white/90 hover:text-white text-sm font-medium underline underline-offset-2 transition-colors"
          aria-label="Skip"
        >
          Skip
        </button>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <p className="font-medium text-center lg:text-left text-sm lg:text-base pr-16 sm:pr-0">
            Talk to <span className="text-pink-200 font-semibold">Harsha Raut</span> for instant help with exclusive deals
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 justify-center lg:justify-end">
            <div className="flex rounded-lg overflow-hidden border border-white/30 bg-white/10 backdrop-blur-sm min-h-[44px] md:min-h-0">
              <select className="px-3 py-3 md:py-2.5 bg-white/20 border-r border-white/30 text-white text-sm font-medium focus:outline-none min-h-[44px] md:min-h-0">
                <option className="text-neutral-800">+91</option>
              </select>
              <input
                type="tel"
                placeholder="Enter mobile number"
                value={mobile}
                onChange={handleMobileChange}
                className="flex-1 min-w-0 w-32 sm:w-44 px-4 py-3 md:py-2.5 min-h-[44px] md:min-h-0 bg-transparent text-white placeholder-white/70 text-sm focus:outline-none"
              />
            </div>
            <button type="button" className="bg-white text-blue-700 font-medium py-3 md:py-2.5 px-5 min-h-[44px] md:min-h-0 rounded-lg text-sm whitespace-nowrap hover:bg-white/90 transition-colors">
              Get OTP
            </button>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={handleOtpChange}
                className="w-full sm:w-28 px-4 py-3 md:py-2.5 min-h-[44px] md:min-h-0 rounded-lg border border-white/30 bg-white/10 text-white placeholder-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button type="button" className="bg-white text-blue-700 font-medium py-3 md:py-2.5 px-5 min-h-[44px] md:min-h-0 rounded-lg text-sm whitespace-nowrap hover:bg-white/90 transition-colors shrink-0">
                Verify & Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
