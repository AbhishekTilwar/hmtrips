export default function CallbackCard() {
  return (
    <div className="rounded-2xl border-2 border-pink-200 bg-gradient-to-b from-pink-50 to-white p-6 shadow-card">
      <div className="flex justify-center mb-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-orange-500 text-white">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </span>
      </div>
      <h3 className="font-display text-xl font-semibold text-neutral-950 text-center mb-1">
        Your perfect trip is one call away.
      </h3>
      <p className="text-neutral-600 text-sm text-center mb-6">
        Get instant help from our travel planner.
      </p>
      <button type="button" className="btn-gradient w-full justify-center gap-2 mb-3 min-h-[44px] md:min-h-0">
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
        Request a Callback
      </button>
      <a href="tel:022-68811111" className="btn-outline-purple w-full justify-center text-sm py-3 md:py-2.5 min-h-[44px] md:min-h-0 flex items-center">
        Call - 022-68811111
      </a>
    </div>
  )
}
