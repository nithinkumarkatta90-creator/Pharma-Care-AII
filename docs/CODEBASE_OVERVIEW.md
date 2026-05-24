# Pharma-Care-AII Codebase Overview

This document helps new contributors quickly understand how the app is organized and where to start.

## 1) Big picture

Pharma-Care-AII is a TypeScript healthcare web app that combines:

- A React + Vite SPA frontend (`src/`)
- A lightweight Express server (`server.ts`) for API endpoints and local dev/prod serving
- Firebase for Auth, Firestore, and Storage
- Gemini models for AI workflows (chat, diagnosis, report analysis, etc.)

The server and frontend are started together during development via `npm run dev`.

## 2) Top-level layout

- `src/`: Frontend application code.
- `server.ts`: Express app, API routes (`/api/*`), Vite middleware in dev, static serving in prod.
- `firebase-applet-config.json`: Firebase project/app config consumed by the frontend initializer.
- `firestore.rules`: Firestore security rules.
- `docs/`: Additional project documentation.
- `public/`: Static assets and PWA files.

## 3) Frontend structure (`src/`)

### Entry and app shell
- `main.tsx`: React entrypoint.
- `App.tsx`: Global providers + auth gating + route table.
  - Uses lazy loaded pages.
  - Defines `AuthContext` (`useAuth`) with Firebase `onAuthStateChanged`.
  - Redirects unauthenticated users to `/login`.

### UI and navigation
- `components/Layout.tsx`: Primary app shell (sidebar + header + outlet), nav groups, logout, theme toggle.
- `components/ui/*`: Reusable UI primitives (button, dialog, tabs, etc.).

### Pages (feature screens)
- `pages/*`: Route-level views (dashboard, chat, diagnosis, medicine info, reminders, profile, admin, scanners, etc.).

### Services (business logic + integrations)
- `services/aiService.ts`: Gemini client wrappers for many medical flows.
- `services/reminderService.ts`: Reminder CRUD and related data interactions.
- `services/medicalHistoryService.ts`: Medical-history specific operations.
- `services/qrService.ts`: QR generation/verification helpers.
- `services/dietService.ts`, `services/messagingService.ts`, `services/ipDatabaseService.ts`, etc.

### Shared platform setup
- `lib/firebase.ts`: Firebase initialization + auth persistence + Firestore persistence.
- `lib/auth.ts`, `lib/firestore-errors.ts`, `lib/utils.ts`: utility helpers for auth/error handling/general functions.
- `types/*`: Domain types (`reminder`, `diet`, `medical-history`, `trusted-medicine`, etc.).
- `constants/*`: Shared constants (e.g., diseases).
- `data/*`: Local JSON datasets.

## 4) Backend structure (`server.ts`)

`server.ts` is intentionally compact:

- Initializes Express + CORS + JSON parsing.
- Redirects `127.0.0.1` hostname to `localhost` for consistency.
- Creates a Gemini client using `GEMINI_API_KEY`.
- Hosts IP monograph APIs:
  - `GET /api/ip-database`
  - `GET /api/sync-ip-drugs`
  - `POST /api/ip-database/explain`
- Hosts utility endpoints:
  - `GET /api/health`
  - `POST /api/chat`
- Runs Vite middleware in non-production; static SPA serving in production.

## 5) Important engineering conventions to know

1. **Auth-first routing model**
   - Most routes are protected and rendered only when `user` exists in `AuthContext`.

2. **Feature-per-page with service helpers**
   - Page components focus on interaction/presentation; service files centralize external calls and logic.

3. **Aggressive lazy loading**
   - Most route components are lazy-loaded in `App.tsx` to reduce initial bundle cost.

4. **Mixed data sources**
   - Firebase stores user/app data.
   - Some trusted or seed-like data is local/static (`data/`, in-memory arrays in `server.ts`).

5. **AI safety depends on prompts + UI copy**
   - Prompt instructions in `aiService.ts`/`server.ts` embed safety/disclaimer language; keep these explicit when modifying features.

## 6) Recommended learning path for newcomers

1. **Read routing/auth flow first**
   - `src/App.tsx` then `src/components/Layout.tsx`.

2. **Trace one end-to-end feature**
   - Example: Medicine reminders (`pages/Reminders.tsx` + `pages/AddReminder.tsx` + `services/reminderService.ts`).

3. **Understand Firebase bootstrapping and data model assumptions**
   - `src/lib/firebase.ts`, then the relevant service files and `types/*`.

4. **Review AI entry points carefully**
   - `src/services/aiService.ts` and backend Gemini usage in `server.ts`.

5. **Study deploy/runtime settings**
   - `vite.config.ts`, `render.yaml`, `codemagic.yaml`, `capacitor.config.json`.

## 7) Practical “first tasks” to build confidence

- Add/adjust a small page-level form validation rule and wire toast feedback.
- Add a typed field to one domain type and propagate through one service + one page.
- Add a small API response guard and friendly error UI using existing error helpers.
- Improve one AI prompt with clearer output schema and corresponding UI parser.

## 8) Common pitfalls

- Forgetting route protection behavior when adding new pages.
- Duplicating business logic in pages instead of services.
- Weak typing (`any`) creeping into new code.
- Changing AI prompt contracts without updating UI expectations.
- Assuming local static datasets are authoritative production sources.

