import { defineFunction } from '@aws-amplify/backend'
import { Table } from 'aws-cdk-lib/aws-dynamodb'
import { Attr } from 'aws-cdk-lib'

export const userApi = defineFunction({
  name: 'userApi',
  entry: './handler.ts',
  timeoutSeconds: 30,
  environment: {
    USER_PROFILE_TABLE_NAME: process.env.USER_PROFILE_TABLE_NAME || 'UserProfileTable',
    USER_PROGRESS_TABLE_NAME: process.env.USER_PROGRESS_TABLE_NAME || 'UserProgressTable',
  },
})

export function userApiFactory() {
  return userApi
}
