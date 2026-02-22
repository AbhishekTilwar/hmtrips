import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar({ onLoginClick }) {
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)

  const { user, signOut } = useAuth()

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <div className="border-b border-neutral-200/80 shadow-sm bg-white">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <img 
              src="/logo.png" 
              alt="HM Orbit Tours" 
              className="h-16 w-auto object-contain"
            />
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            <button className="text-neutral-700 hover:text-brand-blue font-medium transition-colors flex items-center gap-1">
              Our trips
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            <button className="text-neutral-700 hover:text-brand-blue font-medium transition-colors flex items-center gap-1">
              Destinations
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            <a href="#callback" className="text-neutral-700 hover:text-brand-blue font-medium transition-colors">Group Enquiry</a>
            <a href="#offers" className="text-neutral-700 hover:text-brand-blue font-medium transition-colors">Blogs</a>
            <a href="#offers" className="text-neutral-700 hover:text-brand-blue font-medium transition-colors">Offers</a>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link to="/" className="btn-gradient text-sm py-2.5 px-5">Find A Trip</Link>
            <button type="button" className="btn-outline-purple text-sm py-2.5 px-5">Check-in</button>
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((o) => !o)}
                  className="flex items-center gap-2 text-neutral-700 hover:text-brand-blue font-medium transition-colors rounded-lg py-2 px-2 -mr-2 hover:bg-neutral-50"
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </span>
                  <span className="max-w-[160px] truncate text-sm">{user.email}</span>
                  <svg className={`w-4 h-4 shrink-0 transition-transform ${profileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-1 py-1 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 z-50">
                    <div className="px-3 py-2 border-b border-neutral-100">
                      <p className="text-xs text-neutral-500">Signed in as</p>
                      <p className="text-sm font-medium text-neutral-800 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/watchlist"
                      className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                      onClick={() => setProfileOpen(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      Watchlist
                    </Link>
                    <button
                      type="button"
                      onClick={() => { signOut(); setProfileOpen(false); }}
                      className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-red-600 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button type="button" onClick={() => onLoginClick?.()} className="flex items-center gap-2 text-neutral-700 hover:text-brand-blue font-medium transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Login / Register
              </button>
            )}
          </div>

          <button
            type="button"
            className="lg:hidden p-3 -mr-2 text-neutral-700 hover:bg-neutral-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {open && (
          <div className="lg:hidden py-4 border-t border-neutral-200 space-y-0">
            <a href="#callback" className="block py-3 px-4 text-neutral-700 hover:text-brand-blue hover:bg-neutral-50 border-b border-neutral-100 min-h-[44px] flex items-center" onClick={() => setOpen(false)}>Our trips</a>
            <a href="#destinations" className="block py-3 px-4 text-neutral-700 hover:text-brand-blue hover:bg-neutral-50 border-b border-neutral-100 min-h-[44px] flex items-center" onClick={() => setOpen(false)}>Destinations</a>
            <a href="#callback" className="block py-3 px-4 text-neutral-700 hover:text-brand-blue hover:bg-neutral-50 border-b border-neutral-100 min-h-[44px] flex items-center" onClick={() => setOpen(false)}>Group Enquiry</a>
            <a href="#offers" className="block py-3 px-4 text-neutral-700 hover:text-brand-blue hover:bg-neutral-50 border-b border-neutral-100 min-h-[44px] flex items-center" onClick={() => setOpen(false)}>Blogs</a>
            <a href="#offers" className="block py-3 px-4 text-neutral-700 hover:text-brand-blue hover:bg-neutral-50 border-b border-neutral-100 min-h-[44px] flex items-center" onClick={() => setOpen(false)}>Offers</a>
            <div className="p-4 space-y-2 border-t border-neutral-200 mt-2">
              <Link to="/" className="btn-gradient flex items-center justify-center min-h-[44px] w-full" onClick={() => setOpen(false)}>Find A Trip</Link>
              <button type="button" className="btn-outline-purple w-full min-h-[44px]" onClick={() => setOpen(false)}>Check-in</button>
              {user ? (
                <div className="space-y-2">
                  <Link 
                    to="/watchlist"
                    className="flex items-center gap-2 py-2 px-3 text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg flex items-center gap-2"
                    onClick={() => setOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Watchlist
                  </Link>
                  <div className="flex items-center gap-3 py-3 px-3 rounded-lg bg-neutral-50 border border-neutral-100">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-800 truncate">{user.email}</p>
                      <button type="button" onClick={() => { setOpen(false); signOut(); }} className="text-xs text-red-600 hover:underline mt-0.5">Sign out</button>
                    </div>
                  </div>
                </div>
              ) : (
                <button type="button" className="block py-3 text-center text-neutral-700 hover:text-brand-blue min-h-[44px] w-full" onClick={() => { setOpen(false); onLoginClick?.(); }}>Login / Register</button>
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
  )
}
