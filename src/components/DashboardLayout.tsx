import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'

export default function DashboardLayout() {
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
    <div className="bg-[#F5F1E4] min-h-screen">
      <Sidebar />
      <MobileNav />
      {/* 
        Adaptive margin for main content:
        - When collapsed: ~88px (sidebar 64px + margin 16px on each side + 8px buffer)
        - When expanded: ~280px (sidebar 240px + margin 16px on each side + 8px buffer)
        Uses transition-all for smooth animation
      */}
      <main
        className={`transition-all duration-75 ease-in-out px-4 md:px-8 py-6 md:py-10 pt-20 md:pt-10 ${
          isCollapsed ? 'md:ml-[88px]' : 'md:ml-[280px]'
        }`}
      >
        <div className="mx-auto w-full max-w-6xl"><Outlet /></div>
      </main>
    </div>
  )
}
