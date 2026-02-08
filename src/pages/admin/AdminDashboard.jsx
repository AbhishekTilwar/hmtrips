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
          <p className="text-slate-600 font-medium">Loading dashboard…</p>
        </div>
      </div>
    )
  }

  const cards = [
    { label: 'Trips', value: stats.tours, path: '/admin/trips', color: 'from-indigo-500 to-indigo-600', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { label: 'Inquiries', value: stats.inquiries, path: '/admin/inquiries', color: 'from-emerald-500 to-emerald-600', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { label: 'Orders', value: stats.orders, path: '/admin/orders', color: 'from-amber-500 to-amber-600', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { label: 'Payments', value: stats.payments, path: '/admin/payments', color: 'from-violet-500 to-violet-600', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2h-2m-4-1V7a2 2 0 012-2h2a2 2 0 012 2v1' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-600 mt-1 text-sm">Overview of your trips and activity.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {cards.map(({ label, value, path, color, icon }) => (
          <Link
            key={path}
            to={path}
            className="group bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
              </svg>
            </div>
            <p className="text-slate-600 text-sm font-medium">{label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
            <span className="inline-flex items-center gap-1 text-indigo-600 text-sm font-medium mt-2 group-hover:gap-2 transition-all">
              View
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
        ))}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-600 text-sm font-medium">Total Revenue</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-semibold text-slate-900">Recent Inquiries</h2>
            <Link to="/admin/inquiries" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentInquiries.length === 0 ? (
              <p className="p-6 text-slate-500 text-sm">No inquiries yet.</p>
            ) : (
              recentInquiries.map((iq) => (
                <div key={iq.id} className="px-6 py-4 hover:bg-slate-50/50 transition-colors">
                  <p className="font-medium text-slate-900">{iq.tourName || 'General'}</p>
                  <p className="text-slate-600 text-sm">{iq.userEmail || iq.userPhone || '—'}</p>
                  <p className="text-slate-400 text-xs mt-1">{formatDate(iq.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-semibold text-slate-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentOrders.length === 0 ? (
              <p className="p-6 text-slate-500 text-sm">No orders yet.</p>
            ) : (
              recentOrders.map((ord) => (
                <div key={ord.id} className="px-6 py-4 hover:bg-slate-50/50 transition-colors">
                  <p className="font-medium text-slate-900">{ord.tourName}</p>
                  <p className="text-slate-600 text-sm">₹{Number(ord.amount).toLocaleString('en-IN')} · <span className="capitalize">{ord.status}</span></p>
                  <p className="text-slate-400 text-xs mt-1">{formatDate(ord.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
