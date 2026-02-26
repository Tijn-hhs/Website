import { useLocation } from 'react-router-dom'
import type { DashboardPlanItem } from '../lib/api'

/**
 * Returns the personalised step number and total numbered steps for the
 * current page, derived from the cached dashboard plan in localStorage.
 *
 * Falls back to the provided `fallbackNumber` / `fallbackTotal` when no
 * cached plan is available (e.g. first load before Sidebar has fetched).
 *
 * Only "journey" type modules (those with a stepNumber) are counted.
 */
export function useDashboardStepPosition(
  fallbackNumber: number,
  fallbackTotal: number,
): { stepNumber: number; totalSteps: number } {
  const { pathname } = useLocation()

  try {
    const raw = localStorage.getItem('dashboardPlanItems')
    if (!raw) return { stepNumber: fallbackNumber, totalSteps: fallbackTotal }

    const plan: DashboardPlanItem[] = JSON.parse(raw)

    // Only numbered (journey) steps, sorted by their stored stepNumber
    const journeySteps = plan
      .filter((m) => m.stepNumber != null)
      .sort((a, b) => (a.stepNumber ?? 0) - (b.stepNumber ?? 0))

    if (journeySteps.length === 0) return { stepNumber: fallbackNumber, totalSteps: fallbackTotal }

    // Find this page's position by matching the route
    const idx = journeySteps.findIndex(
      (m) => m.route && pathname.startsWith(m.route),
    )

    if (idx === -1) {
      // Page not in plan (tools/info pages): return total for reference, number=0
      return { stepNumber: fallbackNumber, totalSteps: journeySteps.length }
    }

    return {
      stepNumber: idx + 1,          // 1-based, consecutive, no gaps
      totalSteps: journeySteps.length,
    }
  } catch {
    return { stepNumber: fallbackNumber, totalSteps: fallbackTotal }
  }
}
