import { UserProfile } from '../types/user'

export function isOnboardingCompleted(profile?: Partial<UserProfile> | null): boolean {
  if (!profile) return false

  if (typeof profile.onboardingCompletedAt === 'string' && profile.onboardingCompletedAt.trim().length > 0) {
    return true
  }

  if (typeof profile.lastCompletedStep === 'number' && profile.lastCompletedStep >= 8) {
    return true
  }

  if (typeof profile.dashboardPlan === 'string' && profile.dashboardPlan.trim().length > 0 && profile.dashboardPlan.trim() !== '[]') {
    return true
  }

  return false
}
