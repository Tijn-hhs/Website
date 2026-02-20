import { useState, useEffect, useCallback, useMemo } from 'react'
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
  Lightbulb,
  Link as LinkIcon,
  HelpCircle,
  ClipboardList,
  ShieldCheck,
  Users,
  BadgeCheck,
  Timer,
  RefreshCw,
  MapPin,
  Banknote,
} from 'lucide-react'

const CHECKLIST_STORAGE_KEY = 'dashboard-checklist:immigration-registration'

const ALL_SECTIONS = [
  { id: 'overview',   label: 'Overview',         icon: ShieldCheck },
  { id: 'noneu',      label: 'Permesso guide',    icon: ClipboardList },
  { id: 'eu',         label: 'Registration',      icon: Users },
  { id: 'documents',  label: 'Documents',         icon: FileText },
  { id: 'questura',   label: 'Police interview',  icon: BadgeCheck },
  { id: 'renewal',    label: 'Status & renewal',  icon: RefreshCw },
  { id: 'faq',        label: 'FAQ',               icon: HelpCircle },
  { id: 'links',      label: 'Key links',         icon: LinkIcon },
]

// Non-EU citizens don't see the EU tab; EU citizens don't see permesso/questura/renewal tabs
const NON_EU_SECTION_IDS = ['overview', 'noneu', 'documents', 'questura', 'renewal', 'faq', 'links']
const EU_SECTION_IDS     = ['overview', 'eu', 'documents', 'faq', 'links']

function getVisibleSections(isEuCitizen: string | null) {
  if (isEuCitizen === 'yes') return ALL_SECTIONS.filter((s) => EU_SECTION_IDS.includes(s.id))
  if (isEuCitizen === 'no')  return ALL_SECTIONS.filter((s) => NON_EU_SECTION_IDS.includes(s.id))
  return ALL_SECTIONS
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TabNavigation({ activeId, onSelect, sections }: { activeId: string; onSelect: (id: string) => void; sections: typeof ALL_SECTIONS }) {
  return (
    <div className="col-span-full">
      <nav className="flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm scrollbar-hide">
        {sections.map(({ id, label, icon: Icon }) => {
          const isActive = activeId === id
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={`flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                isActive ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
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

function Badge({ label, variant }: { label: string; variant: 'required' | 'optional' | 'note' | 'warning' | 'eu' | 'noneu' | 'tip' }) {
  const styles: Record<string, string> = {
    required: 'bg-red-50 text-red-700 border-red-200',
    optional: 'bg-slate-100 text-slate-600 border-slate-200',
    note:     'bg-blue-50 text-blue-700 border-blue-200',
    warning:  'bg-amber-50 text-amber-700 border-amber-200',
    eu:       'bg-indigo-50 text-indigo-700 border-indigo-200',
    noneu:    'bg-orange-50 text-orange-700 border-orange-200',
    tip:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[variant]}`}>
      {label}
    </span>
  )
}

function ExpandableCard({ title, badge, defaultOpen = false, children }: { title: string; badge?: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode }) {
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
        <ChevronDown size={16} className={`flex-shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="border-t border-slate-200 px-4 pb-4 pt-3 text-sm text-slate-600">
          {children}
        </div>
      )}
    </div>
  )
}

function StepItem({ number, title, description, warning, tip }: { number: number; title: string; description: string; warning?: string; tip?: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white mt-0.5">
        {number}
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        {warning && (
          <div className="mt-2 flex items-start gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" /> {warning}
          </div>
        )}
        {tip && (
          <div className="mt-2 flex items-start gap-1.5 rounded-md border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-xs text-slate-600">
            <Lightbulb size={12} className="mt-0.5 flex-shrink-0 text-emerald-500" /> {tip}
          </div>
        )}
      </div>
    </li>
  )
}

function DocItem({
  label, required, note, checked, docKey, onChange,
}: { label: string; required: boolean; note?: string; checked: boolean; docKey: string; onChange: (key: string, val: boolean) => void }) {
  return (
    <div className={`rounded-lg border transition-colors ${checked ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-start gap-3 px-4 py-3">
        <button onClick={() => onChange(docKey, !checked)} className="mt-0.5 flex-shrink-0 focus:outline-none">
          {checked
            ? <CheckCircle2 size={18} className="text-emerald-500" />
            : <Circle size={18} className="text-slate-300 hover:text-slate-500 transition-colors" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-medium ${checked ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{label}</p>
          {note && <p className="mt-0.5 text-xs text-slate-400">{note}</p>}
        </div>
        {required ? <Badge label="Required" variant="required" /> : <Badge label="Optional" variant="optional" />}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ImmigrationRegistrationPage() {
  const { showModal, handleConfirm, handleBack } = useStepIntro('immigration-registration')
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({})
  const [docChecklist, setDocChecklist] = useState<Record<string, boolean>>({})
  const [activeSection, setActiveSection] = useState('overview')
  const [isEuCitizen, setIsEuCitizen] = useState<string | null>(null)
  const [hasResidencePermit, setHasResidencePermit] = useState<string | null>(null)
  const [nationality, setNationality] = useState<string | null>(null)
  const { setSections, clearSections } = usePageSections()

  const visibleSections = useMemo(() => getVisibleSections(isEuCitizen), [isEuCitizen])

  const handleTabSelect = useCallback((id: string) => {
    setActiveSection(id)
    window.location.hash = id
  }, [])

  useEffect(() => {
    const readHash = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash && ALL_SECTIONS.some((s) => s.id === hash)) setActiveSection(hash)
    }
    readHash()
    window.addEventListener('hashchange', readHash)
    return () => window.removeEventListener('hashchange', readHash)
  }, [])

  useEffect(() => {
    setSections(visibleSections.map(({ id, label }) => ({ id, label })))
    return () => clearSections()
  }, [setSections, clearSections, visibleSections])

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMe()
        const euStatus = (data?.profile?.isEuCitizen as string) ?? null
        setIsEuCitizen(euStatus)
        setHasResidencePermit((data?.profile?.hasResidencePermit as string) ?? null)
        setNationality((data?.profile?.nationality as string) ?? null)
        // Jump straight to the relevant guide on first load
        if (euStatus === 'yes') setActiveSection('eu')
        if (euStatus === 'no')  setActiveSection('noneu')
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

  const requirements = getStepRequirements('immigration-registration') || []
  const checklistItems = requirements.map((req) => ({
    ...req,
    completed: checklistState[req.id] || false,
  }))

  const handleChecklistToggle = (id: string, completed: boolean) => {
    const newState = { ...checklistState, [id]: completed }
    setChecklistState(newState)
    if (typeof window !== 'undefined') window.localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(newState))
  }

  const handleDocCheck = (key: string, value: boolean) => setDocChecklist((prev) => ({ ...prev, [key]: value }))

  const isEU = isEuCitizen === 'yes'
  const isNonEU = isEuCitizen === 'no'

  const nonEuDocs = [
    { key: 'application-form', label: 'Completed application form (from kit giallo)', required: true, note: 'Sign and date at the Post Office — do NOT sign before arriving' },
    { key: 'passport-copy', label: 'Photocopy of passport — personal data + visa page', required: true, note: 'Also bring the original to the Post Office' },
    { key: 'visa-copy', label: 'Photocopy of student visa (national "D" visa)', required: true, note: 'Must be valid for Italy / Schengen area' },
    { key: 'admission-letter', label: 'Photocopy of admission letter (endorsed by Italian Embassy in your home country)', required: true, note: 'The letter stamped by the Italian Embassy/Consulate during your visa application' },
    { key: 'enrollment-cert', label: 'Photocopy of university enrollment certification', required: true, note: 'Issued by your university — confirms you are officially enrolled' },
    { key: 'health-insurance', label: 'Photocopy of health insurance policy or payment receipt', required: true, note: 'Must be valid in Italy for the full duration of your permit; private insurance OR NHS registration' },
    { key: 'financial-proof', label: 'Photocopy of financial statement (≈ €6,600/year)', required: true, note: 'Recent bank statement or letter of financial good standing — must clearly show your name' },
    { key: 'proof-of-address', label: 'Photocopy of proof of address (housing contract / university declaration)', required: false, note: 'Optional — only attach if you are sure it will be your address at the time of the Questura appointment' },
    { key: 'marca-da-bollo', label: '€16.00 revenue stamp (marca da bollo)', required: true, note: 'Buy at any tobacco shop (tabacchi) before going to the Post Office' },
    { key: 'postal-payment', label: 'Proof of payment of €70.46 postal fee', required: true, note: 'Paid at the Post Office during submission — for permits up to 1 year (€80.46 for 1–2 years)' },
    { key: 'application-fee', label: '€30 application fee', required: true, note: 'Paid at the Post Office during submission' },
    { key: 'passport-photos', label: '4 passport-size photographs', required: true, note: 'Standard photo booth photos; bring extra just in case' },
  ]

  const euDocs = [
    { key: 'valid-id', label: 'Valid national ID card or passport', required: true, note: 'Any EU/EEA member state document is accepted' },
    { key: 'enrollment-proof', label: 'University enrollment certificate', required: true, note: 'Proof that you are a registered student' },
    { key: 'address-proof', label: 'Proof of address in Italy', required: true, note: 'Rental contract, university dorm confirmation, or Italian host\'s declaration' },
    { key: 'financial-means', label: 'Proof of sufficient financial means', required: false, note: 'May be requested at the Anagrafe — bank statement or family support letter' },
    { key: 'health-insurance', label: 'Health insurance or European Health Insurance Card (EHIC)', required: false, note: 'Required if you cannot access the Italian NHS yet' },
  ]

  const activeDocs = isNonEU ? nonEuDocs : euDocs
  const reqDocs = activeDocs.filter((d) => d.required)
  const optDocs = activeDocs.filter((d) => !d.required)
  const totalReq = reqDocs.length
  const checkedReq = reqDocs.filter((d) => docChecklist[d.key]).length
  const progressPct = totalReq > 0 ? Math.round((checkedReq / totalReq) * 100) : 0

  return (
    <>
      {showModal && (
        <StepIntroModal
          stepTitle="Residence Permit"
          stepDescription="Non-EU citizens must apply for their permesso di soggiorno within 8 working days of arriving in Italy."
          onConfirm={handleConfirm}
          onBack={handleBack}
        />
      )}
      <FeedbackWidget />
      <DashboardLayout>
        <StepPageLayout
          stepNumber={5}
          totalSteps={13}
          stepLabel="STEP 5"
          title="Residence Permit"
          subtitle="Legalise your stay in Italy — required for non-EU citizens within 8 working days of arrival."
          useGradientBar={true}
          userInfoTitle="This page is personalised based on your profile"
          userInfoSubtitle={
            isEuCitizen ? (
              <>
                Showing guide for{' '}
                <strong className="font-semibold text-slate-700">
                  {isEU ? 'EU citizens' : 'non-EU citizens'}
                </strong>
                {'. '}Update in{' '}
                <a href="/dashboard/my-situation" className="text-blue-600 hover:underline">My Situation</a>.
              </>
            ) : (
              <>
                Set your EU citizenship status in{' '}
                <a href="/dashboard/my-situation" className="text-blue-600 hover:underline">My Situation</a>{' '}
                to see personalised guidance.
              </>
            )
          }
          userInfoFields={[
            { key: 'nationality', label: 'Nationality' },
            { key: 'isEuCitizen', label: 'EU Citizen' },
            { key: 'hasResidencePermit', label: 'Has Residence Permit' },
            { key: 'destinationCity', label: 'City' },
          ]}
          checklistItems={checklistItems}
          onChecklistItemToggle={handleChecklistToggle}
        >
          {/* ── Tab navigation ── */}
          <TabNavigation activeId={activeSection} onSelect={handleTabSelect} sections={visibleSections} />

          {/* ═══════════════════════════════════════════════════════════════════
              OVERVIEW
          ═══════════════════════════════════════════════════════════════════ */}
          {activeSection === 'overview' && (
            <>
              {/* Already done banner */}
              {hasResidencePermit === 'yes' && (
                <div className="col-span-full flex items-start gap-4 rounded-xl border border-emerald-300 bg-emerald-50 p-5 shadow-sm">
                  <CheckCircle2 size={26} className="flex-shrink-0 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="text-base font-semibold text-emerald-800">You already have your Residence Permit ✓</p>
                    <p className="mt-1 text-sm text-emerald-700">
                      Great work. Check the renewal section to make sure you renew in time when it expires — typically 60–90 days before the expiry date.
                    </p>
                    <button onClick={() => handleTabSelect('renewal')} className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors">
                      Renewal guide →
                    </button>
                  </div>
                </div>
              )}

              {/* EU personalised shortcut */}


              <SectionCard title="What is a Residence Permit?" icon={<ShieldCheck size={18} />}>
                <p className="text-sm text-slate-600 leading-relaxed">
                  The <strong className="text-slate-800">Permesso di Soggiorno</strong> (residence permit / permit of stay) is the
                  document required for non-EU nationals to legally stay in Italy for more than 90 days.
                  Without it, your stay is technically illegal even if you hold a valid visa.
                </p>

                {/* Key facts */}
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { icon: <Timer size={16} />, label: 'Deadline', value: '8 working days', sub: 'From arrival in Italy — do not delay' },
                    { icon: <Banknote size={16} />, label: 'Total fees', value: '≈ €116', sub: '€16 stamp + €70.46 postal + €30 app fee' },
                    { icon: <MapPin size={16} />, label: 'Where to apply', value: 'Post Office', sub: 'Enabled Poste Italiane only (lista sportelli amici)' },
                  ].map(({ icon, label, value, sub }) => (
                    <div key={label} className="rounded-lg border border-slate-100 bg-white p-3 text-center shadow-sm">
                      <div className="flex justify-center mb-1 text-slate-400">{icon}</div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
                      <p className="mt-0.5 text-base font-bold text-slate-900">{value}</p>
                      <p className="text-xs text-slate-500">{sub}</p>
                    </div>
                  ))}
                </div>

                {/* Visa vs Permit explainer */}
                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Visa vs Permesso di Soggiorno</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-3">
                      <p className="text-xs font-semibold text-blue-800 mb-1">Student Visa (Type D)</p>
                      <p className="text-xs text-slate-600">Issued by the Italian Embassy or Consulate in your home country. Lets you enter Italy and the Schengen area.</p>
                    </div>
                    <div className="rounded-lg border border-violet-100 bg-violet-50/40 p-3">
                      <p className="text-xs font-semibold text-violet-800 mb-1">Permesso di Soggiorno</p>
                      <p className="text-xs text-slate-600">Applied for <em>after</em> arriving in Italy. Authorises your continued legal stay in Italy beyond visa entry.</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                    <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" />
                    You need <strong>both</strong>: the visa to enter, and the permesso to stay. Even if your visa is valid, you must apply for the permesso within 8 working days.
                  </div>
                </div>

                {/* Who needs it? */}
                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Who needs a Permesso di Soggiorno?</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="flex items-start gap-3 rounded-lg border border-orange-100 bg-orange-50/40 p-3">
                      <AlertTriangle size={15} className="mt-0.5 flex-shrink-0 text-orange-400" />
                      <div>
                        <p className="text-xs font-semibold text-orange-800">Non-EU citizens — Required</p>
                        <p className="text-xs text-slate-600 mt-0.5">If you are a non-EU national staying longer than 90 days, a permesso is mandatory.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg border border-indigo-100 bg-indigo-50/40 p-3">
                      <CheckCircle2 size={15} className="mt-0.5 flex-shrink-0 text-indigo-400" />
                      <div>
                        <p className="text-xs font-semibold text-indigo-800">EU citizens — Not required</p>
                        <p className="text-xs text-slate-600 mt-0.5">EU/EEA citizens are free to live and study in Italy without a residence permit. A municipal registration is recommended for stays {'>'} 3 months.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick nav cards */}
                <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { id: 'noneu', label: 'Step-by-step guide', icon: <ClipboardList size={16} />, color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' },
                    { id: 'documents', label: 'Documents needed', icon: <FileText size={16} />, color: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' },
                    { id: 'questura', label: 'Police interview', icon: <BadgeCheck size={16} />, color: 'bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100' },
                    { id: 'eu', label: 'EU citizens', icon: <Users size={16} />, color: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100' },
                  ].map(({ id, label, icon, color }) => (
                    <button key={id} onClick={() => handleTabSelect(id)} className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-colors ${color}`}>
                      {icon}
                      {label}
                    </button>
                  ))}
                </div>
              </SectionCard>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              NON-EU STEP-BY-STEP
          ═══════════════════════════════════════════════════════════════════ */}
          {activeSection === 'noneu' && (
            <SectionCard title="Non-EU students: Step-by-step guide" icon={<ClipboardList size={18} />}>
              <div className="mb-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-amber-500" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Apply within 8 working days of arrival</p>
                  <p className="mt-0.5 text-sm text-amber-700">
                    Weekends and public holidays do not count. Missing this deadline can jeopardise your legal status.
                    Start immediately after arriving.
                  </p>
                </div>
              </div>

              <ol className="space-y-5">
                <StepItem
                  number={1}
                  title="Get the 'kit giallo' (yellow application kit)"
                  description="Pick up the yellow envelope application kit from your university's International Student Office or from an enabled Poste Italiane office."
                  tip="Bocconi's International Affairs Office is your easiest starting point. They can also help you fill out the form correctly."
                />
                <StepItem
                  number={2}
                  title="Fill out the application form"
                  description="Complete the application form inside the kit. The International Student Office will help you fill it out correctly. Write in block capitals."
                  warning="Do NOT sign or date the form at home — you will sign and date it at the Post Office in front of the clerk."
                  tip="Write an Italian mobile number if you have one — you'll receive SMS updates about your application status. Your codice fiscale is NOT mandatory at this stage."
                />
                <StepItem
                  number={3}
                  title="Gather your documents"
                  description="Prepare photocopies of all required documents (see the Documents tab). Also bring all originals. Buy a €16 marca da bollo from a tobacco shop."
                  tip="Make extra copies of everything. Post office clerks often ask for additional copies and will not provide them for you."
                />
                <StepItem
                  number={4}
                  title="Go to an enabled Post Office (Poste Italiane — Sportello Amico)"
                  description="Submit your application at one of the enabled Post Offices. Not all branches accept residence permit applications — check the official list."
                  warning="Queue early. These offices can have very long waiting times, especially at the start of the academic year (September–October)."
                />
                <StepItem
                  number={5}
                  title="Pay the fees at the Post Office"
                  description="At the Post Office you will pay: €70.46 postal fee for the electronic permit (€80.46 if your permit is for more than 1 year and up to 2 years), plus the €30 application fee. The €16 marca da bollo is attached to the form."
                  tip="Bring sufficient cash. Some Post Offices also accept card payments, but cash is the safest option."
                />
                <StepItem
                  number={6}
                  title="Receive your receipt (Ricevuta mod. 22A) + Questura appointment"
                  description="After submitting, you receive: a receipt (Ricevuta mod. 22A) and a letter stating your appointment date, time, and location at the Police Headquarters (Questura)."
                  warning="Keep the receipt with you at ALL times until your card is issued. It is your legal proof of stay during the waiting period."
                  tip="Take a photo of the receipt and store it in the cloud as backup."
                />
                <StepItem
                  number={7}
                  title="Attend the police interview at the Questura"
                  description="Go to the Questura (Immigration Office) on the date and time specified in your letter. Bring all your original documents, copies, and the receipt. You will be fingerprinted."
                  tip="Arrive early. Dress neatly. The interview is routine for students — you will be asked to confirm your personal data and study purpose."
                />
                <StepItem
                  number={8}
                  title="Collect your Permesso di Soggiorno card"
                  description="You will be notified via SMS or mail when your card is ready. Go to the designated location (stated in the notification) and bring: your valid passport + original Ricevuta mod. 22A."
                  tip="Processing times vary — typically 1 to 6 months. Your receipt remains valid throughout this period."
                />
              </ol>

              <div className="mt-6 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Special cases</p>
                <ExpandableCard title="Converting a different type of permit (e.g., tourist → student)" badge={<Badge label="Conversion" variant="note" />}>
                  <p className="mb-2">
                    If you entered Italy on a different visa type (e.g., tourist/Schengen visa) and were later admitted to a university,
                    you generally cannot convert from within Italy — you must return to your home country and apply for a student visa
                    at the Italian Embassy or Consulate.
                  </p>
                  <p>Consult your university's International Office or an immigration lawyer before attempting this process.</p>
                </ExpandableCard>

                <ExpandableCard title="Declaration of presence (Dichiarazione di Presenza)" badge={<Badge label="Short stays" variant="note" />}>
                  <p className="mb-2">
                    If you are staying in Italy for less than 90 days (e.g., a short exchange), you may need to submit a
                    <strong> Dichiarazione di Presenza</strong> (declaration of presence) to the local Police Headquarters
                    within 8 working days of arrival.
                  </p>
                  <p>
                    If you are staying in a hotel or university dorm, this is usually handled automatically on your behalf.
                    If you are staying with friends/family, the host must submit a declaration at the local police station.
                  </p>
                </ExpandableCard>

                <ExpandableCard title="I lost my receipt — what do I do?" badge={<Badge label="Emergency" variant="warning" />}>
                  <p>
                    Contact the Post Office where you submitted your application immediately and explain the situation.
                    They can issue a duplicate receipt (doppione). Also contact your university's International Office
                    as they can often assist you navigate this.
                  </p>
                </ExpandableCard>
              </div>
            </SectionCard>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              EU CITIZENS
          ═══════════════════════════════════════════════════════════════════ */}
          {activeSection === 'eu' && (
            <SectionCard title="EU & EEA citizens: What you need to do" icon={<Users size={18} />}>
              <div className="mb-5 flex items-start gap-3 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                <Info size={16} className="mt-0.5 flex-shrink-0 text-indigo-500" />
                <div>
                  <p className="text-sm font-semibold text-indigo-800">No permesso di soggiorno required for EU/EEA citizens</p>
                  <p className="mt-0.5 text-sm text-indigo-700">
                    EU citizens have freedom of movement and do not need a residence permit to live or study in Italy.
                    However, for stays longer than 3 months, you should register with the local municipality.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">For stays up to 3 months</p>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    <p>
                      No formal registration is required. Keep your valid EU/EEA ID card or passport with you.
                      If you are staying with a private host, they may need to file a <strong>Dichiarazione di Presenza</strong> at
                      the local police station on your behalf.
                    </p>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">For stays longer than 3 months (recommended)</p>
                  <ol className="space-y-4">
                    <StepItem
                      number={1}
                      title="Register at the Anagrafe (Registry Office)"
                      description="Go to the Anagrafe (Municipal Registry Office) in Milan to register your residence. This is the 'Iscrizione Anagrafica' — it's voluntary but highly recommended."
                      tip="Registration gives you access to the NHS, makes opening a bank account easier, and is required for some public services."
                    />
                    <StepItem
                      number={2}
                      title="Bring required documents"
                      description="Valid EU/EEA passport or national ID card, university enrollment certificate, proof of address in Italy (rental contract, dorm confirmation, or host's declaration), and proof of sufficient financial means (optional)."
                    />
                    <StepItem
                      number={3}
                      title="Book an appointment or walk in"
                      description="The Anagrafe in Milan accepts appointments online via the city's portal. Some offices also accept walk-ins during specific hours."
                      tip="Book early — appointments can be several weeks out, especially at the start of term."
                    />
                    <StepItem
                      number={4}
                      title="Receive Attestato di Iscrizione Anagrafica"
                      description="After registering, you receive a certificate of registration (Attestato di Iscrizione Anagrafica). Keep this document — it proves your registered residence in Milan."
                    />
                  </ol>
                </div>

                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Why register even if it's optional?</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {[
                      { t: 'Access to NHS (SSN)', d: 'Register with the Italian National Health Service as a resident' },
                      { t: 'Easier banking', d: 'Some banks ask for proof of registration when opening an account' },
                      { t: 'Utility contracts', d: 'Easier to set up gas, electricity, and internet in your name' },
                      { t: 'Student discounts', d: 'Some services offer better rates to registered Milan residents' },
                    ].map(({ t, d }) => (
                      <div key={t} className="flex items-start gap-2 rounded-md border border-emerald-100 bg-emerald-50/50 p-3 text-xs text-slate-600">
                        <CheckCircle2 size={12} className="mt-0.5 flex-shrink-0 text-emerald-400" />
                        <div><strong className="text-slate-800">{t}</strong><br />{d}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 mt-2">
                  <ExpandableCard title="Where is the Anagrafe in Milan?" badge={<Badge label="Milan" variant="eu" />}>
                    <div className="space-y-3">
                      {[
                        { name: 'Sportello Unico Cittadini — Via Larga', address: 'Via Larga, 12 (City Centre)', metro: 'Missori (M3)', hours: 'Mon–Fri 8:15–12:00' },
                        { name: 'NIL Municipio 1 — Via Orti', address: 'Via degli Orti, 1', metro: 'Crocetta (M3)', hours: 'Mon, Wed 9:00–12:00 / Tue, Thu 14:00–16:00' },
                      ].map((o) => (
                        <div key={o.name} className="rounded-md border border-slate-100 bg-white p-3">
                          <p className="text-sm font-semibold text-slate-800">{o.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5"><MapPin size={10} className="inline mr-1" />{o.address}</p>
                          <p className="text-xs text-slate-500">Metro: {o.metro}</p>
                          <p className="text-xs text-slate-500">{o.hours}</p>
                        </div>
                      ))}
                      <a href="https://www.comune.milano.it/servizi/iscrizione-allanagrafe-per-cittadini-ue" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                        Full list & online booking <ExternalLink size={12} />
                      </a>
                    </div>
                  </ExpandableCard>
                </div>
              </div>
            </SectionCard>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              DOCUMENTS
          ═══════════════════════════════════════════════════════════════════ */}
          {activeSection === 'documents' && (
            <SectionCard title="Documents checklist" icon={<FileText size={18} />}>
              {!isEuCitizen && (
                <div className="mb-4 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <Info size={16} className="mt-0.5 flex-shrink-0 text-blue-500" />
                  <p className="text-sm text-blue-700">
                    Set your EU citizenship status in{' '}
                    <a href="/dashboard/my-situation" className="underline">My Situation</a>{' '}
                    to see personalised requirements. Currently showing non-EU student documents.
                  </p>
                </div>
              )}
              {isEuCitizen && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
                  <Info size={15} className="flex-shrink-0 text-slate-400" />
                  <span className="text-sm text-slate-600">
                    Showing documents for{' '}
                    <strong className="text-slate-800">{isEU ? 'EU citizens (Anagrafe registration)' : 'non-EU citizens (Permesso di Soggiorno)'}</strong>
                    {nationality && ` · ${nationality}`}.
                  </span>
                  <a href="/dashboard/my-situation" className="ml-auto text-xs text-blue-500 hover:underline">Update</a>
                </div>
              )}

              {/* Progress bar */}
              <div className="mb-5">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-800">{checkedReq} of {totalReq}</span> required documents ready
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-emerald-400 transition-all duration-500" style={{ width: `${progressPct}%` }} />
                </div>
                {progressPct === 100 && (
                  <p className="mt-1.5 text-xs font-medium text-emerald-600">All required documents ready — head to the Post Office! 🎉</p>
                )}
              </div>

              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Required documents</p>
              <div className="mb-5 space-y-2">
                {reqDocs.map((doc) => (
                  <DocItem key={doc.key} docKey={doc.key} label={doc.label} required={doc.required} note={doc.note} checked={!!docChecklist[doc.key]} onChange={handleDocCheck} />
                ))}
              </div>

              {optDocs.length > 0 && (
                <>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Optional / may be requested</p>
                  <div className="space-y-2">
                    {optDocs.map((doc) => (
                      <DocItem key={doc.key} docKey={doc.key} label={doc.label} required={doc.required} note={doc.note} checked={!!docChecklist[doc.key]} onChange={handleDocCheck} />
                    ))}
                  </div>
                </>
              )}

              {isNonEU && (
                <div className="mt-5 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Important notes</p>
                  {[
                    'Always bring both originals AND photocopies — they keep the copies, you leave with the originals.',
                    'Make extra copies of everything. The Post Office clerk may request additional copies on the spot.',
                    'The proof of address is OPTIONAL at submission — only include it if your address is confirmed for the date of the Questura appointment.',
                    'Your codice fiscale is NOT required at this stage — don\'t delay your application waiting for it.',
                    'The application form must be signed and dated at the Post Office — not before.',
                    'Photocopy all pages of your passport that have stamps, visas, or personal data.',
                  ].map((note, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                      {note}
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              POLICE INTERVIEW
          ═══════════════════════════════════════════════════════════════════ */}
          {activeSection === 'questura' && (
            <SectionCard title="Police interview at the Questura" icon={<BadgeCheck size={18} />}>
              <p className="mb-4 text-sm text-slate-500">
                After submitting your application at the Post Office, you will receive an appointment letter for an interview
                at the <strong className="text-slate-800">Questura di Milano — Ufficio Immigrazione</strong>.
                This is a mandatory step — do not miss it.
              </p>

              <div className="mb-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-800 mb-1">Questura di Milano — Immigration Office</p>
                <p className="text-xs text-slate-500"><MapPin size={11} className="inline mr-1" />Via Montebello, 26, Milan</p>
                <p className="text-xs text-slate-500">Metro: Turati (M3) or Repubblica (M2/M3)</p>
                <p className="text-xs text-slate-500">Hours: as stated in your appointment letter</p>
              </div>

              <div className="space-y-3">
                <ExpandableCard title="What to bring to the Questura appointment" badge={<Badge label="Important" variant="warning" />} defaultOpen={true}>
                  <ul className="space-y-2">
                    {[
                      { item: 'Original passport', note: 'With valid student visa and all stamps' },
                      { item: 'Original receipt (Ricevuta mod. 22A)', note: 'The one you received at the Post Office — required proof that you applied on time' },
                      { item: 'Photocopies of ALL documents submitted at the Post Office', note: 'Have an extra set just in case' },
                      { item: 'Original admission letter / enrollment certificate', note: 'From Bocconi or your university' },
                      { item: 'Original health insurance policy', note: 'Or NHS registration if you have already registered' },
                      { item: 'Updated proof of address (if you now have a stable address)', note: 'Rental contract, or university dorm contract' },
                      { item: '4 passport-size photographs', note: 'Standard size — same as on your passport' },
                      { item: 'Original financial statement', note: 'Recent bank statement or letter of financial good standing' },
                    ].map(({ item, note }) => (
                      <li key={item} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0 text-emerald-400" />
                        <div>
                          <span className="font-medium text-slate-800">{item}</span>
                          <span className="text-slate-500"> — {note}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </ExpandableCard>

                <ExpandableCard title="What happens at the appointment?">
                  <ol className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2"><span className="font-semibold text-slate-800 flex-shrink-0">1.</span> Check in at the front desk and hand over your appointment letter.</li>
                    <li className="flex items-start gap-2"><span className="font-semibold text-slate-800 flex-shrink-0">2.</span> A police officer reviews your documents and confirms your personal data.</li>
                    <li className="flex items-start gap-2"><span className="font-semibold text-slate-800 flex-shrink-0">3.</span> Fingerprints are taken (biometric data for the permit card).</li>
                    <li className="flex items-start gap-2"><span className="font-semibold text-slate-800 flex-shrink-0">4.</span> Your photo is taken for the permit card.</li>
                    <li className="flex items-start gap-2"><span className="font-semibold text-slate-800 flex-shrink-0">5.</span> You receive a new receipt or updated document confirming the appointment was completed.</li>
                    <li className="flex items-start gap-2"><span className="font-semibold text-slate-800 flex-shrink-0">6.</span> You wait to be notified when the card is ready for collection (typically 1–6 months).</li>
                  </ol>
                  <div className="mt-3 flex items-start gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                    <Info size={12} className="mt-0.5 flex-shrink-0" />
                    The interview is standard procedure for students — it typically takes 15–30 minutes. Be polite and cooperative.
                  </div>
                </ExpandableCard>

                <ExpandableCard title="I missed my appointment — what do I do?" badge={<Badge label="Emergency" variant="warning" />}>
                  <p className="mb-2">
                    Contact the Questura Immigration Office as soon as possible to explain the situation and reschedule.
                    Also inform your university's International Office — they can often help mediate.
                  </p>
                  <p>
                    In general, one missed appointment does not invalidate your application, but repeated absences can.
                    Always reschedule promptly.
                  </p>
                </ExpandableCard>

                <ExpandableCard title="Check your application status online">
                  <p className="mb-3">
                    After your Questura appointment you can track the status of your application online using your fiscal code
                    or the receipt number.
                  </p>
                  <a href="https://questure.poliziadistato.it/stranieri" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors">
                    Check status — Polizia di Stato <ExternalLink size={13} />
                  </a>
                </ExpandableCard>
              </div>
            </SectionCard>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              STATUS & RENEWAL
          ═══════════════════════════════════════════════════════════════════ */}
          {activeSection === 'renewal' && (
            <SectionCard title="Status & Renewal" icon={<RefreshCw size={18} />}>
              <div className="space-y-3">
                <ExpandableCard title="How long is the permit valid?" badge={<Badge label="Validity" variant="note" />} defaultOpen={true}>
                  <div className="space-y-2 text-sm text-slate-600">
                    <p>For student residence permits, validity is typically tied to your course duration, up to a maximum of:</p>
                    <ul className="space-y-1 ml-4 list-disc">
                      <li><strong>1 year</strong> for most standard academic programs</li>
                      <li><strong>Up to 2 years</strong> for multi-year programs (e.g., Bachelor's or Master's degree)</li>
                    </ul>
                    <p className="mt-2">The permit must be renewed before it expires to maintain legal status in Italy.</p>
                  </div>
                </ExpandableCard>

                <ExpandableCard title="When and how to renew" badge={<Badge label="Action required" variant="warning" />}>
                  <ol className="space-y-3 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-slate-800 flex-shrink-0">1.</span>
                      Start the renewal process <strong>60–90 days before expiry</strong>. Waiting until the last minute risks gaps in legal status.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-slate-800 flex-shrink-0">2.</span>
                      Obtain a new kit giallo from your university or an enabled Post Office.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-slate-800 flex-shrink-0">3.</span>
                      Gather updated documents: renewed enrollment certificate, updated financial proof, updated health insurance,
                      new passport photos, and your current (expiring) permesso card or receipt.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-slate-800 flex-shrink-0">4.</span>
                      Submit the renewal application at an enabled Post Office with the same fees as the initial application.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-slate-800 flex-shrink-0">5.</span>
                      Attend the new Questura appointment and collect the renewed card.
                    </li>
                  </ol>
                  <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                    If your permit expires before the renewal is processed, keep the renewal receipt — it serves as proof of legal stay while the new card is being issued.
                  </div>
                </ExpandableCard>

                <ExpandableCard title="Check your application status online">
                  <p className="mb-3">
                    You can track the status of your residence permit application (both initial and renewal) using the
                    official Polizia di Stato portal. You will need your fiscal code or receipt number.
                  </p>
                  <a href="https://questure.poliziadistato.it/stranieri" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors">
                    Check status — Polizia di Stato <ExternalLink size={13} />
                  </a>
                </ExpandableCard>

                <ExpandableCard title="Converting permit type (e.g., student → work)" badge={<Badge label="Conversion" variant="note" />}>
                  <p className="mb-2">
                    Converting your residence permit type (e.g., from study to work) is a separate and more complex process.
                    It typically requires:
                  </p>
                  <ul className="space-y-1.5 text-sm">
                    {[
                      'A valid job offer or employment contract',
                      'The employer submitting a request via the Sportello Unico per l\'Immigrazione at the Prefecture',
                      'Meeting the quota requirements (numbers flussi) for work permits',
                      'Not all conversions are allowed — consult an immigration lawyer or your HR department',
                    ].map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </ExpandableCard>
              </div>
            </SectionCard>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              FAQ
          ═══════════════════════════════════════════════════════════════════ */}
          {activeSection === 'faq' && (
            <SectionCard title="Frequently asked questions" icon={<HelpCircle size={18} />}>
              <div className="space-y-3">
                {[
                  {
                    q: 'What counts as a "working day" for the 8-day deadline?',
                    a: 'Working days are Monday–Friday, excluding Italian public holidays. If you arrive on a Friday, the clock starts the following Monday. The 8-day window is counted from the day after your arrival.',
                  },
                  {
                    q: 'Can I travel outside Italy while waiting for my card?',
                    a: 'Yes — your receipt (Ricevuta mod. 22A) plus your passport is generally accepted for re-entry into Italy and for travel within the Schengen area while your card is being processed. However, some countries may have different rules. Check before booking flights.',
                  },
                  {
                    q: 'My Post Office says they don\'t accept residence permit applications. What do I do?',
                    a: 'Not all Poste Italiane branches handle residence permits. You must go to an "enabled" office (Sportello Amico). Check the official list on the Prefecture of Milan\'s website before going.',
                  },
                  {
                    q: 'I don\'t have a permanent address yet. Can I still apply?',
                    a: 'Yes. The proof of address is optional at the submission stage. You can submit your application without it. When you attend the Questura appointment, bring your confirmed address at that point.',
                  },
                  {
                    q: 'Do I need my codice fiscale to apply?',
                    a: 'No. The codice fiscale field on the form is optional. Do not delay your application waiting to get one. You can add it later during your Questura appointment.',
                  },
                  {
                    q: 'What is the "kit giallo" and where do I get it?',
                    a: 'The "kit giallo" (yellow kit) is the official application envelope containing the forms and instructions for applying for a residence permit. You can get it from your university\'s International Student Office or from enabled Poste Italiane branches (Sportello Amico).',
                  },
                  {
                    q: 'I lost my appointment letter from the Post Office. What now?',
                    a: 'You can check your appointment date using the online status tool on the Polizia di Stato website using your receipt number. Alternatively, contact the Questura Immigration Office directly.',
                  },
                  {
                    q: 'The Post Office told me to pay €80.46 instead of €70.46 — is that right?',
                    a: 'Yes. The fee is €70.46 for permits valid up to 1 year and €80.46 for permits valid more than 1 year and up to 2 years. The Post Office clerk determines which fee applies based on your program duration.',
                  },
                  {
                    q: 'As an EU citizen, do I need to do anything at all when I arrive?',
                    a: 'Formally, nothing is required for stays up to 3 months. For longer stays, you should register at the Comune di Milano (Anagrafe). Registration gives you access to the NHS, makes banking easier, and is generally recommended.',
                  },
                  {
                    q: 'My health insurance is the European Health Insurance Card (EHIC) — is that acceptable?',
                    a: 'The EHIC is accepted for EU citizens but not for non-EU students applying for a permesso. Non-EU students need private health insurance valid in Italy, or proof of enrollment in the Italian NHS.',
                  },
                ].map(({ q, a }) => (
                  <ExpandableCard key={q} title={q}>
                    <p>{a}</p>
                  </ExpandableCard>
                ))}
              </div>
            </SectionCard>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              KEY LINKS
          ═══════════════════════════════════════════════════════════════════ */}
          {activeSection === 'links' && (
            <SectionCard title="Key links" icon={<LinkIcon size={18} />}>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  { label: 'YesMilano — Residence permit guide (students)', url: 'https://www.yesmilano.it/en/study/how-to/residence-permit-students' },
                  { label: 'YesMilano — Residence permit (non-EU workers)', url: 'https://www.yesmilano.it/en/work/getting-started-guide/residence-permit' },
                  { label: 'Enabled Post Offices (Sportelli Amici) — list', url: 'https://www.prefmi.it/sui/prf_est/elencoSportelliAmici.pdf' },
                  { label: 'Check application status — Polizia di Stato', url: 'https://questure.poliziadistato.it/stranieri' },
                  { label: 'Application form sample guide (Politecnico di Milano)', url: 'https://www.yesmilano.it/system/files/articolo/allegati/6510/32720/Permesso_di_soggiorno_sample_31ago%20%281%29.pdf' },
                  { label: 'Questura di Milano — Immigration Office (Google Maps)', url: 'https://maps.app.goo.gl/3Gm5DZJjqXiHf7mZ8' },
                  { label: 'Comune di Milano — EU citizen registration (Anagrafe)', url: 'https://www.comune.milano.it/servizi/iscrizione-allanagrafe-per-cittadini-ue' },
                  { label: 'Italian NHS (SSN) registration for students', url: 'https://www.yesmilano.it/en/study/how-to/national-health-service-students-step-step' },
                  { label: 'Questura di Milano — book appointment', url: 'https://portaleimmigrazione.it/' },
                  { label: 'YesMilano — Tax code (codice fiscale)', url: 'https://studyandwork.yesmilano.it/en/study/how-to/get-italian-tax-code-codice-fiscale' },
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
