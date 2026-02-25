/**
 * Patches content modules in DynamoDB with correct visibilityRules.
 *
 * Rules:
 *   Student Visa       → originEu: false  (non-EU only)
 *   Residence Permit   → originEu: false  (non-EU only)
 *   Everything else    → no visibilityRules (universal — shown to everyone)
 *
 * Run once: node scripts/patch-module-visibility.mjs
 */
import { DynamoDBClient, ScanCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

const db = new DynamoDBClient({ region: 'eu-north-1' })
const TABLE = 'leavs-main-content-modules'

/**
 * Map of label → visibilityRules to SET.
 * Modules not listed here will have their visibilityRules cleared (universal).
 */
const VISIBILITY_MAP = {
  'Student Visa':    { originEu: false },
  'Residence Permit': { originEu: false },
}

const { Items = [] } = await db.send(new ScanCommand({ TableName: TABLE }))
const modules = Items.map(i => unmarshall(i))

let updated = 0, skipped = 0

for (const m of modules) {
  const rules = VISIBILITY_MAP[m.label]   // undefined = universal

  if (rules) {
    // Check if already correct
    const existing = m.visibilityRules
    if (
      existing &&
      Object.keys(rules).every(k => existing[k] === rules[k]) &&
      Object.keys(existing).length === Object.keys(rules).length
    ) {
      console.log(`✓  Already set:  "${m.label}" → ${JSON.stringify(rules)}`)
      skipped++
      continue
    }

    await db.send(new UpdateItemCommand({
      TableName: TABLE,
      Key: marshall({ moduleId: m.moduleId }),
      UpdateExpression: 'SET visibilityRules = :rules',
      ExpressionAttributeValues: marshall({ ':rules': rules }),
    }))
    console.log(`✅  "${m.label}" → visibilityRules = ${JSON.stringify(rules)}`)
    updated++
  } else {
    // Universal module — remove any stale visibilityRules
    if (!m.visibilityRules) {
      console.log(`✓  Universal (no rules):  "${m.label}"`)
      skipped++
      continue
    }

    await db.send(new UpdateItemCommand({
      TableName: TABLE,
      Key: marshall({ moduleId: m.moduleId }),
      UpdateExpression: 'REMOVE visibilityRules',
    }))
    console.log(`🧹  Removed stale rules from "${m.label}"`)
    updated++
  }
}

console.log(`\nDone. ${updated} updated, ${skipped} skipped.`)
