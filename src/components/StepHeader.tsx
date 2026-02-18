import { ReactNode } from 'react'

type StepHeaderProps = {
  stepLabel: string
  title: string
  subtitle: string | ReactNode
}

export default function StepHeader({
  stepLabel,
  title,
  subtitle,
}: StepHeaderProps) {
  return (
    <header className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
        {stepLabel}
      </p>
      <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
        {title}
      </h1>
      <div className="text-base text-slate-600">{subtitle}</div>
    </header>
  )
}
