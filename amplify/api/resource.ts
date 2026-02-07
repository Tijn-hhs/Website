import { defineApi } from '@aws-amplify/backend'
import { userApi } from '../functions/userApi/resource'

export const api = defineApi({
  name: 'userApi',
  description: 'User profile and progress API',
  routes: {
    '/user/me': {
      'GET': {
        function: userApi,
        authorization: 'USER_POOL_AUTH',
      },
      'PUT': {
        function: userApi,
        authorization: 'USER_POOL_AUTH',
      },
    },
    '/progress': {
      'PUT': {
        function: userApi,
        authorization: 'USER_POOL_AUTH',
      },
    },
  },
})
