import StepCard from './StepCard'

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
  'Cost of Living'
]

export default function DashboardHome() {
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
              0% done
            </span>
          </div>
          <p className="mt-4 text-sm font-medium text-slate-600">
            Steps completed: 0 / 11
          </p>
          <div className="mt-4 h-2 w-full rounded-full bg-slate-100">
            <div className="h-full w-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Update once you start marking steps as complete.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Next recommended step
          </h2>
          <p className="mt-4 text-sm text-slate-600">
            Next step: Step 1 — University Application
          </p>
          <button
            type="button"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-transform duration-200 hover:scale-[1.02]"
          >
            Open Step
          </button>
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
              description="Mock description for this step goes here."
              highlighted={index === 0}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
