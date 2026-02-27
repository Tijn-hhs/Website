import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Header from '../components/Header'
import LandingSections from '../components/LandingSections'
import { isSignedIn } from '../lib/auth'

export default function LandingPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const handleGetStarted = async () => {
    setIsLoading(true)
    try {
      const signed = await isSignedIn()
      if (signed) {
        navigate('/dashboard')
      } else {
        navigate('/onboarding')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-[#F5F1E4]">
      <Header />
      
      {/* Hero Section — full viewport height so everything is visible on load */}
      <section className="bg-[#F5F1E4] h-[calc(100vh-72px)] min-h-[560px]">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-8">
            {/* Left Content — lavender card */}
            <div className="bg-[#D9D3FB] rounded-3xl p-7 sm:p-10 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <p className="text-xs font-bold text-[#8870FF] tracking-widest uppercase">
                  Welcome to Leavs
                </p>
                <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-bold text-slate-900 leading-[1.1]">
                  Your international student journey, simplified.
                </h1>
                <p className="text-base text-slate-700 leading-relaxed max-w-md">
                  From visa to housing to banking — Leavs gives you a personalised step-by-step plan for moving to your new city.
                </p>
              </div>

              <div className="space-y-3 mt-6">
                <div className="flex flex-row gap-4 items-center">
                  <button
                    onClick={handleGetStarted}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center px-7 py-3.5 bg-[#FF5402] text-white font-semibold rounded-xl shadow-lg hover:bg-[#e64a00] hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF5402] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed text-base"
                  >
                    {isLoading ? 'Loading...' : 'Get Started →'}
                  </button>
                  <span className="text-sm text-slate-600 font-medium">Free for students</span>
                </div>
                <p className="text-xs text-slate-500">Helping international students move to Milan, Italy</p>
              </div>
            </div>

            {/* Right Image — fills remaining height, cropped below sky */}
            <div className="rounded-3xl overflow-hidden shadow-xl hidden lg:block">
              <img
                src="/assets/new-hompage.jpg"
                alt="Milan Duomo cathedral"
                className="w-full h-full object-cover object-[50%_65%]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* All Landing Sections Below Hero */}
      <LandingSections />
    </div>
  )
}
