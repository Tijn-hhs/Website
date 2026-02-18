import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import StepCard from './StepCard'
import { fetchMe, saveStepProgress } from '../lib/api'
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
} from 'lucide-react'

const numberedSteps = [
  'University Application',
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
]

const steps = [...numberedSteps, ...extraInformationSteps]

const stepRoutes: Record<string, string | undefined> = {
  'University Application': '/dashboard/university-application',
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
}

const stepKeys: Record<string, string> = {
  'University Application': 'university-application',
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
}

const stepIcons: Record<string, React.ReactNode> = {
  'University Application': <GraduationCap size={20} className="flex-shrink-0" />,
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
}

const stepDescriptions: Record<string, string> = {
  'University Application': 'Research programs, prepare documents, and submit your university applications.',
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
}

export default function DashboardHome() {
  const [progress, setProgress] = useState<Record<string, boolean>>({})
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [visaStepDisabled, setVisaStepDisabled] = useState(false)
  const [preferredName, setPreferredName] = useState<string>('')
  const [destinationUniversity, setDestinationUniversity] = useState<string>('')

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

  function calculateDaysUntilStart(): number | null {
    if (!profile?.programStartMonth) return null
    // programStartMonth is in "YYYY-MM" format, convert to first day of month
    const startDate = new Date(`${profile.programStartMonth}-01`)
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
  const countdownData = getCountdownDisplay()

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
            {profile?.programStartMonth
              ? `Program starts: ${new Date(`${profile.programStartMonth}-01`).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
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
