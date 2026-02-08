import { useState, useEffect } from 'react'
import { getToursFromFirestore, getTourByIdFromFirestore } from '../lib/firestore'
import { tours as staticTours, getTourById as getStaticById } from './tours'

export function useTours() {
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getToursFromFirestore()
      .then((data) => {
        if (cancelled) return
        if (data && data.length > 0) {
          setTours(data.map(normalizeTour))
        } else {
          setTours(staticTours)
        }
      })
      .catch(() => {
        if (!cancelled) setTours(staticTours)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return { tours, loading }
}

function normalizeTour(t) {
  const tripTag = t.tripTag || t.shipName || ''
  return {
    id: t.id,
    name: t.name || '',
    tagline: t.tagline || '',
    tripTag,
    shipName: tripTag,
    origin: t.origin || '',
    destination: t.destination || '',
    nights: Number(t.nights) || 0,
    departureDate: t.departureDate || '',
    endDate: t.endDate || '',
    image: t.image || '',
    pricePerGuest: Number(t.pricePerGuest) || 0,
    pricePerNight: Number(t.pricePerNight) || 0,
    offer: t.offer || null,
    offers: Array.isArray(t.offers) ? t.offers : [],
    viewing: Number(t.viewing) || 0,
    ports: Array.isArray(t.ports) ? t.ports : [],
    highlights: Array.isArray(t.highlights) ? t.highlights : [],
    highlightImages: Array.isArray(t.highlightImages) ? t.highlightImages : [],
    itinerary: Array.isArray(t.itinerary) ? t.itinerary : [],
    inclusions: Array.isArray(t.inclusions) ? t.inclusions : [],
    exclusions: Array.isArray(t.exclusions) ? t.exclusions : [],
    galleryThumbnails: Array.isArray(t.galleryThumbnails) ? t.galleryThumbnails : [],
    shoreExcursionImages: Array.isArray(t.shoreExcursionImages) ? t.shoreExcursionImages : [],
    inclusionDetails: Array.isArray(t.inclusionDetails) ? t.inclusionDetails : [],
    inclusionNote: t.inclusionNote || '',
    entertainmentShows: Array.isArray(t.entertainmentShows) ? t.entertainmentShows : [],
  }
}

export function useTourById(id) {
  const [tour, setTour] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setTour(null)
      setLoading(false)
      return
    }
    let cancelled = false
    getTourByIdFromFirestore(id)
      .then((t) => {
        if (cancelled) return
        setTour(t ? normalizeTour(t) : getStaticById(id))
      })
      .catch(() => {
        if (!cancelled) setTour(getStaticById(id))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [id])

  return { tour, loading }
}
