import { defineFunction } from '@aws-amplify/backend'

export const userApi = defineFunction({
  name: 'userApi',
  entry: './handler.ts',
  timeoutSeconds: 30,
  // Table name env vars are set in backend.ts via addEnvironment()
  // so they always point at the correct physical table for each environment.
})
