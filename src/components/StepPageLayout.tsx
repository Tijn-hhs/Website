import { useState, useEffect, useRef, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import StepHeader from './StepHeader'
import UserInfoBox from './UserInfoBox'
import type { UserProfile } from '../types/user'

type InfoField = {
  key: keyof UserProfile
  label: string
  formatter?: (value: any) => string
}

interface ChecklistItem {
  id: string
  label: string
  description?: string
  completed: boolean
}

interface StepPageLayoutProps {
  stepNumber: number
  totalSteps: number
  stepLabel: string
  title: string
  subtitle: string | ReactNode
  userInfoTitle?: string
  userInfoFields?: InfoField[]
  checklistItems: ChecklistItem[]
  onChecklistItemToggle: (id: string, completed: boolean) => void
  children: ReactNode
  useGradientBar?: boolean
}

export default function StepPageLayout({
  stepNumber,
  totalSteps,
  stepLabel,
  title,
  subtitle,
  userInfoTitle = 'Your Study Plan',
  userInfoFields = [],
  checklistItems,
  onChecklistItemToggle,
  children,
  useGradientBar = false,
}: StepPageLayoutProps) {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isChecklistOpen, setIsChecklistOpen] = useState(false)
  const checklistRef = useRef<HTMLDivElement>(null)
  const checklistButtonRef = useRef<HTMLButtonElement>(null)

  // Handle scroll to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle click outside to close checklist
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isChecklistOpen &&
        checklistRef.current &&
        checklistButtonRef.current &&
        !checklistRef.current.contains(e.target as Node) &&
        !checklistButtonRef.current.contains(e.target as Node)
      ) {
        setIsChecklistOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isChecklistOpen])

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const completedCount = checklistItems.filter((item) => item.completed).length
  const totalCount = checklistItems.length
  const allCompleted = completedCount === totalCount
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <StepHeader stepLabel={stepLabel} title={title} subtitle={subtitle} />

      {/* User Info Box */}
      {userInfoFields.length > 0 && (
        <UserInfoBox title={userInfoTitle} fields={userInfoFields} />
      )}

      {/* Sticky Action Bar */}
      <div className={`sticky z-10 rounded-xl px-5 py-3 ${useGradientBar ? 'top-4 bg-gradient-to-b from-white via-slate-50 to-slate-50 shadow-lg border border-slate-200/70' : 'top-0 bg-white shadow-md border border-slate-200'}`}>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Back to Dashboard */}
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors duration-150 hover:bg-slate-50 whitespace-nowrap"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </Link>

          {/* Checklist Button */}
          <div className="relative">
            <button
              ref={checklistButtonRef}
              onClick={() => setIsChecklistOpen(!isChecklistOpen)}
              className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:opacity-90 whitespace-nowrap ${
                allCompleted ? 'bg-green-600' : 'bg-blue-600'
              }`}
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Checklist
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">
                {completedCount} / {totalCount}
              </span>
            </button>

            {/* Floating Checklist Panel */}
            {isChecklistOpen && (
              <div
                ref={checklistRef}
                className="absolute top-full left-0 mt-2 w-80 rounded-xl shadow-xl border border-slate-200 bg-white z-20 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-900">Your checklist</h3>
                  <button
                    onClick={() => setIsChecklistOpen(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
                    aria-label="Close checklist"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="px-4 pt-4 pb-2">
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300 ease-out"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    <span className="font-semibold text-slate-900">{completedCount}</span> of{' '}
                    <span className="font-semibold text-slate-900">{totalCount}</span> completed
                  </p>
                </div>

                {/* Checklist Items */}
                <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                  {checklistItems.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-start gap-3 cursor-pointer hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors"
                    >
                      <div className="relative flex items-center justify-center mt-0.5">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={(e) => onChecklistItemToggle(item.id, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all duration-200 flex items-center justify-center">
                          {item.completed && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div
                          className={`text-sm font-medium transition-all duration-200 ${
                            item.completed
                              ? 'text-slate-500 line-through'
                              : 'text-slate-900'
                          }`}
                        >
                          {item.label}
                        </div>
                        {item.description && (
                          <div className="text-xs text-slate-600 mt-1">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Scroll to Top Button */}
          {showScrollTop && (
            <button
              onClick={handleScrollToTop}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors duration-150 hover:bg-slate-50 whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
              Scroll to top
            </button>
          )}

          {/* Step Progress (right-aligned) */}
          <div className="ml-auto flex items-center gap-3">
            <div className="text-sm font-medium text-slate-600 whitespace-nowrap">
              Step {stepNumber} of {totalSteps}
            </div>
            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">{children}</div>
    </div>
  )
}
