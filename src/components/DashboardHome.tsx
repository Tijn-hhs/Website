import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import StepCard from './StepCard'
import { fetchMe, saveStepProgress } from '../lib/api'
import { StepProgress } from '../types/user'

const steps = [
  'University Application',
  'Student Visa',
  'Before Departure',
  'Immigration & Registration',
  'Arrival & First Days',
  'Housing',
  'Legal, Banking & Insurance',
  'Healthcare',
  'Information Centre',
  'Daily Life',
  'Cost of Living',
]

const stepRoutes: Record<string, string | undefined> = {
  'University Application': '/dashboard/university-application',
  'Student Visa': '/dashboard/student-visa',
  'Before Departure': '/dashboard/before-departure',
  'Immigration & Registration': '/dashboard/immigration-registration',
  'Arrival & First Days': '/dashboard/arrival-first-days',
  Housing: '/dashboard/housing',
  'Legal, Banking & Insurance': '/dashboard/legal-banking-insurance',
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
  'Legal, Banking & Insurance': 'legal-banking-insurance',
  Healthcare: 'healthcare',
  'Information Centre': 'information-centre',
  'Daily Life': 'daily-life',
  'Cost of Living': 'cost-of-living',
}

export default function DashboardHome() {
  const [progress, setProgress] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)

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
      setProgress(progressMap)
    } catch (error) {
      console.error('Error loading progress:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleStepComplete(stepTitle: string, completed: boolean) {
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
  const firstIncompleteIndex = steps.findIndex(
    (step) => !progress[stepKeys[step]]
  )

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-blue-600">LiveCity</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-base text-slate-600">
          Your relocation journey at a glance.
        </p>
      </div>

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
                Next step: Step {firstIncompleteIndex + 1} — {steps[firstIncompleteIndex]}
              </p>
              <Link
                to={stepRoutes[steps[firstIncompleteIndex]] || '/dashboard'}
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
          <span className="text-sm text-slate-500">11 steps total</span>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {steps.map((title, index) => (
            <StepCard
              key={title}
              stepNumber={index + 1}
              title={title}
              description="Complete this step in your relocation journey."
              highlighted={index === firstIncompleteIndex}
              to={stepRoutes[title]}
              completed={progress[stepKeys[title]] || false}
              onComplete={(completed) => handleStepComplete(title, completed)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
