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
  ChevronDown,
  Info,
  AlertTriangle,
  Stethoscope,
  Pill,
  Building2,
  HeartPulse,
  SmilePlus,
  Lightbulb,
  Link as LinkIcon,
  ExternalLink,
  Phone,
  MapPin,
} from 'lucide-react'

const CHECKLIST_STORAGE_KEY = 'dashboard-checklist:healthcare'

const PAGE_SECTIONS = [
  { id: 'overview',   label: 'Overview',        icon: Stethoscope },
  { id: 'gp',         label: 'GP & clinics',    icon: Stethoscope },
  { id: 'pharmacies', label: 'Pharmacies',       icon: Pill },
  { id: 'hospitals',  label: 'Hospitals & A&E',  icon: HeartPulse },
  { id: 'mental',     label: 'Mental health',    icon: SmilePlus },
  { id: 'dental',     label: 'Dental',           icon: Building2 },
  { id: 'tips',       label: 'Tips & links',     icon: Lightbulb },
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
                ? 'bg-[#8870FF] text-white shadow-sm'
                : 'text-slate-500 hover:bg-[#D9D3FB]/60 hover:text-slate-700'
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
      {/* Mobile: dropdown */}
      <div className="sm:hidden relative">
        <button
          onClick={() => setOpen(v => !v)}
          className="w-full flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            {ActiveIcon && <ActiveIcon size={15} className="text-emerald-600 flex-shrink-0" />}
            <span className="text-sm font-semibold text-slate-800">{activeSection?.label}</span>
          </div>
          <ChevronDown size={16} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
            {PAGE_SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { onSelect(id); setOpen(false) }}
                className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm text-left transition-colors ${
                  id === activeId ? 'bg-slate-50 font-semibold text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={14} className={id === activeId ? 'text-emerald-600' : 'text-slate-400'} />
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Desktop: scrollable row */}
      <div className="hidden sm:flex items-center gap-1 overflow-x-auto rounded-xl border border-[#D9D3FB] bg-[#F0EDFF] px-2 py-2 shadow-sm">
        <TabBarButtons activeId={activeId} onSelect={onSelect} />
      </div>
    </div>
  )
}

function StickyMergedTabBar({ activeId, onSelect }: { activeId: string; onSelect: (id: string) => void }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto px-1 py-1">
      <TabBarButtons activeId={activeId} onSelect={onSelect} compact />
    </div>
  )
}

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="col-span-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">{icon}</span>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function ExpandableCard({ title, badge, children }: { title: string; badge?: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-800">{title}</span>
          {badge}
        </div>
        <ChevronDown size={16} className={`flex-shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 text-sm text-slate-600 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  )
}

function Badge({ label, variant }: { label: string; variant: 'eu' | 'non-eu' | 'all' | 'bocconi' }) {
  const styles: Record<string, string> = {
    eu:       'border-[#a594ff]    bg-[#F0EDFF]    text-[#5b3fd4]',
    'non-eu': 'border-violet-300  bg-violet-100  text-violet-800',
    all:      'border-slate-300   bg-slate-100   text-slate-700',
    bocconi:  'border-emerald-300 bg-emerald-100 text-emerald-800',
  }
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[variant]}`}>
      {label}
    </span>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function HealthcarePage() {
  const { showModal, handleConfirm, handleBack } = useStepIntro('healthcare')
  const { stepNumber, totalSteps } = useDashboardStepPosition(10, 10)
  const [checklistState, setChecklistState]   = useState<Record<string, boolean>>({})
  const [isEuCitizen, setIsEuCitizen]         = useState<boolean | null>(null)
  const [activeSection, setActiveSection]     = useState('overview')
  const { setSections, clearSections }        = usePageSections()

  const tabNavRef = useRef<HTMLDivElement>(null)
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
    setSections(PAGE_SECTIONS.map(({ id, label }) => ({ id, label })))
    return () => clearSections()
  }, [setSections, clearSections])

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

  const requirements = getStepRequirements('healthcare') || []
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
          stepTitle="Healthcare"
          stepDescription="Navigate Italian healthcare in Milan — from registering with a GP to finding a pharmacy, getting dental care, and accessing mental health support."
          onConfirm={handleConfirm}
          onBack={handleBack}
        />
      )}
      <FeedbackWidget />
      <StepPageLayout
        stepNumber={stepNumber}
        totalSteps={totalSteps}
        stepLabel={`STEP ${stepNumber}`}
        title="Healthcare"
        subtitle="Your practical guide to healthcare in Milan — GPs, pharmacies, hospitals, dental, and mental health."
        useGradientBar={true}
        userInfoTitle="Your health profile"
        userInfoFields={[
          { key: 'destinationCountry', label: 'Home country' },
          { key: 'isEuCitizen', label: 'EU/EEA citizen', formatter: (v) => v === 'yes' ? 'Yes' : v === 'no' ? 'No' : '—' },
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
            {isEuCitizen === true && (
              <div className="col-span-full flex items-start gap-4 rounded-xl border border-[#a594ff] bg-[#F0EDFF] p-5 shadow-sm">
                <Stethoscope size={24} className="mt-0.5 flex-shrink-0 text-[#8870FF]" />
                <div>
                  <p className="text-base font-semibold text-[#5b3fd4]">EU/EEA citizen — your EHIC covers most care</p>
                  <p className="mt-1 text-sm text-[#6a54e0]">
                    Your EHIC card gives you access to state healthcare on the same terms as Italian residents.
                    Once in Milan, register with a <em>medico di base</em> (GP) for all non-emergency needs.
                    See the <button className="underline font-medium" onClick={() => handleTabSelect('gp')}>GP tab</button>.
                  </p>
                </div>
              </div>
            )}
            {isEuCitizen === false && (
              <div className="col-span-full flex items-start gap-4 rounded-xl border border-violet-300 bg-violet-50 p-5 shadow-sm">
                <Stethoscope size={24} className="mt-0.5 flex-shrink-0 text-violet-500" />
                <div>
                  <p className="text-base font-semibold text-violet-800">Non-EU student — register with a GP once enrolled in SSN</p>
                  <p className="mt-1 text-sm text-violet-700">
                    After your SSN voluntary enrollment at ATS Milano (covered in the Insurance step), choose and register
                    with a <em>medico di base</em> (GP). Your GP is the gateway to all specialist and hospital care.
                    See the <button className="underline font-medium" onClick={() => handleTabSelect('gp')}>GP tab</button>.
                  </p>
                </div>
              </div>
            )}

            {/* Emergency numbers */}
            <div className="col-span-full rounded-xl border border-red-200 bg-red-50 p-5">
              <div className="flex items-start gap-3">
                <Phone size={18} className="mt-0.5 flex-shrink-0 text-red-500" />
                <div>
                  <p className="text-sm font-semibold text-red-800">Emergency numbers — save these now</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      { label: '118', desc: 'Medical emergency (ambulanza)' },
                      { label: '112', desc: 'European emergency (all services)' },
                      { label: '115', desc: 'Fire brigade (vigili del fuoco)' },
                      { label: '113', desc: 'Police (polizia di stato)' },
                    ].map(e => (
                      <div key={e.label} className="rounded-lg border border-red-200 bg-white px-3 py-2 text-center">
                        <p className="text-lg font-bold text-red-700">{e.label}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{e.desc}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-red-700">
                    <strong>Pronto soccorso</strong> (A&amp;E) is always free regardless of insurance status.
                    For non-urgent issues outside GP hours, use the <strong>guardia medica</strong> (out-of-hours GP service).
                  </p>
                </div>
              </div>
            </div>

            <SectionCard title="How Italian healthcare works for students" icon={<Stethoscope size={18} />}>
              <p className="mb-4 text-sm text-slate-600 leading-relaxed">
                Italy operates a <strong className="text-slate-800">Servizio Sanitario Nazionale (SSN)</strong> — a universal public health service
                administered in Milan by <strong className="text-slate-800">ATS Milano</strong>. Once enrolled, the system works through a referral
                chain: your GP coordinates all care and issues referrals (<em>impegnative</em>) for specialists and tests.
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  {
                    title: 'Medico di base (GP)',
                    color: 'border-emerald-200 bg-emerald-50',
                    badge: 'border-emerald-300 bg-emerald-100 text-emerald-800',
                    desc: 'First stop for any non-emergency. Issues referrals for specialists, prescriptions (ricette), and sick notes. GP visits are free on the SSN.',
                  },
                  {
                    title: 'Pronto soccorso (A&E)',
                    color: 'border-red-200 bg-red-50',
                    badge: 'border-red-300 bg-red-100 text-red-800',
                    desc: 'Always open and free. Colour-coded triage — non-urgent cases (verde/bianco) wait 3-6 hours. Use only for genuine emergencies.',
                  },
                  {
                    title: 'Specialists & tests',
                    color: 'border-[#D9D3FB] bg-[#F0EDFF]',
                    badge: 'border-[#a594ff] bg-[#F0EDFF] text-[#5b3fd4]',
                    desc: 'Access via GP referral on the public SSN (subsidised) or directly at private clinics (faster, higher cost). Many offer student rates.',
                  },
                ].map(c => (
                  <div key={c.title} className={`rounded-lg border p-4 ${c.color}`}>
                    <p className={`mb-1.5 inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${c.badge}`}>{c.title}</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{c.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Bocconi health services</p>
                <div className="space-y-2">
                  {[
                    { name: 'Psychological counseling', detail: 'Free sessions with a qualified psychologist — book through the Bocconi student portal. Confidential. Limited slots fill quickly.' },
                    { name: 'Equal Opportunities Office (DSA)', detail: "Supports students with disabilities, chronic conditions, or learning differences (dyslexia, dyscalculia, etc.) — exam accommodations and more." },
                    { name: 'Campus first aid points', detail: 'Located in all major university buildings. Security staff are trained in basic first aid.' },
                  ].map(s => (
                    <div key={s.name} className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                      <CheckCircle2 size={15} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">{s.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{s.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SECTION: GP & Clinics
        ══════════════════════════════════════════════════════════════════ */}
        {activeSection === 'gp' && (
          <SectionCard title="GP & out-of-hours care" icon={<Stethoscope size={18} />}>
            <p className="mb-4 text-sm text-slate-600 leading-relaxed">
              Your <strong className="text-slate-800">medico di base</strong> (GP) is the cornerstone of Italian healthcare.
              You choose a GP from a list when you enroll in the SSN at ATS Milano. All GP visits are free — you pay
              only for prescriptions (~€2–5 per item, the <em>ticket</em>).
            </p>

            <div className="space-y-3">
              <ExpandableCard title="Registering with a GP (medico di base)">
                <p className="mb-3">Once enrolled at ATS Milano, ask for a list of available GPs in your area. You can choose any doctor who has capacity — not strictly limited to your street. Ask for English-speaking GPs if needed; several are listed in the Navigli / Bocconi area.</p>
                <p className="mb-2 font-medium text-slate-700">Documents to bring to ATS Milano (Via Unione 2):</p>
                <ul className="space-y-1 mb-3">
                  {[
                    'Valid passport',
                    'Codice Fiscale',
                    'Permesso di soggiorno or postal receipt (non-EU) / EHIC card (EU)',
                    'University enrollment certificate (iscrizione universitaria)',
                    'Proof of address in Milan (rental contract or accommodation letter)',
                  ].map((x, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                      {x}
                    </li>
                  ))}
                </ul>
                <div className="flex items-start gap-2 rounded-lg border border-[#D9D3FB] bg-[#F0EDFF] p-3 text-xs text-[#5b3fd4]">
                  <Info size={14} className="mt-0.5 flex-shrink-0" />
                  You will receive your Tessera Sanitaria (health card) by post within a few weeks. It is also your Codice Fiscale card — carry it everywhere.
                </div>
              </ExpandableCard>

              <ExpandableCard title="Your first GP appointment">
                <p className="mb-3">Appointments are typically 10–15 minutes. Bring a summary of any chronic conditions, current medications, allergies, and previous test results from home. Your GP will then issue prescriptions, referrals (<em>impegnative</em>), and medical certificates as needed.</p>
                <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                  <Info size={14} className="mt-0.5 flex-shrink-0" />
                  Electronic prescriptions (since 2020) are sent to your phone by SMS with a code — you show the code at any pharmacy. No paper needed.
                </div>
              </ExpandableCard>

              <ExpandableCard title="Guardia medica — out-of-hours GP service">
                <p className="mb-3">When your GP is unavailable (evenings, weekends, public holidays), the <strong>guardia medica</strong> (Continuità Assistenziale) provides free walk-in or telephone GP care for non-emergencies that cannot wait.</p>
                <ul className="space-y-1 mb-3">
                  {[
                    'Hours: typically 20:00–08:00 weekdays; all day on weekends and public holidays',
                    'No appointment needed — walk in or call the local number',
                    'Free on the SSN',
                    'Can issue same-day prescriptions for acute complaints',
                    'Not a substitute for your regular GP for ongoing or chronic conditions',
                  ].map((x, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#a594ff]" />
                      {x}
                    </li>
                  ))}
                </ul>
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                  For genuine emergencies (chest pain, breathing difficulty, severe injury) always call 118 or go directly to pronto soccorso.
                </div>
              </ExpandableCard>

              <ExpandableCard title="Centro Medico Santagostino — English-friendly private clinic">
                <p className="mb-3">The most popular clinic among international students and expats in Milan. Transparent pricing published online, same-week appointments, and English-speaking staff across multiple city locations.</p>
                <ul className="space-y-1 mb-3">
                  {[
                    'General medicine, dermatology, gynaecology, psychiatry, and more',
                    'Blood tests and diagnostics without long waits',
                    'Fixed price list online — no surprise invoices',
                    'Locations near Bocconi: Corso di Porta Ticinese and surrounding area',
                  ].map((x, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                      {x}
                    </li>
                  ))}
                </ul>
                <a href="https://www.santagostino.it/en" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#8870FF] hover:underline">
                  Centro Medico Santagostino <ExternalLink size={11} />
                </a>
              </ExpandableCard>

              <ExpandableCard title="Poliambulatori — walk-in specialist clinics">
                <p className="mb-2">Milan has many <strong>poliambulatori</strong> (multi-specialty outpatient clinics) run by the SSN or private operators. Good for blood tests, specialist visits, and physiotherapy at lower cost than full-hospital private care. Ask your GP for a referral to an SSN poliambulatorio to access subsidised rates.</p>
              </ExpandableCard>
            </div>
          </SectionCard>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SECTION: Pharmacies
        ══════════════════════════════════════════════════════════════════ */}
        {activeSection === 'pharmacies' && (
          <SectionCard title="Pharmacies (farmacie)" icon={<Pill size={18} />}>
            <p className="mb-4 text-sm text-slate-600 leading-relaxed">
              Italian pharmacists are highly trained clinicians — an excellent first stop for minor ailments.
              They can advise on symptoms, recommend OTC treatments, and tell you whether you need a doctor.
              Look for the illuminated <strong className="text-slate-800">green cross (&#10010;)</strong>.
            </p>

            <div className="space-y-3">
              <ExpandableCard title="Farmacia di turno — night & weekend pharmacies">
                <p className="mb-3">At least one pharmacy per neighbourhood is always open on a rota (<strong>farmacia di turno</strong>). To find it:</p>
                <ul className="space-y-1 mb-3">
                  {[
                    'Check the notice on the door of any closed pharmacy — it lists the nearest open one',
                    'Search "farmacia di turno Milano" on Google for real-time results',
                    'Call 800.274.274 (Regione Lombardia free helpline)',
                    'Use the Farmacia.it app with location access enabled',
                  ].map((x, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                      {x}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-slate-500">The <strong>Farmacia della Stazione Centrale</strong> (Milano Centrale station) is open 24/7 and always a reliable fallback.</p>
              </ExpandableCard>

              <ExpandableCard title="What you can buy without a prescription">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 mb-3">
                  {[
                    { cat: 'Pain & fever', items: 'Paracetamol (Tachipirina), ibuprofen (Moment, Brufen), aspirin' },
                    { cat: 'Colds & flu', items: 'Decongestants, antihistamines, throat sprays, nasal drops' },
                    { cat: 'Stomach & digestion', items: 'Antacids, probiotics, oral rehydration salts, laxatives' },
                    { cat: 'Skin & minor injuries', items: 'Antiseptic creams, wound dressings, antihistamine creams' },
                    { cat: 'Eye & ear', items: 'Artificial tears, basic eye drops (non-antibiotic), ear drops' },
                    { cat: "Women's health", items: "Morning-after pill (Plan B) available without prescription in Italy" },
                  ].map(c => (
                    <div key={c.cat} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                      <p className="text-xs font-semibold text-slate-700">{c.cat}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{c.items}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                  Antibiotics require a prescription in Italy. Your GP or guardia medica can prescribe them same-day when needed.
                </div>
              </ExpandableCard>

              <ExpandableCard title="Prescription medicines (ricette)">
                <ul className="space-y-2 mb-3">
                  <li className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#a594ff]" />
                    <span><strong className="text-slate-700">Ricetta rossa (SSN prescription)</strong> — you pay the ticket (~€2–5 per drug). Exempt if under 18, over 65, or with certain conditions.</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                    <span><strong className="text-slate-700">Ricetta bianca (private prescription)</strong> — you pay full price for the medicine, written by any licensed doctor.</span>
                  </li>
                </ul>
                <p className="text-xs text-slate-500">Electronic prescriptions are issued by SMS with a code — show it at the pharmacy counter. No paper needed.</p>
              </ExpandableCard>

              <ExpandableCard title="Farmacie comunali — extended hours near Bocconi">
                <p className="mb-2">Milan operates municipal pharmacies with extended opening hours. The most convenient for Bocconi students:</p>
                <ul className="space-y-1">
                  {[
                    'Farmacia Comunale No. 11 — Via Bocconi 10 (right next to campus)',
                    'Farmacia Comunale No. 1 — Corso di Porta Vittoria 12',
                    'Farmacia della Stazione Centrale — open 24 hours, 365 days',
                  ].map((x, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <MapPin size={11} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                      {x}
                    </li>
                  ))}
                </ul>
              </ExpandableCard>
            </div>
          </SectionCard>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SECTION: Hospitals & A&E
        ══════════════════════════════════════════════════════════════════ */}
        {activeSection === 'hospitals' && (
          <SectionCard title="Hospitals & pronto soccorso (A&E)" icon={<HeartPulse size={18} />}>
            <p className="mb-4 text-sm text-slate-600 leading-relaxed">
              Italy's <strong className="text-slate-800">pronto soccorso</strong> (A&E) is always free and open — regardless of
              nationality or insurance. It operates colour-coded triage; non-urgent cases can wait 3–6 hours.
              Use your GP or guardia medica for anything that is not a genuine emergency.
            </p>

            <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Triage colour codes</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { color: 'bg-red-500',    label: 'Rosso (Red)',      desc: 'Life-threatening — seen immediately' },
                  { color: 'bg-orange-400', label: 'Arancio (Orange)', desc: 'Urgent — within 15 minutes' },
                  { color: 'bg-[#8870FF]',   label: 'Azzurro (Blue)',   desc: 'Semi-urgent — within 60 minutes' },
                  { color: 'bg-green-500',  label: 'Verde (Green)',    desc: 'Minor — wait 2+ hours' },
                ].map(t => (
                  <div key={t.label} className="rounded-lg border border-slate-200 bg-white px-3 py-3">
                    <div className={`mb-1.5 h-3 w-3 rounded-full ${t.color}`} />
                    <p className="text-xs font-semibold text-slate-800">{t.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-500">A <strong>codice bianco</strong> (non-emergency visit) may incur a co-payment of ~€25. See your GP instead for minor issues.</p>
            </div>

            <div className="space-y-3">
              <ExpandableCard title="Main hospitals near Bocconi">
                <div className="space-y-3">
                  {[
                    {
                      name: 'Ospedale Policlinico di Milano',
                      address: 'Via Francesco Sforza 35 — 15 min walk from Bocconi',
                      note: "Italy's leading teaching hospital. Full A&E, all specialties. English-speaking international ward.",
                      url: 'https://www.policlinico.mi.it',
                    },
                    {
                      name: 'Ospedale San Paolo',
                      address: 'Via Antonio di Rudinì 8 — 10 min by tram',
                      note: 'Large public hospital with full A&E and 24h dental emergency unit. Very convenient for Bocconi / Navigli area.',
                      url: 'https://www.asst-santipaolocarlo.it',
                    },
                    {
                      name: 'Ospedale Fatebenefratelli',
                      address: 'Corso di Porta Nuova 23',
                      note: 'Full A&E with paediatric department. Central location, generally reasonable wait times.',
                      url: 'https://www.fbf.milano.it',
                    },
                    {
                      name: 'Humanitas Research Hospital',
                      address: 'Via Alessandro Manzoni 56, Rozzano (south of Milan)',
                      note: 'Private, internationally accredited. English-speaking staff. Higher cost but fast, modern, and efficient.',
                      url: 'https://www.humanitas.it',
                    },
                  ].map(h => (
                    <a key={h.name} href={h.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                      <Building2 size={15} className="mt-0.5 flex-shrink-0 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">{h.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin size={10} className="flex-shrink-0" />{h.address}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">{h.note}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </ExpandableCard>

              <ExpandableCard title="What to bring to A&E">
                <ul className="space-y-1 mb-3">
                  {[
                    'Tessera Sanitaria or EHIC card',
                    'Valid passport or ID',
                    'Italian address and phone number',
                    'Current medication list and allergy information',
                    'GP name and contact (if already registered)',
                  ].map((x, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                      {x}
                    </li>
                  ))}
                </ul>
                <div className="flex items-start gap-2 rounded-lg border border-[#D9D3FB] bg-[#F0EDFF] p-3 text-xs text-[#5b3fd4]">
                  <Info size={14} className="mt-0.5 flex-shrink-0" />
                  Ask for the <em>lettera di dimissione</em> when discharged — a written summary your GP needs for follow-up. Use Google Translate camera to read Italian discharge papers.
                </div>
              </ExpandableCard>

              <ExpandableCard title="Private clinics — faster access for non-urgent care">
                <p className="mb-3">When public wait times are long and the issue is non-urgent:</p>
                <ul className="space-y-1">
                  {[
                    'Centro Medico Santagostino — multiple locations, English-speaking, transparent pricing',
                    'Istituto Humanitas MedicalCare — private outpatient clinics across Milan',
                    'Clinica Luganese Moncucco — gynaecology, dermatology, general medicine near Bocconi',
                    'GVM Care & Research — cardiology and internal medicine specialists',
                  ].map((x, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                      {x}
                    </li>
                  ))}
                </ul>
              </ExpandableCard>
            </div>
          </SectionCard>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SECTION: Mental Health
        ══════════════════════════════════════════════════════════════════ */}
        {activeSection === 'mental' && (
          <SectionCard title="Mental health support" icon={<SmilePlus size={18} />}>
            <p className="mb-2 text-sm text-slate-600 leading-relaxed">
              Moving abroad for university is exciting but can also be stressful — new culture, academic pressure, possible
              language barriers, and distance from home. Bocconi takes student wellbeing seriously, and all the resources below are free.
            </p>

            <div className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <SmilePlus size={18} className="mt-0.5 flex-shrink-0 text-emerald-600" />
              <p className="text-sm text-emerald-800">
                <strong>You do not need to be in crisis to use these resources.</strong> Seeking support early is a sign of self-awareness.
                The Bocconi counseling service is confidential and free for all enrolled students.
              </p>
            </div>

            <div className="space-y-3">
              <ExpandableCard title="Bocconi psychological counseling" badge={<Badge label="Free for students" variant="bocconi" />}>
                <p className="mb-3">Free, confidential short-term psychological counseling provided by qualified psychologists, available in English. Book through the Bocconi student portal: <em>Punto Blu &rarr; Student Services &rarr; Welfare &rarr; Psychological Support</em>.</p>
                <p className="mb-2 font-medium text-slate-700">Topics covered:</p>
                <ul className="space-y-1 mb-3">
                  {[
                    'Academic stress and performance anxiety',
                    'Adjustment difficulties, homesickness, and culture shock',
                    'Relationship and family issues',
                    'Anxiety, depression, and mood difficulties',
                    'Eating concerns and body image',
                    'Grief and loss',
                  ].map((x, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <CheckCircle2 size={12} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                      {x}
                    </li>
                  ))}
                </ul>
                <a href="https://www.unibocconi.it/en/programs/current-students/services-and-activities/student-services/welfare-at-bocconi/healthcare-and-psychological-support"
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#8870FF] hover:underline">
                  Bocconi welfare &amp; counseling page <ExternalLink size={11} />
                </a>
              </ExpandableCard>

              <ExpandableCard title="Disability & equal opportunities (DSA / BES)" badge={<Badge label="Bocconi" variant="bocconi" />}>
                <p className="mb-3">
                  {"Bocconi's Equal Opportunities Office supports students with disabilities, specific learning differences (DSA — dyslexia, dyscalculia etc.), chronic physical conditions, and any need requiring academic accommodations."}
                </p>
                <ul className="space-y-1 mb-2">
                  {[
                    'Extended exam times and alternative assessment formats',
                    'Accessible study spaces and assistive technology',
                    'Coordination with healthcare providers',
                    'Scholarship and financial support for eligible students',
                  ].map((x, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                      {x}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-slate-500">Contact: <strong>pari.opportunita@unibocconi.it</strong> — or Building D, Student Services counter.</p>
              </ExpandableCard>

              <ExpandableCard title="External mental health resources in Milan">
                <div className="space-y-2">
                  {[
                    { name: 'SSN psychiatry (via GP referral)', detail: 'Your GP can refer you to the local Centro di Salute Mentale (CSM) for free psychiatric assessment and ongoing support through the public system.' },
                    { name: 'Centro Medico Santagostino — psychiatry', detail: 'Private English-speaking psychiatrists and psychologists. Fixed pricing, same-week appointments across Milan.' },
                    { name: 'BetterHelp / Online-Therapy (English)', detail: 'Online therapy platforms. Good bridge option while waiting for a local appointment or for students who prefer remote sessions.' },
                    { name: 'Telefono Amico — 02 2327 2327', detail: 'Italian emotional support helpline. Free, anonymous, open evenings and weekends.' },
                    { name: 'Telefono Azzurro — 19696', detail: 'Free helpline for under-26s in Italy — emotional support and referrals. Some English-speaking operators.' },
                  ].map(r => (
                    <div key={r.name} className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                      <p className="text-sm font-medium text-slate-800">{r.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{r.detail}</p>
                    </div>
                  ))}
                </div>
              </ExpandableCard>

              <ExpandableCard title="Crisis support">
                <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                  <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                  If you or someone you know is in immediate danger, call <strong>118</strong> (medical emergency) or <strong>112</strong>. Do not wait.
                </div>
                <ul className="space-y-1">
                  {[
                    'Any A&E (pronto soccorso) must see you for a psychiatric emergency — ask for "visita psichiatrica urgente"',
                    'Policlinico di Milano has a dedicated psychiatric emergency unit',
                    'Samaritans (English): +39 02 2327 2327 — daily 13:00–22:00',
                    'IASP crisis centres directory: https://www.iasp.info/resources/Crisis_Centres/',
                  ].map((x, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <Phone size={11} className="mt-0.5 flex-shrink-0 text-red-400" />
                      {x}
                    </li>
                  ))}
                </ul>
              </ExpandableCard>
            </div>
          </SectionCard>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SECTION: Dental
        ══════════════════════════════════════════════════════════════════ */}
        {activeSection === 'dental' && (
          <SectionCard title="Dental care in Milan" icon={<Building2 size={18} />}>
            <p className="mb-4 text-sm text-slate-600 leading-relaxed">
              Dental care in Italy is <strong className="text-slate-800">largely private</strong> — the SSN covers only limited dental services.
              As a student you will generally pay out-of-pocket for most work unless your private insurance includes dental.
            </p>

            <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <AlertTriangle size={18} className="mt-0.5 flex-shrink-0 text-amber-500" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Do dental work before you arrive if you can</p>
                <p className="mt-1 text-xs text-amber-700">
                  Even at dental school prices, a filling in Milan costs €80–150. A private dentist charges €120–250+.
                  Complete any planned dental work at home first.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <ExpandableCard title="What the SSN covers">
                <ul className="space-y-1 mb-3">
                  {[
                    'Emergency dental treatment (pain relief, emergency extraction) — free at any hospital dental unit',
                    'Basic care for students below a certain ISEE income threshold',
                    'Orthodontic care for children under 16',
                    'Some dental care during pregnancy',
                  ].map((x, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#a594ff]" />
                      {x}
                    </li>
                  ))}
                </ul>
                <div className="flex items-start gap-2 rounded-lg border border-[#D9D3FB] bg-[#F0EDFF] p-3 text-xs text-[#5b3fd4]">
                  <Info size={14} className="mt-0.5 flex-shrink-0" />
                  For emergency dental pain, go to the dental unit (<em>reparto odontoiatrico</em>) at Ospedale Policlinico or Ospedale San Paolo — both provide 24h emergency dental care, free for genuine emergencies.
                </div>
              </ExpandableCard>

              <ExpandableCard title="Dental schools — high quality at lower cost">
                <p className="mb-3">University dental clinics offer treatment by supervised qualified students at 40–60% of private dentist prices.</p>
                <div className="space-y-2">
                  {[
                    {
                      name: "Università degli Studi di Milano — Clinica Odontostomatologica",
                      address: 'Via della Commenda 10, Milano (near Policlinico)',
                      note: 'Largest dental school clinic in Milan. Hygiene, fillings, extractions, orthodontics. Appointment required.',
                    },
                    {
                      name: 'Humanitas University Dental Clinic',
                      address: 'Via Manzoni 56, Rozzano',
                      note: 'Modern facilities, English-speaking staff. Prices between dental school and full private.',
                    },
                  ].map(d => (
                    <div key={d.name} className="rounded-lg border border-slate-200 bg-white p-3">
                      <p className="text-sm font-medium text-slate-700">{d.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin size={10} className="flex-shrink-0" />{d.address}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{d.note}</p>
                    </div>
                  ))}
                </div>
              </ExpandableCard>

              <ExpandableCard title="Private dentist pricing guide">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                        <th className="pb-2 pr-4">Treatment</th>
                        <th className="pb-2">Typical cost (Milan)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        ['Consultation / check-up', '€30–80'],
                        ['Dental hygiene (cleaning)', '€70–150'],
                        ['Composite filling (per tooth)', '€100–250'],
                        ['Tooth extraction (simple)', '€100–200'],
                        ['Root canal treatment', '€400–800'],
                        ['Dental crown', '€500–1,200'],
                        ['Teeth whitening (in-clinic)', '€300–600'],
                      ].map(([t, c]) => (
                        <tr key={t}>
                          <td className="py-1.5 pr-4 text-slate-600">{t}</td>
                          <td className="py-1.5 font-medium text-slate-800">{c}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-xs text-slate-500">Many private dentists offer a free first check-up. Book one early in the year to establish a baseline before any urgent issue arises.</p>
              </ExpandableCard>
            </div>
          </SectionCard>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SECTION: Tips & Key links
        ══════════════════════════════════════════════════════════════════ */}
        {activeSection === 'tips' && (
          <>
            <SectionCard title="Insider tips" icon={<Lightbulb size={18} />}>
              <div className="space-y-2">
                {[
                  'Register with a GP as soon as you arrive — even if you feel healthy. You need a GP to get referrals for almost all specialist care in the public system.',
                  'The Tessera Sanitaria (health card) doubles as your Codice Fiscale card. Carry it everywhere.',
                  'Italian pharmacists can save you a GP visit for minor ailments. Describe your symptoms and they will advise or tell you to see a doctor.',
                  'Pronto soccorso (A&E) is always free. For non-emergencies outside GP hours, use the guardia medica or a walk-in clinic to avoid a 4–6 hour wait.',
                  'Book Bocconi psychological counseling early in the semester — slots fill quickly in October and February. You do not need to be in crisis to book.',
                  'If you need a non-urgent specialist quickly, Centro Medico Santagostino offers same-week private appointments at transparent, student-friendly prices.',
                  'The farmacia di turno is listed on the door of any closed pharmacy — or Google "farmacia di turno Milano" for the nearest open one.',
                  "Register with Bocconi's Equal Opportunities Office at the start of the year if you have a disability or learning difference — accommodations take time to set up.",
                  'Keep a note of: Codice Fiscale, Tessera Sanitaria number, GP name & phone, blood type. Screenshot it and save offline.',
                  'For dental care, the Università degli Studi di Milano dental school clinic offers 40–60% cheaper treatment supervised by qualified staff.',
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

            <SectionCard title="Key links & contacts" icon={<LinkIcon size={18} />}>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  { label: 'ATS Milano — choose your doctor', url: 'https://www.ats-milano.it' },
                  { label: 'Bocconi — welfare & psychological support', url: 'https://www.unibocconi.it/en/programs/current-students/services-and-activities/student-services/welfare-at-bocconi/healthcare-and-psychological-support' },
                  { label: 'Ospedale Policlinico di Milano', url: 'https://www.policlinico.mi.it' },
                  { label: 'Centro Medico Santagostino (English)', url: 'https://www.santagostino.it/en' },
                  { label: 'Humanitas Research Hospital', url: 'https://www.humanitas.it' },
                  { label: 'Farmacia.it — find open pharmacies', url: 'https://www.farmacia.it' },
                  { label: 'Salute.gov.it — SSN guide (English)', url: 'https://www.salute.gov.it/portale/temi/p2_6.jsp?lingua=english&id=2392&area=Sistema%20sanitario&menu=sistema' },
                  { label: 'UniMI Dental School Clinic', url: 'https://www.unimi.it/en/education/healthcare/dental-clinic' },
                  { label: 'IASP Crisis Centres directory', url: 'https://www.iasp.info/resources/Crisis_Centres/' },
                  { label: 'Regione Lombardia — health services', url: 'https://www.regione.lombardia.it' },
                ].map(link => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                  >
                    {link.label}
                    <ExternalLink size={14} className="flex-shrink-0 text-slate-400" />
                  </a>
                ))}
              </div>

              <div className="mt-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Key contacts in Milan</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    {
                      name: 'ATS Milano — Sportello Stranieri',
                      detail: 'Via Unione 2, 20122 Milano — SSN enrollment and GP registration for foreign students',
                      url: 'https://www.ats-milano.it',
                    },
                    {
                      name: 'Bocconi Student Services',
                      detail: 'Building D, Via Sarfatti 25 — welfare, counseling, disability support',
                      url: 'https://www.unibocconi.it/en/programs/current-students/services-and-activities',
                    },
                    {
                      name: 'Ospedale San Paolo — Dental Emergency',
                      detail: 'Via Antonio di Rudinì 8 — 24h dental emergency unit',
                      url: 'https://www.asst-santipaolocarlo.it',
                    },
                    {
                      name: 'Guardia Medica Milano',
                      detail: 'Evening / weekend out-of-hours GP. Search "guardia medica" + your zone for the nearest address.',
                      url: 'https://www.ats-milano.it',
                    },
                  ].map(c => (
                    <a
                      key={c.name}
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
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
          </>
        )}

      </StepPageLayout>
    </>
  )
}
