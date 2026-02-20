import { defineBackend } from '@aws-amplify/backend'
import { Stack, RemovalPolicy, Duration } from 'aws-cdk-lib'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as events from 'aws-cdk-lib/aws-events'
import * as eventTargets from 'aws-cdk-lib/aws-events-targets'
import { auth } from './auth/resource'
import { userApi } from './functions/userApi/resource'
import { redditPoller } from './functions/redditPoller/resource'

const backend = defineBackend({
  auth,
  userApi,
  redditPoller,
})

// Get the stack from the Lambda function construct (implicit stack)
const apiStack = Stack.of(backend.userApi.resources.lambda)

// Environment identifier for table naming:
// - Branch deployments (CI/CD): AWS_BRANCH is set (e.g. "main", "prod")
// - Sandbox: falls back to "dev"
const env = process.env.AWS_BRANCH || 'dev'

// Create DynamoDB tables with explicit, human-readable physical names
const userProfileTable = new dynamodb.Table(apiStack, 'UserProfileTable', {
  tableName: `leavs-${env}-user-profiles`,
  partitionKey: {
    name: 'userId',
    type: dynamodb.AttributeType.STRING,
  },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  removalPolicy: RemovalPolicy.DESTROY,
})

const userProgressTable = new dynamodb.Table(apiStack, 'UserProgressTable', {
  tableName: `leavs-${env}-user-progress`,
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

const feedbackTable = new dynamodb.Table(apiStack, 'FeedbackTable', {
  tableName: `leavs-${env}-feedback`,
  partitionKey: {
    name: 'feedbackId',
    type: dynamodb.AttributeType.STRING,
  },
  sortKey: {
    name: 'timestamp',
    type: dynamodb.AttributeType.NUMBER,
  },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  removalPolicy: RemovalPolicy.DESTROY,
})

const deadlinesTable = new dynamodb.Table(apiStack, 'DeadlinesTable', {
  tableName: `leavs-${env}-deadlines`,
  partitionKey: {
    name: 'userId',
    type: dynamodb.AttributeType.STRING,
  },
  sortKey: {
    name: 'deadlineId',
    type: dynamodb.AttributeType.STRING,
  },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  removalPolicy: RemovalPolicy.DESTROY,
})

// Grant Lambda function access to DynamoDB tables
userProfileTable.grantReadWriteData(backend.userApi.resources.lambda)
userProgressTable.grantReadWriteData(backend.userApi.resources.lambda)
feedbackTable.grantReadWriteData(backend.userApi.resources.lambda)
deadlinesTable.grantReadWriteData(backend.userApi.resources.lambda)

// ─── Reddit Posts Table ───────────────────────────────────────────────────────
// Stores posts fetched from monitored subreddits by the redditPoller Lambda.
// PK: subreddit (the community name, e.g. "bocconi")
// SK: postId    (Reddit's global post ID, e.g. "t3_abc123")
// A GSI on createdUtc lets us query posts sorted by date across all subreddits.

const redditPostsTable = new dynamodb.Table(apiStack, 'RedditPostsTable', {
  tableName: `leavs-${env}-reddit-posts`,
  partitionKey: {
    name: 'subreddit',
    type: dynamodb.AttributeType.STRING,
  },
  sortKey: {
    name: 'postId',
    type: dynamodb.AttributeType.STRING,
  },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  removalPolicy: RemovalPolicy.DESTROY,
})

// GSI: query ALL posts sorted by creation date (for the admin dashboard feed)
redditPostsTable.addGlobalSecondaryIndex({
  indexName: 'byCreatedUtc',
  partitionKey: { name: 'fetchedMonth', type: dynamodb.AttributeType.STRING },
  sortKey: { name: 'createdUtc', type: dynamodb.AttributeType.NUMBER },
  projectionType: dynamodb.ProjectionType.ALL,
})

// redditPoller needs read + write to store fetched posts
redditPostsTable.grantReadWriteData(backend.redditPoller.resources.lambda)

// userApi (serves /admin/reddit-posts) needs read access
redditPostsTable.grantReadData(backend.userApi.resources.lambda)

// ─── EventBridge Cron: run redditPoller every 6 hours ─────────────────────────
// Schedule: 0:00, 6:00, 12:00, 18:00 UTC every day
// To change frequency, update the schedule expression below.

const redditPollerSchedule = new events.Rule(apiStack, 'RedditPollerSchedule', {
  ruleName: `leavs-${env}-reddit-poller-every-6h`,
  description: 'Triggers the redditPoller Lambda every 6 hours to fetch new Reddit posts',
  schedule: events.Schedule.cron({ minute: '0', hour: '0/6' }),
})

redditPollerSchedule.addTarget(
  new eventTargets.LambdaFunction(backend.redditPoller.resources.lambda, {
    retryAttempts: 2,
  })
)

// ─── Environment variables for redditPoller ───────────────────────────────────

backend.redditPoller.resources.lambda.addEnvironment(
  'REDDIT_POSTS_TABLE_NAME',
  redditPostsTable.tableName
)

// ─── Environment variables for userApi (reddit table read) ───────────────────

backend.userApi.resources.lambda.addEnvironment(
  'REDDIT_POSTS_TABLE_NAME',
  redditPostsTable.tableName
)

// Grant Lambda permission to send emails via SES
backend.userApi.resources.lambda.addToRolePolicy(
  new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    actions: ['ses:SendEmail', 'ses:SendRawEmail'],
    resources: ['*'],
  })
)

// Set environment variables on Lambda
backend.userApi.resources.lambda.addEnvironment(
  'USER_PROFILE_TABLE_NAME',
  userProfileTable.tableName
)
backend.userApi.resources.lambda.addEnvironment(
  'USER_PROGRESS_TABLE_NAME',
  userProgressTable.tableName
)
backend.userApi.resources.lambda.addEnvironment(
  'FEEDBACK_TABLE_NAME',
  feedbackTable.tableName
)
backend.userApi.resources.lambda.addEnvironment(
  'DEADLINES_TABLE_NAME',
  deadlinesTable.tableName
)
backend.userApi.resources.lambda.addEnvironment(
  'FEEDBACK_EMAIL',
  'tijn@eendenburg.eu'
)

// Create REST API
const restApi = new apigateway.RestApi(apiStack, 'LeavsRestApi', {
  restApiName: 'LeavsRestApi',
  description: 'Leavs user profile and progress API',
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

// Create /progress/start resource
const progressStartResource = progressResource.addResource('start')

// PUT /progress/start
progressStartResource.addMethod('PUT', lambdaIntegration, {
  authorizer: cognitoAuthorizer,
  authorizationType: apigateway.AuthorizationType.COGNITO,
})

// Create /feedback resource
const feedbackResource = restApi.root.addResource('feedback')

// POST /feedback with CORS (no authentication required for public feedback)
// OPTIONS is automatically handled by defaultCorsPreflightOptions
feedbackResource.addMethod('POST', lambdaIntegration, {
  methodResponses: [
    {
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Origin': true,
      },
    },
  ],
})

// Create /deadlines resource
const deadlinesResource = restApi.root.addResource('deadlines')

// GET /deadlines
deadlinesResource.addMethod('GET', lambdaIntegration, {
  authorizer: cognitoAuthorizer,
  authorizationType: apigateway.AuthorizationType.COGNITO,
})

// POST /deadlines
deadlinesResource.addMethod('POST', lambdaIntegration, {
  authorizer: cognitoAuthorizer,
  authorizationType: apigateway.AuthorizationType.COGNITO,
})

// Create /admin/stats resource (Cognito-protected; admin check happens inside Lambda)
const adminResource = restApi.root.addResource('admin')
const adminStatsResource = adminResource.addResource('stats')

// GET /admin/stats
adminStatsResource.addMethod('GET', lambdaIntegration, {
  authorizer: cognitoAuthorizer,
  authorizationType: apigateway.AuthorizationType.COGNITO,
})

// ─── /admin/reddit-posts ─────────────────────────────────────────────────────
// Serves paginated Reddit posts to the admin dashboard.
// Query params: ?subreddit=bocconi  (optional, filters by subreddit)
//               ?limit=50           (optional, default 50)

const adminRedditPostsResource = adminResource.addResource('reddit-posts')

// GET /admin/reddit-posts
adminRedditPostsResource.addMethod('GET', lambdaIntegration, {
  authorizer: cognitoAuthorizer,
  authorizationType: apigateway.AuthorizationType.COGNITO,
})

// Add Gateway Responses so that 4XX/5XX errors from API Gateway
// (e.g. Cognito authorizer 401) include CORS headers.
restApi.addGatewayResponse('Default4XX', {
  type: apigateway.ResponseType.DEFAULT_4XX,
  responseHeaders: {
    'Access-Control-Allow-Origin': "'*'",
    'Access-Control-Allow-Headers': "'Content-Type,Authorization'",
    'Access-Control-Allow-Methods': "'GET,POST,PUT,OPTIONS'",
  },
})

restApi.addGatewayResponse('Default5XX', {
  type: apigateway.ResponseType.DEFAULT_5XX,
  responseHeaders: {
    'Access-Control-Allow-Origin': "'*'",
    'Access-Control-Allow-Headers': "'Content-Type,Authorization'",
    'Access-Control-Allow-Methods': "'GET,POST,PUT,OPTIONS'",
  },
})

// Add outputs for frontend
backend.addOutput({
  custom: {
    API: {
      endpoint: restApi.url,
      region: Stack.of(apiStack).region,
      apiName: 'leavsRest',
    },
  },
})

export { backend }
