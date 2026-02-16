import { useNavigate } from 'react-router-dom'

type StepCardProps = {
  stepNumber: number
  title: string
  description: string
  highlighted?: boolean
  to?: string
  completed?: boolean
  onComplete?: (completed: boolean) => void
  showStepNumber?: boolean
  icon?: React.ReactNode
  disabled?: boolean
  disabledReason?: string
}

export default function StepCard({
  stepNumber,
  title,
  description,
  highlighted = false,
  to,
  completed = false,
  onComplete,
  showStepNumber = true,
  icon,
  disabled = false,
  disabledReason,
}: StepCardProps) {
  const navigate = useNavigate()
  const isClickable = Boolean(to) && !disabled
  const statusStyles = disabled
    ? 'border-slate-200 bg-slate-50'
    : completed
      ? 'border-teal-200 ring-1 ring-teal-100'
      : highlighted
        ? 'border-blue-300 ring-1 ring-blue-200'
        : 'border-slate-200'

  return (
    <article
      className={`rounded-2xl border bg-white p-6 shadow-sm transition-shadow duration-200 ${
        disabled ? 'opacity-60' : 'hover:shadow-md'
      } h-full flex flex-col ${statusStyles} ${
        isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
      }`}
      role={isClickable ? 'link' : undefined}
      tabIndex={isClickable ? 0 : -1}
      onClick={() => {
        if (isClickable) {
          navigate(to!)
        }
      }}
      onKeyDown={(event) => {
        if (!to || disabled) {
          return
        }
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          navigate(to)
        }
      }}
      title={disabled && disabledReason ? disabledReason : undefined}
    >
      {/* Disabled reason banner */}
      {disabled && disabledReason && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <p className="text-xs font-medium text-amber-800">{disabledReason}</p>
        </div>
      )}

      {/* Header with icon and badges */}
      <div className="flex items-start justify-between gap-4 mb-3 flex-shrink-0">
        <div className="flex items-start gap-3">
          {icon && (
            <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg mt-0.5 ${
              disabled ? 'text-slate-400 bg-slate-100' : 'text-blue-600 bg-blue-50'
            }`}>
              {icon}
            </div>
          )}
          <div>
            {showStepNumber && (
              <p className={`text-xs font-semibold tracking-widest mb-1 ${
                disabled ? 'text-slate-400' : 'text-blue-600'
              }`}>
                STEP {stepNumber}
              </p>
            )}
            <h3 className={`text-base font-semibold leading-snug ${
              disabled ? 'text-slate-600' : 'text-slate-900'
            }`}>{title}</h3>
          </div>
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">
          {completed ? (
            <span className={`rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${
              disabled
                ? 'bg-slate-100 text-slate-600'
                : 'bg-teal-50 text-teal-700'
            }`}>
              Completed
            </span>
          ) : null}
          {highlighted && !disabled ? (
            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 whitespace-nowrap">
              Recommended
            </span>
          ) : null}
        </div>
      </div>

      {/* Description - grows to fill available space */}
      <p className={`text-sm mb-4 flex-grow ${
        disabled ? 'text-slate-500' : 'text-slate-600'
      }`}>{description}</p>

      {/* Checkbox - stays at bottom */}
      <div className="flex-shrink-0">
        <label
          className={`inline-flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
            disabled
              ? 'text-slate-400 cursor-not-allowed bg-slate-50'
              : 'text-slate-700 cursor-pointer hover:bg-slate-50 group'
          }`}
          onClick={(event) => event.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={completed}
            onChange={(event) => {
              if (!disabled) {
                const newValue = event.target.checked
                if (onComplete) {
                  onComplete(newValue)
                }
              }
            }}
            onClick={(event) => event.stopPropagation()}
            disabled={disabled}
            className={`w-5 h-5 rounded-md border-2 transition-all duration-150 accent-blue-600 ${
              disabled
                ? 'border-slate-300 bg-slate-100 cursor-not-allowed'
                : 'border-slate-300 text-blue-600 bg-white cursor-pointer hover:border-blue-400 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1'
            }`}
          />
          <span className={disabled ? 'text-slate-400' : 'group-hover:text-slate-900'}>Mark as done</span>
        </label>
      </div>
    </article>
  )
}
