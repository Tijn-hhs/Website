/**
 * Seed script — populates the content DynamoDB tables with the existing
 * Milan / Bocconi data from the source config files.
 *
 * Usage:
 *   TOKEN=<your-cognito-jwt> node scripts/seed-content.mjs
 *
 * Get TOKEN: open the app in browser → DevTools → Application →
 *   Local Storage → CognitoIdentityServiceProvider.*.*.*idToken
 */

const API = 'https://sx3deme02i.execute-api.eu-north-1.amazonaws.com/prod'
const TOKEN = process.env.TOKEN

if (!TOKEN) {
  console.error('❌  Set TOKEN=<cognito-id-token> before running this script.')
  process.exit(1)
}

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${TOKEN}`,
}

async function post(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`POST ${path} → ${res.status}: ${text}`)
  return JSON.parse(text)
}

// ─────────────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱  Starting content seed…\n')

  // ── 1. Country: Italy ──────────────────────────────────────────────────────
  console.log('📍  Creating country: Italy…')
  const { country: italy } = await post('/admin/content/countries', {
    name: 'Italy',
    code: 'IT',
    flagEmoji: '🇮🇹',
    active: true,
  })
  console.log(`    ✅  Italy → ${italy.countryId}\n`)

  // ── 2. City: Milan ─────────────────────────────────────────────────────────
  console.log('🏙️   Creating city: Milan…')
  const { city: milan } = await post('/admin/content/cities', {
    countryId: italy.countryId,
    name: 'Milan',
    active: true,
  })
  console.log(`    ✅  Milan → ${milan.cityId}\n`)

  // ── 3. University: Bocconi ─────────────────────────────────────────────────
  console.log('🎓  Creating university: Bocconi…')
  const { university: bocconi } = await post('/admin/content/universities', {
    countryId: italy.countryId,
    cityId: milan.cityId,
    name: 'Università Bocconi',
    shortName: 'Bocconi',
    active: true,
  })
  console.log(`    ✅  Bocconi → ${bocconi.universityId}\n`)

  // ── 4. Modules — current dashboard steps ──────────────────────────────────
  console.log('🧩  Creating dashboard modules…')

  const modules = [
    // ── Numbered steps (shown in the main dashboard) ────────────────────────
    {
      label: 'University Application',
      icon: '🎓',
      description: 'Research programs, prepare documents, and submit your application.',
      stepNumber: 1,
      visibilityRules: {},   // everyone
      active: true,
    },
    {
      label: 'Funding & Scholarships',
      icon: '💰',
      description: 'Explore scholarships, grants, and financial aid options.',
      stepNumber: 2,
      visibilityRules: {},
      active: true,
    },
    {
      label: 'Student Visa',
      icon: '✈️',
      description: 'Apply for your Italian student visa at a consulate in your home country.',
      stepNumber: 3,
      visibilityRules: { originEu: false },   // Non-EU only — EU citizens don't need a visa
      active: true,
    },
    {
      label: 'Codice Fiscale',
      icon: '🪪',
      description: 'Get your Italian tax code — required for almost everything in Italy.',
      stepNumber: 4,
      visibilityRules: {},
      active: true,
    },
    {
      label: 'Before Departure',
      icon: '🧳',
      description: 'Checklist of things to arrange before you leave home.',
      stepNumber: 5,
      visibilityRules: {},
      active: true,
    },
    {
      label: 'Residence Permit',
      icon: '📄',
      description: 'Apply for your permesso di soggiorno within 8 days of arrival.',
      stepNumber: 6,
      visibilityRules: { originEu: false },   // Non-EU only — EU citizens register differently
      active: true,
    },
    {
      label: 'Housing',
      icon: '🏠',
      description: 'Find an apartment in Milan — neighbourhoods, costs, and tips.',
      stepNumber: 7,
      visibilityRules: {},
      active: true,
    },
    {
      label: 'Banking',
      icon: '💳',
      description: 'Open an Italian bank account or set up a digital alternative.',
      stepNumber: 8,
      visibilityRules: {},
      active: true,
    },
    {
      label: 'Insurance',
      icon: '🛡️',
      description: 'Health insurance requirements and options for students in Italy.',
      stepNumber: 9,
      visibilityRules: {},
      active: true,
    },
    {
      label: 'Healthcare',
      icon: '🏥',
      description: 'Register with a GP and understand the Italian healthcare system.',
      stepNumber: 10,
      visibilityRules: {},
      active: true,
    },

    // ── Extra information pages (not numbered steps) ─────────────────────────
    {
      label: 'Information Centre',
      icon: 'ℹ️',
      description: 'General guides and articles about living in Milan.',
      stepNumber: undefined,
      visibilityRules: {},
      active: true,
    },
    {
      label: 'Cost of Living',
      icon: '📊',
      description: 'Interactive cost breakdown and budget planner for Milan.',
      stepNumber: undefined,
      visibilityRules: {},
      active: true,
    },
    {
      label: 'Buddy System',
      icon: '🤝',
      description: 'Get matched with a current student who can answer your questions.',
      stepNumber: undefined,
      visibilityRules: {},
      active: true,
    },
    {
      label: 'AI Support',
      icon: '🤖',
      description: 'Ask anything about moving to Milan — instant AI answers.',
      stepNumber: undefined,
      visibilityRules: {},
      active: true,
    },
    {
      label: 'Find Your Peers',
      icon: '👥',
      description: 'Connect with other incoming students at your university.',
      stepNumber: undefined,
      visibilityRules: {},
      active: true,
    },
  ]

  for (const mod of modules) {
    process.stdout.write(`    › ${mod.label}… `)
    const { module: m } = await post('/admin/content/modules', mod)
    console.log(`✅  (${m.moduleId})`)
  }

  console.log('\n🎉  Seed complete!')
  console.log(`\n    Country IDs to note:`)
  console.log(`      Italy      → ${italy.countryId}`)
  console.log(`      Milan      → ${milan.cityId}`)
  console.log(`      Bocconi    → ${bocconi.universityId}`)
  console.log('\n    You can now paste these IDs into module visibility rules in the admin Content tab.')
}

seed().catch((err) => {
  console.error('\n❌  Seed failed:', err.message)
  process.exit(1)
})
