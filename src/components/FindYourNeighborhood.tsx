import { useState } from 'react'
import { getNeighborhoodsForCity, getUniversityLocation, recommendNeighborhoods } from '../lib/neighborhoodConfig'
import NeighborhoodMap from './NeighborhoodMap'
import type { UserProfile } from '../types/user'
import { MapPin, Map, LayoutGrid, Target, Star, ChevronDown } from 'lucide-react'

interface FindYourNeighborhoodProps {
  profile: UserProfile | null
}

const PAGE_SECTIONS = [
  { id: 'overview',       label: 'Overview',        icon: MapPin },
  { id: 'map',            label: 'Map',              icon: Map },
  { id: 'neighborhoods',  label: 'Neighborhoods',    icon: LayoutGrid },
  { id: 'quiz',           label: 'Find your match',  icon: Target },
  { id: 'results',        label: 'Results',          icon: Star },
]

function TabNavigation({ activeId, onSelect }: { activeId: string; onSelect: (id: string) => void }) {
  return (
    <div className="col-span-full">
      <nav className="flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm scrollbar-hide">
        {PAGE_SECTIONS.map(({ id, label, icon: Icon }) => {
          const isActive = activeId === id
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={`flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-white/80' : 'text-slate-400'} />
              {label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

function SectionCard({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <article className="col-span-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
        {icon && <span className="text-slate-500">{icon}</span>}
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </article>
  )
}

function ExpandableNeighborhood({ neighborhood, index, budgetRange }: {
  neighborhood: ReturnType<typeof recommendNeighborhoods>[number]
  index: number
  budgetRange: '0-500' | '500-800' | '800-1100' | '1100+'
}) {
  const [open, setOpen] = useState(index === 0)
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60">
      <button
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-blue-700">#{index + 1}</span>
          <span className="text-sm font-semibold text-slate-800">{neighborhood.name}</span>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
            {neighborhood.avgRent}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`flex-shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="border-t border-slate-200 px-4 pb-4 pt-3">
          <p className="mb-3 text-sm text-slate-600">{neighborhood.description}</p>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-slate-100 bg-white p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Rent</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{neighborhood.avgRent}</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-white p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Walkability</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{neighborhood.walkabilityScore}/10</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-white p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Vibe</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{neighborhood.vibe}</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-white p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Distance</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{neighborhood.distanceToUniversity}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">Why you'll love it</p>
              <ul className="space-y-1">
                {(budgetRange === '0-500' || budgetRange === '500-800'
                  ? neighborhood.prosWithLowBudget
                  : neighborhood.prosWithHighBudget
                ).map((pro, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700">Consider</p>
              <ul className="space-y-1">
                {(budgetRange === '0-500' || budgetRange === '500-800'
                  ? neighborhood.consWithLowBudget
                  : neighborhood.consWithHighBudget
                ).map((con, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function FindYourNeighborhood({ profile }: FindYourNeighborhoodProps) {
  const city = profile?.destinationCity
  const universityName = profile?.universityName

  // State for questionnaire
  const [budgetRange, setBudgetRange] = useState<'0-500' | '500-800' | '800-1100' | '1100+'>('500-800')
  const [preferWalkability, setPreferWalkability] = useState(true)
  const [nightlifePref, setNightlifePref] = useState<'quiet' | 'vibrant'>('vibrant')
  const [communityPref, setCommunityPref] = useState<'mixed' | 'student-heavy'>('mixed')
  const [vibe, setVibe] = useState<'emerging' | 'established'>('emerging')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [activeSection, setActiveSection] = useState('overview')

  // Get neighborhoods and university location
  const neighborhoods = getNeighborhoodsForCity(city)
  const universityLocation = getUniversityLocation(city, universityName)

  // Debug logging
  console.log('[FindYourNeighborhood] Profile loaded:', { city, universityName })
  console.log('[FindYourNeighborhood] Data loaded:', { 
    neighborhoodCount: neighborhoods.length, 
    hasUniversityLocation: !!universityLocation,
    universityLocation
  })

  // Get budget value for filtering
  const budgetMap = {
    '0-500': 500,
    '500-800': 800,
    '800-1100': 1100,
    '1100+': 2000,
  }

  const recommendations = hasAnswered
    ? recommendNeighborhoods(neighborhoods, budgetMap[budgetRange], preferWalkability)
    : []

  if (!city) {
    return (
      <article className="col-span-full rounded-xl border border-blue-200/70 bg-blue-50/60 p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <span className="text-slate-500"><MapPin size={18} /></span>
          No city selected
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Please select a city in your profile first to find neighborhoods.
        </p>
      </article>
    )
  }

  const handleQuizComplete = () => {
    setHasAnswered(true)
    setActiveSection('results')
  }

  return (
    <>
      {/* ── Tab navigation ── */}
      <TabNavigation activeId={activeSection} onSelect={setActiveSection} />

      {/* ── Overview ── */}
      {activeSection === 'overview' && (
        <SectionCard title={`${city} Neighborhood Guide`} icon={<MapPin size={18} />}>
          <p className="text-sm text-slate-600 leading-relaxed">
            Every neighborhood in {city} has its own unique character. The neighborhood you choose is one of the most important decisions
            for your student life abroad — it affects your daily commute, social life, budget, and overall experience.
          </p>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Let's find the perfect fit for <strong className="font-semibold text-slate-700">you</strong>.
          </p>
        </SectionCard>
      )}

      {/* ── Map ── */}
      {activeSection === 'map' && (
        universityLocation && neighborhoods.length > 0 ? (
          <article className="col-span-full rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-6 pb-4">
              <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <span className="text-slate-500"><Map size={18} /></span>
                {city} Neighborhoods Overview
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                See all student neighborhoods mapped and their distance from {universityLocation.name}.
              </p>
            </div>
            <NeighborhoodMap
              neighborhoods={neighborhoods}
              universityLocation={universityLocation}
            />
          </article>
        ) : (
          <article className="col-span-full rounded-xl border border-amber-200/70 bg-amber-50/60 p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <span className="text-slate-500"><Map size={18} /></span>
              {!city ? 'City not selected' : 'Setting up map…'}
            </h2>
            <div className="mt-4 space-y-2 text-sm text-slate-700 bg-white p-4 rounded border border-slate-200">
              <p><strong>Debug Info:</strong></p>
              <p>• City: <code className="bg-slate-100 px-2 py-1 rounded">{city || 'Not set'}</code></p>
              <p>• University: <code className="bg-slate-100 px-2 py-1 rounded">{universityName || 'Not set'}</code></p>
              <p>• Neighborhoods Found: <code className="bg-slate-100 px-2 py-1 rounded">{neighborhoods.length}</code></p>
              <p>• University Location: <code className="bg-slate-100 px-2 py-1 rounded">{universityLocation ? 'Found' : 'Not found'}</code></p>
            </div>
            <p className="mt-4 text-xs text-slate-600">
              Check the browser console (F12) for detailed logs. Make sure you've selected both a city and university in your profile.
            </p>
          </article>
        )
      )}

      {/* ── Neighborhoods ── */}
      {activeSection === 'neighborhoods' && (
        universityLocation && neighborhoods.length > 0 ? (
          <SectionCard title="All Neighborhoods" icon={<LayoutGrid size={18} />}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {neighborhoods.map((neighborhood) => (
                <div
                  key={neighborhood.id}
                  className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 transition-colors hover:border-blue-300 hover:bg-blue-50"
                >
                  <MapPin size={16} className="mt-0.5 flex-shrink-0 text-slate-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{neighborhood.name}</p>
                    <p className="text-xs text-slate-500">{neighborhood.distanceToUniversity}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {neighborhood.avgRent}
                      </span>
                      <span className="text-xs text-slate-500">
                        Walkability {neighborhood.walkabilityScore}/10
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        ) : (
          <SectionCard title="All Neighborhoods" icon={<LayoutGrid size={18} />}>
            <p className="text-sm text-slate-500">No neighborhood data available for {city}.</p>
          </SectionCard>
        )
      )}

      {/* ── Quiz ── */}
      {activeSection === 'quiz' && (
        <SectionCard title="Find your match" icon={<Target size={18} />}>
          {/* Progress */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">Question {currentQuestion + 1} of 5</p>
              <p className="text-xs font-medium text-slate-500">{Math.round(((currentQuestion + 1) / 5) * 100)}%</p>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-slate-900 transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Question 1: Budget */}
          {currentQuestion === 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-800">What's your monthly budget for rent?</p>
              {[
                { value: '0-500' as const, label: 'Under €500' },
                { value: '500-800' as const, label: '€500 – €800' },
                { value: '800-1100' as const, label: '€800 – €1,100' },
                { value: '1100+' as const, label: '€1,100+' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                    budgetRange === option.value
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="budget"
                    value={option.value}
                    checked={budgetRange === option.value}
                    onChange={(e) => setBudgetRange(e.target.value as typeof budgetRange)}
                    className="h-4 w-4 accent-slate-900"
                  />
                  <span className="text-sm font-medium text-slate-800">{option.label}</span>
                </label>
              ))}
            </div>
          )}

          {/* Question 2: Walkability */}
          {currentQuestion === 1 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-800">What matters more to you?</p>
              {[
                { value: true,  label: 'Walkability',   sub: 'Everything nearby, no transit needed' },
                { value: false, label: 'Affordability', sub: "I don't mind taking the metro or bus" },
              ].map((option) => (
                <label
                  key={String(option.value)}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors ${
                    preferWalkability === option.value
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={String(option.value)}
                    checked={preferWalkability === option.value}
                    onChange={(e) => setPreferWalkability(e.target.value === 'true')}
                    className="mt-0.5 h-4 w-4 accent-slate-900"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{option.label}</p>
                    <p className="text-xs text-slate-500">{option.sub}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Question 3: Nightlife */}
          {currentQuestion === 2 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-800">What kind of nightlife do you prefer?</p>
              {[
                { value: 'vibrant' as const, label: 'Vibrant', sub: 'Bars, clubs, a social scene nearby' },
                { value: 'quiet' as const,   label: 'Quiet',   sub: 'Peaceful, residential atmosphere' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors ${
                    nightlifePref === option.value
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="nightlife"
                    value={option.value}
                    checked={nightlifePref === option.value}
                    onChange={(e) => setNightlifePref(e.target.value as typeof nightlifePref)}
                    className="mt-0.5 h-4 w-4 accent-slate-900"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{option.label}</p>
                    <p className="text-xs text-slate-500">{option.sub}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Question 4: Community */}
          {currentQuestion === 3 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-800">What community vibe do you prefer?</p>
              {[
                { value: 'mixed' as const,         label: 'Mixed',          sub: 'Students and locals living side by side' },
                { value: 'student-heavy' as const, label: 'Student-heavy',  sub: 'Lots of international students nearby' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors ${
                    communityPref === option.value
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="community"
                    value={option.value}
                    checked={communityPref === option.value}
                    onChange={(e) => setCommunityPref(e.target.value as typeof communityPref)}
                    className="mt-0.5 h-4 w-4 accent-slate-900"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{option.label}</p>
                    <p className="text-xs text-slate-500">{option.sub}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Question 5: Vibe */}
          {currentQuestion === 4 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-800">What's your ideal neighborhood character?</p>
              {[
                { value: 'emerging' as const,   label: 'Emerging',    sub: 'Trendy, up-and-coming, hip' },
                { value: 'established' as const, label: 'Established', sub: 'Historic, classic, well-known' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors ${
                    vibe === option.value
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="vibe"
                    value={option.value}
                    checked={vibe === option.value}
                    onChange={(e) => setVibe(e.target.value as typeof vibe)}
                    className="mt-0.5 h-4 w-4 accent-slate-900"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{option.label}</p>
                    <p className="text-xs text-slate-500">{option.sub}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-6 flex gap-3">
            {currentQuestion > 0 && (
              <button
                onClick={() => setCurrentQuestion(currentQuestion - 1)}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Back
              </button>
            )}
            {currentQuestion < 4 ? (
              <button
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleQuizComplete}
                className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
              >
                See recommendations
              </button>
            )}
          </div>
        </SectionCard>
      )}

      {/* ── Results ── */}
      {activeSection === 'results' && (
        <SectionCard title="Your recommended neighborhoods" icon={<Star size={18} />}>
          {!hasAnswered ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center">
              <p className="text-sm text-slate-500">Complete the quiz to get personalized recommendations.</p>
              <button
                onClick={() => setActiveSection('quiz')}
                className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
              >
                Take the quiz
              </button>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-slate-500">
                Based on your preferences: €{budgetMap[budgetRange]} budget,{' '}
                {preferWalkability ? 'walkability-focused' : 'affordability-focused'},{' '}
                {nightlifePref === 'vibrant' ? 'vibrant nightlife' : 'quiet atmosphere'},{' '}
                {communityPref === 'mixed' ? 'mixed community' : 'student-heavy'},{' '}
                {vibe === 'emerging' ? 'emerging & trendy' : 'established & classic'} vibe.
              </p>
              {recommendations.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
                  <p className="text-sm text-slate-500">
                    No neighborhoods match your budget. Consider adjusting your preferences.
                  </p>
                  <button
                    onClick={() => { setActiveSection('quiz'); setHasAnswered(false); setCurrentQuestion(0) }}
                    className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Retake quiz
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendations.map((neighborhood, index) => (
                    <ExpandableNeighborhood
                      key={neighborhood.id}
                      neighborhood={neighborhood}
                      index={index}
                      budgetRange={budgetRange}
                    />
                  ))}
                  <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <p className="text-xs text-slate-600">
                      <strong className="font-semibold text-slate-700">Next step:</strong>{' '}
                      Visit these neighborhoods on Google Maps Street View to get a real feel for the area.
                      Check local housing portals like Immobiliare.it or Idealista for listings.
                    </p>
                  </div>
                  <button
                    onClick={() => { setActiveSection('quiz'); setHasAnswered(false); setCurrentQuestion(0) }}
                    className="mt-1 text-xs text-slate-400 hover:text-slate-600 hover:underline"
                  >
                    Retake quiz
                  </button>
                </div>
              )}
            </>
          )}
        </SectionCard>
      )}
    </>
  )
}
