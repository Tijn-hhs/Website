import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth'

/**
 * List of admin email addresses.
 * Add your management team emails here.
 * These users will have access to the /admin dashboard.
 */
export const ADMIN_EMAILS: string[] = [
  'Tijn@Eendenburg.eu',
]

/**
 * Cognito User Pool group that grants admin access.
 * Users added to this group in Cognito will be treated as admins.
 */
const ADMIN_GROUP = 'admin'

export interface AdminStatus {
  isAdmin: boolean
  isAuthenticated: boolean
  email?: string
  username?: string
}

/**
 * Check whether the currently signed-in user has admin access.
 *
 * Admin access is granted when EITHER:
 *   1. The user belongs to the Cognito user pool group "Admins"
 *   2. The user's email is listed in ADMIN_EMAILS above
 */
export async function checkAdminStatus(): Promise<AdminStatus> {
  try {
    const [session, currentUser] = await Promise.all([
      fetchAuthSession(),
      getCurrentUser(),
    ])

    const idToken = session.tokens?.idToken
    if (!idToken) {
      return { isAdmin: false, isAuthenticated: false }
    }

    const payload = idToken.payload as Record<string, unknown>
    const email = (payload['email'] as string | undefined) ?? ''
    const groups = (payload['cognito:groups'] as string[] | undefined) ?? []

    const inAdminGroup = groups.includes(ADMIN_GROUP)
    const inEmailList =
      ADMIN_EMAILS.length > 0 &&
      email.length > 0 &&
      ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(email.toLowerCase())

    return {
      isAdmin: inAdminGroup || inEmailList,
      isAuthenticated: true,
      email,
      username: currentUser.username,
    }
  } catch {
    return { isAdmin: false, isAuthenticated: false }
  }
}
