import { useState, useEffect } from 'react'
import { getPayments, getOrders } from '../../lib/firestore'

export default function AdminPayments() {
  const [list, setList] = useState([])
  const [ordersMap, setOrdersMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getPayments(), getOrders()])
      .then(([payments, orders]) => {
        setList(payments)
        setOrdersMap(Object.fromEntries(orders.map((o) => [o.id, o])))
      })
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

  const byStatus = {
    completed: list.filter((p) => p.status === 'completed' || p.status === 'success').length,
    pending: list.filter((p) => p.status === 'pending').length,
    failed: list.filter((p) => p.status === 'failed' || p.status === 'cancelled').length,
  }

  const byMode = list.reduce((acc, p) => {
    const m = (p.method || 'other').toLowerCase()
    acc[m] = (acc[m] || 0) + 1
    return acc
  }, {})

  const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase()
    if (s === 'completed' || s === 'success') return { label: 'Completed', cls: 'bg-emerald-100 text-emerald-700' }
    if (s === 'pending') return { label: 'Pending', cls: 'bg-amber-100 text-amber-700' }
    if (s === 'failed' || s === 'cancelled') return { label: s === 'cancelled' ? 'Cancelled' : 'Failed', cls: 'bg-red-100 text-red-700' }
    return { label: status || '—', cls: 'bg-slate-100 text-slate-600' }
  }

  const getModeLabel = (method) => {
    const m = (method || '').toLowerCase()
    if (m === 'razorpay') return 'Razorpay'
    if (m === 'online') return 'Online'
    if (m === 'cod' || m === 'cash') return 'Cash'
    return method || '—'
  }

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
        <p className="text-slate-600 mt-1 text-sm">Payment history, status, mode and details.</p>
      </div>

      {/* Summary cards: total, by status, by mode */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 shadow-sm">
          <p className="text-slate-600 text-sm font-medium">Total received (completed)</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">₹{totalCompleted.toLocaleString('en-IN')}</p>
        </div>
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-600 text-sm font-medium">By status</p>
          <p className="text-slate-800 mt-1 text-sm">
            <span className="text-emerald-600 font-medium">{byStatus.completed} completed</span>
            {' · '}
            <span className="text-amber-600 font-medium">{byStatus.pending} pending</span>
            {byStatus.failed > 0 && (
              <> · <span className="text-red-600 font-medium">{byStatus.failed} failed/cancelled</span></>
            )}
          </p>
        </div>
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-600 text-sm font-medium">By mode</p>
          <p className="text-slate-800 mt-1 text-sm">
            {Object.entries(byMode).map(([mode, count]) => (
              <span key={mode} className="mr-2">
                <span className="font-medium">{getModeLabel(mode)}</span>: {count}
              </span>
            ))}
            {Object.keys(byMode).length === 0 && '—'}
          </p>
        </div>
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-600 text-sm font-medium">Total payments</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{list.length}</p>
        </div>
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
                  <th className="text-left py-4 px-5 font-semibold text-slate-700 uppercase tracking-wider text-xs">Payment ID</th>
                  <th className="text-left py-4 px-5 font-semibold text-slate-700 uppercase tracking-wider text-xs">Order ID</th>
                  <th className="text-left py-4 px-5 font-semibold text-slate-700 uppercase tracking-wider text-xs">Tour</th>
                  <th className="text-left py-4 px-5 font-semibold text-slate-700 uppercase tracking-wider text-xs">Customer</th>
                  <th className="text-left py-4 px-5 font-semibold text-slate-700 uppercase tracking-wider text-xs">Amount</th>
                  <th className="text-left py-4 px-5 font-semibold text-slate-700 uppercase tracking-wider text-xs">Mode</th>
                  <th className="text-left py-4 px-5 font-semibold text-slate-700 uppercase tracking-wider text-xs">Status</th>
                  <th className="text-left py-4 px-5 font-semibold text-slate-700 uppercase tracking-wider text-xs">Razorpay Order ID</th>
                  <th className="text-left py-4 px-5 font-semibold text-slate-700 uppercase tracking-wider text-xs">Razorpay Payment ID</th>
                  <th className="text-left py-4 px-5 font-semibold text-slate-700 uppercase tracking-wider text-xs">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((p) => {
                  const order = ordersMap[p.orderId] || {}
                  const statusBadge = getStatusBadge(p.status)
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-5 text-slate-600 whitespace-nowrap">{formatDate(p.createdAt)}</td>
                      <td className="py-4 px-5 font-mono text-slate-700 text-xs" title={p.id}>{p.id ? (p.id.length > 10 ? `${p.id.slice(0, 8)}…` : p.id) : '—'}</td>
                      <td className="py-4 px-5 font-mono text-slate-700 text-xs" title={p.orderId}>{p.orderId ? (p.orderId.length > 10 ? `${p.orderId.slice(0, 8)}…` : p.orderId) : '—'}</td>
                      <td className="py-4 px-5 text-slate-800 max-w-[140px] truncate" title={order.tourName}>{order.tourName || '—'}</td>
                      <td className="py-4 px-5 text-slate-700 max-w-[160px]">
                        <span className="block truncate" title={order.userName || order.userEmail}>{order.userName || order.userEmail || '—'}</span>
                        {order.userPhone && <span className="block text-xs text-slate-500 truncate">{order.userPhone}</span>}
                      </td>
                      <td className="py-4 px-5 font-medium text-slate-900">₹{Number(p.amount).toLocaleString('en-IN')}</td>
                      <td className="py-4 px-5">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                          {getModeLabel(p.method)}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${statusBadge.cls}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-mono text-slate-600 text-xs max-w-[100px] truncate" title={p.razorpayOrderId}>{p.razorpayOrderId || '—'}</td>
                      <td className="py-4 px-5 font-mono text-slate-600 text-xs max-w-[100px] truncate" title={p.razorpayPaymentId}>{p.razorpayPaymentId || '—'}</td>
                      <td className="py-4 px-5 text-slate-500 whitespace-nowrap text-xs">{p.updatedAt ? formatDate(p.updatedAt) : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
