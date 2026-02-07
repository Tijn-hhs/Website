import { defineBackend } from '@aws-amplify/backend'
import { auth } from './auth/resource'
import { api } from './api/resource'

export const backend = defineBackend({
  auth,
  api,
})
