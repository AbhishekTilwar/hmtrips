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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 font-medium">Loading payments…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payments</h1>
        <p className="text-slate-600 mt-1 text-sm">Payment history and totals.</p>
      </div>
      <div className="p-5 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 shadow-sm">
        <p className="text-slate-600 text-sm font-medium">Total received (completed)</p>
        <p className="text-2xl font-bold text-emerald-700 mt-1">₹{totalCompleted.toLocaleString('en-IN')}</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {list.length === 0 ? (
          <p className="p-12 text-slate-500 text-center">No payments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="text-left py-4 px-5 font-semibold text-slate-700 uppercase tracking-wider text-xs">Date</th>
                  <th className="text-left py-4 px-5 font-semibold text-slate-700 uppercase tracking-wider text-xs">Order ID</th>
                  <th className="text-left py-4 px-5 font-semibold text-slate-700 uppercase tracking-wider text-xs">Amount</th>
                  <th className="text-left py-4 px-5 font-semibold text-slate-700 uppercase tracking-wider text-xs">Method</th>
                  <th className="text-left py-4 px-5 font-semibold text-slate-700 uppercase tracking-wider text-xs">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5 text-slate-600 whitespace-nowrap">{formatDate(p.createdAt)}</td>
                    <td className="py-4 px-5 font-mono text-slate-700 text-xs">{p.orderId || '—'}</td>
                    <td className="py-4 px-5 font-medium text-slate-900">₹{Number(p.amount).toLocaleString('en-IN')}</td>
                    <td className="py-4 px-5 text-slate-600">{p.method || '—'}</td>
                    <td className="py-4 px-5">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${
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
