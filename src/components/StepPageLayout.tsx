import { Children, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import StepChecklist from '../onboarding/components/StepChecklist'

type StepPageLayoutProps = {
  stepLabel: string
  title: string
  subtitle: string | ReactNode
  secondaryActionLabel?: string
  checklistPageType?: string
  showActions?: boolean
  infoBox?: ReactNode
  children?: ReactNode
}

export default function StepPageLayout({
  stepLabel,
  title,
  subtitle,
  secondaryActionLabel,
  checklistPageType,
  showActions = true,
  infoBox,
  children,
}: StepPageLayoutProps) {
  const hasChildren = Children.count(children) > 0

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
          {stepLabel}
        </p>
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
          {title}
        </h1>
        <p className="text-base text-slate-600">{subtitle}</p>
      </header>

      {infoBox ? <div>{infoBox}</div> : null}

      {showActions ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors duration-150 hover:bg-slate-50"
          >
            Back to Dashboard
          </Link>
          <div className="flex gap-3 flex-col sm:flex-row">
            {checklistPageType ? <StepChecklist pageType={checklistPageType} /> : null}
            {secondaryActionLabel ? (
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-colors duration-150 hover:text-slate-800 hover:bg-slate-50"
              >
                {secondaryActionLabel}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {hasChildren ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {children}
        </div>
      ) : null}
    </section>
  )
}
