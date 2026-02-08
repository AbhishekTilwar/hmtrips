import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { createInquiry } from '../lib/firestore'

const inputClass =
  'w-full px-4 py-3 rounded-lg border border-neutral-300 bg-white text-neutral-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent min-h-[44px] md:min-h-0'

export default function CallbackCard() {
  const { user } = useAuth()
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState({
    name: user?.displayName || '',
    phone: user?.phoneNumber || '',
    guests: 1,
    preferredMonth: '',
    tripInterest: '',
    notes: '',
  })
  const [errors, setErrors] = useState({})

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }))
  }

  const validate = () => {
    const next = {}
    if (!form.name?.trim()) next.name = 'Name is required'
    if (!form.phone?.trim()) next.phone = 'Phone number is required'
    else if (!/^[\d\s+\-()]{10,}$/.test(form.phone.replace(/\s/g, ''))) next.phone = 'Enter a valid phone number'
    if (form.guests < 1 || form.guests > 99) next.guests = 'Enter 1–99 guests'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleRequestCallback = async (e) => {
    e?.preventDefault()
    if (!validate()) return
    setSending(true)
    try {
      const message = [
        `Callback request`,
        form.preferredMonth && `Preferred: ${form.preferredMonth}`,
        form.tripInterest && `Interest: ${form.tripInterest}`,
        form.notes && `Notes: ${form.notes}`,
      ]
        .filter(Boolean)
        .join('. ')
      await createInquiry({
        userId: user?.uid || null,
        userEmail: user?.email || null,
        userPhone: form.phone.trim(),
        userName: form.name.trim(),
        tourId: null,
        tourName: null,
        message: message || 'Requested callback',
        numberOfGuests: Number(form.guests) || 1,
        preferredDate: form.preferredMonth || null,
        tripInterest: form.tripInterest || null,
        notes: form.notes || null,
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
        <form onSubmit={handleRequestCallback} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Your name"
              className={inputClass}
              required
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Phone number <span className="text-red-500">*</span></label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="e.g. 9876543210 or +91 9876543210"
              className={inputClass}
              required
            />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Number of guests <span className="text-red-500">*</span></label>
            <input
              type="number"
              min={1}
              max={99}
              value={form.guests}
              onChange={(e) => handleChange('guests', e.target.value)}
              className={inputClass}
              required
            />
            {errors.guests && <p className="mt-1 text-xs text-red-600">{errors.guests}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Preferred travel month</label>
            <input
              type="text"
              value={form.preferredMonth}
              onChange={(e) => handleChange('preferredMonth', e.target.value)}
              placeholder="e.g. March 2025"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Trip / destination interest</label>
            <input
              type="text"
              value={form.tripInterest}
              onChange={(e) => handleChange('tripInterest', e.target.value)}
              placeholder="e.g. Goa, Lakshadweep cruise"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Additional details</label>
            <textarea
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Any special requests or questions"
              rows={2}
              className={`${inputClass} resize-none`}
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="btn-gradient w-full justify-center gap-2 min-h-[44px] md:min-h-0 disabled:opacity-50"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            {sending ? 'Sending…' : 'Request a Callback'}
          </button>
        </form>
      )}
      <div className="flex flex-col sm:flex-row gap-2 mt-4">
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
