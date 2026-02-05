import { Link } from 'react-router-dom'

export default function PromoBanner() {
  return (
    <section className="relative rounded-2xl overflow-hidden border border-neutral-200 shadow-card">
      <div className="relative min-h-[140px] md:min-h-[160px] flex flex-col md:flex-row items-center justify-between gap-4 p-4 md:p-5 lg:p-6">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700" />
        <div className="relative z-10 flex-1 text-white min-w-0">
          <h2 className="font-display text-lg md:text-xl lg:text-2xl font-bold leading-tight mb-1">
            Family Fun, Ocean Sun & Zero Hassle!
          </h2>
          <p className="text-white/90 text-sm md:text-base mb-3">
            Plan your perfect getaway with <span className="font-semibold text-white">HM Trips</span>.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center min-h-[40px] md:min-h-0 py-2 px-5 rounded-xl text-sm font-medium text-blue-900 bg-white hover:bg-white/95 transition-colors"
            style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}
          >
            Book Now
          </Link>
        </div>
        <div className="relative z-10 hidden md:block flex-shrink-0 w-36 h-36 lg:w-40 lg:h-40 rounded-xl overflow-hidden border-2 border-white/30 shadow-xl">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80"
            alt="Happy travellers with HM Trips"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  )
}
