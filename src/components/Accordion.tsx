import type { ReactNode } from 'react'

type AccordionProps = {
  title: string
  children: ReactNode
}

export default function Accordion({ title, children }: AccordionProps) {
  return (
    <details className="group rounded-lg border border-slate-200/70 bg-slate-50/60 p-3">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-slate-700">
        <span>{title}</span>
        <svg
          className="h-4 w-4 text-slate-500 transition-transform duration-150 group-open:rotate-180"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 7l5 6 5-6" />
        </svg>
      </summary>
      <div className="mt-3 text-sm text-slate-600">{children}</div>
    </details>
  )
}
