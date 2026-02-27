import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, MapPin, CalendarCheck } from 'lucide-react'
import logo from '../assets/Logo_LEAVS.png'

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F9F7F1]">

      {/* Left — lavender branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] flex-shrink-0 bg-[#D9D3FB] p-12 xl:p-16">
        <Link to="/">
          <img src={logo} alt="Leavs" className="h-8 w-auto" />
        </Link>

        <div className="space-y-6">
          <h1 className="text-4xl xl:text-5xl font-bold text-slate-900 leading-[1.1]">
            Your journey to Milan starts here.
          </h1>
          <p className="text-base text-slate-700 leading-relaxed max-w-sm">
            Sign in to access your personalised relocation plan — from visa to housing, all in one place.
          </p>
          <div className="space-y-3 pt-2">
            {[
              { icon: GraduationCap, text: 'Step-by-step guidance for every stage' },
              { icon: MapPin, text: 'Local insights on housing, banking & more' },
              { icon: CalendarCheck, text: 'Never miss a deadline again' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#8870FF]/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-[#8870FF]" />
                </div>
                <span className="text-sm font-medium text-slate-700">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-500">Free for students · No paywalls</p>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 sm:px-10">
        {/* Mobile logo */}
        <Link to="/" className="mb-8 lg:hidden">
          <img src={logo} alt="Leavs" className="h-8 w-auto mx-auto" />
        </Link>

        <div className="w-full max-w-md bg-white rounded-2xl border border-[#EDE9D8] shadow-md p-8">
          {children}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          By continuing, you agree to Leavs'{' '}
          <a href="#" className="text-[#8870FF] hover:text-[#6a54e0] font-medium">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-[#8870FF] hover:text-[#6a54e0] font-medium">Privacy Policy</a>
        </p>
      </div>

    </div>
  )
}
