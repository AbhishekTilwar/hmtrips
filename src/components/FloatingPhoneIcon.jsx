export default function FloatingPhoneIcon() {
  return (
    <a
      href="tel:+918805795706"
      className="fixed bottom-32 md:bottom-24 right-4 md:right-6 z-50 flex h-14 w-14 min-touch items-center justify-center rounded-full text-white shadow-lg transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
      style={{
        marginBottom: 'max(0px, env(safe-area-inset-bottom, 0px))',
        background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #0ea5e9 100%)',
      }}
      aria-label="Call travel expert"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    </a>
  )
}
