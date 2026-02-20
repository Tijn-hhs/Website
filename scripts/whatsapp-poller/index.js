/**
 * Leavs WhatsApp Group Poller
 * ────────────────────────────────────────────────────────────────────────────
 * Runs on your laptop. Connects to WhatsApp via whatsapp-web.js (QR scan once),
 * listens to messages in configured groups, and saves them to DynamoDB so the
 * admin dashboard can display them.
 *
 * Setup:
 *   1. cd scripts/whatsapp-poller && npm install
 *   2. Configure AWS credentials: aws configure  (needs write access to DynamoDB)
 *   3. Set WHATSAPP_TABLE and AWS_REGION below (or via env vars)
 *   4. node index.js — scan the QR code on first run
 *   5. Leave it running. Session is saved locally so no QR scan on restart.
 *
 * The script listens to ALL groups by default. You can restrict it by adding
 * group names to MONITORED_GROUPS below.
 */

'use strict'

const { Client, LocalAuth } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal')
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb')
const { marshall } = require('@aws-sdk/util-dynamodb')

// ─── Config ───────────────────────────────────────────────────────────────────

// DynamoDB table name — must match what Amplify created
const WHATSAPP_TABLE = process.env.WHATSAPP_TABLE || 'leavs-main-whatsapp-messages'

// AWS region
const AWS_REGION = process.env.AWS_REGION || 'eu-north-1'

/**
 * Restrict to specific group names (partial match, case-insensitive).
 * Set to an empty array [] to capture ALL groups you're a member of.
 *
 * Example:
 *   const MONITORED_GROUPS = ['Bocconi 2025', 'Milan Housing', 'Erasmus Italy']
 */
const MONITORED_GROUPS = []

/**
 * Minimum message length to store (filters out very short reactions/stickers).
 */
const MIN_MESSAGE_LENGTH = 3

// ─── DynamoDB client ──────────────────────────────────────────────────────────

const dynamo = new DynamoDBClient({ region: AWS_REGION })

async function saveMessage(msg, groupName) {
  const item = {
    groupId:    msg.from,                          // e.g. "120363XXXX@g.us"
    messageId:  msg.id._serialized,                // globally unique WA message ID
    groupName:  groupName,
    sender:     msg.author || msg.from,            // sender JID
    senderName: msg._data?.notifyName || '',       // display name if available
    body:       msg.body,
    timestamp:  msg.timestamp,                     // Unix seconds
    fetchedAt:  new Date().toISOString(),
  }

  try {
    await dynamo.send(new PutItemCommand({
      TableName: WHATSAPP_TABLE,
      Item: marshall(item, { removeUndefinedValues: true }),
      // Dedup — don't overwrite if already stored
      ConditionExpression: 'attribute_not_exists(messageId)',
    }))
    return true
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') return false // already stored
    throw err
  }
}

// ─── Filtering ────────────────────────────────────────────────────────────────

function isMonitored(groupName) {
  if (MONITORED_GROUPS.length === 0) return true // capture all
  const lower = groupName.toLowerCase()
  return MONITORED_GROUPS.some((g) => lower.includes(g.toLowerCase()))
}

// ─── WhatsApp client ──────────────────────────────────────────────────────────

const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'leavs-poller' }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
})

client.on('qr', (qr) => {
  console.log('\n[WhatsApp] Scan this QR code with your phone:')
  qrcode.generate(qr, { small: true })
  console.log('\n[WhatsApp] After scanning, this window will show "Authenticated"')
  console.log('[WhatsApp] Session is saved — you won\'t need to scan again on restart\n')
})

client.on('authenticated', () => {
  console.log('[WhatsApp] ✅ Authenticated')
})

client.on('auth_failure', (msg) => {
  console.error('[WhatsApp] ❌ Auth failure:', msg)
  console.error('[WhatsApp] Delete the .wwebjs_auth folder and restart to re-scan QR')
})

client.on('ready', () => {
  console.log('[WhatsApp] ✅ Client is ready — listening for group messages')
  console.log(`[WhatsApp] Table: ${WHATSAPP_TABLE}  Region: ${AWS_REGION}`)
  if (MONITORED_GROUPS.length > 0) {
    console.log(`[WhatsApp] Monitoring groups matching: ${MONITORED_GROUPS.join(', ')}`)
  } else {
    console.log('[WhatsApp] Monitoring ALL groups')
  }
})

client.on('message', async (msg) => {
  // Only process group messages (not direct messages)
  if (!msg.from.endsWith('@g.us')) return

  // Skip empty messages, media-only, and very short reactions
  if (!msg.body || msg.body.length < MIN_MESSAGE_LENGTH) return

  let groupName = msg.from
  try {
    const chat = await msg.getChat()
    groupName = chat.name || msg.from
  } catch {
    // getChat can fail — fall back to JID
  }

  if (!isMonitored(groupName)) return

  try {
    const isNew = await saveMessage(msg, groupName)
    if (isNew) {
      console.log(`[${groupName}] ${msg._data?.notifyName || msg.author}: ${msg.body.slice(0, 60)}${msg.body.length > 60 ? '…' : ''}`)
    }
  } catch (err) {
    console.error(`[WhatsApp] Failed to save message from ${groupName}:`, err.message)
  }
})

client.on('disconnected', (reason) => {
  console.warn('[WhatsApp] Disconnected:', reason)
  console.warn('[WhatsApp] Attempting to reconnect...')
  client.initialize()
})

// ─── Start ────────────────────────────────────────────────────────────────────

console.log('[WhatsApp] Starting Leavs WhatsApp poller...')
client.initialize()

// Keep process alive
process.on('SIGINT', () => {
  console.log('\n[WhatsApp] Shutting down gracefully...')
  client.destroy().then(() => process.exit(0))
})
