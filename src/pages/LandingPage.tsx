import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import heroMock from '../assets/Hero_mock.png'
import Header from '../components/Header'
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
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-blue-600 tracking-wide uppercase">
                  Welcome to LiveCity
                </p>
                <h1 className="text-4xl sm:text-5xl lg:text-5xl font-bold text-slate-900 leading-tight">
                  Your international student journey, simplified.
                </h1>
              </div>
              
              <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
                From choosing the right university to settling into your new city LiveCity guides you through every step of your relocation.
              </p>

              {/* CTA Button */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={handleGetStarted}
                  disabled={isLoading}
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-800 hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Loading...' : 'Get Started'}
                </button>
              </div>
            </div>

            {/* Right Image */}
            <div className="flex justify-center lg:justify-end">
              <img
                src={heroMock}
                alt="International students in a modern city"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
