// Configuration for neighborhoods in different cities

export interface KeyPlace {
  name: string
  type: 'cafe' | 'bar' | 'restaurant' | 'market' | 'park' | 'landmark' | 'shop' | 'gym' | 'library'
  note: string
}

export interface Neighborhood {
  id: string
  name: string
  lat: number
  lng: number
  shortDescription: string
  longDescription: string
  avgRent: string
  walkabilityScore: number // 1-10
  vibe: string
  populationProfile: string
  prosWithLowBudget: string[]
  prosWithHighBudget: string[]
  consWithLowBudget: string[]
  consWithHighBudget: string[]
  distanceToBocconi: string
  distanceToUniStatale: string
  distanceToPolitecnico: string
  distanceToCity: string
  transitOptions: string[]
  keyPlaces: KeyPlace[]
  bestFor: string[]
  notFor: string[]
  photoUrl: string
  /** @deprecated Use distanceToBocconi / distanceToUniStatale / distanceToPolitecnico */
  distanceToUniversity: string
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

// Milan universities
const milanUniversities: Record<string, UniversityLocation> = {
  Bocconi: { lat: 45.4503, lng: 9.1897, name: 'Bocconi University' },
  Politecnico: { lat: 45.4699, lng: 9.2264, name: 'Politecnico di Milano' },
  Università: { lat: 45.4656, lng: 9.2170, name: 'Università degli Studi di Milano' },
}

const milanNeighborhoods: Neighborhood[] = [
  {
    id: 'navigli',
    name: 'Navigli',
    lat: 45.4520,
    lng: 9.1825,
    shortDescription: "Milan's canalside heartbeat — bars, art, and aperitivo at golden hour.",
    longDescription: `Navigli is the neighbourhood everyone warned you would steal your heart — and it will. Built around the Naviglio Grande and Naviglio Pavese, two historic canals that once carried marble for the Duomo's construction, the area transforms dramatically from morning to midnight. By day it's relaxed: locals pick up fresh pasta from deli counters, cyclists weave past tiny ateliers, and art students sketch on the canalside steps. Around 6 pm the aperitivo ritual kicks in — every bar lines its counter with free buffet food, the canal glistens amber in the fading light, and the bridges fill with people holding Campari spritz. By night it's one of the loudest, most joyful streets in Italy.

Living here means stumbling onto the legendary Sunday Mercatone dell'Antiquariato antique market (last Sunday of every month), eating world-class pizza at hole-in-the-wall places that seat twelve people, and buying your groceries at the covered Mercato Comunale. The streets behind the canal — via Corsico, via Vigevano, via Torricelli — are surprisingly quiet, with belle-époque courtyards and climbing ivy. It's close enough to walk to Bocconi in under ten minutes, making it the default choice for students who refuse to compromise on nightlife or character.

The main downside is noise: Friday and Saturday nights mean crowds until 2 am on the canal towpaths. If you value sleep on weekends, look one or two streets back where prices are similar but the sound fades significantly. Small apartments (20–30 m²) go fast; larger two-beds shared among Bocconi students are the norm.`,
    avgRent: '€550–780',
    walkabilityScore: 9,
    vibe: 'Hip, artistic, social, aperitivo-obsessed',
    populationProfile: 'International students, young creatives, chefs, Bocconi regulars',
    prosWithLowBudget: [
      'Most affordable area this close to Bocconi',
      'Free aperitivo buffets at every bar 6–9 pm',
      'Cheap street food and pizza al taglio',
      'Walkable to Bocconi (8–10 min)',
      'Incredible built-in social life',
    ],
    prosWithHighBudget: [
      'Canal-facing apartments are genuinely beautiful',
      'Outstanding restaurant scene (Pont de Ferr, El Brellin)',
      'Boutique design shops and art galleries',
      'Can afford the quieter, larger apartments set back from canal',
    ],
    consWithLowBudget: [
      'Very loud Fri–Sat nights until 2 am on the canal',
      'Tiny apartments go within hours of listing',
      'Nearest Esselunga is a 10-min walk',
    ],
    consWithHighBudget: [
      'Canal-facing apartments command a significant premium',
      'Not the most prestigious address',
    ],
    distanceToBocconi: '8 min walk · 4 min by bike',
    distanceToUniStatale: '20 min by metro (M2 → Cadorna → M1)',
    distanceToPolitecnico: '30 min by metro (M2 Porta Genova → Centrale → M2 Lambrate)',
    distanceToCity: '15 min by metro (M2 to Cordusio) · 30 min walk',
    transitOptions: [
      'M2 Porta Genova — 5 min walk (direct to Centrale, Garibaldi)',
      'Tram 2 / Tram 9 — along Naviglio Grande',
      'Bus 94 — night bus to city centre',
      'BikeMi station at Darsena (1 min walk)',
    ],
    keyPlaces: [
      { name: 'Darsena harbour', type: 'landmark', note: 'Iconic basin — best sunset spot in Milan; aperitivo culture peaks here' },
      { name: "Mercatone dell'Antiquariato", type: 'market', note: 'Legendary antique market, last Sunday of every month' },
      { name: 'Mag Cafè', type: 'bar', note: 'Best natural wine list in Navigli — tiny, always packed' },
      { name: 'Pont de Ferr', type: 'restaurant', note: 'Michelin-starred yet casual; canal-side views' },
      { name: "El Brellin", type: 'restaurant', note: 'Historic Milanese trattoria on the canal (since the 1700s)' },
      { name: 'Mercato Comunale Via Montegani', type: 'market', note: 'Covered daily market — best fresh pasta and cheese counters' },
      { name: 'Upcycle', type: 'bar', note: 'Cycling-themed cocktail bar on Naviglio Pavese' },
    ],
    bestFor: ['Night owls & social butterflies', 'Bocconi students', 'Budget-conscious renters', 'People who love art & vintage'],
    notFor: ['Light sleepers', 'People wanting polish & quiet prestige', 'Families with young children'],
    photoUrl: 'https://images.unsplash.com/photo-1556040220-4096d522378d?auto=format&w=900&q=75',
    distanceToUniversity: '8 min walk / 4 min by bike',
  },
  {
    id: 'porta-romana',
    name: 'Porta Romana',
    lat: 45.4450,
    lng: 9.1980,
    shortDescription: 'Elegant and walkable — the perfect Bocconi basecamp with all of daily life covered on foot.',
    longDescription: `Porta Romana is what happens when a neighbourhood gets everything right without shouting about it. Unlike the Instagram-famous Navigli, it does not try hard — it just works. The main artery, Corso di Porta Romana, is lined with bakeries, pharmacies, a Lidl, a Pam Panorama, cafés that open at 7 am, and trattorias that fill up with office workers and professors at lunch. It's one of the few areas in central Milan where you can run all your errands on foot without getting on the metro.

The neighbourhood borders directly on Bocconi's back entrance on Viale Bligny — the walk to lectures is literally five to seven minutes through beautiful streets. The Giardino della Guastalla, Milan's oldest public garden (dating to 1555), is three minutes away and offers a perfect green escape that feels like a hidden secret even among Milanese residents. The Porta Romana arch at the end of Corso di Porta Romana is a striking remnant of the Spanish city walls — a daily visual reminder that this city has centuries of layers beneath its fashionable surface.

Socially, Porta Romana is quieter than Navigli — there's a bar scene, but it's for aperitivo, not for 2 am crowds. That makes it a better match for people who want to actually study during the week but still access Navigli on foot in ten minutes. Rents are comparable to Navigli, and apartments tend to be larger. Many Bocconi students end up here in their second year once they realise they want peace more than proximity to the canal.`,
    avgRent: '€600–880',
    walkabilityScore: 9,
    vibe: 'Elegant, residential, practical, quietly charming',
    populationProfile: 'Bocconi students, young professionals, long-term expats, Italian families',
    prosWithLowBudget: [
      'Closest neighbourhood to Bocconi (5–7 min walk)',
      'Lidl and Pam supermarkets within 3 min walk',
      'Giardino della Guastalla — free, beautiful park',
      'Great coffee & aperitivo without the noise',
    ],
    prosWithHighBudget: [
      'Larger apartments (50–80 m²) on quiet side streets',
      'Excellent dining along Corso di Porta Romana',
      'Access to private courtyard gardens in historic buildings',
      'Well-maintained art deco and early 20th-century buildings',
    ],
    consWithLowBudget: [
      'Slightly less affordable than Ticinese',
      'Nightlife is local and low-key — you need to travel for big nights',
    ],
    consWithHighBudget: [
      'Less "prestigious" address than Brera or city centre',
      'Main road gets noisy with traffic',
    ],
    distanceToBocconi: '5 min walk · 3 min by bike',
    distanceToUniStatale: '15 min by metro (M3 Porta Romana → Duomo)',
    distanceToPolitecnico: '25 min by metro (M3 → Lambrate)',
    distanceToCity: '12 min by metro · 25 min walk',
    transitOptions: [
      'M3 Porta Romana — 5 min walk (direct to Duomo in 4 stops)',
      'M3 Lodi TIBB — 8 min walk',
      'Tram 16 — straight up to city centre',
      'BikeMi at Viale Bligny (right outside Bocconi)',
    ],
    keyPlaces: [
      { name: 'Giardino della Guastalla', type: 'park', note: "Milan's oldest public garden (1555) — peaceful 3 min from Bocconi" },
      { name: 'Porta Romana arch', type: 'landmark', note: 'Surviving gate of the Spanish city walls — a daily dose of history' },
      { name: 'Pam Panorama Porta Romana', type: 'market', note: 'Well-stocked supermarket 4 min from Bocconi entrance' },
      { name: "Osteria dell'Acquabella", type: 'restaurant', note: 'Authentic Milanese food, student-friendly prices' },
      { name: 'Caffè Pascucci', type: 'cafe', note: 'Go-to morning ritual for Bocconi regulars' },
      { name: 'Bar Bianco (in Parco Sempione — bike ride)', type: 'bar', note: "Milan's favourite outdoor bar in summer — 20 min by bike" },
    ],
    bestFor: ['Bocconi students who want to walk to class', 'Study-first people who still enjoy aperitivo', 'People wanting everyday convenience'],
    notFor: ['People who want a buzzing nightlife on their doorstep', 'Those needing a trendy postcode'],
    photoUrl: 'https://images.unsplash.com/photo-1535083783855-aaab7712f2f7?auto=format&w=900&q=75',
    distanceToUniversity: '5 min walk / 3 min by bike',
  },
  {
    id: 'ticinese',
    name: 'Ticinese',
    lat: 45.4475,
    lng: 9.1695,
    shortDescription: 'Bohemian, young, and the cheapest cool address in central Milan — Roman columns and natural wine.',
    longDescription: `Ticinese sits just south-west of the Darsena and stretches down Corso di Porta Ticinese, a long, lively pedestrian-friendly street lined with vintage clothing stores, independent record shops, tattoo studios, and cafés that serve natural wine next to the espresso machine. It is cheaper than Navigli but shares much of its energy — in fact, the two neighbourhoods blend seamlessly at the Darsena harbour.

The neighbourhood's spiritual heart is the Colonne di San Lorenzo — sixteen ancient Roman columns from the 2nd century AD standing in the middle of a piazza. Every evening from spring through autumn, hundreds of young Milanese gather on the steps with cans of beer and spritz, treating the 1,800-year-old ruins as their living room. It is one of the most genuinely Milanese scenes you can witness, completely free, and not yet overrun by tourists. Behind the columns stands the Basilica di Sant'Eustorgio, a Romanesque gem housing the alleged relics of the Three Kings.

Apartments here tend to be older and less renovated than Porta Romana, accounting for the lower prices. Streets like Via Morosini, Via Nino Bixio, and Via Vigevano offer studio flats and shared three-beds. Many of the best apartments are in internal cortili (courtyards): silent, charming, invisible from the street. Ticinese attracts art and design students, photographers, musicians, and anyone who wants character over convenience — while still being a 15-minute walk from Bocconi.`,
    avgRent: '€500–700',
    walkabilityScore: 9,
    vibe: 'Bohemian, creative, underground, authentic',
    populationProfile: 'Art and design students, musicians, creatives, budget-conscious young professionals',
    prosWithLowBudget: [
      'Most affordable among the central cool neighbourhoods',
      'Colonne di San Lorenzo — free social scene every evening',
      'Excellent vintage and independent shopping',
      'Very walkable to Navigli, Bocconi, and city centre',
    ],
    prosWithHighBudget: [
      'Beautiful cortile apartments below market rate',
      'Growing restaurant scene with natural wine bars',
      'Emerging boutique concepts',
    ],
    consWithLowBudget: [
      'Older building stock — some apartments poorly insulated in winter',
      'Fewer supermarkets on the main street',
      'Nightlife noise on weekends near the Colonne',
    ],
    consWithHighBudget: [
      'Less polished than Brera or Città Vecchia',
      'Fewer upscale amenities',
    ],
    distanceToBocconi: '15 min walk · 8 min by bike',
    distanceToUniStatale: "20 min by metro (M2 Sant'Ambrogio → Cadorna → M1)",
    distanceToPolitecnico: '35 min by metro',
    distanceToCity: '20 min walk · 10 min by tram',
    transitOptions: [
      'M2 Porta Genova — 10 min walk',
      "M2 Sant'Ambrogio — 12 min walk",
      'Tram 3 — runs along Corso di Porta Ticinese to city centre',
      'Bus 94 — late-night connection to Duomo',
      'BikeMi — multiple stations near Darsena',
    ],
    keyPlaces: [
      { name: 'Colonne di San Lorenzo', type: 'landmark', note: "2nd-century Roman columns — Milan's most beloved outdoor hangout, every evening" },
      { name: "Basilica di Sant'Eustorgio", type: 'landmark', note: 'Romanesque church with a remarkable 15th-century Portinari chapel' },
      { name: 'Darsena harbour', type: 'landmark', note: 'Shared with Navigli — the best sunset view in Milan' },
      { name: 'Rasoio', type: 'bar', note: 'Tiny natural wine bar on Corso Ticinese — neighbourhood favourite' },
      { name: 'LPM Record Store', type: 'shop', note: 'Legendary vinyl shop for jazz, soul, and Italian soundtrack records' },
      { name: 'Carrefour Express Ticinese', type: 'market', note: 'Small but convenient for daily needs' },
    ],
    bestFor: ['Creative and artistic personalities', 'Budget-maximisers who still want buzz', 'Vintage and independent culture lovers'],
    notFor: ['Those wanting modern amenities', 'People sensitive to nighttime noise near historic landmarks'],
    photoUrl: 'https://images.unsplash.com/photo-1536893827774-411e1dc7c902?auto=format&w=900&q=75',
    distanceToUniversity: '15 min walk / 8 min by bike',
  },
  {
    id: 'brera',
    name: 'Brera',
    lat: 45.4710,
    lng: 9.1870,
    shortDescription: "Milan's romantic art district — cobblestone streets, world-class galleries, and designer boutiques.",
    longDescription: `If you told someone you live in Brera and they've been to Milan, they'll look at you with mild envy. Brera is what people imagine when they dream of living in an Italian city. Its cobblestone streets (via Fiori Chiari, via Fiori Oscuri, via Madonnina) are lined with high-end antique dealers, fashion boutiques, florists, and bistros with outdoor tables that stay full from breakfast through midnight. The centrepiece is the Pinacoteca di Brera — one of Italy's top art museums, housing Raphael's Marriage of the Virgin and Mantegna's Lamentation of Christ.

Living in Brera means accepting two trade-offs in exchange for postcard beauty: it is expensive, and it is busy. The area draws tourists and fashionistas year-round; during design week (Salone del Mobile, April) and fashion weeks it becomes almost impassable. But on a Tuesday morning in November, with mist still hanging between the buildings and a barista who knows your order, you will feel like the protagonist of a Ferrante novel. There is also a hidden botanical garden (Orto Botanico) behind the Pinacoteca that almost nobody knows about — a secret green oasis of fig trees and climbing roses.

Practically, Brera is central and well-connected. The Garibaldi and Moscova metro stops are both 8–10 minutes on foot. Many residents here are professionals (consultants, architects, lawyers) — the student population skews toward those with family support. For the right person, Brera offers a quality of daily life that is hard to match anywhere else in northern Europe at comparable cost.`,
    avgRent: '€800–1,200',
    walkabilityScore: 10,
    vibe: 'Elegant, romantic, artistic, fashion-forward',
    populationProfile: 'Expat professionals, art and architecture students, affluent young creatives',
    prosWithLowBudget: [
      'Pinacoteca di Brera — world-class art, student discount €3',
      'Beautiful streets to walk daily — no transport needed for leisure',
      'Some good-value lunch spots and panini bars off the main drag',
    ],
    prosWithHighBudget: [
      'The most beautiful neighbourhood in Milan, full stop',
      'Outstanding dining — from family trattorias to Michelin stars',
      'Designer boutiques and antique dealers at street level',
      'Apartments with frescoed ceilings and original mosaic floors',
      'Walking distance to fashion district (Montenapoleone, 10 min)',
    ],
    consWithLowBudget: [
      'Most expensive neighbourhood on this list',
      'Groceries require a 10–15 min walk to Esselunga near Cadorna',
      'Supermarkets in the area are small convenience stores at premium prices',
    ],
    consWithHighBudget: [
      'Tourist crowds during Salone, fashion weeks, and weekends',
      'Expensive restaurants and bars add up quickly',
    ],
    distanceToBocconi: '22 min by metro (M2 Lanza → Cadorna → change) · 28 min by bike',
    distanceToUniStatale: '12 min by metro (M2 Lanza → Centrale) or 18 min walk',
    distanceToPolitecnico: '20 min by metro (M2)',
    distanceToCity: '15 min walk to Duomo · 8 min by metro',
    transitOptions: [
      'M2 Lanza — 8 min walk (green line, direct to Garibaldi and Cadorna)',
      'M3 Montenapoleone — 10 min walk (yellow line)',
      'Tram 1 — along Via Pontaccio toward Cadorna',
      'BikeMi at Piazza del Carmine (2 min walk)',
    ],
    keyPlaces: [
      { name: 'Pinacoteca di Brera', type: 'landmark', note: "Italy's great northern art museum — Raphael, Mantegna, Caravaggio, all in one building. Student discount €3." },
      { name: 'Via Fiori Chiari', type: 'landmark', note: 'The most photographed street in Milan — outdoor cafés, galleries, evening crowds' },
      { name: 'Bar Jamaica', type: 'bar', note: 'Historic bar where Umberto Eco and Lucio Fontana used to drink — still atmospheric' },
      { name: 'Trattoria Milanese', type: 'restaurant', note: 'Old-school Milanese kitchen, risotto to die for, since 1933' },
      { name: 'Orto Botanico di Brera', type: 'park', note: "Hidden botanical garden behind the Pinacoteca — almost nobody knows it exists, stunning in spring" },
      { name: 'Corso Como (10 min walk)', type: 'shop', note: "10 Corso Como — Milan's legendary concept store, gallery, and café in one" },
    ],
    bestFor: ['Design and architecture lovers', 'People valuing beauty over budget', 'Art museum regulars', 'Romantics and flâneurs'],
    notFor: ['Budget-conscious students', 'Anyone who hates crowds', 'People who need to be near Bocconi daily'],
    photoUrl: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&w=900&q=75',
    distanceToUniversity: '22 min by metro',
  },
  {
    id: 'porta-venezia',
    name: 'Porta Venezia',
    lat: 45.4740,
    lng: 9.2050,
    shortDescription: "Cosmopolitan and inclusive — Liberty architecture, Milan's biggest park, and the best phở north of Naples.",
    longDescription: `Porta Venezia is the neighbourhood that Milan locals are most proud of because it defies easy categorisation. It has the finest concentration of Liberty (Art Nouveau) architecture outside of Nancy, France — on buildings like the Palazzo Castiglioni and the Casa Galimberti, whose facades are entirely covered in colourful ceramic tiles and sculpted flowers. It is Milan's most openly LGBTQ+-friendly area, with dozens of inclusive bars and clubs. It has the Giardini Pubblici Indro Montanelli, the city's largest public park (170,000 m²) — a green lung of tall trees, a small natural history museum, a pond with ducks, and hundreds of people reading on benches in every season.

The neighbourhood also has a very large Vietnamese and Asian community concentrated around via Padova and the eastern streets, giving it a food culture that swings between the best phở in northern Italy and excellent South-East Asian street food at under €8. Corso Buenos Aires — one of Europe's most densely-packed shopping streets — starts right at the Porta Venezia metro and runs north for over a kilometre, meaning you'll never travel far for clothes, homeware, or anything else you need.

In terms of student life, Porta Venezia is extremely popular with international students from all universities. The metro connection to Bocconi requires changing lines (M1 → M3) and takes about 25 minutes; many residents cycle instead in about 20 minutes. It's also 10 minutes from Milan Centrale, making weekend trips to Venice, Florence, or Bologna effortless.`,
    avgRent: '€650–950',
    walkabilityScore: 8,
    vibe: 'Cosmopolitan, inclusive, lively, culturally diverse',
    populationProfile: 'International students (all universities), LGBTQ+ community, expats, young professionals',
    prosWithLowBudget: [
      'Giardini Pubblici — huge free park for studying and jogging',
      'Excellent affordable Asian food (Vietnamese, Thai, Chinese)',
      'Corso Buenos Aires for budget fashion and homeware shopping',
      'Very international community — easy to make friends',
    ],
    prosWithHighBudget: [
      'Stunning Liberty-era apartments with ornate facades',
      'Corso Venezia upmarket restaurants and boutique bars',
      'Easy access to Centrale station for frequent travel',
      'Some of the best aperitivo bars in Milan',
    ],
    consWithLowBudget: [
      'Longer commute to Bocconi (25 min metro, 20–25 min bike)',
    ],
    consWithHighBudget: [
      'Via Padova area (far northeast) feels rough at night',
      'Heavy traffic on the main boulevards',
    ],
    distanceToBocconi: '25 min by metro (M1 → change → M3) · 22 min by bike',
    distanceToUniStatale: '12 min by metro (M1 Porta Venezia → Repubblica) · 15 min walk',
    distanceToPolitecnico: '15 min by metro (M1 → Lambrate)',
    distanceToCity: '10 min by metro (M1 → Duomo) · 20 min walk',
    transitOptions: [
      'M1 Porta Venezia — direct red line to Duomo (3 stops) and Cadorna',
      'M1 Lima — 8 min walk',
      'Tram 9 — east–west along Corso Buenos Aires',
      'Bus 60 — frequent service toward city centre',
      'BikeMi — stations along Corso Buenos Aires and Piazza Oberdan',
    ],
    keyPlaces: [
      { name: 'Giardini Pubblici Indro Montanelli', type: 'park', note: "Milan's main city park — 17 ha, duck pond, natural history museum; perfect for outdoor study" },
      { name: 'Palazzo Castiglioni', type: 'landmark', note: 'Masterpiece of Italian Liberty architecture (1904) — the ceramic flower facades are unmissable' },
      { name: 'Casa Galimberti', type: 'landmark', note: 'Art Nouveau building entirely covered in painted ceramic panels — extraordinary street art avant la lettre' },
      { name: 'Carrera Café', type: 'bar', note: 'Iconic aperitivo spot on Corso Venezia — always packed, always fun' },
      { name: 'Pho 24', type: 'restaurant', note: 'Best Vietnamese phở in Milan — €9 a bowl, huge portions, open late' },
      { name: 'Mono Bar', type: 'bar', note: 'LGBTQ+-friendly neighbourhood institution — good cocktails, great people-watching' },
      { name: 'Corso Buenos Aires', type: 'shop', note: 'Major shopping street — H&M, Zara, local fashion, homeware, all in a single walk' },
    ],
    bestFor: ['International students from multiple universities', 'LGBTQ+ students', 'People who love diversity and food culture', 'Frequent travellers (close to Centrale)'],
    notFor: ['Students who need to be near Bocconi every day', 'People who dislike busy main roads'],
    photoUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&w=900&q=75',
    distanceToUniversity: '25 min by metro',
  },
  {
    id: 'sant-ambrogio',
    name: "Sant'Ambrogio",
    lat: 45.4580,
    lng: 9.1650,
    shortDescription: "Historic, authentic Milan — a 4th-century basilica, a legendary market, and a quiet confidence that never ages.",
    longDescription: `Sant'Ambrogio feels like you've accessed an older, more confident version of Milan that the tourist brochures don't quite capture. The anchor is the Basilica di Sant'Ambrogio, one of the oldest and most important churches in Italy (founded in 379 AD), set in a wide arcaded atrium that is genuinely one of the most beautiful squares in the country. The façade is Romanesque, the interior intimate and breathtaking; the atmosphere is completely different from the tourist circus around the Duomo.

Around the basilica, life organises itself in the way that satisfies most deeply: a proper covered market (Mercato di via Sant'Ambrogio) where serious home cooks have been buying their cheese, salumi, and vegetables for decades; a cluster of unpretentious trattorias open for lunch; the Università Cattolica campus nearby, which keeps the streets full of students without making the area feel exclusively studentish. The Parco delle Basiliche, a long linear park connecting Sant'Ambrogio to Sant'Eustorgio in the south, is perfect for an evening walk. Everything you need is within ten minutes' walk: an Esselunga, several pharmacies, a post office, hardware stores.

The area feels rooted rather than fashionable — which is exactly what many students discover they want after their first semester of canal-side chaos. Bocconi is 15–18 minutes on foot through quiet streets; the M2 metro stop is 5 minutes away for everything else.`,
    avgRent: '€580–820',
    walkabilityScore: 9,
    vibe: 'Historic, authentic, calm, rooted in Milanese identity',
    populationProfile: 'Cattolica students, long-term residents, families, academic staff',
    prosWithLowBudget: [
      "Mercato di via Sant'Ambrogio — best prices for fresh produce and cheese in central Milan",
      'Very walkable to both Bocconi and city centre',
      'Parco delle Basiliche — free, long, lovely park',
      'Local trattorias: €10–13 fixed lunch including wine',
    ],
    prosWithHighBudget: [
      'Large apartments in historic buildings near the basilica',
      'Elegant and discreet — preferred by academics and professionals',
      'Esselunga full-service grocery within 5 min walk',
    ],
    consWithLowBudget: [
      'Quieter nightlife — need to travel to Navigli for big evenings',
      'Slightly less affordable than Ticinese',
    ],
    consWithHighBudget: [
      'Limited high-end restaurant options directly in the neighbourhood',
    ],
    distanceToBocconi: '15 min walk · 9 min by bike',
    distanceToUniStatale: "15 min by metro (M2 Sant'Ambrogio → Cadorna → walk)",
    distanceToPolitecnico: '28 min by metro',
    distanceToCity: "12 min by metro (M2 Sant'Ambrogio → Duomo) · 25 min walk",
    transitOptions: [
      "M2 Sant'Ambrogio — 5 min walk (green line, direct to Duomo and Cadorna)",
      'M2 Porta Genova — 10 min walk',
      'Tram 3 — along Via De Amicis toward city centre',
      'BikeMi — station at Largo Gemelli (outside Cattolica)',
    ],
    keyPlaces: [
      { name: "Basilica di Sant'Ambrogio", type: 'landmark', note: "One of Italy's oldest and most beautiful churches (379 AD) — free to enter, transformative" },
      { name: "Mercato Coperto di Sant'Ambrogio", type: 'market', note: 'The real Milanese market — fresh pasta, aged cheeses, local butchers. Weekday mornings.' },
      { name: 'Parco delle Basiliche', type: 'park', note: 'Linear park connecting two ancient basilicas — perfect evening walk' },
      { name: 'Università Cattolica', type: 'landmark', note: 'Major university within a beautiful cloistered campus — inner courtyards are open to all' },
      { name: "Esselunga Sant'Ambrogio", type: 'market', note: 'Full-service supermarket — one of the best stocked in central Milan' },
      { name: "Osteria dell'Enoteca", type: 'restaurant', note: 'Traditional Milanese kitchen, long communal tables, loud families' },
    ],
    bestFor: ['Students valuing authenticity and history', 'Those wanting a calm base walking distance from Bocconi', 'Food lovers and daily market shoppers'],
    notFor: ['Nightlife seekers', 'People who want the trendiest address'],
    photoUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&w=900&q=75',
    distanceToUniversity: '15 min walk / 9 min by bike',
  },
  {
    id: 'isola',
    name: 'Isola',
    lat: 45.4863,
    lng: 9.1910,
    shortDescription: "Milan's coolest reinvention — a former working-class village next to the Bosco Verticale and the Biblioteca degli Alberi.",
    longDescription: `Isola (Italian for "island") got its name because the construction of the Milan–Como railway in the 19th century physically cut it off from the rest of the city. For over a century it was a tight-knit, working-class quartiere — people knew their neighbours, bought bread from the same baker, played bocce in the courtyard. Then, around 2014, the Bosco Verticale (Vertical Forest) went up on the southern edge: two residential towers designed by Stefano Boeri, covered in 900 trees and 20,000 plants. Suddenly everyone wanted to live here.

Today, Isola sits at the intersection of old and new Milan. Via Pollaiuolo still has the cobbler and the old-school alimentari where the owner is definitely not on Instagram; two streets over, a natural wine bar opened last month and there's a three-week wait for the best table on Thursday. The neighbourhood shares the Piazza Gae Aulenti and the Biblioteca degli Alberi (Library of Trees) — a spectacular 90,000 m² designed landscape with 500 trees arranged in botanical rings — with the Porta Nuova business district next door, the closest thing Milan has to a Midtown. The view of the UniCredit Tower from Via Borsieri at night is one of the great free spectacles of modern European urbanism.

The commute to Bocconi is 25–30 minutes on metro (M5 Isola → Garibaldi → change), but many residents cycle in under 25 minutes. Rents are higher than Navigli partly because of the Boeri effect, but you get more space for the money than in Brera, with the added bonus of genuine village community loyalty.`,
    avgRent: '€680–960',
    walkabilityScore: 8,
    vibe: 'Cutting-edge cool, village-community feel, architecturally extraordinary',
    populationProfile: 'Young professionals, architects, designers, journalists, expats, a few original old-timers',
    prosWithLowBudget: [
      "Biblioteca degli Alberi — one of Europe's most beautiful free public parks",
      'Some affordable alimentari and local bars still operating from the old neighbourhood',
      'Great street food along via Borsieri',
      'Saturday farmers market at Piazza Lagosta',
    ],
    prosWithHighBudget: [
      "Some of Milan's most exciting new restaurants (Trippa, Ligera)",
      'New-build apartments with rooftop terraces and modern fittings',
      'Garibaldi station: easy rail access for weekend travel',
      'Bosco Verticale and Piazza Gae Aulenti lifestyle on your doorstep',
    ],
    consWithLowBudget: [
      'One of the more expensive areas — prices still rising year on year',
      'Bocconi commute requires a metro change — 25–30 min',
    ],
    consWithHighBudget: [
      'Old building stock (in the historic island core) can be cold and poorly insulated in winter',
    ],
    distanceToBocconi: '28 min by metro (M5 Isola → Garibaldi → M2 south) · 24 min by bike',
    distanceToUniStatale: '20 min by metro (M5 → Garibaldi → walk)',
    distanceToPolitecnico: '18 min by metro (M5 → Garibaldi → M2 Leonardo)',
    distanceToCity: '15 min by metro (M5 → Garibaldi → M2 → Cadorna) · 30 min walk',
    transitOptions: [
      'M5 Isola — 3 min walk (lilac line, direct to Garibaldi and Centrale)',
      'M5 → Garibaldi FS — interchange to M2 green line south toward Bocconi area',
      'Garibaldi station — 8 min walk (suburban + regional rail)',
      'BikeMi — stations on via Borsieri and Piazza Gae Aulenti',
      'Tram 7 / Bus 90 — ring road connections',
    ],
    keyPlaces: [
      { name: 'Bosco Verticale', type: 'landmark', note: "Stefano Boeri's Vertical Forest towers — the defining image of modern Milan, visible from across the city" },
      { name: 'Biblioteca degli Alberi (BAM)', type: 'park', note: '90,000 m² designed park with 500 trees — one of the best public parks in Europe. Free always.' },
      { name: 'Piazza Gae Aulenti', type: 'landmark', note: "The modern plaza of Milan's financial district — sky-high UniCredit Tower, outdoor dining, striking at night" },
      { name: 'Trippa', type: 'restaurant', note: "One of Milan's most lauded modern trattorias — book weeks in advance, entirely worth it" },
      { name: 'Mercato Isola', type: 'market', note: 'Neighbourhood market at Piazza Lagosta, Saturday mornings — local produce, cheese, flowers' },
      { name: '10 Corso Como', type: 'shop', note: "Milan's legendary concept store, gallery, and café — 8 min walk from Isola along via Corso Como" },
      { name: 'Eataly Porta Nuova', type: 'market', note: 'Giant Italian food emporium at Piazza XXV Aprile — expensive but spectacular for a browsing afternoon' },
    ],
    bestFor: ['Design-minded people', 'Architecture and urbanism lovers', 'People who want village feel with cosmopolitan edge'],
    notFor: ['Budget-first students', 'Daily Bocconi commuters who hate metro changes'],
    photoUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&w=900&q=75',
    distanceToUniversity: '28 min by metro / 24 min by bike',
  },
  {
    id: 'citta-studi',
    name: 'Città Studi',
    lat: 45.4764,
    lng: 9.2331,
    shortDescription: 'The original student hub — most affordable in central Milan, with the Politecnico campus and a pure academic buzz.',
    longDescription: `Città Studi (literally "City of Studies") is exactly what its name promises: an entire neighbourhood designed around university life. The Politecnico di Milano's main Leonardo campus, the Università degli Studi di Milano's science faculties, and several research institutes all sit here, making it the densest concentration of students in the city. Viale Sarca and the streets between Piazza Leonardo da Vinci and Via Ponzio are lined with copy shops, cheap lunch bars, second-hand bookshops, and two-bed flats rented by the room to students who have optimised every decision for academia and value.

This is the most affordable centrally-located neighbourhood in Milan. Rents are consistently lower than anywhere west of Corso Buenos Aires because the area hasn't been gentrified — it's too functional, too practical for that. An Esselunga is within 10 minutes' walk, and there's a full market at Piazza Grandi. The vibe is entirely different from Navigli or Brera: expect to see students cycling with backpacks, group study sessions spilling out onto the piazzas, and restaurants that do a €9 fixed-price lunch because their entire clientele is on a student budget.

In summer, the neighbourhood's secret advantage is Idroscalo — a large artificial lake 25 minutes by bike used as Milan's outdoor swimming and sports destination. And in September during Salone del Mobile (design week), when all of creative Milan descends on the Politecnico campus and its surrounding streets for exhibitions and installations, Città Studi briefly becomes the coolest place in the city.`,
    avgRent: '€450–680',
    walkabilityScore: 7,
    vibe: 'Academic, practical, young, unpretentious, quietly international',
    populationProfile: 'Politecnico and Statale students, researchers, visiting academics — very international',
    prosWithLowBudget: [
      'Cheapest neighbourhood for central Milan — best price-per-m² on this list',
      'Huge shared apartments at competitive prices',
      'Fixed-price lunch menus from €8; countless budget options',
      'Full Esselunga supermarket and Piazza Grandi market nearby',
    ],
    prosWithHighBudget: [
      'Large fully renovated flats at below-market prices vs. western neighbourhoods',
      'Easy access to both Politecnico and Statale campuses',
      'Quiet streets behind campus for focused study conditions',
    ],
    consWithLowBudget: [
      'Bocconi commute is 30+ min (M2, often crowded at peak hours)',
      'Less character and nightlife than western neighbourhoods',
    ],
    consWithHighBudget: [
      'Not a prestigious or fashionable address',
      'Fewer upscale restaurants or cultural offerings',
    ],
    distanceToBocconi: '30 min by metro (M2 Piola → Centrale → M3) · 35 min by bike',
    distanceToUniStatale: '10 min by metro (M2 Piola → Loreto) · 18 min walk',
    distanceToPolitecnico: '5 min walk to Leonardo campus · 8 min by bike',
    distanceToCity: '20 min by metro (M2 Piola → Loreto → M1 → Duomo)',
    transitOptions: [
      'M2 Piola — 5 min walk (green line, direct to city centre)',
      'M2 Lambrate — 12 min walk (rail interchange here)',
      'Bus 93 — east–west connections across Milan',
      'BikeMi — multiple stations near Politecnico campus',
      'Lambrate FS — suburban rail to Centrale and beyond',
    ],
    keyPlaces: [
      { name: 'Politecnico di Milano (Leonardo campus)', type: 'landmark', note: "Italy's top engineering and design university — the academic heart of the neighbourhood" },
      { name: 'Piazza Leonardo da Vinci', type: 'landmark', note: 'Central campus square — green, spacious, great for outdoor study or lunch' },
      { name: 'Esselunga Lambrate', type: 'market', note: 'Full-service supermarket — affordable and well stocked' },
      { name: 'Bar Piola', type: 'cafe', note: 'Iconic breakfast bar for engineering students since the 1970s' },
      { name: 'Via Golgi kebab strip', type: 'restaurant', note: 'Legendary late-night eating strip — €4 kebab, open until 3 am' },
      { name: 'Idroscalo (25 min by bike)', type: 'park', note: "Milan's outdoor swimming lake in summer — watersports, beach areas, free entry sections" },
    ],
    bestFor: ['Politecnico and Statale students', 'Anyone prioritising space and budget over vibe', 'Researchers and visiting academics'],
    notFor: ['Bocconi students commuting every day', 'People wanting nightlife or cultural buzz on their doorstep'],
    photoUrl: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&w=900&q=75',
    distanceToUniversity: '30 min by metro (to Bocconi)',
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

  if (config.universities[universityName]) {
    return config.universities[universityName]
  }

  const normalizedName = universityName.toLowerCase()
  for (const [key, location] of Object.entries(config.universities)) {
    if (key.toLowerCase().includes(normalizedName) || normalizedName.includes(key.toLowerCase())) {
      return location
    }
  }

  const firstKey = Object.keys(config.universities)[0]
  if (firstKey) return config.universities[firstKey]

  return null
}

export function recommendNeighborhoods(
  neighborhoods: Neighborhood[],
  maxBudget: number,
  preferWalkability: boolean
): Neighborhood[] {
  return neighborhoods
    .filter((n) => {
      const parts = n.avgRent.replace(/[€,]/g, '').split(/[-\u2013]/)
      const maxRentPrice = parseInt(parts[1] || parts[0] || '0')
      return maxRentPrice <= maxBudget
    })
    .sort((a, b) => {
      if (preferWalkability) {
        return b.walkabilityScore - a.walkabilityScore
      }
      const aRent = parseInt(a.avgRent.replace(/[€,]/g, '').split(/[-\u2013]/)[0] || '0')
      const bRent = parseInt(b.avgRent.replace(/[€,]/g, '').split(/[-\u2013]/)[0] || '0')
      return aRent - bRent
    })
}
