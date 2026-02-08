export default function SplashScreen({ visible }) {
  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-700 ease-out ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      aria-hidden="true"
    >
      {/* Background: soft gradient with subtle mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/60" />
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(30, 64, 175, 0.12), transparent),
            radial-gradient(ellipse 60% 40% at 80% 80%, rgba(14, 165, 233, 0.08), transparent)
          `,
        }}
      />

      {/* Decorative corner accent */}
      <div
        className="absolute top-0 right-0 w-[min(60vw,320px)] h-[min(50vw,280px)] rounded-bl-[100%] opacity-30"
        style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 40%, transparent 70%)' }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center px-6">
        {/* Logo mark — scale in with bounce */}
        <div
          className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-2xl text-white shadow-xl animate-splash-scale-in"
          style={{
            background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #0ea5e9 100%)',
            boxShadow: '0 20px 40px -12px rgba(30, 64, 175, 0.35)',
          }}
        >
          <span className="font-display text-4xl sm:text-5xl font-bold tracking-tight">HM</span>
        </div>

        {/* Brand name — HM Trip */}
        <h1
          className="mt-6 font-display text-3xl sm:text-4xl font-semibold text-neutral-950 tracking-tight animate-splash-fade-up opacity-0"
          style={{ animationDelay: '0.25s', animationFillMode: 'forwards' }}
        >
          HM Trip
        </h1>

        {/* Tagline */}
        <p
          className="mt-2 text-sm sm:text-base text-neutral-500 font-body font-medium tracking-wide animate-splash-fade-up opacity-0"
          style={{ animationDelay: '0.45s', animationFillMode: 'forwards' }}
        >
          Your Journey Awaits
        </p>

        {/* Minimal loading bar */}
        <div
          className="mt-10 h-0.5 w-28 rounded-full bg-neutral-200 overflow-hidden animate-splash-fade-up opacity-0 origin-left"
          style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}
        >
          <div
            className="h-full w-full rounded-full animate-splash-bar origin-[left]"
            style={{
              background: 'linear-gradient(90deg, #2563eb, #0ea5e9)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
