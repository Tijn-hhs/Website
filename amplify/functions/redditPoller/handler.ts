import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
} from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'

// ─── Config ───────────────────────────────────────────────────────────────────

const dynamo = new DynamoDBClient({})

/**
 * Table that stores fetched Reddit posts.
 * Physical name is set via REDDIT_POSTS_TABLE_NAME env var in backend.ts.
 */
const REDDIT_POSTS_TABLE = process.env.REDDIT_POSTS_TABLE_NAME!

/**
 * Subreddits to monitor for immigration/student life discussions.
 * Add or remove subreddits here — no other code changes required.
 */
const MONITORED_SUBREDDITS: string[] = [
  'bocconi',         // Bocconi University students
  'Polimi',          // Politecnico di Milano
  'milano',          // Milan city — housing, logistics, daily life
  'italy',           // General Italy — visa, culture, bureaucracy
  'ItalianCitizenship', // Italian citizenship & residence permits
  'studyabroad',     // International students — general experiences
  'digitalnomad',    // Expats & remote workers — often discuss Italian visas
  'AskEurope',       // Cross-country immigration Q&A
  'immigration',     // Immigration procedures worldwide
  'solotravel',      // Solo travel & relocation tips
]

/**
 * How many posts to fetch per subreddit per run.
 * Reddit's public API max is 100.
 */
const POSTS_PER_SUBREDDIT = 50

// ─── Types ────────────────────────────────────────────────────────────────────

interface RedditPost {
  postId: string          // Reddit post ID (e.g. "t3_abc123")
  subreddit: string       // e.g. "bocconi"
  title: string
  selftext: string        // Post body text (empty for link posts)
  author: string
  score: number           // Net upvotes
  numComments: number
  createdUtc: number      // Unix timestamp (seconds)
  url: string             // Full post URL
  permalink: string       // Reddit relative path
  isSticky: boolean       // Pinned/stickied post
  fetchedAt: string       // ISO timestamp of when we stored this
}

// ─── Reddit fetcher ───────────────────────────────────────────────────────────

/**
 * Fetch the latest posts from a subreddit using Reddit's public JSON API.
 * No authentication required. We identify ourselves with a User-Agent
 * as required by Reddit's API rules.
 */
async function fetchSubredditPosts(subreddit: string): Promise<RedditPost[]> {
  const url = `https://www.reddit.com/r/${subreddit}/new.json?limit=${POSTS_PER_SUBREDDIT}&sort=new`

  const response = await fetch(url, {
    headers: {
      // Reddit requires a descriptive User-Agent — anonymous requests are rate-limited
      'User-Agent': 'LeavsAdminBot/1.0 (by /u/leavs_admin; market research for student relocation platform)',
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    // 404 = subreddit doesn't exist or is private; log and skip
    if (response.status === 404) {
      console.warn(`[redditPoller] Subreddit r/${subreddit} not found (404) — skipping`)
      return []
    }
    throw new Error(`Reddit API error for r/${subreddit}: HTTP ${response.status}`)
  }

  const data = await response.json() as any
  const children: any[] = data?.data?.children ?? []

  return children.map((child: any) => {
    const p = child.data
    return {
      postId: p.name,             // e.g. "t3_abc123" — globally unique Reddit ID
      subreddit: p.subreddit,
      title: p.title ?? '',
      selftext: (p.selftext ?? '').slice(0, 2000), // cap at 2KB to save DynamoDB storage
      author: p.author ?? '[deleted]',
      score: p.score ?? 0,
      numComments: p.num_comments ?? 0,
      createdUtc: p.created_utc ?? 0,
      url: p.url ?? '',
      permalink: `https://www.reddit.com${p.permalink ?? ''}`,
      isSticky: p.stickied ?? false,
      fetchedAt: new Date().toISOString(),
    }
  })
}

// ─── DynamoDB helpers ─────────────────────────────────────────────────────────

/**
 * Check if a post is already stored so we don't overwrite with stale data.
 * Uses a conditional check: only write if the item doesn't exist yet.
 */
async function storeNewPost(post: RedditPost): Promise<boolean> {
  try {
    await dynamo.send(
      new PutItemCommand({
        TableName: REDDIT_POSTS_TABLE,
        Item: marshall(post, { removeUndefinedValues: true }),
        // Only insert if this postId hasn't been stored for this subreddit yet
        ConditionExpression: 'attribute_not_exists(postId)',
      })
    )
    return true // new post stored
  } catch (err: any) {
    if (err.name === 'ConditionalCheckFailedException') {
      return false // already exists — skip
    }
    throw err
  }
}

// ─── Lambda handler ───────────────────────────────────────────────────────────

/**
 * Main entry point — triggered every 6 hours by EventBridge (configured in backend.ts).
 * Fetches posts from all monitored subreddits and stores new ones to DynamoDB.
 */
export const handler = async (event: any): Promise<void> => {
  console.log('[redditPoller] Starting poll run')
  console.log(`[redditPoller] Monitoring ${MONITORED_SUBREDDITS.length} subreddits`)

  let totalNew = 0
  let totalSkipped = 0
  let totalErrors = 0

  for (const subreddit of MONITORED_SUBREDDITS) {
    try {
      console.log(`[redditPoller] Fetching r/${subreddit}...`)
      const posts = await fetchSubredditPosts(subreddit)
      console.log(`[redditPoller] r/${subreddit}: fetched ${posts.length} posts`)

      let newCount = 0
      for (const post of posts) {
        const isNew = await storeNewPost(post)
        if (isNew) newCount++
        else totalSkipped++
      }

      totalNew += newCount
      console.log(`[redditPoller] r/${subreddit}: ${newCount} new, ${posts.length - newCount} already stored`)

      // Small delay between subreddits to be a polite API consumer
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (err) {
      totalErrors++
      console.error(`[redditPoller] Error fetching r/${subreddit}:`, err)
      // Don't throw — continue with remaining subreddits
    }
  }

  console.log(`[redditPoller] Run complete: ${totalNew} new posts stored, ${totalSkipped} skipped (already stored), ${totalErrors} subreddit errors`)
}
