# Project Map - Student Hub (Leavs)

> **One-page guide to understanding the entire codebase**  
> Last updated: February 18, 2026

---

## 🎯 What This Project Does

**Student Hub (Leavs)** is a comprehensive web application that guides international students through their journey from university application to settling into life in Milan, Italy. It provides:

- **Guided Onboarding**: 8-step personalized questionnaire to understand student needs
- **Dashboard & Progress Tracking**: Real-time sync of completed steps and milestones
- **Information Center**: 13+ detailed guides covering visa, housing, banking, healthcare, etc.
- **Deadline Management**: Custom deadline tracking with reminder support
- **Cost of Living Calculator**: Interactive tool for budget planning
- **Blog System**: Educational content about student life in Milan

---

## 🏗️ Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│                       FRONTEND (SPA)                        │
│  React 18 + TypeScript + Vite + Tailwind CSS               │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Landing &  │  │  Onboarding  │  │   Dashboard &    │  │
│  │    Blog     │  │  (8 Steps)   │  │  Info Pages      │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS / REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      AWS INFRASTRUCTURE                      │
│                                                             │
│  ┌──────────────┐      ┌────────────────┐                  │
│  │   Cognito    │◄────►│  API Gateway   │                  │
│  │  User Pools  │      │  + REST API    │                  │
│  │   (Auth)     │      │                │                  │
│  └──────────────┘      └────────┬───────┘                  │
│                                 │                          │
│                                 ▼                          │
│                        ┌────────────────┐                  │
│                        │Lambda Handler  │                  │
│                        │  (Node.js)     │                  │
│                        └────────┬───────┘                  │
│                                 │                          │
│              ┌──────────────────┼──────────────────┐       │
│              ▼                  ▼                  ▼       │
│       ┌──────────┐       ┌──────────┐      ┌──────────┐  │
│       │DynamoDB  │       │DynamoDB  │      │DynamoDB  │  │
│       │Profiles  │       │Progress  │      │Deadlines │  │
│       └──────────┘       └──────────┘      └──────────┘  │
│                                                             │
│       ┌──────────┐       ┌──────────┐                      │
│       │DynamoDB  │       │   SES    │                      │
│       │Feedback  │       │ (Email)  │                      │
│       └──────────┘       └──────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Directory Structure

### Root Files

```
├── package.json              # Dependencies & scripts
├── vite.config.ts            # Vite build configuration
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.js        # Tailwind CSS theming
├── amplify.yml               # AWS Amplify CI/CD pipeline config
└── amplify_outputs.json      # Generated runtime config (Cognito, API)
```

### Frontend (`/src`)

```
src/
├── main.tsx                  # App entry point (Amplify init)
├── App.tsx                   # Router configuration (20 routes)
├── index.css                 # Global styles + Tailwind directives
│
├── components/               # Reusable UI components (25 files)
│   ├── AppLayout.tsx         # Root layout (Header + Footer)
│   ├── DashboardLayout.tsx   # Dashboard layout (Sidebar + content)
│   ├── Sidebar.tsx           # Collapsible sidebar with icons
│   ├── AuthGate.tsx          # Protected route wrapper
│   ├── AuthLayout.tsx        # Auth page wrapper
│   ├── FeedbackWidget.tsx    # Public feedback form
│   ├── DeadlineModal.tsx     # Deadline creation modal
│   └── ...                   # Cards, maps, sliders, modals, etc.
│
├── pages/                    # Route pages (20 files)
│   ├── LandingPage.tsx       # Public homepage
│   ├── AuthPage.tsx          # Sign in/up page
│   ├── DashboardPage.tsx     # User dashboard
│   ├── MySituationPage.tsx   # Profile summary
│   ├── StudentVisaPage.tsx   # Visa info guide
│   ├── HousingPage.tsx       # Housing guide
│   ├── BankingPage.tsx       # Banking guide
│   ├── CodiceFiscalePage.tsx # Codice Fiscale info
│   ├── CostOfLivingPage.tsx  # Budget calculator
│   ├── BlogOverviewPage.tsx  # Blog listing
│   ├── BlogPostPage.tsx      # Individual blog post
│   └── ...                   # More info pages
│
├── onboarding/               # Onboarding system
│   ├── types.ts              # OnboardingDraft type (45 fields)
│   ├── steps.ts              # Step configuration & validation
│   ├── OnboardingLayout.tsx  # Onboarding page wrapper
│   ├── useOnboardingDraft.ts # Draft state management hook
│   ├── defaultDraft.ts       # Initial empty draft
│   ├── sync.ts               # Sync draft ↔ backend
│   ├── pages/                # Step pages (8 pages)
│   │   ├── OnboardingStart.tsx
│   │   ├── Step1Destination.tsx
│   │   ├── Step2Origin.tsx
│   │   ├── Step3Program.tsx
│   │   ├── Step3bApplication.tsx  # Conditional step
│   │   ├── Step5Visa.tsx
│   │   ├── Step6Budget.tsx
│   │   └── Step8ReviewFinish.tsx
│   └── components/           # Onboarding-specific UI
│       ├── DestinationForm.tsx
│       ├── OriginForm.tsx
│       └── ...
│
├── lib/                      # Core utilities
│   ├── api.ts                # API client (REST endpoints)
│   ├── auth.ts               # Auth helpers (signIn, signOut, etc.)
│   ├── cityConfig.ts         # Milan city data
│   └── neighborhoodConfig.ts # Milan neighborhood info
│
├── hooks/                    # Custom React hooks
│   └── useStepIntro.ts       # Step intro modal state
│
├── data/                     # Static data
│   └── blogPosts.ts          # Blog content array
│
└── types/                    # TypeScript types
    └── user.ts               # User profile types
```

### Backend (`/amplify`)

```
amplify/
├── backend.ts                # Infrastructure as Code (IaC)
│                             # - Defines 4 DynamoDB tables
│                             # - Creates REST API Gateway
│                             # - Configures Cognito authorizer
│                             # - Sets Lambda permissions
│
├── auth/
│   └── resource.ts           # Cognito User Pool configuration
│
└── functions/
    └── userApi/
        ├── resource.ts       # Lambda function definition
        ├── handler.ts        # API request handler (413 lines)
        └── package.json      # Lambda dependencies
```

---

## 🔑 Key Technologies

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Frontend Framework** | React 18 | Component-based UI |
| **Language** | TypeScript | Type-safe JavaScript |
| **Build Tool** | Vite | Fast dev server & bundler |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Routing** | React Router v6 | Client-side routing |
| **Icons** | Lucide React | Icon library (250+ icons) |
| **Maps** | Leaflet + React Leaflet | Interactive maps |
| **Backend** | AWS Amplify Gen 2 | Backend-as-code framework |
| **Auth** | AWS Cognito | User authentication |
| **API** | AWS API Gateway (REST) | HTTP API management |
| **Compute** | AWS Lambda | Serverless functions |
| **Database** | DynamoDB | NoSQL key-value store |
| **Email** | AWS SES | Transactional emails |
| **CI/CD** | AWS Amplify Hosting | Automated deployments |

---

## 🗄️ Data Model Summary

### DynamoDB Tables

**1. `leavs-{env}-user-profiles`**
- **Partition Key**: `userId` (String)
- **Purpose**: Store user profile data (name, nationality, university, housing preferences, budget, etc.)
- **Fields**: 50+ optional fields

**2. `leavs-{env}-user-progress`**
- **Partition Key**: `userId` (String)
- **Sort Key**: `stepKey` (String)
- **Purpose**: Track completion status for each onboarding/info step
- **Fields**: `completed`, `completedAt`, `started`, `startedAt`

**3. `leavs-{env}-deadlines`**
- **Partition Key**: `userId` (String)
- **Sort Key**: `deadlineId` (String)
- **Purpose**: Store user-created deadlines (visa appointments, application due dates, etc.)
- **Fields**: `title`, `dueDate`, `sendReminder`, `note`, timestamps

**4. `leavs-{env}-feedback`**
- **Partition Key**: `feedbackId` (String)
- **Sort Key**: `timestamp` (Number)
- **Purpose**: Store public feedback submissions
- **Fields**: `userId` (guest ID), `message`, `createdAt`

---

## 🔌 API Endpoints

**Base URL**: `{REST_API_URL}` (from `amplify_outputs.json`)

### Authenticated Endpoints (Require Cognito JWT)

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| `GET` | `/user/me` | Get user profile & progress | - | `{ profile: {}, progress: [] }` |
| `PUT` | `/user/me` | Update user profile | `UserProfile` fields | `{ message: "Profile saved" }` |
| `PUT` | `/progress` | Mark step completed | `{ stepKey, completed }` | `{ message: "Progress saved" }` |
| `PUT` | `/progress/start` | Mark step started | `{ stepKey }` | `{ message: "Step started" }` |
| `GET` | `/deadlines` | Get user deadlines | - | `{ deadlines: [] }` |
| `POST` | `/deadlines` | Create deadline | `{ title, dueDate, sendReminder, note? }` | `{ deadline: {} }` |

### Public Endpoints (No Auth Required)

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| `POST` | `/feedback` | Submit feedback | `{ message }` | `{ message: "Feedback received" }` |

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Local development (Vite only, no backend)
npm run dev

# Local development (with Amplify backend sandbox)
npm run sandbox     # Terminal 1
npm run dev         # Terminal 2

# Generate amplify_outputs.json from deployed backend
npm run amplify:outputs

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## 🎓 Onboarding Flow

The onboarding system collects student information through 8 steps:

1. **Destination** (Step 1) - Milan, Italy + University selection
2. **Origin & Citizenship** (Step 2) - Nationality, residence, EU status
3. **Program Basics** (Step 3) - Degree type, application status, acceptance
4. **Application Requirements** (Step 3.5) - GMAT, English tests, letters (conditional: only if not applied yet)
5. **Visa & Documents** (Step 5) - Passport, visa type, appointments (conditional: non-EU only)
6. **Current Progress** (Step 6) - Housing, banking, insurance, phone, documents
7. **(Step 7 removed)** - No longer in use
8. **Review & Finish** (Step 8) - Summary and submission

**Key Features**:
- **Conditional steps**: Steps 3.5 and 5 only appear if relevant
- **Draft auto-save**: Changes saved to `localStorage` every 2 seconds
- **Backend sync**: Draft synced to DynamoDB on submission
- **Validation**: Each step has custom validation rules
- **Smart defaults**: Unknown values handled gracefully

---

## 🔐 Authentication Flow

1. User visits `/auth` → AWS Amplify UI `Authenticator` component
2. Sign up or sign in → Cognito creates user in User Pool
3. Cognito returns JWT tokens (ID token, access token, refresh token)
4. Tokens stored in browser (managed by Amplify SDK)
5. Protected routes (`/dashboard`, `/onboarding/*`) require authentication via `<AuthGate>`
6. API requests include JWT in `Authorization` header
7. API Gateway validates JWT via Cognito Authorizer before reaching Lambda

---

## 📦 Deployment Pipeline

**Platform**: AWS Amplify Hosting

**Build Process** (from `amplify.yml`):
1. Install dependencies: `npm ci`
2. Deploy backend: `npx ampx pipeline-deploy` (creates/updates CloudFormation stacks)
3. Generate outputs: `npx ampx generate outputs` (creates `amplify_outputs.json`)
4. Copy outputs to public folder: `cp amplify_outputs.json public/`
5. Build frontend: `npm run build`
6. Deploy artifacts from `build/` folder

**Environments**:
- **Sandbox**: Local development (per-developer sandboxes)
- **Main**: Production branch (auto-deploys on push to `main`)
- **Other branches**: Preview environments (auto-created on PR)

**Environment Variables** (set in Lambda):
- `USER_PROFILE_TABLE_NAME`
- `USER_PROGRESS_TABLE_NAME`
- `FEEDBACK_TABLE_NAME`
- `DEADLINES_TABLE_NAME`
- `FEEDBACK_EMAIL` (email address for feedback notifications)

---

## 🧪 Testing

**Current State**: No automated tests yet

**Manual Testing**:
1. Run `npm run dev` and visit `http://localhost:5173`
2. Test authentication flow
3. Complete onboarding flow
4. Test dashboard features (sidebar, deadlines, cost calculator)
5. Test info pages
6. Test feedback widget

**Future**: Add Jest + React Testing Library for unit/integration tests

---

## 📚 Documentation Index

- **[PROJECT_MAP.md](PROJECT_MAP.md)** (this file) - Comprehensive overview
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Detailed system design & data flows
- **[API.md](API.md)** - Complete API reference
- **[ONBOARDING_FLOW.md](ONBOARDING_FLOW.md)** - Onboarding system deep dive
- **[DATABASE.md](DATABASE.md)** - DynamoDB schema & access patterns
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment guide & CI/CD pipeline
- **[README.md](../README.md)** - Quick start & setup
- **[LOCAL_DEV_SETUP.md](../LOCAL_DEV_SETUP.md)** - Local development with Amplify

**Sidebar Enhancement Docs** (in root):
- [START_HERE.md](../START_HERE.md) - Sidebar feature overview
- [DOCUMENTATION_INDEX.md](../DOCUMENTATION_INDEX.md) - Navigation guide
- [IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md) - What changed
- [SIDEBAR_ENHANCEMENT_GUIDE.md](../SIDEBAR_ENHANCEMENT_GUIDE.md) - Full implementation details
- [ICON_REFERENCE.md](../ICON_REFERENCE.md) - Icon customization
- [ANIMATION_GUIDE.md](../ANIMATION_GUIDE.md) - Animation mechanics
- [VERIFICATION_CHECKLIST.md](../VERIFICATION_CHECKLIST.md) - Testing procedures

---

## 🔍 Where to Find Things

| What | Where |
|------|-------|
| **Add a new page** | Create in `src/pages/`, add route in `src/App.tsx` |
| **Add a new Sidebar item** | Update `src/components/Sidebar.tsx` |
| **Add a new API endpoint** | Add to `amplify/functions/userApi/handler.ts` + `amplify/backend.ts` |
| **Add a new onboarding step** | Create page in `src/onboarding/pages/`, add config to `src/onboarding/steps.ts` |
| **Modify user profile fields** | Update `UserProfile` interface in `amplify/functions/userApi/handler.ts` |
| **Change authentication** | Modify `amplify/auth/resource.ts` |
| **Add a new DynamoDB table** | Add in `amplify/backend.ts` |
| **Update styling/theme** | Modify `tailwind.config.js` or `src/index.css` |
| **Add static content** | Create in `src/data/` or update existing files |
| **Configure CI/CD** | Modify `amplify.yml` |

---

## 🤝 Contributing

**Getting Started**:
1. Clone the repository
2. Run `npm install`
3. Run `npm run sandbox` (starts local Amplify backend)
4. Run `npm run dev` in another terminal
5. Make changes, test locally
6. Commit and push to a feature branch
7. Create a pull request

**Code Style**:
- Use TypeScript for type safety
- Follow existing naming conventions
- Use Tailwind CSS classes for styling (avoid custom CSS)
- Keep components small and focused
- Add comments for complex logic

---

## 📞 Support

**For Questions**:
- Check existing documentation in `/docs`
- Review inline code comments
- Contact: tijn@eendenburg.eu

**For Issues**:
- Check error logs in browser DevTools Console
- Check Lambda logs in AWS CloudWatch
- Review DynamoDB table contents in AWS Console

---

## 🎯 Roadmap Ideas

**Upcoming Features**:
- [ ] Email notifications for deadlines
- [ ] PDF export of user profile/checklist
- [ ] Multi-language support (English, Italian)
- [ ] Mobile app (React Native)
- [ ] Admin dashboard
- [ ] Analytics integration
- [ ] University-specific content
- [ ] Automated testing suite
- [ ] Performance optimization

---

**Built with ❤️ for international students**
