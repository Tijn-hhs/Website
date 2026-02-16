// Configuration for neighborhoods in different cities

export interface Neighborhood {
  id: string
  name: string
  lat: number
  lng: number
  description: string
  avgRent: string // e.g., "€600-800"
  walkabilityScore: number // 1-10
  vibe: string
  populationProfile: string
  prosWithLowBudget: string[]
  prosWithHighBudget: string[]
  consWithLowBudget: string[]
  consWithHighBudget: string[]
  distanceToUniversity: string // e.g., "15 min by metro"
}

export interface UniversityLocation {
  lat: number
  lng: number
  name: string
}

export interface CityNeighborhoods {
  city: string
  universities: Record<string, UniversityLocation>
  neighborhoods: Neighborhood[]
}

// Milan neighborhoods configuration
const milanUniversities: Record<string, UniversityLocation> = {
  Bocconi: {
    lat: 45.4503,
    lng: 9.1897,
    name: 'Bocconi University',
  },
  Politecnico: {
    lat: 45.4699,
    lng: 9.2264,
    name: 'Politecnico di Milano',
  },
  Università: {
    lat: 45.4656,
    lng: 9.2170,
    name: 'Università degli Studi di Milano',
  },
}

const milanNeighborhoods: Neighborhood[] = [
  {
    id: 'navili',
    name: 'Navigli',
    lat: 45.4520,
    lng: 9.1825,
    description: 'Vibrant, artistic quarter with historic canals, trendy bars, and a young, creative community.',
    avgRent: '€550-750',
    walkabilityScore: 9,
    vibe: 'Hip, artistic, social',
    populationProfile: 'Young professionals, artists, students',
    prosWithLowBudget: ['Affordable housing', 'Great nightlife and bars', 'Walkable to everything', 'Lively community', 'Close to Bocconi'],
    prosWithHighBudget: ['Excellent restaurants', 'Canal-side living', 'Boutique shops', 'Art galleries'],
    consWithLowBudget: ['Can get crowded', 'Noisy on weekends', 'Small spaces'],
    consWithHighBudget: ['Limited quietness', 'Expensive dining adds up'],
    distanceToUniversity: '8 min walk / 5 min by bike',
  },
  {
    id: 'porta-romana',
    name: 'Porta Romana',
    lat: 45.4450,
    lng: 9.1980,
    description: 'Charming, slightly quieter neighborhood with botanical garden, good food scene, and easy university access.',
    avgRent: '€600-850',
    walkabilityScore: 8,
    vibe: 'Relaxed, cultural, residential',
    populationProfile: 'Mix of students, young professionals, families',
    prosWithLowBudget: ['Good public transport', 'Very close to Bocconi', 'Near botanical garden', 'Local restaurants'],
    prosWithHighBudget: ['Quality dining options', 'Larger apartments', 'Park access', 'Quieter living'],
    consWithLowBudget: ['Slightly more expensive', 'Fewer bars and nightlife'],
    consWithHighBudget: ['Less trendy nightlife' ],
    distanceToUniversity: '5 min walk',
  },
  {
    id: 'porta-venezia',
    name: 'Porta Venezia',
    lat: 45.4740,
    lng: 9.2050,
    description: 'Modern, vibrant area with several universities, museums, and a cosmopolitan atmosphere.',
    avgRent: '€650-900',
    walkabilityScore: 8,
    vibe: 'Modern, diverse, cosmopolitan',
    populationProfile: 'International students, young professionals',
    prosWithLowBudget: ['Near university facilities', 'Good public transport', 'International community'],
    prosWithHighBudget: ['Modern amenities', 'Excellent restaurants', 'Shopping nearby'],
    consWithLowBudget: ['More expensive than Navigli', 'More urban/less artistic'],
    consWithHighBudget: ['Less unique character'],
    distanceToUniversity: '20 min walk / 8 min by metro',
  },
  {
    id: 'ticinese',
    name: 'Ticinese',
    lat: 45.4475,
    lng: 9.1695,
    description: 'Bohemian neighborhood with independent shops, vintage stores, and a creative, young community.',
    avgRent: '€520-700',
    walkabilityScore: 9,
    vibe: 'Bohemian, creative, underground',
    populationProfile: 'Artists, students, creative professionals',
    prosWithLowBudget: ['Most affordable', 'Very walkable', 'Unique vibe', 'Great for creatives'],
    prosWithHighBudget: ['Trendy concept stores', 'Cool restaurants emerging', 'Authentic Milan'],
    consWithLowBudget: ['Fewer amenities', 'Less touristy = less services'],
    consWithHighBudget: ['Still less polished than central areas'],
    distanceToUniversity: '12 min walk / 8 min by metro',
  },
  {
    id: 'sant-ambrogio',
    name: 'Sant\'Ambrogio',
    lat: 45.4580,
    lng: 9.1650,
    description: 'Historic, central neighborhood with famous market, mix of students and locals, authentic Milan.',
    avgRent: '€600-800',
    walkabilityScore: 9,
    vibe: 'Authentic, historic, mixed',
    populationProfile: 'Students, locals, families',
    prosWithLowBudget: ['Great food market', 'Very walkable', 'Authentic Milan', 'Good value'],
    prosWithHighBudget: ['Central location', 'Historic charm', 'Excellent food'],
    consWithLowBudget: ['Less nightlife than Navigli'],
    consWithHighBudget: ['Less upscale amenities'],
    distanceToUniversity: '15 min walk / 10 min by metro',
  },
  {
    id: 'isola',
    name: 'Isola',
    lat: 45.4863,
    lng: 9.1910,
    description: 'Up-and-coming neighborhood with new restaurants and bars, good mix of affordability and quality of life.',
    avgRent: '€580-750',
    walkabilityScore: 8,
    vibe: 'Emerging, trendy, friendly',
    populationProfile: 'Young professionals, students, artists',
    prosWithLowBudget: ['More affordable', 'Emerging food scene', 'Good community feel'],
    prosWithHighBudget: ['New restaurants', 'Growing reputation', 'Less crowded than Navigli'],
    consWithLowBudget: ['Slightly further from Bocconi', 'Still developing'],
    consWithHighBudget: ['Less established upscale scene'],
    distanceToUniversity: '25 min by metro / 20 min by bike',
  },
]

export const CITY_NEIGHBORHOODS: Record<string, CityNeighborhoods> = {
  Milan: {
    city: 'Milan',
    universities: milanUniversities,
    neighborhoods: milanNeighborhoods,
  },
}

export function getNeighborhoodsForCity(city?: string): Neighborhood[] {
  if (!city) return []
  const config = CITY_NEIGHBORHOODS[city]
  return config?.neighborhoods || []
}

export function getUniversityLocation(city?: string, universityName?: string): UniversityLocation | null {
  if (!city || !universityName) return null
  const config = CITY_NEIGHBORHOODS[city]
  if (!config) return null
  
  // Try exact match first
  if (config.universities[universityName]) {
    return config.universities[universityName]
  }
  
  // Try case-insensitive match
  const normalizedName = universityName.toLowerCase()
  for (const [key, location] of Object.entries(config.universities)) {
    if (key.toLowerCase().includes(normalizedName) || normalizedName.includes(key.toLowerCase())) {
      console.log(`[NeighborhoodConfig] Matched university: "${universityName}" to "${key}"`)
      return location
    }
  }
  
  // If no match found, default to first university
  const firstKey = Object.keys(config.universities)[0]
  if (firstKey) {
    console.log(`[NeighborhoodConfig] Using default university: "${firstKey}" for "${universityName}"`)
    return config.universities[firstKey]
  }
  
  return null
}

export function recommendNeighborhoods(
  neighborhoods: Neighborhood[],
  maxBudget: number,
  preferWalkability: boolean
): Neighborhood[] {
  return neighborhoods
    .filter((n) => {
      const rentRange = n.avgRent
      const maxRentPrice = parseInt(rentRange.split('-')[1] || '0')
      return maxRentPrice <= maxBudget
    })
    .sort((a, b) => {
      if (preferWalkability) {
        return b.walkabilityScore - a.walkabilityScore
      }
      // Default: sort by affordability
      const aRent = parseInt(a.avgRent.split('-')[0] || '0')
      const bRent = parseInt(b.avgRent.split('-')[0] || '0')
      return aRent - bRent
    })
}
