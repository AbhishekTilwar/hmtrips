import { Outlet, Navigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminLayout() {
  const { user, isAdmin, signOut, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-600">Loading…</p>
      </div>
    )
  }
  if (!user || !isAdmin) return <Navigate to="/admin/login" state={{ from: location }} replace />

  const nav = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/trips', label: 'Trips' },
    { path: '/admin/inquiries', label: 'Inquiries' },
    { path: '/admin/orders', label: 'Orders' },
    { path: '/admin/payments', label: 'Payments' },
  ]

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-56 bg-slate-800 text-white flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <Link to="/admin" className="font-bold text-lg">HM Tours Admin</Link>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {nav.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`block px-3 py-2 rounded-lg text-sm ${
                location.pathname === path ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t border-slate-700">
          <span className="block px-3 py-2 text-slate-400 text-sm truncate">{user.email}</span>
          <button
            type="button"
            onClick={() => signOut()}
            className="w-full mt-1 px-3 py-2 text-left text-sm text-red-400 hover:bg-slate-700 rounded-lg"
          >
            Sign out
          </button>
          <Link to="/" className="block mt-1 px-3 py-2 text-sm text-slate-400 hover:bg-slate-700 rounded-lg">
            Back to site
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
