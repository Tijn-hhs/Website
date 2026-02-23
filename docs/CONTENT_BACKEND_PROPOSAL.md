# Content Backend Proposal — Multi-destination Architecture

> **Goal:** Move all hardcoded city/university/country content into a self-managed backend so the product can expand to new destinations without code changes.
> Last updated: February 23, 2026

---

## Table of Contents

1. [The Core Model](#the-core-model)
2. [DynamoDB Table Design](#dynamodb-table-design)
3. [How Country-Specific Dashboard Steps Work](#how-country-specific-dashboard-steps-work)
4. [Module Content Structure](#module-content-structure)
5. [Admin UI Concept](#admin-ui-concept)
6. [How the Frontend Adapts](#how-the-frontend-adapts)
7. [Migration Phases](#migration-phases)

---

## The Core Model

Everything in the product hangs off a three-tier destination hierarchy. A user picks their destination during onboarding and that single choice determines every module, every step, and every piece of content they see on the dashboard.

```
Country
  └── City
        └── University
```

---

## DynamoDB Table Design

### `leavs-content-countries`

One item per country. Defines which dashboard modules are available for that country and country-level metadata.

```json
{
  "PK": "italy",
  "name": "Italy",
  "currency": "EUR",
  "language": "Italian",
  "euMember": true,
  "visaRequired": { "eu": false, "nonEu": true },
  "dashboardModules": [
    "visa",
    "codice-fiscale",
    "immigration-registration",
    "healthcare",
    "banking",
    "housing",
    "cost-of-living"
  ]
}
```

### `leavs-content-cities`

One item per city. Stores cost configuration, Big Mac price, and any city-level module overrides.

```json
{
  "PK": "milan",
  "countryId": "italy",
  "name": "Milan",
  "costConfig": {
    "housing": { "min": 400, "max": 1200, "default": 700 },
    "food": { "min": 150, "max": 500, "default": 300 }
  },
  "bigMacPrice": 5.50,
  "dashboardModules": ["housing", "neighborhoods", "cost-of-living"]
}
```

### `leavs-content-universities`

One item per university. Stores all application data, deadlines, requirements. University-specific modules (e.g. a buddy system unique to Bocconi) are listed here too.

```json
{
  "PK": "bocconi",
  "cityId": "milan",
  "countryId": "italy",
  "name": "Università Bocconi",
  "shortName": "Bocconi",
  "tuitionRange": { "bachelor": "€0–€14,000/yr", "master": "€0–€14,000/yr" },
  "applicationRounds": [
    { "round": "Round 1", "deadline": "2025-10-25", "resultsBy": "2025-12-06", "notes": "Highest scholarship priority" }
  ],
  "documents": {
    "bachelor": [{ "label": "Valid passport", "required": true }],
    "master": [{ "label": "Valid passport", "required": true }]
  },
  "languageRequirements": {
    "master": [{ "test": "IELTS Academic", "minScore": "7.0 overall" }]
  },
  "lastVerified": "2026-02-23",
  "dashboardModules": ["university-application", "buddy-system"]
}
```

### `leavs-content-neighborhoods`

One item per neighborhood. Uses `distancesToUniversities` as a key-value map so any university can be referenced without hardcoded field names.

```json
{
  "PK": "milan#navigli",
  "cityId": "milan",
  "name": "Navigli",
  "lat": 45.4520,
  "lng": 9.1825,
  "avgRent": "€750–€950/mo",
  "walkabilityScore": 9,
  "vibe": "Young, artsy, canal-side nightlife",
  "distancesToUniversities": {
    "bocconi": "8 min walk",
    "politecnico": "20 min by metro",
    "statale": "22 min by metro"
  },
  "bestFor": ["Students who want nightlife nearby"],
  "notFor": ["Light sleepers"],
  "photoUrl": "https://..."
}
```

### `leavs-content-modules` ← the key new table

One item per module per country. This table is what makes the dashboard destination-aware. Adding a new country means adding new module entries here — no new `.tsx` files required.

```json
{
  "PK": "codice-fiscale",
  "countryId": "italy",
  "title": "Codice Fiscale",
  "route": "/codice-fiscale",
  "sidebarCategory": "admin",
  "sidebarOrder": 3,
  "isEuOnly": false,
  "isNonEuOnly": false,
  "content": {
    "intro": "The Codice Fiscale is your Italian tax identification number...",
    "steps": [
      { "title": "Where to apply", "body": "..." },
      { "title": "What to bring", "body": "..." }
    ],
    "tips": ["You can get it on the same day at the Agenzia delle Entrate..."],
    "links": [{ "label": "Agenzia delle Entrate", "url": "https://..." }]
  }
}
```

---

## How Country-Specific Dashboard Steps Work

Right now the sidebar and dashboard are hardcoded. Under the new model:

1. The user picks country + city + university during onboarding — saved to their profile as before.
2. On dashboard load, the frontend fetches the **module list** for their destination:
   - All modules where `countryId` matches their country
   - Plus modules where `cityId` matches their city
   - Plus modules where `universityId` matches their university
   - Deduped and sorted by `sidebarOrder`
3. The sidebar renders **only those modules**.

### Example: what two different users see

| Module | Milan / Bocconi student | Madrid / IE student |
|---|---|---|
| University Application | ✅ | ✅ |
| Codice Fiscale | ✅ Italy-only | ❌ |
| Immigration Registration | ✅ Italy-only | ❌ |
| NIE Number | ❌ | ✅ Spain-only |
| Banking | ✅ | ✅ |
| Housing | ✅ | ✅ |
| Neighborhood Map | ✅ Milan has data | ✅ if Madrid data exists |
| Cost of Living | ✅ | ✅ |
| Buddy System | ✅ Bocconi-specific | ❌ |

A student going to IE in Madrid sees the Spanish equivalents automatically, purely because their country is `spain`.

---

## Module Content Structure

Each module stores its page content as structured JSON inside the `content` field. The page component in React is a **generic layout shell** that renders from whatever the API returns.

```json
{
  "intro": "...",
  "steps": [
    { "title": "Step title", "body": "Step description", "tips": ["..."] }
  ],
  "tips": ["General tip 1", "General tip 2"],
  "links": [{ "label": "Link label", "url": "https://..." }],
  "documents": [{ "label": "Document name", "required": true, "notes": "..." }],
  "deadlines": [{ "label": "Event name", "date": "2025-11-01", "notes": "..." }]
}
```

If a module doesn't have content for a country yet, the page automatically shows a "coming soon" state — no crash, no blank page.

---

## Admin UI Concept

A `/admin/content` panel (protected by the existing `AdminGate.tsx`) with four sections:

| Section | What you can manage |
|---|---|
| **Destinations** | Add a country → add a city under it → add a university under that city |
| **Modules** | Create, edit, or disable modules per country. Toggle which ones are active. Set sidebar order. |
| **Content editor** | Per-module form: intro text, steps array, tips, links, document checklists |
| **University data** | Deadlines, tuition, language requirements — all editable with a `lastVerified` date |

The `lastVerified` date on university entries surfaces a warning in the admin UI when information hasn't been reviewed in more than 6 months, prompting a manual check before application season.

---

## How the Frontend Adapts

No new `.tsx` file is needed for every country variant of a page. Each page component becomes a thin layout shell that fetches its content from the API:

```
BankingPage.tsx
  → fetches module "banking" for user's countryId
  → renders intro, steps, tips, links from the JSON response
  → shows "coming soon" if no module exists for that country
```

The same `BankingPage.tsx` serves Italian students (Italian banking content) and Spanish students (Spanish banking content) — the destination in the user profile determines which content object is returned.

---

## Migration Phases

Build on top of the existing stack (Amplify, DynamoDB, Lambda, Cognito) without ever breaking what currently works.

### Phase 0 — Preparation (no code changes)
- Map each config file (`universityConfig.ts`, `cityConfig.ts`, `neighborhoodConfig.ts`) to its DynamoDB table schema
- Identify every component that reads from these files
- Decide which Cognito users will have admin access

### Phase 1 — Backend only
- Add `leavs-content-universities`, `leavs-content-cities`, `leavs-content-neighborhoods` tables to `backend.ts`
- Add Lambda routes: `GET /content/university/:id`, `GET /content/city/:id`, `GET /content/neighborhoods/:cityId`
- Add admin `PUT`/`POST`/`DELETE` routes with Cognito group check
- Seed tables with the exact same data currently hardcoded in the `.ts` files
- Deploy and verify API returns correct data — **frontend still uses hardcoded files, nothing can break**

### Phase 2 — Admin UI (no frontend data migration yet)
- Add `/admin/content` route protected by `AdminGate.tsx`
- Build forms to view, create, and edit universities, cities, neighborhoods
- Verify edits persist to DynamoDB correctly
- Normal users still see hardcoded data

### Phase 3 — Introduce data-fetching hooks with hardcoded fallbacks
- Create `useUniversityConfig(id)`, `useCityConfig(id)`, `useNeighborhoods(cityId)` hooks
- Each hook tries the API first; on failure falls back to the hardcoded `.ts` data
- Components call the hook instead of importing directly — from their perspective nothing changes

### Phase 4 — Migrate config files one at a time
1. `universityConfig.ts` — only used on a few pages, lowest risk
2. `cityConfig.ts` — used by cost calculator
3. `neighborhoodConfig.ts` — most complex, last

After each migration: test the page manually, verify live data works, verify fallback works if API is unreachable.

### Phase 5 — Add the modules table (destination-aware dashboard)
- Add `leavs-content-modules` table
- Seed with all current sidebar modules tagged to `countryId: "italy"`
- Build `useDestinationModules()` hook that fetches the module list for the user's destination
- Replace hardcoded sidebar with dynamic module list
- This is the moment the product can fully support new countries

### Phase 6 — Remove hardcoded fallbacks
- Once API reliability is proven, remove fallback logic from hooks
- Keep TypeScript *type definitions* in the `.ts` files — delete only the data
- API responses should conform to those same types, so type safety is maintained throughout

---

## Key Safety Principles

- Never delete hardcoded data until the API replacement is proven stable — keep both sources in parallel
- Deploy backend changes (Phase 1) before touching any frontend code
- Test each phase in the sandbox/dev environment before pushing to production
- If the content API is unreachable, show a graceful degraded state — never crash
