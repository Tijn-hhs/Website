/// <reference types="vite/client" />
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signOut, getCurrentUser } from 'aws-amplify/auth'
import { X, Menu, Home, LayoutDashboard, BookOpen, LogIn, LogOut, Gauge } from 'lucide-react'
import logo from '../assets/Logo_LEAVS.png'

const navItems = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Blog', to: '/blog', icon: BookOpen },
]

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  async function checkAuthStatus() {
    try {
      await getCurrentUser()
      setIsAuthenticated(true)
    } catch {
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSignOut() {
    try {
      await signOut()
      setIsAuthenticated(false)
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-4">
      <nav className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between bg-[#F9F7F1] shadow-lg border border-[#D9D3FB]/60 rounded-xl relative">

        {/* Left — Menu button */}
        <div className="flex items-center" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:text-[#8870FF] hover:bg-[#D9D3FB]/40 rounded-lg transition-colors duration-150 focus:outline-none"
            aria-label="Open menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
            <span className="hidden sm:inline">Menu</span>
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#EDE9D8] overflow-hidden z-50">
              <div className="p-2">
                {navItems.map(({ label, to, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-[#F0EDFF] hover:text-[#8870FF] transition-colors duration-150"
                  >
                    <Icon size={17} className="text-[#8870FF]" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center — Logo */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <Link to="/" aria-label="Go to homepage">
            <img
              src={logo}
              alt="Leavs"
              className="h-7 sm:h-8 w-auto"
              fetchPriority="high"
              width={128}
              height={35}
            />
          </Link>
        </div>

        {/* Right — Auth button */}
        <div className="flex items-center">
          {!isLoading && (
            isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#8870FF] hover:bg-[#6a54e0] rounded-lg shadow-sm transition-colors duration-150 focus:outline-none"
                >
                  <Gauge size={16} />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150 focus:outline-none"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#8870FF] hover:bg-[#6a54e0] rounded-lg shadow-sm transition-colors duration-150 focus:outline-none"
              >
                <LogIn size={16} />
                <span className="hidden sm:inline">Log in</span>
              </button>
            )
          )}
        </div>

      </nav>
    </header>
  )
}

