import { useNavigate } from 'react-router-dom'

type StepCardProps = {
  stepNumber: number
  title: string
  description: string
  highlighted?: boolean
  to?: string
  completed?: boolean
  onComplete?: (completed: boolean) => void
}

export default function StepCard({
  stepNumber,
  title,
  description,
  highlighted = false,
  to,
  completed = false,
  onComplete,
}: StepCardProps) {
  const navigate = useNavigate()
  const isClickable = Boolean(to)
  const statusStyles = completed
    ? 'border-teal-200 ring-1 ring-teal-100'
    : highlighted
      ? 'border-blue-300 ring-1 ring-blue-200'
      : 'border-slate-200'

  return (
    <article
      className={`rounded-2xl border bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md ${statusStyles} ${
        isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
      }`}
      role={isClickable ? 'link' : undefined}
      tabIndex={isClickable ? 0 : -1}
      onClick={() => {
        if (to) {
          navigate(to)
        }
      }}
      onKeyDown={(event) => {
        if (!to) {
          return
        }
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          navigate(to)
        }
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest text-blue-600">
            STEP {stepNumber}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">{title}</h3>
          <p className="mt-2 text-sm text-slate-500">{description}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {completed ? (
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
              Completed
            </span>
          ) : null}
          {highlighted ? (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Recommended
            </span>
          ) : null}
        </div>
      </div>
      <label
        className="mt-5 flex items-center gap-2 text-sm font-medium text-slate-600"
        onClick={(event) => event.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={completed}
          onChange={(event) => {
            const newValue = event.target.checked
            if (onComplete) {
              onComplete(newValue)
            }
          }}
          onClick={(event) => event.stopPropagation()}
          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400"
        />
        Mark as done
      </label>
    </article>
  )
}
