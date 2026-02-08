export default function SplashScreen({ visible }) {
  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ease-out ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      aria-hidden="true"
    >
      {/* Gradient background accent */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #0ea5e9 100%)' }}
      />
      <div className="relative z-10 flex flex-col items-center justify-center gap-6">
        {/* Logo */}
        <div
          className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl text-white shadow-lg opacity-0 animate-fade-in [animation-fill-mode:forwards]"
          style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #0ea5e9 100%)' }}
        >
          <span className="font-display text-3xl sm:text-4xl font-bold tracking-tight">HM</span>
        </div>
        {/* Brand name */}
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-neutral-950 tracking-tight opacity-0 animate-fade-in [animation-fill-mode:forwards] [animation-delay:200ms]">
          HM Tours
        </h1>
        <p className="text-sm text-neutral-500 opacity-0 animate-fade-in [animation-fill-mode:forwards] [animation-delay:400ms]">
          Explore Trips & Holidays
        </p>
      </div>
    </div>
  )
}
