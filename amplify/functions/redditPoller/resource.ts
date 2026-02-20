import { defineFunction } from '@aws-amplify/backend'

/**
 * redditPoller — scheduled Lambda function
 *
 * Runs every 6 hours (triggered by EventBridge in backend.ts).
 * Fetches the latest posts from monitored subreddits using Reddit's
 * public JSON API and writes new posts to DynamoDB (leavs-{env}-reddit-posts).
 *
 * Environment variables (set in backend.ts):
 *   REDDIT_POSTS_TABLE_NAME  — physical DynamoDB table name
 */
export const redditPoller = defineFunction({
  name: 'redditPoller',
  entry: './handler.ts',
  timeoutSeconds: 120, // up to 2 min — fetches ~10 subreddits sequentially
})
