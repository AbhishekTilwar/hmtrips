import { useState, useEffect } from 'react'
import { getToursFromFirestore, createTour, updateTour, deleteTour } from '../../lib/firestore'

const defaultTrip = {
  name: '',
  tagline: '',
  shipName: '',
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

function parseList(val) {
  if (typeof val === 'string') return val.split(',').map((s) => s.trim()).filter(Boolean)
  return Array.isArray(val) ? val : []
}

function TripForm({ trip, onSave, onCancel, saving }) {
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
    const payload = {
      ...form,
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Trip name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300"
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
          <label className="block text-sm font-medium text-slate-700 mb-1">Ship name</label>
          <input
            type="text"
            value={form.shipName}
            onChange={(e) => update('shipName', e.target.value)}
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
          <label className="block text-sm font-medium text-slate-700 mb-1">Main image URL (online)</label>
          <input
            type="url"
            value={form.image}
            onChange={(e) => update('image', e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full px-4 py-2 rounded-lg border border-slate-300"
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
          <label className="block text-sm font-medium text-slate-700 mb-1">Ports (comma-separated)</label>
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
          <label className="block text-sm font-medium text-slate-700 mb-1">Highlight image URLs (comma-separated, online)</label>
          <input
            type="text"
            value={Array.isArray(form.highlightImages) ? form.highlightImages.join(', ') : form.highlightImages}
            onChange={(e) => updateList('highlightImages', e.target.value)}
            placeholder="https://..., https://..."
            className="w-full px-4 py-2 rounded-lg border border-slate-300"
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
                placeholder="Port / location"
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

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">
          {saving ? 'Saving…' : (trip?.id ? 'Update trip' : 'Create trip')}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-slate-300 rounded-lg">
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

  if (loading) return <p className="text-slate-600">Loading trips…</p>

  if (creating || editing) {
    const tripData = editing ? { ...list.find((t) => t.id === editing.id), id: editing.id } : null
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-6">{editing ? 'Edit trip' : 'Create trip'}</h1>
        <TripForm
          trip={tripData}
          onSave={handleSave}
          onCancel={() => { setCreating(false); setEditing(null) }}
          saving={saving}
        />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Trips</h1>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add trip
        </button>
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {list.length === 0 ? (
          <p className="p-8 text-slate-500 text-center">No trips. Create one to show on the site.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Trip</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Route</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Dates</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">{t.name}</td>
                    <td className="py-3 px-4 text-slate-600">{t.origin} → {t.destination}</td>
                    <td className="py-3 px-4 text-slate-600">{t.departureDate} – {t.endDate || '—'}</td>
                    <td className="py-3 px-4 text-slate-700">₹{Number(t.pricePerGuest).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditing({ id: t.id })}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(t.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
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
