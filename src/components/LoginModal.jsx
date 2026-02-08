import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function LoginModal({ open, onClose }) {
  const { signInWithGoogle, signInWithPhone, verifyPhoneCode, signOut, user } = useAuth()
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState('choose') // choose | phone | verify
  const [confirmationResult, setConfirmationResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithGoogle()
      onClose()
    } catch (e) {
      setError(e.message || 'Google sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const number = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`
      const result = await signInWithPhone(number)
      setConfirmationResult(result)
      setStep('verify')
    } catch (e) {
      setError(e.message || 'Failed to send code')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await verifyPhoneCode(confirmationResult, code)
      onClose()
    } catch (e) {
      setError(e.message || 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  const back = () => {
    setStep('choose')
    setCode('')
    setConfirmationResult(null)
    setError('')
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">Login / Register</h2>
          <button type="button" onClick={onClose} className="p-2 text-slate-500 hover:text-slate-700" aria-label="Close">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {user ? (
          <div className="text-center py-4">
            <p className="text-slate-700">Signed in as {user.email || user.phoneNumber}</p>
            <button type="button" onClick={() => { signOut(); onClose() }} className="mt-4 text-red-600 hover:underline">
              Sign out
            </button>
          </div>
        ) : (
          <>
            {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}
            {step === 'choose' && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Continue with Google
                </button>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  Continue with Phone
                </button>
              </div>
            )}
            {step === 'phone' && (
              <form onSubmit={handlePhoneSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={back} className="px-4 py-2 border border-slate-300 rounded-lg">Back</button>
                  <button type="submit" disabled={loading} className="flex-1 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">
                    {loading ? 'Sending…' : 'Send code'}
                  </button>
                </div>
              </form>
            )}
            {step === 'verify' && (
              <form onSubmit={handleVerifyCode} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Verification code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="6-digit code"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300"
                    maxLength={6}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={back} className="px-4 py-2 border border-slate-300 rounded-lg">Back</button>
                  <button type="submit" disabled={loading} className="flex-1 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">
                    {loading ? 'Verifying…' : 'Verify'}
                  </button>
                </div>
              </form>
            )}
            <div id="recaptcha-container" className="hidden" />
          </>
        )}
      </div>
    </div>
  )
}
