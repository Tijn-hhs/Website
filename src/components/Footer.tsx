import { Link } from 'react-router-dom'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const productLinks = [
    { label: 'How it works', to: '/' },
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'My Situation', to: '/my-situation' },
    { label: 'Support', href: 'mailto:support@leavs.com' },
  ]

  const companyLinks = [
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms', to: '/terms' },
    { label: 'Contact', href: 'mailto:hello@leavs.com' },
  ]

  return (
    <footer className="mt-auto px-4 sm:px-6 lg:px-8 pb-5 sm:pb-7">
      <div className="bg-[#D9D3FC] rounded-3xl shadow-xl border border-white/60 px-8 sm:px-10 lg:px-14 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Main grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-8">
            {/* Brand */}
            <div className="space-y-3">
              <Link
                to="/"
                className="inline-block text-2xl font-bold text-[#1E1152] hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#8870FF] rounded"
              >
                Leavs
              </Link>
              <p className="text-sm text-[#1E1152]/70 leading-relaxed max-w-xs">
                Your international student journey, simplified.
              </p>
              <p className="text-xs text-[#FF5402] font-medium">Free for students.</p>
            </div>

            {/* Product links */}
            <div>
              <h3 className="text-sm font-semibold text-[#1E1152] uppercase tracking-wider mb-4">
                Product
              </h3>
              <ul className="space-y-3">
                {productLinks.map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <a
                        href={link.href}
                        className="text-sm text-[#1E1152]/70 hover:text-[#1E1152] hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-[#8870FF] rounded inline-block"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.to!}
                        className="text-sm text-[#1E1152]/70 hover:text-[#1E1152] hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-[#8870FF] rounded inline-block"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Company links */}
            <div>
              <h3 className="text-sm font-semibold text-[#1E1152] uppercase tracking-wider mb-4">
                Company
              </h3>
              <ul className="space-y-3">
                {companyLinks.map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <a
                        href={link.href}
                        className="text-sm text-[#1E1152]/70 hover:text-[#1E1152] hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-[#8870FF] rounded inline-block"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.to!}
                        className="text-sm text-[#1E1152]/70 hover:text-[#1E1152] hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-[#8870FF] rounded inline-block"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom row */}
          <div className="pt-8 border-t border-[#8870FF]/20">
            <p className="text-sm text-[#1E1152]/50 text-center">
              © {currentYear} Leavs. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
