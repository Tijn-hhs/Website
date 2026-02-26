import { useState, useEffect, useCallback, useRef } from 'react'
import FeedbackWidget from '../components/FeedbackWidget'
import StepPageLayout from '../components/StepPageLayout'
import StepIntroModal from '../components/StepIntroModal'
import { useStepIntro } from '../hooks/useStepIntro'
import { useDashboardStepPosition } from '../hooks/useDashboardStepPosition'
import { getStepRequirements } from '../onboarding/stepRequirements'
import { fetchMe } from '../lib/api'
import { usePageSections } from '../lib/PageSectionsContext'
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  Info,
  AlertTriangle,
  Shield,
  Stethoscope,
  CreditCard,
  GraduationCap,
  Umbrella,
  Lightbulb,
  Link as LinkIcon,
  ExternalLink,
  Building2,
  MapPin,
  Phone,
} from 'lucide-react'

const CHECKLIST_STORAGE_KEY = 'dashboard-checklist:insurance'

const PAGE_SECTIONS = [
  { id: 'overview',  label: 'Overview',          icon: Shield },
  { id: 'ssn',       label: 'SSN / NHS',          icon: Stethoscope },
  { id: 'private',   label: 'Private insurance',  icon: CreditCard },
  { id: 'bocconi',   label: 'Bocconi coverage',   icon: GraduationCap },
  { id: 'other',     label: 'Other coverage',      icon: Umbrella },
  { id: 'tips',      label: 'Tips',               icon: Lightbulb },
  { id: 'links',     label: 'Key links',          icon: LinkIcon },
]

// ─── Sub-components ────────────────────────────────────────────────────────────

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

function ExpandableCard({ title, badge, children }: { title: string; badge?: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60">
      <button
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
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

function Badge({ label, variant }: { label: string; variant: 'required' | 'optional' | 'recommended' | 'warning' | 'eu' | 'non-eu' }) {
  const styles: Record<string, string> = {
    required:    'bg-red-50 text-red-700 border-red-200',
    optional:    'bg-slate-100 text-slate-600 border-slate-200',
    recommended: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning:     'bg-amber-50 text-amber-700 border-amber-200',
    eu:          'bg-blue-50 text-blue-700 border-blue-200',
    'non-eu':    'bg-violet-50 text-violet-700 border-violet-200',
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[variant]}`}>
      {label}
    </span>
  )
}

function StepItem({ number, title, detail }: { number: number; title: string; detail: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">{number}</span>
      <div>
        <p className="text-sm font-medium text-slate-800">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{detail}</p>
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function InsurancePage() {
  const { showModal, handleConfirm, handleBack } = useStepIntro('insurance')
  const { stepNumber, totalSteps } = useDashboardStepPosition(9, 10)
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({})
  const [isEuCitizen, setIsEuCitizen]         = useState<boolean | null>(null)
  const [activeSection, setActiveSection]     = useState('overview')
  const { setSections, clearSections }        = usePageSections()

  // Sticky merge: track when the tab nav row scrolls behind the sticky action bar
  const tabNavRef  = useRef<HTMLDivElement>(null)
  const [tabsMerged, setTabsMerged] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (!tabNavRef.current) return
      setTabsMerged(tabNavRef.current.getBoundingClientRect().top < 72)
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
      if (hash && PAGE_SECTIONS.some(s => s.id === hash)) setActiveSection(hash)
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

  // Load checklist + EU status from localStorage + profile
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(CHECKLIST_STORAGE_KEY)
      if (saved) {
        try { setChecklistState(JSON.parse(saved)) } catch { setChecklistState({}) }
      }
    }
    fetchMe().then(data => {
      const eu = data?.profile?.isEuCitizen
      setIsEuCitizen(eu === 'yes' ? true : eu === 'no' ? false : null)
    }).catch(() => {})
  }, [])

  const requirements = getStepRequirements('insurance') || []
  const checklistItems = requirements.map(req => ({ ...req, completed: checklistState[req.id] || false }))

  const handleChecklistToggle = (id: string, completed: boolean) => {
    const newState = { ...checklistState, [id]: completed }
    setChecklistState(newState)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(newState))
    }
  }

  return (
    <>
      {showModal && (
        <StepIntroModal
          stepTitle="Insurance"
          stepDescription="Learn what insurance you need as an international student in Milan — from enrolling in Italy's national health service to renter's and travel coverage."
          onConfirm={handleConfirm}
          onBack={handleBack}
        />
      )}
      <FeedbackWidget />
      <StepPageLayout
        stepNumber={stepNumber}
        totalSteps={totalSteps}
        stepLabel={`STEP ${stepNumber}`}
        title="Insurance"
        subtitle="Everything you need to stay protected in Milan — health, housing, and beyond."
        useGradientBar={true}
        userInfoTitle="Your insurance profile"
        userInfoFields={[
          { key: 'destinationCountry', label: 'Home country' },
          { key: 'isEuCitizen',        label: 'EU/EEA citizen', formatter: (v) => v === 'yes' ? 'Yes' : v === 'no' ? 'No' : '—' },
        ]}
        checklistItems={checklistItems}
        onChecklistItemToggle={handleChecklistToggle}
        showChecklist={false}
        isTabMerged={tabsMerged}
        mergedTabBar={<StickyMergedTabBar activeId={activeSection} onSelect={handleTabSelect} />}
      >

        {/* ── Tab navigation ── */}
        <div ref={tabNavRef} className="col-span-full">
          <TabNavigation activeId={activeSection} onSelect={handleTabSelect} isMerged={tabsMerged} />
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION: Overview
        ══════════════════════════════════════════════════════════════════ */}
        {activeSection === 'overview' && (
          <>
            {/* EU/Non-EU personalised banner */}
            {isEuCitizen === true && (
              <div className="col-span-full flex items-start gap-4 rounded-xl border border-blue-300 bg-blue-50 p-5 shadow-sm">
                <Shield size={24} className="mt-0.5 flex-shrink-0 text-blue-500" />
                <div>
                  <p className="text-base font-semibold text-blue-800">Good news — as an EU/EEA citizen your healthcare is simpler</p>
                  <p className="mt-1 text-sm text-blue-700">
                    Your European Health Insurance Card (EHIC / TEAM card) gives you free access to medically necessary care in Italy on the same terms as Italian residents. You can optionally also enroll in the Italian SSN for broader coverage. Start with the{' '}
                    <button className="underline font-medium" onClick={() => handleTabSelect('ssn')}>SSN tab</button>.
                  </p>
                </div>
              </div>
            )}
            {isEuCitizen === false && (
              <div className="col-span-full flex items-start gap-4 rounded-xl border border-violet-300 bg-violet-50 p-5 shadow-sm">
                <Shield size={24} className="mt-0.5 flex-shrink-0 text-violet-500" />
                <div>
                  <p className="text-base font-semibold text-violet-800">Non-EU students: health insurance is required</p>
                  <p className="mt-1 text-sm text-violet-700">
                    Private health insurance is a visa requirement before you travel. Once you arrive and have your permesso di soggiorno, you can voluntarily enroll in Italy's national health service (SSN) for comprehensive public coverage. See the{' '}
                    <button className="underline font-medium" onClick={() => handleTabSelect('ssn')}>SSN</button> and{' '}
                    <button className="underline font-medium" onClick={() => handleTabSelect('private')}>private insurance</button> tabs.
                  </p>
                </div>
              </div>
            )}

            <SectionCard title="Insurance in Italy — the big picture" icon={<Shield size={18} />}>
              <p className="text-sm text-slate-600 leading-relaxed">
                Italy has one of Europe's best universal healthcare systems — the{' '}
                <strong className="text-slate-800">Servizio Sanitario Nazionale (SSN)</strong>, often called the NHS of Italy.
                As a student in Milan you will deal with three overlapping layers of protection:
              </p>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  {
                    title: 'Public health (SSN)',
                    color: 'border-blue-200 bg-blue-50',
                    badge: 'border-blue-300 bg-blue-100 text-blue-800',
                    desc: 'GP visits, specialist care, ER, prescriptions, maternity. EU students use EHIC; non-EU students can enroll by paying ~€150/year.',
                  },
                  {
                    title: 'University coverage',
                    color: 'border-emerald-200 bg-emerald-50',
                    badge: 'border-emerald-300 bg-emerald-100 text-emerald-800',
                    desc: 'Bocconi provides automatic accident insurance for all enrolled students during university activities and on campus.',
                  },
                  {
                    title: 'Private / supplemental',
                    color: 'border-amber-200 bg-amber-50',
                    badge: 'border-amber-300 bg-amber-100 text-amber-800',
                    desc: 'Covers gaps in public care: dental, optical, faster specialist access, and is often required before obtaining a student visa.',
                  },
                ].map(c => (
                  <div key={c.title} className={`rounded-lg border p-4 ${c.color}`}>
                    <p className={`mb-1.5 inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${c.badge}`}>{c.title}</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{c.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Quick reference by citizenship</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                        <th className="pb-2 pr-6">Status</th>
                        <th className="pb-2 pr-6">Health coverage option</th>
                        <th className="pb-2">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        ['EU / EEA', 'EHIC card from home country', 'Free'],
                        ['EU / EEA', 'Optional SSN enrollment (ATS Milano)', 'Free for EU'],
                        ['Non-EU', 'Private insurance (required for visa)', '€200–600/year'],
                        ['Non-EU', 'Voluntary SSN enrollment (after permesso)', '~€149.77/year'],
                        ['All students', 'Bocconi accident insurance', 'Included'],
                      ].map(([status, option, cost]) => (
                        <tr key={status + option}>
                          <td className="py-2 pr-6 font-medium text-slate-800 whitespace-nowrap">{status}</td>
                          <td className="py-2 pr-6 text-slate-600">{option}</td>
                          <td className="py-2 text-slate-500 whitespace-nowrap">{cost}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </SectionCard>

            {/* Cross-reference to Healthcare step */}
            <div className="col-span-full flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <Info size={16} className="mt-0.5 flex-shrink-0 text-slate-400" />
              <p className="text-sm text-slate-600">
                Once insured, head to the <strong>Healthcare step</strong> for practical guidance on emergency numbers,
                registering with a GP, pharmacies, hospitals, and mental health support in Milan.
              </p>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SECTION: SSN / National Health Service
        ══════════════════════════════════════════════════════════════════ */}
        {activeSection === 'ssn' && (
          <SectionCard title="Italy's National Health Service (SSN)" icon={<Stethoscope size={18} />}>
            <p className="mb-4 text-sm text-slate-600 leading-relaxed">
              The <strong className="text-slate-800">Servizio Sanitario Nazionale (SSN)</strong> is Italy's universal public healthcare system.
              In Milan, it is administered by <strong className="text-slate-800">ATS Milano</strong> (Agenzia di Tutela della Salute).
              Once enrolled, you choose a <em>medico di base</em> (GP) who becomes your primary point of contact for all non-emergency care.
            </p>

            <div className="space-y-3">
              <ExpandableCard
                title="EU / EEA students — EHIC card"
                badge={<Badge label="EU / EEA" variant="eu" />}
              >
                <p className="mb-3">
                  Your <strong>European Health Insurance Card (EHIC)</strong> — called the TEAM card in some countries — entitles you to medically necessary state-provided healthcare in Italy on the same terms as Italian residents.
                  This means GP visits, specialist referrals, emergency care, and subsidised prescriptions are covered.
                </p>
                <p className="mb-2 font-medium text-slate-700">Before you leave home:</p>
                <ol className="space-y-2">
                  {[
                    { t: 'Check your existing EHIC card', d: 'If you already have one, confirm the expiry date — it must be valid for your entire stay in Milan.' },
                    { t: 'Apply or renew your EHIC', d: 'Request it from your national health authority (it is free). Processing takes 1–4 weeks, so apply early.' },
                    { t: 'Keep the card on you when you arrive', d: 'Show it at pharmacies, clinics, and hospitals to access subsidised care.' },
                  ].map((s, i) => <StepItem key={i} number={i + 1} title={s.t} detail={s.d} />)}
                </ol>
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
                  <Info size={14} className="mt-0.5 flex-shrink-0" />
                  EU students can also voluntarily enroll in the SSN at the local ATS free of charge — this gives you a permanent Italian GP and Tessera Sanitaria, helpful for stays longer than 6 months.
                </div>
              </ExpandableCard>

              <ExpandableCard
                title="Non-EU students — voluntary SSN enrollment"
                badge={<Badge label="Non-EU" variant="non-eu" />}
              >
                <p className="mb-3">
                  Non-EU students with a <strong>student visa</strong> can voluntarily enroll in the Italian SSN by paying an annual fee (~€149.77/year, 2025 rate).
                  Once enrolled, you have the same rights as Italian residents: GP, specialist visits, emergency care, and prescriptions.
                </p>
                <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                  You need your <strong>permesso di soggiorno</strong> (or the postal receipt proving you applied) before you can enroll. Get your Codice Fiscale first — it is required for everything.
                </div>
                <p className="mb-2 font-medium text-slate-700">Step-by-step enrollment:</p>
                <ol className="space-y-2">
                  {[
                    { t: 'Obtain your Codice Fiscale', d: 'Required for all Italian bureaucracy. See the Codice Fiscale step in your dashboard.' },
                    { t: 'Apply for your permesso di soggiorno', d: 'Submit the kit at the post office within 8 days of arrival. Keep the postal receipt (ricevuta).' },
                    { t: 'Go to your local ATS / ASL office', d: 'In Milan: ATS Milano, Via Unione 2. Bring passport, permesso receipt, university enrollment letter, Codice Fiscale, and proof of address.' },
                    { t: 'Pay the annual fee', d: 'Approximately €149.77/year. Payment via F24 form at a tabaccheria, bank, or directly at the ASL counter.' },
                    { t: 'Choose your medico di base (GP)', d: 'You will be given a list of available GPs in your area. Choose one close to where you live.' },
                    { t: 'Receive your Tessera Sanitaria', d: 'This is your Italian health card and also your Codice Fiscale card. Keep it safe at all times.' },
                  ].map((s, i) => <StepItem key={i} number={i + 1} title={s.t} detail={s.d} />)}
                </ol>
                <p className="mt-3 text-xs font-medium text-slate-700">Documents to bring:</p>
                <ul className="mt-1 space-y-1">
                  {[
                    'Valid passport + copy',
                    'Student visa or permesso di soggiorno / postal receipt',
                    'Codice Fiscale',
                    'University enrolment certificate (certificato di iscrizione)',
                    'Proof of address in Milan (rental contract or accommodation letter)',
                    'F24 payment receipt for the annual fee',
                  ].map((d, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-400" />
                      {d}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                  <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" />
                  Once enrolled in SSN, you no longer need a separate private health policy for healthcare within Italy — though keeping your original visa insurance active until enrollment is complete is wise.
                </div>
              </ExpandableCard>

              <ExpandableCard title="What the SSN covers (and what it doesn't)">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    { title: 'GP (medico di base)', detail: 'Free with SSN enrollment. Required for referrals to specialists.' },
                    { title: 'Specialist visits', detail: 'Covered with a small co-payment (ticket). Higher cost if you self-refer without a GP letter.' },
                    { title: 'Emergency care (pronto soccorso)', detail: 'Always free for genuine emergencies, regardless of insurance status.' },
                    { title: 'Prescribed medicines', detail: 'Heavily subsidised — there is normally a small co-payment per prescription.' },
                    { title: 'Diagnostic tests', detail: 'Blood tests, X-rays, ultrasounds — free or very low-cost with a GP referral.' },
                    { title: 'Mental health services', detail: 'Some services covered, but wait times are long. Bocconi provides free counselling on campus.' },
                  ].map(c => (
                    <div key={c.title} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                      <p className="text-xs font-semibold text-slate-700">{c.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{c.detail}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-slate-400">
                  The SSN does <strong>not</strong> cover routine dental care (except children and urgent extractions), optical care, or cosmetic treatments. Private insurance or supplemental top-ups fill these gaps.
                </p>
              </ExpandableCard>
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <MapPin size={16} className="mt-0.5 flex-shrink-0 text-slate-400" />
              <div>
                <p className="text-sm font-semibold text-slate-700">ATS Milano — main enrollment office</p>
                <p className="text-xs text-slate-500 mt-0.5">Via Unione 2, 20122 Milano (MM3 Missori, 10 min walk from Bocconi)</p>
                <p className="text-xs text-slate-500">Mon–Fri 08:30–12:00. Arrive early — queues can be long. Online appointments available.</p>
                <a
                  href="https://www.ats-milano.it"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                >
                  ats-milano.it <ExternalLink size={11} />
                </a>
              </div>
            </div>
          </SectionCard>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SECTION: Private insurance
        ══════════════════════════════════════════════════════════════════ */}
        {activeSection === 'private' && (
          <SectionCard title="Private health insurance" icon={<CreditCard size={18} />}>
            <p className="mb-4 text-sm text-slate-600 leading-relaxed">
              Private insurance is <strong className="text-slate-800">required for non-EU students</strong> as part of the Italian student visa application — you must show proof of comprehensive health coverage before the embassy issues your visa.
              EU students may also want private insurance to fill SSN gaps (dental, optical, faster specialist access).
            </p>

            <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
              Your policy must cover the <strong>entire duration of your visa</strong> and include at least emergency hospitalisation and repatriation. Many embassies reject policies with coverage caps below €30,000.
            </div>

            <div className="space-y-3">
              {[
                {
                  name: 'AON International Insurance',
                  badge: <Badge label="Popular with students" variant="recommended" />,
                  content: (
                    <>
                      <p className="mb-2">AON has group agreements with multiple Italian universities. Coverage includes emergency and planned hospitalisation, specialist visits, diagnostic tests, repatriation, and civil liability.</p>
                      <p className="mb-1"><span className="font-semibold text-slate-700">Typical cost:</span> €200–350/year</p>
                      <a href="https://www.aon.com/italy/studenti" target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs">
                        aon.com/italy/studenti <ExternalLink size={11} />
                      </a>
                    </>
                  ),
                },
                {
                  name: 'Allianz Care / Allianz Student',
                  badge: <Badge label="Recommended" variant="recommended" />,
                  content: (
                    <>
                      <p className="mb-2">Flexible international student plans. Cover can include outpatient care, mental health, dental emergency, and optical. Plans are renewable annually and widely accepted by Italian embassies.</p>
                      <p className="mb-1"><span className="font-semibold text-slate-700">Typical cost:</span> €300–550/year depending on coverage tier</p>
                      <a href="https://www.allianzcare.com" target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs">
                        allianzcare.com <ExternalLink size={11} />
                      </a>
                    </>
                  ),
                },
                {
                  name: 'Cigna Global Health',
                  badge: undefined,
                  content: (
                    <>
                      <p className="mb-2">Well-established international insurer with comprehensive student plans. Strong network in Italy. Popular among students from the US and Asia Pacific.</p>
                      <p className="mb-1"><span className="font-semibold text-slate-700">Typical cost:</span> €400–700/year</p>
                      <a href="https://www.cignahealthbenefits.com" target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs">
                        cignahealthbenefits.com <ExternalLink size={11} />
                      </a>
                    </>
                  ),
                },
                {
                  name: 'UnipolSai (Italian domestic insurer)',
                  badge: undefined,
                  content: (
                    <>
                      <p className="mb-2">Italy's largest insurer. Good for domestic health plans if you plan to stay long-term. Less suitable for visa applications from outside Italy, as cover may not satisfy pre-arrival embassy requirements.</p>
                      <a href="https://www.unipolsai.it" target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs">
                        unipolsai.it <ExternalLink size={11} />
                      </a>
                    </>
                  ),
                },
                {
                  name: 'Compare plans on Facile.it',
                  badge: <Badge label="Comparison tool" variant="optional" />,
                  content: (
                    <>
                      <p className="mb-2">Facile.it is Italy's leading insurance comparison website. Once you are in Italy and want supplemental coverage on top of SSN, compare domestic options here.</p>
                      <a href="https://www.facile.it/assicurazione-salute/" target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs">
                        facile.it/assicurazione-salute <ExternalLink size={11} />
                      </a>
                    </>
                  ),
                },
              ].map(p => (
                <ExpandableCard key={p.name} title={p.name} badge={p.badge}>
                  {p.content}
                </ExpandableCard>
              ))}
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Checklist before buying a policy</p>
              <ul className="space-y-1.5">
                {[
                  'Minimum coverage of €30,000 per incident (Italian visa requirement)',
                  'Covers emergency hospitalisation and medical repatriation to home country',
                  'No geographic exclusions for Italy / Schengen area',
                  'Policy valid for the entire duration of your visa (usually 12 months)',
                  'Policy documents available in English or Italian',
                  'Clear policy on pre-existing conditions',
                ].map((c, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                    <CheckCircle2 size={13} className="flex-shrink-0 text-emerald-400" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </SectionCard>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SECTION: Bocconi coverage
        ══════════════════════════════════════════════════════════════════ */}
        {activeSection === 'bocconi' && (
          <SectionCard title="Coverage included with your Bocconi enrollment" icon={<GraduationCap size={18} />}>
            <p className="mb-4 text-sm text-slate-600 leading-relaxed">
              All students enrolled at Bocconi automatically benefit from several forms of protection and on-campus health services.
              These supplement — but do not replace — health insurance.
            </p>

            <div className="space-y-3">
              {[
                {
                  title: 'Accident insurance (INAIL / university policy)',
                  badge: <Badge label="Automatic" variant="recommended" />,
                  content: (
                    <>
                      <p className="mb-2">Bocconi students are covered by an <strong>accident insurance policy</strong> for injuries sustained during:</p>
                      <ul className="mb-2 space-y-1">
                        {[
                          'University activities (lectures, seminars, study groups, labs)',
                          'On Bocconi premises and official facilities',
                          'Travel directly to and from university (infortuni in itinere)',
                        ].map((x, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                            {x}
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-slate-500">This does not cover illness or accidents outside university activities — you still need separate health coverage.</p>
                    </>
                  ),
                },
                {
                  title: 'Psychological counselling — SCAR service',
                  badge: <Badge label="Free" variant="recommended" />,
                  content: (
                    <>
                      <p className="mb-2">Bocconi's <strong>Psychological Counselling Service (SCAR)</strong> offers free individual sessions for enrolled students with professional psychologists. Fully confidential.</p>
                      <p className="mb-2">Topics: academic stress, anxiety, depression, relationship difficulties, integration challenges for international students.</p>
                      <a href="https://www.unibocconi.it/en/programs/current-students/services-and-activities/student-services/welfare-at-bocconi/healthcare-and-psychological-support"
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs">
                        Bocconi welfare services <ExternalLink size={11} />
                      </a>
                    </>
                  ),
                },
                {
                  title: 'On-campus medical service (Ambulatorio Medico)',
                  badge: undefined,
                  content: (
                    <>
                      <p className="mb-2">A physician is available on campus at set hours for non-emergency consultations — useful for getting prescriptions quickly without needing your own GP appointment.</p>
                      <p className="text-xs text-slate-500">Check the current schedule on the Bocconi student portal under "Welfare at Bocconi".</p>
                    </>
                  ),
                },
                {
                  title: 'Civil liability for university activities',
                  badge: undefined,
                  content: (
                    <>
                      <p className="mb-2">Bocconi's policy includes basic <strong>civil liability (RC)</strong> cover for damages caused to third parties during official university activities. This does not extend to your private life.</p>
                      <p className="text-xs text-slate-500">For broader civil liability (e.g., accidental damage to your apartment), renter's insurance is the standard solution.</p>
                    </>
                  ),
                },
              ].map(p => (
                <ExpandableCard key={p.title} title={p.title} badge={p.badge}>
                  {p.content}
                </ExpandableCard>
              ))}
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              <Info size={14} className="mt-0.5 flex-shrink-0 text-slate-400" />
              For full policy details and claims process, contact the <strong>Bocconi International Students Office</strong> (Building D, Via Sarfatti 25) or the Segreteria Studenti. Policy documentation is on the student portal.
            </div>
          </SectionCard>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SECTION: Other coverage
        ══════════════════════════════════════════════════════════════════ */}
        {activeSection === 'other' && (
          <SectionCard title="Other insurance to consider" icon={<Umbrella size={18} />}>
            <p className="mb-4 text-sm text-slate-600 leading-relaxed">
              Beyond health insurance, several other types of coverage are worth considering as a student in Milan.
              None are legally mandatory, but they can save significant cost and stress if something goes wrong.
            </p>

            <div className="space-y-3">
              <ExpandableCard
                title="Renter's insurance (assicurazione affittuari)"
                badge={<Badge label="Highly recommended" variant="recommended" />}
              >
                <p className="mb-2">Student apartments in Milan are often older buildings with shared use — water leaks, accidental damage, and theft are common. A renter's policy bundles:</p>
                <ul className="mb-2 space-y-1">
                  {[
                    'Civil liability (RC) — if you accidentally damage the apartment or injure someone',
                    'Contents coverage — laptop, phone, bicycle, clothing',
                    'Fire and water damage',
                    'Theft — usually covers break-ins, sometimes portable items',
                  ].map((x, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                      {x}
                    </li>
                  ))}
                </ul>
                <p className="mb-1.5 text-sm"><span className="font-semibold text-slate-700">Typical cost:</span> €5–20/month</p>
                <p className="mb-2 text-xs text-slate-500">Some landlords require tenants to hold an RC policy — check your rental contract before signing.</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Facile.it — compare', url: 'https://www.facile.it/assicurazione-casa/' },
                    { label: 'UnipolSai', url: 'https://www.unipolsai.it' },
                    { label: 'Generali', url: 'https://www.generali.it' },
                  ].map(l => (
                    <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-blue-300 hover:text-blue-700 transition-colors">
                      {l.label} <ExternalLink size={10} />
                    </a>
                  ))}
                </div>
              </ExpandableCard>

              <ExpandableCard title="Travel insurance">
                <p className="mb-2">If you plan to travel around Europe during your studies, travel insurance covers cancellations, lost baggage, delayed flights, and medical emergencies abroad. Important if you use low-cost carriers.</p>
                <ul className="space-y-1 mb-2">
                  {[
                    'Check if your bank card includes travel insurance — many premium debit/credit cards do',
                    'ISIC (International Student Identity Card) includes travel assistance in some plans',
                    'Erasmus+ participants are covered by the Erasmus insurance scheme',
                    'Annual multi-trip plans are more cost-effective than per-trip cover',
                  ].map((x, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400" />
                      {x}
                    </li>
                  ))}
                </ul>
                <a href="https://www.isic.org" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs">
                  ISIC card benefits <ExternalLink size={11} />
                </a>
              </ExpandableCard>

              <ExpandableCard title="Bicycle insurance">
                <p className="mb-2">Bicycle theft in Milan is extremely common. If you plan to cycle:</p>
                <ul className="space-y-1 mb-2">
                  {[
                    'Register your bike on the Comune di Milano Registro Biciclette — free and deters theft',
                    'Get your bike punzonatura (serial number stamp) at a police station or civic point',
                    'Take a photo of your bike and note the frame serial number',
                    'Many renter\'s insurance policies include bicycle theft — check the wording',
                  ].map((x, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                      {x}
                    </li>
                  ))}
                </ul>
                <a href="https://www.comune.milano.it/servizi/registro-biciclette" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs">
                  Milan Bike Registry <ExternalLink size={11} />
                </a>
              </ExpandableCard>

              <ExpandableCard title="Electronics / valuables insurance">
                <p className="mb-2">Laptops and smartphones may not be covered under basic renter's policies. Check whether your policy includes "all-risks" cover for portable valuables. If not, a gadget top-up rider is worth considering.</p>
                <p className="text-xs text-slate-500">Some student bank accounts (Revolut Plus, N26 Smart) include limited device insurance — worth checking before buying separately.</p>
              </ExpandableCard>
            </div>
          </SectionCard>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SECTION: Tips
        ══════════════════════════════════════════════════════════════════ */}
        {activeSection === 'tips' && (
          <SectionCard title="Insider tips" icon={<Lightbulb size={18} />}>
            <div className="space-y-2">
              {[
                'Apply for your EHIC card 3–4 weeks before departure — it can take time to arrive (EU/EEA students).',
                'The Bocconi International Office can advise on recommended insurance providers and whether your existing policy satisfies visa requirements.',
                'The Tessera Sanitaria (health card) doubles as your Codice Fiscale card — carry it with you everywhere.',
                'Top up or check SSN for dental referrals before having any procedure — dental work is expensive in Milan without coverage.',
                "If you have a chronic condition or disability, inform Bocconi's Equal Opportunities Office — they coordinate with healthcare providers for additional support.",
                'Renew your SSN enrollment and private insurance before expiry — gaps in coverage can cause complications when renewing your permesso di soggiorno.',
              ].map((tip, i) => (
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

        {/* ══════════════════════════════════════════════════════════════════
            SECTION: Key links
        ══════════════════════════════════════════════════════════════════ */}
        {activeSection === 'links' && (
          <SectionCard title="Key links" icon={<LinkIcon size={18} />}>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {[
                { label: 'ATS Milano — enroll in SSN', url: 'https://www.ats-milano.it' },
                { label: 'Bocconi — healthcare & welfare', url: 'https://www.unibocconi.it/en/programs/current-students/services-and-activities/student-services/welfare-at-bocconi/healthcare-and-psychological-support' },
                { label: 'EHIC — UK NHS (GHIC) application', url: 'https://www.nhs.uk/using-the-nhs/healthcare-abroad/apply-for-a-free-uk-global-health-insurance-card-ghic/' },
                { label: 'Italian SSN official info (Salute.gov)', url: 'https://www.salute.gov.it/portale/temi/p2_6.jsp?lingua=english&id=2392&area=Sistema%20sanitario&menu=sistema' },
                { label: 'AON Student Insurance Italy', url: 'https://www.aon.com/italy/studenti' },
                { label: 'Allianz Care student plans', url: 'https://www.allianzcare.com/en/student-health-insurance.html' },
                { label: 'Facile.it — home insurance compare', url: 'https://www.facile.it/assicurazione-casa/' },
                { label: 'Facile.it — health insurance compare', url: 'https://www.facile.it/assicurazione-salute/' },
                { label: 'Milan bike registry (Comune)', url: 'https://www.comune.milano.it/servizi/registro-biciclette' },
                { label: 'ISIC student card + travel benefits', url: 'https://www.isic.org' },
              ].map(link => (
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

            {/* Useful contacts in Milan */}
            <div className="mt-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Useful contacts in Milan</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  {
                    name: 'Bocconi International Students Office',
                    detail: 'Via Sarfatti 25, Building D — international@unibocconi.it',
                    url: 'https://www.unibocconi.it/en/programs/current-students/services-and-activities/international-students-services',
                  },
                  {
                    name: 'ATS Milano — Sportello Stranieri',
                    detail: 'Via Unione 2, 20122 Milano — SSN enrollment, GP registration',
                    url: 'https://www.ats-milano.it',
                  },
                  {
                    name: 'Ospedale Policlinico di Milano',
                    detail: 'Via Francesco Sforza 35 — major teaching hospital near Bocconi',
                    url: 'https://www.policlinico.mi.it',
                  },
                  {
                    name: 'Humanitas Research Hospital',
                    detail: 'Via Alessandro Manzoni 56, Rozzano — private hospital, English-speaking staff',
                    url: 'https://www.humanitas.it',
                  },
                ].map(c => (
                  <a
                    key={c.name}
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <Building2 size={15} className="mt-0.5 flex-shrink-0 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">{c.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{c.detail}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </SectionCard>
        )}

      </StepPageLayout>
    </>
  )
}
