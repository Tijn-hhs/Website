// ─── Codice Fiscale (Italian Tax Code) calculator ────────────────────────────
// Based on the official DM 23 December 1976 algorithm.
// This produces the same code issued by the Agenzia delle Entrate — but the
// calculated code is NOT an official document until registered in person.

// Month encoding (January=1 → 'A', …, December=12 → 'T')
const MONTH_CODES = 'ABCDEHLMPRST'

// Odd-position conversion table for the check digit
const ODD_TABLE: Record<string, number> = {
  '0': 1,  '1': 0,  '2': 5,  '3': 7,  '4': 9,  '5': 13, '6': 15,
  '7': 17, '8': 19, '9': 21,
  A: 1,  B: 0,  C: 5,  D: 7,  E: 9,  F: 13, G: 15, H: 17,
  I: 19, J: 21, K: 2,  L: 4,  M: 18, N: 20, O: 11, P: 3,
  Q: 6,  R: 8,  S: 12, T: 14, U: 16, V: 10, W: 22, X: 25,
  Y: 24, Z: 23,
}

function normalise(s: string): string {
  return s
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^A-Z]/g, '')
}

function encodeConsonants(s: string): string {
  return s.replace(/[AEIOU]/g, '')
}
function encodeVowels(s: string): string {
  return s.replace(/[^AEIOU]/g, '')
}

function encodeSurname(surname: string): string {
  const s = normalise(surname)
  const code = encodeConsonants(s) + encodeVowels(s)
  return (code + 'XXX').slice(0, 3)
}

function encodeName(name: string): string {
  const s = normalise(name)
  const consonants = encodeConsonants(s)
  if (consonants.length >= 4) {
    // Special rule: use 1st, 3rd, 4th consonant
    return consonants[0] + consonants[2] + consonants[3]
  }
  const code = consonants + encodeVowels(s)
  return (code + 'XXX').slice(0, 3)
}

function encodeDate(dob: Date, isFemale: boolean): string {
  const year = String(dob.getFullYear()).slice(-2)
  const month = MONTH_CODES[dob.getMonth()]
  const day = String(isFemale ? dob.getDate() + 40 : dob.getDate()).padStart(2, '0')
  return year + month + day
}

function computeCheckDigit(partial: string): string {
  // partial is the first 15 characters of the CF
  let sum = 0
  for (let i = 0; i < 15; i++) {
    const ch = partial[i]
    if ((i + 1) % 2 === 1) {
      // Odd position (1-indexed)
      sum += ODD_TABLE[ch] ?? 0
    } else {
      // Even position: A=0, B=1, …, Z=25 / 0=0, 1=1, …, 9=9
      const v = isNaN(Number(ch)) ? ch.charCodeAt(0) - 65 : Number(ch)
      sum += v
    }
  }
  return String.fromCharCode(65 + (sum % 26))
}

export interface CFInput {
  firstName: string
  lastName: string
  dateOfBirth: Date
  isFemale: boolean
  belfioreCode: string // 4-char Belfiore code, e.g. "F205" for Milan
}

export interface CFResult {
  code: string
  parts: {
    surname: string
    name: string
    year: string
    month: string
    day: string
    placeCode: string
    checkDigit: string
  }
}

export function calculateCodiceFiscale(input: CFInput): CFResult {
  const surname = encodeSurname(input.lastName)
  const name = encodeName(input.firstName)
  const dateStr = encodeDate(input.dateOfBirth, input.isFemale)
  const year = dateStr.slice(0, 2)
  const month = dateStr[2]
  const day = dateStr.slice(3, 5)
  const place = input.belfioreCode.toUpperCase().padEnd(4, 'X').slice(0, 4)

  const partial = surname + name + year + month + day + place
  const check = computeCheckDigit(partial)

  return {
    code: partial + check,
    parts: { surname, name, year, month, day, placeCode: place, checkDigit: check },
  }
}

// ─── Country / Comune Belfiore codes ─────────────────────────────────────────
// Official Belfiore codes for foreign countries (prefix Z) and key Italian cities.
// Source: Agenzia delle Entrate official tables.

export interface BelfioreEntry {
  label: string
  code: string
  region?: string // continent / Italian region for grouping
}

export const COUNTRY_CODES: BelfioreEntry[] = [
  // ── Europe ──
  { label: 'Albania',                          code: 'Z100', region: 'Europe' },
  { label: 'Andorra',                          code: 'Z101', region: 'Europe' },
  { label: 'Armenia',                          code: 'Z137', region: 'Europe' },
  { label: 'Austria',                          code: 'Z102', region: 'Europe' },
  { label: 'Azerbaijan',                       code: 'Z141', region: 'Europe' },
  { label: 'Belarus',                          code: 'Z139', region: 'Europe' },
  { label: 'Belgium',                          code: 'Z103', region: 'Europe' },
  { label: 'Bosnia and Herzegovina',           code: 'Z153', region: 'Europe' },
  { label: 'Bulgaria',                         code: 'Z104', region: 'Europe' },
  { label: 'Channel Islands',                  code: 'Z124', region: 'Europe' },
  { label: 'Croatia',                          code: 'Z149', region: 'Europe' },
  { label: 'Czech Republic',                   code: 'Z156', region: 'Europe' },
  { label: 'Czechoslovakia',                   code: 'Z105', region: 'Europe' },
  { label: 'Denmark',                          code: 'Z107', region: 'Europe' },
  { label: 'East Germany',                     code: 'Z111', region: 'Europe' },
  { label: 'Estonia',                          code: 'Z144', region: 'Europe' },
  { label: 'Faroe Islands',                    code: 'Z108', region: 'Europe' },
  { label: 'Finland',                          code: 'Z109', region: 'Europe' },
  { label: 'France',                           code: 'Z110', region: 'Europe' },
  { label: 'Georgia',                          code: 'Z136', region: 'Europe' },
  { label: 'Germany (West)',                   code: 'Z112', region: 'Europe' },
  { label: 'Gibraltar',                        code: 'Z113', region: 'Europe' },
  { label: 'Greece',                           code: 'Z115', region: 'Europe' },
  { label: 'Hungary',                          code: 'Z134', region: 'Europe' },
  { label: 'Iceland',                          code: 'Z117', region: 'Europe' },
  { label: 'Ireland',                          code: 'Z116', region: 'Europe' },
  { label: 'Isle of Man',                      code: 'Z122', region: 'Europe' },
  { label: 'Latvia',                           code: 'Z145', region: 'Europe' },
  { label: 'Liechtenstein',                    code: 'Z119', region: 'Europe' },
  { label: 'Lithuania',                        code: 'Z146', region: 'Europe' },
  { label: 'Luxembourg',                       code: 'Z120', region: 'Europe' },
  { label: 'Malta',                            code: 'Z121', region: 'Europe' },
  { label: 'Moldova',                          code: 'Z140', region: 'Europe' },
  { label: 'Monaco',                           code: 'Z123', region: 'Europe' },
  { label: 'Netherlands',                      code: 'Z126', region: 'Europe' },
  { label: 'North Macedonia',                  code: 'Z148', region: 'Europe' },
  { label: 'Norway',                           code: 'Z125', region: 'Europe' },
  { label: 'Poland',                           code: 'Z127', region: 'Europe' },
  { label: 'Portugal',                         code: 'Z128', region: 'Europe' },
  { label: 'Romania',                          code: 'Z129', region: 'Europe' },
  { label: 'Russia',                           code: 'Z154', region: 'Europe' },
  { label: 'San Marino',                       code: 'Z130', region: 'Europe' },
  { label: 'Slovakia',                         code: 'Z155', region: 'Europe' },
  { label: 'Slovenia',                         code: 'Z150', region: 'Europe' },
  { label: 'Spain',                            code: 'Z131', region: 'Europe' },
  { label: 'Sweden',                           code: 'Z132', region: 'Europe' },
  { label: 'Switzerland',                      code: 'Z133', region: 'Europe' },
  { label: 'Turkey',                           code: 'Z243', region: 'Europe' },
  { label: 'Ukraine',                          code: 'Z138', region: 'Europe' },
  { label: 'United Kingdom',                   code: 'Z114', region: 'Europe' },
  { label: 'USSR',                             code: 'Z135', region: 'Europe' },
  { label: 'Vatican City',                     code: 'Z106', region: 'Europe' },
  { label: 'Yugoslavia',                       code: 'Z118', region: 'Europe' },
  // ── Asia & Middle East ──
  { label: 'Afghanistan',                      code: 'Z200', region: 'Asia' },
  { label: 'Bahrain',                          code: 'Z204', region: 'Asia' },
  { label: 'Bangladesh',                       code: 'Z249', region: 'Asia' },
  { label: 'Bhutan',                           code: 'Z205', region: 'Asia' },
  { label: 'Brunei',                           code: 'Z207', region: 'Asia' },
  { label: 'Cambodia',                         code: 'Z208', region: 'Asia' },
  { label: 'China',                            code: 'Z210', region: 'Asia' },
  { label: 'Cyprus',                           code: 'Z211', region: 'Asia' },
  { label: 'Hong Kong',                        code: 'Z221', region: 'Asia' },
  { label: 'India',                            code: 'Z222', region: 'Asia' },
  { label: 'Indonesia',                        code: 'Z223', region: 'Asia' },
  { label: 'Iran',                             code: 'Z224', region: 'Asia' },
  { label: 'Iraq',                             code: 'Z225', region: 'Asia' },
  { label: 'Israel',                           code: 'Z226', region: 'Asia' },
  { label: 'Japan',                            code: 'Z219', region: 'Asia' },
  { label: 'Jordan',                           code: 'Z220', region: 'Asia' },
  { label: 'Kazakhstan',                       code: 'Z255', region: 'Asia' },
  { label: 'Kuwait',                           code: 'Z227', region: 'Asia' },
  { label: 'Kyrgyzstan',                       code: 'Z256', region: 'Asia' },
  { label: 'Laos',                             code: 'Z228', region: 'Asia' },
  { label: 'Lebanon',                          code: 'Z229', region: 'Asia' },
  { label: 'Malaysia',                         code: 'Z230', region: 'Asia' },
  { label: 'Maldives',                         code: 'Z232', region: 'Asia' },
  { label: 'Mongolia',                         code: 'Z233', region: 'Asia' },
  { label: 'Myanmar (Burma)',                  code: 'Z206', region: 'Asia' },
  { label: 'Nepal',                            code: 'Z234', region: 'Asia' },
  { label: 'North Korea',                      code: 'Z214', region: 'Asia' },
  { label: 'Oman',                             code: 'Z235', region: 'Asia' },
  { label: 'Pakistan',                         code: 'Z236', region: 'Asia' },
  { label: 'Philippines',                      code: 'Z216', region: 'Asia' },
  { label: 'Qatar',                            code: 'Z237', region: 'Asia' },
  { label: 'Saudi Arabia',                     code: 'Z203', region: 'Asia' },
  { label: 'Singapore',                        code: 'Z248', region: 'Asia' },
  { label: 'South Korea',                      code: 'Z213', region: 'Asia' },
  { label: 'Sri Lanka',                        code: 'Z209', region: 'Asia' },
  { label: 'Syria',                            code: 'Z240', region: 'Asia' },
  { label: 'Taiwan',                           code: 'Z217', region: 'Asia' },
  { label: 'Tajikistan',                       code: 'Z257', region: 'Asia' },
  { label: 'Thailand',                         code: 'Z241', region: 'Asia' },
  { label: 'Turkmenistan',                     code: 'Z258', region: 'Asia' },
  { label: 'UAE',                              code: 'Z215', region: 'Asia' },
  { label: 'Uzbekistan',                       code: 'Z259', region: 'Asia' },
  { label: 'Vietnam',                          code: 'Z251', region: 'Asia' },
  { label: 'Yemen',                            code: 'Z246', region: 'Asia' },
  // ── Africa ──
  { label: 'Algeria',                          code: 'Z301', region: 'Africa' },
  { label: 'Angola',                           code: 'Z302', region: 'Africa' },
  { label: 'Benin',                            code: 'Z314', region: 'Africa' },
  { label: 'Botswana',                         code: 'Z358', region: 'Africa' },
  { label: 'Burundi',                          code: 'Z305', region: 'Africa' },
  { label: 'Cameroon',                         code: 'Z306', region: 'Africa' },
  { label: 'Cape Verde',                       code: 'Z307', region: 'Africa' },
  { label: 'Central African Republic',         code: 'Z308', region: 'Africa' },
  { label: 'Chad',                             code: 'Z309', region: 'Africa' },
  { label: 'Comoros',                          code: 'Z310', region: 'Africa' },
  { label: 'Democratic Republic of the Congo', code: 'Z312', region: 'Africa' },
  { label: 'Djibouti',                         code: 'Z361', region: 'Africa' },
  { label: 'Egypt',                            code: 'Z336', region: 'Africa' },
  { label: 'Equatorial Guinea',                code: 'Z321', region: 'Africa' },
  { label: 'Eritrea',                          code: 'Z368', region: 'Africa' },
  { label: 'Eswatini (Swaziland)',             code: 'Z349', region: 'Africa' },
  { label: 'Ethiopia',                         code: 'Z315', region: 'Africa' },
  { label: 'Gabon',                            code: 'Z316', region: 'Africa' },
  { label: 'Gambia',                           code: 'Z317', region: 'Africa' },
  { label: 'Ghana',                            code: 'Z318', region: 'Africa' },
  { label: 'Guinea',                           code: 'Z319', region: 'Africa' },
  { label: 'Guinea-Bissau',                    code: 'Z320', region: 'Africa' },
  { label: 'Ivory Coast',                      code: 'Z313', region: 'Africa' },
  { label: 'Kenya',                            code: 'Z322', region: 'Africa' },
  { label: 'Lesotho',                          code: 'Z359', region: 'Africa' },
  { label: 'Liberia',                          code: 'Z325', region: 'Africa' },
  { label: 'Libya',                            code: 'Z326', region: 'Africa' },
  { label: 'Madagascar',                       code: 'Z327', region: 'Africa' },
  { label: 'Malawi',                           code: 'Z328', region: 'Africa' },
  { label: 'Mali',                             code: 'Z329', region: 'Africa' },
  { label: 'Mauritania',                       code: 'Z331', region: 'Africa' },
  { label: 'Mauritius',                        code: 'Z332', region: 'Africa' },
  { label: 'Morocco',                          code: 'Z330', region: 'Africa' },
  { label: 'Mozambique',                       code: 'Z333', region: 'Africa' },
  { label: 'Namibia',                          code: 'Z300', region: 'Africa' },
  { label: 'Niger',                            code: 'Z334', region: 'Africa' },
  { label: 'Nigeria',                          code: 'Z335', region: 'Africa' },
  { label: 'Republic of the Congo',            code: 'Z311', region: 'Africa' },
  { label: 'Rwanda',                           code: 'Z338', region: 'Africa' },
  { label: 'Senegal',                          code: 'Z343', region: 'Africa' },
  { label: 'Sierra Leone',                     code: 'Z344', region: 'Africa' },
  { label: 'Somalia',                          code: 'Z345', region: 'Africa' },
  { label: 'South Africa',                     code: 'Z347', region: 'Africa' },
  { label: 'Sudan',                            code: 'Z348', region: 'Africa' },
  { label: 'Tanzania',                         code: 'Z357', region: 'Africa' },
  { label: 'Togo',                             code: 'Z351', region: 'Africa' },
  { label: 'Tunisia',                          code: 'Z352', region: 'Africa' },
  { label: 'Uganda',                           code: 'Z353', region: 'Africa' },
  { label: 'Zambia',                           code: 'Z355', region: 'Africa' },
  { label: 'Zimbabwe',                         code: 'Z337', region: 'Africa' },
  // ── North America & Caribbean ──
  { label: 'Antigua and Barbuda',              code: 'Z532', region: 'Americas' },
  { label: 'Bahamas',                          code: 'Z502', region: 'Americas' },
  { label: 'Barbados',                         code: 'Z522', region: 'Americas' },
  { label: 'Belize',                           code: 'Z512', region: 'Americas' },
  { label: 'Bermuda',                          code: 'Z400', region: 'Americas' },
  { label: 'Canada',                           code: 'Z401', region: 'Americas' },
  { label: 'Costa Rica',                       code: 'Z503', region: 'Americas' },
  { label: 'Cuba',                             code: 'Z504', region: 'Americas' },
  { label: 'Dominican Republic',               code: 'Z505', region: 'Americas' },
  { label: 'El Salvador',                      code: 'Z506', region: 'Americas' },
  { label: 'Greenland',                        code: 'Z402', region: 'Americas' },
  { label: 'Grenada',                          code: 'Z524', region: 'Americas' },
  { label: 'Guatemala',                        code: 'Z509', region: 'Americas' },
  { label: 'Haiti',                            code: 'Z510', region: 'Americas' },
  { label: 'Honduras',                         code: 'Z511', region: 'Americas' },
  { label: 'Jamaica',                          code: 'Z507', region: 'Americas' },
  { label: 'Mexico',                           code: 'Z514', region: 'Americas' },
  { label: 'Nicaragua',                        code: 'Z515', region: 'Americas' },
  { label: 'Panama',                           code: 'Z516', region: 'Americas' },
  { label: 'Puerto Rico',                      code: 'Z518', region: 'Americas' },
  { label: 'Saint Kitts and Nevis',            code: 'Z533', region: 'Americas' },
  { label: 'Saint Lucia',                      code: 'Z527', region: 'Americas' },
  { label: 'Saint Vincent and the Grenadines', code: 'Z528', region: 'Americas' },
  { label: 'United States',                    code: 'Z404', region: 'Americas' },
  // ── South America ──
  { label: 'Argentina',                        code: 'Z600', region: 'Americas' },
  { label: 'Bolivia',                          code: 'Z601', region: 'Americas' },
  { label: 'Brazil',                           code: 'Z602', region: 'Americas' },
  { label: 'Chile',                            code: 'Z603', region: 'Americas' },
  { label: 'Colombia',                         code: 'Z604', region: 'Americas' },
  { label: 'Ecuador',                          code: 'Z605', region: 'Americas' },
  { label: 'Paraguay',                         code: 'Z610', region: 'Americas' },
  { label: 'Peru',                             code: 'Z611', region: 'Americas' },
  { label: 'Suriname',                         code: 'Z608', region: 'Americas' },
  { label: 'Trinidad and Tobago',              code: 'Z612', region: 'Americas' },
  { label: 'Uruguay',                          code: 'Z613', region: 'Americas' },
  { label: 'Venezuela',                        code: 'Z614', region: 'Americas' },
  // ── Oceania ──
  { label: 'Australia',                        code: 'Z700', region: 'Oceania' },
  { label: 'Federated States of Micronesia',   code: 'Z735', region: 'Oceania' },
  { label: 'Fiji',                             code: 'Z704', region: 'Oceania' },
  { label: 'Guam',                             code: 'Z706', region: 'Oceania' },
  { label: 'Kiribati',                         code: 'Z731', region: 'Oceania' },
  { label: 'Nauru',                            code: 'Z713', region: 'Oceania' },
  { label: 'New Caledonia',                    code: 'Z716', region: 'Oceania' },
  { label: 'New Zealand',                      code: 'Z719', region: 'Oceania' },
  { label: 'Palau',                            code: 'Z734', region: 'Oceania' },
  { label: 'Papua New Guinea',                 code: 'Z718', region: 'Oceania' },
  { label: 'Samoa',                            code: 'Z726', region: 'Oceania' },
  { label: 'Solomon Islands',                  code: 'Z724', region: 'Oceania' },
  { label: 'Tonga',                            code: 'Z728', region: 'Oceania' },
  { label: 'Tuvalu',                           code: 'Z732', region: 'Oceania' },
  { label: 'Vanuatu',                          code: 'Z733', region: 'Oceania' },
]

// Key Italian cities / comuni with their Belfiore codes
export const ITALIAN_COMUNI: BelfioreEntry[] = [
  { label: 'Milano',      code: 'F205', region: 'Lombardia' },
  { label: 'Roma',        code: 'H501', region: 'Lazio' },
  { label: 'Napoli',      code: 'F839', region: 'Campania' },
  { label: 'Torino',      code: 'L219', region: 'Piemonte' },
  { label: 'Bologna',     code: 'A944', region: 'Emilia-Romagna' },
  { label: 'Firenze',     code: 'D612', region: 'Toscana' },
  { label: 'Venezia',     code: 'L736', region: 'Veneto' },
  { label: 'Palermo',     code: 'G273', region: 'Sicilia' },
  { label: 'Genova',      code: 'D969', region: 'Liguria' },
  { label: 'Bari',        code: 'A662', region: 'Puglia' },
  { label: 'Catania',     code: 'C351', region: 'Sicilia' },
  { label: 'Verona',      code: 'L781', region: 'Veneto' },
  { label: 'Messina',     code: 'F158', region: 'Sicilia' },
  { label: 'Padova',      code: 'G224', region: 'Veneto' },
  { label: 'Trieste',     code: 'L424', region: 'Friuli-VG' },
  { label: 'Brescia',     code: 'B157', region: 'Lombardia' },
  { label: 'Parma',       code: 'G337', region: 'Emilia-Romagna' },
  { label: 'Modena',      code: 'F257', region: 'Emilia-Romagna' },
  { label: 'Reggio Calabria', code: 'H224', region: 'Calabria' },
  { label: 'Reggio Emilia',   code: 'H223', region: 'Emilia-Romagna' },
  { label: 'Perugia',     code: 'G478', region: 'Umbria' },
  { label: 'Cagliari',    code: 'B354', region: 'Sardegna' },
  { label: 'Ravenna',     code: 'H199', region: 'Emilia-Romagna' },
  { label: 'Ferrara',     code: 'D548', region: 'Emilia-Romagna' },
  { label: 'Rimini',      code: 'H294', region: 'Emilia-Romagna' },
  { label: 'Salerno',     code: 'H703', region: 'Campania' },
  { label: 'Bergamo',     code: 'A794', region: 'Lombardia' },
  { label: 'Trento',      code: 'L378', region: 'Trentino-AA' },
  { label: 'Siena',       code: 'I726', region: 'Toscana' },
  { label: 'Pisa',        code: 'G702', region: 'Toscana' },
]
