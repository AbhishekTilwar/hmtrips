import { useState, useMemo, useEffect } from 'react'
import { tours, DESTINATIONS, MONTHS, NIGHTS_OPTIONS, TRIP_NAMES } from '../data/tours'
import TourCard from '../components/TourCard'
import CallbackCard from '../components/CallbackCard'
import GuidanceModal from '../components/GuidanceModal'
import PromoBanner from '../components/PromoBanner'
import ScrollReveal from '../components/ScrollReveal'

export default function UpcomingTours() {
  const [destination, setDestination] = useState(DESTINATIONS[0])
  const [month, setMonth] = useState(MONTHS[0])
  const [nights, setNights] = useState(NIGHTS_OPTIONS[0])
  const [tripName, setTripName] = useState(TRIP_NAMES[0])
  const [sortBy, setSortBy] = useState('date')
  const [filterOpen, setFilterOpen] = useState(false)
  const [showGuidanceModal, setShowGuidanceModal] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem('hmtrips_guidance_modal_closed') === 'true') return
    } catch (_) {}
    const t = setTimeout(() => setShowGuidanceModal(true), 1500)
    return () => clearTimeout(t)
  }, [])

  const filteredTours = useMemo(() => {
    let list = [...tours]
    if (destination && destination !== 'Where to?') {
      list = list.filter((t) =>
        t.destination.toLowerCase().includes(destination.toLowerCase()) ||
        t.origin.toLowerCase().includes(destination.toLowerCase())
      )
    }
    if (month && month !== 'Travel month?') {
      const monthNum = MONTHS.indexOf(month)
      if (monthNum > 0) {
        list = list.filter((t) => new Date(t.departureDate).getMonth() === monthNum - 1)
      }
    }
    if (nights && nights !== 'Nights?') {
      const n = parseInt(nights, 10)
      if (!isNaN(n)) list = list.filter((t) => t.nights === n)
    }
    if (tripName && tripName !== 'Trip name?') {
      list = list.filter((t) => t.name === tripName)
    }
    if (sortBy === 'date') {
      list.sort((a, b) => new Date(a.departureDate) - new Date(b.departureDate))
    } else if (sortBy === 'price') {
      list.sort((a, b) => a.pricePerGuest - b.pricePerGuest)
    } else if (sortBy === 'nights') {
      list.sort((a, b) => b.nights - a.nights)
    }
    return list
  }, [destination, month, nights, tripName, sortBy])

  const applyFilters = () => {
    // State is already applied; scroll to results
    document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <GuidanceModal open={showGuidanceModal} onClose={() => setShowGuidanceModal(false)} />
      <div className="bg-white min-h-screen">
        {/* Hero search - Explore Trips & Holidays */}
        <section className="relative min-h-[320px] sm:min-h-[360px] flex items-center pt-12 pb-8 overflow-hidden">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80)`,
            }}
            aria-hidden
          />
          {/* Overlay for legibility */}
          <div className="absolute inset-0 bg-white/80" aria-hidden />
          <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-neutral-950 text-center mb-10">
              Explore Trips & Holidays
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={100}>
          <div className="bg-white rounded-2xl border-2 border-neutral-200 shadow-card p-4 md:p-6 transition-shadow duration-300 hover:shadow-card-hover">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-end gap-4">
              <div className="w-full sm:min-w-0 lg:flex-1 lg:min-w-[140px]">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Select Destination</label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 min-h-[44px] md:min-h-0 text-neutral-800 font-medium focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
                >
                  {DESTINATIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="w-full sm:min-w-0 lg:flex-1 lg:min-w-[140px]">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Select Month</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 min-h-[44px] md:min-h-0 text-neutral-800 font-medium focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
                >
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="w-full sm:min-w-0 lg:flex-1 lg:min-w-[140px]">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Select Night</label>
                <select
                  value={nights}
                  onChange={(e) => setNights(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 min-h-[44px] md:min-h-0 text-neutral-800 font-medium focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
                >
                  {NIGHTS_OPTIONS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="w-full sm:min-w-0 lg:flex-1 lg:min-w-[140px]">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Select Trip</label>
                <select
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 min-h-[44px] md:min-h-0 text-neutral-800 font-medium focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
                >
                  {TRIP_NAMES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="w-full sm:w-auto lg:flex-shrink-0">
                <button type="button" onClick={applyFilters} className="btn-gradient w-full sm:w-auto py-3 px-8 min-h-[44px] md:min-h-0 rounded-lg whitespace-nowrap">
                  Apply
                </button>
              </div>
            </div>
          </div>
          </ScrollReveal>
          </div>
        </section>

        {/* Results: sidebar + list */}
        <section id="results" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <ScrollReveal>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left sidebar - callback card */}
            <aside className="lg:w-72 shrink-0 order-2 lg:order-1">
              <div className="lg:sticky lg:top-24">
                <CallbackCard />
              </div>
            </aside>

            {/* Main - Trip Search Results */}
            <div className="flex-1 min-w-0 order-1 lg:order-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="font-display text-xl md:text-2xl font-semibold text-neutral-950">
                  Trip Search Results ({filteredTours.length})
                </h2>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setFilterOpen((f) => !f)}
                    className="flex items-center gap-2 px-4 py-3 md:py-2 min-h-[44px] md:min-h-0 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors"
                  >
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                    Sort By
                  </button>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-lg border border-neutral-300 bg-white px-4 py-3 md:py-2 min-h-[44px] md:min-h-0 text-neutral-700 font-medium focus:outline-none focus:ring-2 focus:ring-violet-400"
                  >
                    <option value="date">Departure Date</option>
                    <option value="price">Price (Low to High)</option>
                    <option value="nights">Duration</option>
                  </select>
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-3 md:py-2 min-h-[44px] md:min-h-0 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors"
                  >
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                    Filter By
                  </button>
                </div>
              </div>

              {filteredTours.length === 0 ? (
                <div className="text-center py-20 text-neutral-600 bg-neutral-50 rounded-2xl">
                  <p className="font-display text-xl">No trips match your filters.</p>
                  <p className="mt-2 text-sm">Try changing destination, month or trip name.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredTours.map((tour, index) => (
                    <div key={tour.id}>
                      <TourCard tour={tour} />
                      {index === 0 && filteredTours.length > 1 && (
                        <div className="mt-6">
                          <PromoBanner />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          </ScrollReveal>
        </section>
      </div>
    </>
  )
}
