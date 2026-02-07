import { get, put } from 'aws-amplify/api'
import { UserProfile, UserData } from '../types/user'

const API_NAME = 'livecityRest'

export async function fetchUserData(): Promise<UserData> {
  try {
    const restOperation = get({
      apiName: API_NAME,
      path: '/user/me',
    })

    const response = await restOperation.response
    const json = await response.body.json()
    return (json as unknown as UserData) || { profile: {}, progress: [] }
  } catch (error) {
    console.error('Error fetching user data:', error)
    return { profile: {}, progress: [] }
  }
}

export async function saveProfile(profile: UserProfile): Promise<boolean> {
  try {
    const restOperation = put({
      apiName: API_NAME,
      path: '/user/me',
      options: {
        body: JSON.stringify(profile),
      },
    })

    await restOperation.response
    return true
  } catch (error) {
    console.error('Error saving profile:', error)
    return false
  }
}

export async function saveStepProgress(
  stepKey: string,
  completed: boolean
): Promise<boolean> {
  try {
    const restOperation = put({
      apiName: API_NAME,
      path: '/progress',
      options: {
        body: JSON.stringify({ stepKey, completed }),
      },
    })

    await restOperation.response
    return true
  } catch (error) {
    console.error('Error saving step progress:', error)
    return false
  }
}
