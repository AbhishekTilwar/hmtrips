import { Link } from 'react-router-dom'

export default function TourCard({ tour }) {
  const formatDate = (d) => {
    const date = new Date(d)
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }
  const startDate = formatDate(tour.departureDate)
  const endDate = tour.endDate ? formatDate(tour.endDate) : null
  const routeLabel = tour.ports?.length ? `${tour.origin} Round Trip` : `${tour.origin} → ${tour.destination}`
  const portsLabel = tour.ports?.length ? tour.ports.join(' • ') : `${tour.origin} • ${tour.destination}`

  return (
    <article className="rounded-2xl border border-neutral-200 bg-white shadow-card overflow-hidden transition-all duration-300 hover:shadow-card-hover">
      <div className="flex flex-col md:flex-row">
        {/* Image - left half */}
        <div className="md:w-2/5 relative aspect-[4/3] md:aspect-auto md:min-h-[240px]">
          <img
            src={tour.image}
            alt={tour.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-brand-blue text-white text-xs font-semibold uppercase tracking-wide">
            {tour.tripTag || tour.shipName || tour.tagline}
          </div>
        </div>

        {/* Content - right half */}
        <div className="md:w-3/5 p-4 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg md:text-xl font-semibold text-neutral-950 mb-2">
              {tour.name}
            </h3>
            <p className="text-neutral-600 text-sm mb-1">
              {startDate}{endDate ? ` → ${endDate}` : ''}
            </p>
            <p className="text-neutral-600 text-sm mb-2">{routeLabel}.</p>
            <p className="text-neutral-500 text-sm">Ports: {portsLabel}</p>
            {(tour.offers?.length > 0 || tour.offer) && (
              <div className="mt-3">
                <p className="text-neutral-600 text-sm font-medium mb-1.5">Available Offers</p>
                <ul className="space-y-1">
                  {tour.offers?.length > 0
                    ? tour.offers.map((o) => (
                        <li key={o} className="flex items-center gap-2 text-emerald-600 text-sm">
                          <svg className="w-5 h-5 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                          {o}
                        </li>
                      ))
                    : (
                        <li className="flex items-center gap-2 text-emerald-600 text-sm">
                          <svg className="w-5 h-5 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                          {tour.offer}
                        </li>
                      )}
                </ul>
              </div>
            )}
          </div>

          <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-4 md:gap-3 md:pl-6 md:border-l border-neutral-100">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
              • {tour.viewing || 0} Viewing
            </span>
            <div className="text-right">
              <p className="text-neutral-500 text-xs uppercase tracking-wider">Starting From</p>
              <p className="font-display text-xl md:text-2xl font-semibold bg-gradient-to-r from-brand-blue to-brand-sky bg-clip-text text-transparent">
                ₹{tour.pricePerGuest?.toLocaleString('en-IN')}
              </p>
              <p className="text-neutral-500 text-xs mt-0.5">Excl. GST Per Person in Double Occupancy</p>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full md:w-auto">
              <Link
                to={`/itinerary/${tour.id}`}
                className="btn-gradient text-sm py-3 px-5 md:py-2.5 min-h-[44px] md:min-h-0 whitespace-nowrap text-center flex items-center justify-center"
              >
                View Itinerary
              </Link>
              <Link
                to={`/itinerary/${tour.id}#book`}
                className="btn-outline-purple text-sm py-3 px-5 md:py-2.5 min-h-[44px] md:min-h-0 whitespace-nowrap text-center flex items-center justify-center"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
