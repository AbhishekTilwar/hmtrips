import { Link } from 'react-router-dom'

const MAIN_MENU = [
  { label: 'Offers', href: '#offers' },
  { label: 'Destinations', href: '#destinations' },
  { label: 'Entertainment', href: '#' },
  { label: 'Dining', href: '#' },
  { label: 'Accommodation', href: '#' },
  { label: 'Wedding & Events', href: '#' },
  { label: 'Corporate', href: '#' },
  { label: 'Check-in', href: '#' },
]

const DESTINATIONS = ['Mumbai', 'Lakshadweep', 'Goa', 'Chennai', 'Kochi', 'Hambantota', 'Trincomalee', 'Jaffna', 'Singapore', 'Malaysia', 'Thailand']

const LINKS = [
  { label: 'Careers', href: '#' },
  { label: 'Blogs', href: '#' },
  { label: 'Group Booking Form', href: '#' },
  { label: 'Agent Login', href: '#' },
  { label: 'Admin', href: '/admin/login', internal: true },
  { label: 'About Us', href: '#' },
  { label: 'Destinations', href: '#' },
  { label: 'Website T&C', href: '#' },
]

const PRIVACY = [
  { label: 'All Policy', href: '#' },
  { label: 'FAQ', href: '#' },
  { label: 'Terms and Conditions', href: '#' },
  { label: 'Trips SOP', href: '#' },
  { label: 'Investor Relation', href: '#' },
  { label: 'User Agreement - Visa', href: '#' },
  { label: 'Privacy Policy - Visa', href: '#' },
  { label: 'Disclaimer Against Frauds', href: '#' },
]

export default function Footer() {
  return (
    <>
      {/* Wavy divider */}
      <div className="relative h-12 w-full overflow-hidden bg-white">
        <svg
          className="absolute bottom-0 left-0 w-full h-12 text-[#0f172a]"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,120 L0,120 Z"
            fill="currentColor"
          />
          <path
            d="M0,80 C200,40 400,120 600,80 C800,40 1000,120 1200,80 L1200,120 L0,120 Z"
            fill="currentColor"
            opacity="0.5"
          />
        </svg>
      </div>

      <footer className="bg-[#0f172a] text-neutral-300 relative overflow-hidden">
        {/* Subtle jellyfish / oceanic background */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" aria-hidden>
          <div className="absolute top-20 left-[10%] w-32 h-32 rounded-full bg-white blur-3xl" />
          <div className="absolute top-40 right-[20%] w-40 h-40 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-40 left-[30%] w-24 h-24 rounded-full bg-white blur-2xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          {/* Four columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 lg:gap-12 mb-12">
            <div>
              <h4 className="font-display font-semibold text-white text-sm uppercase tracking-wider mb-4">Main Menu</h4>
              <ul className="space-y-0 md:space-y-2.5">
                {MAIN_MENU.map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} className="block py-2.5 md:py-0 md:inline text-sm text-neutral-400 hover:text-white transition-colors min-touch">{label}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold text-white text-sm uppercase tracking-wider mb-4">All Destinations</h4>
              <ul className="space-y-0 md:space-y-2.5">
                {DESTINATIONS.map((d) => (
                  <li key={d}>
                    <Link to="/" className="block py-2.5 md:py-0 md:inline text-sm text-neutral-400 hover:text-white transition-colors min-touch">{d}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold text-white text-sm uppercase tracking-wider mb-4">Links</h4>
              <ul className="space-y-0 md:space-y-2.5">
                {LINKS.map(({ label, href, internal }) => (
                  <li key={label}>
                    {internal ? (
                      <Link to={href} className="block py-2.5 md:py-0 md:inline text-sm text-neutral-400 hover:text-white transition-colors min-touch">{label}</Link>
                    ) : (
                      <a href={href} className="block py-2.5 md:py-0 md:inline text-sm text-neutral-400 hover:text-white transition-colors min-touch">{label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold text-white text-sm uppercase tracking-wider mb-4">Privacy Policy</h4>
              <ul className="space-y-0 md:space-y-2.5">
                {PRIVACY.map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} className="block py-2.5 md:py-0 md:inline text-sm text-neutral-400 hover:text-white transition-colors min-touch">{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Support / Booking sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-y border-neutral-700/50 mb-10">
            <div>
              <h4 className="font-display font-semibold text-white text-sm mb-2">Group Travel Desk (Corporate / Travel Partner)</h4>
              <p className="text-sm text-neutral-400 mb-1">travelops@hmtours.com</p>
              <p className="text-xs text-neutral-500">Mon–Fri 10 AM to 7 PM · Only for our Travel Partners</p>
            </div>
            <div>
              <h4 className="font-display font-semibold text-white text-sm mb-2">Customer Support</h4>
              <p className="text-sm text-neutral-400 mb-1"><a href="tel:+918805795709" className="hover:text-white transition-colors">+91 8805795709</a></p>
              <p className="text-sm text-neutral-400 mb-1"><a href="tel:+918278717103" className="hover:text-white transition-colors">+91 8278717103</a></p>
              <p className="text-sm text-neutral-400 mb-1">info@hmtours.com</p>
              <p className="text-xs text-neutral-500">Mon–Fri 9 AM to 8 PM · Sat/Sun & Public Holidays 10 AM to 7 PM</p>
            </div>
            <div>
              <h4 className="font-display font-semibold text-white text-sm mb-2">Book Now / Contact</h4>
              <p className="text-sm text-neutral-400 mb-1"><a href="tel:+918805795709" className="hover:text-white transition-colors">+91 8805795709</a></p>
              <p className="text-sm text-neutral-400"><a href="tel:+918278717103" className="hover:text-white transition-colors">+91 8278717103</a></p>
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-neutral-500 text-sm text-center md:text-left">© {new Date().getFullYear()} HM Tours. All rights reserved.</p>
            <Link to="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm min-touch py-2 md:py-0">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-700 via-blue-500 to-sky-500 text-white font-bold text-sm">HM</span>
              HM TOURS
            </Link>
          </div>
        </div>
      </footer>
    </>
  )
}
