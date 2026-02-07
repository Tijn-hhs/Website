type CalloutCardProps = {
  id?: string
  title: string
  items: string[]
}

export default function CalloutCard({ id, title, items }: CalloutCardProps) {
  return (
    <article
      id={id}
      className="rounded-xl border border-blue-200/70 bg-blue-50/60 p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <ul className="mt-3 list-disc space-y-2 pl-4 text-sm text-slate-700">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  )
}
