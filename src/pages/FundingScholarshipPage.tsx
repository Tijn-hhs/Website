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
  Info,
  Award,
  FileText,
  CalendarClock,
  Lightbulb,
  Link as LinkIcon,
  BadgeDollarSign,
  Globe,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react'

const CHECKLIST_STORAGE_KEY = 'dashboard-checklist:funding-scholarships'

const PAGE_SECTIONS = [
  { id: 'overview',  label: 'Overview',       icon: BadgeDollarSign },
  { id: 'merit',     label: 'Merit awards',   icon: Award },
  { id: 'income',    label: 'Income aid',     icon: TrendingUp },
  { id: 'external',  label: 'External',       icon: Globe },
  { id: 'deadlines', label: 'Deadlines',      icon: CalendarClock },
  { id: 'documents', label: 'Documents',      icon: FileText },
  { id: 'tips',      label: 'Insider tips',   icon: Lightbulb },
  { id: 'links',     label: 'Key links',      icon: LinkIcon },
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

function Badge({ label, variant }: { label: string; variant: 'required' | 'optional' | 'tip' | 'warning' | 'info' }) {
  const styles: Record<string, string> = {
    required: 'bg-red-50 text-red-700 border-red-200',
    optional: 'bg-slate-100 text-slate-600 border-slate-200',
    tip:      'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning:  'bg-amber-50 text-amber-700 border-amber-200',
    info:     'bg-blue-50 text-blue-700 border-blue-200',
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
        <ChevronDown size={16} className={`flex-shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="border-t border-slate-200 px-4 pb-4 pt-3 text-sm text-slate-600">{children}</div>
      )}
    </div>
  )
}

function ChecklistItem({
  itemKey, label, notes, checked, onChange,
}: {
  itemKey: string; label: string; notes?: string; checked: boolean; onChange: (key: string, val: boolean) => void
}) {
  return (
    <div className={`rounded-lg border transition-colors ${checked ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-start gap-3 px-4 py-3">
        <button onClick={() => onChange(itemKey, !checked)} className="mt-0.5 flex-shrink-0 focus:outline-none" aria-label={checked ? 'Mark incomplete' : 'Mark done'}>
          {checked
            ? <CheckCircle2 size={18} className="text-emerald-500" />
            : <Circle size={18} className="text-slate-300 hover:text-slate-500 transition-colors" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-medium ${checked ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{label}</p>
          {notes && <p className="mt-0.5 text-xs text-slate-400">{notes}</p>}
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function FundingScholarshipPage() {
  const { showModal, handleConfirm, handleBack } = useStepIntro('funding-scholarships')
  const [activeSection, setActiveSection] = useState('overview')
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({})
  const [programLevel, setProgramLevel] = useState<'bachelor' | 'master'>('master')
  const [isEuCitizen, setIsEuCitizen] = useState<boolean | null>(null)
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
    const load = async () => {
      try {
        const data = await fetchMe()
        const degree = data?.profile?.degreeType?.toLowerCase()
        setProgramLevel(degree === 'bachelor' ? 'bachelor' : 'master')
        setIsEuCitizen(data?.profile?.isEuCitizen === 'yes')
      } catch { /* keep defaults */ }
    }
    load()
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(CHECKLIST_STORAGE_KEY)
      if (saved) { try { setChecklistState(JSON.parse(saved)) } catch { setChecklistState({}) } }
    }
  }, [])

  const requirements = getStepRequirements('funding-scholarships') || []
  const checklistItems = requirements.map((req) => ({ ...req, completed: checklistState[req.id] || false }))

  const handleChecklistToggle = (id: string, completed: boolean) => {
    const newState = { ...checklistState, [id]: completed }
    setChecklistState(newState)
    if (typeof window !== 'undefined') window.localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(newState))
  }

  return (
    <>
      {showModal && (
        <StepIntroModal
          stepTitle="Funding & Scholarships"
          stepDescription="Discover merit awards, income-based grants, and external scholarships available to you as an international student."
          onConfirm={handleConfirm}
          onBack={handleBack}
        />
      )}
      <FeedbackWidget />
        <StepPageLayout
          stepNumber={2}
          totalSteps={9}
          stepLabel="STEP 2"
          title="Funding & Scholarships"
          subtitle={
            <span>
              Merit awards, income-based grants, and external scholarships for{' '}
              <span className="font-semibold text-slate-800">international students at Bocconi</span>.
            </span>
          }
          userInfoTitle="Content is personalised to your profile"
          userInfoSubtitle={
            <>
              Showing options for:{' '}
              <strong className="font-semibold text-slate-700">
                {programLevel === 'bachelor' ? 'Bachelor of Science' : 'Master of Science'}
              </strong>
              {'. '}Update in{' '}
              <a href="/dashboard/my-situation" className="text-blue-600 hover:underline">My Situation</a>.
            </>
          }
          userInfoFields={[
            { key: 'degreeType', label: 'Degree Type' },
            { key: 'isEuCitizen', label: 'EU Citizen' },
            { key: 'destinationUniversity', label: 'University' },
          ]}
          checklistItems={checklistItems}
          onChecklistItemToggle={handleChecklistToggle}
          showChecklist={false}
          useGradientBar={true}
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
            <>
              <SectionCard title="Funding overview" icon={<BadgeDollarSign size={18} />}>
                <p className="text-sm text-slate-600 leading-relaxed">
                  As an international student at Bocconi, you can significantly reduce — or even eliminate — your tuition through a combination of merit-based scholarships, income-based financial aid, and external grants. The total tuition for a Bocconi MSc is between <strong className="text-slate-800">€14,000–€15,000/year</strong> for non-EU students and uses a sliding scale based on family income for EU students. With the right scholarships, many students pay significantly less.
                </p>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-violet-500">Merit-based</p>
                    <p className="mt-1 text-lg font-bold text-violet-900">Excellence Award</p>
                    <p className="mt-0.5 text-sm text-violet-700">Full tuition waiver + €11,000/yr living allowance</p>
                    <p className="mt-2 text-xs text-violet-500">Auto-considered at application</p>
                  </div>
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">Income-based</p>
                    <p className="mt-1 text-lg font-bold text-blue-900">DSU Grant</p>
                    <p className="mt-0.5 text-sm text-blue-700">Full tuition coverage + up to €7,500 living allowance</p>
                    <p className="mt-2 text-xs text-blue-500">Apply via ISU Bocconi after enrollment</p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500">External</p>
                    <p className="mt-1 text-lg font-bold text-emerald-900">Gov't & bilateral</p>
                    <p className="mt-0.5 text-sm text-emerald-700">Varies by country — can cover tuition and living costs</p>
                    <p className="mt-2 text-xs text-emerald-500">Apply through your home country</p>
                  </div>
                </div>

                <div className="mt-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <Lightbulb size={16} className="mt-0.5 flex-shrink-0 text-amber-500" />
                  <p className="text-sm text-amber-800">
                    <strong>Key insight:</strong> Merit awards are automatically considered at the time of your university application — no separate form needed. Income-based grants (DSU) require a separate application <em>after</em> you are admitted and enrolled. Start both processes in parallel.
                  </p>
                </div>
              </SectionCard>

              <SectionCard title="Can I combine scholarships?" icon={<Info size={18} />}>
                <p className="text-sm text-slate-600 mb-4">
                  Yes — in many cases Bocconi merit awards and DSU grants can be combined, effectively covering both tuition and living costs. However, some external scholarships may not stack with Bocconi's own awards. Always verify with the Bocconi International Office.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                        <th className="pb-2 pr-4">Scholarship</th>
                        <th className="pb-2 pr-4">Covers</th>
                        <th className="pb-2">Stackable?</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="align-top">
                        <td className="py-2.5 pr-4 font-medium text-slate-800">Excellence Award</td>
                        <td className="py-2.5 pr-4 text-slate-600">Full tuition + €11,000 living</td>
                        <td className="py-2.5 text-emerald-700 font-medium">Yes — with DSU</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-2.5 pr-4 font-medium text-slate-800">Merit Award</td>
                        <td className="py-2.5 pr-4 text-slate-600">Partial tuition reduction</td>
                        <td className="py-2.5 text-emerald-700 font-medium">Yes — with DSU</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-2.5 pr-4 font-medium text-slate-800">DSU Grant</td>
                        <td className="py-2.5 pr-4 text-slate-600">Tuition + living allowance</td>
                        <td className="py-2.5 text-emerald-700 font-medium">Yes — with merit awards</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-2.5 pr-4 font-medium text-slate-800">External (gov't)</td>
                        <td className="py-2.5 pr-4 text-slate-600">Varies</td>
                        <td className="py-2.5 text-amber-700 font-medium">Check individually</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            </>
          )}

          {/* ── Merit awards ── */}
          {activeSection === 'merit' && (
            <SectionCard title="Bocconi merit-based awards" icon={<Award size={18} />}>
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                <Info size={16} className="mt-0.5 flex-shrink-0 text-blue-500" />
                <span>
                  All merit awards are assessed <strong>automatically</strong> when you submit your Bocconi application — no separate scholarship form is needed. Higher application rounds may offer stronger scholarship chances as fewer spots are taken.
                </span>
              </div>

              <div className="space-y-3">
                <ExpandableCard
                  title="Bocconi Excellence Award"
                  badge={<Badge label="Highly competitive" variant="warning" />}
                >
                  <p className="mb-3">
                    The most prestigious Bocconi scholarship. Covers <strong>full tuition</strong> plus an annual living allowance of approximately <strong>€11,000</strong>. It is awarded to a small number of exceptional students each year.
                  </p>
                  <ul className="space-y-1.5 mb-3">
                    {[
                      'Outstanding academic record (top of class, high GPA)',
                      'Strong GMAT/GRE score (700+ strongly recommended for MSc)',
                      'Compelling motivation letter and application essays',
                      'Professional or extracurricular achievements',
                      'No separate application required — automatic consideration',
                    ].map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-400" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                  <a href="https://www.unibocconi.eu/en/programs/master-science/scholarships-and-financial-aid" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm">
                    Official scholarship page <ExternalLink size={12} />
                  </a>
                </ExpandableCard>

                <ExpandableCard
                  title="Bocconi Merit Award"
                  badge={<Badge label="Partial tuition" variant="info" />}
                >
                  <p className="mb-3">
                    A partial tuition reduction awarded to strong applicants. The award percentage varies and is determined by your overall application score. Reductions can range from <strong>10% to 50%+ of annual tuition</strong>.
                  </p>
                  <ul className="space-y-1.5 mb-3">
                    {[
                      'Based on academic performance and entrance test score',
                      'GMAT/GRE submission improves your score significantly',
                      'Awarded automatically — no separate application',
                      'Renewable each year based on academic performance at Bocconi',
                    ].map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </ExpandableCard>

                {programLevel === 'bachelor' && (
                  <ExpandableCard
                    title="BSc Merit Scholarship"
                    badge={<Badge label="Bachelor only" variant="info" />}
                  >
                    <p className="mb-3">
                      Bachelor applicants can receive merit-based tuition reductions, evaluated based on their secondary school grades, entrance test performance, and (if applicable) standardised test scores such as the SAT.
                    </p>
                    <ul className="space-y-1.5">
                      {[
                        'High school GPA / leaving certificate grades are the primary factor',
                        'SAT/ACT scores can strengthen the application but are not required',
                        'Bocconi Online Test score is also factored in',
                      ].map((pt, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400" />
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </ExpandableCard>
                )}

                <ExpandableCard
                  title="ISU Tuition Bands (sliding-scale tuition)"
                  badge={<Badge label="Income-sensitive" variant="tip" />}
                >
                  <p className="mb-3">
                    Bocconi uses a sliding-scale tuition system based on your family's economic situation. ISU Bocconi (the financial aid office) assesses your income and adjusts your annual tuition accordingly. EU and non-EU students both qualify.
                  </p>
                  <p className="mb-2 text-slate-700">
                    <strong>EU students:</strong> Submit an ISEE declaration (from the Italian Revenue Agency). Your tuition band is set accordingly — minimum band is approximately <strong>€1,000–3,000/year</strong>.
                  </p>
                  <p className="text-slate-700">
                    <strong>Non-EU students:</strong> Submit an ISEE parificato (income declaration translated and legalised). Process is more complex but significantly reduces tuition.
                  </p>
                </ExpandableCard>
              </div>
            </SectionCard>
          )}

          {/* ── Income aid ── */}
          {activeSection === 'income' && (
            <SectionCard title="Income-based financial aid" icon={<TrendingUp size={18} />}>
              <p className="mb-4 text-sm text-slate-500">
                Italy's right-to-study system (Diritto allo Studio Universitario) provides significant financial support to students from lower-income families. This is separate from merit awards and requires its own application after admission.
              </p>

              <div className="space-y-3">
                <ExpandableCard
                  title="DSU Borse di Studio (Regional scholarship)"
                  badge={<Badge label="Full tuition + living" variant="tip" />}
                >
                  <p className="mb-3">
                    The DSU scholarship from the Lombardy regional government (<em>DSU Lombardia</em>) can cover your entire tuition and provide a living allowance of approximately <strong>€5,000–7,500/year</strong>. It is assessed based on economic and merit criteria.
                  </p>
                  <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <p className="text-xs font-semibold text-slate-500 mb-1">Economic threshold</p>
                      <p className="text-sm text-slate-700">ISEE ≤ ~€26,306 (approx. — updated each year)</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <p className="text-xs font-semibold text-slate-500 mb-1">Merit threshold</p>
                      <p className="text-sm text-slate-700">Varies by year of study; first-year students have a lower bar</p>
                    </div>
                  </div>
                  <ul className="space-y-1.5 mb-3">
                    {[
                      'Application opens approximately July–September each year via the DSU/ISU Bocconi portal',
                      'Non-EU students must provide an ISEE parificato (requires legalising income documents from home country)',
                      'EU students submit a standard ISEE (via CAF office)',
                      'Scholarship is renewable each year if you meet the merit credits threshold',
                      'Money is disbursed in instalments throughout the academic year',
                    ].map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                  <a href="https://www.isu.unibocconi.it/en" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm">
                    ISU Bocconi financial aid <ExternalLink size={12} />
                  </a>
                </ExpandableCard>

                {isEuCitizen === false && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-amber-500" />
                      <div>
                        <p className="text-sm font-semibold text-amber-800">Non-EU: ISEE parificato required</p>
                        <p className="mt-1 text-sm text-amber-700">
                          As a non-EU student, you'll need an <strong>ISEE parificato</strong> to qualify for DSU. This requires your family's income documents to be translated into Italian, notarised, and submitted to the Italian consulate in your home country before arriving in Italy. Start this process early — it can take months.
                        </p>
                        <a href="https://www.isu.unibocconi.it/en/scholarships/isee-parificato" target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-amber-700 hover:underline text-xs font-medium">
                          ISEE parificato guide <ExternalLink size={11} />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                <ExpandableCard
                  title="ISU Bocconi Emergency Fund"
                  badge={<Badge label="One-time support" variant="optional" />}
                >
                  <p className="mb-2">
                    ISU Bocconi also administers an emergency financial support fund for students who encounter unexpected financial hardship during their studies. Applications are assessed case-by-case.
                  </p>
                  <p className="text-slate-500">Contact ISU Bocconi directly to apply or learn more about eligibility.</p>
                </ExpandableCard>

                <ExpandableCard
                  title="Bocconi Part-Time Work Opportunities"
                  badge={<Badge label="Supplemental income" variant="optional" />}
                >
                  <p className="mb-2">
                    Bocconi DSU scholarship recipients who qualify for "resident student" benefits may have access to part-time work opportunities on campus. Non-EU students can work up to <strong>20 hours/week</strong> with a valid student visa in Italy.
                  </p>
                  <ul className="space-y-1.5">
                    {[
                      'Bocconi library, IT support, tutoring, and event assistance roles are available',
                      'Pay typically €7–12/hr depending on the role',
                      'Check the Bocconi Jobs4Students portal each semester',
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

          {/* ── External scholarships ── */}
          {activeSection === 'external' && (
            <SectionCard title="External scholarships & grants" icon={<Globe size={18} />}>
              <p className="mb-4 text-sm text-slate-500">
                Many students fund part of their studies through scholarships from their home government, international organisations, or foundations. These are separate from Bocconi's own awards and should be researched before you apply.
              </p>

              <div className="space-y-3">
                <ExpandableCard
                  title="Italian Government Scholarships (MAECI)"
                  badge={<Badge label="Non-EU" variant="info" />}
                >
                  <p className="mb-2">
                    The Italian Ministry of Foreign Affairs (MAECI) offers scholarships for international students through bilateral agreements with many countries. These can cover tuition, accommodation, and health insurance.
                  </p>
                  <ul className="space-y-1 mb-3">
                    {[
                      'Available to students from ~180 countries — check if your country qualifies',
                      'Applications are submitted via the Italian diplomatic mission in your home country',
                      'Application period: typically January–March for the following academic year',
                      'Covers tuition and may include a monthly stipend',
                    ].map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                  <a href="https://www.esteri.it/it/opportunita/borse-di-studio/per-stranieri/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm">
                    MAECI scholarship portal <ExternalLink size={12} />
                  </a>
                </ExpandableCard>

                <ExpandableCard
                  title="Erasmus+ (EU students / partner universities)"
                  badge={<Badge label="EU & partner countries" variant="info" />}
                >
                  <p className="mb-2">
                    If you are coming to Bocconi through an Erasmus+ exchange agreement, you may be eligible for an Erasmus+ grant from your home institution. The monthly stipend depends on your country of origin and the country groups (Italy is Group 1).
                  </p>
                  <ul className="space-y-1">
                    {[
                      'Apply through your home university\'s international office, not Bocconi',
                      'Typical grants: €300–700/month depending on country classification',
                      'Only applicable for exchange students, not full-degree enrolment',
                    ].map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </ExpandableCard>

                <ExpandableCard
                  title="Home government scholarships"
                  badge={<Badge label="Varies by country" variant="optional" />}
                >
                  <p className="mb-2">Many national governments or agencies offer scholarships specifically for students going to study abroad in Europe. Some well-known examples:</p>
                  <ul className="space-y-1.5 mb-3">
                    {[
                      { country: 'Netherlands', scheme: 'Holland Scholarship (€5,000 one-off)' },
                      { country: 'Germany', scheme: 'DAAD (various, for German students abroad)' },
                      { country: 'UK', scheme: 'Chevening (for postgraduate, international focus)' },
                      { country: 'US', scheme: 'Fulbright (research & postgrad, highly competitive)' },
                      { country: 'Most countries', scheme: 'Rotary Foundation (Global Grant Scholarships)' },
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                        <span><strong className="text-slate-700">{item.country}:</strong> {item.scheme}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-slate-500">Search "[your country] government scholarship study abroad Italy" to find country-specific programmes.</p>
                </ExpandableCard>

                <ExpandableCard
                  title="Rotary Foundation Global Grant"
                  badge={<Badge label="International" variant="tip" />}
                >
                  <p className="mb-2">
                    The Rotary Foundation's Global Grant Scholarships fund graduate-level academic study (minimum 1 year) in one of Rotary's six focus areas. Grants typically range from <strong>$30,000 to $50,000+</strong>.
                  </p>
                  <ul className="space-y-1.5 mb-3">
                    {[
                      'Must align with one of Rotary\'s six focus areas (peace, disease prevention, water, etc.)',
                      'Requires support from both a Rotary club in your home district and the host district in Milan',
                      'Applications open approximately September–November through your local Rotary club',
                      'Contact Rotary District 2042 (Milan) for the host district endorsement',
                    ].map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                  <a href="https://www.rotary.org/en/our-programs/scholarships" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm">
                    Rotary Foundation scholarship page <ExternalLink size={12} />
                  </a>
                </ExpandableCard>

                <ExpandableCard
                  title="Corporate & foundation scholarships"
                  badge={<Badge label="Check eligibility" variant="optional" />}
                >
                  <p className="mb-2">
                    Various corporations (especially in consulting, finance, and FMCG) and foundations offer scholarships or bursaries for top talent pursuing business degrees.
                  </p>
                  <ul className="space-y-1.5">
                    {[
                      'Many consulting firms (McKinsey, BCG, Bain) run fellowship programmes in select markets',
                      'Foundations like the Soroptimist International and local community foundations offer smaller grants',
                      "Check your employer's HR policy — some companies part-fund graduate study",
                      'LinkedIn Scholarship Search and Scholarshipportal.eu are good starting points',
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

          {/* ── Deadlines ── */}
          {activeSection === 'deadlines' && (
            <SectionCard title="Key scholarship deadlines" icon={<CalendarClock size={18} />}>
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                <Info size={16} className="mt-0.5 flex-shrink-0 text-blue-500" />
                <span>
                  Merit awards are automatic — the deadlines that matter most are <strong>your Bocconi application round</strong> (earlier = better scholarship chances) and the <strong>DSU application window</strong> (opens after admission).
                </span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    label: 'Bocconi application Round 1',
                    detail: 'Highest scholarship priority — most Excellence Awards go to Round 1 applicants',
                    date: 'Nov–Dec (AY 2025–26: 12 Dec 2024)',
                    color: 'border-violet-200 bg-violet-50',
                    textColor: 'text-violet-800',
                    badgeColor: 'bg-violet-100 text-violet-700',
                    badgeLabel: 'Best chance',
                  },
                  {
                    label: 'Bocconi application Round 2',
                    detail: 'Merit awards still available, fewer Excellence Award spots remaining',
                    date: 'Jan–Feb (AY 2025–26: 6 Feb 2025)',
                    color: 'border-blue-200 bg-blue-50',
                    textColor: 'text-blue-800',
                    badgeColor: 'bg-blue-100 text-blue-700',
                    badgeLabel: 'Good chance',
                  },
                  {
                    label: 'ISEE / ISEE parificato submission',
                    detail: 'Required for DSU income-based aid and ISU tuition bands — start early, it takes time',
                    date: 'Typically July–September (year of enrollment)',
                    color: 'border-emerald-200 bg-emerald-50',
                    textColor: 'text-emerald-800',
                    badgeColor: 'bg-emerald-100 text-emerald-700',
                    badgeLabel: 'After admission',
                  },
                  {
                    label: 'DSU Borse di Studio application',
                    detail: 'Opens each year via the ISU Bocconi portal — must apply before the published deadline',
                    date: 'Typically August–September (check ISU Bocconi annually)',
                    color: 'border-emerald-200 bg-emerald-50',
                    textColor: 'text-emerald-800',
                    badgeColor: 'bg-emerald-100 text-emerald-700',
                    badgeLabel: 'After enrollment',
                  },
                  {
                    label: 'Italian Government (MAECI) bilateral scholarships',
                    detail: 'Applications through Italian consulates in your home country',
                    date: 'Varies by country — typically January–March',
                    color: 'border-slate-200 bg-slate-50',
                    textColor: 'text-slate-800',
                    badgeColor: 'bg-slate-100 text-slate-600',
                    badgeLabel: 'Home country',
                  },
                  {
                    label: 'Rotary Global Grants',
                    detail: 'Contact your local Rotary club to initiate the process',
                    date: 'September–November (18 months before study start)',
                    color: 'border-slate-200 bg-slate-50',
                    textColor: 'text-slate-800',
                    badgeColor: 'bg-slate-100 text-slate-600',
                    badgeLabel: 'Plan ahead',
                  },
                ].map((item, i) => (
                  <div key={i} className={`rounded-lg border p-4 ${item.color}`}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${item.textColor}`}>{item.label}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{item.detail}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold flex-shrink-0 ${item.badgeColor}`}>{item.badgeLabel}</span>
                    </div>
                    <p className="mt-2 text-xs font-medium text-slate-600">📅 {item.date}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-400">All dates are approximate. Verify on the official Bocconi and ISU Bocconi websites before applying.</p>
            </SectionCard>
          )}

          {/* ── Documents ── */}
          {activeSection === 'documents' && (() => {
            const docsState = checklistState
            const items = [
              { key: 'transcripts', label: 'Official academic transcripts', notes: 'Required for all scholarship applications — translated into English or Italian if needed', required: true },
              { key: 'motivation', label: 'Motivation letter / personal statement', notes: 'Strengthens both your university application and scholarship assessment', required: true },
              { key: 'cv', label: 'CV in EU/Europass format', notes: 'Include academic achievements, work experience, and any awards', required: true },
              { key: 'gmat', label: 'GMAT or GRE score (MSc applicants)', notes: 'Not mandatory but significantly improves Excellence Award chances', required: programLevel === 'master' },
              { key: 'isee', label: 'ISEE declaration (EU students)', notes: 'Required for DSU income-based grant — request via local CAF office', required: false },
              { key: 'isee-parificato', label: 'ISEE parificato (non-EU students)', notes: 'Income documents translated, notarised, and submitted to Italian consulate', required: false },
              { key: 'tax-docs', label: 'Family income / tax documents from home country', notes: 'Needed to prepare ISEE or ISEE parificato — gather originals early', required: false },
              { key: 'passport', label: 'Valid passport copy', notes: 'Required for all scholarship and income-aid applications', required: true },
              { key: 'references', label: 'Reference letters (academic or professional)', notes: 'Optional for internal awards, often required for external scholarships', required: false },
            ]
            const requiredItems = items.filter(d => d.required)
            const optionalItems = items.filter(d => !d.required)
            const checkedRequired = requiredItems.filter(d => docsState[d.key]).length
            const progressPct = requiredItems.length > 0 ? Math.round((checkedRequired / requiredItems.length) * 100) : 0

            return (
              <SectionCard title="Documents checklist" icon={<FileText size={18} />}>
                {/* Progress */}
                <div className="mb-5">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm text-slate-600"><span className="font-semibold text-slate-800">{checkedRequired} of {requiredItems.length}</span> required documents ready</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-emerald-400 transition-all duration-500" style={{ width: `${progressPct}%` }} />
                  </div>
                  {progressPct === 100 && (
                    <p className="mt-1.5 text-xs font-medium text-emerald-600">All required documents ready 🎉</p>
                  )}
                </div>

                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Core documents</p>
                <div className="mb-5 space-y-2">
                  {requiredItems.map((doc) => (
                    <ChecklistItem key={doc.key} itemKey={doc.key} label={doc.label} notes={doc.notes} checked={!!docsState[doc.key]} onChange={handleChecklistToggle} />
                  ))}
                </div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Income aid specific</p>
                <div className="space-y-2">
                  {optionalItems.map((doc) => (
                    <ChecklistItem key={doc.key} itemKey={doc.key} label={doc.label} notes={doc.notes} checked={!!docsState[doc.key]} onChange={handleChecklistToggle} />
                  ))}
                </div>
              </SectionCard>
            )
          })()}

          {/* ── Tips ── */}
          {activeSection === 'tips' && (
            <SectionCard title="Insider tips" icon={<Lightbulb size={18} />}>
              <div className="space-y-2">
                {[
                  'Apply in Round 1 — most Excellence Awards are given to Round 1 applicants. Even a month earlier can make a huge difference.',
                  'A strong GMAT score (700+) is one of the most reliable ways to improve your scholarship assessment. Even if your programme doesn\'t require it, submission is highly recommended.',
                  'Non-EU students: start your ISEE parificato process before you leave home. You need your family\'s income documents notarised and submitted to the Italian consulate — this can take 2–4 months.',
                  'EU students can get an ISEE declaration completed quickly through any local CAF (tax assistance centre) office in Italy — usually free of charge.',
                  'DSU applications are first-come, first-served for borderline cases. Submit as early as the portal opens in summer.',
                  'If you receive a DSU grant, make sure you accumulate the minimum required academic credits (CFU) each year to keep it. Falling below the threshold means losing the scholarship for the following year.',
                  'External scholarships (Rotary, MAECI, government) must usually be arranged 6–18 months before your program starts — research these at the very beginning of your application process.',
                  'ISU Bocconi holds regular financial aid info sessions for incoming students in September — attend early to understand all options.',
                  'Academic merit and scholarship decisions are made partly based on your application letter. A well-crafted, authentic motivation letter matters more than many students realise.',
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm text-slate-700">
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
                {[
                  { label: 'ISU Bocconi — financial aid portal', url: 'https://www.isu.unibocconi.it/en' },
                  { label: 'Bocconi scholarships overview page', url: 'https://www.unibocconi.eu/en/programs/master-science/scholarships-and-financial-aid' },
                  { label: 'DSU Lombardia scholarship info', url: 'https://www.dsu.lombardia.it/en' },
                  { label: 'ISEE parificato guide (ISU)', url: 'https://www.isu.unibocconi.it/en/scholarships/isee-parificato' },
                  { label: 'Italian MAECI government scholarships', url: 'https://www.esteri.it/it/opportunita/borse-di-studio/per-stranieri/' },
                  { label: 'Rotary Foundation scholarships', url: 'https://www.rotary.org/en/our-programs/scholarships' },
                  { label: 'ScholarshipPortal.eu — search tool', url: 'https://www.scholarshipportal.com' },
                  { label: 'Euraxess — research funding database', url: 'https://euraxess.ec.europa.eu/jobs-funding/funding' },
                  { label: 'Bocconi official apply portal', url: 'https://apply.unibocconi.it' },
                  { label: 'CAF — ISEE declaration help', url: 'https://www.cafacli.it/en/' },
                ].map((link) => (
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
    </>
  )
}
