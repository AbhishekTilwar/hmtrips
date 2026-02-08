import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getInquiries, getOrders, getPayments, getToursFromFirestore } from '../../lib/firestore'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    tours: 0,
    inquiries: 0,
    orders: 0,
    payments: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [recentInquiries, setRecentInquiries] = useState([])
  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [tours, inquiries, orders, payments] = await Promise.all([
          getToursFromFirestore(),
          getInquiries(),
          getOrders(),
          getPayments(),
        ])
        if (cancelled) return
        const totalRevenue = payments
          .filter((p) => p.status === 'completed' || p.status === 'success')
          .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
        setStats({
          tours: tours.length,
          inquiries: inquiries.length,
          orders: orders.length,
          payments: payments.length,
          totalRevenue,
        })
        setRecentInquiries(inquiries.slice(0, 5))
        setRecentOrders(orders.slice(0, 5))
      } catch (_) {
        setStats({ tours: 0, inquiries: 0, orders: 0, payments: 0, totalRevenue: 0 })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (loading) return <p className="text-slate-600">Loading dashboard…</p>

  const cards = [
    { label: 'Trips', value: stats.tours, path: '/admin/trips', color: 'bg-blue-500' },
    { label: 'Inquiries', value: stats.inquiries, path: '/admin/inquiries', color: 'bg-emerald-500' },
    { label: 'Orders', value: stats.orders, path: '/admin/orders', color: 'bg-amber-500' },
    { label: 'Payments', value: stats.payments, path: '/admin/payments', color: 'bg-violet-500' },
  ]

  const formatDate = (d) => {
    if (!d) return '—'
    const date = d instanceof Date ? d : (d?.toDate ? d.toDate() : new Date(d))
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, path, color }) => (
          <Link key={path} to={path} className="bg-white rounded-xl shadow p-5 hover:shadow-md transition-shadow">
            <p className="text-slate-600 text-sm">{label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
            <span className="text-blue-600 text-sm mt-2 inline-block">View →</span>
          </Link>
        ))}
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-slate-600 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center">
            <h2 className="font-semibold text-slate-900">Recent Inquiries</h2>
            <Link to="/admin/inquiries" className="text-blue-600 text-sm">View all</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentInquiries.length === 0 ? (
              <p className="p-5 text-slate-500 text-sm">No inquiries yet.</p>
            ) : (
              recentInquiries.map((iq) => (
                <div key={iq.id} className="px-5 py-3 text-sm">
                  <p className="font-medium text-slate-900">{iq.tourName || 'General'}</p>
                  <p className="text-slate-600">{iq.userEmail || iq.userPhone || '—'}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{formatDate(iq.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center">
            <h2 className="font-semibold text-slate-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-blue-600 text-sm">View all</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentOrders.length === 0 ? (
              <p className="p-5 text-slate-500 text-sm">No orders yet.</p>
            ) : (
              recentOrders.map((ord) => (
                <div key={ord.id} className="px-5 py-3 text-sm">
                  <p className="font-medium text-slate-900">{ord.tourName}</p>
                  <p className="text-slate-600">₹{Number(ord.amount).toLocaleString('en-IN')} · {ord.status}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{formatDate(ord.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
