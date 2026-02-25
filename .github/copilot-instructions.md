# Leavs — Copilot Instructions

## Project Overview
**Leavs (Student Hub)** is a React 18 + TypeScript SPA that guides international students through moving to Milan, Italy for university. It covers the full journey: university application → visa → housing → banking → healthcare, etc.

**Live URL:** Deployed via AWS Amplify Hosting (CloudFront CDN).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router v6 |
| Icons | Lucide React |
| Maps | Leaflet + React Leaflet |
| Auth | AWS Cognito (via Amplify SDK v6) |
| API | AWS API Gateway (REST) → Lambda (Node.js) |
| Database | DynamoDB (4 tables: profiles, progress, deadlines, feedback) |
| Email | AWS SES |
| CI/CD | AWS Amplify Hosting (auto-deploy on push to `main`) |
| IaC | AWS Amplify Gen 2 (`amplify/backend.ts`) |

---

## Key Directories

```
src/
├── App.tsx                   # Route config (~25 routes)
├── components/               # Shared UI (StepCard, Sidebar, DeadlineModal, etc.)
├── pages/                    # Route-level pages (one per dashboard step)
├── onboarding/               # 8-step onboarding flow
│   ├── pages/                # Step0Welcome → Step8ReviewFinish
│   ├── steps.ts              # StepConfig[] — validation logic per step
│   ├── stepRequirements.ts   # Which onboarding fields unlock which steps
│   └── sync.ts               # Draft → API sync helpers
├── lib/
│   ├── api.ts                # All REST API calls (fetchMe, saveStepProgress, etc.)
│   ├── auth.ts               # Cognito helpers
│   ├── cityConfig.ts         # Milan city/university data
│   └── neighborhoodConfig.ts # Milan neighborhood info
└── types/                    # Shared TypeScript types (UserProfile, StepProgress, etc.)

amplify/
├── backend.ts                # IaC: DynamoDB tables, API Gateway, Lambda perms
├── auth/resource.ts          # Cognito config
└── functions/userApi/
    ├── handler.ts            # Single Lambda handler for ALL API routes
    └── resource.ts           # Lambda definition
```

---

## Dashboard Steps (in order)

**Numbered steps** (tracked in DynamoDB progress table):
1. University Application → `/dashboard/university-application`
2. Funding & Scholarships → `/dashboard/funding-scholarships`
3. Student Visa → `/dashboard/student-visa`
4. Codice Fiscale → `/dashboard/codice-fiscale`
5. Before Departure → `/dashboard/before-departure`
6. Residence Permit → `/dashboard/immigration-registration`
7. Housing → `/dashboard/housing`
8. Banking → `/dashboard/banking`
9. Insurance → `/dashboard/insurance`
10. Healthcare → `/dashboard/healthcare`

**Extra info pages** (not numbered):
- Information Centre, Cost of Living, Buddy System, AI Support, Find Your Peers

---

## Architecture Patterns

### Adding a new dashboard page
1. Create `src/pages/NewStepPage.tsx` (copy an existing page as template)
2. Add route in `src/App.tsx` inside `<AuthGate>`
3. Add step name + route to the `numberedSteps`/`stepRoutes`/`stepIcons` maps in `src/components/DashboardHome.tsx`
4. Register step requirements in `src/onboarding/stepRequirements.ts` if it depends on onboarding data
5. Add sidebar link in `src/components/Sidebar.tsx`

### API calls
- All API calls go through `src/lib/api.ts`
- Every authenticated request uses `getAuthHeaders()` which reads the Cognito JWT
- Lambda handles all routes in `amplify/functions/userApi/handler.ts` — add new routes there

### Progress tracking
- Step progress is stored per user in DynamoDB (`progress` table, PK=userId, SK=stepKey)
- `saveStepProgress(stepKey, data)` in `api.ts` upserts a step
- `StepCard` in `DashboardHome.tsx` reads from `stepProgress` state

### Deadlines
- Stored in DynamoDB (`deadlines` table)
- CRUD via `fetchDeadlines`, `createDeadline`, `updateDeadline`, `deleteDeadline` in `api.ts`
- UI managed by `DeadlineModal.tsx` — props include `title` (not `label`)

### Admin
- Admin routes are guarded by `AdminGate.tsx` (checks Cognito group)
- Admin dashboard: `/admin` → `AdminDashboardPage.tsx`
- API has `/admin/*` routes in the Lambda handler, also JWT-protected

---

## Styling Conventions
- Tailwind CSS utility classes only — no custom CSS except `src/index.css`
- Color palette: green (`green-600`, `green-700`) for primary actions, `stone-50`/`stone-100` for backgrounds
- Sidebar is collapsible; icons from Lucide React
- Responsive: mobile-first, use `sm:`, `md:`, `lg:` breakpoints

---

## State Management
- No Redux/Zustand — React hooks + `useState`/`useEffect` only
- Onboarding draft persisted to `localStorage` (key: `onboardingDraft`)
- User profile fetched on dashboard load via `fetchMe()` and stored in component state
- Sidebar collapsed state in `localStorage`

---

## Deployment
- Push to `main` → AWS Amplify auto-builds and deploys
- `amplify.yml` controls CI/CD pipeline
- Backend changes (`amplify/`) require `npx ampx pipeline-deploy` or are picked up by Amplify's build
- Local dev: `npm run dev` (Vite dev server on port 5173)

---

## Important Constraints
- Target users: **international students moving to Milan, Italy** (non-EU and EU)
- Content is Milan/Italy-specific (Codice Fiscale, permesso di soggiorno, etc.)
- EU vs non-EU distinction matters for visa/permit steps
- The `isEuCitizen` field from onboarding controls which steps are shown/required
- Do not break existing DynamoDB key schemas (PK/SK patterns) without migrating data

---

## Copilot Behaviour Rules
- **Never run `npx ampx sandbox` or any sandbox/deploy command** unless the user explicitly asks for it. Backend deploys cost money and time.
- **Ask clarifying questions** before implementing anything that is ambiguous or has multiple reasonable interpretations. Do not guess and build the wrong thing — confirm intent first.
