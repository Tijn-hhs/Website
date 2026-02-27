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
    <div className="bg-[#F9F7F1]">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-[#F9F7F1] pt-10 pb-0 lg:pt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8">

            {/* Left — compact lavender card, sits high */}
            <div className="w-full lg:w-[45%] flex-shrink-0 bg-[#D9D3FB] rounded-3xl p-8 sm:p-10 flex flex-col gap-8 shadow-lg">
              <div className="space-y-4">
                <p className="text-xs font-bold text-[#8870FF] tracking-widest uppercase">
                  Welcome to Leavs
                </p>
                <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-[1.1]">
                  Your international student journey, simplified.
                </h1>
                <p className="text-base text-slate-700 leading-relaxed">
                  From visa to housing to banking — Leavs gives you a personalised step-by-step plan for moving to your new city.
                </p>
              </div>

              <div className="space-y-3">
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

            {/* Right — image offset down so it starts below the card top and extends further below */}
            <div className="rounded-3xl overflow-hidden shadow-xl hidden lg:flex flex-1 mt-12 h-[520px]">
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
