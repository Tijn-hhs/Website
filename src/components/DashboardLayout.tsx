import type { ReactNode } from 'react'
import Sidebar from './Sidebar'

type DashboardLayoutProps = {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="bg-slate-50">
      <Sidebar />
      <main className="ml-60 px-8 py-10">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  )
}
