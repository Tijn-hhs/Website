import { Link, useLocation } from 'react-router-dom'

export default function Sidebar() {
  const navItems = [
    'University Application',
    'Student Visa',
    'Before Departure',
    'Immigration & Registration',
    'Arrival & First Days',
    'Housing',
    'Legal, Banking & Insurance',
    'Healthcare',
    'Information Centre',
    'Daily Life',
    'Cost of Living'
  ] as const;

  // Mock active state - simulating "Housing" as the active page
  const activeItem = 'University Application';
  const location = useLocation();
  const isHomeActive = location.pathname === '/';

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-gradient-to-b from-slate-50 via-blue-50 to-purple-50 shadow-md flex flex-col border-r border-slate-200/70">
      {/* Logo Section */}
      <div className="flex items-center justify-center pt-8 pb-6 px-6">
        <img
          src="/assets/Logo.png"
          alt="LiveCity Logo"
          className="w-32 h-auto"
        />
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 pt-2 overflow-y-auto">
        <ul className="space-y-1.5 pb-4">
          {navItems.map((item) => {
            const isActive = item === activeItem;
            return (
              <li key={item}>
                <button
                  className={`w-full text-left px-4 py-2.5 text-sm rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 border-l-2 border-transparent ${
                    isActive
                      ? 'bg-blue-100/60 text-slate-900 font-semibold border-blue-400 shadow-sm focus:ring-blue-300'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 focus:ring-blue-200'
                  }`}
                  aria-label={item}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Home Button */}
      <div className="border-t border-slate-200/70 px-4 py-4">
        <Link
          to="/"
          className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${
            isHomeActive
              ? 'bg-blue-100/60 text-slate-900 font-semibold focus:ring-blue-300'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 focus:ring-blue-200'
          }`}
          aria-label="Home"
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
  );
}
