import { useState, useEffect, useCallback, useRef } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import FeedbackWidget from '../components/FeedbackWidget'
import StepPageLayout from '../components/StepPageLayout'
import StepIntroModal from '../components/StepIntroModal'
import { useStepIntro } from '../hooks/useStepIntro'
import { getStepRequirements } from '../onboarding/stepRequirements'
import { getUniversityConfig, type UniversityConfig, type ApplicationRound, type DocTips } from '../lib/universityConfig'
import { fetchMe, saveProfile } from '../lib/api'
import { usePageSections } from '../lib/PageSectionsContext'
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  ChevronDown,
  AlertTriangle,
  Info,
  CalendarClock,
  FileText,
  FlaskConical,
  Languages,
  ListChecks,
  Lightbulb,
  Link as LinkIcon,
  GraduationCap,
  Award,
  TrendingUp,
  PartyPopper,
} from 'lucide-react'

const CHECKLIST_STORAGE_KEY = 'dashboard-checklist:university-application'

const PAGE_SECTIONS = [
  { id: 'overview',   label: 'Overview',              icon: GraduationCap },
  { id: 'tests',      label: 'Entrance tests',         icon: FlaskConical },
  { id: 'language',   label: 'Language',               icon: Languages },
  { id: 'deadlines',  label: 'Deadlines',              icon: CalendarClock },
  { id: 'documents',  label: 'Documents',              icon: FileText },
  { id: 'selection',  label: 'Selection',              icon: ListChecks },
  { id: 'tips',       label: 'Insider tips',           icon: Lightbulb },
  { id: 'links',      label: 'Key links',              icon: LinkIcon },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function TabNavigation({
  activeId,
  onSelect,
}: {
  activeId: string
  onSelect: (id: string) => void
}) {
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

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
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

function DocChecklistItem({
  docKey,
  label,
  required,
  notes,
  tips,
  checked,
  fromProfile,
  onChange,
}: {
  docKey: string
  label: string
  required: boolean
  notes?: string
  tips?: DocTips
  checked: boolean
  fromProfile?: boolean
  onChange: (key: string, value: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className={`rounded-lg border transition-colors ${
        checked
          ? 'border-emerald-200 bg-emerald-50/50'
          : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Checkbox */}
        <button
          onClick={() => onChange(docKey, !checked)}
          className="mt-0.5 flex-shrink-0 focus:outline-none"
          aria-label={checked ? 'Mark as incomplete' : 'Mark as done'}
        >
          {checked ? (
            <CheckCircle2 size={18} className="text-emerald-500" />
          ) : required ? (
            <Circle size={18} className="text-slate-300 hover:text-slate-500 transition-colors" />
          ) : (
            <Circle size={18} className="text-slate-200 hover:text-slate-400 transition-colors" />
          )}
        </button>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-medium ${
            checked ? 'text-slate-400 line-through' : 'text-slate-800'
          }`}>
            {label}
          </p>
          {notes && (
            <p className="mt-0.5 text-xs text-slate-400">{notes}</p>
          )}
          {fromProfile && checked && (
            <p className="mt-0.5 text-xs text-blue-500">Pre-filled from your profile</p>
          )}
        </div>

        {/* Badges + expand */}
        <div className="flex flex-shrink-0 items-center gap-2">
          {required ? (
            <Badge label="Required" variant="required" />
          ) : (
            <Badge label="Optional" variant="optional" />
          )}
          {tips && (
            <button
              onClick={() => setOpen((o) => !o)}
              className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 transition-colors"
              aria-expanded={open}
            >
              <Lightbulb size={12} />
              Tips
              <ChevronDown size={11} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Expandable tips */}
      {tips && open && (
        <div className="border-t border-blue-100 bg-blue-50/40 px-4 pb-4 pt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
            {tips.heading}
          </p>
          <ul className="space-y-1.5">
            {tips.points.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}


function Badge({
  label,
  variant,
}: {
  label: string
  variant: 'required' | 'optional' | 'alternative' | 'tip' | 'warning'
}) {
  const styles: Record<string, string> = {
    required: 'bg-red-50 text-red-700 border-red-200',
    optional: 'bg-slate-100 text-slate-600 border-slate-200',
    alternative: 'bg-blue-50 text-blue-700 border-blue-200',
    tip: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[variant]}`}
    >
      {label}
    </span>
  )
}

function ExpandableCard({
  title,
  badge,
  children,
}: {
  title: string
  badge?: React.ReactNode
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60">
      <button
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-800">{title}</span>
          {badge}
        </div>
        <ChevronDown
          size={16}
          className={`flex-shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="border-t border-slate-200 px-4 pb-4 pt-3 text-sm text-slate-600">
          {children}
        </div>
      )}
    </div>
  )
}

function DeadlineRow({ round, isNext, isTarget }: { round: ApplicationRound; isNext: boolean; isTarget?: boolean }) {
  const deadline = new Date(round.deadline)
  const results = new Date(round.resultsBy)
  const now = new Date()
  const isPast = deadline < now
  const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  const fmt = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div
      className={`flex flex-col gap-1 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between ${
        isTarget && !isPast
          ? 'border-emerald-300 bg-emerald-50 ring-2 ring-emerald-200'
          : isNext
          ? 'border-blue-200 bg-blue-50'
          : isPast
          ? 'border-slate-200 bg-slate-50 opacity-60'
          : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-center gap-3">
        {isPast ? (
          <CheckCircle2 size={18} className="flex-shrink-0 text-slate-400" />
        ) : isTarget ? (
          <CheckCircle2 size={18} className="flex-shrink-0 text-emerald-500" />
        ) : isNext ? (
          <Circle size={18} className="flex-shrink-0 text-blue-500" />
        ) : (
          <Circle size={18} className="flex-shrink-0 text-slate-300" />
        )}
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-800">{round.round}</p>
            {isTarget && !isPast && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Your target</span>
            )}
            {isTarget && isPast && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">Missed — apply next year</span>
            )}
          </div>
          {round.notes && <p className="text-xs text-slate-500">{round.notes}</p>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4 pl-7 sm:pl-0">
        <div className="text-right">
          <p className="text-xs text-slate-400">Deadline</p>
          <p className={`text-sm font-medium ${isPast ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
            {fmt(deadline)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Results by</p>
          <p className="text-sm font-medium text-slate-800">{fmt(results)}</p>
        </div>
        {!isPast && isTarget && (
          <span className="ml-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            {daysLeft > 0 ? `${daysLeft}d left` : 'Today!'}
          </span>
        )}
        {!isPast && !isTarget && isNext && (
          <span className="ml-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            {daysLeft > 0 ? `${daysLeft}d left` : 'Today!'}
          </span>
        )}
        {isPast && (
          <span className="ml-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-400">
            Passed
          </span>
        )}
      </div>
    </div>
  )
}

type GmatTier = { label: string; barColor: string; badgeClass: string; note: string }

function getGmatTier(score: number, raw: string): GmatTier {
  if (isNaN(score)) return { label: raw, barColor: 'bg-slate-300', badgeClass: 'border-slate-200 bg-slate-50 text-slate-700', note: '' }
  if (score >= 750) return { label: 'Excellent', barColor: 'bg-emerald-500', badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700', note: 'Puts you in the top applicant tier — very strong advantage.' }
  if (score >= 700) return { label: 'Strong',    barColor: 'bg-blue-500',    badgeClass: 'border-blue-200 bg-blue-50 text-blue-700',       note: 'Well above the recommended minimum — a clear positive signal.' }
  if (score >= 650) return { label: 'Good',      barColor: 'bg-violet-400',  badgeClass: 'border-violet-200 bg-violet-50 text-violet-700',  note: 'Meets the recommended minimum. Consider retaking if GPA is average.' }
  if (score >= 600) return { label: 'Borderline',barColor: 'bg-amber-400',   badgeClass: 'border-amber-200 bg-amber-50 text-amber-700',    note: "Below Bocconi's recommended 650. A retake would strengthen your application." }
  return               { label: 'Below target', barColor: 'bg-red-400',     badgeClass: 'border-red-200 bg-red-50 text-red-700',          note: 'Significantly below the recommended minimum. A strong retake is advised.' }
}

function GmatScoreCard({ gmatScore }: { gmatScore: string }) {
  const score = parseInt(gmatScore, 10)
  const tier = getGmatTier(score, gmatScore)
  const pct = isNaN(score) ? 50 : Math.min(100, Math.round(((score - 400) / (800 - 400)) * 100))
  return (
    <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award size={16} className="text-slate-500" />
          <span className="text-sm font-semibold text-slate-700">Your GMAT score</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-slate-900">{gmatScore}</span>
          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tier.badgeClass}`}>{tier.label}</span>
        </div>
      </div>
      <div className="mt-3">
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="absolute top-0 h-full w-px bg-slate-400" style={{ left: `${Math.round(((650 - 400) / 400) * 100)}%` }} />
          <div className={`h-full rounded-full transition-all duration-700 ${tier.barColor}`} style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-1 flex justify-between text-xs text-slate-400">
          <span>400</span>
          <span className="text-slate-500">Min 650</span>
          <span>800</span>
        </div>
      </div>
      {tier.note && (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-600">
          <TrendingUp size={13} className="mt-0.5 flex-shrink-0 text-slate-400" />
          {tier.note}
        </p>
      )}
      <p className="mt-1.5 text-xs text-slate-400">
        Update your score in{' '}
        <a href="/dashboard/my-situation" className="text-blue-600 hover:underline">My Situation</a>.
      </p>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function UniversityApplicationPage() {
  const { showModal, handleConfirm, handleBack } = useStepIntro('university-application')
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({})
  const [programLevel, setProgramLevel] = useState<'bachelor' | 'master'>('master')
  const [activeSection, setActiveSection] = useState('overview')
  const [docChecklist, setDocChecklist] = useState<Record<string, boolean>>({})
  const [docSaving, setDocSaving] = useState<'idle' | 'saving' | 'saved'>('idle')
  const docSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [admissionStatus, setAdmissionStatus] = useState<string | null>(null)
  const [gmatScore, setGmatScore] = useState<string | null>(null)
  const [targetRound, setTargetRound] = useState<string | null>(null)
  const [bocconiTestStatus, setBocconiTestStatus] = useState<string | null>(null)
  const [specificProgram, setSpecificProgram] = useState<string | null>(null)
  const [prevDegreeLanguage, setPrevDegreeLanguage] = useState<string | null>(null)
  const [profilePrefilled, setProfilePrefilled] = useState<Set<string>>(new Set())
  const [englishExempt, setEnglishExempt] = useState(false)
  const { setSections, clearSections } = usePageSections()

  const handleTabSelect = useCallback((id: string) => {
    setActiveSection(id)
    window.location.hash = id
  }, [])

  // Keep active tab in sync with URL hash (so sidebar sub-links work)
  useEffect(() => {
    const readHash = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash && PAGE_SECTIONS.some((s) => s.id === hash)) {
        setActiveSection(hash)
      }
    }
    readHash()
    window.addEventListener('hashchange', readHash)
    return () => window.removeEventListener('hashchange', readHash)
  }, [])

  // Register sidebar TOC sections on mount, clear on unmount
  useEffect(() => {
    const sidebarSections = PAGE_SECTIONS.map(({ id, label }) => ({ id, label }))
    setSections(sidebarSections)
    return () => clearSections()
  }, [setSections, clearSections])

  // Hardcoded to Bocconi for now — swap to dynamic lookup when multi-university support is added
  const config: UniversityConfig | null = getUniversityConfig('bocconi')

  // Derive program level, load profile fields, and pre-fill doc checklist
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMe()
        const degree = data?.profile?.degreeType?.toLowerCase()
        const lvl: 'bachelor' | 'master' = degree === 'bachelor' ? 'bachelor' : 'master'
        setProgramLevel(lvl)

        // Load profile personalisation fields
        setAdmissionStatus((data?.profile?.admissionStatus as string) ?? null)
        setGmatScore((data?.profile?.gmatScore as string) ?? null)
        setTargetRound((data?.profile?.targetApplicationRound as string) ?? null)
        setBocconiTestStatus((data?.profile?.bocconiTestStatus as string) ?? null)
        setSpecificProgram((data?.profile?.specificProgramName as string) ?? null)
        const prevLang = (data?.profile?.previousDegreeLanguage as string) ?? null
        setPrevDegreeLanguage(prevLang)

        // Load saved doc checklist from DB
        const saved = (data?.profile?.documentChecklist ?? {}) as Record<string, boolean>

        // Auto-prefill from profile (only for keys the user hasn't explicitly set yet)
        const cvKey = lvl === 'bachelor' ? `${lvl}:CV / Resumé` : `${lvl}:CV in EU/Europass format`
        const engKey = `${lvl}:Proof of English language proficiency`
        const refsKey = `${lvl}:Two academic or professional reference letters`
        const prefill: Record<string, boolean> = {}
        const prefilledKeys = new Set<string>()
        if ((data?.profile?.hasCv as string) === 'yes' && !(cvKey in saved)) { prefill[cvKey] = true; prefilledKeys.add(cvKey) }
        if ((data?.profile?.hasEnglishTest as string) === 'yes' && !(engKey in saved)) { prefill[engKey] = true; prefilledKeys.add(engKey) }
        if ((data?.profile?.hasRecommendationLetters as string) === 'yes' && !(refsKey in saved)) { prefill[refsKey] = true; prefilledKeys.add(refsKey) }
        // Auto-exempt English proof if previous degree was in English
        if (prevLang === 'english' && !(engKey in saved)) {
          prefill[engKey] = true
          prefilledKeys.add(engKey)
          setEnglishExempt(true)
        }

        setProfilePrefilled(prefilledKeys)
        // Saved values take precedence over prefill
        setDocChecklist({ ...prefill, ...saved })
      } catch {
        // keep defaults
      }
    }
    load()
  }, [])

  const handleDocCheck = useCallback((key: string, value: boolean) => {
    const next = { ...docChecklist, [key]: value }
    setDocChecklist(next)
    setDocSaving('saving')
    // Debounce DB save by 1.5s
    if (docSaveTimerRef.current) clearTimeout(docSaveTimerRef.current)
    docSaveTimerRef.current = setTimeout(async () => {
      try {
        await saveProfile({ documentChecklist: next } as any)
        setDocSaving('saved')
        setTimeout(() => setDocSaving('idle'), 2000)
      } catch {
        setDocSaving('idle')
      }
    }, 1500)
  }, [docChecklist])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(CHECKLIST_STORAGE_KEY)
      if (saved) {
        try { setChecklistState(JSON.parse(saved)) } catch { setChecklistState({}) }
      }
    }
  }, [])

  const requirements = getStepRequirements('university-application') || []
  const checklistItems = requirements.map((req) => ({
    ...req,
    completed: checklistState[req.id] || false,
  }))

  const handleChecklistToggle = (id: string, completed: boolean) => {
    const newState = { ...checklistState, [id]: completed }
    setChecklistState(newState)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(newState))
    }
  }

  if (!config) {
    return (
      <DashboardLayout>
        <div className="col-span-full rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          No university configuration found.
        </div>
      </DashboardLayout>
    )
  }

  const rounds = config.applicationRounds[programLevel]
  const now = new Date()
  const nextRoundIndex = rounds.findIndex((r) => new Date(r.deadline) >= now)

  return (
    <>
      {showModal && (
        <StepIntroModal
          stepTitle="University Application"
          stepDescription="Research programs, prepare documents, and submit your university applications."
          onConfirm={handleConfirm}
          onBack={handleBack}
        />
      )}
      <FeedbackWidget />
      <DashboardLayout>
        <StepPageLayout
          stepNumber={1}
          totalSteps={8}
          stepLabel="STEP 1"
          title="University Application"
          subtitle={
            <span>
              Everything you need to apply to{' '}
              <span className="font-semibold text-slate-800">{config.name}</span> — requirements,
              deadlines, tests, and documents.
            </span>
          }
          userInfoTitle="This page's content is based on your data"
          userInfoSubtitle={
            <>
              Showing requirements for your degree type:{' '}
              <strong className="font-semibold text-slate-700">
                {programLevel === 'bachelor' ? 'Bachelor of Science' : 'Master of Science'}
              </strong>
              {'. '}Update in{' '}
              <a href="/dashboard/my-situation" className="text-blue-600 hover:underline">My Situation</a>.
            </>
          }
          userInfoFields={[
            { key: 'destinationCountry', label: 'Country' },
            { key: 'destinationCity', label: 'City' },
            { key: 'destinationUniversity', label: 'University' },
            { key: 'fieldOfStudy', label: 'Program' },
            { key: 'degreeType', label: 'Degree Type' },
            { key: 'programStartMonth', label: 'Start Date' },
          ]}
          checklistItems={checklistItems}
          onChecklistItemToggle={handleChecklistToggle}
          showChecklist={false}
          useGradientBar={true}
        >

          {/* ── Tab navigation ── */}
          <TabNavigation activeId={activeSection} onSelect={handleTabSelect} />

          {/* ── Overview ── */}
          {activeSection === 'overview' && (
            <>
            {/* Admitted banner */}
            {admissionStatus && ['accepted', 'admitted', 'yes'].includes(admissionStatus.toLowerCase()) && (
              <div className="col-span-full flex items-start gap-4 rounded-xl border border-emerald-300 bg-emerald-50 p-5 shadow-sm">
                <PartyPopper size={28} className="flex-shrink-0 text-emerald-500 mt-0.5" />
                <div>
                  <p className="text-base font-semibold text-emerald-800">You've been admitted to {config.shortName}! 🎉</p>
                  <p className="mt-1 text-sm text-emerald-700">
                    Congratulations! You can now focus on enrollment steps — submitting your English proof, paying the deposit, and arranging housing.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a href="/dashboard/housing" className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors">
                      Find housing
                    </a>
                    <a href="/dashboard/codice-fiscale" className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors">
                      Get Codice Fiscale
                    </a>
                    <a href={config.applyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors">
                      Enrollment portal <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              </div>
            )}
            <SectionCard title={`About ${config.shortName}`} icon={<GraduationCap size={18} />}>
              <p className="text-sm text-slate-600 leading-relaxed">{config.overview}</p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Tuition (first year)</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {config.tuitionRange[programLevel] ?? 'See website'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">Reducible based on family income via scholarship</p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Location</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {config.city}, {config.country}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">Via Sarfatti 25, Milan — city-integrated campus</p>
                </div>
              </div>
              {/* Quick-start nav cards */}
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { id: 'deadlines', label: 'Check deadlines', icon: <CalendarClock size={16} />, color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' },
                  { id: 'tests', label: 'Entrance tests', icon: <FlaskConical size={16} />, color: 'bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100' },
                  { id: 'documents', label: 'Documents needed', icon: <FileText size={16} />, color: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' },
                  { id: 'links', label: 'Apply now', icon: <ExternalLink size={16} />, color: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' },
                ].map(({ id, label, icon, color }) => (
                  <button
                    key={id}
                    onClick={() => handleTabSelect(id)}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-colors ${color}`}
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>
            </SectionCard>
            </>
          )}

          {/* ── Entrance tests ── */}
          {activeSection === 'tests' && (
            <SectionCard title="Entrance tests" icon={<FlaskConical size={18} />}>
              {/* Specific program header */}
              {specificProgram && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
                  <GraduationCap size={15} className="flex-shrink-0 text-slate-400" />
                  <span className="text-sm text-slate-600">
                    Showing requirements for <strong className="text-slate-800">{specificProgram}</strong>
                  </span>
                  <a href="/dashboard/my-situation" className="ml-auto text-xs text-blue-500 hover:underline">Edit</a>
                </div>
              )}
              {/* Bocconi test status card */}
              {bocconiTestStatus && (
                <div className={`mb-4 flex items-start gap-3 rounded-lg border p-4 ${
                  bocconiTestStatus === 'done'
                    ? 'border-emerald-200 bg-emerald-50'
                    : bocconiTestStatus === 'scheduled'
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-amber-200 bg-amber-50'
                }`}>
                  {bocconiTestStatus === 'done' ? (
                    <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                  ) : bocconiTestStatus === 'scheduled' ? (
                    <Info size={18} className="mt-0.5 flex-shrink-0 text-blue-500" />
                  ) : (
                    <AlertTriangle size={18} className="mt-0.5 flex-shrink-0 text-amber-500" />
                  )}
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${
                      bocconiTestStatus === 'done' ? 'text-emerald-800'
                      : bocconiTestStatus === 'scheduled' ? 'text-blue-800'
                      : 'text-amber-800'
                    }`}>
                      {bocconiTestStatus === 'done' && 'Bocconi Online Test — completed ✓'}
                      {bocconiTestStatus === 'scheduled' && 'Bocconi Online Test — waiting for invite'}
                      {bocconiTestStatus === 'not_started' && 'Bocconi Online Test — not started yet'}
                    </p>
                    <p className={`mt-0.5 text-xs ${
                      bocconiTestStatus === 'done' ? 'text-emerald-700'
                      : bocconiTestStatus === 'scheduled' ? 'text-blue-700'
                      : 'text-amber-700'
                    }`}>
                      {bocconiTestStatus === 'done' && 'Great — this is one less thing to worry about. Keep your confirmation email safe.'}
                      {bocconiTestStatus === 'scheduled' && 'You\'ll receive the test link by email once Bocconi reviews your submitted application.'}
                      {bocconiTestStatus === 'not_started' && 'You cannot take the test until after submitting your application. Submit first, then wait for the test invite.'}
                    </p>
                  </div>
                  <a href="/dashboard/my-situation" className="text-xs text-slate-400 hover:text-slate-600 hover:underline flex-shrink-0">Update</a>
                </div>
              )}
              {/* GMAT score card — shown if user has entered a score */}
              {gmatScore && programLevel === 'master' && (
                <GmatScoreCard gmatScore={gmatScore} />
              )}
              <p className="mb-3 text-sm text-slate-500">
                {programLevel === 'bachelor'
                  ? 'All international bachelor applicants must complete the Bocconi Online Test after submitting their application.'
                  : 'MSc applicants must complete the Bocconi Online Test. GMAT or GRE can be submitted as supplements or alternatives for some programs.'}
              </p>
              <div className="space-y-3">
                {config.testRequirements[programLevel].map((t) => (
                  <ExpandableCard
                    key={t.name}
                    title={t.name}
                    badge={
                      <Badge
                        label={
                          t.type === 'required'
                            ? 'Required'
                            : t.type === 'alternative'
                            ? 'Alternative / Supplement'
                            : 'Optional'
                        }
                        variant={t.type}
                      />
                    }
                  >
                    <p className="mb-2">{t.notes}</p>
                    {t.minScore && (
                      <p className="mb-2">
                        <span className="font-semibold text-slate-700">Recommended minimum: </span>
                        {t.minScore}
                      </p>
                    )}
                    {t.link && (
                      <a
                        href={t.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        More information <ExternalLink size={12} />
                      </a>
                    )}
                  </ExpandableCard>
                ))}
              </div>
              {programLevel === 'master' && (
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>
                    The Bocconi test is taken <strong>after</strong> you submit the application — not before. You
                    receive the test link by email once your application is reviewed.
                  </span>
                </div>
              )}
            </SectionCard>
          )}

          {/* ── Language requirements ── */}
          {activeSection === 'language' && (
            <SectionCard title="Language requirements" icon={<Languages size={18} />}>
              <div className="mb-3 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                <Info size={16} className="mt-0.5 flex-shrink-0" />
                <span>{config.languageRequirements.notes}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <th className="pb-2 pr-4">Test</th>
                      <th className="pb-2 pr-4">Minimum score</th>
                      <th className="pb-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {config.languageRequirements[programLevel].map((lr) => (
                      <tr key={lr.test} className="align-top">
                        <td className="py-2 pr-4 font-medium text-slate-800 whitespace-nowrap">{lr.test}</td>
                        <td className="py-2 pr-4 text-slate-700 font-mono text-xs whitespace-nowrap">{lr.minScore}</td>
                        <td className="py-2 text-slate-500">{lr.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}

          {/* ── Deadlines ── */}
          {activeSection === 'deadlines' && (() => {
            const targetRoundIndex = targetRound
              ? rounds.findIndex((r) => r.round === targetRound)
              : -1
            return (
            <SectionCard title="Application rounds & deadlines" icon={<CalendarClock size={18} />}>
              {targetRound && targetRoundIndex !== -1 ? (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5">
                  <CalendarClock size={15} className="flex-shrink-0 text-emerald-500" />
                  <span className="text-sm text-emerald-800">
                    Your target is <strong>{targetRound}</strong> — highlighted below.
                  </span>
                  <a href="/dashboard/my-situation" className="ml-auto text-xs text-emerald-600 hover:underline">Change</a>
                </div>
              ) : (
                <p className="mb-4 text-sm text-slate-500">
                  Bocconi uses a competitive round-based system. Earlier rounds have more places available
                  and higher scholarship priority. You can only apply to one round at a time.
                  {' '}<a href="/dashboard/my-situation" className="text-blue-500 hover:underline">Set your target round →</a>
                </p>
              )}
              <div className="space-y-3">
                {rounds.map((round, i) => (
                  <DeadlineRow
                    key={round.round}
                    round={round}
                    isNext={i === nextRoundIndex}
                    isTarget={round.round === targetRound}
                  />
                ))}
              </div>
              {nextRoundIndex === -1 && (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  All rounds for this intake have passed. Check the Bocconi website for the next
                  academic year's deadlines.
                </div>
              )}
              <p className="mt-3 text-xs text-slate-400">
                * Dates shown are for AY 2025–26. Always verify on the official Bocconi website before applying.
              </p>
            </SectionCard>
            )
          })()}

          {/* ── Documents ── */}
          {activeSection === 'documents' && (() => {
            const docs = config.documents[programLevel]
            const totalRequired = docs.filter((d) => d.required).length
            const checkedRequired = docs.filter((d) => d.required && docChecklist[`${programLevel}:${d.label}`]).length
            const checkedAll = docs.filter((d) => docChecklist[`${programLevel}:${d.label}`]).length
            const progressPct = totalRequired > 0 ? Math.round((checkedRequired / totalRequired) * 100) : 0
            const requiredDocs = docs.filter((d) => d.required)
            const optionalDocs = docs.filter((d) => !d.required)
            return (
              <SectionCard title="Documents checklist" icon={<FileText size={18} />}>
                {/* English-degree exemption banner */}
                {englishExempt && prevDegreeLanguage === 'english' && (
                  <div className="mb-4 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <Info size={16} className="mt-0.5 flex-shrink-0 text-blue-500" />
                    <div>
                      <p className="text-sm font-semibold text-blue-800">Possibly exempt from English proof</p>
                      <p className="mt-0.5 text-xs text-blue-700">
                        Your previous degree was in English — Bocconi may waive the language requirement. "Proof of English" has been pre-checked.
                        Confirm this with the{' '}
                        <a href="https://www.unibocconi.it/en/contact-us" target="_blank" rel="noopener noreferrer" className="underline">International Office</a>.
                      </p>
                    </div>
                  </div>
                )}
                {/* Progress bar */}
                <div className="mb-5">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm text-slate-600">
                      <span className="font-semibold text-slate-800">{checkedRequired} of {totalRequired}</span> required documents ready
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-400">
                      {docSaving === 'saving' && (
                        <><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />Saving…</>
                      )}
                      {docSaving === 'saved' && (
                        <><CheckCircle2 size={12} className="text-emerald-500" />Saved</>
                      )}
                      {docSaving === 'idle' && checkedAll > 0 && (
                        <><CheckCircle2 size={12} className="text-slate-300" />{checkedAll} checked</>
                      )}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  {progressPct === 100 && (
                    <p className="mt-1.5 text-xs font-medium text-emerald-600">All required documents ready — you're good to apply! 🎉</p>
                  )}
                </div>

                {/* Required documents */}
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Required for application</p>
                <div className="mb-5 space-y-2">
                  {requiredDocs.map((doc) => (
                    <DocChecklistItem
                      key={doc.label}
                      docKey={`${programLevel}:${doc.label}`}
                      label={doc.label}
                      required={doc.required}
                      notes={doc.notes}
                      tips={doc.tips}
                      checked={!!docChecklist[`${programLevel}:${doc.label}`]}
                      fromProfile={profilePrefilled.has(`${programLevel}:${doc.label}`)}
                      onChange={handleDocCheck}
                    />
                  ))}
                </div>

                {/* Optional documents */}
                {optionalDocs.length > 0 && (
                  <>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Additional / at enrollment</p>
                    <div className="space-y-2">
                      {optionalDocs.map((doc) => (
                        <DocChecklistItem
                          key={doc.label}
                          docKey={`${programLevel}:${doc.label}`}
                          label={doc.label}
                          required={doc.required}
                          notes={doc.notes}
                          tips={doc.tips}
                          checked={!!docChecklist[`${programLevel}:${doc.label}`]}
                          fromProfile={profilePrefilled.has(`${programLevel}:${doc.label}`)}
                          onChange={handleDocCheck}
                        />
                      ))}
                    </div>
                  </>
                )}
              </SectionCard>
            )
          })()}

          {/* ── Selection criteria ── */}
          {activeSection === 'selection' && (
            <SectionCard title="How Bocconi selects applicants" icon={<ListChecks size={18} />}>
              <p className="mb-4 text-sm text-slate-500">
                Selection is competitive and holistic. Every element below is weighted in the final
                score. There are no formal interviews for standard programs.
              </p>
              <ol className="space-y-2">
                {config.selectionCriteria[programLevel].map((criterion, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                      {i + 1}
                    </span>
                    {criterion}
                  </li>
                ))}
              </ol>
            </SectionCard>
          )}

          {/* ── Tips ── */}
          {activeSection === 'tips' && (
            <SectionCard title="Insider tips" icon={<Lightbulb size={18} />}>
              <div className="space-y-2">
                {config.tips.map((tip, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-lg border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm text-slate-700"
                  >
                    <Lightbulb size={15} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                    {tip}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* ── Key links ── */}
          {activeSection === 'links' && (
            <SectionCard title="Key links" icon={<LinkIcon size={18} />}>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {config.keyLinks.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    {link.label}
                    <ExternalLink size={14} className="flex-shrink-0 text-slate-400" />
                  </a>
                ))}
              </div>
            </SectionCard>
          )}

        </StepPageLayout>
      </DashboardLayout>
    </>
  )
}
