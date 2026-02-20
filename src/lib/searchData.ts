import { blogPosts } from '../data/blogPosts'

export type SearchResultType = 'step' | 'blog' | 'info'

export type SearchItem = {
  id: string
  title: string
  description: string
  type: SearchResultType
  path: string
  category: string
  keywords?: string[]
}

// ─── Dashboard Steps ─────────────────────────────────────────────────────────
const dashboardSteps: SearchItem[] = [
  {
    id: 'step-university-application',
    title: 'University Application',
    description: 'Guidance on applying to Bocconi and Italian universities, requirements, deadlines, and admission.',
    type: 'step',
    path: '/dashboard/university-application',
    category: 'Dashboard Steps',
    keywords: ['admission', 'apply', 'gmat', 'ielts', 'bachelor', 'master', 'degree', 'bocconi'],
  },
  {
    id: 'step-student-visa',
    title: 'Student Visa',
    description: 'How to obtain an Italian student visa (visto di ingresso per motivi di studio) for non-EU students.',
    type: 'step',
    path: '/dashboard/student-visa',
    category: 'Dashboard Steps',
    keywords: ['visa', 'visto', 'non-eu', 'consulate', 'immigration', 'study permit'],
  },
  {
    id: 'step-codice-fiscale',
    title: 'Codice Fiscale',
    description: 'Get your Italian tax code — required for almost every official process: housing, banking, healthcare.',
    type: 'step',
    path: '/dashboard/codice-fiscale',
    category: 'Dashboard Steps',
    keywords: ['tax code', 'fiscal code', 'agenzia entrate', 'cf', 'italian id'],
  },
  {
    id: 'step-before-departure',
    title: 'Before Departure',
    description: 'Everything to prepare before you leave: documents, packing, insurance, and pre-arrival checklist.',
    type: 'step',
    path: '/dashboard/before-departure',
    category: 'Dashboard Steps',
    keywords: ['prepare', 'pack', 'checklist', 'documents', 'flight', 'departure', 'moving'],
  },
  {
    id: 'step-residence-permit',
    title: 'Residence Permit',
    description: 'Apply for your permesso di soggiorno at the Questura within 8 days of arrival in Italy.',
    type: 'step',
    path: '/dashboard/immigration-registration',
    category: 'Dashboard Steps',
    keywords: ['permesso di soggiorno', 'residence permit', 'questura', 'police', 'registration', 'stay'],
  },
  {
    id: 'step-housing',
    title: 'Housing',
    description: 'Find accommodation in Milan: university dorms, private rentals, student housing platforms, and contracts.',
    type: 'step',
    path: '/dashboard/housing',
    category: 'Dashboard Steps',
    keywords: ['apartment', 'rent', 'flat', 'accommodation', 'dormitory', 'lease', 'contract', 'landlord'],
  },
  {
    id: 'step-banking',
    title: 'Banking',
    description: 'Open an Italian bank account. Compare banks like Intesa, UniCredit, N26, Revolut, and Wise.',
    type: 'step',
    path: '/dashboard/banking',
    category: 'Dashboard Steps',
    keywords: ['bank account', 'iban', 'n26', 'revolut', 'wise', 'intesa', 'unicredit', 'money', 'finance'],
  },
  {
    id: 'step-insurance',
    title: 'Insurance',
    description: 'Health and liability insurance options for international students in Italy.',
    type: 'step',
    path: '/dashboard/insurance',
    category: 'Dashboard Steps',
    keywords: ['health insurance', 'coverage', 'policy', 'ssnit', 'private', 'liability'],
  },
  {
    id: 'step-healthcare',
    title: 'Healthcare',
    description: 'Register with the SSN (Italian National Health Service), find a doctor, and access medical care.',
    type: 'step',
    path: '/dashboard/healthcare',
    category: 'Dashboard Steps',
    keywords: ['ssn', 'doctor', 'gp', 'medico di base', 'pharmacist', 'hospital', 'health', 'medical'],
  },
  {
    id: 'step-cost-of-living',
    title: 'Cost of Living',
    description: 'Monthly budget estimates for Milan: rent, food, transport, and social life.',
    type: 'step',
    path: '/dashboard/cost-of-living',
    category: 'Dashboard Steps',
    keywords: ['budget', 'expenses', 'cost', 'money', 'spending', 'afford', 'prices'],
  },
  {
    id: 'step-information-centre',
    title: 'Information Centre',
    description: 'Key contacts, emergency numbers, student organisations, apps, and local government services.',
    type: 'step',
    path: '/dashboard/information-centre',
    category: 'Dashboard Steps',
    keywords: ['contacts', 'emergency', 'esn', 'apps', 'common', 'resources', 'help', 'support'],
  },
]

// ─── Info Snippets ────────────────────────────────────────────────────────────
const infoSnippets: SearchItem[] = [
  {
    id: 'info-112',
    title: 'Emergency number: 112',
    description: 'Single European Emergency Number — police, ambulance, and fire brigade. Save this before you arrive.',
    type: 'info',
    path: '/dashboard/information-centre#emergency-contacts',
    category: 'Quick Info',
    keywords: ['emergency', 'police', 'ambulance', '112', '118', '113', '115'],
  },
  {
    id: 'info-codice-fiscale-how',
    title: 'How to get a Codice Fiscale',
    description: 'Apply at the Agenzia delle Entrate or at your consulate. Usually issued on the spot at the office.',
    type: 'info',
    path: '/dashboard/codice-fiscale',
    category: 'Quick Info',
    keywords: ['codice fiscale', 'agenzia entrate', 'tax code', 'apply'],
  },
  {
    id: 'info-permesso-deadline',
    title: 'Permesso di soggiorno: 8-day deadline',
    description: 'Non-EU students must apply at the Questura within 8 working days of arrival in Italy.',
    type: 'info',
    path: '/dashboard/immigration-registration',
    category: 'Quick Info',
    keywords: ['permesso', 'deadline', 'questura', '8 days', 'residence permit', 'non-eu'],
  },
  {
    id: 'info-atm-milano',
    title: 'ATM Milano: public transport app',
    description: 'Buy metro/tram/bus tickets and plan your journey with the official ATM app. Student passes available.',
    type: 'info',
    path: '/dashboard/information-centre#useful-apps',
    category: 'Quick Info',
    keywords: ['atm', 'metro', 'tram', 'bus', 'transport', 'milan', 'tickets', 'transit'],
  },
  {
    id: 'info-spid',
    title: 'SPID: Italian digital identity',
    description: 'SPID is required for most Italian government online services. Get it via PosteID or Intesa.',
    type: 'info',
    path: '/dashboard/information-centre#useful-apps',
    category: 'Quick Info',
    keywords: ['spid', 'digital identity', 'government', 'posteid', 'login'],
  },
  {
    id: 'info-caf-offices',
    title: 'CAF offices: free bureaucratic help',
    description: 'CAF (Centro di Assistenza Fiscale) offices provide free help with tax forms, benefits, and applications.',
    type: 'info',
    path: '/dashboard/information-centre#legal-help',
    category: 'Quick Info',
    keywords: ['caf', 'tax', 'forms', 'help', 'free', 'patronato', 'assistance', 'bureaucracy'],
  },
  {
    id: 'info-anagrafe-registration',
    title: 'Anagrafe: register your address',
    description: 'Register your Italian address at the Comune di Milano within 20 days of arrival. Required for many services.',
    type: 'info',
    path: '/dashboard/information-centre#local-government',
    category: 'Quick Info',
    keywords: ['anagrafe', 'address', 'register', 'comune', 'residency', 'registry'],
  },
  {
    id: 'info-esn',
    title: 'ESN: Erasmus Student Network',
    description: 'ESN organises social events, travel discounts, and integration activities for international students.',
    type: 'info',
    path: '/dashboard/information-centre#student-organisations',
    category: 'Quick Info',
    keywords: ['esn', 'erasmus', 'events', 'social', 'international', 'travel', 'network'],
  },
]

// ─── Blog Posts ───────────────────────────────────────────────────────────────
const blogSearchItems: SearchItem[] = blogPosts.map((post) => ({
  id: `blog-${post.id}`,
  title: post.title,
  description: post.excerpt,
  type: 'blog' as SearchResultType,
  path: `/blog/${post.id}`,
  category: 'Blog Posts',
  keywords: post.metadata.split(',').map((kw) => kw.trim().toLowerCase()),
}))

// ─── All searchable items ─────────────────────────────────────────────────────
export const allSearchItems: SearchItem[] = [
  ...dashboardSteps,
  ...infoSnippets,
  ...blogSearchItems,
]

// ─── Search function ──────────────────────────────────────────────────────────
export function searchItems(query: string): SearchItem[] {
  const q = query.toLowerCase().trim()
  if (!q) return []

  return allSearchItems.filter((item) => {
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.keywords?.some((kw) => kw.includes(q))
    )
  })
}
