import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import StepCard from './StepCard'
import DeadlineModal from './DeadlineModal'
import { fetchMe, saveStepProgress, fetchDeadlines, createDeadline, updateDeadline, deleteDeadline } from '../lib/api'
import type { Deadline } from '../lib/api'
import { StepProgress, UserProfile } from '../types/user'
import {
  GraduationCap,
  FileText,
  Plane,
  ClipboardList,
  Home,
  Shield,
  Heart,
  HelpCircle,
  DollarSign,
  CreditCard,
  Hash,
  Users,
  Sparkles,
  Plus,
  Award,
} from 'lucide-react'

const numberedSteps = [
  'University Application',
  'Funding & Scholarships',
  'Student Visa',
  'Codice Fiscale',
  'Before Departure',
  'Residence Permit',
  'Housing',
  'Banking',
  'Insurance',
  'Healthcare',
]

const extraInformationSteps = [
  'Information Centre',
  'Cost of Living',
  'Buddy System',
  'AI Support',
  'Find Your Peers',
]

const steps = [...numberedSteps, ...extraInformationSteps]

const stepRoutes: Record<string, string | undefined> = {
  'University Application': '/dashboard/university-application',
  'Funding & Scholarships': '/dashboard/funding-scholarships',
  'Student Visa': '/dashboard/student-visa',
  'Codice Fiscale': '/dashboard/codice-fiscale',
  'Before Departure': '/dashboard/before-departure',
  'Residence Permit': '/dashboard/immigration-registration',
  Housing: '/dashboard/housing',
  Banking: '/dashboard/banking',
  Insurance: '/dashboard/insurance',
  Healthcare: '/dashboard/healthcare',
  'Information Centre': '/dashboard/information-centre',
  'Cost of Living': '/dashboard/cost-of-living',
  'Buddy System': '/dashboard/buddy-system',
  'AI Support': '/dashboard/ai-support',
  'Find Your Peers': '/dashboard/find-your-peers',
}

const stepKeys: Record<string, string> = {
  'University Application': 'university-application',
  'Funding & Scholarships': 'funding-scholarships',
  'Student Visa': 'student-visa',
  'Codice Fiscale': 'codice-fiscale',
  'Before Departure': 'before-departure',
  'Residence Permit': 'immigration-registration',
  Housing: 'housing',
  Banking: 'banking',
  Insurance: 'insurance',
  Healthcare: 'healthcare',
  'Information Centre': 'information-centre',
  'Cost of Living': 'cost-of-living',
  'Buddy System': 'buddy-system',
  'AI Support': 'ai-support',
  'Find Your Peers': 'find-your-peers',
}

const stepIcons: Record<string, React.ReactNode> = {
  'University Application': <GraduationCap size={20} className="flex-shrink-0" />,
  'Funding & Scholarships': <Award size={20} className="flex-shrink-0" />,
  'Student Visa': <FileText size={20} className="flex-shrink-0" />,
  'Codice Fiscale': <Hash size={20} className="flex-shrink-0" />,
  'Before Departure': <Plane size={20} className="flex-shrink-0" />,
  'Residence Permit': <ClipboardList size={20} className="flex-shrink-0" />,
  Housing: <Home size={20} className="flex-shrink-0" />,
  Banking: <CreditCard size={20} className="flex-shrink-0" />,
  Insurance: <Shield size={20} className="flex-shrink-0" />,
  Healthcare: <Heart size={20} className="flex-shrink-0" />,
  'Information Centre': <HelpCircle size={20} className="flex-shrink-0" />,
  'Cost of Living': <DollarSign size={20} className="flex-shrink-0" />,
  'Buddy System': <Users size={20} className="flex-shrink-0" />,
  'AI Support': <Sparkles size={20} className="flex-shrink-0" />,
  'Find Your Peers': <Users size={20} className="flex-shrink-0" />,
}

const stepDescriptions: Record<string, string> = {
  'University Application': 'Research programs, prepare documents, and submit your university applications.',
  'Funding & Scholarships': 'Discover merit awards, income-based grants, and external scholarships to fund your studies.',
  'Student Visa': 'Apply for your student visa and prepare all required documentation.',
  'Codice Fiscale': 'Obtain your Italian tax identification number (codice fiscale).',
  'Before Departure': 'Get vaccinations, arrange travel, and prepare for your move.',
  'Residence Permit': 'Complete immigration procedures and register with local authorities.',
  Housing: 'Find and secure accommodation for your stay.',
  Banking: 'Set up bank accounts and manage financial essentials.',
  Insurance: 'Arrange insurance coverage for health and personal protection.',
  Healthcare: 'Register with healthcare providers and understand the system.',
  'Information Centre': 'Access comprehensive guides and local resources.',
  'Cost of Living': 'Understand expenses and budget for your stay.',
  'Buddy System': 'Connect with fellow students for housing, bureaucracy help, and friendship.',
  'AI Support': 'Get personalised answers about your move to Italy from an AI that knows your profile.',
  'Find Your Peers': 'Find the WhatsApp, Telegram, or Discord group chat for your programme and intake year.',
}

interface TimelineMilestone {
  id: string
  label: string
  date: Date
  isProgramStart?: boolean
  isMock?: boolean
  templateKey?: string
  emoji: string
}

// Default suggested milestones relative to program start (in days)
const MOCK_MILESTONES: { label: string; daysOffset: number; emoji: string; templateKey: string }[] = [
  { label: 'Book your flight',         daysOffset: -90, emoji: '🔖', templateKey: 'book-flight' },
  { label: 'Find your apartment',      daysOffset: -60, emoji: '🏠', templateKey: 'find-apartment' },
  { label: 'Get health insurance',     daysOffset: -30, emoji: '🩺', templateKey: 'get-health-insurance' },
  { label: 'Fly to Italy ✈️',          daysOffset: -5,  emoji: '✈️', templateKey: 'fly-to-italy' },
  { label: 'Move into apartment',      daysOffset: -2,  emoji: '📦', templateKey: 'move-into-apartment' },
]

function getMilestoneStyle(date: Date, today: Date, isProgramStart?: boolean) {
  if (isProgramStart) return 'end'
  const diff = date.getTime() - today.getTime()
  if (diff < 0)              return 'past'
  if (diff < 3  * 86400000) return 'urgent'
  if (diff < 14 * 86400000) return 'soon'
  return 'future'
}

function ProgramTimeline({
  programStartMonth,
  deadlines,
  onAddDeadline,
  onEditDeadline,
  onClaimMilestone,
}: {
  programStartMonth: string
  deadlines: Deadline[]
  onAddDeadline: () => void
  onEditDeadline: (deadline: Deadline) => void
  onClaimMilestone: (m: { title: string; suggestedDate: string; templateKey: string; emoji: string }) => void
}) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const programStartDate = new Date(`${programStartMonth}-01`)
  const daysToStart = Math.ceil((programStartDate.getTime() - today.getTime()) / 86400000)

  // Merge mock defaults + user deadlines + program start, sorted by date
  // Mocks are hidden once the user has claimed them (matched by templateKey)
  const claimedKeys = new Set(deadlines.map(d => d.templateKey).filter(Boolean))

  const milestones: TimelineMilestone[] = [
    ...MOCK_MILESTONES
      .filter(m => !claimedKeys.has(m.templateKey))
      .map((m) => ({
        id: `mock-${m.daysOffset}`,
        label: m.label,
        date: new Date(programStartDate.getTime() + m.daysOffset * 86400000),
        isMock: true,
        templateKey: m.templateKey,
        emoji: m.emoji,
      })),
    ...deadlines.map((d) => ({
      id: d.deadlineId,
      label: d.title,
      date: new Date(d.dueDate),
      // Use the original milestone emoji if it was claimed from a template
      emoji: d.templateKey
        ? (MOCK_MILESTONES.find(m => m.templateKey === d.templateKey)?.emoji ?? '📌')
        : '📌',
    })),
    {
      id: 'program-start',
      label: 'Program Start',
      date: programStartDate,
      isProgramStart: true,
      emoji: '🎓',
    },
  ].sort((a, b) => a.date.getTime() - b.date.getTime())

  // Range for today marker: first milestone → program start + small padding
  const rangeStart = new Date(milestones[0].date.getTime() - 4 * 86400000)
  const rangeEnd   = new Date(programStartDate.getTime()  + 4 * 86400000)
  const totalMs    = rangeEnd.getTime() - rangeStart.getTime()

  // Today marker uses real proportional position on the track
  const todayPct = Math.max(0, Math.min(100,
    ((today.getTime() - rangeStart.getTime()) / totalMs) * 100
  ))
  const programStartPct = Math.max(0, Math.min(100,
    ((programStartDate.getTime() - rangeStart.getTime()) / totalMs) * 100
  ))

  // Cushioned-proportional spacing:
  // 1. Start from real proportional positions (preserves relative distance feel).
  // 2. Forward-push any dot that's too close to its left neighbour.
  // 3. If the last dot would exceed the track, squeeze everything back.
  const MIN_GAP = 12   // % – wide enough so 6.5rem labels never collide
  const TRACK_START = 2
  const TRACK_END   = 97

  const rawPcts = milestones.map(m =>
    Math.max(TRACK_START, Math.min(TRACK_END,
      ((m.date.getTime() - rangeStart.getTime()) / totalMs) * 100
    ))
  )

  const dotPcts = [...rawPcts]
  // Forward pass: push right if too close
  for (let i = 1; i < dotPcts.length; i++) {
    if (dotPcts[i] < dotPcts[i - 1] + MIN_GAP) {
      dotPcts[i] = dotPcts[i - 1] + MIN_GAP
    }
  }
  // If last dot overflowed, scale the entire array back into [TRACK_START, TRACK_END]
  if (dotPcts[dotPcts.length - 1] > TRACK_END) {
    const lo = dotPcts[0]
    const hi = dotPcts[dotPcts.length - 1]
    for (let i = 0; i < dotPcts.length; i++) {
      dotPcts[i] = TRACK_START + ((dotPcts[i] - lo) / (hi - lo)) * (TRACK_END - TRACK_START)
    }
  }

  // Next upcoming milestone (soonest future, non-program-start)
  const nextUpId = milestones
    .filter(m => !m.isProgramStart && m.date.getTime() > today.getTime())
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0]?.id ?? null
  const nextUpIdx = nextUpId ? milestones.findIndex(m => m.id === nextUpId) : -1
  const nextUpPct = nextUpIdx >= 0 ? dotPcts[nextUpIdx] : programStartPct

  // Header progress stat
  const confirmedCount = deadlines.length
  const totalMilestoneCount = milestones.length - 1 // exclude program-start dot

  const trackDot: Record<string, string> = {
    past:    'bg-slate-300 border-2 border-slate-300',
    urgent:  'bg-red-500   border-2 border-red-400   ring-4 ring-red-100',
    soon:    'bg-amber-400 border-2 border-amber-400 ring-4 ring-amber-100',
    future:  'bg-blue-500  border-2 border-blue-400  ring-4 ring-blue-100',
    end:     'bg-gradient-to-br from-blue-600 to-purple-600 border-2 border-purple-500 ring-4 ring-purple-100',
  }

  const labelCls: Record<string, string> = {
    past:   'text-slate-400',
    urgent: 'text-red-600 font-semibold',
    soon:   'text-amber-600 font-semibold',
    future: 'text-slate-700 font-medium',
    end:    'text-purple-700 font-bold',
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 bg-gradient-to-r from-[#1e1b4b] to-[#1e3a5f] flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Journey Timeline</h2>
          <p className="mt-0.5 text-sm text-blue-200">
            {daysToStart > 0
              ? `${daysToStart} days until program start`
              : daysToStart === 0
              ? '🎉 Program starts today!'
              : '✈️ You have arrived!'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-blue-200 bg-white/10 rounded-full px-3 py-1">
            {confirmedCount} / {totalMilestoneCount} milestones set
          </span>
          <button
            onClick={onAddDeadline}
            className="flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 text-sm font-medium text-white"
          >
            <Plus size={14} />
            Add deadline
          </button>
        </div>
      </div>

      {/* Horizontal timeline */}
      <div className="px-6 pb-8 pt-2">
        {/* Scrollable on mobile */}
        <div className="overflow-x-auto -mx-6 px-6">
        <div style={{ minWidth: '560px' }}>
        {/* date range labels */}
        <div className="flex justify-between mb-1">
          <span className="text-[10px] text-slate-400">
            {milestones[0].date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </span>
          <span className="text-[10px] text-slate-400">
            {programStartDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* The track area — labels alternate above/below */}
        <div className="relative" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
          {/* Track */}
          <div className="relative h-2.5 bg-slate-100 rounded-full">
            {/* Filled portion up to today */}
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-slate-300 to-slate-400"
              style={{ width: `${Math.min(todayPct, programStartPct)}%` }}
            />
            {/* Amber segment: today → next upcoming milestone */}
            {todayPct < nextUpPct && (
              <div
                className="absolute inset-y-0 rounded-full bg-gradient-to-r from-amber-400 to-amber-300 opacity-50"
                style={{ left: `${todayPct}%`, width: `${nextUpPct - todayPct}%` }}
              />
            )}
            {/* Blue segment: next upcoming → program start */}
            {nextUpPct < programStartPct && (
              <div
                className="absolute inset-y-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-30"
                style={{ left: `${nextUpPct}%`, width: `${programStartPct - nextUpPct}%` }}
              />
            )}

            {/* Milestone dots — cushioned-proportional spacing */}
            {milestones.map((m, i) => {
              const pct     = dotPcts[i]
              const style   = getMilestoneStyle(m.date, today, m.isProgramStart)
              const isAbove = i % 2 === 0

              return (
                <div
                  key={m.id}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                  style={{ left: `${pct}%`, opacity: 0, animation: `fadeIn 0.4s ease ${i * 0.07}s forwards` }}
                >
                  {/* Tick */}
                  <div
                    className={`absolute left-1/2 -translate-x-1/2 w-px bg-slate-200 ${
                      isAbove ? 'bottom-full mb-1 h-5' : 'top-full mt-1 h-5'
                    }`}
                  />

                  {/* Dot */}
                  <div
                    onClick={() => {
                      if (m.isMock && m.templateKey) {
                        onClaimMilestone({
                          title: m.label,
                          suggestedDate: m.date.toISOString().slice(0, 10),
                          templateKey: m.templateKey,
                          emoji: m.emoji,
                        })
                      } else if (!m.isMock && !m.isProgramStart) {
                        onEditDeadline(deadlines.find(d => d.deadlineId === m.id)!)
                      }
                    }}
                    title={m.isMock ? `Click to set your date for: ${m.label}` : undefined}
                    className={`flex items-center justify-center rounded-full transition-all ${
                      m.isProgramStart ? 'w-9 h-9' : 'w-6 h-6'
                    } ${trackDot[style]} ${
                      m.id === nextUpId ? 'ring-[5px] ring-amber-200 scale-110' : ''
                    } ${
                      !m.isProgramStart ? 'cursor-pointer hover:scale-125' : ''
                    }`}
                  >
                    <span className={m.isProgramStart ? 'text-sm' : 'text-[10px]'}>{m.emoji}</span>
                  </div>

                  {/* Label chip */}
                  <div
                    className={`absolute left-1/2 -translate-x-1/2 text-center ${
                      isAbove ? 'bottom-[calc(100%+1.75rem)]' : 'top-[calc(100%+1.75rem)]'
                    }`}
                    style={{ width: '7rem' }}
                  >
                    {m.id === nextUpId && (
                      <div className="mb-1 text-[8px] font-bold uppercase tracking-wide text-amber-500">Next up →</div>
                    )}
                    <div className={`inline-block w-full rounded-lg border px-1.5 py-1 shadow-sm ${
                      m.id === nextUpId
                        ? 'bg-amber-50 border-amber-200'
                        : m.isMock
                        ? 'bg-slate-50 border-slate-200 border-dashed'
                        : 'bg-white border-slate-200'
                    }`}>
                      <p className={`text-[11px] leading-tight ${labelCls[style]}`}>{m.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {m.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      {m.isMock && (
                        <span className="inline-block mt-0.5 text-[9px] text-blue-400 italic">+ set date</span>
                      )}
                      {!m.isMock && !m.isProgramStart && (() => {
                        const daysLeft = Math.ceil((m.date.getTime() - today.getTime()) / 86400000)
                        if (daysLeft > 0 && daysLeft <= 30) {
                          const badgeCls = daysLeft <= 3
                            ? 'bg-red-100 text-red-600'
                            : daysLeft <= 14
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-600'
                          return (
                            <span className={`inline-block mt-0.5 rounded-full px-1.5 text-[9px] font-semibold ${badgeCls}`}>
                              {daysLeft}d
                            </span>
                          )
                        }
                        return null
                      })()}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Today marker */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20"
              style={{ left: `${todayPct}%` }}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-red-500 ring-[3px] ring-red-200 animate-pulse" />
              <span className="absolute top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-red-500 whitespace-nowrap">
                Today
              </span>
            </div>
          </div>
        </div>

        </div>{/* end min-width */}
        </div>{/* end overflow-x-auto */}
        {/* Legend */}
        <div className="flex items-center gap-4 mt-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-slate-300" />
            <span className="text-[10px] text-slate-400">Past</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-[10px] text-slate-400">Coming up</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[10px] text-slate-400">Upcoming</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-blue-600 to-purple-600" />
            <span className="text-[10px] text-slate-400">Program Start</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[10px] text-blue-400 italic">Tap a suggested dot to set your own date</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardHome() {
  const [progress, setProgress] = useState<Record<string, boolean>>({})
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [visaStepDisabled, setVisaStepDisabled] = useState(false)
  const [preferredName, setPreferredName] = useState<string>('')
  const [destinationUniversity, setDestinationUniversity] = useState<string>('')
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false)
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null)
  const [claimingMilestone, setClaimingMilestone] = useState<{ title: string; suggestedDate: string; templateKey: string; emoji: string } | null>(null)

  useEffect(() => {
    loadProgress()
    loadDeadlines()
  }, [])

  async function loadDeadlines() {
    try {
      const data = await fetchDeadlines()
      setDeadlines(data)
    } catch (error) {
      console.error('Error loading deadlines:', error)
    }
  }

  async function handleAddDeadline(data: { title: string; dueDate: string; sendReminder: boolean; note?: string; templateKey?: string }) {
    if (editingDeadline) {
      await updateDeadline(editingDeadline.deadlineId, data.title, data.dueDate, data.sendReminder, data.note)
    } else {
      await createDeadline(data.title, data.dueDate, data.sendReminder, data.note, data.templateKey)
    }
    // Always refetch from server so the timeline stays in sync
    await loadDeadlines()
  }

  async function handleDeleteDeadline() {
    if (!editingDeadline) return
    await deleteDeadline(editingDeadline.deadlineId)
    await loadDeadlines()
  }

  async function loadProgress() {
    try {
      const data = await fetchMe()
      const progressMap: Record<string, boolean> = {}
      data.progress.forEach((p: StepProgress) => {
        progressMap[p.stepKey] = p.completed
      })
      
      // Check if student visa is disabled for EU citizens
      // Check if student visa is disabled for EU citizens
      let isEuCitizen = false
      
      // Read from individual profile fields
      if (data?.profile?.isEuCitizen !== undefined) {
        isEuCitizen = data.profile.isEuCitizen === 'yes'
        setVisaStepDisabled(isEuCitizen)
      }
      
      // Store user's preferred name and university from individual fields
      if (data?.profile?.preferredName) {
        setPreferredName(data.profile.preferredName)
      }
      if (data?.profile?.destinationUniversity) {
        setDestinationUniversity(data.profile.destinationUniversity)
      }
      
      // Auto-complete student visa step for EU citizens
      if (isEuCitizen) {
        progressMap['student-visa'] = true
      }
      
      setProgress(progressMap)
      setProfile(data.profile)
    } catch (error) {
      console.error('Error loading progress:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleStepComplete(stepTitle: string, completed: boolean) {
    // Prevent unmarking student visa as done for EU citizens
    if (stepTitle === 'Student Visa' && visaStepDisabled && !completed) {
      return
    }

    const stepKey = stepKeys[stepTitle]
    if (!stepKey) return
    setProgress((prev) => ({ ...prev, [stepKey]: completed }))

    const success = await saveStepProgress(stepKey, completed)
    if (!success) {
      // Revert on failure
      setProgress((prev) => ({ ...prev, [stepKey]: !completed }))
    }
  }

  const completedCount = Object.values(progress).filter(Boolean).length
  const totalSteps = steps.length
  const percentComplete = Math.round((completedCount / totalSteps) * 100)
  const firstIncompleteIndex = numberedSteps.findIndex(
    (step) => !progress[stepKeys[step]]
  )

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-blue-600">Leavs</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-base text-slate-600">
          {preferredName && (
            <>
              Hello, {preferredName}! 
              {destinationUniversity && (
                <span> We are going to get you to {destinationUniversity}.</span>
              )}
            </>
          )}
          {!preferredName && "Your relocation journey at a glance."}
        </p>
      </div>

      {!isLoading && profile?.programStartMonth && (
        <ProgramTimeline
          programStartMonth={profile.programStartMonth}
          deadlines={deadlines}
          onAddDeadline={() => { setEditingDeadline(null); setClaimingMilestone(null); setIsDeadlineModalOpen(true) }}
          onEditDeadline={(d) => { setEditingDeadline(d); setClaimingMilestone(null); setIsDeadlineModalOpen(true) }}
          onClaimMilestone={(m) => { setEditingDeadline(null); setClaimingMilestone(m); setIsDeadlineModalOpen(true) }}
        />
      )}

      <DeadlineModal
        isOpen={isDeadlineModalOpen}
        onClose={() => { setIsDeadlineModalOpen(false); setEditingDeadline(null); setClaimingMilestone(null) }}
        onSave={handleAddDeadline}
        initialData={editingDeadline ?? undefined}
        prefill={claimingMilestone ?? undefined}
        onDelete={editingDeadline ? handleDeleteDeadline : undefined}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Progress summary
            </h2>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {isLoading ? '...' : `${percentComplete}% done`}
            </span>
          </div>
          <p className="mt-4 text-sm font-medium text-slate-600">
            Steps completed: {isLoading ? '...' : `${completedCount} / ${totalSteps}`}
          </p>
          <div className="mt-4 h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-slate-400">
            {isLoading
              ? 'Loading your progress...'
              : 'Update your progress to track your journey.'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            Your journey
          </h2>
          {isLoading ? (
            <p className="text-sm text-slate-600">Loading...</p>
          ) : firstIncompleteIndex < 0 ? (
            <p className="text-sm text-slate-600">
              Congratulations! You've completed all steps! 🎉
            </p>
          ) : (
            <div className="flex flex-col">
              {numberedSteps
                .map((name, i) => ({ name, i }))
                .filter(({ name }) => !progress[stepKeys[name]])
                .slice(0, 3)
                .map(({ name: stepName, i: idx }, position, arr) => {
                const isCurrent = position === 0
                const isLast = position === arr.length - 1
                const stepRoute = stepRoutes[stepName] || '/dashboard'
                const icon = stepIcons[stepName]

                return (
                  <div key={stepName} className="flex items-stretch gap-3">
                    {/* Timeline spine */}
                    <div className="flex flex-col items-center pt-[18px] flex-shrink-0">
                      <div
                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                          isCurrent
                            ? 'bg-blue-600 ring-[3px] ring-blue-100'
                            : 'bg-slate-300'
                        }`}
                      />
                      {!isLast && (
                        <div className="flex-1 w-px my-1" style={{ borderLeft: '2px dashed #cbd5e1' }} />
                      )}
                    </div>

                    {/* Step card */}
                    <div
                      className={`flex-1 mb-2 rounded-xl px-3.5 py-2.5 ${
                        isCurrent
                          ? 'bg-gradient-to-r from-[#1e1b4b] to-[#1e3a5f] shadow-md'
                          : 'bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`flex-shrink-0 ${
                              isCurrent ? 'text-blue-300' : 'text-slate-400'
                            }`}
                          >
                            {icon}
                          </span>
                          <div className="min-w-0">
                            <p
                              className={`text-[11px] font-medium mb-0.5 ${
                                isCurrent ? 'text-blue-300' : 'text-slate-400'
                              }`}
                            >
                              Step {idx + 1}
                            </p>
                            <p
                              className={`text-sm font-semibold leading-tight truncate ${
                                isCurrent ? 'text-white' : 'text-slate-700'
                              }`}
                            >
                              {stepName}
                            </p>
                          </div>
                        </div>
                        {isCurrent ? (
                          <Link
                            to={stepRoute}
                            className="flex-shrink-0 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 transition-colors rounded-full px-3 py-1"
                          >
                            Open →
                          </Link>
                        ) : (
                          <span className="flex-shrink-0 text-slate-300 font-bold text-base">✕</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Steps overview</h2>
          <span className="text-sm text-slate-500">{numberedSteps.length} steps total</span>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {numberedSteps.map((title, index) => (
            <StepCard
              key={title}
              stepNumber={index + 1}
              title={title}
              description={stepDescriptions[title]}
              highlighted={index === firstIncompleteIndex}
              to={stepRoutes[title]}
              completed={progress[stepKeys[title]] || false}
              onComplete={(completed) => handleStepComplete(title, completed)}
              icon={stepIcons[title]}
              disabled={title === 'Student Visa' && visaStepDisabled}
              disabledReason={title === 'Student Visa' && visaStepDisabled ? 'Not needed for EU citizens' : undefined}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Tools</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {extraInformationSteps.map((title) => (
            <StepCard
              key={title}
              stepNumber={0}
              title={title}
              description={stepDescriptions[title]}
              showStepNumber={false}
              isTool={true}
              to={stepRoutes[title]}
              completed={progress[stepKeys[title]] || false}
              icon={stepIcons[title]}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
