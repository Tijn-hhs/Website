import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import Sidebar from './Sidebar'

type DashboardLayoutProps = {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // Track collapsed state to adjust main content margin
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    return saved ? JSON.parse(saved) : false
  })

  // Listen for changes to localStorage (persists across sidebar interactions)
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('sidebarCollapsed')
      setIsCollapsed(saved ? JSON.parse(saved) : false)
    }

    window.addEventListener('storage', handleStorageChange)
    // Also listen for changes in the current window
    const interval = setInterval(() => {
      const saved = localStorage.getItem('sidebarCollapsed')
      setIsCollapsed(saved ? JSON.parse(saved) : false)
    }, 100)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="bg-slate-50 min-h-screen">
      <Sidebar />
      {/* 
        Adaptive margin for main content:
        - When collapsed: ~88px (sidebar 64px + margin 16px on each side + 8px buffer)
        - When expanded: ~280px (sidebar 240px + margin 16px on each side + 8px buffer)
        Uses transition-all for smooth animation
      */}
      <main
        className={`transition-all duration-75 ease-in-out px-8 py-10 ${
          isCollapsed ? 'ml-[88px]' : 'ml-[280px]'
        }`}
      >
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  )
}
