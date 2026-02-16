import { useState, useEffect, useRef } from 'react'
import { getStepRequirements } from '../stepRequirements'

interface StepChecklistProps {
  pageType: string
}

const CHECKLIST_STORAGE_KEY = 'dashboard-checklist:'

export default function StepChecklist({ pageType }: StepChecklistProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})
  const contentRef = useRef<HTMLDivElement>(null)
  const requirements = getStepRequirements(pageType)

  // Load checklist from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storageKey = `${CHECKLIST_STORAGE_KEY}${pageType}`
      const saved = window.localStorage.getItem(storageKey)
      if (saved) {
        try {
          setChecklist(JSON.parse(saved))
        } catch {
          setChecklist({})
        }
      }
    }
  }, [pageType])

  if (!requirements || requirements.length === 0) {
    return null
  }

  const handleCheckItem = (itemId: string) => {
    const newChecklist = {
      ...checklist,
      [itemId]: !checklist[itemId],
    }
    setChecklist(newChecklist)

    // Save to localStorage
    if (typeof window !== 'undefined') {
      const storageKey = `${CHECKLIST_STORAGE_KEY}${pageType}`
      window.localStorage.setItem(storageKey, JSON.stringify(newChecklist))
    }
  }

  const completedCount = Object.values(checklist).filter(Boolean).length
  const totalCount = requirements.length

  return (
    <>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-colors duration-150 hover:text-slate-800 hover:bg-slate-50 whitespace-nowrap"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Checklist ({completedCount}/{totalCount})
      </button>

      <div
        className="overflow-hidden transition-all duration-500 ease-in-out"
        style={{
          maxHeight: isExpanded ? (contentRef.current?.scrollHeight || 0) + 48 : 0,
          opacity: isExpanded ? 1 : 0,
        }}
      >
        <div
          ref={contentRef}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">What you need for this step</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              aria-label="Close checklist"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            {requirements.map((requirement) => (
              <label
                key={requirement.id}
                className="flex items-start gap-3 cursor-pointer hover:bg-slate-50 px-3 py-2 rounded transition-colors"
              >
                <input
                  type="checkbox"
                  checked={checklist[requirement.id] || false}
                  onChange={() => handleCheckItem(requirement.id)}
                  className="mt-1 w-5 h-5 accent-blue-600 rounded border-slate-300 cursor-pointer flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-900">
                    {requirement.label}
                  </div>
                  {requirement.description && (
                    <div className="text-xs text-slate-600 mt-1">
                      {requirement.description}
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">{completedCount}</span> of{' '}
              <span className="font-semibold text-slate-900">{totalCount}</span> completed
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
