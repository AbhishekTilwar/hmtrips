import { useEffect } from 'react'

const STORAGE_KEY = 'hmtours_guidance_modal_closed'

export default function GuidanceModal({ open, onClose }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const handleClose = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch (_) {}
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto safe-area-inset-top safe-area-inset-bottom">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm min-h-full"
        onClick={handleClose}
        aria-hidden
      />
      <div
        className="relative w-full max-w-md rounded-2xl bg-blue-50/95 border border-blue-200/80 shadow-2xl p-6 md:p-8 my-auto max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guidance-modal-title"
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3 right-3 md:top-4 md:right-4 p-3 md:p-2 rounded-full text-neutral-500 hover:text-neutral-700 hover:bg-white/80 transition-colors min-touch"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col items-center text-center">
          <span
            className="flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg mb-6"
            style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #0ea5e9 100%)' }}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </span>

          <h2 id="guidance-modal-title" className="font-display text-xl md:text-2xl font-semibold text-neutral-950 mb-2">
            Still deciding where to go?
          </h2>
          <p className="text-neutral-600 text-sm md:text-base mb-8">
            Get curated guidance from a specialist.
          </p>
          <p className="text-neutral-500 text-sm mb-8 -mt-6">
            Let our expert match you with an itinerary that suits your taste.
          </p>

          <div className="flex flex-col gap-3 w-full">
            <button
              type="button"
              className="w-full min-h-[44px] md:min-h-0 py-3.5 px-6 rounded-xl font-medium text-white transition-all hover:opacity-95"
              style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #0ea5e9 100%)' }}
            >
              Request a Callback
            </button>
            <a
              href="tel:+918805795706"
              className="w-full min-h-[44px] md:min-h-0 py-3.5 px-6 rounded-xl font-medium text-center border-2 border-blue-600 text-blue-700 bg-white hover:bg-blue-50 transition-colors flex items-center justify-center"
            >
              Call Harsha Raut - +91 8805795706
            </a>
            <a
              href="#login"
              onClick={handleClose}
              className="w-full min-h-[44px] md:min-h-0 py-3.5 px-6 rounded-xl font-medium text-center text-blue-700 hover:bg-blue-50/80 transition-colors inline-flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Login now to get attractive offers
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
