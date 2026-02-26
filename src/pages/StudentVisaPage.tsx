import { useState, useEffect, useCallback, useRef } from 'react'
import FeedbackWidget from '../components/FeedbackWidget'
import StepPageLayout from '../components/StepPageLayout'
import StepIntroModal from '../components/StepIntroModal'
import { useStepIntro } from '../hooks/useStepIntro'
import { getStepRequirements } from '../onboarding/stepRequirements'
import { fetchMe } from '../lib/api'
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
  Lightbulb,
  Link as LinkIcon,
  Plane,
  ClipboardList,
  ShieldCheck,
  MapPin,
  Clock,
  Globe,
} from 'lucide-react'

const CHECKLIST_STORAGE_KEY = 'dashboard-checklist:student-visa'
const DOC_CHECKLIST_KEY = 'visa-doc-checklist'

const PAGE_SECTIONS = [
  { id: 'overview',       label: 'Overview',        icon: Plane },
  { id: 'timeline',       label: 'Timeline',         icon: CalendarClock },
  { id: 'prerequisites',  label: 'Prerequisites',    icon: ClipboardList },
  { id: 'documents',      label: 'Documents',        icon: FileText },
  { id: 'application',    label: 'Application',      icon: MapPin },
  { id: 'after-arrival',  label: 'After arrival',    icon: ShieldCheck },
  { id: 'tips',           label: 'Insider tips',     icon: Lightbulb },
  { id: 'links',          label: 'Key links',        icon: LinkIcon },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function TabBarButtons({
  activeId,
  onSelect,
  compact = false,
}: {
  activeId: string
  onSelect: (id: string) => void
  compact?: boolean
}) {
  return (
    <>
      {PAGE_SECTIONS.map(({ id, label, icon: Icon }) => {
        const isActive = activeId === id
        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`flex flex-shrink-0 items-center gap-1.5 rounded-lg transition-all ${
              compact ? 'px-2.5 py-1.5 text-xs font-medium' : 'px-3 py-2 text-sm font-medium'
            } ${
              isActive
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <Icon size={compact ? 12 : 14} className={isActive ? 'text-white/80' : 'text-slate-400'} />
            {label}
          </button>
        )
      })}
    </>
  )
}

function TabNavigation({
  activeId,
  onSelect,
  isMerged = false,
}: {
  activeId: string
  onSelect: (id: string) => void
  isMerged?: boolean
}) {
  const [open, setOpen] = useState(false)
  const activeSection = PAGE_SECTIONS.find(s => s.id === activeId)
  const ActiveIcon = activeSection?.icon
  return (
    <div style={{ visibility: isMerged ? 'hidden' : 'visible', transition: 'visibility 0ms' }}>
      {/* Mobile: custom dropdown */}
      <div className="sm:hidden relative">
        <button
          onClick={() => setOpen(v => !v)}
          className="w-full flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            {ActiveIcon && <ActiveIcon size={15} className="text-blue-600 flex-shrink-0" />}
            <span className="text-sm font-semibold text-slate-800">{activeSection?.label}</span>
          </div>
          <ChevronDown size={16} className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
            <div className="absolute top-full left-0 right-0 mt-1.5 z-30 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
              {PAGE_SECTIONS.map(({ id, label, icon: Icon }) => {
                const isActive = id === activeId
                return (
                  <button
                    key={id}
                    onClick={() => { onSelect(id); setOpen(false) }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors border-b border-slate-100 last:border-b-0 ${
                      isActive ? 'bg-slate-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={15} className={isActive ? 'text-white/70' : 'text-slate-400'} />
                    {label}
                    {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>
      {/* Desktop: scrollable button row */}
      <nav className="hidden sm:flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm scrollbar-hide">
        <TabBarButtons activeId={activeId} onSelect={onSelect} />
      </nav>
    </div>
  )
}

function StickyMergedTabBar({ activeId, onSelect }: { activeId: string; onSelect: (id: string) => void }) {
  return (
    <nav className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
      <TabBarButtons activeId={activeId} onSelect={onSelect} compact />
    </nav>
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

function Badge({ label, variant }: { label: string; variant: 'required' | 'optional' | 'warning' | 'tip' | 'info' }) {
  const styles: Record<string, string> = {
    required: 'bg-red-50 text-red-700 border-red-200',
    optional: 'bg-slate-100 text-slate-600 border-slate-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    tip: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[variant]}`}>
      {label}
    </span>
  )
}

function ExpandableCard({ title, badge, children }: { title: string; badge?: React.ReactNode; children: React.ReactNode }) {
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

function DocChecklistItem({
  docKey,
  label,
  required,
  notes,
  tips,
  checked,
  onChange,
}: {
  docKey: string
  label: string
  required: boolean
  notes?: string
  tips?: { heading: string; points: string[] }
  checked: boolean
  onChange: (key: string, value: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`rounded-lg border transition-colors ${checked ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-start gap-3 px-4 py-3">
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
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-medium ${checked ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{label}</p>
          {notes && <p className="mt-0.5 text-xs text-slate-400">{notes}</p>}
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          {required ? <Badge label="Required" variant="required" /> : <Badge label="Optional" variant="optional" />}
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
      {tips && open && (
        <div className="border-t border-blue-100 bg-blue-50/40 px-4 pb-4 pt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-600">{tips.heading}</p>
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

function TimelineStep({
  number,
  title,
  timing,
  description,
  variant = 'default',
}: {
  number: number
  title: string
  timing: string
  description: string
  variant?: 'default' | 'warning' | 'important'
}) {
  const colors: Record<string, { dot: string; border: string; bg: string; badge: string; text: string }> = {
    default:   { dot: 'bg-slate-800',  border: 'border-slate-200', bg: 'bg-white',       badge: 'bg-slate-100 text-slate-600',  text: 'text-slate-600' },
    warning:   { dot: 'bg-amber-500',  border: 'border-amber-200', bg: 'bg-amber-50/40', badge: 'bg-amber-100 text-amber-700',  text: 'text-amber-700' },
    important: { dot: 'bg-blue-600',   border: 'border-blue-200',  bg: 'bg-blue-50/40',  badge: 'bg-blue-100 text-blue-700',    text: 'text-blue-700' },
  }
  const c = colors[variant]
  return (
    <div className={`flex gap-4 rounded-lg border p-4 ${c.border} ${c.bg}`}>
      <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${c.dot}`}>
        {number}
      </div>
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${c.badge}`}>{timing}</span>
        </div>
        <p className={`mt-1 text-xs leading-relaxed ${c.text}`}>{description}</p>
      </div>
    </div>
  )
}

// ─── Document data ────────────────────────────────────────────────────────────

const VISA_DOCUMENTS = [
  {
    key: 'passport',
    label: 'Valid passport',
    required: true,
    notes: 'Must be valid for at least 3 months beyond your intended stay in Italy. Needs at least 2 blank pages.',
    tips: {
      heading: 'Passport tips',
      points: [
        'Check the expiry date carefully — many consulates require validity well beyond your course end date.',
        'Bring the original AND a photocopy of the data page and any previous Italian visas.',
        'If your passport expires soon, renew it before applying for the visa.',
      ],
    },
  },
  {
    key: 'photos',
    label: '2 recent passport-size photos',
    required: true,
    notes: 'White background, 35×45 mm, taken within the last 6 months. Requirements vary slightly by consulate.',
    tips: {
      heading: 'Photo tips',
      points: [
        'Use a professional photo booth or photographer — phone photos are usually rejected.',
        'White or off-white background only; avoid glasses unless medically necessary.',
        'Check your specific consulate website for exact specifications.',
      ],
    },
  },
  {
    key: 'visa-form',
    label: 'Completed national visa application form',
    required: true,
    notes: "Type D (long-stay) national visa form. Download from your consulate's website.",
    tips: {
      heading: 'Application form tips',
      points: [
        'Use black or blue ink if filling by hand; no corrections/white-out.',
        'Date of arrival must match your planned travel date.',
        "List the Italian consulate address as 'destination address' if you don't yet have accommodation.",
        'Sign the form exactly as your passport signature.',
      ],
    },
  },
  {
    key: 'acceptance-letter',
    label: 'University acceptance / enrollment confirmation letter',
    required: true,
    notes: 'Official letter from your university confirming acceptance to a full-degree programme. Bocconi issues this after completing enrollment steps.',
    tips: {
      heading: 'Acceptance letter tips',
      points: [
        'The letter must be on official university letterhead with a stamp/signature.',
        'It should state your degree programme, duration, and start date.',
        'For Bocconi: download your official enrollment confirmation from the student portal (yoU@B) after accepting the offer and paying the enrollment fee.',
        'If you only have a conditional offer, contact the consulate — some accept it with additional proof of meeting conditions.',
      ],
    },
  },
  {
    key: 'universitaly',
    label: 'Universitaly pre-enrollment confirmation',
    required: true,
    notes: 'Proof that you completed pre-enrollment on the Universitaly portal (usually required for consulates in most countries).',
    tips: {
      heading: 'Universitaly tips',
      points: [
        'Pre-enrollment opens each year around December–January for the following academic year.',
        'You must upload your diploma and transcripts on Universitaly — have certified translations ready.',
        'Print and bring the confirmation PDF you receive after submission.',
        "Some consulates skip this requirement — check your specific consulate's instructions.",
      ],
    },
  },
  {
    key: 'dichiarazione',
    label: 'Dichiarazione di Valore (Declaration of Value)',
    required: true,
    notes: 'Legalisation of your qualifying diploma/degree, issued by the Italian consulate in your home country. Required for most non-EU applicants.',
    tips: {
      heading: 'Dichiarazione di Valore tips',
      points: [
        'This must be requested from the Italian consulate or embassy in the country where you studied (not just where you live).',
        'Bring your original diploma + transcripts with an official translation into Italian or English.',
        'Processing can take 4–8 weeks — request this as early as possible.',
        'Costs vary by consulate; expect €50–150.',
        "Some universities accept an apostille instead — confirm with Bocconi's international admissions office.",
      ],
    },
  },
  {
    key: 'financial-proof',
    label: 'Proof of financial means',
    required: true,
    notes: 'Bank statements, scholarship letter, or sponsor letter showing you can fund your stay. Minimum ~€6,079/year (updated annually).',
    tips: {
      heading: 'Financial proof tips',
      points: [
        'Bank statements must typically cover the last 3–6 months and show a sufficient running balance.',
        'If a family member is sponsoring you, include their bank statements + a signed sponsor declaration.',
        'Scholarship letters (e.g., from your university or a government body) are accepted as financial proof.',
        'The exact amount required is based on the Italian INPS "assegno sociale" — roughly €6,000–7,000/year as of 2025.',
        'Some consulates accept a credit statement or investment portfolio statement — check locally.',
      ],
    },
  },
  {
    key: 'accommodation',
    label: 'Proof of accommodation in Italy',
    required: true,
    notes: 'Rental contract, university housing confirmation, or hotel booking for your first weeks. Must cover your arrival period.',
    tips: {
      heading: 'Accommodation tips',
      points: [
        'University dormitory confirmation letters are the easiest option and highly trusted by consulates.',
        'If renting privately, bring a signed rental contract (contratto di locazione) registered with the Italian tax authority (Agenzia delle Entrate).',
        'Hotel bookings can work for initial weeks, but consulates may ask about longer-term plans.',
        "Bocconi's Student Housing Service releases results in June/July — book alternative backup options early.",
      ],
    },
  },
  {
    key: 'health-insurance',
    label: 'Health insurance valid in Italy',
    required: true,
    notes: 'Coverage must be valid for the entire duration of your stay in Italy. Minimum €30,000 coverage recommended.',
    tips: {
      heading: 'Health insurance tips',
      points: [
        'Must explicitly state it covers medical expenses in Italy.',
        'Policy start date must be on or before your intended arrival date in Italy.',
        "European Health Insurance Card (EHIC) is NOT sufficient for non-EU students' initial visa application.",
        'Once enrolled and residing in Italy, you can register with the Italian National Health Service (SSN) — this is cheaper long-term.',
        'Many universities offer group insurance plans — check with Bocconi before buying separately.',
      ],
    },
  },
  {
    key: 'visa-fee',
    label: 'Visa application fee payment (€116)',
    required: true,
    notes: 'National visa (Type D) fee as of 2025. Pay at the consulate or via the method specified on their website.',
    tips: {
      heading: 'Fee tips',
      points: [
        'Fees are non-refundable even if the visa is denied.',
        'Some consulates require payment in local currency — check in advance.',
        'VFS Global centres (used by many consulates) may charge an additional service fee of €30–50.',
        "Keep your payment receipt — you'll need it at the appointment.",
      ],
    },
  },
  {
    key: 'marca-da-bollo',
    label: 'Marca da bollo (€16 revenue stamp)',
    required: false,
    notes: 'Required by some Italian consulates. Buy at a Tabacchi shop in Italy, or check if your consulate accepts online payment.',
    tips: {
      heading: 'Marca da bollo tips',
      points: [
        'Not required by all consulates — check your specific one.',
        'If needed, it can be purchased in Italy or sometimes at the Italian Honorary Consulate.',
        'The stamp must not be cancelled before submission.',
      ],
    },
  },
  {
    key: 'translations',
    label: 'Certified translations of documents (if not in Italian/English)',
    required: false,
    notes: 'All documents not in Italian or English must be accompanied by a certified translation.',
    tips: {
      heading: 'Translation tips',
      points: [
        'Use a certified or sworn translator — some consulates require notarisation.',
        'Budget 1–2 weeks for translation turnaround.',
        'Diploma and transcript translations are typically the most critical and expensive.',
        'Universitaly may require Italian translations specifically.',
      ],
    },
  },
]

// ─── Main page ────────────────────────────────────────────────────────────────

export default function StudentVisaPage() {
  const { showModal, handleConfirm, handleBack } = useStepIntro('student-visa')
  const [isEuCitizen, setIsEuCitizen] = useState(false)
  const [nationality, setNationality] = useState<string | null>(null)
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({})
  const [docChecklist, setDocChecklist] = useState<Record<string, boolean>>({})
  const [activeSection, setActiveSection] = useState('overview')
  const { setSections, clearSections } = usePageSections()

  const tabNavRef = useRef<HTMLDivElement>(null)
  const [tabsMerged, setTabsMerged] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (!tabNavRef.current) return
      const rect = tabNavRef.current.getBoundingClientRect()
      setTabsMerged(rect.top < 72)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
    const sidebarSections = PAGE_SECTIONS.map(({ id, label }) => ({ id, label }))
    setSections(sidebarSections)
    return () => clearSections()
  }, [setSections, clearSections])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(CHECKLIST_STORAGE_KEY)
      if (saved) { try { setChecklistState(JSON.parse(saved)) } catch { setChecklistState({}) } }
      const savedDoc = window.localStorage.getItem(DOC_CHECKLIST_KEY)
      if (savedDoc) { try { setDocChecklist(JSON.parse(savedDoc)) } catch { setDocChecklist({}) } }
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMe()
        if (data?.profile?.isEuCitizen !== undefined) setIsEuCitizen(data.profile.isEuCitizen === 'yes')
        if (data?.profile?.nationality) setNationality(data.profile.nationality as string)
      } catch {/* keep defaults */}
    }
    load()
  }, [])

  const requirements = getStepRequirements('student-visa') || []
  const checklistItems = requirements.map((req) => ({
    ...req,
    completed: checklistState[req.id] || false,
  }))

  const handleChecklistToggle = (id: string, completed: boolean) => {
    const newState = { ...checklistState, [id]: completed }
    setChecklistState(newState)
    if (typeof window !== 'undefined') window.localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(newState))
  }

  const handleDocCheck = (key: string, value: boolean) => {
    const next = { ...docChecklist, [key]: value }
    setDocChecklist(next)
    if (typeof window !== 'undefined') window.localStorage.setItem(DOC_CHECKLIST_KEY, JSON.stringify(next))
  }

  const docsDoneCount = VISA_DOCUMENTS.filter((d) => docChecklist[d.key]).length

  if (isEuCitizen) {
    return (
      <>
        {showModal && (
          <StepIntroModal
            stepTitle="Student Visa"
            stepDescription="Apply for your student visa and prepare all required documentation."
            onConfirm={handleConfirm}
            onBack={handleBack}
          />
        )}
        <FeedbackWidget />
          <StepPageLayout
            stepNumber={3}
            totalSteps={10}
            stepLabel="STEP 3"
            title="Student Visa"
            subtitle="Prepare, apply, and track your student visa."
            checklistItems={checklistItems}
            onChecklistItemToggle={handleChecklistToggle}
            useGradientBar={true}
          >
            <div className="col-span-full flex items-start gap-4 rounded-xl border border-amber-200 bg-amber-50 p-5">
              <Info size={22} className="flex-shrink-0 text-amber-500 mt-0.5" />
              <div>
                <p className="text-base font-semibold text-amber-800">Not applicable for EU/EEA citizens</p>
                <p className="mt-1 text-sm text-amber-700">
                  As an EU/EEA citizen you benefit from freedom of movement and do not need a student visa to study in Italy.
                  You will still need to register your residency — this is covered in the Residence Permit step.
                </p>
                <a href="/dashboard/immigration-registration" className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors">
                  Go to Residence Permit step &rarr;
                </a>
              </div>
            </div>
          </StepPageLayout>
      </>
    )
  }

  return (
    <>
      {showModal && (
        <StepIntroModal
          stepTitle="Student Visa"
          stepDescription="Apply for your student visa and prepare all required documentation."
          onConfirm={handleConfirm}
          onBack={handleBack}
        />
      )}
      <FeedbackWidget />
        <StepPageLayout
          stepNumber={3}
          totalSteps={10}
          stepLabel="STEP 3"
          title="Student Visa"
          subtitle={
            <span>
              Everything you need to get your <span className="font-semibold text-slate-800">Italian student visa (Visto D)</span> as a non-EU student — from prerequisites to your consulate appointment.
            </span>
          }
          userInfoTitle="Your visa details"
          userInfoSubtitle={
            nationality ? (
              <>Showing guidance for <strong className="text-slate-700">{nationality}</strong> nationals. Update in{' '}<a href="/dashboard/my-situation" className="text-blue-600 hover:underline">My Situation</a>.</>
            ) : (
              <>Set your nationality in <a href="/dashboard/my-situation" className="text-blue-600 hover:underline">My Situation</a> for personalised guidance.</>
            )
          }
          userInfoFields={[
            { key: 'nationality', label: 'Nationality' },
            { key: 'destinationCity', label: 'City' },
            { key: 'programStartMonth', label: 'Course start' },
          ]}
          checklistItems={checklistItems}
          onChecklistItemToggle={handleChecklistToggle}
          showChecklist={false}
          useGradientBar={true}
          isTabMerged={tabsMerged}
          mergedTabBar={<StickyMergedTabBar activeId={activeSection} onSelect={handleTabSelect} />}
        >

          {/* Tab navigation */}
          <div ref={tabNavRef} className="col-span-full">
            <TabNavigation activeId={activeSection} onSelect={handleTabSelect} isMerged={tabsMerged} />
          </div>

          {/* OVERVIEW */}
          {activeSection === 'overview' && (
            <>
              <div className="col-span-full flex items-start gap-4 rounded-xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
                <Plane size={24} className="flex-shrink-0 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-base font-semibold text-blue-800">You need a national long-stay visa (Visto D)</p>
                  <p className="mt-1 text-sm text-blue-700">
                    Non-EU students staying in Italy for more than 90 days must obtain a <strong>Type D national student visa</strong> before travelling.
                    This is issued by the Italian consulate in your home country and allows entry for study purposes.
                  </p>
                </div>
              </div>

              <SectionCard title="What is the Italian student visa?" icon={<Globe size={18} />}>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Italy issues two main visa types for students: the <strong>Type C Schengen visa</strong> (short stay, up to 90 days — not sufficient for a full degree)
                  and the <strong>Type D national long-stay visa</strong> for stays exceeding 90 days. As a student pursuing a full programme at Bocconi or another
                  Italian university, you need the Type D student visa.
                </p>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Visa type</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">Type D — Visto Nazionale</p>
                    <p className="text-xs text-slate-500 mt-0.5">Long-stay visa for full-degree students (&gt;90 days)</p>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Processing time</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">3–8 weeks</p>
                    <p className="text-xs text-slate-500 mt-0.5">Varies by consulate — apply at least 3 months before departure</p>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Visa fee</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">€116</p>
                    <p className="text-xs text-slate-500 mt-0.5">Non-refundable; some consulates add a service fee</p>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Where to apply</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">Italian consulate / VFS Global</p>
                    <p className="text-xs text-slate-500 mt-0.5">In your country of legal residence</p>
                  </div>
                </div>
                <div className="mt-5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-amber-500" />
                  <span>
                    <strong>Important:</strong> The student visa alone does not grant long-term residency. Within 8 working days of arriving in Italy,
                    you must apply for a <strong>Permesso di Soggiorno per Studio</strong> (residence permit) at the local Questura. This is covered in Step 6.
                  </span>
                </div>
              </SectionCard>

              <SectionCard title="Who needs this visa?" icon={<ShieldCheck size={18} />}>
                <div className="space-y-3">
                  <ExpandableCard title="Non-EU / non-EEA nationals" badge={<Badge label="Needs visa" variant="required" />}>
                    <p>Citizens of countries outside the EU/EEA must apply for a Type D student visa before travelling to Italy for study.
                    This includes students from the USA, UK, Canada, India, China, Brazil, and all other non-EU countries.</p>
                  </ExpandableCard>
                  <ExpandableCard title="EU / EEA citizens" badge={<Badge label="No visa needed" variant="tip" />}>
                    <p>Citizens of EU/EEA member states do not need a visa. You can travel and study freely in Italy.
                    However, you must register your residency with the local municipality (Comune) within 3 months of arrival.</p>
                  </ExpandableCard>
                  <ExpandableCard title="Students from Schengen countries" badge={<Badge label="No visa needed" variant="tip" />}>
                    <p>Switzerland, Norway, Iceland, and Liechtenstein have bilateral agreements and their citizens do not require a visa for Italy.</p>
                  </ExpandableCard>
                  <ExpandableCard title="Students with existing Italian residency" badge={<Badge label="Check your status" variant="info" />}>
                    <p>If you already hold a valid Italian residence permit or long-stay visa, you may not need to re-apply.
                    Check with your university's international office.</p>
                  </ExpandableCard>
                </div>
              </SectionCard>
            </>
          )}

          {/* TIMELINE */}
          {activeSection === 'timeline' && (
            <SectionCard title="Recommended timeline" icon={<CalendarClock size={18} />}>
              <p className="mb-4 text-sm text-slate-500 leading-relaxed">
                The visa process involves multiple sequential steps — some require weeks of waiting. Start as early as possible.
                Below is a recommended timeline counting <strong>backwards from your intended arrival</strong> in Italy.
              </p>
              <div className="space-y-3">
                <TimelineStep number={1} title="Receive university acceptance letter" timing="6–8 months before arrival"
                  description="You cannot apply for a visa without an official acceptance letter from your Italian university. Have your degree confirmed (for Bocconi, complete the enrollment fee payment to trigger the official letter)."
                  variant="important" />
                <TimelineStep number={2} title="Complete Universitaly pre-enrollment" timing="Dec – Feb (check yearly dates)"
                  description="Non-EU students must pre-enroll on the Universitaly portal. This window is fixed each academic year — typically December to February. Missing it can delay your entire visa application."
                  variant="warning" />
                <TimelineStep number={3} title="Request Dichiarazione di Valore" timing="5–7 months before arrival"
                  description="Submit your diploma and transcripts to the Italian consulate in your home country to get the Dichiarazione di Valore. This can take 4–8 weeks and is often the biggest bottleneck."
                  variant="warning" />
                <TimelineStep number={4} title="Gather all supporting documents" timing="3–4 months before arrival"
                  description="Collect financial proof, accommodation confirmation, health insurance, certified translations, and passport photos. Allow extra time for certified translations." />
                <TimelineStep number={5} title="Book consulate appointment" timing="3–4 months before arrival"
                  description="Many consulates and VFS Global centres have limited appointment slots — popular slots are often booked weeks in advance. Book as soon as your documents are ready."
                  variant="warning" />
                <TimelineStep number={6} title="Attend visa appointment & submit documents" timing="2–3 months before arrival"
                  description="Attend your consulate appointment with all original documents plus copies. Processing takes 3–8 weeks. Keep your tracking number."
                  variant="important" />
                <TimelineStep number={7} title="Collect your visa" timing="3–6 weeks after appointment"
                  description="You'll be notified when your passport is ready for collection (or posted back, depending on the consulate). Check the visa details carefully before leaving the consulate." />
                <TimelineStep number={8} title="Travel to Italy" timing="On your intended arrival date"
                  description="Travel to Italy with your visa, all supporting documents, and copies. Keep everything accessible during border checks." />
                <TimelineStep number={9} title="Apply for Permesso di Soggiorno" timing="Within 8 working days of arrival"
                  description="Within 8 working days of arriving in Italy, submit your Permesso di Soggiorno application at the post office (kit available at any post office). This is covered in Step 6."
                  variant="warning" />
              </div>
              <div className="mt-5 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                <Info size={16} className="mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Peak season delays:</strong> Consulates processing student visas are busiest in May–July (for September starts)
                  and October–November (for February starts). Apply earlier than the minimum recommended window during these periods.
                </span>
              </div>
            </SectionCard>
          )}

          {/* PREREQUISITES */}
          {activeSection === 'prerequisites' && (
            <>
              <SectionCard title="Universitaly pre-enrollment" icon={<ClipboardList size={18} />}>
                <p className="mb-4 text-sm text-slate-600 leading-relaxed">
                  Before applying for a student visa, most non-EU students are required to pre-enroll on
                  the <strong>Universitaly</strong> government portal. This is a separate step from your university application.
                </p>
                <div className="space-y-3">
                  <ExpandableCard title="What is Universitaly?" badge={<Badge label="Government portal" variant="info" />}>
                    <p className="mb-2">Universitaly is Italy's centralised portal for the pre-enrollment of international students. It is managed by the Italian Ministry of Foreign Affairs (MAECI) and is part of the visa application process for most non-EU students coming to study at Italian universities.</p>
                    <p>The portal collects your academic credentials, then notifies the Italian consulate in your country — this is required before the consulate will accept your visa application in many jurisdictions.</p>
                  </ExpandableCard>
                  <ExpandableCard title="When does the pre-enrollment window open?" badge={<Badge label="Time-sensitive" variant="warning" />}>
                    <p className="mb-2">The Universitaly pre-enrollment window typically opens in <strong>December</strong> and closes in <strong>February</strong> each year for the following academic year. Exact dates are published on the Universitaly website.</p>
                    <div className="mt-2 flex items-start gap-1.5 rounded bg-amber-50 p-2 text-xs text-amber-700">
                      <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" />
                      Missing this window can delay your entire visa application by months. Check the dates as early as November.
                    </div>
                  </ExpandableCard>
                  <ExpandableCard title="What do I submit on Universitaly?">
                    <ul className="space-y-1.5 text-sm">
                      {['Personal details and passport information','Name of the Italian institution and programme','Scanned copies of your diploma and academic transcripts','Italian translations of academic documents (where required)','A passport-size photo'].map((item, i) => (
                        <li key={i} className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />{item}</li>
                      ))}
                    </ul>
                  </ExpandableCard>
                  <ExpandableCard title="Does every country require Universitaly pre-enrollment?" badge={<Badge label="Check your consulate" variant="info" />}>
                    <p>Not always. Requirements vary by consulate. Some consulates only require the Universitaly confirmation for visa types that require it officially; others may accept direct university enrollment proof instead. Always check your specific Italian consulate's instructions directly. Countries like the USA, India, and Brazil typically require it.</p>
                  </ExpandableCard>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Official portal</p>
                    <p className="text-sm font-semibold text-slate-800">universitaly.it</p>
                  </div>
                  <a href="https://www.universitaly.it" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                    Open portal <ExternalLink size={11} />
                  </a>
                </div>
              </SectionCard>

              <SectionCard title="Dichiarazione di Valore" icon={<FileText size={18} />}>
                <p className="mb-4 text-sm text-slate-600 leading-relaxed">
                  The <strong>Dichiarazione di Valore in loco</strong> is a document issued by the Italian consulate in the country where you obtained your
                  qualifying diploma or degree. It certifies that your educational qualification is genuine and equivalent to the Italian standard.
                </p>
                <div className="space-y-3">
                  <ExpandableCard title="What is it exactly?" badge={<Badge label="Required by most consulates" variant="required" />}>
                    <p className="mb-2">It is an official statement by the Italian consulate attesting to: the authenticity of your diploma, the number of years of study, the school type, and the grading system.</p>
                    <p>Think of it as Italy's way of validating foreign educational qualifications — in the absence of an international mutual recognition agreement.</p>
                  </ExpandableCard>
                  <ExpandableCard title="How do I get it?">
                    <ol className="space-y-2 text-sm list-none">
                      {[
                        'Contact the Italian consulate in the country where you completed the qualifying degree',
                        'Submit original diploma + transcripts with a certified Italian translation',
                        'Pay the consular fee (typically €50–150, varies by country)',
                        'Wait 4–8 weeks for the document to be prepared',
                        'The consulate returns your originals with the Dichiarazione attached',
                      ].map((step, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">{i + 1}</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </ExpandableCard>
                  <ExpandableCard title="What if I studied in multiple countries?">
                    <p>You need the Dichiarazione for the specific degree used as your qualification for admission. Contact the consulate of the country where that institution is located, not your country of nationality.</p>
                  </ExpandableCard>
                  <ExpandableCard title="Is an Apostille an alternative?" badge={<Badge label="Sometimes" variant="optional" />}>
                    <p>Some Italian universities (including Bocconi for certain nationalities) accept an apostilled diploma instead of a Dichiarazione di Valore. This is quicker and cheaper. Confirm directly with the international admissions office before ordering one or the other.</p>
                  </ExpandableCard>
                </div>
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  <Clock size={15} className="mt-0.5 flex-shrink-0 text-amber-500" />
                  <span>
                    <strong>Start this process first.</strong> The Dichiarazione di Valore typically takes the longest to obtain (4–8 weeks).
                    Begin this as soon as you receive your acceptance letter.
                  </span>
                </div>
              </SectionCard>
            </>
          )}

          {/* DOCUMENTS */}
          {activeSection === 'documents' && (
            <SectionCard title="Document checklist" icon={<FileText size={18} />}>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-slate-500">Track which documents you've gathered for your visa application.</p>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${docsDoneCount === VISA_DOCUMENTS.length ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {docsDoneCount}/{VISA_DOCUMENTS.length} ready
                </span>
              </div>
              {docsDoneCount === VISA_DOCUMENTS.length && (
                <div className="mb-4 flex items-center gap-3 rounded-lg border border-emerald-300 bg-emerald-50 p-3">
                  <CheckCircle2 size={18} className="text-emerald-500" />
                  <p className="text-sm font-semibold text-emerald-800">All documents ready — you're set for your appointment!</p>
                </div>
              )}
              <div className="mb-3 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700">
                <Info size={14} className="mt-0.5 flex-shrink-0" />
                <span>
                  Requirements vary by consulate. Always verify the exact list on your Italian consulate's official website before your appointment.
                  Bring originals <strong>and</strong> copies of everything.
                </span>
              </div>
              <div className="space-y-2">
                {VISA_DOCUMENTS.map((doc) => (
                  <DocChecklistItem
                    key={doc.key}
                    docKey={doc.key}
                    label={doc.label}
                    required={doc.required}
                    notes={doc.notes}
                    tips={doc.tips}
                    checked={!!docChecklist[doc.key]}
                    onChange={handleDocCheck}
                  />
                ))}
              </div>
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                <Info size={13} className="mt-0.5 flex-shrink-0 text-slate-400" />
                <span>Your document progress is saved locally in your browser.</span>
              </div>
            </SectionCard>
          )}

          {/* APPLICATION */}
          {activeSection === 'application' && (
            <>
              <SectionCard title="How to apply" icon={<MapPin size={18} />}>
                <p className="mb-4 text-sm text-slate-600 leading-relaxed">
                  The Italian student visa must be applied for <strong>in person</strong> at the Italian consulate or embassy in your country of legal residence,
                  or through an authorised visa centre (VFS Global operates on behalf of many Italian consulates).
                </p>
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <h3 className="mb-3 text-sm font-semibold text-slate-800">Step-by-step application process</h3>
                  <ol className="space-y-3">
                    {[
                      { step: 'Complete Universitaly pre-enrollment', detail: 'Submit your pre-enrollment on universitaly.it during the open window (Dec–Feb). Print the confirmation.' },
                      { step: 'Gather all required documents', detail: 'Use the Documents tab to make sure every required item is ready. Get certified translations for anything not in Italian or English.' },
                      { step: 'Request the Dichiarazione di Valore', detail: 'Submit your diploma to the Italian consulate in your country of qualification. This takes 4–8 weeks.' },
                      { step: 'Book your visa appointment', detail: "Visit your Italian consulate website or the VFS Global website for your country to book a slot. Popular slots fill quickly." },
                      { step: 'Attend the appointment', detail: "Bring all originals and copies. You'll submit your documents, pay the fee, and provide biometric data if required." },
                      { step: 'Wait for processing', detail: "Processing takes 3–8 weeks. Track status via your consulate's tracking system or VFS reference number." },
                      { step: 'Collect your passport', detail: 'Return to the consulate or VFS centre to collect your passport with the visa. Check all details (validity dates, type, number of entries).' },
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">{i + 1}</span>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{item.step}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{item.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </SectionCard>

              <SectionCard title="Financial requirements" icon={<ShieldCheck size={18} />}>
                <p className="mb-3 text-sm text-slate-600 leading-relaxed">
                  You must demonstrate sufficient financial means to support yourself during your stay in Italy.
                  The minimum amounts are set by the Italian government annually based on the INPS social allowance (assegno sociale).
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-4">
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Minimum (up to 1 month)</p>
                    <p className="mt-1 text-lg font-bold text-slate-800">€269.60</p>
                    <p className="text-xs text-slate-500 mt-0.5">Half of the monthly INPS social allowance</p>
                  </div>
                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                    <p className="text-xs font-medium text-blue-400 uppercase tracking-wide">Minimum (per month beyond 1)</p>
                    <p className="mt-1 text-lg font-bold text-blue-800">~€539 / month</p>
                    <p className="text-xs text-blue-600 mt-0.5">Full INPS monthly social allowance (2025)</p>
                  </div>
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                    <p className="text-xs font-medium text-emerald-400 uppercase tracking-wide">Recommended (full academic year)</p>
                    <p className="mt-1 text-lg font-bold text-emerald-800">€6,000 – €8,000</p>
                    <p className="text-xs text-emerald-600 mt-0.5">Bank balance typically checked over 3–6 months</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <ExpandableCard title="Bank statements" badge={<Badge label="Most common" variant="tip" />}>
                    <p>Bring bank statements covering the last 3–6 months showing your average balance above the required threshold. The statements should be on your bank's letterhead, stamped, or printed from online banking with your full name and account number.</p>
                  </ExpandableCard>
                  <ExpandableCard title="Scholarship letter" badge={<Badge label="Accepted" variant="tip" />}>
                    <p>An official scholarship award letter (from your university, government, or an international body) specifying the scholarship amount and duration is accepted as financial proof. Bocconi scholarships qualify.</p>
                  </ExpandableCard>
                  <ExpandableCard title="Sponsor declaration" badge={<Badge label="Accepted" variant="optional" />}>
                    <p>A parent or other family member can act as financial sponsor. Include their bank statements, a signed declaration (dichiarazione di mantenimento), their passport copy, and proof of relationship to you.</p>
                  </ExpandableCard>
                </div>
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                  <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" />
                  <span>
                    The exact financial requirement is updated each year by the Italian government. Check the current INPS assegno sociale figure on the
                    consulate website or on <a href="https://www.inps.it" target="_blank" rel="noopener noreferrer" className="underline">inps.it</a> before your appointment.
                  </span>
                </div>
              </SectionCard>
            </>
          )}

          {/* AFTER ARRIVAL */}
          {activeSection === 'after-arrival' && (
            <SectionCard title="After you arrive in Italy" icon={<ShieldCheck size={18} />}>
              <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4">
                <AlertTriangle size={20} className="flex-shrink-0 text-amber-500 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Apply for your Permesso di Soggiorno within 8 working days</p>
                  <p className="mt-1 text-xs text-amber-700">
                    Italian law requires all non-EU students to apply for a <strong>Permesso di Soggiorno per Studio</strong> (study residence permit)
                    within 8 <em>working</em> days of entering Italy. Failing to do this on time can cause serious legal complications.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <ExpandableCard title="What is the Permesso di Soggiorno?" badge={<Badge label="Mandatory" variant="required" />}>
                  <p className="mb-2">The <em>Permesso di Soggiorno per Studio</em> is a residence permit that allows you to legally live in Italy for the duration of your studies. It is different from the visa — the visa allows entry; the permit allows you to stay.</p>
                  <p>Without it, your stay in Italy becomes irregular after 8 working days, even if your visa is still technically valid.</p>
                </ExpandableCard>
                <ExpandableCard title="How do I apply?" badge={<Badge label="Post office" variant="info" />}>
                  <ol className="space-y-2 text-sm list-none">
                    {[
                      "Pick up a 'kit' (yellow envelope) from any Italian post office (Poste Italiane) — it's free",
                      'Fill in the application form (modulo) included in the kit',
                      'Return the completed kit to the post office with the required documents and a €16 marca da bollo + €30 postal fee',
                      "You'll receive an SMS with your appointment date at the local Questura (police headquarters)",
                      'Attend the Questura appointment to provide biometric data',
                      'Collect your Permesso di Soggiorno when notified (usually several months later)',
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </ExpandableCard>
                <ExpandableCard title="What documents do I need for the Permesso?">
                  <ul className="space-y-1.5 text-sm">
                    {[
                      'Passport (original + photocopy of all pages)',
                      'Visa (original + photocopy)',
                      '4 passport-size photos',
                      'University enrollment certificate',
                      'Proof of accommodation (rental contract / university housing)',
                      'Financial proof (bank statement, scholarship, or sponsor letter)',
                      'Health insurance or SSN registration proof',
                      '€16 marca da bollo + €30 postal kit fee',
                      'Completed application form from the post office kit',
                    ].map((doc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                </ExpandableCard>
                <ExpandableCard title="What is the processing time?">
                  <p className="mb-2">Processing takes <strong>1–6 months</strong> in major cities like Milan (Milan specifically can take 4–6 months for the first permit).</p>
                  <p>However, your <strong>postal receipt</strong> (ricevuta postale) serves as legal proof of a pending permit and is accepted by banks, landlords, and most official institutions in the interim.</p>
                </ExpandableCard>
                <ExpandableCard title="Renewal for subsequent years" badge={<Badge label="Annual" variant="info" />}>
                  <p>The Permesso di Soggiorno for study is issued annually and must be renewed each year before it expires. Start the renewal process at least 60 days before expiry.</p>
                </ExpandableCard>
              </div>
              <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                <p className="font-semibold mb-1">Milan Questura — Ufficio Immigrazione</p>
                <p className="text-xs text-blue-700">Via Montebello 26, 20121 Milan. Appointments are arranged through the post office kit system — you cannot walk in without one.</p>
                <a href="https://questure.poliziadistato.it/it/Milano" target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                  Milan Questura website <ExternalLink size={11} />
                </a>
              </div>
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                <p className="font-medium text-slate-700 mb-1">Register with the Italian National Health Service (SSN)</p>
                <p>Once you have your Permesso di Soggiorno (or postal receipt), register with your local ASL (Azienda Socio-Sanitaria Locale) to get a family doctor and access public healthcare. Registration costs ~€149/year for students.</p>
              </div>
            </SectionCard>
          )}

          {/* TIPS */}
          {activeSection === 'tips' && (
            <SectionCard title="Insider tips & common mistakes" icon={<Lightbulb size={18} />}>
              <div className="space-y-3">
                {[
                  { title: "Start the Dichiarazione di Valore first — it's the biggest bottleneck", variant: 'warning' as const,
                    body: "Most students underestimate how long the Dichiarazione di Valore takes. Contact the Italian consulate in your home country immediately after receiving your acceptance letter. Don't wait until you have all other documents." },
                  { title: "Check your specific consulate's requirements — they differ", variant: 'warning' as const,
                    body: 'The Italian consulate in New York has different procedures to the one in Mumbai or Nairobi. Always check the official consulate website for your jurisdiction. Requirements and accepted documents vary significantly.' },
                  { title: 'Book your appointment early — slots disappear fast', variant: 'warning' as const,
                    body: 'Popular consulates (especially in Asia and North America) have very limited appointment slots that are booked weeks in advance. Set a calendar reminder to open the booking system as soon as your documents are ready.' },
                  { title: 'Bring multiple copies of everything', variant: 'tip' as const,
                    body: 'Bring 2–3 copies of every document, including your passport pages. Some consulates ask for extra copies on the spot. Having them ready avoids being turned away.' },
                  { title: 'Keep your receipt after submitting the Permesso di Soggiorno', variant: 'tip' as const,
                    body: 'The postal receipt you get after submitting your Permesso application is a valid legal document. Keep it with you at all times — it works as an ID for most purposes while you wait months for the actual permit.' },
                  { title: 'Financial proof: avoid sudden large deposits before applying', variant: 'warning' as const,
                    body: 'Consular officers look at your transaction history, not just the current balance. A sudden large deposit raises red flags. Ideally, your account should have maintained the required balance for at least 3 months.' },
                  { title: 'Your visa entry date matters', variant: 'tip' as const,
                    body: "Check the 'valid from' date on your visa. You cannot enter Italy before that date. Plan your travel so that you enter within the visa validity window — most Type D visas allow entry 6 months from the date of issue." },
                  { title: 'Bocconi students: use the International Students Office', variant: 'tip' as const,
                    body: "The Bocconi International Students Office (ISO) provides visa guidance and can sometimes provide supporting letters. They also run pre-arrival webinars covering the Permesso process. It's free." },
                  { title: "Don't confuse the study visa with the Erasmus/exchange visa", variant: 'info' as const,
                    body: "If you're coming as an exchange student (Erasmus or bilateral exchange), the process may differ. This guide assumes you are a full-degree student." },
                ].map((tip, i) => (
                  <ExpandableCard
                    key={i}
                    title={tip.title}
                    badge={<Badge label={tip.variant === 'tip' ? 'Tip' : tip.variant === 'warning' ? 'Watch out' : 'Note'} variant={tip.variant === 'info' ? 'info' : tip.variant === 'tip' ? 'tip' : 'warning'} />}
                  >
                    <p>{tip.body}</p>
                  </ExpandableCard>
                ))}
              </div>
            </SectionCard>
          )}

          {/* LINKS */}
          {activeSection === 'links' && (
            <SectionCard title="Key links & official resources" icon={<LinkIcon size={18} />}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  { title: "Visto per L'Italia — Official visa portal", description: "Italy's official immigration portal listing all visa types, requirements, and consulate contacts.", url: 'https://vistoperitalia.esteri.it', badge: 'Official' },
                  { title: 'Universitaly pre-enrollment', description: 'Government portal where non-EU students complete mandatory pre-enrollment before applying for a visa.', url: 'https://www.universitaly.it', badge: 'Required' },
                  { title: 'Italian Ministry of Foreign Affairs — Consulates', description: 'Directory of all Italian consulates and embassies worldwide. Find your local consulate and their specific requirements.', url: 'https://www.esteri.it/en/diplomatic-chair/', badge: 'Official' },
                  { title: 'VFS Global — Italy visa centres', description: 'Many Italian consulates process visa applications through VFS Global centres. Book appointments here.', url: 'https://www.vfsglobal.com/en/individuals/find-visa-centre.html', badge: 'Appointments' },
                  { title: 'Bocconi ISO — Visa guidance', description: "Bocconi's International Students Office page with visa and Permesso di Soggiorno guidance specific to Bocconi students.", url: 'https://www.unibocconi.eu/en/programmes/international-students-incoming/visa-and-residence-permits', badge: 'Bocconi' },
                  { title: 'Poste Italiane — Permesso di Soggiorno kit', description: 'Pick up the Permesso kit from any Italian post office. This page explains the process.', url: 'https://www.poste.it/prodotti/permessodisoggiorno.html', badge: 'Post-arrival' },
                  { title: 'Sportello Unico Immigrazione', description: "Italy's Single Immigration Desk — used for certain permit types and renewals in some provinces.", url: 'https://portaleimmigrazione.it', badge: 'Official' },
                  { title: 'INPS — Assegno sociale (financial threshold)', description: 'Check the current social allowance figure used to calculate the minimum financial requirement for the visa.', url: 'https://www.inps.it/en/it/dettaglio-scheda.schede-servizio-e-prestazioni.assegno-sociale-2021.html', badge: 'Financial' },
                ].map((link) => {
                  const badgeVariants: Record<string, 'required' | 'optional' | 'warning' | 'tip' | 'info'> = {
                    Official: 'info', Required: 'required', Appointments: 'warning', Bocconi: 'tip', 'Post-arrival': 'optional', Financial: 'info',
                  }
                  return (
                    <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                      className="group flex flex-col gap-1 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md hover:border-slate-300">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">{link.title}</p>
                        <ExternalLink size={14} className="mt-0.5 flex-shrink-0 text-slate-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{link.description}</p>
                      <div className="mt-1">
                        <Badge label={link.badge} variant={badgeVariants[link.badge] ?? 'info'} />
                      </div>
                    </a>
                  )
                })}
              </div>
            </SectionCard>
          )}

        </StepPageLayout>
    </>
  )
}
