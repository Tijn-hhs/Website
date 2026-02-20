import { useState, useEffect, useCallback, useMemo } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import FeedbackWidget from '../components/FeedbackWidget'
import StepPageLayout from '../components/StepPageLayout'
import StepIntroModal from '../components/StepIntroModal'
import { useStepIntro } from '../hooks/useStepIntro'
import { getStepRequirements } from '../onboarding/stepRequirements'
import { fetchMe, saveProfile } from '../lib/api'
import { usePageSections } from '../lib/PageSectionsContext'
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  ChevronDown,
  AlertTriangle,
  Info,
  FileText,
  MapPin,
  Lightbulb,
  Link as LinkIcon,
  HelpCircle,
  ClipboardList,
  Plane,
  Compass,
  Clock,
  X,
  ArrowRight,
  ChevronRight,
} from 'lucide-react'

const CHECKLIST_STORAGE_KEY = 'dashboard-checklist:before-departure'
const ONBOARDING_STORAGE_KEY = 'departure-onboarding-completed'

const PAGE_SECTIONS = [
  { id: 'overview',   label: 'Overview',           icon: Compass },
  { id: 'documents',  label: 'Documents',          icon: FileText },
  { id: 'travel',     label: 'Travel & Arrival',   icon: Plane },
  { id: 'faq',        label: 'FAQ',                icon: HelpCircle },
  { id: 'links',      label: 'Key links',          icon: LinkIcon },
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

function Badge({
  label,
  variant,
}: {
  label: string
  variant: 'required' | 'optional' | 'note' | 'warning' | 'eu' | 'noneu' | 'success'
}) {
  const styles: Record<string, string> = {
    required: 'bg-red-50 text-red-700 border-red-200',
    optional: 'bg-slate-100 text-slate-600 border-slate-200',
    note:     'bg-blue-50 text-blue-700 border-blue-200',
    warning:  'bg-amber-50 text-amber-700 border-amber-200',
    eu:       'bg-indigo-50 text-indigo-700 border-indigo-200',
    noneu:    'bg-orange-50 text-orange-700 border-orange-200',
    success:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[variant]}`}>
      {label}
    </span>
  )
}

function ExpandableCard({
  title,
  badge,
  defaultOpen = false,
  children,
}: {
  title: string
  badge?: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60">
      <button
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className="flex items-center gap-2 flex-wrap">
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

function DocItem({
  label,
  required,
  note,
  checked,
  docKey,
  onChange,
}: {
  label: string
  required: boolean
  note?: string
  checked: boolean
  docKey: string
  onChange: (key: string, value: boolean) => void
}) {
  return (
    <div className={`rounded-lg border transition-colors ${checked ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-start gap-3 px-4 py-3">
        <button
          onClick={() => onChange(docKey, !checked)}
          className="mt-0.5 flex-shrink-0 focus:outline-none"
          aria-label={checked ? 'Mark as incomplete' : 'Mark as done'}
        >
          {checked
            ? <CheckCircle2 size={18} className="text-emerald-500" />
            : <Circle size={18} className="text-slate-300 hover:text-slate-500 transition-colors" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-medium ${checked ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{label}</p>
          {note && <p className="mt-0.5 text-xs text-slate-400">{note}</p>}
        </div>
        {required
          ? <Badge label="Required" variant="required" />
          : <Badge label="Optional" variant="optional" />}
      </div>
    </div>
  )
}

function StepItem({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
        {number}
      </span>
      <div>
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="mt-0.5 text-sm text-slate-500">{description}</p>
      </div>
    </li>
  )
}

// ─── Departure Onboarding Overlay ─────────────────────────────────────────────

interface DepartureAnswers {
  flightBooked: string
  departureDate: string
  hasTravelInsurance: string
  hasEhic: string
  hasHealthInsurance: string
}

function DepartureOnboarding({
  isEuCitizen,
  initialAnswers,
  onComplete,
  onExit,
}: {
  isEuCitizen: string | null
  initialAnswers: Partial<DepartureAnswers>
  onComplete: (answers: DepartureAnswers) => void
  onExit: () => void
}) {
  const isEU = isEuCitizen === 'yes'
  const isNonEU = isEuCitizen === 'no'

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<DepartureAnswers>({
    flightBooked: initialAnswers.flightBooked ?? '',
    departureDate: initialAnswers.departureDate ?? '',
    hasTravelInsurance: initialAnswers.hasTravelInsurance ?? '',
    hasEhic: initialAnswers.hasEhic ?? '',
    hasHealthInsurance: initialAnswers.hasHealthInsurance ?? '',
  })

  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [])

  const steps = useMemo(() => {
    const base = [
      { id: 'flight',    title: 'Have you booked your flight to Milan? ✈️',       desc: 'We\'ll use this to track your readiness and show a countdown timer.' },
      { id: 'date',      title: 'When are you planning to depart?',                desc: 'Enter your expected departure date. We\'ll flag anything you need to do before then.' },
      { id: 'insurance', title: 'Do you have travel insurance arranged?',          desc: 'Covers trip cancellation, delays, lost luggage, and medical emergencies.' },
    ]
    if (isEU || isEuCitizen === null) {
      base.push({ id: 'ehic', title: 'Do you have your European Health Insurance Card (EHIC)?', desc: 'Free from your national health service — covers emergency care at Italian public hospitals.' })
    }
    if (isNonEU || isEuCitizen === null) {
      base.push({ id: 'health', title: 'Do you have private health insurance?', desc: 'Non-EU students must show comprehensive health insurance proof as part of their visa application.' })
    }
    base.push({ id: 'summary', title: 'All set! 🎉', desc: 'Your answers have been saved. Your readiness score and checklist are now personalised.' })
    return base
  }, [isEU, isNonEU, isEuCitizen])

  const current = steps[step]
  const isLast = step === steps.length - 1
  const progress = Math.round((step / (steps.length - 1)) * 100)

  const canAdvance = () => {
    if (current.id === 'flight') return answers.flightBooked !== ''
    if (current.id === 'insurance') return answers.hasTravelInsurance !== ''
    if (current.id === 'ehic') return answers.hasEhic !== ''
    if (current.id === 'health') return answers.hasHealthInsurance !== ''
    return true
  }

  const RadioBtn = ({ value, label, field }: { value: string; label: string; field: keyof DepartureAnswers }) => (
    <button
      onClick={() => setAnswers((a) => ({ ...a, [field]: value }))}
      className={`flex items-center gap-3 rounded-xl border-2 px-5 py-4 text-left text-sm font-medium transition-all ${
        answers[field] === value
          ? 'border-slate-900 bg-slate-900 text-white'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
      }`}
    >
      <span className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
        answers[field] === value ? 'border-white' : 'border-slate-300'
      }`}>
        {answers[field] === value && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
      </span>
      {label}
    </button>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center">
      <div className="relative w-full max-w-lg rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Plane size={18} className="text-slate-700" />
            <span className="text-sm font-semibold text-slate-800">Before Departure Setup</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{step + 1} / {steps.length}</span>
          </div>
          <button onClick={onExit} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X size={16} />
          </button>
        </div>
        <div className="h-1 w-full bg-slate-100">
          <div className="h-full bg-slate-900 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="px-6 py-6">
          <h3 className="text-lg font-bold text-slate-900">{current.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{current.desc}</p>
          <div className="mt-5 space-y-2">
            {current.id === 'flight' && (
              <>
                <RadioBtn field="flightBooked" value="yes" label="Yes, flight is booked ✅" />
                <RadioBtn field="flightBooked" value="no"  label="Not yet — I'm still planning" />
              </>
            )}
            {current.id === 'date' && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Departure date</label>
                <input
                  type="date"
                  value={answers.departureDate}
                  onChange={(e) => setAnswers((a) => ({ ...a, departureDate: e.target.value }))}
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-slate-900 focus:outline-none transition-colors"
                />
                <p className="mt-2 text-xs text-slate-400">Skip this step if you don't know yet.</p>
              </div>
            )}
            {current.id === 'insurance' && (
              <>
                <RadioBtn field="hasTravelInsurance" value="yes" label="Yes, I have travel insurance ✅" />
                <RadioBtn field="hasTravelInsurance" value="no"  label="Not yet — I need to arrange it" />
              </>
            )}
            {current.id === 'ehic' && (
              <>
                <RadioBtn field="hasEhic" value="yes" label="Yes, I have my EHIC / GHIC card ✅" />
                <RadioBtn field="hasEhic" value="no"  label="Not yet — I need to apply for one" />
                <div className="mt-2 flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-700">
                  <Info size={13} className="mt-0.5 flex-shrink-0" />
                  UK students: apply for a GHIC (not EHIC) at nhsbsa.nhs.uk — it's free!
                </div>
              </>
            )}
            {current.id === 'health' && (
              <>
                <RadioBtn field="hasHealthInsurance" value="yes" label="Yes, I have private health insurance ✅" />
                <RadioBtn field="hasHealthInsurance" value="no"  label="Not yet — I need to arrange it" />
                <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50 p-3 text-xs text-amber-700">
                  <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" />
                  This is required for your student visa — minimum €30,000 coverage for the full study period.
                </div>
              </>
            )}
            {current.id === 'summary' && (
              <div className="space-y-2">
                {([
                  { label: 'Flight booked',    val: answers.flightBooked === 'yes' ? 'Yes ✅' : 'Not yet' },
                  { label: 'Departure date',   val: answers.departureDate || 'Not set' },
                  { label: 'Travel insurance', val: answers.hasTravelInsurance === 'yes' ? 'Arranged ✅' : 'Not yet' },
                  ...(isEU || isEuCitizen === null ? [{ label: 'EHIC card', val: answers.hasEhic === 'yes' ? 'Have it ✅' : 'Need to get' }] : []),
                  ...(isNonEU || isEuCitizen === null ? [{ label: 'Health insurance', val: answers.hasHealthInsurance === 'yes' ? 'Arranged ✅' : 'Not yet' }] : []),
                ] as { label: string; val: string }[]).map(({ label, val }) => (
                  <div key={label} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-2.5">
                    <span className="text-sm text-slate-600">{label}</span>
                    <span className="text-sm font-medium text-slate-800">{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <button
            onClick={step === 0 ? onExit : () => setStep((s) => s - 1)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {step === 0 ? 'Skip for now' : 'Back'}
          </button>
          <button
            onClick={() => isLast ? onComplete(answers) : setStep((s) => s + 1)}
            disabled={!canAdvance()}
            className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition-all ${
              canAdvance() ? 'bg-slate-900 text-white hover:bg-slate-700' : 'cursor-not-allowed bg-slate-100 text-slate-400'
            }`}
          >
            {isLast ? 'Save & continue' : 'Next'}
            {!isLast && <ArrowRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BeforeDeparturePage() {
  const { showModal, handleConfirm, handleBack } = useStepIntro('before-departure')

  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({})
  const [docChecklist, setDocChecklist] = useState<Record<string, boolean>>({})
  const [activeSection, setActiveSection] = useState('overview')
  const { setSections, clearSections } = usePageSections()

  // Profile state
  const [isEuCitizen, setIsEuCitizen] = useState<string | null>(null)
  const [hasVisa, setHasVisa] = useState<string | null>(null)
  const [hasTravelInsurance, setHasTravelInsurance] = useState<string | null>(null)
  const [hasHealthInsurance, setHasHealthInsurance] = useState<string | null>(null)
  const [hasEhic, setHasEhic] = useState<string | null>(null)
  const [flightBooked, setFlightBooked] = useState<string | null>(null)
  const [departureDate, setDepartureDate] = useState<string | null>(null)
  const [passportExpiry, setPassportExpiry] = useState<string | null>(null)
  const [nationality, setNationality] = useState<string | null>(null)

  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const isEU = isEuCitizen === 'yes'
  const isNonEU = isEuCitizen === 'no'

  const handleTabSelect = useCallback((id: string) => {
    setActiveSection(id)
    window.location.hash = id
  }, [])

  useEffect(() => {
    const readHash = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash && PAGE_SECTIONS.some((s) => s.id === hash)) setActiveSection(hash)
    }
    readHash()
    window.addEventListener('hashchange', readHash)
    return () => window.removeEventListener('hashchange', readHash)
  }, [])

  useEffect(() => {
    setSections(PAGE_SECTIONS.map(({ id, label }) => ({ id, label })))
    return () => clearSections()
  }, [setSections, clearSections])

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMe()
        const p = data?.profile ?? {}
        setIsEuCitizen((p.isEuCitizen as string) ?? null)
        setHasVisa((p.hasVisa as string) ?? null)
        setHasTravelInsurance((p.hasTravelInsurance as string) ?? null)
        setHasHealthInsurance((p.hasHealthInsurance as string) ?? null)
        setHasEhic((p.hasEhic as string) ?? null)
        setFlightBooked((p.flightBooked as string) ?? null)
        setDepartureDate((p.departureDate as string) ?? null)
        setPassportExpiry((p.passportExpiry as string) ?? null)
        setNationality((p.nationality as string) ?? null)

        const completed = window.localStorage.getItem(ONBOARDING_STORAGE_KEY)
        if (!completed) setShowOnboarding(true)
      } catch { /* keep defaults */ }
    }
    load()
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(CHECKLIST_STORAGE_KEY)
      if (saved) {
        try { setChecklistState(JSON.parse(saved)) } catch { setChecklistState({}) }
      }
    }
  }, [])

  const requirements = getStepRequirements('before-departure') || []
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

  const handleDocCheck = (key: string, value: boolean) => {
    setDocChecklist((prev) => ({ ...prev, [key]: value }))
  }

  const handleOnboardingComplete = async (answers: DepartureAnswers) => {
    setIsSaving(true)
    try {
      const updates: Record<string, string> = {}
      if (answers.flightBooked)      updates.flightBooked      = answers.flightBooked
      if (answers.departureDate)     updates.departureDate     = answers.departureDate
      if (answers.hasTravelInsurance) updates.hasTravelInsurance = answers.hasTravelInsurance
      if (answers.hasEhic)           updates.hasEhic           = answers.hasEhic
      if (answers.hasHealthInsurance) updates.hasHealthInsurance = answers.hasHealthInsurance
      await saveProfile(updates as any)
      if (answers.flightBooked)       setFlightBooked(answers.flightBooked)
      if (answers.departureDate)      setDepartureDate(answers.departureDate)
      if (answers.hasTravelInsurance) setHasTravelInsurance(answers.hasTravelInsurance)
      if (answers.hasEhic)            setHasEhic(answers.hasEhic)
      if (answers.hasHealthInsurance) setHasHealthInsurance(answers.hasHealthInsurance)
      window.localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
    } catch { /* fail silently */ }
    setIsSaving(false)
    setShowOnboarding(false)
  }

  // Countdown to departure
  const daysUntilDeparture = useMemo(() => {
    if (!departureDate) return null
    return Math.ceil((new Date(departureDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  }, [departureDate])

  // Readiness score
  const readinessItems = useMemo(() => [
    { label: 'Flight booked',     done: flightBooked === 'yes' },
    { label: 'Visa arranged',     done: isEU ? true : hasVisa === 'yes',       skip: isEU },
    { label: 'Travel insurance',  done: hasTravelInsurance === 'yes' },
    { label: 'EHIC card',         done: hasEhic === 'yes',                      skip: isNonEU },
    { label: 'Health insurance',  done: hasHealthInsurance === 'yes',           skip: isEU },
    { label: 'Passport checked',  done: !!passportExpiry },
  ].filter((i) => !i.skip), [flightBooked, hasVisa, hasTravelInsurance, hasEhic, hasHealthInsurance, passportExpiry, isEU, isNonEU])

  const readinessDone = readinessItems.filter((i) => i.done).length
  const readinessPct  = readinessItems.length > 0 ? Math.round((readinessDone / readinessItems.length) * 100) : 0

  // Doc checklists
  const carryOnDocs = [
    { key: 'passport',          label: 'Valid passport',                              required: true,    note: 'Never check this in — keep it in your carry-on at all times' },
    { key: 'visa',              label: 'Student visa (non-EU only)',                  required: isNonEU, note: 'D-type national visa for stays over 90 days' },
    { key: 'acceptance-letter', label: 'University acceptance / enrollment letter',   required: true,    note: 'Printed copy — needed at customs and for permesso di soggiorno' },
    { key: 'financial-proof',   label: 'Proof of financial means',                    required: true,    note: 'Bank statement (≥ €6,000) or scholarship letter' },
    { key: 'insurance-docs',    label: 'Health & travel insurance certificate',       required: true,    note: 'Print both certificate and emergency contact numbers' },
    { key: 'housing-confirm',   label: 'Accommodation confirmation / address',        required: true,    note: 'Needed at customs and for permesso di soggiorno application' },
  ]
  const packedDocs = [
    { key: 'birth-cert',    label: 'Birth certificate (Apostille + Italian translation)', required: false, note: 'Required for some registrations — get before leaving home' },
    { key: 'transcripts',   label: 'Academic transcripts / diploma (certified copies)',   required: false, note: 'May be needed for enrollment verification or credit transfer' },
    { key: 'photos',        label: '4× passport-size photos',                             required: true,  note: 'Needed for permesso, municipality registration, transport cards' },
    { key: 'id-copies',     label: 'National ID card / 5 colour copies of passport',      required: true,  note: 'Italian offices always ask for copies — keep them handy' },
    { key: 'vaccination',   label: 'Vaccination / health record',                         required: false, note: 'Useful for GP registration and municipality residency' },
    { key: 'tax-docs',      label: 'Home country tax ID / financial documents',           required: false, note: 'Some banks ask for these when opening an account' },
  ]

  const reqCarryOn = carryOnDocs.filter((d) => d.required).length
  const doneCarryOn = carryOnDocs.filter((d) => d.required && docChecklist[d.key]).length
  const carryOnPct  = reqCarryOn > 0 ? Math.round((doneCarryOn / reqCarryOn) * 100) : 0

  return (
    <>
      {showModal && (
        <StepIntroModal
          stepTitle="Before Departure"
          stepDescription="Get your visa, documents, and essentials ready before you fly to Milan."
          onConfirm={handleConfirm}
          onBack={handleBack}
        />
      )}

      {showOnboarding && !isSaving && (
        <DepartureOnboarding
          isEuCitizen={isEuCitizen}
          initialAnswers={{ flightBooked: flightBooked ?? '', departureDate: departureDate ?? '', hasTravelInsurance: hasTravelInsurance ?? '', hasEhic: hasEhic ?? '', hasHealthInsurance: hasHealthInsurance ?? '' }}
          onComplete={handleOnboardingComplete}
          onExit={() => {
            window.localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
            setShowOnboarding(false)
          }}
        />
      )}

      <FeedbackWidget />
      <DashboardLayout>
        <StepPageLayout
          stepNumber={4}
          totalSteps={13}
          stepLabel="STEP 4"
          title="Before Departure"
          subtitle="Documents, airport transport & everything to sort before you fly."
          useGradientBar={true}
          userInfoTitle="This page is personalised based on your profile"
          userInfoSubtitle={
            isEuCitizen ? (
              <>
                Showing requirements for{' '}
                <strong className="font-semibold text-slate-700">
                  {isEU ? 'EU citizens' : 'non-EU citizens'}
                </strong>{'. '}
                Update in <a href="/dashboard/my-situation" className="text-blue-600 hover:underline">My Situation</a>.
              </>
            ) : (
              <>
                Set your nationality in{' '}
                <a href="/dashboard/my-situation" className="text-blue-600 hover:underline">My Situation</a>{' '}
                to see personalised guidance.
              </>
            )
          }
          userInfoFields={[
            { key: 'nationality',      label: 'Nationality' },
            { key: 'isEuCitizen',      label: 'EU Citizen' },
            { key: 'programStartMonth', label: 'Program Start' },
            { key: 'passportExpiry',   label: 'Passport Expiry' },
          ]}
          checklistItems={checklistItems}
          onChecklistItemToggle={handleChecklistToggle}
        >
          {/* ── Tab navigation ── */}
          <TabNavigation activeId={activeSection} onSelect={handleTabSelect} />

          {/* ══════════════════ OVERVIEW ══════════════════ */}
          {activeSection === 'overview' && (
            <>
              {/* Departure countdown */}
              {daysUntilDeparture !== null && (
                <div className={`col-span-full flex items-start gap-4 rounded-xl border p-5 shadow-sm ${
                  daysUntilDeparture <= 0 ? 'border-emerald-300 bg-emerald-50'
                  : daysUntilDeparture <= 14 ? 'border-amber-300 bg-amber-50'
                  : 'border-blue-200 bg-blue-50'
                }`}>
                  <Clock size={24} className={`flex-shrink-0 mt-0.5 ${
                    daysUntilDeparture <= 0 ? 'text-emerald-500'
                    : daysUntilDeparture <= 14 ? 'text-amber-500' : 'text-blue-500'
                  }`} />
                  <div>
                    {daysUntilDeparture > 0 ? (
                      <>
                        <p className="text-base font-semibold text-slate-800">
                          {daysUntilDeparture} day{daysUntilDeparture !== 1 ? 's' : ''} until departure
                        </p>
                        <p className="mt-0.5 text-sm text-slate-600">
                          {daysUntilDeparture <= 14
                            ? 'Final stretch — make sure your checklist is complete!'
                            : 'You have time, but don\'t leave everything to the last minute.'}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-base font-semibold text-emerald-800">You've already departed — welcome to Milan! 🇮🇹</p>
                        <p className="mt-0.5 text-sm text-emerald-700">Check the next steps for what to do now that you've arrived.</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Readiness score */}
              <SectionCard title="Departure readiness" icon={<Compass size={18} />}>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-slate-600">
                    <span className="text-lg font-bold text-slate-900">{readinessDone}</span>
                    <span className="text-slate-400"> / {readinessItems.length}</span>{' '}
                    items ready
                  </p>
                  <span className={`text-sm font-semibold ${readinessPct === 100 ? 'text-emerald-600' : readinessPct >= 50 ? 'text-amber-600' : 'text-red-500'}`}>{readinessPct}%</span>
                </div>
                <div className="mb-5 h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${readinessPct === 100 ? 'bg-emerald-400' : readinessPct >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                    style={{ width: `${readinessPct}%` }}
                  />
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {readinessItems.map(({ label, done }) => (
                    <div key={label} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${done ? 'border-emerald-200 bg-emerald-50/60 text-emerald-700' : 'border-slate-200 bg-white text-slate-600'}`}>
                      {done
                        ? <CheckCircle2 size={15} className="flex-shrink-0 text-emerald-500" />
                        : <Circle size={15} className="flex-shrink-0 text-slate-300" />}
                      {label}
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowOnboarding(true)} className="mt-4 flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline">
                  Update your answers <ChevronRight size={13} />
                </button>
              </SectionCard>

              {/* Visa warning */}
              {isNonEU && hasVisa !== 'yes' && (
                <div className="col-span-full flex items-start gap-4 rounded-xl border border-red-200 bg-red-50 p-5">
                  <AlertTriangle size={22} className="flex-shrink-0 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-800">You haven't confirmed your student visa yet</p>
                    <p className="mt-1 text-sm text-red-700">
                      Non-EU students staying more than 90 days must obtain a <strong>D-type student visa</strong> before boarding.
                      Apply at the Italian consulate in your home country.
                    </p>
                    <a href="/dashboard/student-visa" className="mt-2 flex items-center gap-1 text-sm font-medium text-red-700 hover:underline">
                      Go to the Student Visa step <ArrowRight size={13} />
                    </a>
                  </div>
                </div>
              )}

              {/* Quick nav */}
              <SectionCard title="What's on this page" icon={<ClipboardList size={18} />}>
                <p className="mb-4 text-sm text-slate-500">
                  Documents to pack and how to get to Milan — the unique departure prep. For visa, insurance, and banking, see the dedicated steps below.
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 mb-5">
                  {[
                    { id: 'documents', label: 'What to pack',     icon: <FileText size={16} />,   color: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' },
                    { id: 'travel',    label: 'Travel & arrival', icon: <Plane size={16} />,      color: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' },
                    { id: 'faq',       label: 'FAQ',              icon: <HelpCircle size={16} />, color: 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' },
                  ].map(({ id, label, icon, color }) => (
                    <button key={id} onClick={() => handleTabSelect(id)}
                      className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-colors ${color}`}>
                      {icon}
                      {label}
                    </button>
                  ))}
                </div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Covered on other steps</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {[
                    { label: 'Student Visa', sub: 'Step 2 — visa requirements & process', href: '/dashboard/student-visa', color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' },
                    { label: 'Insurance',    sub: 'Step 8 — EHIC, health & travel cover',  href: '/dashboard/insurance',    color: 'bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100' },
                    { label: 'Banking',      sub: 'Step 8 — cards, Wise, Italian accounts', href: '/dashboard/banking',      color: 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100' },
                  ].map(({ label, sub, href, color }) => (
                    <a key={href} href={href}
                      className={`flex flex-col gap-0.5 rounded-lg border p-3 text-xs font-medium transition-colors ${color}`}>
                      <span className="font-semibold">{label}</span>
                      <span className="font-normal opacity-80">{sub}</span>
                    </a>
                  ))}
                </div>
              </SectionCard>
            </>
          )}

          {/* ══════════════════ DOCUMENTS ══════════════════ */}
          {activeSection === 'documents' && (
            <SectionCard title="Documents to prepare & pack" icon={<FileText size={18} />}>
              <div className="mb-4">
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Carry-on essentials progress</p>
                  <span className="text-xs text-slate-500">{doneCarryOn}/{reqCarryOn} done</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-emerald-400 transition-all duration-500" style={{ width: `${carryOnPct}%` }} />
                </div>
                {carryOnPct === 100 && <p className="mt-1.5 text-xs font-medium text-emerald-600">Carry-on documents ready! 🎉</p>}
              </div>

              <p className="mb-3 text-sm text-slate-500">
                The items below go in your <strong className="text-slate-700">carry-on bag only</strong>. If your checked luggage
                is lost or delayed, you'll still be able to complete all arrival formalities.
              </p>
              <div className="mb-6 space-y-2">
                {carryOnDocs.map((doc) => (
                  <DocItem key={doc.key} docKey={doc.key} label={doc.label}
                    required={!!doc.required} note={doc.note} checked={!!docChecklist[doc.key]} onChange={handleDocCheck} />
                ))}
              </div>

              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Additional documents to pack</p>
              <div className="space-y-2">
                {packedDocs.map((doc) => (
                  <DocItem key={doc.key} docKey={doc.key} label={doc.label}
                    required={doc.required} note={doc.note} checked={!!docChecklist[doc.key]} onChange={handleDocCheck} />
                ))}
              </div>

              <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-600">Pro tips</p>
                <ul className="space-y-1 text-sm text-slate-600">
                  {[
                    'Make 5–6 colour photocopies of every important document — Italian offices always ask.',
                    'Scan everything and store securely in Google Drive or iCloud for emergency access.',
                    'Italy uses EU Type-F (Schuko) outlets — bring an adapter and check charger voltage.',
                    'A USB drive with digital copies is a handy offline backup.',
                  ].map((tip) => (
                    <li key={tip} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400" />{tip}
                    </li>
                  ))}
                </ul>
              </div>
            </SectionCard>
          )}

          {/* ══════════════════ TRAVEL & ARRIVAL ══════════════════ */}
          {activeSection === 'travel' && (
            <SectionCard title="Travel & arrival in Milan" icon={<Plane size={18} />}>
              <p className="mb-4 text-sm text-slate-500">
                Milan has three airports. Choose your transport option based on where you land — and plan it
                before you arrive, not at 2 am after a long flight.
              </p>
              <div className="mb-5 space-y-3">
                {[
                  {
                    code: 'MXP', name: 'Malpensa Airport', note: 'Main international hub — most long-haul and intercontinental flights',
                    options: [
                      { method: 'Malpensa Express', time: '29–52 min', cost: '€13', to: 'Cadorna or Central Station', url: 'https://www.malpensaexpress.it/' },
                      { method: 'Terravision bus', time: '~60 min', cost: '~€9', to: 'Central Station', url: 'https://www.terravision.eu/' },
                      { method: 'Taxi (fixed rate)', time: '45–60 min', cost: '€95–€105', to: 'Central Milan', url: null },
                    ],
                  },
                  {
                    code: 'LIN', name: 'Linate Airport', note: 'Intra-EU flights — closest to the city centre',
                    options: [
                      { method: 'Metro M4 (blue line)', time: '30 min', cost: '€1.50', to: 'San Babila / Forlanini', url: 'https://www.atm.it/' },
                      { method: 'Taxi (fixed rate)', time: '20–30 min', cost: '€35', to: 'Central Milan', url: null },
                    ],
                  },
                  {
                    code: 'BGY', name: 'Orio al Serio (Bergamo)', note: 'Low-cost carriers (Ryanair, Wizz Air) — 45 km from Milan',
                    options: [
                      { method: 'Terravision / Flixbus', time: '60–75 min', cost: '€7–€10', to: 'Central Station', url: 'https://www.terravision.eu/' },
                      { method: 'Taxi', time: '40–60 min', cost: '~€110–130', to: 'Central Milan', url: null },
                    ],
                  },
                ].map((airport) => (
                  <div key={airport.code} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="flex items-center justify-center rounded-lg bg-slate-900 px-2.5 py-1 text-sm font-bold text-white">{airport.code}</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{airport.name}</p>
                        <p className="text-xs text-slate-500">{airport.note}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {airport.options.map((o) => (
                        <div key={o.method} className="flex items-center justify-between rounded-md border border-slate-100 bg-white px-3 py-2">
                          <div>
                            <p className="text-xs font-medium text-slate-700">{o.method}</p>
                            <p className="text-xs text-slate-400">{o.to}</p>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span><Clock size={10} className="mr-0.5 inline" />{o.time}</span>
                            <span className="font-medium text-slate-700">{o.cost}</span>
                            {o.url && (
                              <a href={o.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                                <ExternalLink size={11} />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <ExpandableCard title="Timing your arrival" badge={<Badge label="Important" variant="warning" />} defaultOpen>
                <ul className="space-y-3 text-sm text-slate-600">
                  {[
                    { t: 'Arrive 3–5 days before orientation', d: 'Gives time to settle, find your apartment, and handle admin before the busy welcome week.' },
                    { t: 'Bocconi orientation: mid-September', d: 'Check your specific welcome week dates at unibocconi.eu — dates vary by program.' },
                    { t: 'Non-EU: permesso within 8 working days', d: 'The clock starts from entry into Italy — prioritise this on arrival.' },
                    { t: 'Get an Italian SIM at the airport', d: 'TIM, Vodafone, WindTre, and Iliad all have airport counters. A local number is needed for most Italian services.' },
                  ].map(({ t, d }) => (
                    <li key={t} className="flex items-start gap-2">
                      <CheckCircle2 size={13} className="mt-1 flex-shrink-0 text-emerald-400" />
                      <div><p className="font-medium text-slate-800">{t}</p><p className="text-slate-500">{d}</p></div>
                    </li>
                  ))}
                </ul>
              </ExpandableCard>

              <div className="mt-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-4">
                  <p className="text-sm font-semibold text-slate-800 mb-2">When you arrive — next steps</p>
                  <p className="text-sm text-slate-500 mb-3">Once you land, the following steps each have their own dedicated page in the guide:</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {[
                      { label: 'Codice Fiscale', sub: 'Your Italian tax ID — needed for almost everything', href: '/dashboard/codice-fiscale' },
                      { label: 'Immigration Registration', sub: 'Permesso di soggiorno — non-EU students only', href: '/dashboard/immigration-registration' },
                      { label: 'Banking', sub: 'Opening an Italian account, Wise, Revolut', href: '/dashboard/banking' },
                      { label: 'Getting around Milan', sub: 'ATM passes, metro, and city transport', href: '/dashboard/getting-around' },
                    ].map(({ label, sub, href }) => (
                      <a key={href} href={href}
                        className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-white px-3 py-2.5 hover:border-blue-200 hover:bg-blue-50 transition-colors">
                        <div>
                          <p className="text-sm font-medium text-slate-800">{label}</p>
                          <p className="text-xs text-slate-500">{sub}</p>
                        </div>
                        <ChevronRight size={14} className="flex-shrink-0 text-slate-400" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {/* ══════════════════ FAQ ══════════════════ */}
          {activeSection === 'faq' && (
            <SectionCard title="Frequently asked questions" icon={<HelpCircle size={18} />}>
              <div className="space-y-3">
                {[
                  {
                    q: 'Can I stay in Italy during summer before my program starts?',
                    a: 'EU citizens: yes, freely. Non-EU citizens: your D visa is tied to the study period. If you want to arrive significantly early, check with the consulate — you may need to justify an extended stay.',
                  },
                  {
                    q: 'What if my accommodation isn\'t ready when I arrive?',
                    a: 'Book a hostel, Airbnb, or hotel for the gap — 1–5 nights near Central Station works well. You\'ll still need an Italian address for your permesso di soggiorno, so confirm your permanent address as soon as possible.',
                  },
                  {
                    q: 'Can I use my home SIM card in Italy without extra cost?',
                    a: 'EU SIM cards have no roaming fees within the EU — so EU SIMs work in Italy. However, data allowances may be limited while roaming. US, UK (post-Brexit), and non-EU SIMs typically face heavy roaming charges — an Italian SIM is strongly recommended.',
                  },
                  {
                    q: 'What documents do I need at Italian customs on arrival?',
                    a: 'Passport (and visa sticker for non-EU), university acceptance letter, proof of accommodation, and proof of funds. Border officers occasionally ask for these. Keep everything in your carry-on.',
                  },
                ].map(({ q, a }) => (
                  <ExpandableCard key={q} title={q}>
                    <p>{a}</p>
                  </ExpandableCard>
                ))}
              </div>
            </SectionCard>
          )}

          {/* ══════════════════ LINKS ══════════════════ */}
          {activeSection === 'links' && (
            <SectionCard title="Key links" icon={<LinkIcon size={18} />}>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  { label: 'Italian visa requirements tool (official)',      url: 'https://vistoperitalia.esteri.it/' },
                  { label: 'Universitaly — pre-enrollment portal',          url: 'https://www.universitaly.it/' },
                  { label: 'VFS Global — Italian visa service centres',     url: 'https://www.vfsglobal.com/italy/' },
                  { label: 'EHIC info — European Commission',               url: 'https://ec.europa.eu/social/main.jsp?catId=559' },
                  { label: 'UK GHIC application (NHS)',                     url: 'https://www.nhsbsa.nhs.uk/healthcare-abroad/applying-ghic' },
                  { label: 'YesMilano — Student visa guide (EN)',           url: 'https://studyandwork.yesmilano.it/en/study/how-to/student-visa' },
                  { label: 'Bocconi — International student services',      url: 'https://www.unibocconi.eu/en/programs/student-services' },
                  { label: 'Malpensa Express train to Milan',               url: 'https://www.malpensaexpress.it/' },
                  { label: 'ATM Milano — tickets & transport passes',       url: 'https://www.atm.it/en/Pages/default.aspx' },
                  { label: 'Wise — multi-currency account',                 url: 'https://wise.com/' },
                  { label: 'AXA Schengen travel insurance',                 url: 'https://www.axaschengen.com/' },
                  { label: 'Italian Ministry of Foreign Affairs',           url: 'https://www.esteri.it/en/' },
                ].map(({ label, url }) => (
                  <a key={url} href={url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                    {label}
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

