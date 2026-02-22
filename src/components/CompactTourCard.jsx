import { Link } from 'react-router-dom'
import { getVibe, VIBE_COLORS } from '../utils/destinationVibe'
import TourInteractions from './TourInteractions'

const VIBE_LABELS = {
  cold: 'Winter',
  tropical: 'Tropical',
  island: 'Island',
  urban: 'City',
}

export default function CompactTourCard({ tour, staggerIndex }) {
  const vibe = getVibe(tour)
  const colors = VIBE_COLORS[vibe] || VIBE_COLORS.urban

  const formatDate = (d) => {
    const date = new Date(d)
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const startDate = formatDate(tour.departureDate)
  const endDate = tour.endDate ? formatDate(tour.endDate) : null
  const routeLabel = tour.ports?.length ? `${tour.origin} Round Trip` : `${tour.origin} → ${tour.destination}`

  const viewingCount = Number(tour.viewing) || 0
  const tagLabel = tour.tripTag || tour.shipName || tour.tagline || ''
  const badgeLine1 = VIBE_LABELS[vibe]
  const badgeLine2 = tour.nights ? `${tour.nights} Night${tour.nights > 1 ? 's' : ''}` : (tagLabel.slice(0, 18) + (tagLabel.length > 18 ? '…' : ''))

  return (
    <article
      className="group rounded-xl border border-neutral-200 bg-white overflow-hidden transition-all duration-300 ease-out hover:shadow-xl hover:border-neutral-300 hover:-translate-y-1 flex flex-col h-full"
      style={{
        boxShadow: staggerIndex != null ? `0 2px 12px -2px ${colors.glow}` : undefined,
      }}
    >
      {/* Image Section with Smart Fit */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-50">
        {/* Background layer with image dominant color simulation */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${colors.overlay}, ${colors.glow})`,
            opacity: 0.3
          }}
        />

        {/* Image with smart contain fit */}
        <img
          src={tour.image}
          alt={tour.name}
          className="absolute inset-0 w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          style={{
            objectFit: 'contain',
            objectPosition: 'center',
          }}
          loading="lazy"
        />

        {/* Gradient overlay for text visibility */}
        <div
          className="absolute inset-0 opacity-40 group-hover:opacity-30 transition-opacity duration-300"
          style={{ background: `linear-gradient(180deg, transparent 50%, ${colors.overlay})` }}
        />

        {/* Category/Vibe Badge - Top Left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <span
            className="rounded-lg px-3 py-1.5 text-white text-xs font-bold uppercase tracking-wide shadow-lg leading-tight w-fit backdrop-blur-sm"
            style={{ backgroundColor: colors.accent }}
          >
            {badgeLine1}
          </span>
          <span
            className="rounded-lg px-3 py-1 text-white/95 text-[11px] font-medium uppercase tracking-wide leading-tight truncate max-w-[180px] w-fit backdrop-blur-sm"
            style={{ backgroundColor: colors.accent }}
            title={tagLabel}
          >
            {badgeLine2}
          </span>
        </div>

        {/* Offers Badge - Top Right */}
        {(tour.offers?.length > 0 || tour.offer) && (
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {(tour.offers?.length ? tour.offers[0] : tour.offer)}
            </span>
          </div>
        )}
      </div>

      {/* Content Section - Compact */}
      <div className="p-4 flex flex-col flex-1">
        {/* Title */}
        <h3 className="font-display text-base font-bold text-neutral-900 mb-2 leading-tight line-clamp-2 min-h-[2.5rem]">
          {tour.name}
        </h3>

        {/* Date & Route */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">
              {startDate}{endDate ? ` - ${endDate}` : ''}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{routeLabel}</span>
          </div>
        </div>

        {/* Tour Interactions - Compact */}
        <div className="mb-3 pb-3 border-b border-neutral-100">
          <TourInteractions tour={tour} variant="compact" />
        </div>

        {/* Price & CTA Section */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[10px] uppercase tracking-wider text-neutral-400">From</span>
              <span
                className="font-display text-xl font-bold tabular-nums"
                style={{ color: colors.accent }}
              >
                ₹{tour.pricePerGuest?.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-xs text-neutral-500 tabular-nums">
              {viewingCount} viewing
            </span>
          </div>

          <p className="text-[10px] text-neutral-400 mb-3">Excl. GST, per person</p>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/itinerary/${tour.id}`}
              className="inline-flex items-center justify-center py-2.5 px-3 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90 hover:shadow-lg"
              style={{
                background: colors.accent,
                boxShadow: `0 2px 8px ${colors.glow}`
              }}
            >
              View Details
            </Link>
            <Link
              to={`/itinerary/${tour.id}#book`}
              className="inline-flex items-center justify-center py-2.5 px-3 text-sm font-semibold rounded-lg border-2 text-neutral-700 hover:bg-neutral-50 transition-all"
              style={{ borderColor: colors.accent }}
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
