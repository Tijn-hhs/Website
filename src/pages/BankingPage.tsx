import { useState, useEffect, useCallback, useRef } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import FeedbackWidget from '../components/FeedbackWidget'
import StepPageLayout from '../components/StepPageLayout'
import StepIntroModal from '../components/StepIntroModal'
import { useStepIntro } from '../hooks/useStepIntro'
import { getStepRequirements } from '../onboarding/stepRequirements'
import { usePageSections } from '../lib/PageSectionsContext'
import {
  Landmark,
  Smartphone,
  FileText,
  ClipboardList,
  ArrowRightLeft,
  BarChart2,
  Hash,
  PiggyBank,
  ChevronDown,
  ExternalLink,
  Lightbulb,
} from 'lucide-react'

const CHECKLIST_STORAGE_KEY = 'dashboard-checklist:banking'

const PAGE_SECTIONS = [
  { id: 'overview',   label: 'Overview',          icon: Landmark },
  { id: 'digital',    label: 'Digital banks',      icon: Smartphone },
  { id: 'documents',  label: 'Documents',          icon: FileText },
  { id: 'opening',    label: 'Opening account',    icon: ClipboardList },
  { id: 'transfers',  label: 'Transfers',          icon: ArrowRightLeft },
  { id: 'finances',   label: 'Finances',           icon: BarChart2 },
  { id: 'tax',        label: 'Tax ID',             icon: Hash },
  { id: 'budgeting',  label: 'Budgeting',          icon: PiggyBank },
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
  return (
    <nav
      className="flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm scrollbar-hide"
      style={{ visibility: isMerged ? 'hidden' : 'visible', transition: 'visibility 0ms' }}
    >
      <TabBarButtons activeId={activeId} onSelect={onSelect} />
    </nav>
  )
}

function StickyMergedTabBar({
  activeId,
  onSelect,
}: {
  activeId: string
  onSelect: (id: string) => void
}) {
  return (
    <nav className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
      <TabBarButtons activeId={activeId} onSelect={onSelect} compact />
    </nav>
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

function ExpandableCard({
  title,
  children,
}: {
  title: string
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
        <span className="text-sm font-semibold text-slate-800">{title}</span>
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

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
          {item}
        </li>
      ))}
    </ul>
  )
}

function TipRow({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm text-slate-700">
      <Lightbulb size={15} className="mt-0.5 flex-shrink-0 text-emerald-500" />
      {text}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BankingPage() {
  const { showModal, handleConfirm, handleBack } = useStepIntro('banking')
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({})
  const [activeSection, setActiveSection] = useState('overview')
  const { setSections, clearSections } = usePageSections()

  // Sticky merge: track when the tab nav row scrolls behind the sticky action bar
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

  // Keep active tab in sync with URL hash
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

  // Load checklist state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(CHECKLIST_STORAGE_KEY)
      if (saved) {
        try {
          setChecklistState(JSON.parse(saved))
        } catch {
          setChecklistState({})
        }
      }
    }
  }, [])

  const requirements = getStepRequirements('banking') || []
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

  return (
    <>
      {showModal && (
        <StepIntroModal
          stepTitle="Banking"
          stepDescription="Set up bank accounts and manage financial essentials."
          onConfirm={handleConfirm}
          onBack={handleBack}
        />
      )}
      <FeedbackWidget />
      <DashboardLayout>
        <StepPageLayout
          stepNumber={8}
          totalSteps={13}
          stepLabel="STEP 8"
          title="Banking"
          subtitle="Set up bank accounts and manage financial essentials."
          useGradientBar={true}
          userInfoTitle="Your Banking Status"
          userInfoFields={[
            { key: 'destinationCountry', label: 'Country' },
            { key: 'destinationCity', label: 'City' },
            { key: 'bankAccountNeeded', label: 'Bank Account Needed' },
          ]}
          checklistItems={checklistItems}
          onChecklistItemToggle={handleChecklistToggle}
          isTabMerged={tabsMerged}
          mergedTabBar={
            <StickyMergedTabBar activeId={activeSection} onSelect={handleTabSelect} />
          }
        >

          {/* ── Tab navigation ── */}
          <div ref={tabNavRef} className="col-span-full">
            <TabNavigation activeId={activeSection} onSelect={handleTabSelect} isMerged={tabsMerged} />
          </div>

          {/* ── Overview ── */}
          {activeSection === 'overview' && (
            <SectionCard title="Banking options overview" icon={<Landmark size={18} />}>
              <p className="mb-4 text-sm text-slate-600 leading-relaxed">
                As an international student you'll need to manage money across borders. Choosing the
                right bank early saves you fees and headaches throughout your studies.
              </p>
              <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Digital banks</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">Revolut, Wise, N26</p>
                  <p className="mt-0.5 text-xs text-slate-500">Best for most students — instant setup, low fees, mobile-first</p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Traditional banks</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">Local high-street banks</p>
                  <p className="mt-0.5 text-xs text-slate-500">May be required for rent payments or local transactions</p>
                </div>
              </div>
              <BulletList
                items={[
                  'Student-friendly features: low fees, no minimum balance, mobile banking',
                  'Free accounts for students: many banks offer special student tiers',
                  'Multi-currency support: essential for managing money from home',
                  'English language support: easier onboarding and customer service',
                ]}
              />
              <div className="mt-5 space-y-2">
                <TipRow text="Open a digital bank account before you arrive — most accept remote applications and ship a card to your home address." />
                <TipRow text="Have a backup payment method (credit card) for emergencies or countries with limited digital-bank acceptance." />
              </div>
            </SectionCard>
          )}

          {/* ── Digital banks ── */}
          {activeSection === 'digital' && (
            <SectionCard title="Digital banking for students" icon={<Smartphone size={18} />}>
              <p className="mb-4 text-sm text-slate-500">
                Modern digital banks offer the best experience for international students — instant
                setup, no fees, and excellent currency exchange rates. All can be opened before
                arriving in your destination country.
              </p>
              <div className="space-y-3">
                <ExpandableCard title="Revolut">
                  <p className="mb-3">Multi-currency account with instant setup, great exchange rates, and both virtual and physical cards. The standard plan is free.</p>
                  <BulletList items={[
                    'Holds and spends in 30+ currencies at the real exchange rate',
                    'Instant spend notifications and card freezing',
                    'Virtual card available immediately after signup',
                    'Free standard plan; paid tiers unlock higher limits',
                  ]} />
                  <a href="https://www.revolut.com/" target="_blank" rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline">
                    revolut.com <ExternalLink size={13} />
                  </a>
                </ExpandableCard>
                <ExpandableCard title="Wise (formerly TransferWise)">
                  <p className="mb-3">Best for international transfers. Holds 40+ currencies and charges low, transparent fees — no hidden exchange-rate markups.</p>
                  <BulletList items={[
                    'Bank details in EUR, GBP, USD, and more — receive money like a local',
                    'Transparent fee breakdown before every transfer',
                    'Wise debit card spends at mid-market rate',
                    'Ideal for receiving money from parents abroad',
                  ]} />
                  <a href="https://wise.com/" target="_blank" rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline">
                    wise.com <ExternalLink size={13} />
                  </a>
                </ExpandableCard>
                <ExpandableCard title="N26">
                  <p className="mb-3">European digital bank with a free standard account and a clean mobile experience. Regulated in Germany, so deposits are covered by EU deposit insurance.</p>
                  <BulletList items={[
                    'Free standard account with a Mastercard',
                    'Available across the EU/EEA',
                    'Spaces feature for savings goals',
                    'Instant push notifications for every transaction',
                  ]} />
                  <a href="https://n26.com/" target="_blank" rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline">
                    n26.com <ExternalLink size={13} />
                  </a>
                </ExpandableCard>
              </div>
            </SectionCard>
          )}

          {/* ── Documents ── */}
          {activeSection === 'documents' && (
            <SectionCard title="Required documents" icon={<FileText size={18} />}>
              <p className="mb-4 text-sm text-slate-500">
                Documents vary by bank and country, but these are the most commonly requested for
                international student accounts. Digital banks generally ask for fewer documents.
              </p>
              <div className="space-y-2">
                {[
                  { label: 'Valid passport', notes: 'Primary identity document — required by all banks' },
                  { label: 'Student visa or residence permit', notes: 'May be requested once you arrive' },
                  { label: 'University enrollment letter', notes: 'Confirms your student status' },
                  { label: 'Proof of address', notes: 'Rental contract or utility bill in your name' },
                  { label: 'Tax identification number', notes: 'Varies by country — see the Tax ID tab' },
                  { label: 'Codice Fiscale (Italy)', notes: 'Mandatory for any financial account in Italy' },
                ].map((doc) => (
                  <div key={doc.label} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                    <FileText size={15} className="mt-0.5 flex-shrink-0 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{doc.label}</p>
                      <p className="text-xs text-slate-500">{doc.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-2">
                <TipRow text="Digital document verification (photo upload) is standard for online banks — keep high-quality scans ready." />
                <TipRow text="Contact your university's international office for a letter confirming enrollment — it speeds up the process." />
              </div>
            </SectionCard>
          )}

          {/* ── Opening account ── */}
          {activeSection === 'opening' && (
            <SectionCard title="Opening an account" icon={<ClipboardList size={18} />}>
              <p className="mb-4 text-sm text-slate-500">
                Most digital banks let you open an account entirely online in under 10 minutes. Physical cards are shipped within a few days.
              </p>
              <ol className="space-y-3">
                {[
                  { step: 'Compare options', detail: 'Decide between digital, traditional, or both based on your needs.' },
                  { step: 'Gather documents', detail: 'Passport, enrollment letter, proof of address (where required).' },
                  { step: 'Apply online', detail: 'Most digital banks can be set up before you arrive in the country.' },
                  { step: 'Complete identity verification', detail: 'Video selfie or live check — usually takes a few minutes.' },
                  { step: 'Receive your card', detail: 'Virtual card available immediately; physical card ships in 3–5 days.' },
                  { step: 'Activate and set up mobile banking', detail: 'Enable notifications, Face ID, and set your PIN.' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                      {i + 1}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-800">{item.step} — </span>
                      {item.detail}
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-5 space-y-2">
                <TipRow text="Keep digital copies of all submitted documents — you may be asked to re-submit." />
                <TipRow text="Video verification is standard for remote onboarding; ensure you have good lighting and a stable internet connection." />
              </div>
            </SectionCard>
          )}

          {/* ── Transfers ── */}
          {activeSection === 'transfers' && (
            <SectionCard title="International transfers" icon={<ArrowRightLeft size={18} />}>
              <p className="mb-4 text-sm text-slate-500">
                Traditional bank wires are slow and expensive. Using the right service can save you
                significantly on every transfer.
              </p>
              <div className="mb-5 space-y-3">
                <ExpandableCard title="Wise — best for most corridors">
                  <BulletList items={[
                    'Uses the real mid-market exchange rate with a small transparent fee',
                    'Transfers typically arrive in 1–2 business days',
                    'Fee shown upfront before you confirm',
                    'Compare fees for your specific currency pair at wise.com',
                  ]} />
                </ExpandableCard>
                <ExpandableCard title="Revolut — great for EUR moves">
                  <BulletList items={[
                    'Free currency conversion up to monthly limits on the standard plan',
                    'Weekend surcharge applies outside market hours — transfer on weekdays',
                    'Instant transfers between Revolut users',
                  ]} />
                </ExpandableCard>
                <ExpandableCard title="Traditional banks — when to use">
                  <BulletList items={[
                    'Some landlords or institutions require a SEPA bank transfer',
                    'Always get a fee quote before sending — markups can be 2–4%',
                    'Use OANDA or XE.com to check the mid-market rate for comparison',
                  ]} />
                </ExpandableCard>
              </div>
              <TipRow text="Beware of 'zero fee' marketing — banks often hide the cost in a worse exchange rate. Always compare the final amount received." />
            </SectionCard>
          )}

          {/* ── Finances ── */}
          {activeSection === 'finances' && (
            <SectionCard title="Managing your finances" icon={<BarChart2 size={18} />}>
              <p className="mb-4 text-sm text-slate-500">
                Your banking app is your best tool for staying on top of spending — most modern apps
                include built-in analytics and goal features.
              </p>
              <BulletList items={[
                'Enable spending categories so you can see where your money goes each month',
                'Set monthly limits by category (food, transport, entertainment)',
                'Set up savings goals or Spaces (N26) / Vaults (Revolut) for one-off expenses',
                'Enable contactless payments and add your card to Apple Pay or Google Pay',
                'Keep an emergency fund of 1–2 months of expenses accessible in your account',
              ]} />
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Local payments</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">Contactless & mobile pay</p>
                  <p className="mt-0.5 text-xs text-slate-500">Apple Pay and Google Pay are widely accepted across Europe</p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Security</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">2FA + strong password</p>
                  <p className="mt-0.5 text-xs text-slate-500">Report lost or stolen cards immediately via the app</p>
                </div>
              </div>
            </SectionCard>
          )}

          {/* ── Tax ID ── */}
          {activeSection === 'tax' && (
            <SectionCard title="Tax identification numbers" icon={<Hash size={18} />}>
              <p className="mb-4 text-sm text-slate-500">
                Most countries require a tax ID to open a bank account. It's usually free to obtain
                and can often be requested online or at a local office.
              </p>
              <div className="space-y-2">
                {[
                  {
                    country: 'Italy',
                    name: 'Codice Fiscale',
                    detail: 'Mandatory for all financial accounts. Request online via the Agenzia delle Entrate website or at any local tax office.',
                    link: 'https://www.agenziaentrate.gov.it',
                    linkLabel: 'agenziaentrate.gov.it',
                  },
                  {
                    country: 'Germany',
                    name: 'Steuer-ID',
                    detail: 'Automatically assigned by post within 3 months of registering your address (Anmeldung). Can be requested from Bundeszentralamt für Steuern.',
                    link: 'https://www.bzst.de',
                    linkLabel: 'bzst.de',
                  },
                  {
                    country: 'Spain',
                    name: 'NIE number',
                    detail: 'Required for all financial and legal matters. Apply at a Policía Nacional office or the Spanish consulate in your home country.',
                    link: null,
                    linkLabel: null,
                  },
                ].map((item) => (
                  <div key={item.country} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-slate-800">{item.country}</span>
                      <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-600">{item.name}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.detail}</p>
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noopener noreferrer"
                        className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline">
                        {item.linkLabel} <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-2">
                <TipRow text="For Italy: you can apply for the Codice Fiscale at the Italian consulate in your home country before you arrive." />
                <TipRow text="Check with your university's international office — they often help students obtain their tax ID on arrival." />
              </div>
            </SectionCard>
          )}

          {/* ── Budgeting ── */}
          {activeSection === 'budgeting' && (
            <SectionCard title="Budgeting tips" icon={<PiggyBank size={18} />}>
              <p className="mb-4 text-sm text-slate-500">
                The first month is the most important — track everything carefully to establish your
                baseline before setting a budget.
              </p>
              <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-center">
                  <p className="text-2xl font-bold text-blue-700">50%</p>
                  <p className="mt-0.5 text-xs font-medium text-blue-600">Needs</p>
                  <p className="mt-0.5 text-xs text-slate-500">Rent, food, transport</p>
                </div>
                <div className="rounded-lg border border-violet-100 bg-violet-50 p-3 text-center">
                  <p className="text-2xl font-bold text-violet-700">30%</p>
                  <p className="mt-0.5 text-xs font-medium text-violet-600">Wants</p>
                  <p className="mt-0.5 text-xs text-slate-500">Dining out, entertainment</p>
                </div>
                <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-700">20%</p>
                  <p className="mt-0.5 text-xs font-medium text-emerald-600">Savings</p>
                  <p className="mt-0.5 text-xs text-slate-500">Emergency fund, travel</p>
                </div>
              </div>
              <BulletList items={[
                'Use your banking app\'s spending analytics to review categories weekly',
                'Student discounts on banking fees: many banks offer free accounts for students',
                'Avoid ATM fees by using your bank\'s own ATM network',
                'Emergency fund target: aim for 1–2 months of living expenses',
                'Cost-of-living calculators on student platforms can help set expectations before you arrive',
              ]} />
              <div className="mt-5 space-y-2">
                <TipRow text="Track spending for the first month without restrictions — then use real data to set your budget categories." />
                <TipRow text="Connect with other students about their monthly costs — local insight beats any calculator." />
              </div>
            </SectionCard>
          )}

        </StepPageLayout>
      </DashboardLayout>
    </>
  )
}