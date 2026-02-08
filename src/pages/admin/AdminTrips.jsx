import { useState, useEffect } from 'react'
import { getToursFromFirestore, createTour, updateTour, deleteTour } from '../../lib/firestore'

// Dummy images admins can pick from, or they can enter their own URL
const DUMMY_MAIN_IMAGES = [
  { label: 'Beach sunset', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80' },
  { label: 'Ocean voyage', url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80' },
  { label: 'Tropical island', url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80' },
  { label: 'Cruise ship', url: 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=800&q=80' },
  { label: 'Coastal view', url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80' },
  { label: 'Sunset sea', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80' },
]
const DUMMY_HIGHLIGHT_IMAGES = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80',
  'https://images.unsplash.com/photo-1536935338788-423bbd3fd26e?w=600&q=80',
  'https://images.unsplash.com/photo-1571266028243-d220e8d2d7e2?w=600&q=80',
  'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&q=80',
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80',
  'https://images.unsplash.com/photo-1473496169904-7ba300e6cbcb?w=600&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
]

const defaultTrip = {
  name: '',
  tagline: '',
  tripTag: '',
  origin: '',
  destination: '',
  nights: 2,
  departureDate: '',
  endDate: '',
  image: '',
  pricePerGuest: 0,
  pricePerNight: 0,
  offer: '',
  offers: [],
  viewing: 0,
  ports: [],
  highlights: [],
  highlightImages: [],
  itinerary: [{ day: 1, port: '', description: '' }],
  inclusions: [],
  exclusions: [],
}

// Sample trip for "Auto-fill" — appears on website after you save
const SAMPLE_TRIP = {
  name: 'Mumbai → Goa Express (Sample)',
  tagline: '3-Night Weekend Getaway',
  tripTag: 'Weekend Getaway',
  origin: 'Mumbai',
  destination: 'Goa',
  nights: 3,
  departureDate: '2026-04-15',
  endDate: '2026-04-18',
  image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  pricePerGuest: 14999,
  pricePerNight: 4999,
  offer: 'Flat 10% Off',
  offers: ['2nd Guest Free', '25% Discount'],
  viewing: 0,
  ports: ['Mumbai', 'Goa', 'Goa', 'Mumbai'],
  highlights: ['Quick escape', 'Goa shores', 'Beach & city tours', 'Live music'],
  highlightImages: [
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80',
    'https://images.unsplash.com/photo-1536935338788-423bbd3fd26e?w=600&q=80',
    'https://images.unsplash.com/photo-1571266028243-d220e8d2d7e2?w=600&q=80',
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&q=80',
  ],
  itinerary: [
    { day: 1, port: 'Mumbai', description: 'Departure 6:00 PM. Welcome dinner and live entertainment.' },
    { day: 2, port: 'Goa', description: 'Arrive in Goa by afternoon. Evening at leisure. Overnight stay.' },
    { day: 3, port: 'Goa', description: 'Full day in Goa. Beach and city tours, or relax at the resort.' },
    { day: 4, port: 'Mumbai', description: 'Return by noon after breakfast.' },
  ],
  inclusions: ['Cabin accommodation', 'All meals', 'Entertainment', 'Pool access'],
  exclusions: ['Shore excursions', 'Spa', 'Alcoholic beverages'],
}

function parseList(val) {
  if (typeof val === 'string') return val.split(',').map((s) => s.trim()).filter(Boolean)
  return Array.isArray(val) ? val : []
}

function TripForm({ trip, onSave, onCancel, saving, onFillSample }) {
  const [form, setForm] = useState(trip || defaultTrip)

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  const updateList = (key, str) => update(key, parseList(str))
  const updateItinerary = (index, field, value) => {
    setForm((f) => {
      const it = [...(f.itinerary || [])]
      it[index] = { ...(it[index] || {}), [field]: field === 'day' ? Number(value) || index + 1 : value }
      return { ...f, itinerary: it }
    })
  }
  const addItineraryDay = () => {
    setForm((f) => ({
      ...f,
      itinerary: [...(f.itinerary || []), { day: (f.itinerary?.length || 0) + 1, port: '', description: '' }],
    }))
  }
  const removeItineraryDay = (index) => {
    setForm((f) => ({
      ...f,
      itinerary: f.itinerary.filter((_, i) => i !== index).map((d, i) => ({ ...d, day: i + 1 })),
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const tripTagVal = form.tripTag ?? form.shipName ?? ''
    const payload = {
      ...form,
      shipName: tripTagVal,
      tripTag: tripTagVal,
      nights: Number(form.nights) || 0,
      pricePerGuest: Number(form.pricePerGuest) || 0,
      pricePerNight: Number(form.pricePerNight) || 0,
      viewing: Number(form.viewing) || 0,
      offers: parseList(form.offers),
      ports: parseList(form.ports),
      highlights: parseList(form.highlights),
      highlightImages: parseList(form.highlightImages),
      inclusions: parseList(form.inclusions),
      exclusions: parseList(form.exclusions),
    }
    onSave(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {onFillSample && (
        <div className="flex flex-wrap items-center gap-4 p-5 bg-amber-50/80 border border-amber-200/80 rounded-xl shadow-sm">
          <p className="text-sm text-amber-800 flex-1 min-w-0">
            Fill the form with sample trip data, then click &quot;Create trip&quot;. The trip will appear on the website.
          </p>
          <button
            type="button"
            onClick={() => setForm({ ...SAMPLE_TRIP })}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg text-sm whitespace-nowrap shadow-sm transition-colors"
          >
            Auto-fill sample trip
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Trip name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tagline</label>
          <input
            type="text"
            value={form.tagline}
            onChange={(e) => update('tagline', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Trip / Package tag</label>
          <input
            type="text"
            value={form.tripTag ?? form.shipName ?? ''}
            onChange={(e) => update('tripTag', e.target.value)}
            placeholder="e.g. Weekend Getaway, Explorer"
            className="w-full px-4 py-2 rounded-lg border border-slate-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Origin</label>
          <input
            type="text"
            value={form.origin}
            onChange={(e) => update('origin', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Destination</label>
          <input
            type="text"
            value={form.destination}
            onChange={(e) => update('destination', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nights *</label>
          <input
            type="number"
            min={1}
            value={form.nights}
            onChange={(e) => update('nights', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Departure date *</label>
          <input
            type="date"
            value={form.departureDate}
            onChange={(e) => update('departureDate', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">End date</label>
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => update('endDate', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">Main cover image</label>
          <p className="text-xs text-slate-500 mb-2">Pick a preset or enter your own URL below.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-3">
            {DUMMY_MAIN_IMAGES.map((img) => (
              <button
                key={img.url}
                type="button"
                onClick={() => update('image', img.url)}
                className={`relative rounded-lg overflow-hidden border-2 transition-all aspect-[4/3] ${
                  form.image === img.url ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-slate-200 hover:border-slate-400'
                }`}
              >
                <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1 py-0.5 truncate">{img.label}</span>
              </button>
            ))}
          </div>
          <input
            type="url"
            value={form.image}
            onChange={(e) => update('image', e.target.value)}
            placeholder="Or enter your own image URL"
            className="w-full px-4 py-2 rounded-lg border border-slate-300 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Price per guest (₹)</label>
          <input
            type="number"
            min={0}
            value={form.pricePerGuest || ''}
            onChange={(e) => update('pricePerGuest', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Price per night (₹)</label>
          <input
            type="number"
            min={0}
            value={form.pricePerNight || ''}
            onChange={(e) => update('pricePerNight', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Offer (e.g. Flat 10% Off)</label>
          <input
            type="text"
            value={form.offer}
            onChange={(e) => update('offer', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Offers (comma-separated)</label>
          <input
            type="text"
            value={Array.isArray(form.offers) ? form.offers.join(', ') : form.offers}
            onChange={(e) => updateList('offers', e.target.value)}
            placeholder="2nd Guest Free, 25% Discount"
            className="w-full px-4 py-2 rounded-lg border border-slate-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Viewing count</label>
          <input
            type="number"
            min={0}
            value={form.viewing || ''}
            onChange={(e) => update('viewing', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Stops / Route (comma-separated)</label>
          <input
            type="text"
            value={Array.isArray(form.ports) ? form.ports.join(', ') : form.ports}
            onChange={(e) => updateList('ports', e.target.value)}
            placeholder="Mumbai, Goa, Lakshadweep, Mumbai"
            className="w-full px-4 py-2 rounded-lg border border-slate-300"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Highlights (comma-separated)</label>
          <input
            type="text"
            value={Array.isArray(form.highlights) ? form.highlights.join(', ') : form.highlights}
            onChange={(e) => updateList('highlights', e.target.value)}
            placeholder="Goa beaches, Sunset sails"
            className="w-full px-4 py-2 rounded-lg border border-slate-300"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">Highlight / gallery images</label>
          <p className="text-xs text-slate-500 mb-2">Click to add preset images, or enter your own URLs (comma-separated) below.</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {DUMMY_HIGHLIGHT_IMAGES.map((url) => {
              const current = Array.isArray(form.highlightImages) ? form.highlightImages : []
              const isSelected = current.includes(url)
              return (
                <button
                  key={url}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      update('highlightImages', current.filter((u) => u !== url))
                    } else {
                      update('highlightImages', [...current, url])
                    }
                  }}
                  className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                    isSelected ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              )
            })}
          </div>
          <input
            type="text"
            value={Array.isArray(form.highlightImages) ? form.highlightImages.join(', ') : form.highlightImages}
            onChange={(e) => updateList('highlightImages', e.target.value)}
            placeholder="Or enter image URLs (comma-separated)"
            className="w-full px-4 py-2 rounded-lg border border-slate-300 text-sm"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Inclusions (comma-separated)</label>
          <input
            type="text"
            value={Array.isArray(form.inclusions) ? form.inclusions.join(', ') : form.inclusions}
            onChange={(e) => updateList('inclusions', e.target.value)}
            placeholder="Accommodation, All meals"
            className="w-full px-4 py-2 rounded-lg border border-slate-300"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Exclusions (comma-separated)</label>
          <input
            type="text"
            value={Array.isArray(form.exclusions) ? form.exclusions.join(', ') : form.exclusions}
            onChange={(e) => updateList('exclusions', e.target.value)}
            placeholder="Shore excursions, Spa"
            className="w-full px-4 py-2 rounded-lg border border-slate-300"
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-slate-700">Itinerary (day-wise)</label>
          <button type="button" onClick={addItineraryDay} className="text-sm text-blue-600 hover:underline">
            + Add day
          </button>
        </div>
        <div className="space-y-3">
          {(form.itinerary || []).map((day, index) => (
            <div key={index} className="flex gap-2 items-start p-3 bg-slate-50 rounded-lg">
              <input
                type="number"
                min={1}
                value={day.day}
                onChange={(e) => updateItinerary(index, 'day', e.target.value)}
                className="w-14 px-2 py-1.5 rounded border border-slate-300"
                placeholder="Day"
              />
              <input
                type="text"
                value={day.port}
                onChange={(e) => updateItinerary(index, 'port', e.target.value)}
                className="flex-1 px-3 py-1.5 rounded border border-slate-300"
                placeholder="Location"
              />
              <input
                type="text"
                value={day.description}
                onChange={(e) => updateItinerary(index, 'description', e.target.value)}
                className="flex-1 px-3 py-1.5 rounded border border-slate-300"
                placeholder="Description"
              />
              <button type="button" onClick={() => removeItineraryDay(index)} className="text-red-600 hover:underline text-sm">
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : (trip?.id ? 'Update trip' : 'Create trip')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 border border-slate-300 bg-white text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function AdminTrips() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = () => getToursFromFirestore().then(setList)

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  const handleSave = async (payload) => {
    setSaving(true)
    try {
      if (editing) {
        await updateTour(editing.id, payload)
        setEditing(null)
      } else {
        await createTour(payload)
        setCreating(false)
      }
      await load()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this trip?')) return
    try {
      await deleteTour(id)
      setEditing(null)
      await load()
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 font-medium">Loading trips…</p>
        </div>
      </div>
    )
  }

  if (creating || editing) {
    const tripData = editing ? { ...list.find((t) => t.id === editing.id), id: editing.id } : null
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{editing ? 'Edit trip' : 'Create trip'}</h1>
          <p className="text-slate-600 mt-1 text-sm">Changes appear on the website immediately after saving.</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
          <TripForm
            trip={tripData}
            onSave={handleSave}
            onCancel={() => { setCreating(false); setEditing(null) }}
            saving={saving}
            onFillSample={creating}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Trips</h1>
          <p className="text-slate-600 mt-1 text-sm">
            Trips you create here appear on the website. Visitors see them on the tours page.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors shrink-0"
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add trip
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {list.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium">No trips yet</p>
            <p className="text-slate-500 text-sm mt-1">Click &quot;Add trip&quot; and use &quot;Auto-fill sample trip&quot; to add a demo — it will show on the website after you save.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="text-left py-4 px-5 font-semibold text-slate-700 uppercase tracking-wider text-xs">Trip</th>
                  <th className="text-left py-4 px-5 font-semibold text-slate-700 uppercase tracking-wider text-xs">Route</th>
                  <th className="text-left py-4 px-5 font-semibold text-slate-700 uppercase tracking-wider text-xs">Dates</th>
                  <th className="text-left py-4 px-5 font-semibold text-slate-700 uppercase tracking-wider text-xs">Price</th>
                  <th className="text-right py-4 px-5 font-semibold text-slate-700 uppercase tracking-wider text-xs">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5 font-medium text-slate-900">{t.name}</td>
                    <td className="py-4 px-5 text-slate-600">{t.origin} → {t.destination}</td>
                    <td className="py-4 px-5 text-slate-600">{t.departureDate} – {t.endDate || '—'}</td>
                    <td className="py-4 px-5 text-slate-700 font-medium">₹{Number(t.pricePerGuest).toLocaleString('en-IN')}</td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditing({ id: t.id })}
                          className="px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 font-medium rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(t.id)}
                          className="px-3 py-1.5 text-red-600 hover:bg-red-50 font-medium rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
