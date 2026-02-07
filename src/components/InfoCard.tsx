import type { ReactNode } from 'react'

type InfoCardProps = {
  title: string
  children: ReactNode
}

export default function InfoCard({ title, children }: InfoCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-3 text-sm text-slate-600">{children}</div>
    </article>
  )
}
