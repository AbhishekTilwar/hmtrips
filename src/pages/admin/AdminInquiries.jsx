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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 font-medium">Loading inquiries…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inquiries</h1>
        <p className="text-slate-600 mt-1 text-sm">Customer inquiries and contact requests.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {list.length === 0 ? (
          <p className="p-12 text-slate-500 text-center">No inquiries yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="text-left py-4 px-5 font-semibold text-slate-700 uppercase tracking-wider text-xs">Date</th>
                  <th className="text-left py-4 px-5 font-semibold text-slate-700 uppercase tracking-wider text-xs">Trip</th>
                  <th className="text-left py-4 px-5 font-semibold text-slate-700 uppercase tracking-wider text-xs">Contact</th>
                  <th className="text-left py-4 px-5 font-semibold text-slate-700 uppercase tracking-wider text-xs">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((iq) => (
                  <tr key={iq.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5 text-slate-600 whitespace-nowrap">{formatDate(iq.createdAt)}</td>
                    <td className="py-4 px-5 font-medium text-slate-900">{iq.tourName || 'General'}</td>
                    <td className="py-4 px-5 text-slate-700">
                      {iq.userEmail && <span className="block">{iq.userEmail}</span>}
                      {iq.userPhone && <span className="block">{iq.userPhone}</span>}
                      {iq.userName && <span className="block text-slate-500">{iq.userName}</span>}
                      {!iq.userEmail && !iq.userPhone && '—'}
                    </td>
                    <td className="py-4 px-5 text-slate-600 max-w-xs truncate">{iq.message || '—'}</td>
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
