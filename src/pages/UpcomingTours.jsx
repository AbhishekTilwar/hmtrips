/**
 * Homepage — collections and departures on one page.
 * Tour fields and stored values are unchanged; only presentation and in-page browsing.
 */
import { useState, useMemo, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)
import { tours as staticTours, getFilterOptionsFromTours } from '../data/tours'
import { useTours } from '../data/toursData'
import { useAuth } from '../contexts/AuthContext'
import { useCRMRecommendations } from '../hooks/useCRM'
import { getFeaturedTourIds } from '../lib/firestore'

import CompactTourCard from '../components/CompactTourCard'
import CallbackCard from '../components/CallbackCard'
import GuidanceModal from '../components/GuidanceModal'
import ScrollReveal from '../components/ScrollReveal'

const COLLECTIONS = [
  {
    id: 'featured',
    label: 'Featured',
    line: 'The house selection',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80',
  },
  {
    id: 'honeymoon',
    label: 'Honeymoon',
    line: 'Journeys for two',
    image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=900&q=80',
  },
  {
    id: '12-jyotirlingas',
    label: '12 Jyotirlingas',
    line: 'Sacred circuits',
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=900&q=80',
  },
  {
    id: 'free-visa-in-india',
    label: 'Free Visa in India',
    line: 'Within the country',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=900&q=80',
  },
  {
    id: 'required-visa-&-passport',
    label: 'Required Visa & Passport',
    line: 'International departures',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&q=80',
  },
  {
    id: 'jungle-safari-trip',
    label: 'Jungle Safari Trip',
    line: 'Wild interiors',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=900&q=80',
  },
  {
    id: 'urban-cities-trip',
    label: 'Urban Cities Trip',
    line: 'City sojourns',
    image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=900&q=80',
  },
  {
    id: 'holy-places-worldwide',
    label: 'Holy Places Worldwide',
    line: 'Pilgrimage abroad',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=900&q=80',
  },
  {
    id: 'beaches',
    label: 'Beaches',
    line: 'Coast and islands',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=900&q=80',
  },
]

function categorySlug(category) {
  return (category || '').toLowerCase().replace(/\s+/g, '-')
}

function tourMatchesCollection(tour, collectionId) {
  if (!collectionId || collectionId === 'featured') return false
  const slug = categorySlug(tour.category)
  if (slug === collectionId) return true
  if (collectionId === 'beaches' && (slug === 'beaches' || slug === 'beaches-trip')) return true
  return false
}

const selectClass =
  'w-full bg-transparent text-[#1c1915] text-sm font-medium py-2 focus:outline-none cursor-pointer'

export default function UpcomingTours() {
  const { tours: toursFromFirestore, loading: toursLoading } = useTours()
  const tours = toursFromFirestore.length > 0 ? toursFromFirestore : staticTours
  const { user } = useAuth()
  const location = useLocation()
  const pageRef = useRef(null)

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add(
      { reduce: '(prefers-reduced-motion: reduce)' },
      (context) => {
        if (context.conditions.reduce) return
        gsap.fromTo('.hero-plate', { scale: 1.08 }, { scale: 1, duration: 16, ease: 'none' })
        gsap.from('.collection-tile', {
          autoAlpha: 0,
          y: 28,
          duration: 0.7,
          stagger: 0.05,
          ease: 'power3.out',
          delay: 0.1,
        })
      },
    )
    return () => mm.revert()
  }, { scope: pageRef })

  const { recommendations } = useCRMRecommendations(tours, {
    limit: 6,
    includeTrending: true,
    includeRecent: false,
    enableDiversity: true,
    refreshInterval: 0,
  })

  const filterOptions = useMemo(() => getFilterOptionsFromTours(tours), [tours])
  const [destination, setDestination] = useState(filterOptions.destinations[0])
  const [month, setMonth] = useState(filterOptions.months[0])
  const [nights, setNights] = useState(filterOptions.nights[0])
  const [tripName, setTripName] = useState('Trip name?')
  const [sortBy, setSortBy] = useState('date')
  const [activeCollection, setActiveCollection] = useState('featured')
  const [featuredIds, setFeaturedIds] = useState([])
  const [showGuidanceModal, setShowGuidanceModal] = useState(false)

  useEffect(() => {
    let cancelled = false
    getFeaturedTourIds()
      .then((ids) => {
        if (!cancelled) setFeaturedIds(ids)
      })
      .catch(() => {
        if (!cancelled) setFeaturedIds([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    setDestination((d) => (filterOptions.destinations.includes(d) ? d : filterOptions.destinations[0]))
    setMonth((m) => (filterOptions.months.includes(m) ? m : filterOptions.months[0]))
    setNights((n) => (filterOptions.nights.includes(n) ? n : filterOptions.nights[0]))
    setTripName((t) => (filterOptions.tripNames.includes(t) ? t : 'Trip name?'))
  }, [filterOptions.destinations, filterOptions.months, filterOptions.nights, filterOptions.tripNames])

  useEffect(() => {
    try {
      if (localStorage.getItem('hmtours_guidance_modal_closed') === 'true') return
    } catch (_) {}
    const t = setTimeout(() => setShowGuidanceModal(true), 1500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const id = (location.hash || '').replace('#', '')
    if (!id) return
    const known = COLLECTIONS.find((c) => c.id === id)
    if (known) setActiveCollection(known.id)
    const targetId = known ? `collection-${known.id}` : id
    const timer = setTimeout(() => {
      const node = document.getElementById(targetId) || document.getElementById('departures')
      node?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
    return () => clearTimeout(timer)
  }, [location.hash])

  const searchedTours = useMemo(() => {
    let list = [...tours]
    if (tripName && tripName !== 'Trip name?') {
      list = list.filter((t) => t.name === tripName)
    }
    if (destination && destination !== 'Where to?') {
      list = list.filter(
        (t) =>
          (t.destination || '').toLowerCase().includes(destination.toLowerCase()) ||
          (t.origin || '').toLowerCase().includes(destination.toLowerCase()),
      )
    }
    if (month && month !== 'Travel month?') {
      const monthNum = filterOptions.months.indexOf(month)
      if (monthNum > 0) {
        list = list.filter((t) => new Date(t.departureDate).getMonth() === monthNum - 1)
      }
    }
    if (nights && nights !== 'Nights?') {
      const n = parseInt(nights, 10)
      if (!isNaN(n)) list = list.filter((t) => t.nights === n)
    }
    if (sortBy === 'date') {
      list.sort((a, b) => new Date(a.departureDate) - new Date(b.departureDate))
    } else if (sortBy === 'price') {
      list.sort((a, b) => (a.pricePerGuest || 0) - (b.pricePerGuest || 0))
    } else if (sortBy === 'nights') {
      list.sort((a, b) => (b.nights || 0) - (a.nights || 0))
    }
    return list
  }, [tours, destination, month, nights, tripName, sortBy, filterOptions.months])

  const sections = useMemo(() => {
    const order = new Map(featuredIds.map((id, index) => [id, index]))
    const featuredTours = featuredIds.length
      ? searchedTours
          .filter((tour) => order.has(tour.id))
          .sort((a, b) => order.get(a.id) - order.get(b.id))
      : []

    const categorySections = COLLECTIONS.filter((collection) => collection.id !== 'featured')
      .map((collection) => ({
        ...collection,
        tours: searchedTours.filter((tour) => tourMatchesCollection(tour, collection.id)),
      }))
      .filter((section) => section.tours.length > 0)

    const categorizedIds = new Set(categorySections.flatMap((section) => section.tours.map((tour) => tour.id)))
    const uncategorized = searchedTours.filter((tour) => !categorizedIds.has(tour.id) && !order.has(tour.id))

    const featuredSection = {
      ...COLLECTIONS[0],
      line: featuredIds.length ? COLLECTIONS[0].line : 'Upcoming departures',
      tours: featuredIds.length ? featuredTours : uncategorized,
      curated: featuredIds.length > 0,
    }

    const listed = new Set([
      ...featuredSection.tours.map((tour) => tour.id),
      ...categorySections.flatMap((section) => section.tours.map((tour) => tour.id)),
    ])
    const more = searchedTours.filter((tour) => !listed.has(tour.id))

    const built = []
    if (featuredSection.tours.length > 0) built.push(featuredSection)
    built.push(...categorySections)
    if (more.length > 0) {
      built.push({
        id: 'more',
        label: 'More departures',
        line: 'Open dates',
        tours: more,
      })
    }
    if (built.length === 0) {
      built.push({ ...COLLECTIONS[0], tours: [], curated: featuredIds.length > 0 })
    }
    return built
  }, [searchedTours, featuredIds])

  const collectionCounts = useMemo(() => {
    const counts = {}
    COLLECTIONS.forEach((collection) => {
      const section = sections.find((item) => item.id === collection.id)
      counts[collection.id] = section
        ? section.tours.length
        : collection.id === 'featured'
          ? 0
          : searchedTours.filter((tour) => tourMatchesCollection(tour, collection.id)).length
    })
    return counts
  }, [sections, featuredIds.length, searchedTours])

  const privilegeLabels = useMemo(() => {
    const labels = []
    tours.forEach((tour) => {
      const values = tour.offers?.length ? tour.offers : tour.offer ? [tour.offer] : []
      values.forEach((label) => {
        if (label && !labels.includes(label)) labels.push(label)
      })
    })
    return labels.slice(0, 4)
  }, [tours])

  const filtersActive =
    (destination && destination !== 'Where to?') ||
    (month && month !== 'Travel month?') ||
    (nights && nights !== 'Nights?') ||
    (tripName && tripName !== 'Trip name?')

  const clearSearch = () => {
    setDestination(filterOptions.destinations[0] || 'Where to?')
    setMonth(filterOptions.months[0] || 'Travel month?')
    setNights(filterOptions.nights[0] || 'Nights?')
    setTripName('Trip name?')
    setSortBy('date')
  }

  const selectCollection = (id) => {
    setActiveCollection(id)
    const target = document.getElementById(`collection-${id}`) || document.getElementById('departures')
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const activeCount = collectionCounts[activeCollection] || 0

  const showForYou =
    user &&
    recommendations.length > 0 &&
    activeCollection === 'featured' &&
    !filtersActive

  return (
    <>
      <GuidanceModal open={showGuidanceModal} onClose={() => setShowGuidanceModal(false)} />
      <div ref={pageRef} className="bg-[#f6f1e8] min-h-screen min-h-screen-mobile overflow-x-hidden">
        <section className="relative overflow-hidden">
          <div
            className="hero-plate absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1800&q=80)',
            }}
            aria-hidden
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(10,14,24,0.35) 0%, rgba(10,14,24,0.25) 38%, rgba(10,14,24,0.78) 100%)',
            }}
            aria-hidden
          />
          <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-16">
            <ScrollReveal variant="fade" duration={700}>
              <p className="text-center text-[11px] tracking-[0.38em] uppercase text-[#e6d3b0] mb-3">
                HM Orbit Tours
              </p>
              <h1 className="font-display text-[2.6rem] sm:text-6xl md:text-7xl font-medium text-white text-center leading-[0.95] mb-4">
                Explore Trips
                <span className="block italic font-normal text-[#f3e6cf]">& Holidays</span>
              </h1>
              <p className="text-center text-white/80 text-sm sm:text-base max-w-xl mx-auto font-light tracking-wide">
                Group departures and private journeys — shores, sacred circuits, cities, and the wild.
              </p>
            </ScrollReveal>
          </div>
        </section>

        <section id="plan" className="relative z-20 -mt-14 scroll-mt-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#fbf8f3] border border-[#e6dccb] shadow-[0_24px_60px_-30px_rgba(28,25,21,0.45)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#eadfce]">
                <label className="px-5 py-4 block">
                  <span className="block text-[10px] tracking-[0.22em] uppercase text-[#8c7352] mb-1">
                    Where to
                  </span>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className={selectClass}
                    aria-label="Destination"
                  >
                    {filterOptions.destinations.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="px-5 py-4 block">
                  <span className="block text-[10px] tracking-[0.22em] uppercase text-[#8c7352] mb-1">
                    Travel month
                  </span>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className={selectClass}
                    aria-label="Travel month"
                  >
                    {filterOptions.months.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="px-5 py-4 block">
                  <span className="block text-[10px] tracking-[0.22em] uppercase text-[#8c7352] mb-1">
                    Nights
                  </span>
                  <select
                    value={nights}
                    onChange={(e) => setNights(e.target.value)}
                    className={selectClass}
                    aria-label="Nights"
                  >
                    {filterOptions.nights.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="px-5 py-4 block">
                  <span className="block text-[10px] tracking-[0.22em] uppercase text-[#8c7352] mb-1">
                    Trip name
                  </span>
                  <select
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    className={selectClass}
                    aria-label="Trip name"
                  >
                    {filterOptions.tripNames.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-t border-[#eadfce] bg-[#f7f1e6]">
                <p className="text-xs tracking-wide text-[#6f6252]">
                  {searchedTours.length} departure{searchedTours.length === 1 ? '' : 's'} match this plan
                </p>
                <div className="flex items-center gap-3">
                  {filtersActive && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="text-xs tracking-[0.16em] uppercase text-[#6f6252] hover:text-[#1c1915]"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById('departures')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                    className="inline-flex items-center justify-center px-6 py-2.5 text-[11px] tracking-[0.22em] uppercase text-[#1c1915] bg-[#d4bc94] hover:bg-[#c9ad80] transition-colors"
                  >
                    View departures
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {privilegeLabels.length > 0 && (
          <section id="offers" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 scroll-mt-28">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-[#e4d8c4] py-4">
              <span className="text-[10px] tracking-[0.28em] uppercase text-[#8c7352]">On these departures</span>
              {privilegeLabels.map((label) => (
                <span key={label} className="text-sm text-[#1c1915] font-medium">
                  {label}
                </span>
              ))}
            </div>
          </section>
        )}

        <section id="collections" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-4 scroll-mt-28">
          <div className="flex items-end justify-between gap-6 mb-8">
            <div>
              <p className="text-[11px] tracking-[0.32em] uppercase text-[#8c7352] mb-2">Collections</p>
              <h2 className="font-display text-4xl sm:text-5xl text-[#1c1915] font-medium leading-none">
                Choose a way to travel
              </h2>
            </div>
            <p className="hidden md:block max-w-xs text-sm text-[#6f6252] leading-relaxed text-right">
              Featured and every collection live here. Select one — the departures open on this page.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {COLLECTIONS.map((collection) => {
              const selected = activeCollection === collection.id
              const count = collectionCounts[collection.id] || 0
              return (
                <button
                  key={collection.id}
                  type="button"
                  onClick={() => selectCollection(collection.id)}
                  className={`collection-tile group relative text-left overflow-hidden min-h-[168px] sm:min-h-[210px] ${
                    collection.id === 'featured' ? 'col-span-2 md:col-span-2 lg:col-span-2 min-h-[210px] sm:min-h-[250px]' : ''
                  } ${selected ? 'ring-2 ring-[#1c1915] ring-offset-2 ring-offset-[#f6f1e8]' : ''}`}
                  aria-pressed={selected}
                >
                  <img
                    src={collection.image}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(180deg, rgba(12,14,20,0.05) 20%, rgba(12,14,20,0.78) 100%)',
                    }}
                  />
                  <div className="relative h-full flex flex-col justify-end p-4 sm:p-5">
                    <span className="text-[10px] tracking-[0.22em] uppercase text-[#e6d3b0] mb-1">
                      {count} {count === 1 ? 'departure' : 'departures'}
                    </span>
                    <span className="font-display text-2xl sm:text-3xl text-white leading-none">
                      {collection.label}
                    </span>
                    <span className="mt-1 text-xs text-white/75">{collection.line}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <section id="departures" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-20 scroll-mt-28">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <p className="text-[11px] tracking-[0.32em] uppercase text-[#8c7352] mb-2">Departures</p>
              <h2 className="font-display text-4xl sm:text-5xl text-[#1c1915] font-medium leading-none">
                Open on this page
              </h2>
            </div>
            <label className="flex items-center gap-3 text-sm text-[#6f6252]">
              <span className="text-[10px] tracking-[0.2em] uppercase">Sort</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-b border-[#cbbfa8] py-1 text-[#1c1915] font-medium focus:outline-none"
                aria-label="Sort departures"
              >
                <option value="date">Departure date</option>
                <option value="price">Price</option>
                <option value="nights">Duration</option>
              </select>
            </label>
          </div>

          {showForYou && (
            <div className="mb-14">
              <div className="flex items-baseline justify-between mb-6">
                <h3 className="font-display text-3xl text-[#1c1915]">Top choices for you</h3>
                <span className="text-[10px] tracking-[0.22em] uppercase text-[#8c7352]">Personal</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {recommendations.map((tour, index) => (
                  <ScrollReveal key={`rec-${tour.id}`} variant="slideUp" staggerIndex={Math.min(index, 6)} duration={400}>
                    <CompactTourCard tour={tour} staggerIndex={index} />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          )}

          {toursLoading && tours.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mx-auto h-10 w-10 rounded-full border border-[#d4bc94] border-t-[#1c1915] animate-spin" />
              <p className="mt-5 text-sm tracking-wide text-[#6f6252]">Preparing departures</p>
            </div>
          ) : (
            <div className="space-y-16">
              {sections.every((section) => section.tours.length === 0) && (
                <div className="py-16 text-center border border-[#e4d8c4] bg-[#fbf8f3]">
                  <h3 className="font-display text-3xl text-[#1c1915] mb-3">No departures match this plan</h3>
                  <button
                    type="button"
                    onClick={() => {
                      clearSearch()
                      setActiveCollection('featured')
                    }}
                    className="inline-flex items-center px-6 py-3 text-[11px] tracking-[0.22em] uppercase bg-[#1c1915] text-[#f6f1e8]"
                  >
                    Clear the plan
                  </button>
                </div>
              )}
              {activeCount === 0 && activeCollection !== 'featured' && sections.some((section) => section.tours.length > 0) && (
                <div className="py-10 text-center border border-[#e4d8c4] bg-[#fbf8f3]">
                  <h3 className="font-display text-3xl text-[#1c1915] mb-2">
                    No departures in {COLLECTIONS.find((c) => c.id === activeCollection)?.label || 'this collection'}
                  </h3>
                  <p className="text-sm text-[#6f6252]">
                    The other collections below stay on this page.
                  </p>
                </div>
              )}
              {sections.map((section) => (
                <div key={section.id} id={`collection-${section.id}`} className="scroll-mt-28">
                  <div className="flex items-end justify-between gap-4 mb-6 border-b border-[#e4d8c4] pb-4">
                    <div>
                      <p className="text-[11px] tracking-[0.28em] uppercase text-[#8c7352] mb-1">{section.line}</p>
                      <h3 className="font-display text-3xl sm:text-4xl text-[#1c1915]">{section.label}</h3>
                    </div>
                    <p className="text-sm text-[#6f6252] tabular-nums">
                      {section.tours.length}
                    </p>
                  </div>
                  {section.tours.length === 0 ? null : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
                      {section.tours.map((tour, index) => (
                        <ScrollReveal key={`${section.id}-${tour.id}`} variant="slideUp" staggerIndex={Math.min(index, 6)} duration={400}>
                          <CompactTourCard tour={tour} staggerIndex={index} />
                        </ScrollReveal>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section id="enquiry" className="scroll-mt-28 bg-[#121820] text-[#f6f1e8]">
          <div id="callback" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-start">
              <div>
                <p className="text-[11px] tracking-[0.32em] uppercase text-[#d4bc94] mb-3">Private planning</p>
                <h2 className="font-display text-4xl sm:text-5xl font-medium leading-none mb-5">
                  A departure arranged around you
                </h2>
                <p className="text-white/70 text-sm sm:text-base max-w-md leading-relaxed">
                  Group enquiries and callbacks stay with the same desk. Share a name and number — we return the call.
                </p>
              </div>
              <CallbackCard />
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
