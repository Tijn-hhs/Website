// Config voor vaste maandelijkse kosten per stad

export interface CostSliderConfig {
  min: number
  max: number
  default: number
  step: number
  label: string
  description: string
}

export interface CityCostsConfig {
  rent: CostSliderConfig
  utilities: CostSliderConfig
  internet: CostSliderConfig
  mobile: CostSliderConfig
  transport: CostSliderConfig
  groceries: CostSliderConfig
  diningOut: CostSliderConfig
  entertainment: CostSliderConfig
  clothing: CostSliderConfig
  personalCare: CostSliderConfig
  books: CostSliderConfig
}

// Big Mac prijzen per stad (in euro's)
export const BIG_MAC_PRICES: Record<string, number> = {
  Milan: 5.1,
  Barcelona: 4.9,
  Berlin: 4.8,
  Amsterdam: 5.3,
  Paris: 5.4,
  Rome: 5.0,
  Madrid: 4.7,
  London: 4.5,
}

// Vaste kosten configuratie per stad
export const CITY_COSTS: Record<string, CityCostsConfig> = {
  Milan: {
    rent: {
      min: 450,
      max: 900,
      default: 650,
      step: 10,
      label: 'Rent (room in shared apartment)',
      description: 'The low budget option assumes a basic or shared living situation. The high budget option assumes a more central location, greater comfort, or fewer shared costs. Choose what best fits your situation.',
    },
    utilities: {
      min: 80,
      max: 220,
      default: 150,
      step: 5,
      label: 'Utilities (gas/water/electricity – your share)',
      description: 'The low budget option assumes a basic or shared living situation. The high budget option assumes a more central location, greater comfort, or fewer shared costs. Choose what best fits your situation.',
    },
    internet: {
      min: 20,
      max: 40,
      default: 30,
      step: 1,
      label: 'Internet',
      description: 'The low budget option assumes a basic or shared living situation. The high budget option assumes a more central location, greater comfort, or fewer shared costs. Choose what best fits your situation.',
    },
    mobile: {
      min: 10,
      max: 25,
      default: 15,
      step: 1,
      label: 'Mobile phone plan',
      description: 'The low budget option assumes a basic or shared living situation. The high budget option assumes a more central location, greater comfort, or fewer shared costs. Choose what best fits your situation.',
    },
    transport: {
      min: 22,
      max: 39,
      default: 22,
      step: 1,
      label: 'Public transport (monthly pass)',
      description: 'The low budget option assumes a basic or shared living situation. The high budget option assumes a more central location, greater comfort, or fewer shared costs. Choose what best fits your situation.',
    },
    groceries: {
      min: 150,
      max: 350,
      default: 250,
      step: 10,
      label: 'Groceries & food shopping',
      description: 'Cooking at home vs. buying pre-made meals. Low budget: basic ingredients, cooking most meals. High budget: more variety, organic products, convenience foods.',
    },
    diningOut: {
      min: 50,
      max: 250,
      default: 100,
      step: 10,
      label: 'Dining out & restaurants',
      description: 'How often you eat out. Low budget: occasional pizza or casual dining. High budget: frequent restaurant visits, nice dinners.',
    },
    entertainment: {
      min: 30,
      max: 150,
      default: 80,
      step: 10,
      label: 'Entertainment & social activities',
      description: 'Movies, bars, clubs, concerts, events. Low budget: occasional outings, free activities. High budget: regular nightlife, concerts, and events.',
    },
    clothing: {
      min: 30,
      max: 150,
      default: 60,
      step: 10,
      label: 'Clothing & shoes',
      description: 'Monthly average for clothes and shoes. Low budget: occasional basic items. High budget: regular fashion purchases.',
    },
    personalCare: {
      min: 20,
      max: 80,
      default: 40,
      step: 5,
      label: 'Personal care & hygiene',
      description: 'Toiletries, haircuts, cosmetics. Low budget: basic essentials. High budget: salon visits, quality products.',
    },
    books: {
      min: 20,
      max: 100,
      default: 40,
      step: 5,
      label: 'Books & study materials',
      description: 'Textbooks, stationery, printing. Low budget: used books, library use. High budget: new textbooks, lots of materials.',
    },
  },
}

/**
 * Haal de kosten config op voor een specifieke stad.
 * Returned undefined als de stad niet gevonden wordt.
 */
export function getCityConfig(city: string | undefined): CityCostsConfig | undefined {
  if (!city) return undefined
  // Case-insensitive matching
  const normalizedCity = city.trim()
  const found = Object.keys(CITY_COSTS).find(
    (key) => key.toLowerCase() === normalizedCity.toLowerCase()
  )
  return found ? CITY_COSTS[found] : undefined
}

/**
 * Haal de Big Mac prijs op voor een specifieke stad.
 * Returned undefined als de stad niet gevonden wordt.
 */
export function getBigMacPrice(city: string | undefined): number | undefined {
  if (!city) return undefined
  // Case-insensitive matching
  const normalizedCity = city.trim()
  const found = Object.keys(BIG_MAC_PRICES).find(
    (key) => key.toLowerCase() === normalizedCity.toLowerCase()
  )
  return found ? BIG_MAC_PRICES[found] : undefined
}
