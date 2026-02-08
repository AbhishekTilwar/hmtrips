import { useState, useEffect } from 'react'
import { getOrders, updateOrderStatus } from '../../lib/firestore'

export default function AdminOrders() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => getOrders().then(setList)

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status)
      setList((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)))
    } catch (_) {}
  }

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
          <p className="text-slate-600 font-medium">Loading orders…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Orders</h1>
        <p className="text-slate-600 mt-1 text-sm">Bookings and order status.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {list.length === 0 ? (
          <p className="p-12 text-slate-500 text-center">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="text-left py-4 px-5 font-semibold text-slate-700 uppercase tracking-wider text-xs">Date</th>
                  <th className="text-left py-4 px-5 font-semibold text-slate-700 uppercase tracking-wider text-xs">Trip</th>
                  <th className="text-left py-4 px-5 font-semibold text-slate-700 uppercase tracking-wider text-xs">Customer</th>
                  <th className="text-left py-4 px-5 font-semibold text-slate-700 uppercase tracking-wider text-xs">Amount</th>
                  <th className="text-left py-4 px-5 font-semibold text-slate-700 uppercase tracking-wider text-xs">Guests</th>
                  <th className="text-left py-4 px-5 font-semibold text-slate-700 uppercase tracking-wider text-xs">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5 text-slate-600 whitespace-nowrap">{formatDate(ord.createdAt)}</td>
                    <td className="py-4 px-5 font-medium text-slate-900">{ord.tourName}</td>
                    <td className="py-4 px-5 text-slate-700">
                      {ord.userEmail && <span className="block">{ord.userEmail}</span>}
                      {ord.userPhone && <span className="block">{ord.userPhone}</span>}
                      {!ord.userEmail && !ord.userPhone && '—'}
                    </td>
                    <td className="py-4 px-5 font-medium text-slate-900">₹{Number(ord.amount).toLocaleString('en-IN')}</td>
                    <td className="py-4 px-5 text-slate-600">{ord.guests ?? '—'}</td>
                    <td className="py-4 px-5">
                      <select
                        value={ord.status}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                        className="rounded-lg border border-slate-300 text-sm py-1.5 px-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                      </select>
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
