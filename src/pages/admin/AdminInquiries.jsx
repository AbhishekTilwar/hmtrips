import { useState, useEffect } from 'react'
import { getInquiries } from '../../lib/firestore'

export default function AdminInquiries() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getInquiries()
      .then((data) => { if (!cancelled) setList(data) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const formatDate = (d) => {
    if (!d) return '—'
    const date = d instanceof Date ? d : (d?.toDate ? d.toDate() : new Date(d))
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  if (loading) return <p className="text-slate-600">Loading inquiries…</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Inquiries</h1>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {list.length === 0 ? (
          <p className="p-8 text-slate-500 text-center">No inquiries yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Trip</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Contact</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Message</th>
                </tr>
              </thead>
              <tbody>
                {list.map((iq) => (
                  <tr key={iq.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{formatDate(iq.createdAt)}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{iq.tourName || 'General'}</td>
                    <td className="py-3 px-4 text-slate-700">
                      {iq.userEmail && <span className="block">{iq.userEmail}</span>}
                      {iq.userPhone && <span className="block">{iq.userPhone}</span>}
                      {iq.userName && <span className="block text-slate-500">{iq.userName}</span>}
                      {!iq.userEmail && !iq.userPhone && '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{iq.message || '—'}</td>
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
