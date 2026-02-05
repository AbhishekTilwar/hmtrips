import { useState } from 'react'

export default function StickyBottomBar() {
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 text-white shadow-[0_-4px_24px_rgba(0,0,0,0.15)] safe-area-inset-bottom"
      style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #c026d3 50%, #ea580c 100%)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <p className="font-medium text-center lg:text-left text-sm lg:text-base">
            Talk to a travel expert and get instant help with{' '}
            <span className="text-pink-200 font-semibold">exclusive deals</span>
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
                onChange={(e) => setMobile(e.target.value)}
                className="flex-1 min-w-0 w-32 sm:w-44 px-4 py-3 md:py-2.5 min-h-[44px] md:min-h-0 bg-transparent text-white placeholder-white/70 text-sm focus:outline-none"
              />
            </div>
            <button type="button" className="bg-white text-violet-700 font-medium py-3 md:py-2.5 px-5 min-h-[44px] md:min-h-0 rounded-lg text-sm whitespace-nowrap hover:bg-white/90 transition-colors">
              Get OTP
            </button>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full sm:w-28 px-4 py-3 md:py-2.5 min-h-[44px] md:min-h-0 rounded-lg border border-white/30 bg-white/10 text-white placeholder-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button type="button" className="bg-white text-violet-700 font-medium py-3 md:py-2.5 px-5 min-h-[44px] md:min-h-0 rounded-lg text-sm whitespace-nowrap hover:bg-white/90 transition-colors shrink-0">
                Verify & Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
