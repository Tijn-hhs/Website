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
    <footer
      className="bg-[#1E1152] border-t border-[#8870FF]/30 mt-auto"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-8">
          {/* Left Block - Brand */}
          <div className="space-y-3">
            <Link
              to="/"
              className="inline-block text-2xl font-bold text-white hover:text-[#D9D3FB] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8870FF] focus:ring-offset-2 focus:ring-offset-[#1E1152] rounded"
            >
              Leavs
            </Link>
            <p className="text-sm text-[#D9D3FB]/80 leading-relaxed max-w-xs">
              Your international student journey, simplified.
            </p>
            <p className="text-xs text-[#FF5402] font-medium">Free for students.</p>
          </div>

          {/* Middle Block - Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-[#D9D3FB] uppercase tracking-wider mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  {link.href ? (
                    <a
                      href={link.href}
                      className="text-[#D9D3FB]/70 hover:text-white hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-[#8870FF] focus:ring-offset-1 rounded inline-block"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.to!}
                      className="text-[#D9D3FB]/70 hover:text-white hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-[#8870FF] focus:ring-offset-1 rounded inline-block"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Right Block - Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-[#D9D3FB] uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  {link.href ? (
                    <a
                      href={link.href}
                      className="text-[#D9D3FB]/70 hover:text-white hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-[#8870FF] focus:ring-offset-1 rounded inline-block"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.to!}
                      className="text-[#D9D3FB]/70 hover:text-white hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-[#8870FF] focus:ring-offset-1 rounded inline-block"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Row - Copyright */}
        <div className="pt-8 border-t border-[#8870FF]/30">
          <p className="text-sm text-[#D9D3FB]/50 text-center">
            © {currentYear} Leavs. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
