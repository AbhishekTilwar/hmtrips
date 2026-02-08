export default function SplashScreen({ visible }) {
  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#f8fafc] transition-opacity duration-700 ease-out ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      aria-hidden="true"
    >
      {/* Decorative circles — layered, smooth floating */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-blue-200/60 to-sky-300/50 blur-2xl animate-float opacity-60"
          aria-hidden
        />
        <div
          className="absolute -right-32 top-1/4 h-80 w-80 rounded-full bg-gradient-to-bl from-indigo-200/50 to-blue-200/40 blur-2xl animate-float-slow opacity-50"
          aria-hidden
        />
        <div
          className="absolute bottom-1/4 -left-16 h-56 w-56 rounded-full bg-gradient-to-tr from-sky-200/50 to-cyan-200/40 blur-2xl animate-float-slower opacity-55"
          aria-hidden
        />
        <div
          className="absolute right-1/4 top-1/3 h-40 w-40 rounded-full border border-blue-200/40 bg-white/30 backdrop-blur-sm animate-float"
          aria-hidden
        />
        <div
          className="absolute left-1/4 bottom-1/3 h-24 w-24 rounded-full border border-sky-200/50 bg-white/40 backdrop-blur-sm animate-float-slow"
          aria-hidden
        />
        <div
          className="absolute left-1/2 top-1/4 h-16 w-16 -translate-x-1/2 rounded-full bg-blue-100/70 animate-pulse-soft"
          aria-hidden
        />
        <div
          className="absolute bottom-1/3 right-1/3 h-20 w-20 rounded-full bg-sky-100/60 animate-pulse-soft [animation-delay:1s]"
          aria-hidden
        />
      </div>

      {/* Subtle gradient overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 40%, #0ea5e9 100%)' }}
        aria-hidden
      />

      <div className="relative z-10 flex flex-col items-center justify-center gap-8 px-6">
        {/* Logo mark — circle with HM */}
        <div
          className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full text-white shadow-xl opacity-0 animate-scale-in [animation-fill-mode:forwards] ring-4 ring-blue-100/50"
          style={{ background: 'linear-gradient(145deg, #1e40af 0%, #2563eb 45%, #0ea5e9 100%)' }}
        >
          <span className="font-display text-3xl sm:text-4xl font-bold tracking-tight">HM</span>
        </div>

        {/* Brand name — HM Trip */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h1
            className="font-display text-3xl sm:text-4xl font-semibold text-neutral-900 tracking-tight opacity-0 animate-scale-in [animation-fill-mode:forwards] [animation-delay:150ms]"
            style={{ textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}
          >
            HM Trip
          </h1>
          <p
            className="text-sm sm:text-base text-neutral-500 font-body font-medium tracking-wide opacity-0 animate-fade-in [animation-fill-mode:forwards] [animation-delay:350ms]"
          >
            Explore · Discover · Travel
          </p>
        </div>

        {/* Minimal loading cue */}
        <div
          className="mt-2 h-0.5 w-20 overflow-hidden rounded-full bg-blue-100 opacity-0 animate-fade-in [animation-fill-mode:forwards] [animation-delay:500ms]"
          aria-hidden
        >
          <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-blue-500 to-sky-400 animate-shimmer" />
        </div>
      </div>
    </div>
  )
}
