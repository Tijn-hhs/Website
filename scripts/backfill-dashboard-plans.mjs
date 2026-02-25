/**
 * One-time backfill: generate and save dashboardPlan for all existing users
 * who don't have one yet (or pass --force to recalculate everyone).
 *
 * Usage:
 *   node scripts/backfill-dashboard-plans.mjs          # skip users who already have a plan
 *   node scripts/backfill-dashboard-plans.mjs --force  # recalculate for all users
 */
import { DynamoDBClient, ScanCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

const db     = new DynamoDBClient({ region: 'eu-north-1' })
const PROFILES_TABLE = 'leavs-main-user-profiles'
const MODULES_TABLE  = 'leavs-main-content-modules'
const FORCE = process.argv.includes('--force')

// ─── Replicate the Lambda's evaluateModules logic ─────────────────────────────

function buildSituation(profile) {
  return {
    destinationCountry: profile.destinationCountry,
    destinationCity:    profile.destinationCity,
    universityId:       profile.destinationUniversity,   // used as universityId in rules
    originEu:           profile.isEuCitizen === 'yes' ? true
                      : profile.isEuCitizen === 'no'  ? false
                      : undefined,
    originCountry:      profile.nationality ?? profile.residenceCountry,
    degreeType:         profile.degreeType,
  }
}

function matchField(ruleVal, situationVal) {
  if (ruleVal === undefined || situationVal === undefined) return true
  if (Array.isArray(ruleVal)) return ruleVal.includes(situationVal)
  return ruleVal === situationVal
}

function evaluateModules(modules, situation) {
  return modules
    .filter(m => {
      if (m.active === false) return false
      const r = m.visibilityRules
      if (!r) return true
      return (
        matchField(r.destinationCountry, situation.destinationCountry) &&
        matchField(r.destinationCity,    situation.destinationCity) &&
        matchField(r.universityId,       situation.universityId) &&
        matchField(r.originEu,           situation.originEu) &&
        matchField(r.originCountry,      situation.originCountry) &&
        matchField(r.degreeType,         situation.degreeType)
      )
    })
    .sort((a, b) => (a.stepNumber ?? 999) - (b.stepNumber ?? 999))
}

// ─── Scan helpers ─────────────────────────────────────────────────────────────

async function scanAll(table) {
  const items = []
  let lastKey
  do {
    const res = await db.send(new ScanCommand({
      TableName: table,
      ...(lastKey ? { ExclusiveStartKey: lastKey } : {}),
    }))
    for (const item of res.Items ?? []) items.push(unmarshall(item))
    lastKey = res.LastEvaluatedKey
  } while (lastKey)
  return items
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log('Scanning profiles and modules...')
const [profiles, modules] = await Promise.all([
  scanAll(PROFILES_TABLE),
  scanAll(MODULES_TABLE),
])

console.log(`Found ${profiles.length} users, ${modules.length} modules.\n`)

let saved = 0, skipped = 0

for (const profile of profiles) {
  const name = profile.preferredName || profile.userId

  if (!FORCE && profile.dashboardPlan) {
    console.log(`✓  ${name} — already has a plan (${JSON.parse(profile.dashboardPlan).length} modules), skipping`)
    skipped++
    continue
  }

  const situation = buildSituation(profile)
  const matched   = evaluateModules(modules, situation)

  const plan = matched.map(m => ({
    moduleId:    m.moduleId,
    label:       m.label,
    icon:        m.icon,
    description: m.description,
    stepNumber:  m.stepNumber,
    route:       m.route,
    stepType:    m.stepType,
  }))

  await db.send(new UpdateItemCommand({
    TableName: PROFILES_TABLE,
    Key: marshall({ userId: profile.userId }),
    UpdateExpression: 'SET dashboardPlan = :plan',
    ExpressionAttributeValues: marshall({ ':plan': JSON.stringify(plan) }),
  }))

  const eu = situation.originEu === true ? 'EU' : situation.originEu === false ? 'non-EU' : '?'
  console.log(`✅  ${name} (${eu}) — saved plan with ${plan.length} modules: ${plan.map(m => m.label).join(', ')}`)
  saved++
}

console.log(`\nDone. ${saved} updated, ${skipped} skipped.`)
