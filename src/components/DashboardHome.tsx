import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import StepCard from './StepCard'
import { fetchMe, saveStepProgress } from '../lib/api'
import { StepProgress, UserProfile } from '../types/user'
import type { OnboardingDraft } from '../onboarding/types'
import {
  GraduationCap,
  FileText,
  Plane,
  ClipboardList,
  Home,
  Shield,
  Heart,
  MapPin,
  HelpCircle,
  Coffee,
  DollarSign,
  CreditCard,
} from 'lucide-react'

const numberedSteps = [
  'University Application',
  'Student Visa',
  'Before Departure',
  'Immigration & Registration',
  'Housing',
  'Banking',
  'Insurance',
  'Healthcare',
]

const extraInformationSteps = [
  'Arrival & First Days',
  'Information Centre',
  'Daily Life',
  'Cost of Living',
]

const steps = [...numberedSteps, ...extraInformationSteps]

const stepRoutes: Record<string, string | undefined> = {
  'University Application': '/dashboard/university-application',
  'Student Visa': '/dashboard/student-visa',
  'Before Departure': '/dashboard/before-departure',
  'Immigration & Registration': '/dashboard/immigration-registration',
  'Arrival & First Days': '/dashboard/arrival-first-days',
  Housing: '/dashboard/housing',
  Banking: '/dashboard/banking',
  Insurance: '/dashboard/insurance',
  Healthcare: '/dashboard/healthcare',
  'Information Centre': '/dashboard/information-centre',
  'Daily Life': '/dashboard/daily-life',
  'Cost of Living': '/dashboard/cost-of-living',
}

const stepKeys: Record<string, string> = {
  'University Application': 'university-application',
  'Student Visa': 'student-visa',
  'Before Departure': 'before-departure',
  'Immigration & Registration': 'immigration-registration',
  'Arrival & First Days': 'arrival-first-days',
  Housing: 'housing',
  Banking: 'banking',
  Insurance: 'insurance',
  Healthcare: 'healthcare',
  'Information Centre': 'information-centre',
  'Daily Life': 'daily-life',
  'Cost of Living': 'cost-of-living',
}

const stepIcons: Record<string, React.ReactNode> = {
  'University Application': <GraduationCap size={20} className="flex-shrink-0" />,
  'Student Visa': <FileText size={20} className="flex-shrink-0" />,
  'Before Departure': <Plane size={20} className="flex-shrink-0" />,
  'Immigration & Registration': <ClipboardList size={20} className="flex-shrink-0" />,
  Housing: <Home size={20} className="flex-shrink-0" />,
  Banking: <CreditCard size={20} className="flex-shrink-0" />,
  Insurance: <Shield size={20} className="flex-shrink-0" />,
  Healthcare: <Heart size={20} className="flex-shrink-0" />,
  'Arrival & First Days': <MapPin size={20} className="flex-shrink-0" />,
  'Information Centre': <HelpCircle size={20} className="flex-shrink-0" />,
  'Daily Life': <Coffee size={20} className="flex-shrink-0" />,
  'Cost of Living': <DollarSign size={20} className="flex-shrink-0" />,
}

const stepDescriptions: Record<string, string> = {
  'University Application': 'Research programs, prepare documents, and submit your university applications.',
  'Student Visa': 'Apply for your student visa and prepare all required documentation.',
  'Before Departure': 'Get vaccinations, arrange travel, and prepare for your move.',
  'Immigration & Registration': 'Complete immigration procedures and register with local authorities.',
  Housing: 'Find and secure accommodation for your stay.',
  Banking: 'Set up bank accounts and manage financial essentials.',
  Insurance: 'Arrange insurance coverage for health and personal protection.',
  Healthcare: 'Register with healthcare providers and understand the system.',
  'Arrival & First Days': 'Navigate your arrival and settle into your new city.',
  'Information Centre': 'Access comprehensive guides and local resources.',
  'Daily Life': 'Learn about culture, transportation, and local customs.',
  'Cost of Living': 'Understand expenses and budget for your stay.',
}

export default function DashboardHome() {
  const [progress, setProgress] = useState<Record<string, boolean>>({})
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [visaStepDisabled, setVisaStepDisabled] = useState(false)

  useEffect(() => {
    loadProgress()
  }, [])

  async function loadProgress() {
    try {
      const data = await fetchMe()
      const progressMap: Record<string, boolean> = {}
      data.progress.forEach((p: StepProgress) => {
        progressMap[p.stepKey] = p.completed
      })
      
      // Check if student visa is disabled for EU citizens
      let isEuCitizen = false
      if (data?.profile?.onboardingDraftJson) {
        const draft: OnboardingDraft = JSON.parse(data.profile.onboardingDraftJson)
        isEuCitizen = draft.isEuCitizen === 'yes'
        setVisaStepDisabled(isEuCitizen)
        
        // Auto-complete student visa step for EU citizens
        if (isEuCitizen) {
          progressMap['student-visa'] = true
        }
      }
      
      setProgress(progressMap)
      setProfile(data.profile)
    } catch (error) {
      console.error('Error loading progress:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function calculateDaysUntilStart(): number | null {
    if (!profile?.startDate) return null
    const startDate = new Date(profile.startDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const timeDiff = startDate.getTime() - today.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
    return daysDiff
  }

  function getCountdownDisplay(): { daysLeft: number; percentProgress: number; status: string } | null {
    const daysLeft = calculateDaysUntilStart()
    if (daysLeft === null) return null

    const maxDays = 365
    let percentProgress = 100 - (daysLeft / maxDays) * 100
    if (percentProgress < 0) percentProgress = 100
    if (percentProgress > 100) percentProgress = 0

    let status = ''
    if (daysLeft < 0) {
      status = '✈️ You have arrived!'
    } else if (daysLeft === 0) {
      status = '🎉 Today is the day!'
    } else if (daysLeft <= 7) {
      status = '⏰ Just around the corner'
    } else if (daysLeft <= 30) {
      status = '📅 Coming up soon'
    } else {
      status = '📢 Mark your calendars'
    }

    return { daysLeft: Math.max(0, daysLeft), percentProgress, status }
  }

  async function handleStepComplete(stepTitle: string, completed: boolean) {
    // Prevent unmarking student visa as done for EU citizens
    if (stepTitle === 'Student Visa' && visaStepDisabled && !completed) {
      return
    }

    const stepKey = stepKeys[stepTitle]
    if (!stepKey) return    npx amplify deploy

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
  const countdownData = getCountdownDisplay()

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-blue-600">LiveCity</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-base text-slate-600">
          Your relocation journey at a glance.
        </p>
      </div>

      {!isLoading && countdownData && (
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Days until Program Start
              </h2>
              <p className="mt-1 text-sm text-slate-600">{countdownData.status}</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-blue-700">
                {countdownData.daysLeft}
              </p>
              <p className="text-xs text-slate-500">days left</p>
            </div>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${countdownData.percentProgress}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {profile?.startDate
              ? `Program starts: ${new Date(profile.startDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}`
              : 'No start date set'}
          </p>
        </div>
      )}

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
          <h2 className="text-lg font-semibold text-slate-900">
            Next recommended step
          </h2>
          {isLoading ? (
            <p className="mt-4 text-sm text-slate-600">Loading...</p>
          ) : firstIncompleteIndex >= 0 ? (
            <>
              <p className="mt-4 text-sm text-slate-600">
                Next step: Step {firstIncompleteIndex + 1} — {numberedSteps[firstIncompleteIndex]}
              </p>
              <Link
                to={stepRoutes[numberedSteps[firstIncompleteIndex]] || '/dashboard'}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-transform duration-200 hover:scale-[1.02]"
              >
                Open Step
              </Link>
            </>
          ) : (
            <p className="mt-4 text-sm text-slate-600">
              Congratulations! You've completed all steps! 🎉
            </p>
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
              to={stepRoutes[title]}
              completed={progress[stepKeys[title]] || false}
              onComplete={(completed) => handleStepComplete(title, completed)}
              icon={stepIcons[title]}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
