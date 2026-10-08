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
      className={`fixed bottom-0 left-0 right-0 z-40 text-[#f6f1e8] shadow-[0_-12px_40px_rgba(18,24,32,0.18)] safe-area-inset-bottom transition-transform duration-700 ease-out ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ background: '#121820' }}
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button
          type="button"
          onClick={handleSkip}
          className="absolute top-3 right-4 text-[#d4bc94] hover:text-[#f6f1e8] text-[11px] tracking-[0.16em] uppercase transition-colors"
          aria-label="Skip"
        >
          Skip
        </button>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <p className="font-display text-lg text-center lg:text-left pr-16 sm:pr-0">
            Talk to our travel experts for instant help with exclusive deals
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 justify-center lg:justify-end">
            <div className="flex overflow-hidden border border-[#d4bc94]/40 bg-white/5 min-h-[44px] md:min-h-0">
              <select className="px-3 py-3 md:py-2.5 bg-transparent border-r border-[#d4bc94]/30 text-[#f6f1e8] text-sm font-medium focus:outline-none min-h-[44px] md:min-h-0">
                <option className="text-neutral-800">+91</option>
              </select>
              <input
                type="tel"
                placeholder="Enter mobile number"
                value={mobile}
                onChange={handleMobileChange}
                className="flex-1 min-w-0 w-32 sm:w-44 px-4 py-3 md:py-2.5 min-h-[44px] md:min-h-0 bg-transparent text-[#f6f1e8] placeholder-[#f6f1e8]/50 text-sm focus:outline-none"
              />
            </div>
            <button type="button" className="bg-[#d4bc94] text-[#1c1915] font-medium py-3 md:py-2.5 px-5 min-h-[44px] md:min-h-0 text-[11px] tracking-[0.16em] uppercase whitespace-nowrap hover:bg-[#c9ad80] transition-colors">
              Get OTP
            </button>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={handleOtpChange}
                className="w-full sm:w-28 px-4 py-3 md:py-2.5 min-h-[44px] md:min-h-0 border border-[#d4bc94]/40 bg-white/5 text-[#f6f1e8] placeholder-[#f6f1e8]/50 text-sm focus:outline-none focus:ring-1 focus:ring-[#d4bc94]"
              />
              <button type="button" className="bg-[#f6f1e8] text-[#1c1915] font-medium py-3 md:py-2.5 px-5 min-h-[44px] md:min-h-0 text-[11px] tracking-[0.16em] uppercase whitespace-nowrap hover:bg-white transition-colors shrink-0">
                Verify & Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
