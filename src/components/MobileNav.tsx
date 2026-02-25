import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { signOut } from 'aws-amplify/auth'
import logo from '../assets/Logo_LEAVS.png'
import {
  GraduationCap,
  FileText,
  Plane,
  ClipboardList,
  Home,
  Shield,
  Heart,
  HelpCircle,
  DollarSign,
  Users,
  CreditCard,
  BookOpen,
  Hash,
  Sparkles,
  User,
  LogOut,
  Menu,
  X,
  Award,
} from 'lucide-react'
import { fetchMe } from '../lib/api'

const stepsItems = [
  { label: 'University Application', path: '/dashboard/university-application', icon: <GraduationCap size={18} /> },
  { label: 'Funding & Scholarships', path: '/dashboard/funding-scholarships', icon: <Award size={18} /> },
  { label: 'Student Visa', path: '/dashboard/student-visa', icon: <FileText size={18} /> },
  { label: 'Codice Fiscale', path: '/dashboard/codice-fiscale', icon: <Hash size={18} /> },
  { label: 'Before Departure', path: '/dashboard/before-departure', icon: <Plane size={18} /> },
  { label: 'Residence Permit', path: '/dashboard/immigration-registration', icon: <ClipboardList size={18} /> },
  { label: 'Housing', path: '/dashboard/housing', icon: <Home size={18} /> },
  { label: 'Banking', path: '/dashboard/banking', icon: <CreditCard size={18} /> },
  { label: 'Insurance', path: '/dashboard/insurance', icon: <Shield size={18} /> },
  { label: 'Healthcare', path: '/dashboard/healthcare', icon: <Heart size={18} /> },
]

const toolsItems = [
  { label: 'Information Centre', path: '/dashboard/information-centre', icon: <HelpCircle size={18} /> },
  { label: 'Cost of Living', path: '/dashboard/cost-of-living', icon: <DollarSign size={18} /> },
  { label: 'Buddy System', path: '/dashboard/buddy-system', icon: <Users size={18} /> },
  { label: 'AI Support', path: '/dashboard/ai-support', icon: <Sparkles size={18} /> },
  { label: 'Find Your Peers', path: '/dashboard/find-your-peers', icon: <Users size={18} /> },
]

const blogItems = [
  { label: 'Blog Posts', path: '/dashboard/blog', icon: <BookOpen size={18} /> },
]

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const [visaStepDisabled, setVisaStepDisabled] = useState(false)
  const location = useLocation()

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    fetchMe()
      .then((data) => {
        if (data?.profile?.isEuCitizen !== undefined) {
          setVisaStepDisabled(data.profile.isEuCitizen === 'yes')
        }
      })
      .catch(() => {})
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = '/'
    } catch (e) {
      console.error(e)
    }
  }

  const homeButtonPath = location.pathname === '/dashboard' ? '/' : '/dashboard'

  function NavItem({ label, path, icon, disabled }: { label: string; path: string; icon: React.ReactNode; disabled?: boolean }) {
    const isActive = location.pathname === path
    if (disabled) {
      return (
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 opacity-60 cursor-not-allowed">
          <span className="flex-shrink-0">{icon}</span>
          <span>{label}</span>
          <span className="ml-auto text-[10px] italic">EU exempt</span>
        </div>
      )
    }
    return (
      <Link
        to={path}
        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
          isActive
            ? 'bg-blue-100 text-blue-800 font-semibold'
            : 'text-slate-700 hover:bg-slate-100'
        }`}
      >
        <span className="flex-shrink-0 text-slate-500">{icon}</span>
        <span>{label}</span>
      </Link>
    )
  }

  return (
    <>
      {/* Fixed top bar — mobile only */}
      <header className="fixed top-0 inset-x-0 z-40 md:hidden flex items-center justify-between px-4 h-14 bg-white/90 backdrop-blur border-b border-slate-200 shadow-sm">
        <Link to="/dashboard">
          <img src={logo} alt="Leavs" className="h-7 w-auto" />
        </Link>
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Slide-down overlay — mobile only */}
      {isOpen && (
        <div className="fixed inset-0 z-30 md:hidden" onClick={() => setIsOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/20" />
        </div>
      )}

      <nav
        className={`fixed top-14 inset-x-0 z-30 md:hidden bg-white border-b border-slate-200 shadow-lg overflow-y-auto transition-all duration-200 ease-in-out ${
          isOpen ? 'max-h-[calc(100vh-3.5rem)] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
        aria-label="Mobile navigation"
      >
        <div className="px-4 py-4 space-y-5">

          {/* Steps */}
          <div>
            <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Steps</p>
            <ul className="space-y-0.5">
              {stepsItems.map((item) => (
                <li key={item.label}>
                  <NavItem
                    label={item.label}
                    path={item.path}
                    icon={item.icon}
                    disabled={item.label === 'Student Visa' && visaStepDisabled}
                  />
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Tools</p>
            <ul className="space-y-0.5">
              {toolsItems.map((item) => (
                <li key={item.label}>
                  <NavItem label={item.label} path={item.path} icon={item.icon} />
                </li>
              ))}
            </ul>
          </div>

          {/* Blog */}
          <div>
            <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Blog</p>
            <ul className="space-y-0.5">
              {blogItems.map((item) => (
                <li key={item.label}>
                  <NavItem label={item.label} path={item.path} icon={item.icon} />
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div className="border-t border-slate-100 pt-4 space-y-0.5">
            <NavItem label="My Situation" path="/my-situation" icon={<User size={18} />} />
            <NavItem label={location.pathname === '/dashboard' ? 'Home' : 'Dashboard'} path={homeButtonPath} icon={<Home size={18} />} />
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut size={18} className="flex-shrink-0 text-slate-500" />
              Sign Out
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}
