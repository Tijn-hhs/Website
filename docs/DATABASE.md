# Leavs — Database Reference

> **Provider**: Amazon DynamoDB (NoSQL)
> **Region**: `eu-north-1` (Stockholm)
> **Billing**: On-demand (pay-per-request)
> **Last updated**: February 22, 2026

---

## Overview

All tables follow the naming pattern `leavs-{env}-{table}`.
`{env}` is set from the `AWS_BRANCH` environment variable at deploy time (e.g. `main`, `prod`), falling back to `dev` for local sandbox.

| Table | Physical name (prod) | Purpose |
|---|---|---|
| User Profiles | `leavs-main-user-profiles` | One record per user — personal info, onboarding answers, cost breakdown, buddy profile |
| User Progress | `leavs-main-user-progress` | One record per (user, step) — which guide steps have been started / completed |
| Deadlines | `leavs-main-deadlines` | User-created deadline reminders |
| Feedback | `leavs-main-feedback` | Free-text feedback messages submitted via the in-app widget |
| WhatsApp Messages | `leavs-main-whatsapp-messages` | Messages captured from WhatsApp groups by the local poller script |

---

## Table 1 — User Profiles

**Physical name**: `leavs-{env}-user-profiles`
**Primary key**: `userId` (String, partition key only)
**Relationship**: one record per Cognito user

### System fields

| Field | Type | Description |
|---|---|---|
| `userId` | String | Cognito sub (UUID). Primary key. |
| `updatedAt` | String (ISO 8601) | Last time this record was written. |

### Personal information

| Field | Type | Values / Notes |
|---|---|---|
| `preferredName` | String | Display name chosen by the user |
| `nationality` | String | Country name |
| `residenceCountry` | String | Country the user currently lives in |
| `isEuCitizen` | String | `"yes"` / `"no"` / `"unknown"` |

### Destination

| Field | Type | Values / Notes |
|---|---|---|
| `destinationCountry` | String | Target country for studies |
| `destinationCity` | String | Target city |
| `destinationUniversity` | String | Target university |
| `destinationUnknownCountry` | Boolean | User has not decided yet |
| `destinationUnknownCity` | Boolean | User has not decided yet |
| `destinationUnknownUniversity` | Boolean | User has not decided yet |

### Program details

| Field | Type | Values / Notes |
|---|---|---|
| `degreeType` | String | `"bachelor"` / `"master"` / `"phd"` / `"exchange"` / `"other"` |
| `fieldOfStudy` | String | Free text |
| `fieldOfStudyUnknown` | Boolean | |
| `programStartMonth` | String | e.g. `"September 2025"` |
| `programStartMonthUnknown` | Boolean | |

### Application status

| Field | Type | Values / Notes |
|---|---|---|
| `programApplied` | String | `"yes"` / `"no"` |
| `programAccepted` | String | `"yes"` / `"no"` |
| `admissionStatus` | String | `"exploring"` / `"applying"` / `"accepted"` / `"enrolled"` |
| `deadlinesKnown` | String | `"yes"` / `"no"` / `"unknown"` |

### Test scores & documents

| Field | Type | Values / Notes |
|---|---|---|
| `hasGmatOrEntranceTest` | String | `"yes"` / `"no"` |
| `gmatScore` | String | Numeric score stored as string |
| `hasEnglishTest` | String | `"yes"` / `"no"` |
| `englishTestType` | String | e.g. `"IELTS"` / `"TOEFL"` |
| `englishTestScore` | String | Numeric score stored as string |
| `hasRecommendationLetters` | String | `"yes"` / `"no"` |
| `hasCv` | String | `"yes"` / `"no"` |

### Visa & travel

| Field | Type | Values / Notes |
|---|---|---|
| `passportExpiry` | String | Date string |
| `visaType` | String | Free text (e.g. `"Type D student visa"`) |
| `visaAppointmentNeeded` | String | `"yes"` / `"no"` / `"unknown"` |
| `hasVisa` | String | `"yes"` / `"no"` |

### Immigration (Italy-specific)

| Field | Type | Values / Notes |
|---|---|---|
| `hasCodiceFiscale` | String | `"yes"` / `"no"` |
| `hasResidencePermit` | String | `"yes"` / `"no"` |

### Housing

| Field | Type | Values / Notes |
|---|---|---|
| `hasHousing` | String | `"yes"` / `"no"` |
| `housingPreference` | String | `"dorm"` / `"private"` / `"roommates"` / `"unknown"` |
| `housingBudget` | String | Free text budget description |
| `moveInWindow` | String | Free text (e.g. `"August 2025"`) |
| `housingSupportNeeded` | String | `"yes"` / `"no"` / `"unknown"` |

### Banking & phone

| Field | Type | Values / Notes |
|---|---|---|
| `needsBankAccount` | String | `"yes"` / `"no"` |
| `hasBankAccount` | String | `"yes"` / `"no"` |
| `needsPhoneNumber` | String | `"yes"` / `"no"` |
| `hasPhoneNumber` | String | `"yes"` / `"no"` |

### Insurance & health

| Field | Type | Values / Notes |
|---|---|---|
| `hasTravelInsurance` | String | `"yes"` / `"no"` |
| `hasHealthInsurance` | String | `"yes"` / `"no"` |

### Finance & budget

| Field | Type | Values / Notes |
|---|---|---|
| `monthlyBudgetRange` | String | `"lt500"` / `"500-900"` / `"900-1300"` / `"1300+"` / `"unknown"` |
| `scholarshipNeed` | String | `"yes"` / `"no"` / `"maybe"` |
| `fundingSource` | String | `"parents"` / `"savings"` / `"work"` / `"scholarship"` / `"mixed"` / `"unknown"` |

### Monthly cost breakdown

All numeric fields store a monthly cost in EUR, set via the Cost of Living section of onboarding.

| Field | Type | Description |
|---|---|---|
| `housingType` | String | Accommodation type label |
| `rentCost` | Number | Rent |
| `utilitiesCost` | Number | Utilities (electricity, gas, water) |
| `internetCost` | Number | Internet subscription |
| `mobileCost` | Number | Mobile phone plan |
| `transportCost` | Number | Public transport / fuel |
| `groceriesCost` | Number | Groceries |
| `diningOutCost` | Number | Eating out / cafes |
| `entertainmentCost` | Number | Entertainment & leisure |
| `clothingCost` | Number | Clothing & accessories |
| `personalCareCost` | Number | Personal care & hygiene |
| `booksCost` | Number | Books & study materials |

### Progress tracking

| Field | Type | Description |
|---|---|---|
| `lastCompletedStep` | Number | Index of the last fully completed onboarding step |
| `checklistItems` | Map | Nested map: outer key = step number (Number), inner key = checklist item ID (String), value = Boolean checked state |

### Buddy system

| Field | Type | Values / Notes |
|---|---|---|
| `buddyOptIn` | String | `"yes"` / `"no"` |
| `buddyDisplayName` | String | Name shown to other buddies |
| `buddyPhone` | String | Contact phone number |
| `buddyInstagram` | String | Instagram handle |
| `buddyLinkedIn` | String | LinkedIn profile URL |
| `buddyLookingFor` | String | Free text — what the user wants from a buddy |
| `buddyBio` | String | Short bio |
| `buddyStatus` | String | Matching status (e.g. `"pending"` / `"matched"`) |
| `buddyMatchedWithId` | String | userId of the matched buddy |

---

## Table 2 — User Progress

**Physical name**: `leavs-{env}-user-progress`
**Primary key**: `userId` (String, PK) + `stepKey` (String, SK)
**Relationship**: one record per user per guide step

| Field | Type | Description |
|---|---|---|
| `userId` | String | Cognito sub. Partition key. |
| `stepKey` | String | Step identifier (e.g. `"housing"`, `"visa"`). Sort key. |
| `started` | Boolean | `true` once the user has opened the step |
| `startedAt` | String (ISO 8601) | When the user first opened the step. Set once; never overwritten. |
| `completed` | Boolean | `true` once the user marks the step complete |
| `completedAt` | String (ISO 8601) or null | When `completed` was last set `true`; null if uncompleted |
| `updatedAt` | String (ISO 8601) | Last write timestamp |

---

## Table 3 — Deadlines

**Physical name**: `leavs-{env}-deadlines`
**Primary key**: `userId` (String, PK) + `deadlineId` (String, SK)
**Relationship**: one record per deadline

| Field | Type | Description |
|---|---|---|
| `userId` | String | Cognito sub. Partition key. |
| `deadlineId` | String | UUID v4. Sort key. |
| `title` | String | Deadline label (required, non-empty) |
| `dueDate` | String | ISO date string. Validated at creation: cannot be in the past. |
| `sendReminder` | Boolean | Whether the user wants a reminder |
| `note` | String (optional) | Free-text note |
| `createdAt` | String (ISO 8601) | Creation timestamp |
| `updatedAt` | String (ISO 8601) | Last modification timestamp |

---

## Table 4 — Feedback

**Physical name**: `leavs-{env}-feedback`
**Primary key**: `feedbackId` (String, PK) + `timestamp` (Number, SK)
**Relationship**: append-only log

| Field | Type | Description |
|---|---|---|
| `feedbackId` | String | UUID v4. Partition key. |
| `timestamp` | Number | Unix timestamp in milliseconds. Sort key. |
| `userId` | String | Cognito sub, or `"guest-{timestamp}"` for unauthenticated submissions |
| `message` | String | The feedback text |
| `page` | String | Page/route where feedback was submitted; `"unknown"` if not provided |
| `createdAt` | String (ISO 8601) | Human-readable creation time |

---

## Table 5 — WhatsApp Messages

**Physical name**: `leavs-{env}-whatsapp-messages`
**Primary key**: `groupId` (String, PK) + `messageId` (String, SK)
**Relationship**: append-only log. Written by the local `scripts/whatsapp-poller` script (not the Lambda). Lambda has read-only access.

| Field | Type | Description |
|---|---|---|
| `groupId` | String | WhatsApp group JID (e.g. `"120363XXXX@g.us"`). Partition key. |
| `messageId` | String | WhatsApp message ID (`msg.id._serialized`) — globally unique. Sort key. |
| `groupName` | String | Human-readable group name at time of capture |
| `sender` | String | Sender JID (`msg.author` or `msg.from`) |
| `senderName` | String | Display name at time of capture; may be empty string |
| `body` | String | Message text content |
| `timestamp` | Number | Unix timestamp in seconds (from WhatsApp metadata) |
| `fetchedAt` | String (ISO 8601) | When the poller script wrote this record to DynamoDB |

> **Deduplication**: the poller uses `ConditionExpression: attribute_not_exists(messageId)` so duplicate deliveries are silently ignored.

---

## API Endpoints

| Method | Path | Auth | Tables touched |
|---|---|---|---|
| GET | `/user/me` | Cognito | Profiles (read), Progress (read) |
| PUT | `/user/me` | Cognito | Profiles (write) |
| PUT | `/progress` | Cognito | Progress (write — mark completed/uncompleted) |
| PUT | `/progress/start` | Cognito | Progress (write — mark started) |
| GET | `/deadlines` | Cognito | Deadlines (read) |
| POST | `/deadlines` | Cognito | Deadlines (write) |
| POST | `/feedback` | None (public) | Feedback (write) |
| GET | `/admin/stats` | Cognito + secret | Profiles, Progress, Feedback (full scan) |
| GET | `/admin/whatsapp-messages` | Cognito + secret | WhatsApp Messages (read) |
| GET | `/admin/feedback` | Cognito + secret | Feedback (full scan) |

---

## Deployment Notes

- Table names are determined at deploy time from `AWS_BRANCH`. Local sandbox uses `dev`.
- All tables use **on-demand billing** — no capacity provisioning required.
- `removalPolicy: DESTROY` — tables are deleted when the Amplify environment is torn down. Do not store production data in non-production environments.
- The Lambda is the sole writer for tables 1–4. Table 5 is written exclusively by the local poller script using direct DynamoDB credentials.
