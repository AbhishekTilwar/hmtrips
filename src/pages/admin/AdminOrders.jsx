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

  if (loading) return <p className="text-slate-600">Loading orders…</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Orders</h1>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {list.length === 0 ? (
          <p className="p-8 text-slate-500 text-center">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Trip</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Guests</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {list.map((ord) => (
                  <tr key={ord.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{formatDate(ord.createdAt)}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{ord.tourName}</td>
                    <td className="py-3 px-4 text-slate-700">
                      {ord.userEmail && <span className="block">{ord.userEmail}</span>}
                      {ord.userPhone && <span className="block">{ord.userPhone}</span>}
                      {!ord.userEmail && !ord.userPhone && '—'}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">₹{Number(ord.amount).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-slate-600">{ord.guests ?? '—'}</td>
                    <td className="py-3 px-4">
                      <select
                        value={ord.status}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                        className="rounded border border-slate-300 text-sm py-1 px-2"
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
