import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '../components/DashboardLayout'
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
  FileText,
  MapPin,
  Lightbulb,
  Link as LinkIcon,
  CreditCard,
  HelpCircle,
  ClipboardList,
  ShieldCheck,
} from 'lucide-react'

const CHECKLIST_STORAGE_KEY = 'dashboard-checklist:codice-fiscale'

const PAGE_SECTIONS = [
  { id: 'overview',   label: 'Overview',        icon: CreditCard },
  { id: 'apply',      label: 'How to apply',    icon: ClipboardList },
  { id: 'documents',  label: 'Documents',       icon: FileText },
  { id: 'offices',    label: 'Offices',         icon: MapPin },
  { id: 'verify',     label: 'Verify & check',  icon: ShieldCheck },
  { id: 'faq',        label: 'FAQ',             icon: HelpCircle },
  { id: 'links',      label: 'Key links',       icon: LinkIcon },
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
  variant: 'required' | 'optional' | 'note' | 'warning' | 'eu' | 'noneu'
}) {
  const styles: Record<string, string> = {
    required: 'bg-red-50 text-red-700 border-red-200',
    optional: 'bg-slate-100 text-slate-600 border-slate-200',
    note:     'bg-blue-50 text-blue-700 border-blue-200',
    warning:  'bg-amber-50 text-amber-700 border-amber-200',
    eu:       'bg-indigo-50 text-indigo-700 border-indigo-200',
    noneu:    'bg-orange-50 text-orange-700 border-orange-200',
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

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CodiceFiscalePage() {
  const { showModal, handleConfirm, handleBack } = useStepIntro('codice-fiscale')
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({})
  const [docChecklist, setDocChecklist] = useState<Record<string, boolean>>({})
  const [activeSection, setActiveSection] = useState('overview')
  const [isEuCitizen, setIsEuCitizen] = useState<string | null>(null)
  const [hasCodiceFiscale, setHasCodiceFiscale] = useState<string | null>(null)
  const [nationality, setNationality] = useState<string | null>(null)
  const { setSections, clearSections } = usePageSections()

  const handleTabSelect = useCallback((id: string) => {
    setActiveSection(id)
    window.location.hash = id
  }, [])

  // Sync tab with URL hash (sidebar sub-links)
  useEffect(() => {
    const readHash = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash && PAGE_SECTIONS.some((s) => s.id === hash)) setActiveSection(hash)
    }
    readHash()
    window.addEventListener('hashchange', readHash)
    return () => window.removeEventListener('hashchange', readHash)
  }, [])

  // Register sidebar TOC
  useEffect(() => {
    setSections(PAGE_SECTIONS.map(({ id, label }) => ({ id, label })))
    return () => clearSections()
  }, [setSections, clearSections])

  // Load profile data
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMe()
        setIsEuCitizen((data?.profile?.isEuCitizen as string) ?? null)
        setHasCodiceFiscale((data?.profile?.hasCodiceFiscale as string) ?? null)
        setNationality((data?.profile?.nationality as string) ?? null)
      } catch { /* keep defaults */ }
    }
    load()
  }, [])

  // Load step checklist
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(CHECKLIST_STORAGE_KEY)
      if (saved) {
        try { setChecklistState(JSON.parse(saved)) } catch { setChecklistState({}) }
      }
    }
  }, [])

  const requirements = getStepRequirements('codice-fiscale') || []
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

  const isEU = isEuCitizen === 'yes'
  const isNonEU = isEuCitizen === 'no'

  // Documents for the checklist — personalised based on EU status
  const euDocs = [
    { key: 'passport-or-id', label: 'Valid passport or national ID card', required: true, note: 'Any EU member state ID is accepted' },
    { key: 'application-form', label: 'Completed application form AA4/8', required: true, note: 'Available at the office or downloadable from agenziaentrate.gov.it' },
  ]
  const nonEuDocs = [
    { key: 'passport', label: 'Valid passport', required: true, note: 'Must be valid for your full stay in Italy' },
    { key: 'visa', label: 'Valid visa (if required for your nationality)', required: true, note: 'Student visa, or national visa — whichever you hold' },
    { key: 'right-to-stay', label: 'Proof of right to stay in Italy', required: true, note: 'University enrollment letter, permesso di soggiorno, or Questura receipt' },
    { key: 'application-form', label: 'Completed application form AA4/8', required: true, note: 'Available at the office or downloadable from agenziaentrate.gov.it' },
  ]
  const docs = isNonEU ? nonEuDocs : euDocs

  const totalDocs = docs.filter((d) => d.required).length
  const checkedDocs = docs.filter((d) => d.required && docChecklist[d.key]).length
  const progressPct = totalDocs > 0 ? Math.round((checkedDocs / totalDocs) * 100) : 0

  return (
    <>
      {showModal && (
        <StepIntroModal
          stepTitle="Codice Fiscale"
          stepDescription="Get your Italian tax identification number — required for virtually everything in Italy."
          onConfirm={handleConfirm}
          onBack={handleBack}
        />
      )}
      <FeedbackWidget />
      <DashboardLayout>
        <StepPageLayout
          stepNumber={3}
          totalSteps={12}
          stepLabel="STEP 3"
          title="Codice Fiscale"
          subtitle="Your Italian tax code — essential for banking, housing, healthcare, and daily life."
          useGradientBar={true}
          userInfoTitle="This page is personalised based on your profile"
          userInfoSubtitle={
            isEuCitizen ? (
              <>
                Showing requirements for{' '}
                <strong className="font-semibold text-slate-700">
                  {isEU ? 'EU citizens' : 'non-EU citizens'}
                </strong>
                {'. '}Update in{' '}
                <a href="/dashboard/my-situation" className="text-blue-600 hover:underline">My Situation</a>.
              </>
            ) : (
              <>
                Set your nationality in{' '}
                <a href="/dashboard/my-situation" className="text-blue-600 hover:underline">My Situation</a>{' '}
                to see personalised document requirements.
              </>
            )
          }
          userInfoFields={[
            { key: 'nationality', label: 'Nationality' },
            { key: 'isEuCitizen', label: 'EU Citizen' },
            { key: 'hasCodiceFiscale', label: 'Has Codice Fiscale' },
            { key: 'destinationCity', label: 'City' },
          ]}
          checklistItems={checklistItems}
          onChecklistItemToggle={handleChecklistToggle}
          useGradientBar={true}
        >
          {/* ── Tab navigation ── */}
          <TabNavigation activeId={activeSection} onSelect={handleTabSelect} />

          {/* ── Overview ── */}
          {activeSection === 'overview' && (
            <>
              {/* Already done banner */}
              {hasCodiceFiscale === 'yes' && (
                <div className="col-span-full flex items-start gap-4 rounded-xl border border-emerald-300 bg-emerald-50 p-5 shadow-sm">
                  <CheckCircle2 size={26} className="flex-shrink-0 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="text-base font-semibold text-emerald-800">You already have your Codice Fiscale ✓</p>
                    <p className="mt-1 text-sm text-emerald-700">
                      Great — you're ahead of the game. Keep the card somewhere safe and make a few copies.
                      This page still has useful info about where it's needed and how to verify it.
                    </p>
                  </div>
                </div>
              )}

              <SectionCard title="What is a Codice Fiscale?" icon={<CreditCard size={18} />}>
                <p className="text-sm text-slate-600 leading-relaxed">
                  The <strong className="text-slate-800">codice fiscale</strong> (tax code / fiscal code) is a 16-character alphanumeric code
                  that uniquely identifies you in Italy's public administration. It's used in contracts, medical services,
                  banking, and almost every official procedure.
                </p>
                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-base tracking-widest text-slate-700 text-center">
                  MLNYSE17A41F205U
                </div>
                <p className="mt-2 text-center text-xs text-slate-400">Example codice fiscale</p>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { label: 'Cost',       value: 'Free',         sub: 'Always — no fee whatsoever' },
                    { label: 'Valid for',  value: 'Lifetime',     sub: 'Never expires, never changes' },
                    { label: 'Time',       value: '15–30 min',    sub: 'Issued same day at the office' },
                  ].map(({ label, value, sub }) => (
                    <div key={label} className="rounded-lg border border-slate-100 bg-white p-3 text-center shadow-sm">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
                      <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
                      <p className="text-xs text-slate-500">{sub}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-1">Fun fact</p>
                  <p className="text-sm text-slate-600">
                    Your code is derived from: your surname (3 letters), first name (3 letters), year + month + day of birth
                    (5 characters), place of birth (4 characters), and a checksum letter. <code className="rounded bg-blue-100 px-1 text-xs">MLNYSE17A41F205U</code>
                  </p>
                </div>

                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Where you'll need it</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {[
                      'Opening a bank account',
                      'Signing a rental contract',
                      'Enrolling at university',
                      'Getting a phone contract (SIM)',
                      'Registering with a GP / doctor',
                      'Tax filing & employment',
                    ].map((use) => (
                      <div key={use} className="flex items-center gap-2 rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                        <CheckCircle2 size={12} className="flex-shrink-0 text-emerald-400" />
                        {use}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick nav cards */}
                <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { id: 'apply',     label: 'Step-by-step guide', icon: <ClipboardList size={16} />, color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' },
                    { id: 'documents', label: 'Documents needed',   icon: <FileText size={16} />, color: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' },
                    { id: 'offices',   label: 'Offices in Milan',   icon: <MapPin size={16} />, color: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' },
                    { id: 'verify',    label: 'Verify your code',   icon: <ShieldCheck size={16} />, color: 'bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100' },
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

          {/* ── How to apply ── */}
          {activeSection === 'apply' && (
            <SectionCard title="How to get your Codice Fiscale" icon={<ClipboardList size={18} />}>
              {/* Important update notice */}
              <div className="mb-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-amber-500" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Important update (May 2025)</p>
                  <p className="mt-0.5 text-sm text-amber-700">
                    It is <strong>no longer possible</strong> to request a codice fiscale from an Italian Embassy
                    or Consulate abroad. It can <strong>only be requested upon arrival in Italy</strong>.
                    Source: <a href="https://studyandwork.yesmilano.it/en/study/how-to/get-italian-tax-code-codice-fiscale" target="_blank" rel="noopener noreferrer" className="underline">YesMilano International Desk</a>
                  </p>
                </div>
              </div>

              {/* Personalised step-by-step */}
              <div className="mb-5 space-y-3">
                {/* EU citizens */}
                {isEuCitizen !== 'no' && (
                  <ExpandableCard
                    title="How to apply (EU citizens)"
                    badge={<Badge label="EU" variant="eu" />}
                    defaultOpen={isEuCitizen === 'yes'}
                  >
                    <ol className="space-y-3">
                      <StepItem number={1} title="Gather documents" description="Bring your valid national ID card or passport. No additional proof of address is needed." />
                      <StepItem number={2} title="Go to any Agenzia delle Entrate office" description="No appointment is required for EU citizens — you can walk in during opening hours." />
                      <StepItem number={3} title="Fill out form AA4/8" description="Pick up the form at the counter or download and pre-fill it from the Revenue Agency website." />
                      <StepItem number={4} title="Submit and receive code" description="Hand in the form with your ID. The code is usually issued immediately or within a few days." />
                    </ol>
                    <div className="mt-4 flex items-start gap-2 rounded-md border border-blue-100 bg-blue-50 p-3 text-xs text-blue-700">
                      <Info size={13} className="mt-0.5 flex-shrink-0" />
                      You will receive a small plastic card — keep it safe. You can also use the code immediately via a printed receipt.
                    </div>
                  </ExpandableCard>
                )}

                {/* Non-EU citizens */}
                {isEuCitizen !== 'yes' && (
                  <ExpandableCard
                    title="How to apply (non-EU citizens)"
                    badge={<Badge label="Non-EU" variant="noneu" />}
                    defaultOpen={isEuCitizen === 'no'}
                  >
                    <p className="mb-3 text-slate-500">Non-EU students must prove their right to stay in Italy when applying.</p>
                    <ol className="space-y-3">
                      <StepItem number={1} title="Gather documents" description="Passport + valid visa (or national entry visa). Plus proof of right to stay: university enrollment letter, permesso di soggiorno, or Questura receipt from your permit application." />
                      <StepItem number={2} title="Go to an Agenzia delle Entrate office" description="Non-EU citizens may also apply at the Single Desk for Immigration (Sportello Unico per l'Immigrazione) if applicable to their situation." />
                      <StepItem number={3} title="Fill out form AA4/8" description="Pick up or pre-download the form. Fill in your personal data clearly in block capitals." />
                      <StepItem number={4} title="Submit documents and form" description="Hand everything to the clerk. The code is typically issued on the spot within the same appointment." />
                      <StepItem number={5} title="Receive your card" description="You'll get a printed receipt first, then a plastic codice fiscale card is mailed to your Italian address." />
                    </ol>
                    <div className="mt-4 flex items-start gap-2 rounded-md border border-amber-100 bg-amber-50 p-3 text-xs text-amber-700">
                      <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" />
                      If you don't yet have a permesso di soggiorno, your university enrollment letter is typically sufficient. Ask the Agenzia delle Entrate clerk — they are used to helping newly arrived students.
                    </div>
                  </ExpandableCard>
                )}

                <ExpandableCard
                  title="Through your university (recommended for new arrivals)"
                  badge={<Badge label="Tip" variant="note" />}
                >
                  <p>
                    Bocconi and other universities in Milan often assist students with codice fiscale applications
                    during orientation week. Check with the <strong>International Students Office</strong> as
                    soon as you arrive — this can save you the trip to the Agenzia delle Entrate.
                  </p>
                  <p className="mt-2 text-slate-500">
                    Bocconi international students: contact the International Affairs office at{' '}
                    <a href="https://www.unibocconi.eu/en/programs/student-services" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      unibocconi.eu
                    </a>.
                  </p>
                </ExpandableCard>
              </div>

              <div className="mt-2 flex items-start gap-2 rounded-lg border border-emerald-100 bg-emerald-50/60 px-4 py-3">
                <Lightbulb size={14} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                <p className="text-sm text-slate-600">
                  <strong className="text-slate-800">Tip:</strong> Arrive at the Agenzia delle Entrate before opening time,
                  especially at the start of the academic year (September–October). Queues can be very long mid-morning.
                </p>
              </div>
            </SectionCard>
          )}

          {/* ── Documents ── */}
          {activeSection === 'documents' && (
            <SectionCard title="Documents checklist" icon={<FileText size={18} />}>
              {!isEuCitizen && (
                <div className="mb-4 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <Info size={16} className="mt-0.5 flex-shrink-0 text-blue-500" />
                  <p className="text-sm text-blue-700">
                    Set your EU citizenship status in{' '}
                    <a href="/dashboard/my-situation" className="underline">My Situation</a>{' '}
                    to see personalised requirements. Currently showing requirements for EU citizens.
                  </p>
                </div>
              )}

              {isEuCitizen && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
                  <Info size={15} className="flex-shrink-0 text-slate-400" />
                  <span className="text-sm text-slate-600">
                    Showing documents for{' '}
                    <strong className="text-slate-800">{isEU ? 'EU citizens' : 'non-EU citizens'}</strong>
                    {nationality && ` (${nationality})`}.
                  </span>
                  <a href="/dashboard/my-situation" className="ml-auto text-xs text-blue-500 hover:underline">Update</a>
                </div>
              )}

              {/* Progress bar */}
              <div className="mb-5">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-800">{checkedDocs} of {totalDocs}</span> required documents ready
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                {progressPct === 100 && (
                  <p className="mt-1.5 text-xs font-medium text-emerald-600">All required documents ready — head to the office! 🎉</p>
                )}
              </div>

              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {isEU ? 'Required for EU citizens' : isNonEU ? 'Required for non-EU citizens' : 'Required documents'}
              </p>
              <div className="space-y-2">
                {docs.map((doc) => (
                  <DocItem
                    key={doc.key}
                    docKey={doc.key}
                    label={doc.label}
                    required={doc.required}
                    note={doc.note}
                    checked={!!docChecklist[doc.key]}
                    onChange={handleDocCheck}
                  />
                ))}
              </div>

              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Good to know</p>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                    You will receive a printed receipt immediately — you can use the code right away.
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                    The plastic card is mailed to your Italian address within a few weeks.
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                    Make several photocopies of the card once you receive it — many offices ask for copies.
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                    Signing a rental contract does <em>not</em> legally require a codice fiscale — though landlords may ask for it.
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {/* ── Offices ── */}
          {activeSection === 'offices' && (
            <SectionCard title="Agenzia delle Entrate offices in Milan" icon={<MapPin size={18} />}>
              <p className="mb-4 text-sm text-slate-500">
                All offices handle codice fiscale requests. You can walk in or book an appointment online.
                Arrive early — especially during September and October — to avoid long queues.
              </p>

              <div className="space-y-3">
                {[
                  {
                    name: 'Centro (City Centre)',
                    address: 'Via Carlo Freguglia, 1',
                    metro: 'Turati (M3)',
                    hours: 'Mon–Fri 8:30–12:30',
                    note: 'Closest to Bocconi campus. Busiest office — arrive before 8:30.',
                  },
                  {
                    name: 'Sempione',
                    address: 'Via Giuseppe Meda, 2',
                    metro: 'De Angeli (M1)',
                    hours: 'Mon–Fri 8:30–12:30',
                    note: 'Less crowded than the city centre office.',
                  },
                  {
                    name: 'Viale Fulvio Testi',
                    address: 'Viale Fulvio Testi, 6',
                    metro: 'Sesto Marelli (M1)',
                    hours: 'Mon–Fri 8:30–12:30',
                    note: 'North Milan. Good option if you live in the northern neighbourhoods.',
                  },
                  {
                    name: 'Portello',
                    address: 'Via Manfredini, 20',
                    metro: 'Lotto (M1)',
                    hours: 'Mon–Fri 8:30–12:30',
                    note: 'West Milan. Appointment recommended.',
                  },
                ].map((office) => (
                  <div key={office.name} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{office.name}</p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                          <MapPin size={11} className="flex-shrink-0" /> {office.address}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">Metro: {office.metro}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{office.hours}</p>
                      </div>
                    </div>
                    {office.note && (
                      <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
                        <Lightbulb size={11} className="mt-0.5 flex-shrink-0 text-amber-400" />
                        {office.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <a
                  href="https://prenot.agenziaentrate.gov.it/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  Book an appointment online <ExternalLink size={13} />
                </a>
                <a
                  href="http://www1.agenziaentrate.gov.it/indirizzi/agenzia/uffici_locali/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Find all offices (official) <ExternalLink size={13} />
                </a>
              </div>
            </SectionCard>
          )}

          {/* ── Verify ── */}
          {activeSection === 'verify' && (
            <SectionCard title="Verify & check your Codice Fiscale" icon={<ShieldCheck size={18} />}>
              <div className="space-y-3">
                <ExpandableCard title="Check if your codice fiscale is valid" badge={<Badge label="Online" variant="note" />}>
                  <p className="mb-3">
                    The Revenue Agency provides an online tool to verify that a codice fiscale is valid and
                    correctly formatted.
                  </p>
                  <a
                    href="https://telematici.agenziaentrate.gov.it/VerificaCF/Scegli.do?parameter=verificaCf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    Verify codice fiscale online <ExternalLink size={13} />
                  </a>
                </ExpandableCard>

                <ExpandableCard title="Calculate your code before going to the office" badge={<Badge label="Calculator" variant="note" />}>
                  <p className="mb-3">
                    You can pre-calculate what your codice fiscale <em>should</em> be using online calculators.
                    This is useful to fill in forms before you have the official card — but the official document
                    from Agenzia delle Entrate is still required for binding procedures.
                  </p>
                  <a
                    href="https://www.codicefiscale.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    CodiceFiscale.com calculator <ExternalLink size={13} />
                  </a>
                </ExpandableCard>

                <ExpandableCard title="Lost or stolen card" badge={<Badge label="Replacement" variant="warning" />}>
                  <p className="mb-3">
                    Your codice fiscale code itself never changes — only the physical card can be lost.
                    You can request a duplicate:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                      <span><strong>Online:</strong> Fill in the{' '}
                        <a href="https://www.agenziaentrate.gov.it/portale/richiesta-del-duplicato-del-tesserino-del-codice-fiscale" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          duplicate request form
                        </a>{' '}on the Revenue Agency website.
                      </span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                      <span><strong>In person:</strong> Visit any Agenzia delle Entrate office with a valid ID.</span>
                    </li>
                  </ul>
                </ExpandableCard>

                <ExpandableCard title="Incorrect data on your card" badge={<Badge label="Correction" variant="warning" />}>
                  <p>
                    If the data on your plastic card is wrong, bring a valid ID to any Agenzia delle Entrate
                    office and request a replacement. It's free and straightforward.
                  </p>
                </ExpandableCard>
              </div>
            </SectionCard>
          )}

          {/* ── FAQ ── */}
          {activeSection === 'faq' && (
            <SectionCard title="Frequently asked questions" icon={<HelpCircle size={18} />}>
              <div className="space-y-3">
                {[
                  {
                    q: 'Can I get the codice fiscale before arriving in Italy?',
                    a: 'No — as of May 2025, it is no longer possible to apply at Italian Embassies or Consulates abroad. You must request it after arriving in Italy.',
                  },
                  {
                    q: 'Do I need a permanent address in Italy to apply?',
                    a: 'No. A temporary address — such as a hotel, student dorm, or university accommodation letter — is sufficient. The plastic card will be mailed there.',
                  },
                  {
                    q: 'Can I use the codice fiscale immediately after getting a receipt?',
                    a: 'Yes. The printed receipt from the Agenzia delle Entrate contains your code, and you can use it right away. You don\'t need to wait for the plastic card.',
                  },
                  {
                    q: 'Is the codice fiscale mandatory to sign a rental contract?',
                    a: 'No — according to Italian law, a codice fiscale is not legally mandatory for registering a rental contract. However, many landlords will ask for it anyway.',
                  },
                  {
                    q: 'Will I need a new codice fiscale if I change jobs, city, or name?',
                    a: 'No. Your codice fiscale is assigned once and never changes, regardless of changes in your personal situation.',
                  },
                  {
                    q: 'Can I calculate my codice fiscale online and start using it before visiting the office?',
                    a: 'You can calculate it using a third-party tool. In practice, the calculated code is usually correct. However, only the official card issued by the Revenue Agency is legally valid for binding procedures.',
                  },
                  {
                    q: 'I need the codice fiscale to open a bank account, but the bank needs my address first — what do I do?',
                    a: 'Most banks accept a university address or student accommodation address for initial registration. Get your codice fiscale as early as possible after arriving to avoid a circular dependency.',
                  },
                ].map(({ q, a }) => (
                  <ExpandableCard key={q} title={q}>
                    <p>{a}</p>
                  </ExpandableCard>
                ))}
              </div>
            </SectionCard>
          )}

          {/* ── Key links ── */}
          {activeSection === 'links' && (
            <SectionCard title="Key links" icon={<LinkIcon size={18} />}>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  { label: 'Revenue Agency — Tax ID for foreigners (EN)', url: 'https://www.agenziaentrate.gov.it/portale/web/english/nse/individuals/tax-identification-number-for-foreign-citizens' },
                  { label: 'YesMilano — Step by step guide', url: 'https://studyandwork.yesmilano.it/en/study/how-to/get-italian-tax-code-codice-fiscale' },
                  { label: 'Book an appointment online', url: 'https://prenot.agenziaentrate.gov.it/' },
                  { label: 'Find Agenzia delle Entrate offices', url: 'http://www1.agenziaentrate.gov.it/indirizzi/agenzia/uffici_locali/' },
                  { label: 'Application form AA4/8 (download)', url: 'https://www.agenziaentrate.gov.it/portale/forms-versione-in-inglese-cittadini' },
                  { label: 'Verify codice fiscale online', url: 'https://telematici.agenziaentrate.gov.it/VerificaCF/Scegli.do?parameter=verificaCf' },
                  { label: 'Request duplicate card (lost/stolen)', url: 'https://www.agenziaentrate.gov.it/portale/richiesta-del-duplicato-del-tesserino-del-codice-fiscale' },
                  { label: 'Codice Fiscale calculator', url: 'https://www.codicefiscale.com/' },
                ].map(({ label, url }) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
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
