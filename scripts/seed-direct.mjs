import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import { randomUUID } from 'crypto'

const db = new DynamoDBClient({ region: 'eu-north-1' })
const now = new Date().toISOString()

async function put(table, item) {
  await db.send(new PutItemCommand({
    TableName: table,
    Item: marshall(item, { removeUndefinedValues: true }),
  }))
}

// ── Country: Italy ────────────────────────────────────────────────────────────
const countryId = randomUUID()
await put('leavs-main-content-countries', {
  countryId, name: 'Italy', code: 'IT', flagEmoji: '\uD83C\uDDEE\uD83C\uDDF9', active: true, createdAt: now,
})
console.log('Country  Italy  ->', countryId)

// ── City: Milan ───────────────────────────────────────────────────────────────
const cityId = randomUUID()
await put('leavs-main-content-cities', {
  cityId, countryId, name: 'Milan', active: true, createdAt: now,
})
console.log('City     Milan  ->', cityId)

// ── University: Bocconi ───────────────────────────────────────────────────────
const universityId = randomUUID()
await put('leavs-main-content-universities', {
  universityId, countryId, cityId,
  name: 'Universita Bocconi', shortName: 'Bocconi', active: true, createdAt: now,
})
console.log('Uni      Bocconi ->', universityId)

// ── Modules ───────────────────────────────────────────────────────────────────
const modules = [
  { label: 'University Application', icon: 'GraduationCap',  description: 'Research programs, prepare documents, and submit your application.', stepNumber: 1,  visibilityRules: {} },
  { label: 'Funding & Scholarships', icon: 'Banknote',       description: 'Explore scholarships, grants, and financial aid options.',              stepNumber: 2,  visibilityRules: {} },
  { label: 'Student Visa',           icon: 'Plane',          description: 'Apply for your Italian student visa at a consulate in your home country.', stepNumber: 3, visibilityRules: { originEu: false } },
  { label: 'Codice Fiscale',         icon: 'CreditCard',     description: 'Get your Italian tax code — required for almost everything in Italy.',   stepNumber: 4,  visibilityRules: {} },
  { label: 'Before Departure',       icon: 'Luggage',        description: 'Checklist of things to arrange before you leave home.',                  stepNumber: 5,  visibilityRules: {} },
  { label: 'Residence Permit',       icon: 'FileText',       description: 'Apply for your permesso di soggiorno within 8 days of arrival.',         stepNumber: 6,  visibilityRules: { originEu: false } },
  { label: 'Housing',                icon: 'Home',           description: 'Find an apartment in Milan — neighbourhoods, costs, and tips.',          stepNumber: 7,  visibilityRules: {} },
  { label: 'Banking',                icon: 'CreditCard',     description: 'Open an Italian bank account or set up a digital alternative.',          stepNumber: 8,  visibilityRules: {} },
  { label: 'Insurance',              icon: 'Shield',         description: 'Health insurance requirements and options for students in Italy.',        stepNumber: 9,  visibilityRules: {} },
  { label: 'Healthcare',             icon: 'Heart',          description: 'Register with a GP and understand the Italian healthcare system.',        stepNumber: 10, visibilityRules: {} },
  { label: 'Information Centre',     icon: 'Info',           description: 'General guides and articles about living in Milan.',                     stepNumber: undefined, visibilityRules: {} },
  { label: 'Cost of Living',         icon: 'BarChart2',      description: 'Interactive cost breakdown and budget planner for Milan.',                stepNumber: undefined, visibilityRules: {} },
  { label: 'Buddy System',           icon: 'Users',          description: 'Get matched with a current student who can answer your questions.',       stepNumber: undefined, visibilityRules: {} },
  { label: 'AI Support',             icon: 'Bot',            description: 'Ask anything about moving to Milan — instant AI answers.',                stepNumber: undefined, visibilityRules: {} },
  { label: 'Find Your Peers',        icon: 'UserPlus',       description: 'Connect with other incoming students at your university.',                stepNumber: undefined, visibilityRules: {} },
]

for (const m of modules) {
  const moduleId = randomUUID()
  await put('leavs-main-content-modules', { moduleId, ...m, active: true, createdAt: now })
  console.log('Module  ', m.label.padEnd(24), '->', moduleId)
}

console.log('\nSeed complete.')
console.log('countryId   :', countryId)
console.log('cityId      :', cityId)
console.log('universityId:', universityId)
