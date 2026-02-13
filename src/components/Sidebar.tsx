import { Link, useLocation } from 'react-router-dom'

export default function Sidebar() {
  const navItems: readonly { label: string; path: string }[] = [
    { label: 'University Application', path: '/dashboard/university-application' },
    { label: 'Student Visa', path: '/dashboard/student-visa' },
    { label: 'Before Departure', path: '/dashboard/before-departure' },
    { label: 'Immigration & Registration', path: '/dashboard/immigration-registration' },
    { label: 'Arrival & First Days', path: '/dashboard/arrival-first-days' },
    { label: 'Housing', path: '/dashboard/housing' },
    { label: 'Legal, Banking & Insurance', path: '/dashboard/legal-banking-insurance' },
    { label: 'Healthcare', path: '/dashboard/healthcare' },
    { label: 'Information Centre', path: '/dashboard/information-centre' },
    { label: 'Daily Life', path: '/dashboard/daily-life' },
    { label: 'Cost of Living', path: '/dashboard/cost-of-living' },
  ]

  const location = useLocation()
  const isHomeActive = location.pathname === '/'

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-gradient-to-b from-slate-50 via-blue-50 to-purple-50 shadow-md flex flex-col border-r border-slate-200/70">
      {/* Logo Section */}
      <div className="flex items-center justify-center pt-8 pb-6 px-6">
        <Link to="/" aria-label="Go to homepage" className="inline-flex">
          <img src="/assets/Logo.png" alt="LiveCity Logo" className="w-32 h-auto" />
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 pt-2 overflow-y-auto">
        <ul className="space-y-1.5 pb-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path

            // IMPORTANT: Link is inline by default; make it block/flex so backgrounds, padding, w-full work.
            const itemClasses = `flex items-center w-full text-left px-4 py-2.5 text-sm rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 border-l-2 border-transparent ${
              isActive
                ? 'bg-blue-100/60 text-slate-900 font-semibold border-blue-400 shadow-sm focus:ring-blue-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 focus:ring-blue-200'
            }`

            return (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className={itemClasses}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto border-t border-slate-200/70 px-4 py-4 space-y-1.5">
        <Link
          to="/my-situation"
          className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${
            location.pathname === '/my-situation'
              ? 'bg-blue-100/60 text-slate-900 font-semibold focus:ring-blue-300'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 focus:ring-blue-200'
          }`}
          aria-label="My Situation"
          aria-current={location.pathname === '/my-situation' ? 'page' : undefined}
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          My Situation
        </Link>
        
        <Link
          to="/"
          className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${
            isHomeActive
              ? 'bg-blue-100/60 text-slate-900 font-semibold focus:ring-blue-300'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 focus:ring-blue-200'
          }`}
          aria-label="Home"
          aria-current={isHomeActive ? 'page' : undefined}
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 12l9-9 9 9" />
            <path d="M9 21v-8h6v8" />
          </svg>
          Home
        </Link>
      </div>
    </aside>
  )
}