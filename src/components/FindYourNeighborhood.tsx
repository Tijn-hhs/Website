import { useState } from 'react'
import {
  getNeighborhoodsForCity,
  getUniversityLocation,
  recommendNeighborhoods,
  type Neighborhood,
  type KeyPlace,
} from '../lib/neighborhoodConfig'
import NeighborhoodMap from './NeighborhoodMap'
import type { UserProfile } from '../types/user'
import {
  MapPin,
  Map,
  LayoutGrid,
  Target,
  Star,
  ChevronDown,
  ChevronUp,
  Train,
  Coffee,
  ShoppingBag,
  Trees,
  Landmark,
  UtensilsCrossed,
  Dumbbell,
  BookOpen,
  Wine,
  CheckCircle,
  XCircle,
} from 'lucide-react'

interface FindYourNeighborhoodProps {
  profile: UserProfile | null
}

const PAGE_SECTIONS = [
  { id: 'overview',       label: 'Overview',       icon: MapPin },
  { id: 'map',            label: 'Map',             icon: Map },
  { id: 'neighborhoods',  label: 'Explore',         icon: LayoutGrid },
  { id: 'quiz',           label: 'Find your match', icon: Target },
  { id: 'results',        label: 'Results',         icon: Star },
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

function placeIcon(type: KeyPlace['type']) {
  const cls = 'flex-shrink-0'
  switch (type) {
    case 'cafe':       return <Coffee size={13} className={cls} />
    case 'bar':        return <Wine size={13} className={cls} />
    case 'restaurant': return <UtensilsCrossed size={13} className={cls} />
    case 'market':     return <ShoppingBag size={13} className={cls} />
    case 'park':       return <Trees size={13} className={cls} />
    case 'landmark':   return <Landmark size={13} className={cls} />
    case 'shop':       return <ShoppingBag size={13} className={cls} />
    case 'gym':        return <Dumbbell size={13} className={cls} />
    case 'library':    return <BookOpen size={13} className={cls} />
    default:           return <MapPin size={13} className={cls} />
  }
}

const gradients: Record<string, string> = {
  navigli:          'from-blue-600 to-blue-400',
  'porta-romana':   'from-amber-600 to-amber-400',
  ticinese:         'from-rose-600 to-pink-400',
  brera:            'from-violet-600 to-purple-400',
  'porta-venezia':  'from-emerald-600 to-teal-400',
  'sant-ambrogio':  'from-stone-600 to-stone-400',
  isola:            'from-sky-600 to-cyan-400',
  'citta-studi':    'from-indigo-600 to-blue-400',
}

function NeighborhoodCard({
  neighborhood,
  index,
  budgetRange,
  universityName,
  defaultOpen,
}: {
  neighborhood: Neighborhood
  index?: number
  budgetRange?: '0-500' | '500-800' | '800-1100' | '1100+'
  universityName?: string
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen ?? index === 0)
  const [imgError, setImgError] = useState(false)

  const isLow = !budgetRange || budgetRange === '0-500' || budgetRange === '500-800'
  const pros = isLow ? neighborhood.prosWithLowBudget : neighborhood.prosWithHighBudget
  const cons = isLow ? neighborhood.consWithLowBudget : neighborhood.consWithHighBudget

  let primaryDistance = neighborhood.distanceToBocconi
  let primaryLabel = 'Bocconi'
  if (universityName) {
    const n = universityName.toLowerCase()
    if (n.includes('polit')) {
      primaryDistance = neighborhood.distanceToPolitecnico
      primaryLabel = 'Politecnico'
    } else if (n.includes('statale') || n.includes('università degli')) {
      primaryDistance = neighborhood.distanceToUniStatale
      primaryLabel = 'Statale'
    }
  }

  const grad = gradients[neighborhood.id] || 'from-slate-600 to-slate-400'

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="relative h-48 overflow-hidden">
        {!imgError ? (
          <img
            src={neighborhood.photoUrl}
            alt={neighborhood.name}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${grad}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-end justify-between gap-2">
            <div>
              {index !== undefined && (
                <span className="mb-0.5 block text-xs font-bold text-white/60">#{index + 1} recommended</span>
              )}
              <h3 className="text-xl font-bold text-white leading-tight">{neighborhood.name}</h3>
              <p className="text-xs text-white/80 mt-0.5 line-clamp-2">{neighborhood.shortDescription}</p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-800">
                {neighborhood.avgRent}
              </span>
              <span className="rounded-full bg-slate-900/80 px-2.5 py-0.5 text-xs font-medium text-white">
                \u{2713} Walk {neighborhood.walkabilityScore}/10
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/60">
        <div className="px-3 py-2.5 text-center">
          <p className="text-xs text-slate-400">To {primaryLabel}</p>
          <p className="text-xs font-semibold text-slate-800 mt-0.5 leading-tight">{primaryDistance.split('·')[0].trim()}</p>
        </div>
        <div className="px-3 py-2.5 text-center">
          <p className="text-xs text-slate-400">To Duomo</p>
          <p className="text-xs font-semibold text-slate-800 mt-0.5 leading-tight">{neighborhood.distanceToCity.split('·')[0].trim()}</p>
        </div>
        <div className="px-3 py-2.5 text-center">
          <p className="text-xs text-slate-400">Vibe</p>
          <p className="text-xs font-semibold text-slate-800 mt-0.5 leading-tight line-clamp-1">{neighborhood.vibe.split(',')[0]}</p>
        </div>
      </div>

      <button
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="text-xs font-medium text-slate-600">{open ? 'Hide full guide' : 'Read full neighbourhood guide'}</span>
        {open ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
      </button>

      {open && (
        <div className="divide-y divide-slate-100">
          <div className="p-5">
            {neighborhood.longDescription.split('\n\n').map((para, i) => (
              <p key={i} className={`text-sm text-slate-700 leading-relaxed ${i > 0 ? 'mt-3' : ''}`}>{para}</p>
            ))}
          </div>

          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3 flex items-center gap-1.5">
              <Train size={12} /> Getting around
            </p>
            <div className="space-y-2 mb-4">
              {neighborhood.transitOptions.map((t, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400" />
                  {t}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                <p className="text-xs text-slate-400">To {primaryLabel} (fastest)</p>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">{primaryDistance}</p>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                <p className="text-xs text-slate-400">To Duomo</p>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">{neighborhood.distanceToCity}</p>
              </div>
              {neighborhood.distanceToBocconi !== primaryDistance && (
                <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                  <p className="text-xs text-slate-400">To Bocconi</p>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">{neighborhood.distanceToBocconi}</p>
                </div>
              )}
              <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                <p className="text-xs text-slate-400">To Politecnico</p>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">{neighborhood.distanceToPolitecnico}</p>
              </div>
            </div>
          </div>

          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Key places & landmarks</p>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {neighborhood.keyPlaces.map((place, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-lg bg-slate-50 border border-slate-100 p-2.5">
                  <span className="mt-0.5 text-slate-400">{placeIcon(place.type)}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">{place.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-tight">{place.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-2.5">Why you'll love it</p>
              <ul className="space-y-2">
                {pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <CheckCircle size={12} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-2.5">Things to consider</p>
              <ul className="space-y-2">
                {cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <XCircle size={12} className="mt-0.5 flex-shrink-0 text-amber-500" />
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-5">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {neighborhood.bestFor.map((tag, i) => (
                <span key={i} className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {neighborhood.notFor.map((tag, i) => (
                <span key={i} className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                  Not ideal: {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function FindYourNeighborhood({ profile }: FindYourNeighborhoodProps) {
  const city = profile?.destinationCity
  const universityName = profile?.destinationUniversity

  const [budgetRange, setBudgetRange] = useState<'0-500' | '500-800' | '800-1100' | '1100+'>('500-800')
  const [preferWalkability, setPreferWalkability] = useState(true)
  const [nightlifePref, setNightlifePref] = useState<'quiet' | 'vibrant'>('vibrant')
  const [communityPref, setCommunityPref] = useState<'mixed' | 'student-heavy'>('mixed')
  const [vibe, setVibe] = useState<'emerging' | 'established'>('emerging')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [activeSection, setActiveSection] = useState('overview')

  const neighborhoods = getNeighborhoodsForCity(city)
  const universityLocation = getUniversityLocation(city, universityName)

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
        <p className="mt-2 text-sm text-slate-600">Please select a city in your profile to explore neighbourhoods.</p>
      </article>
    )
  }

  const handleQuizComplete = () => {
    setHasAnswered(true)
    setActiveSection('results')
  }

  return (
    <>
      <TabNavigation activeId={activeSection} onSelect={setActiveSection} />

      {activeSection === 'overview' && (
        <article className="col-span-full rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="relative h-56 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&w=1200&q=70"
              alt="Milan"
              className="h-full w-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/25 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h2 className="text-2xl font-bold text-white">{city} neighbourhood guide</h2>
              <p className="mt-1 text-sm text-white/80">
                {neighborhoods.length} neighbourhoods · honest reviews · real distances
              </p>
            </div>
          </div>

          <div className="p-6">
            <p className="text-sm text-slate-700 leading-relaxed">
              Where you live in {city} will shape your entire experience abroad — your commute, your social life,
              your daily rhythm, and your budget. This guide covers {neighborhoods.length} neighbourhoods in detail:
              not just the statistics, but what it actually <em>feels like</em> to wake up there, do your grocery
              shopping, and build a life for a semester or a year.
            </p>
            <p className="mt-2.5 text-sm text-slate-700 leading-relaxed">
              Browse all neighbourhoods in <strong>Explore</strong>, use the <strong>Map</strong> to visualise
              distances, or go straight to <strong>Find your match</strong> for a personalised recommendation.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {neighborhoods.slice(0, 4).map((n) => (
                <button
                  key={n.id}
                  onClick={() => setActiveSection('neighborhoods')}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-300 transition-all text-left"
                >
                  <div className="relative h-28 overflow-hidden">
                    <img
                      src={n.photoUrl}
                      alt={n.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                    <p className="absolute bottom-2 left-2.5 text-xs font-bold text-white drop-shadow">{n.name}</p>
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-semibold text-slate-800">{n.avgRent}</p>
                    <p className="text-xs text-slate-500 truncate">{n.distanceToBocconi.split('·')[0].trim()}</p>
                  </div>
                </button>
              ))}
            </div>

            {neighborhoods.length > 4 && (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {neighborhoods.slice(4).map((n) => (
                  <button
                    key={n.id}
                    onClick={() => setActiveSection('neighborhoods')}
                    className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-300 transition-all text-left"
                  >
                    <div className="relative h-28 overflow-hidden">
                      <img
                        src={n.photoUrl}
                        alt={n.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                      <p className="absolute bottom-2 left-2.5 text-xs font-bold text-white drop-shadow">{n.name}</p>
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-semibold text-slate-800">{n.avgRent}</p>
                      <p className="text-xs text-slate-500 truncate">{n.distanceToBocconi.split('·')[0].trim()}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setActiveSection('neighborhoods')}
              className="mt-4 w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Read full guides for all {neighborhoods.length} neighbourhoods →
            </button>
          </div>
        </article>
      )}

      {activeSection === 'map' && (
        universityLocation && neighborhoods.length > 0 ? (
          <article className="col-span-full rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-6 pb-4">
              <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <span className="text-slate-500"><Map size={18} /></span>
                {city} neighbourhoods map
              </h2>
              <p className="mt-1 text-sm text-slate-500">All neighbourhoods relative to {universityLocation.name}.</p>
            </div>
            <NeighborhoodMap neighborhoods={neighborhoods} universityLocation={universityLocation} />
            <div className="p-6 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Distance at a glance</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-2 pr-4 text-slate-500 font-medium">Neighbourhood</th>
                      <th className="pb-2 pr-4 text-slate-500 font-medium whitespace-nowrap">Avg rent</th>
                      <th className="pb-2 pr-4 text-slate-500 font-medium whitespace-nowrap">To Bocconi</th>
                      <th className="pb-2 text-slate-500 font-medium whitespace-nowrap">To Duomo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {neighborhoods.map((n) => (
                      <tr key={n.id}>
                        <td className="py-2 pr-4 font-semibold text-slate-800">{n.name}</td>
                        <td className="py-2 pr-4 text-slate-600">{n.avgRent}</td>
                        <td className="py-2 pr-4 text-slate-600">{n.distanceToBocconi.split('·')[0]?.trim()}</td>
                        <td className="py-2 text-slate-600">{n.distanceToCity.split('·')[0]?.trim()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </article>
        ) : (
          <article className="col-span-full rounded-xl border border-amber-200/70 bg-amber-50/60 p-6 shadow-sm">
            <p className="text-sm text-slate-600">
              Map unavailable — please ensure you have selected a city and university in your profile.
            </p>
          </article>
        )
      )}

      {activeSection === 'neighborhoods' && (
        <div className="col-span-full space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <LayoutGrid size={18} className="text-slate-500" />
              Explore all {neighborhoods.length} neighbourhoods
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Full guides — photos, transport times, key places, and honest pros and cons for each area.
            </p>
          </div>
          {neighborhoods.map((n) => (
            <NeighborhoodCard key={n.id} neighborhood={n} universityName={universityName} defaultOpen={false} />
          ))}
        </div>
      )}

      {activeSection === 'quiz' && (
        <SectionCard title="Find your match" icon={<Target size={18} />}>
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

          {currentQuestion === 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-800">What's your monthly budget for rent?</p>
              {[
                { value: '0-500' as const,   label: 'Under €500',      sub: 'Very budget-conscious — shared rooms' },
                { value: '500-800' as const,  label: '€500 – €800',     sub: 'Standard student budget for Milan' },
                { value: '800-1100' as const, label: '€800 – €1,100',   sub: 'Comfortable private room or small studio' },
                { value: '1100+' as const,    label: '€1,100+',         sub: 'Studio or 1-bed flat, best areas' },
              ].map((option) => (
                <label key={option.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors ${
                    budgetRange === option.value ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}>
                  <input type="radio" name="budget" value={option.value} checked={budgetRange === option.value}
                    onChange={(e) => setBudgetRange(e.target.value as typeof budgetRange)} className="mt-0.5 h-4 w-4 accent-slate-900" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{option.label}</p>
                    <p className="text-xs text-slate-500">{option.sub}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {currentQuestion === 1 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-800">How do you prefer to get to university?</p>
              {[
                { value: true,  label: 'Walk or bike',       sub: 'I want everything nearby — no transit needed' },
                { value: false, label: 'Metro / tram is fine', sub: "Happy with 20–30 min on public transport" },
              ].map((option) => (
                <label key={String(option.value)}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors ${
                    preferWalkability === option.value ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}>
                  <input type="radio" name="priority" value={String(option.value)} checked={preferWalkability === option.value}
                    onChange={(e) => setPreferWalkability(e.target.value === 'true')} className="mt-0.5 h-4 w-4 accent-slate-900" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{option.label}</p>
                    <p className="text-xs text-slate-500">{option.sub}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {currentQuestion === 2 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-800">What's a typical weeknight evening for you?</p>
              {[
                { value: 'vibrant' as const, label: 'Aperitivo or bar hopping',     sub: 'I want nightlife and a social scene right outside my door' },
                { value: 'quiet' as const,   label: 'Cook at home, walk in a park', sub: 'I prefer quiet streets and a calm neighbourhood atmosphere' },
              ].map((option) => (
                <label key={option.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors ${
                    nightlifePref === option.value ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}>
                  <input type="radio" name="nightlife" value={option.value} checked={nightlifePref === option.value}
                    onChange={(e) => setNightlifePref(e.target.value as typeof nightlifePref)} className="mt-0.5 h-4 w-4 accent-slate-900" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{option.label}</p>
                    <p className="text-xs text-slate-500">{option.sub}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {currentQuestion === 3 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-800">What community do you want around you?</p>
              {[
                { value: 'mixed' as const,         label: 'Mix of locals and internationals', sub: 'I want to integrate into real city life, not a student bubble' },
                { value: 'student-heavy' as const, label: 'Lots of international students',   sub: 'I want to meet others in my situation easily' },
              ].map((option) => (
                <label key={option.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors ${
                    communityPref === option.value ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}>
                  <input type="radio" name="community" value={option.value} checked={communityPref === option.value}
                    onChange={(e) => setCommunityPref(e.target.value as typeof communityPref)} className="mt-0.5 h-4 w-4 accent-slate-900" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{option.label}</p>
                    <p className="text-xs text-slate-500">{option.sub}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {currentQuestion === 4 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-800">What's your ideal neighbourhood character?</p>
              {[
                { value: 'emerging' as const,    label: 'Emerging, hip, design-forward', sub: 'Trendy new openings, feels like the future of the city' },
                { value: 'established' as const, label: 'Historic, classic, timeless',   sub: 'Cobblestone streets, centuries of culture, romantic urban beauty' },
              ].map((option) => (
                <label key={option.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors ${
                    vibe === option.value ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}>
                  <input type="radio" name="vibe" value={option.value} checked={vibe === option.value}
                    onChange={(e) => setVibe(e.target.value as typeof vibe)} className="mt-0.5 h-4 w-4 accent-slate-900" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{option.label}</p>
                    <p className="text-xs text-slate-500">{option.sub}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            {currentQuestion > 0 && (
              <button onClick={() => setCurrentQuestion(currentQuestion - 1)}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
                Back
              </button>
            )}
            {currentQuestion < 4 ? (
              <button onClick={() => setCurrentQuestion(currentQuestion + 1)}
                className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800">
                Next
              </button>
            ) : (
              <button onClick={handleQuizComplete}
                className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800">
                See my recommendations
              </button>
            )}
          </div>
        </SectionCard>
      )}

      {activeSection === 'results' && (
        <div className="col-span-full space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <Star size={18} className="text-slate-500" />
              Your recommended neighbourhoods
            </h2>
            {hasAnswered && (
              <p className="mt-1 text-sm text-slate-500">
                Filtered for: {budgetRange === '0-500' ? 'under €500' : budgetRange === '500-800' ? '€500–800' : budgetRange === '800-1100' ? '€800–1,100' : '€1,100+'} ·{' '}
                {preferWalkability ? 'walkability-first' : 'budget-first'} ·{' '}
                {nightlifePref === 'vibrant' ? 'vibrant evenings' : 'quiet neighbourhood'} ·{' '}
                {vibe === 'emerging' ? 'emerging' : 'historic'}
              </p>
            )}
          </div>

          {!hasAnswered ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <p className="text-sm text-slate-500">Answer five quick questions to get your personalised shortlist.</p>
              <button onClick={() => setActiveSection('quiz')}
                className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors">
                Take the quiz
              </button>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <p className="text-sm text-slate-500">No neighbourhoods match a budget of €{budgetMap[budgetRange]}. Try adjusting your budget or preferences.</p>
              <button onClick={() => { setActiveSection('quiz'); setHasAnswered(false); setCurrentQuestion(0) }}
                className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                Retake quiz
              </button>
            </div>
          ) : (
            <>
              {recommendations.map((n, i) => (
                <NeighborhoodCard key={n.id} neighborhood={n} index={i} budgetRange={budgetRange} universityName={universityName} defaultOpen={i === 0} />
              ))}
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-slate-700">
                  <strong className="font-semibold text-slate-800">Next step:</strong>{' '}
                  Browse listings on{' '}
                  <a href="https://www.immobiliare.it" target="_blank" rel="noopener noreferrer" className="font-medium text-blue-700 hover:underline">Immobiliare.it</a>,{' '}
                  <a href="https://www.idealista.it" target="_blank" rel="noopener noreferrer" className="font-medium text-blue-700 hover:underline">Idealista</a>, or{' '}
                  <a href="https://www.uniplaces.com" target="_blank" rel="noopener noreferrer" className="font-medium text-blue-700 hover:underline">Uniplaces</a>.
                  Walk the neighbourhood on Google Street View before committing.
                </p>
              </div>
              <button onClick={() => { setActiveSection('quiz'); setHasAnswered(false); setCurrentQuestion(0) }}
                className="w-full text-xs text-slate-400 hover:text-slate-600 hover:underline py-1">
                Retake quiz
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}
