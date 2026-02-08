import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { createInquiry } from '../lib/firestore'

export default function CallbackCard() {
  const { user } = useAuth()
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const handleRequestCallback = async () => {
    setSending(true)
    try {
      await createInquiry({
        userId: user?.uid || null,
        userEmail: user?.email || null,
        userPhone: user?.phoneNumber || null,
        userName: user?.displayName || null,
        tourId: null,
        tourName: null,
        message: 'Requested callback',
      })
      setSent(true)
    } catch (_) {
      setSent(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-b from-blue-50 to-white p-6 shadow-card">
      <div className="flex justify-center mb-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-sky-500 text-white">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </span>
      </div>
      <h3 className="font-display text-xl font-semibold text-neutral-950 text-center mb-1">
        Your perfect trip is one call away.
      </h3>
      <p className="text-neutral-600 text-sm text-center mb-6">
        Get instant help from our travel team.
      </p>
      {sent ? (
        <p className="text-center text-emerald-600 text-sm py-2">Request sent. We&apos;ll call you soon.</p>
      ) : (
        <button type="button" onClick={handleRequestCallback} disabled={sending} className="btn-gradient w-full justify-center gap-2 mb-3 min-h-[44px] md:min-h-0 disabled:opacity-50">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
          {sending ? 'Sending…' : 'Request a Callback'}
        </button>
      )}
      <div className="flex flex-col sm:flex-row gap-2">
        <a href="tel:+918805795706" className="btn-outline-purple w-full justify-center text-sm py-3 md:py-2.5 min-h-[44px] md:min-h-0 flex items-center">
          Call +91 8805795706
        </a>
        <a href="tel:+918278717103" className="btn-outline-purple w-full justify-center text-sm py-3 md:py-2.5 min-h-[44px] md:min-h-0 flex items-center">
          Call +91 8278717103
        </a>
      </div>
    </div>
  )
}
