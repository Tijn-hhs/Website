/**
 * University-specific application data.
 * To add a new university, add a new entry to the `universities` record.
 * The key should match the value stored in the user's `destinationUniversity` field.
 */

export type TestRequirement = {
  name: string
  type: 'required' | 'optional' | 'alternative'
  minScore?: string
  notes: string
  link?: string
}

export type LanguageRequirement = {
  test: string
  minScore: string
  notes?: string
}

export type ApplicationRound = {
  round: string
  deadline: string // ISO date string
  resultsBy: string
  notes?: string
}

export type DocTips = {
  heading: string
  points: string[]
}

export type DocumentItem = {
  label: string
  required: boolean
  notes?: string
  tips?: DocTips
}

export type Section = {
  id: string
  title: string
  emoji?: string
}

export type UniversityConfig = {
  id: string
  name: string
  shortName: string
  city: string
  country: string
  applyUrl: string
  programLevels: ('bachelor' | 'master' | 'phd')[]
  overview: string
  tuitionRange: { bachelor?: string; master?: string }
  testRequirements: {
    bachelor: TestRequirement[]
    master: TestRequirement[]
  }
  languageRequirements: {
    bachelor: LanguageRequirement[]
    master: LanguageRequirement[]
    notes: string
  }
  applicationRounds: {
    bachelor: ApplicationRound[]
    master: ApplicationRound[]
  }
  documents: {
    bachelor: DocumentItem[]
    master: DocumentItem[]
  }
  selectionCriteria: {
    bachelor: string[]
    master: string[]
  }
  tips: string[]
  keyLinks: { label: string; url: string }[]
}

export const universities: Record<string, UniversityConfig> = {
  bocconi: {
    id: 'bocconi',
    name: 'Università Bocconi',
    shortName: 'Bocconi',
    city: 'Milan',
    country: 'Italy',
    applyUrl: 'https://apply.unibocconi.it',
    programLevels: ['bachelor', 'master', 'phd'],
    overview:
      'Bocconi is one of Europe\'s top business and social sciences universities, based in Milan. It offers Bachelor of Science, Master of Science, and PhD programs in economics, management, finance, law, and data science. Admission is competitive and merit-based with a structured online selection test.',
    tuitionRange: {
      bachelor: '~€17,000/year (modulated by family income)',
      master: '~€18,500/year (modulated by family income)',
    },
    testRequirements: {
      bachelor: [
        {
          name: 'Bocconi Online Test (Undergraduate)',
          type: 'required',
          notes:
            'A proprietary online test assessing logical-mathematical reasoning and verbal comprehension. Taken at home via a proctored platform after submitting your application. No specific preparation material — it tests raw aptitude.',
          link: 'https://www.unibocconi.it/wps/wcm/connect/bocconi/sitopubblico_en/navigation%20tree/home/programs/bachelor%20of%20science/application%20and%20admission/bachelor%20programs%20a.y.%202024-25/timeline%20and%20selection%20process/info%20online%20test',
        },
      ],
      master: [
        {
          name: 'Bocconi Online Test (Graduate)',
          type: 'required',
          notes:
            'A proprietary online adaptive test covering quantitative reasoning, verbal comprehension, and data interpretation. Taken at home after submitting your application. Results are factored into the overall selection score.',
          link: 'https://www.unibocconi.it/wps/wcm/connect/bocconi/sitopubblico_en/navigation%20tree/home/programs/master%20of%20science/application%20and%20admission/international%20applicants/timeline%20and%20selection%20process/info%20online%20test%20b01',
        },
        {
          name: 'GMAT',
          type: 'alternative',
          minScore: '650+',
          notes:
            'Accepted as an alternative or supplement to the Bocconi test for MSc programs. A strong GMAT score (especially 700+) can strengthen your application considerably. Submit via the official GMAT portal to Bocconi.',
          link: 'https://www.mba.com/exams/gmat-exam',
        },
        {
          name: 'GRE General',
          type: 'alternative',
          minScore: 'Quant 160+',
          notes:
            'Accepted for some MSc programs as an alternative to the Bocconi test, especially for more quantitative programs. Check the specific program page for eligibility.',
          link: 'https://www.ets.org/gre',
        },
      ],
    },
    languageRequirements: {
      bachelor: [
        {
          test: 'IELTS Academic',
          minScore: '6.5 overall (no band below 5.5)',
          notes: 'Must be submitted at enrollment, not at application stage.',
        },
        {
          test: 'TOEFL iBT',
          minScore: '90 overall',
          notes: 'Home edition accepted. Must be submitted at enrollment.',
        },
        {
          test: 'Cambridge C1 Advanced (CAE)',
          minScore: 'Grade C or above',
          notes: 'Accepted as equivalent to IELTS 6.5.',
        },
      ],
      master: [
        {
          test: 'IELTS Academic',
          minScore: '7.0 overall (no band below 6.0)',
          notes: 'Higher threshold than Bachelor. Must be submitted at enrollment, not application.',
        },
        {
          test: 'TOEFL iBT',
          minScore: '100 overall',
          notes: 'Home edition accepted. Must be submitted at enrollment.',
        },
        {
          test: 'Cambridge C1/C2',
          minScore: 'C1 Advanced: Grade B or above / C2 Proficiency: Grade C or above',
          notes: 'Accepted as alternative to IELTS/TOEFL.',
        },
      ],
      notes:
        'Language proof is NOT required to submit the application — only at enrollment after admission. Native English speakers or those who completed their prior degree in English may be exempt. Check the specific program\'s requirements as thresholds vary.',
    },
    applicationRounds: {
      bachelor: [
        {
          round: 'Round 1',
          deadline: '2025-01-10',
          resultsBy: '2025-02-07',
          notes: 'Earliest round — best for scholarship consideration',
        },
        {
          round: 'Round 2',
          deadline: '2025-02-28',
          resultsBy: '2025-04-04',
        },
        {
          round: 'Round 3',
          deadline: '2025-04-11',
          resultsBy: '2025-05-09',
        },
        {
          round: 'Round 4',
          deadline: '2025-05-30',
          resultsBy: '2025-06-27',
          notes: 'Subject to places remaining',
        },
      ],
      master: [
        {
          round: 'Round 1',
          deadline: '2024-10-25',
          resultsBy: '2024-12-06',
          notes: 'Earliest round — highest scholarship priority',
        },
        {
          round: 'Round 2',
          deadline: '2025-01-10',
          resultsBy: '2025-02-21',
        },
        {
          round: 'Round 3',
          deadline: '2025-02-28',
          resultsBy: '2025-04-11',
        },
        {
          round: 'Round 4',
          deadline: '2025-04-11',
          resultsBy: '2025-05-16',
          notes: 'Subject to places remaining',
        },
      ],
    },
    documents: {
      bachelor: [
        { label: 'Valid passport or national ID', required: true },
        { label: 'Secondary school transcripts (official)', required: true, notes: 'Must show grades from all years' },
        { label: 'Secondary school diploma (if already obtained)', required: false, notes: 'Required at enrollment if admitted' },
        { label: 'Certified English translation of transcripts (if not in English/Italian)', required: true },
        {
          label: 'Motivation letter / Personal statement',
          required: true,
          notes: 'Uploaded during online application',
          tips: {
            heading: 'Writing a strong Bocconi motivation letter',
            points: [
              'Keep it to 1 page (≈500 words). Bocconi readers review hundreds — be concise.',
              'Open with a specific moment or experience that sparked your interest in the field, not a generic statement like "I have always been passionate about...".',
              'Connect your past achievements directly to the specific BSc program you chose — mention its name.',
              'Show you know Bocconi: reference a professor, course, or research centre that excites you.',
              'Close with a clear, forward-looking sentence about what you will do after graduating — it signals maturity.',
              'Avoid clichés: "unique opportunity", "prestigious institution", "lifelong dream" — these weaken your letter.',
              'Proofread in English twice and ask someone else to read it for clarity before submitting.',
            ],
          },
        },
        {
          label: 'CV / Resumé',
          required: false,
          notes: 'Recommended — highlights extracurriculars and achievements',
          tips: {
            heading: 'CV tips for Bocconi BSc applicants',
            points: [
              'Keep it to 1 page. You are applying at high-school level — a second page signals poor editing.',
              'List education first, then awards/competitions, then extracurriculars, then any work experience.',
              'Highlight academic excellence: rankings, prizes, olympiads, or any top-percentile results.',
              'Include extracurriculars that show leadership, initiative, or intellectual curiosity — not just memberships.',
              'Use a clean, single-column layout with consistent fonts. Europass format is accepted but not required at BSc level.',
              'Write all dates in month-year format and list items in reverse chronological order.',
            ],
          },
        },
        { label: 'Proof of English language proficiency', required: false, notes: 'Required at enrollment, not at application stage' },
        { label: 'Passport-size photo', required: true },
      ],
      master: [
        { label: 'Valid passport or national ID', required: true },
        { label: 'Bachelor degree certificate', required: false, notes: 'Required by enrollment — ongoing degree accepted at application' },
        { label: 'University transcripts (official)', required: true, notes: 'All years of your undergraduate degree' },
        { label: 'Certified English translation of documents (if not in English/Italian)', required: true },
        {
          label: 'Motivation letter / Personal statement',
          required: true,
          notes: 'Program-specific — tailor it carefully',
          tips: {
            heading: 'Writing a strong Bocconi MSc motivation letter',
            points: [
              'Aim for 600–800 words maximum. Every sentence must earn its place.',
              'Personalise to the exact program name. Do not reuse the same letter across programs.',
              'Structure: (1) Why this field → (2) Your relevant experience → (3) Why Bocconi specifically → (4) Post-graduation goals.',
              'Reference something specific about Bocconi: a professor\'s research, a course, a lab, or a partnership that aligns with your goals.',
              'Quantify your achievements where possible: "Led a team of 8", "Top 5% of cohort", "Managed €15k budget".',
              'The selection committee looks for coherence — your past, your current choice, and your future should tell one consistent story.',
              'Avoid repeating your CV. The letter should explain what is not on paper.',
              'Have it reviewed by a native English speaker or use a professional editing service.',
            ],
          },
        },
        {
          label: 'CV in EU/Europass format',
          required: true,
          tips: {
            heading: 'CV tips for Bocconi MSc applicants',
            points: [
              'Use the Europass format — available free at europass.europa.eu. Bocconi explicitly requests it.',
              'Maximum 2 pages. Be strict: cut anything older than 5 years unless it is exceptional.',
              'List in reverse chronological order: Education → Work Experience → Projects → Skills → Languages.',
              'For each role or project, write 1–3 bullet points focusing on outcomes, not just tasks. Use action verbs: "Analysed", "Led", "Designed".',
              'Include your GPA/grade if it is in the top 25% of your cohort or above the local passing average.',
              'List language skills with CEFR levels (e.g., English: C1). Mention your English test score and date.',
              'Upload as a PDF with a clean filename: Firstname_Lastname_CV.pdf.',
            ],
          },
        },
        {
          label: 'Two academic or professional reference letters',
          required: false,
          notes: 'Strongly recommended — some programs require them',
          tips: {
            heading: 'Getting strong reference letters',
            points: [
              'Choose referees who know your academic work closely — a thesis supervisor or course professor is ideal.',
              'If using a professional reference, choose someone who can speak to skills relevant to the MSc program.',
              'Brief your referees: share your CV, your motivation letter draft, and which program you are applying to.',
              'Ask at least 3 weeks before the deadline — professors are busy.',
              'A strong letter is specific: it mentions your project, your approach, and your relative performance. A generic letter hurts rather than helps.',
              'Some Bocconi programs upload letters directly through the application portal; confirm the format in advance.',
            ],
          },
        },
        { label: 'GMAT/GRE score report (if submitting)', required: false, notes: 'Upload through the online application portal' },
        { label: 'Proof of English language proficiency', required: false, notes: 'Required at enrollment, not at application stage' },
        { label: 'Passport-size photo', required: true },
      ],
    },
    selectionCriteria: {
      bachelor: [
        'Academic performance in secondary school (GPA/grades)',
        'Bocconi online test score (logical-mathematical + verbal reasoning)',
        'Motivation letter quality and fit with the program',
        'Extracurricular activities, awards, and work experience',
      ],
      master: [
        'Academic performance in undergraduate degree (GPA/grades)',
        'Bocconi online test score or GMAT/GRE (quantitative + verbal)',
        'Relevance of undergraduate degree to chosen MSc program',
        'Motivation letter quality and career coherence',
        'Work experience and internships (relevant for some programs)',
        'English language proficiency',
      ],
    },
    tips: [
      'Apply in Round 1 or 2 — earlier rounds have more places and higher scholarship priority.',
      'The Bocconi test is adaptive and timed: practice logical reasoning under time pressure.',
      'Tailor your motivation letter to the specific program — generic letters are spotted immediately.',
      'A GMAT score above 700 for MSc significantly strengthens your application.',
      'English proof is only needed at enrollment — don\'t delay your application for it.',
      'For MSc: your undergraduate GPA is weighted heavily. Aim for the top of your cohort.',
      'Contact the International Office for any doubts — they are responsive and helpful.',
    ],
    keyLinks: [
      { label: 'Apply online', url: 'https://apply.unibocconi.it' },
      { label: 'MSc admissions info', url: 'https://www.unibocconi.it/en/applying-bocconi/master-science-and-ma-programs/application-and-admissions/admissions' },
      { label: 'BSc admissions info', url: 'https://www.unibocconi.it/en/applying-bocconi/bachelor-and-law-programs/application-and-admissions/admissions' },
      { label: 'Scholarships & financial aid', url: 'https://www.unibocconi.it/en/applying-bocconi/master-science-and-ma-programs/funding' },
      { label: 'Student housing (dorms)', url: 'https://www.unibocconi.it/en/applying-bocconi/master-science-and-ma-programs/housing' },
      { label: 'Contact the International Office', url: 'https://www.unibocconi.it/en/contact-us' },
    ],
  },
}

/** Returns the config for a university by its ID, or null if not found. */
export function getUniversityConfig(id: string): UniversityConfig | null {
  return universities[id] ?? null
}
