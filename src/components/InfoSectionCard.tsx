import type { ReactNode } from 'react'

type InfoSectionCardProps = {
  id?: string
  title: string
  description?: string
  items?: string[]
  children?: ReactNode
}

export default function InfoSectionCard({
  id,
  title,
  description,
  items,
  children,
}: InfoSectionCardProps) {
  return (
    <article
      id={id}
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {description ? (
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      ) : null}
      {items && items.length ? (
        <ul className="mt-3 list-disc space-y-2 pl-4 text-sm text-slate-600">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      {children ? <div className="mt-3 space-y-3">{children}</div> : null}
    </article>
  )
}
