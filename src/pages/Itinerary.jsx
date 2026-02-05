import { useParams, Link } from 'react-router-dom'
import { getTourById } from '../data/tours'
import ItineraryMap from '../components/ItineraryMap'
import ScrollReveal from '../components/ScrollReveal'

export default function Itinerary() {
  const { id } = useParams()
  const tour = getTourById(id)

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 pt-20">
        <div className="text-center">
          <h1 className="font-display text-2xl text-neutral-950">Tour not found</h1>
          <Link to="/" className="mt-4 inline-block btn-gradient">Back to Tours</Link>
        </div>
      </div>
    )
  }

  const formatDate = (d) => {
    const date = new Date(d)
    return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  }
  const formatDateShort = (d) => {
    const date = new Date(d)
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }
  const formatPrice = (n) => `₹${(n / 1000).toFixed(0)}K`
  const routeLabel = tour.ports?.length ? tour.ports.join(' - ') : `${tour.origin} - ${tour.destination}`
  const nightsDays = `${tour.nights}N/${tour.nights + 1}D`

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[50vh] sm:min-h-[60vh] md:min-h-[70vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={tour.image}
            alt={tour.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-hero-overlay" />
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-8"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Upcoming Tours
          </Link>
          <p className="text-violet-300 font-medium uppercase tracking-wider text-sm mb-2">
            {tour.tagline}
          </p>
          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight max-w-4xl">
            {tour.name}
          </h1>
          <div className="mt-4 md:mt-6 flex flex-wrap gap-x-4 gap-y-1 md:gap-6 text-white/90 text-sm md:text-base">
            <span>Departs {formatDate(tour.departureDate)}</span>
            <span className="hidden sm:inline">•</span>
            <span>{tour.nights} Night{tour.nights > 1 ? 's' : ''}</span>
            <span className="hidden sm:inline">•</span>
            <span>{tour.origin} → {tour.destination}</span>
          </div>
          <div className="mt-6 md:mt-8 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-4">
            <p className="font-display text-xl md:text-3xl font-semibold text-white">
              From {formatPrice(tour.pricePerGuest)}
              <span className="text-base md:text-lg font-body font-normal text-white/80 ml-2">per guest</span>
            </p>
            <a href="#book" className="btn-gradient min-h-[44px] md:min-h-0 inline-flex items-center justify-center w-full sm:w-auto">
              Book Now
            </a>
          </div>
        </div>
      </section>

      {/* Map */}
      <ItineraryMap tour={tour} />

      {/* Trip summary strip */}
      <section className="bg-white border-b border-neutral-200 shadow-sm">
        <ScrollReveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h2 className="font-display text-xl font-semibold text-neutral-950">
                {routeLabel} {nightsDays}
              </h2>
              <p className="text-sm">
                <span className="text-pink-600 font-medium">Embarkation: {formatDateShort(tour.departureDate)}</span>
                {' · '}
                <span className="text-pink-600 font-medium">Disembarkation: {tour.endDate ? formatDateShort(tour.endDate) : '—'}</span>
              </p>
              <p className="text-sm text-neutral-600">
                Visiting Ports: {tour.ports?.join(' | ') || `${tour.origin} | ${tour.destination}`}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="text-left md:text-right w-full sm:w-auto">
                <p className="text-xs text-neutral-500 uppercase tracking-wider">Starting From</p>
                <p className="font-display text-xl md:text-2xl font-semibold bg-gradient-to-r from-violet-600 to-orange-500 bg-clip-text text-transparent">
                  ₹{tour.pricePerGuest?.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-neutral-500">Excl. GST Per Person in Double Occupancy</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <a href="#book" className="btn-gradient text-sm py-3 md:py-2.5 px-5 min-h-[44px] md:min-h-0 inline-flex items-center justify-center">
                  View Packages
                </a>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm min-h-[44px] md:min-h-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Change Itinerary
                </Link>
              </div>
            </div>
          </div>
          {/* Gallery thumbnails - 3 preview images */}
          {(tour.galleryThumbnails || tour.highlightImages?.slice(0, 3) || []).length > 0 && (
            <div className="flex gap-4 mt-6 pt-6 border-t border-neutral-100 overflow-x-auto">
              {(tour.galleryThumbnails || tour.highlightImages?.slice(0, 3)).map((src, i) => (
                <div key={i} className="flex-shrink-0 w-28 h-20 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100">
                  <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
        </ScrollReveal>
      </section>

      {/* Your Trip Highlight - 4 images */}
      <section className="py-10 md:py-16 bg-white border-y border-neutral-200">
        <ScrollReveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-xl md:text-2xl font-semibold text-neutral-950 mb-6 md:mb-8">
            Your Trip Highlight
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {(tour.highlightImages || []).length > 0
              ? tour.highlightImages.map((img, i) => (
                  <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden shadow-md border border-neutral-200">
                    <img
                      src={img}
                      alt={`Trip highlight ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))
              : [1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 flex items-center justify-center">
                    <span className="text-neutral-400 text-sm">Highlight {i}</span>
                  </div>
                ))}
          </div>
        </div>
        </ScrollReveal>
      </section>

      {/* Itinerary - Day wise details */}
      <section id="itinerary" className="py-10 md:py-16 bg-white border-t border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-xl md:text-2xl font-semibold text-neutral-950 mb-1">
            Itinerary
          </h2>
          <p className="text-neutral-600 text-sm mb-10">Day wise details of your package</p>
          <div className="space-y-8">
            {tour.itinerary.map((day, i) => (
              <div key={day.day} className="flex gap-4 md:gap-6">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-violet-600 text-white text-sm font-bold">
                  Day {day.day}
                </div>
                <div className="flex-1 min-w-0 overflow-visible">
                  <h3 className="font-display text-lg font-semibold text-neutral-950 break-words">
                    {day.port}
                  </h3>
                  {day.subtitle && (
                    <p className="text-emerald-600 text-sm font-medium mt-0.5 break-words">
                      {day.subtitle}
                    </p>
                  )}
                  <p className="mt-2 text-neutral-700 leading-relaxed text-sm break-words">
                    {day.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shore Excursions */}
      {(tour.shoreExcursionImages || []).length > 0 && (
        <section className="py-16 bg-neutral-50 border-y border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl font-semibold text-neutral-950 mb-2 inline-flex items-center gap-2">
              Shore Excursions
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-neutral-300 text-neutral-600 text-xs" title="Information">i</span>
            </h2>
            <div className="flex gap-4 mt-6 overflow-x-auto pb-2">
              {tour.shoreExcursionImages.map((src, i) => (
                <div key={i} className="flex-shrink-0 w-48 h-32 rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
                  <img src={src} alt={`Shore excursion ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <Link to="#itinerary" className="inline-flex items-center gap-1 mt-4 text-violet-600 font-medium text-sm hover:text-violet-700">
              View Full Itinerary
              <span className="text-lg">&gt;</span>
            </Link>
          </div>
        </section>
      )}

      {/* Inclusions + Entertainment Shows - two columns */}
      <section className="py-10 md:py-16 bg-white border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Inclusions */}
            <div>
              <h2 className="font-display text-xl md:text-2xl font-semibold text-neutral-950 mb-6">
                Inclusions
              </h2>
              <ul className="space-y-3">
                {(tour.inclusionDetails || tour.inclusions).map((item) => (
                  <li key={item} className="flex items-center gap-3 text-neutral-700">
                    <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              {tour.inclusionNote && (
                <p className="mt-4 text-neutral-500 text-sm">{tour.inclusionNote}</p>
              )}
              <a href="#inclusions" className="inline-flex items-center gap-1 mt-4 text-violet-600 font-medium text-sm hover:text-violet-700">
                View Inclusions & Exclusions
                <span className="text-lg">&gt;</span>
              </a>
            </div>

            {/* Entertainment Shows */}
            <div>
              <h2 className="font-display text-xl md:text-2xl font-semibold text-neutral-950 mb-6">
                Entertainment Shows
              </h2>
              {(tour.entertainmentShows || []).length > 0 ? (
                <div className="border border-neutral-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200">
                        <th className="text-left py-3 px-4 font-semibold text-neutral-950">Entertainment Shows</th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-950">{tour.nights} Night</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tour.entertainmentShows.map((show, i) => (
                        <tr key={i} className="border-b border-neutral-100 last:border-0">
                          <td className="py-3 px-4 text-neutral-700">{show.name}</td>
                          <td className="py-3 px-4">
                            {show.available ? (
                              <span className="text-emerald-500" aria-label="Available">
                                <svg className="w-5 h-5 inline" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </span>
                            ) : (
                              <span className="text-red-500" aria-label="Not available">
                                <svg className="w-5 h-5 inline" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-neutral-500 text-sm">Entertainment schedule available on board.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Book CTA */}
      <section id="book" className="py-12 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-neutral-950 mb-4">
            Ready to Sail?
          </h2>
          <p className="text-neutral-700 text-sm md:text-base mb-8 max-w-xl mx-auto">
            Secure your spot for {tour.name}. From {formatPrice(tour.pricePerGuest)} per guest.
          </p>
          <a href="#" className="btn-gradient text-base md:text-lg px-8 md:px-10 py-4 min-h-[44px] md:min-h-0 inline-flex items-center justify-center w-full sm:w-auto">
            Book Now
          </a>
        </div>
      </section>
    </>
  )
}
