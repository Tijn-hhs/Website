import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { fetchMe, fetchContentModules } from '../lib/api'

interface Props {
  /** The moduleId this page represents. Only renders children if the user's
   *  situation-filtered modules include this moduleId. */
  moduleId?: string
  moduleRoute?: string
  children: React.ReactNode
}

type State = 'loading' | 'allowed' | 'denied'

/**
 * Wraps a situation-specific dashboard page and silently redirects to /dashboard
 * if the current user's visibility rules do not grant access to this module.
 *
 * Usage in App.tsx:
 *   <Route path="/dashboard/banking-italy" element={
 *     <ModuleGate moduleId="banking-italy"><BankingItalyPage /></ModuleGate>
 *   } />
 */
export default function ModuleGate({ moduleId, moduleRoute, children }: Props) {
  const [state, setState] = useState<State>('loading')

  useEffect(() => {
    let cancelled = false
    async function check() {
      try {
        const userData = await fetchMe()
        if (!userData.profile) { setState('denied'); return }

        if (userData.profile.dashboardPlan) {
          try {
            const savedPlan = JSON.parse(userData.profile.dashboardPlan) as Array<{ moduleId?: string; route?: string }>
            const allowedBySavedPlan = savedPlan.some((m) => {
              if (moduleRoute && m.route === moduleRoute) return true
              if (moduleId && m.moduleId === moduleId) return true
              return false
            })
            setState(allowedBySavedPlan ? 'allowed' : 'denied')
            return
          } catch {
            // fall back to live rule evaluation
          }
        }

        const modules = await fetchContentModules(userData.profile)
        if (cancelled) return
        const allowed = modules.some((m) => {
          if (moduleRoute && m.route === moduleRoute) return true
          if (moduleId && m.moduleId === moduleId) return true
          return false
        })
        setState(allowed ? 'allowed' : 'denied')
      } catch {
        if (!cancelled) setState('denied')
      }
    }
    check()
    return () => { cancelled = true }
  }, [moduleId, moduleRoute])

  if (state === 'loading') return null   // blank while checking — no flash
  if (state === 'denied')  return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
