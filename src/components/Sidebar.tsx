import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { signOut } from 'aws-amplify/auth'
import {
  GraduationCap,
  FileText,
  Plane,
  ClipboardList,
  MapPin,
  Home,
  Shield,
  Heart,
  HelpCircle,
  Coffee,
  DollarSign,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  CreditCard,
  BookOpen,
} from 'lucide-react'
import { fetchMe } from '../lib/api'
import type { OnboardingDraft } from '../onboarding/types'

export default function Sidebar() {
  // State for managing collapsed/expanded sidebar
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Initialize from localStorage if available, default to false (expanded)
    const saved = localStorage.getItem('sidebarCollapsed')
    return saved ? JSON.parse(saved) : false
  })

  // State for checking if student visa step is disabled
  const [visaStepDisabled, setVisaStepDisabled] = useState(false)

  // Persist collapsed state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed))
  }, [isCollapsed])

  // Check user's EU citizen status
  useEffect(() => {
    const checkVisaStepStatus = async () => {
      try {
        const data = await fetchMe()
        if (data?.profile?.onboardingDraftJson) {
          const draft: OnboardingDraft = JSON.parse(data.profile.onboardingDraftJson)
          setVisaStepDisabled(draft.isEuCitizen === 'yes')
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    checkVisaStepStatus()
  }, [])

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // Steps items - Educational/Planning steps
  const stepsItems: readonly { label: string; path: string; icon: React.ReactNode }[] = [
    {
      label: 'University Application',
      path: '/dashboard/university-application',
      icon: <GraduationCap size={20} className="flex-shrink-0" />,
    },
    {
      label: 'Student Visa',
      path: '/dashboard/student-visa',
      icon: <FileText size={20} className="flex-shrink-0" />,
    },
    {
      label: 'Before Departure',
      path: '/dashboard/before-departure',
      icon: <Plane size={20} className="flex-shrink-0" />,
    },
    {
      label: 'Immigration & Registration',
      path: '/dashboard/immigration-registration',
      icon: <ClipboardList size={20} className="flex-shrink-0" />,
    },
    {
      label: 'Housing',
      path: '/dashboard/housing',
      icon: <Home size={20} className="flex-shrink-0" />,
    },
    {
      label: 'Banking',
      path: '/dashboard/banking',
      icon: <CreditCard size={20} className="flex-shrink-0" />,
    },
    {
      label: 'Insurance',
      path: '/dashboard/insurance',
      icon: <Shield size={20} className="flex-shrink-0" />,
    },
    {
      label: 'Healthcare',
      path: '/dashboard/healthcare',
      icon: <Heart size={20} className="flex-shrink-0" />,
    },
  ]

  // Tools items - General information and resources
  const toolsItems: readonly { label: string; path: string; icon: React.ReactNode }[] = [
    {
      label: 'Arrival & First Days',
      path: '/dashboard/arrival-first-days',
      icon: <MapPin size={20} className="flex-shrink-0" />,
    },
    {
      label: 'Information Centre',
      path: '/dashboard/information-centre',
      icon: <HelpCircle size={20} className="flex-shrink-0" />,
    },
    {
      label: 'Daily Life',
      path: '/dashboard/daily-life',
      icon: <Coffee size={20} className="flex-shrink-0" />,
    },
    {
      label: 'Cost of Living',
      path: '/dashboard/cost-of-living',
      icon: <DollarSign size={20} className="flex-shrink-0" />,
    },
  ]

  // Blog items - Blog posts and articles
  const blogItems: readonly { label: string; path: string; icon: React.ReactNode }[] = [
    {
      label: 'Blog Posts',
      path: '/dashboard/blog',
      icon: <BookOpen size={20} className="flex-shrink-0" />,
    },
  ]

  const location = useLocation()
  const isHomeActive = location.pathname === '/'
  const isMySituationActive = location.pathname === '/my-situation'

  // Determine home button navigation
  // If on dashboard home page (/dashboard), go to homepage (/). Otherwise, go to dashboard.
  const homeButtonPath = location.pathname === '/dashboard' ? '/' : '/dashboard'

  return (
    // Enhanced sidebar container with floating effect (margin, border-radius, shadow)
    <aside
      className={`fixed left-4 top-4 h-[calc(100vh-2rem)] rounded-2xl bg-gradient-to-b from-slate-50 via-blue-50 to-purple-50 shadow-lg flex flex-col border border-slate-200/70 transition-all duration-75 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
      aria-label="Navigation sidebar"
    >
      {/* Header Section with Toggle Button */}
      <div className={`flex items-center pt-4 pb-2 ${
        isCollapsed ? 'px-0 justify-center' : 'px-4 justify-between'
      }`}>
        {/* Logo - Hidden when collapsed, fades out smoothly */}
        {!isCollapsed && (
          <Link
            to="/dashboard"
            aria-label="Go to dashboard"
            className="inline-flex flex-shrink-0 transition-opacity duration-75 ease-in-out"
          >
            <img src="/assets/Logo.png" alt="Leavs Logo" className="w-24 h-auto" />
          </Link>
        )}

        {/* Toggle Button - Circular with chevron icon, always visible */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100/60 hover:bg-blue-200/60 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all duration-75 focus:outline-none focus:ring-2 focus:ring-blue-300"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? (
            <ChevronRight size={18} className="flex-shrink-0" />
          ) : (
            <ChevronLeft size={18} className="flex-shrink-0" />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-2 pt-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        <ul className="space-y-1 pb-4">
          {/* Steps Section Header */}
          {!isCollapsed && (
            <li className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide mt-4">
              Steps
            </li>
          )}

          {/* Steps Items */}
          {stepsItems.map((item) => {
            const isActive = location.pathname === item.path
            const isStudentVisaDisabled = item.label === 'Student Visa' && visaStepDisabled

            const itemClasses = `flex items-center w-full h-10 text-sm rounded-lg transition-all duration-75 focus:outline-none focus:ring-2 border-l-2 border-transparent ${
              isCollapsed ? 'px-0 justify-center text-center' : 'px-3 text-left'
            } ${
              isStudentVisaDisabled
                ? 'text-slate-300 cursor-not-allowed opacity-60'
                : isActive
                  ? 'bg-blue-100/60 text-slate-900 font-semibold border-blue-400 shadow-sm focus:ring-blue-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 focus:ring-blue-200'
            }`

            return (
              <li key={item.label}>
                {isStudentVisaDisabled ? (
                  <div
                    className={`relative ${itemClasses}`}
                    title="Not needed for EU citizens"
                  >
                    <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">{item.icon}</span>
                    <span
                      className={`transition-all duration-75 ease-in-out overflow-hidden whitespace-nowrap ${
                        isCollapsed ? 'w-0 ml-0 opacity-0 pointer-events-none' : 'w-auto ml-3 opacity-100'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={itemClasses}
                    aria-label={item.label}
                    aria-current={isActive ? 'page' : undefined}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">{item.icon}</span>
                    <span
                      className={`transition-all duration-75 ease-in-out overflow-hidden whitespace-nowrap ${
                        isCollapsed ? 'w-0 ml-0 opacity-0 pointer-events-none' : 'w-auto ml-3 opacity-100'
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                )}
              </li>
            )
          })}

          {/* Tools Section Header */}
          {!isCollapsed && (
            <li className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide mt-6">
              Tools
            </li>
          )}

          {/* Tools Items */}
          {toolsItems.map((item) => {
            const isActive = location.pathname === item.path

            const itemClasses = `flex items-center w-full h-10 text-sm rounded-lg transition-all duration-75 focus:outline-none focus:ring-2 border-l-2 border-transparent ${
              isCollapsed ? 'px-0 justify-center text-center' : 'px-3 text-left'
            } ${
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
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">{item.icon}</span>
                  <span
                    className={`transition-all duration-75 ease-in-out overflow-hidden whitespace-nowrap ${
                      isCollapsed ? 'w-0 ml-0 opacity-0 pointer-events-none' : 'w-auto ml-3 opacity-100'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            )
          })}

          {/* Blog Section Header */}
          {!isCollapsed && (
            <li className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide mt-6">
              Blog
            </li>
          )}

          {/* Blog Items */}
          {blogItems.map((item) => {
            const isActive = location.pathname === item.path

            const itemClasses = `flex items-center w-full h-10 text-sm rounded-lg transition-all duration-75 focus:outline-none focus:ring-2 border-l-2 border-transparent ${
              isCollapsed ? 'px-0 justify-center text-center' : 'px-3 text-left'
            } ${
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
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">{item.icon}</span>
                  <span
                    className={`transition-all duration-75 ease-in-out overflow-hidden whitespace-nowrap ${
                      isCollapsed ? 'w-0 ml-0 opacity-0 pointer-events-none' : 'w-auto ml-3 opacity-100'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom Section with My Situation and Home links */}
      <div className="border-t border-slate-200/70 px-2 py-4 space-y-1 flex-shrink-0">
        {/* My Situation Link */}
        <Link
          to="/my-situation"
          className={`flex items-center w-full h-10 text-sm rounded-lg transition-all duration-75 focus:outline-none focus:ring-2 ${
            isCollapsed ? 'px-0 justify-center text-center' : 'px-3 text-left'
          } ${
            isMySituationActive
              ? 'bg-blue-100/60 text-slate-900 font-semibold focus:ring-blue-300'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 focus:ring-blue-200'
          }`}
          aria-label="My Situation"
          aria-current={isMySituationActive ? 'page' : undefined}
          title={isCollapsed ? 'My Situation' : undefined}
        >
          {/* Icon - Fixed width to maintain layout */}
          <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            <User size={20} />
          </span>
          {/* Label - Hidden but in DOM to prevent layout shift */}
          <span
            className={`transition-all duration-75 ease-in-out overflow-hidden whitespace-nowrap ${
              isCollapsed ? 'w-0 ml-0 opacity-0 pointer-events-none' : 'w-auto ml-3 opacity-100'
            }`}
          >
            My Situation
          </span>
        </Link>

        {/* Home Link */}
        <Link
          to={homeButtonPath}
          className={`flex items-center w-full h-10 text-sm rounded-lg transition-all duration-75 focus:outline-none focus:ring-2 ${
            isCollapsed ? 'px-0 justify-center text-center' : 'px-3 text-left'
          } ${
            isHomeActive
              ? 'bg-blue-100/60 text-slate-900 font-semibold focus:ring-blue-300'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 focus:ring-blue-200'
          }`}
          aria-label="Home"
          aria-current={isHomeActive ? 'page' : undefined}
          title={isCollapsed ? 'Home' : undefined}
        >
          {/* Icon - Fixed width to maintain layout */}
          <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            <Home size={20} />
          </span>
          {/* Label - Hidden but in DOM to prevent layout shift */}
          <span
            className={`transition-all duration-75 ease-in-out overflow-hidden whitespace-nowrap ${
              isCollapsed ? 'w-0 ml-0 opacity-0 pointer-events-none' : 'w-auto ml-3 opacity-100'
            }`}
          >
            Home
          </span>
        </Link>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className={`flex items-center w-full h-10 text-sm rounded-lg transition-all duration-75 focus:outline-none focus:ring-2 text-slate-600 hover:text-red-700 hover:bg-red-50 focus:ring-red-200 ${
            isCollapsed ? 'px-0 justify-center text-center' : 'px-3 text-left'
          }`}
          aria-label="Sign out"
          title={isCollapsed ? 'Sign Out' : undefined}
        >
          {/* Icon - Fixed width to maintain layout */}
          <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            <LogOut size={20} />
          </span>
          {/* Label - Hidden but in DOM to prevent layout shift */}
          <span
            className={`transition-all duration-75 ease-in-out overflow-hidden whitespace-nowrap ${
              isCollapsed ? 'w-0 ml-0 opacity-0 pointer-events-none' : 'w-auto ml-3 opacity-100'
            }`}
          >
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  )
}