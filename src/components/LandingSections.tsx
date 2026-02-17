import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isSignedIn } from '../lib/auth'

export default function LandingSections() {
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
    <>
      {/* Section 1 - Problem */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Moving abroad shouldn't feel like guesswork.
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Visa rules, housing, registration, insurance — every country has different requirements. Most students rely on scattered information and outdated websites.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Confusing visa processes
              </h3>
            </div>
            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Unclear deadlines
              </h3>
            </div>
            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Risk of housing scams
              </h3>
            </div>
          </div>

          <div className="text-center">
            <p className="text-base text-slate-600 italic">
              "70% of students describe the residence permit process as difficult."
            </p>
          </div>
        </div>
      </section>

      {/* Section 2 - Solution */}
      <section className="py-16 sm:py-20 lg:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
                Your personalized relocation plan.
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Leavs creates a step-by-step timeline based on your nationality, destination, university and start date.
              </p>
              
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-blue-700 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700 text-lg">Clear deadlines</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-blue-700 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700 text-lg">Document checklist</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-blue-700 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700 text-lg">Step-by-step guidance</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-blue-700 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700 text-lg">Essential services in one place</span>
                </li>
              </ul>

              <div className="pt-4">
                <button
                  onClick={handleGetStarted}
                  disabled={isLoading}
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-800 hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Loading...' : 'Create My Relocation Plan'}
                </button>
              </div>
            </div>

            {/* Right Image */}
            <div className="flex justify-center lg:justify-end">
              <img
                src="/assets/dashboard-mock.png"
                alt="Leavs dashboard preview"
                className="w-full h-auto rounded-lg shadow-2xl max-w-2xl"
                style={{ border: 'none', outline: 'none' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 - How It Works */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
              How Leavs works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-12">
            {/* Step 1 */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-700 font-bold text-2xl mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                Tell us your situation
              </h3>
              <p className="text-slate-600">
                Destination, nationality and university.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-700 font-bold text-2xl mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                Get your personalized checklist
              </h3>
              <p className="text-slate-600">
                A clear timeline with what to do and when.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-700 font-bold text-2xl mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                Move with confidence
              </h3>
              <p className="text-slate-600">
                Track progress and complete every step.
              </p>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleGetStarted}
              disabled={isLoading}
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-800 hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : 'Start My Plan'}
            </button>
          </div>
        </div>
      </section>

      {/* Section 4 - Comparison */}
      <section className="py-16 sm:py-20 lg:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
              Why not just use Chatgpt?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Google/Reddit/ChatGPT Column */}
            <div className="p-8 rounded-xl border-2 border-slate-200 bg-white">
              <h3 className="text-xl font-semibold text-slate-900 mb-6 text-center">
                Google / Reddit / ChatGPT
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-slate-600">Fragmented info</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-slate-600">Outdated pages</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-slate-600">No deadlines</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-slate-600">Risk of misinformation</span>
                </li>
              </ul>
            </div>

            {/* Leavs Column */}
            <div className="p-8 rounded-xl border-2 border-blue-700 bg-blue-50">
              <h3 className="text-xl font-semibold text-slate-900 mb-6 text-center">
                Leavs
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-blue-700 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700 font-medium">Structured timeline</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-blue-700 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700 font-medium">Country-specific guidance</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-blue-700 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700 font-medium">Personalized deadlines</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-blue-700 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700 font-medium">Verified process</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-blue-700 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700 font-medium">Free for students</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 - Trust */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Built for international students by international students in Europe.
            </h2>
            <p className="text-lg text-slate-600">
              Launching first in Milan, expanding across Italy and Europe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900">University partners</h3>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900">Housing partners</h3>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900">Service partners</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6 - Final CTA */}
      <section className="py-16 sm:py-20 lg:py-24 bg-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Stop guessing. Start planning.
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Free for students.
          </p>
          
          <div className="flex flex-col items-center">
            <button
              onClick={handleGetStarted}
              disabled={isLoading}
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-700 font-semibold rounded-xl shadow-xl hover:bg-slate-50 hover:shadow-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-lg"
            >
              {isLoading ? 'Loading...' : 'Create My Relocation Plan'}
            </button>
            <p className="text-sm text-blue-100 mt-4">
              Takes ~3 minutes.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
