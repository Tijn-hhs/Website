/**
 * Patches all existing content modules in DynamoDB with their correct `route` field.
 * Run once: node scripts/patch-module-routes.mjs
 */
import { DynamoDBClient, ScanCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

const db = new DynamoDBClient({ region: 'eu-north-1' })
const TABLE = 'leavs-main-content-modules'

const ROUTE_MAP = {
  'University Application': '/dashboard/university-application',
  'Funding & Scholarships': '/dashboard/funding-scholarships',
  'Student Visa':           '/dashboard/student-visa',
  'Codice Fiscale':         '/dashboard/codice-fiscale',
  'Before Departure':       '/dashboard/before-departure',
  'Residence Permit':       '/dashboard/immigration-registration',
  'Housing':                '/dashboard/housing',
  'Banking':                '/dashboard/banking',
  'Insurance':              '/dashboard/insurance',
  'Healthcare':             '/dashboard/healthcare',
  'Information Centre':     '/dashboard/information-centre',
  'Cost of Living':         '/dashboard/cost-of-living',
  'Buddy System':           '/dashboard/buddy-system',
  'AI Support':             '/dashboard/ai-support',
  'Find Your Peers':        '/dashboard/find-your-peers',
}

// Scan all modules
const { Items = [] } = await db.send(new ScanCommand({ TableName: TABLE }))
const modules = Items.map(i => unmarshall(i))

let updated = 0, skipped = 0

for (const m of modules) {
  const route = ROUTE_MAP[m.label]
  if (!route) {
    console.log(`⚠  No route mapping for: "${m.label}" — skipping`)
    skipped++
    continue
  }
  if (m.route === route) {
    console.log(`✓  Already set: "${m.label}"`)
    skipped++
    continue
  }

  await db.send(new UpdateItemCommand({
    TableName: TABLE,
    Key: marshall({ moduleId: m.moduleId }),
    UpdateExpression: 'SET #route = :route',
    ExpressionAttributeNames:  { '#route': 'route' },
    ExpressionAttributeValues: marshall({ ':route': route }),
  }))

  console.log(`✅  "${m.label}" → ${route}`)
  updated++
}

console.log(`\nDone. ${updated} updated, ${skipped} skipped.`)
