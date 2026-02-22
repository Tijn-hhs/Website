// Config voor vaste maandelijkse kosten per stad

export interface CostSliderConfig {
  min: number
  max: number
  default: number
  step: number
  label: string
  description: string
}

export interface HousingTypeOption {
  id: string
  label: string
  min: number
  max: number
  default: number
  description: string
}

export interface CityCostsConfig {
  rent: CostSliderConfig
  housingTypes: HousingTypeOption[]
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
      label: 'Rent',
      description: 'Low: a basic single room in a shared student apartment (e.g. 3–4 flatmates, areas like Famagosta or Loreto) typically costs €450–550/month.\nHigh: a room in a 2-person apartment near Bocconi (Porta Romana, Navigli) runs €750–900/month.',
    },
    housingTypes: [
      {
        id: 'shared-room',
        label: 'Room in shared apartment',
        min: 400,
        max: 700,
        default: 550,
        description: 'Single room in a shared apartment with other students',
      },
      {
        id: 'studio',
        label: 'Studio apartment',
        min: 600,
        max: 1100,
        default: 850,
        description: 'Small studio apartment for yourself',
      },
      {
        id: 'one-bedroom',
        label: '1-bedroom apartment',
        min: 800,
        max: 1500,
        default: 1150,
        description: 'Full one-bedroom apartment',
      },
      {
        id: 'two-bedroom',
        label: '2-bedroom apartment (shared)',
        min: 500,
        max: 900,
        default: 700,
        description: 'Your share of a 2-bedroom apartment split with a roommate',
      },
      {
        id: 'student-residence',
        label: 'Student residence',
        min: 450,
        max: 800,
        default: 625,
        description: 'University-managed student housing',
      },
    ],
    utilities: {
      min: 80,
      max: 220,
      default: 150,
      step: 5,
      label: 'Utilities (gas/water/electricity – your share)',
      description: 'Low: splitting a ~€240 monthly bill 3 ways = ~€80/person (summer).\nHigh: in winter, heating pushes costs up — a 2-person apartment can cost €200+ total, so €100–110 per person. Older buildings and gas heating are the main drivers.',
    },
    internet: {
      min: 20,
      max: 40,
      default: 30,
      step: 1,
      label: 'Internet',
      description: 'Low: a home fibre plan (e.g. TIM or Fastweb, ~€30/month) split between 3 flatmates = ~€10 each.\nHigh: if you pay the full plan yourself or have only one flatmate, expect €25–40/month. Most plans come with unlimited data.',
    },
    mobile: {
      min: 10,
      max: 25,
      default: 15,
      step: 1,
      label: 'Mobile phone plan',
      description: 'Low: Iliad Italy offers 150 GB + unlimited calls for €9.99/month — one of the best value plans. Mid: Fastweb Mobile at €7.95/month (100 GB) or Ho. Mobile at €12.99/month.\nHigh: mainstream operators like TIM or Vodafone charge €15–25/month for equivalent data.',
    },
    transport: {
      min: 22,
      max: 39,
      default: 22,
      step: 1,
      label: 'Public transport (monthly pass)',
      description: 'Low: the ATM student monthly pass costs €22/month (requires a valid student card — worth getting on arrival).\nHigh: without a student card, the standard monthly pass is €39/month. A single metro or bus ride costs €2.20, so a pass pays off after just 10 trips.',
    },
    groceries: {
      min: 150,
      max: 350,
      default: 250,
      step: 10,
      label: 'Groceries & food shopping',
      description: 'Low: cooking simple meals at home (pasta, eggs, vegetables) — a weekly Esselunga shop costs ~€35–40, about €150/month.\nHigh: buying quality proteins, organic produce, and convenience foods (pre-cut veg, ready meals) pushes a weekly shop to €70–90, or ~€300–350/month.',
    },
    diningOut: {
      min: 50,
      max: 250,
      default: 100,
      step: 10,
      label: 'Dining out & restaurants',
      description: 'Low: a pizza + house wine at a local trattoria costs about €18–22 — going once a week adds up to ~€80–90/month. A quick lunch (panino + drink near Bocconi) costs €8–12, so 3 lunches/week = ~€120/month.\nHigh: sit-down dinners 3–4×/week plus regular aperitivo (€10–15/round) easily reaches €200–250/month.',
    },
    entertainment: {
      min: 30,
      max: 150,
      default: 80,
      step: 10,
      label: 'Entertainment & social activities',
      description: 'Low: a cinema ticket costs €9–12; one outing per week (coffee + bar, ~€15) = ~€60/month.\nHigh: a night out in the Navigli area (drinks + club entry) easily costs €40–60 — going out twice a week plus occasional concerts (€25–50 each) adds up to €130–150/month.',
    },
    clothing: {
      min: 30,
      max: 150,
      default: 60,
      step: 10,
      label: 'Clothing & shoes',
      description: 'Low: buying one or two basic items a month — e.g. a Zara t-shirt (€15–20) or H&M jeans (€25–35) averages ~€30–50/month.\nHigh: Milan is a fashion city — regular shopping trips to Corso Buenos Aires or the sales, averaging 2–3 items/week, can reach €120–150/month.',
    },
    personalCare: {
      min: 20,
      max: 80,
      default: 40,
      step: 5,
      label: 'Personal care & hygiene',
      description: 'Low: basic supermarket toiletries (shampoo, soap, razor, etc.) cost ~€15–20/month, plus a budget haircut every 6–8 weeks (~€15) averages to ~€20–25/month.\nHigh: salon haircut (€30–50 each), quality skincare or cosmetics, and branded products push this to €70–80/month.',
    },
    books: {
      min: 20,
      max: 100,
      default: 40,
      step: 5,
      label: 'Books & study materials',
      description: 'Low: buying used or PDF versions of textbooks and using the Bocconi library keeps costs to ~€15–25/month.\nHigh: new Bocconi textbooks cost €40–80 each — buying 2 a month new adds up to ~€80–100/month. Stationery, printing, and course packs add another €10–20/month on top.',
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
