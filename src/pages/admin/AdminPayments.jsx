import { useState, useEffect } from 'react'
import { getPayments } from '../../lib/firestore'

export default function AdminPayments() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPayments()
      .then(setList)
      .finally(() => setLoading(false))
  }, [])

  const formatDate = (d) => {
    if (!d) return '—'
    const date = d instanceof Date ? d : (d?.toDate ? d.toDate() : new Date(d))
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const totalCompleted = list
    .filter((p) => p.status === 'completed' || p.status === 'success')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

  if (loading) return <p className="text-slate-600">Loading payments…</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Payments</h1>
      <div className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
        <p className="text-slate-600 text-sm">Total received (completed)</p>
        <p className="text-2xl font-bold text-emerald-700">₹{totalCompleted.toLocaleString('en-IN')}</p>
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {list.length === 0 ? (
          <p className="p-8 text-slate-500 text-center">No payments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Order ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Method</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{formatDate(p.createdAt)}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{p.orderId || '—'}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">₹{Number(p.amount).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-slate-600">{p.method || '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        (p.status === 'completed' || p.status === 'success') ? 'bg-emerald-100 text-emerald-700' :
                        p.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {p.status}
                      </span>
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
