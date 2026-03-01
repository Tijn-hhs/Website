import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GraduationCap, Award, FileText, Hash, Plane,
  ClipboardList, Home, CreditCard, Shield, Heart,
} from 'lucide-react'
import { isSignedIn } from '../lib/auth'
import BlogGallery from './BlogGallery'

const journeySteps = [
  { num: '01', label: 'University Application', icon: <GraduationCap size={22} /> },
  { num: '02', label: 'Funding & Scholarships', icon: <Award size={22} /> },
  { num: '03', label: 'Student Visa', icon: <FileText size={22} /> },
  { num: '04', label: 'Codice Fiscale', icon: <Hash size={22} /> },
  { num: '05', label: 'Before Departure', icon: <Plane size={22} /> },
  { num: '06', label: 'Residence Permit', icon: <ClipboardList size={22} /> },
  { num: '07', label: 'Housing', icon: <Home size={22} /> },
  { num: '08', label: 'Banking', icon: <CreditCard size={22} /> },
  { num: '09', label: 'Insurance', icon: <Shield size={22} /> },
  { num: '10', label: 'Healthcare', icon: <Heart size={22} /> },
]

const features = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    title: 'Personalized plan',
    desc: 'Every step tailored to your nationality, university, and start date.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Deadline tracker',
    desc: 'Never miss an appointment or document deadline again.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Local guides',
    desc: 'Curated info on housing, banking, healthcare and more, specifically for Milan.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Free forever',
    desc: 'Built for students, by students. No fees, no paywalls.',
  },
]

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
      {/* ── Section 1: Feature highlights ────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-[#F9F7F1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-[#8870FF] tracking-widest uppercase mb-3">What you get</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Everything you need to move abroad.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-[#E8E4F8] hover:border-[#8870FF]/40 hover:shadow-md transition-all duration-200">
                <div className="w-12 h-12 bg-[#D9D3FB] rounded-xl flex items-center justify-center text-[#8870FF] mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-900 text-base mb-1">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 2: Journey at a glance ───────────────────────────── */}
      <section className="py-16 sm:py-20 bg-[#F9F7F1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-[#8870FF] tracking-widest uppercase mb-3">Your roadmap</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              10 steps. One clear path.
            </h2>
            <p className="mt-3 text-slate-500 max-w-xl mx-auto">
              From your acceptance letter to settling in. Leavs covers every milestone in order.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {journeySteps.map((step) => (
              <div key={step.num} className="relative bg-white rounded-2xl p-4 border border-[#E8E4F8] flex flex-col items-start gap-3 hover:border-[#8870FF]/50 hover:shadow-sm transition-all duration-200">
                <span className="text-xs font-bold text-[#8870FF]/60 tracking-widest">{step.num}</span>
                <span className="text-[#8870FF]">{step.icon}</span>
                <span className="text-sm font-medium text-slate-800 leading-snug">{step.label}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <button
              onClick={handleGetStarted}
              disabled={isLoading}
              className="inline-flex items-center justify-center px-7 py-3.5 bg-[#FF5402] text-white font-semibold rounded-xl shadow-lg hover:bg-[#e64a00] hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF5402] focus:ring-offset-2 disabled:opacity-60"
            >
              {isLoading ? 'Loading...' : 'Start my relocation plan →'}
            </button>
          </div>
        </div>
      </section>

      {/* ── Section 3: Who is it for? ─────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-[#F9F7F1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-[#8870FF] tracking-widest uppercase mb-3">Made for you</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Wherever you're from, we've got you covered.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* EU */}
            <div className="rounded-2xl border border-[#E8E4F8] bg-white p-8">
              <div className="inline-flex items-center gap-2 bg-[#D9D3FB] text-[#8870FF] text-xs font-bold px-3 py-1.5 rounded-full mb-5 tracking-wide uppercase">
                🇪🇺 EU citizen
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">No visa needed, but still a lot to do.</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                {['Register at the Comune (residency)', 'Get your Codice Fiscale', 'Open an Italian bank account', 'Find housing (avoid scams)', 'Set up Italian healthcare (SSN)'].map(item => (
                  <li key={item} className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8870FF] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Non-EU */}
            <div className="rounded-2xl border-2 border-[#8870FF] bg-[#D9D3FB]/20 p-8">
              <div className="inline-flex items-center gap-2 bg-[#8870FF] text-white text-xs font-bold px-3 py-1.5 rounded-full mb-5 tracking-wide uppercase">
                🌍 Non-EU citizen
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Visa, permit, registration: all in one place.</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                {['Apply for student visa (Type D)', 'Declare presence within 8 days of arrival', 'Apply for Permesso di Soggiorno', 'Get your Codice Fiscale', 'Open a bank account & find housing'].map(item => (
                  <li key={item} className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8870FF] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 4: City callout — Milan ──────────────────────────── */}
      <section className="py-16 sm:py-20 bg-[#1E1152] relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#8870FF]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-[#FF5402]/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#8870FF]/20 text-[#D9D3FB] text-xs font-bold px-3 py-1.5 rounded-full tracking-widest uppercase">
                📍 Now live in
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
                Milan, Italy.
              </h2>
              <p className="text-[#D9D3FB]/80 text-lg leading-relaxed max-w-md">
                Home to Bocconi, Politecnico, Cattolica and more. Every year thousands of international students move to Milan. Leavs is built specifically for that journey.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                {['Bocconi University', 'Politecnico di Milano', 'Cattolica', 'NABA', 'IED', 'Humanitas'].map(uni => (
                  <span key={uni} className="px-3 py-1.5 rounded-lg bg-white/10 text-[#D9D3FB] text-sm font-medium border border-white/10">
                    {uni}
                  </span>
                ))}
              </div>
              <p className="text-[#D9D3FB]/50 text-sm pt-2">Rome, Florence & Turin coming soon.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '10', label: 'Steps covered', sub: 'End-to-end' },
                { value: '100%', label: 'Free for students', sub: 'No hidden fees' },
                { value: '8 days', label: 'To declare presence', sub: 'After arriving in Italy' },
                { value: '1', label: 'Place for everything', sub: 'Visa to healthcare' },
              ].map(stat => (
                <div key={stat.label} className="bg-white/10 rounded-2xl p-5 border border-white/10">
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-[#D9D3FB] font-medium text-sm mt-1">{stat.label}</p>
                  <p className="text-[#D9D3FB]/50 text-xs mt-0.5">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 5: Solution / dashboard image ────────────────────── */}
      <section className="py-16 sm:py-20 bg-[#F9F7F1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-6">
              <p className="text-xs font-bold text-[#8870FF] tracking-widest uppercase">The dashboard</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                Your personalized relocation plan.
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Leavs creates a step-by-step timeline based on your nationality, destination, university and start date.
              </p>
              <ul className="space-y-3">
                {['Clear deadlines at every step', 'Document checklists per step', 'Track progress as you go', 'Essential services in one place'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-[#D9D3FB] flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-[#8870FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleGetStarted}
                disabled={isLoading}
                className="inline-flex items-center justify-center px-6 py-3 bg-[#8870FF] text-white font-semibold rounded-xl shadow-lg hover:bg-[#6a54e0] hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#8870FF] focus:ring-offset-2 disabled:opacity-60"
              >
                {isLoading ? 'Loading...' : 'Create My Relocation Plan'}
              </button>
            </div>
            <div className="flex justify-center lg:justify-end">
              <img
                src="/assets/dashboard-mock.png"
                alt="Leavs dashboard preview"
                className="w-full h-auto rounded-2xl shadow-2xl max-w-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Blog Gallery */}
      <BlogGallery />

      {/* ── Final CTA ─────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 lg:py-24 bg-[#F9F7F1]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold text-[#8870FF] tracking-widest uppercase mb-4">Get started</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 leading-tight">
            Stop guessing.<br />Start planning.
          </h2>
          <p className="text-lg text-slate-500 mb-8">Free for students. Takes 3 minutes.</p>
          <button
            onClick={handleGetStarted}
            disabled={isLoading}
            className="inline-flex items-center justify-center px-9 py-4 bg-[#FF5402] text-white font-semibold rounded-xl shadow-xl hover:bg-[#e64a00] hover:shadow-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF5402] focus:ring-offset-2 disabled:opacity-60 text-lg"
          >
            {isLoading ? 'Loading...' : 'Create My Relocation Plan →'}
          </button>
        </div>
      </section>
    </>
  )
}
