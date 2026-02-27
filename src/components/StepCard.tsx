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
  isTool?: boolean
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
  isTool = false,
}: StepCardProps) {
  const navigate = useNavigate()
  const isClickable = Boolean(to) && !disabled
  const statusStyles = disabled
    ? 'border-[#EDE9D8] bg-[#FAF9F6]'
    : isTool
      ? 'border-[#D9D3FB] bg-[#D9D3FB]/20'
      : completed
        ? 'border-teal-200 ring-1 ring-teal-100'
        : highlighted
          ? 'border-[#8870FF]/40 ring-1 ring-[#D9D3FB]'
          : 'border-[#EDE9D8]'

  return (
    <article
      className={`rounded-xl sm:rounded-2xl border bg-white p-3 sm:p-6 shadow-md transition-shadow duration-200 ${
        disabled ? 'opacity-60' : 'hover:shadow-lg'
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
        <div className="mb-2 sm:mb-4 p-2 sm:p-3 rounded-lg bg-amber-50 border border-amber-200">
          <p className="text-xs font-medium text-amber-800">{disabledReason}</p>
        </div>
      )}

      {/* Header with icon and badges */}
      <div className="flex items-start justify-between gap-2 sm:gap-4 mb-2 sm:mb-3 flex-shrink-0">
        <div className="flex items-start gap-2 sm:gap-3">
          {icon && (
            <div className={`flex-shrink-0 w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center rounded-md sm:rounded-lg ${
              disabled ? 'text-slate-400 bg-slate-100' : isTool ? 'text-[#8870FF] bg-[#D9D3FB]' : 'text-[#8870FF] bg-[#D9D3FB]/50'
            }`}>
              {icon}
            </div>
          )}
          <div>
            {showStepNumber && (
              <p className={`text-xs font-semibold tracking-widest mb-1 ${
                disabled ? 'text-slate-400' : 'text-[#8870FF]'
              }`}>
                STEP {stepNumber}
              </p>
            )}
            {!showStepNumber && isTool && (
              <p className="text-xs font-semibold tracking-widest mb-1 text-[#8870FF]">
                TOOL
              </p>
            )}
            <h3 className={`text-xs sm:text-base font-semibold leading-snug ${
              disabled ? 'text-slate-600' : 'text-slate-900'
            }`}>{title}</h3>
          </div>
        </div>
        <div className="hidden sm:flex flex-col gap-2 flex-shrink-0">
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
            <span className="rounded-full bg-[#D9D3FB] px-3 py-1.5 text-xs font-semibold text-[#8870FF] whitespace-nowrap">
              Recommended
            </span>
          ) : null}
        </div>
      </div>

      {/* Description - grows to fill available space */}
      <p className={`hidden sm:block text-sm mb-4 flex-grow ${
        disabled ? 'text-slate-500' : 'text-slate-600'
      }`}>{description}</p>

      {/* Checkbox - only shown on steps that support completion, hidden on mobile */}
      {onComplete && (
        <div className="hidden sm:block flex-shrink-0">
          <label
            className={`inline-flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
              disabled
                ? 'text-slate-400 cursor-not-allowed bg-[#FAF9F6]'
                : 'text-slate-700 cursor-pointer hover:bg-[#FAF9F6] group'
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={completed}
              onChange={(event) => {
                if (!disabled) {
                  onComplete(event.target.checked)
                }
              }}
              onClick={(event) => event.stopPropagation()}
              disabled={disabled}
              className={`w-5 h-5 rounded-md border-2 transition-all duration-150 accent-[#8870FF] ${
                disabled
                  ? 'border-slate-300 bg-slate-100 cursor-not-allowed'
                  : 'border-slate-300 text-[#8870FF] bg-[#F9F8FF] cursor-pointer hover:border-[#8870FF] focus:ring-2 focus:ring-[#8870FF] focus:ring-offset-1'
              }`}
            />
            <span className={disabled ? 'text-slate-400' : 'group-hover:text-slate-900'}>Mark as done</span>
          </label>
        </div>
      )}

    </article>
  )
}
