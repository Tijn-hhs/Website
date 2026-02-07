import { defineBackend } from '@aws-amplify/backend'
import { Stack, RemovalPolicy } from 'aws-cdk-lib'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import { auth } from './auth/resource'
import { userApi } from './functions/userApi/resource'

const backend = defineBackend({
  auth,
  userApi,
})

// Get the stack from the Lambda function construct (implicit stack)
const apiStack = Stack.of(backend.userApi.resources.lambda)

// Create DynamoDB tables
const userProfileTable = new dynamodb.Table(apiStack, 'UserProfileTable', {
  partitionKey: {
    name: 'userId',
    type: dynamodb.AttributeType.STRING,
  },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  removalPolicy: RemovalPolicy.DESTROY,
})

const userProgressTable = new dynamodb.Table(apiStack, 'UserProgressTable', {
  partitionKey: {
    name: 'userId',
    type: dynamodb.AttributeType.STRING,
  },
  sortKey: {
    name: 'stepKey',
    type: dynamodb.AttributeType.STRING,
  },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  removalPolicy: RemovalPolicy.DESTROY,
})

// Grant Lambda function access to DynamoDB tables
userProfileTable.grantReadWriteData(backend.userApi.resources.lambda)
userProgressTable.grantReadWriteData(backend.userApi.resources.lambda)

// Set environment variables on Lambda
backend.userApi.resources.lambda.addEnvironment(
  'USER_PROFILE_TABLE_NAME',
  userProfileTable.tableName
)
backend.userApi.resources.lambda.addEnvironment(
  'USER_PROGRESS_TABLE_NAME',
  userProgressTable.tableName
)

// Create REST API
const restApi = new apigateway.RestApi(apiStack, 'LiveCityRestApi', {
  restApiName: 'LiveCityRestApi',
  description: 'LiveCity user profile and progress API',
  defaultCorsPreflightOptions: {
    allowOrigins: apigateway.Cors.ALL_ORIGINS,
    allowMethods: apigateway.Cors.ALL_METHODS,
    allowHeaders: ['Content-Type', 'Authorization'],
  },
})

// Create Cognito authorizer
const cognitoAuthorizer = new apigateway.CognitoUserPoolsAuthorizer(
  apiStack,
  'CognitoAuthorizer',
  {
    cognitoUserPools: [backend.auth.resources.userPool],
  }
)

// Create Lambda integration
const lambdaIntegration = new apigateway.LambdaIntegration(
  backend.userApi.resources.lambda
)

// Create /user resource
const userResource = restApi.root.addResource('user')
const meResource = userResource.addResource('me')

// GET /user/me
meResource.addMethod('GET', lambdaIntegration, {
  authorizer: cognitoAuthorizer,
  authorizationType: apigateway.AuthorizationType.COGNITO,
})

// PUT /user/me
meResource.addMethod('PUT', lambdaIntegration, {
  authorizer: cognitoAuthorizer,
  authorizationType: apigateway.AuthorizationType.COGNITO,
})

// Create /progress resource
const progressResource = restApi.root.addResource('progress')

// PUT /progress
progressResource.addMethod('PUT', lambdaIntegration, {
  authorizer: cognitoAuthorizer,
  authorizationType: apigateway.AuthorizationType.COGNITO,
})

// Add outputs for frontend
backend.addOutput({
  custom: {
    API: {
      endpoint: restApi.url,
      region: Stack.of(apiStack).region,
      apiName: 'livecityRest',
    },
  },
})

export { backend }
