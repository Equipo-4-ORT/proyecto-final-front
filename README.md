# Proyecto Final — Frontend

Single-page web application (SPA) to **log and consolidate work activities** from multiple
sources (Google Calendar, Google Drive/Docs/Sheets, Jira and manual entries), generate
**AI-consolidated reports**, browse the **history** and export it to Excel. It includes
Google sign-in, per-user settings and an administration module (user management) for
profiles with the `ADMIN` role.

This repository contains the **frontend only**. It consumes a REST API that lives in a
separate repository (the team's backend). Without a backend reachable at `VITE_API_URL`,
the app cannot authenticate or load data.

---

## Table of contents

- [Tech stack](#tech-stack)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Available scripts](#available-scripts)
- [Project structure](#project-structure)
- [Architecture](#architecture)
- [Application routes](#application-routes)
- [API consumed by the frontend](#api-consumed-by-the-frontend)
- [Testing](#testing)
- [Linting and formatting](#linting-and-formatting)
- [Docker](#docker)
- [CI/CD and branching model](#cicd-and-branching-model)

---

## Tech stack

| Category         | Technology                                                                    | Version    | What it's used for                                           |
| ---------------- | ----------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------ |
| UI library       | [React](https://react.dev)                                                    | 19.2       | Building the component-based UI.                             |
| Build tool / dev | [Vite](https://vite.dev)                                                      | 8.0        | Dev server with HMR and production bundling.                 |
| Routing          | [React Router DOM](https://reactrouter.com)                                   | 7.14       | Client-side routing and protected routes.                    |
| Styling          | [Tailwind CSS](https://tailwindcss.com)                                       | 4.2        | CSS utilities (via the official `@tailwindcss/vite` plugin). |
| Server state     | [TanStack Query](https://tanstack.com/query)                                  | 5.100      | Caching and synchronization of remote data.                  |
| HTTP client      | [Axios](https://axios-http.com)                                               | 1.15       | API calls, `withCredentials` cookies and session refresh.    |
| Charts           | [Recharts](https://recharts.org)                                              | 3.8        | Visualizations (time distribution, dashboard stats).         |
| Icons            | [Lucide React](https://lucide.dev)                                            | 1.14       | Icon set.                                                    |
| Testing          | [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) | 4.1 / 16.3 | Unit and component tests on `jsdom`.                         |
| Linting          | [ESLint](https://eslint.org)                                                  | 9.39       | Static analysis (flat config).                               |
| Formatting       | [Prettier](https://prettier.io)                                               | 3.8        | Code formatting.                                             |

> **Language:** JavaScript + JSX (no TypeScript). The bundle is 100% client-side (SPA);
> there is no SSR.

---

## Features

- **Google sign-in (OAuth)** delegated to the backend, with a session based on `HttpOnly`
  cookies and transparent session refresh.
- **Activity dashboard**: create/edit/delete the day's activities, with duration in hours,
  grouping by source and productivity stats computed from the user's configured workday.
- **Jira integration (OAuth)**: connect/disconnect the Jira account from the dashboard to
  incorporate that activity source.
- **AI-consolidated reports**: generate a report for the day from the logged activities (the
  AI processing happens on the backend).
- **History**: paginated list of reports with date-range filters and download of the
  consolidated Excel file.
- **User settings**: workday hours (start/end), default activity duration and an option to
  avoid overlaps when consolidating.
- **Administration (`ADMIN` role)**: user management (list, create, edit, enable/disable)
  with search filters.
- **Cross-cutting UX**: toast notifications, an error boundary, loading states and a small
  library of reusable UI components.

---

## Prerequisites

- **Node.js 20.x** — this is the version used by CI and the Docker image. Newer versions
  usually work for local development, but 20 is the reference version.
- **npm** (bundled with Node). The repo uses `package-lock.json`, so `npm ci` is recommended
  for reproducible installs.
- A running, reachable **backend** instance (see [Environment variables](#environment-variables)).

---

## Getting started

```bash
# 1. Clone the repository
git clone git@github.com:Equipo-4-ORT/proyecto-final-front.git
cd proyecto-final-front

# 2. Install dependencies (reproducible install from the lockfile)
npm ci

# 3. Create the environment file from the template
cp .env.example .env
#   then edit VITE_API_URL if your backend is not at http://localhost:3000

# 4. Start the dev server (Vite, with HMR)
npm run dev
```

By default Vite serves the app at **http://localhost:5173**. For a production build:

```bash
npm run build     # generates the static bundle in dist/
npm run preview   # serves dist/ locally to verify the build
```

---

## Environment variables

The project uses Vite's environment-variable system. **Only variables prefixed with
`VITE_` are exposed to client code**; any other variable is ignored in the bundle.

> ⚠️ **Important:** `VITE_*` variables are **inlined into the bundle at build time** and end
> up embedded (in plain text) in the JavaScript downloaded by the browser. **They are not
> secret.** Never put API keys, tokens or credentials here — only public configuration such
> as the backend URL.

### `VITE_API_URL` — _(required)_

|                       |                                                                                                                         |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **What it is**        | Base URL of the backend (REST API).                                                                                     |
| **Who uses it**       | `src/services/api.js` sets it as the Axios `baseURL`; `src/pages/Login.jsx` uses it for the redirect to `/auth/google`. |
| **Required**          | **Yes.** If it is undefined, `api.js` throws `Error('VITE_API_URL is not defined')` and the app won't start.            |
| **Typical dev value** | `http://localhost:3000`                                                                                                 |
| **Format**            | Absolute URL, **without** a trailing slash (services already prepend paths like `/api/...`).                            |

Example `.env`:

```dotenv
VITE_API_URL=http://localhost:3000
```

> 🐳 **Docker Compose note:** in development with Compose, the frontend bundle runs in the
> **developer's browser** (outside Docker), so `VITE_API_URL` must point to the backend port
> **exposed on the host** (e.g. `http://localhost:3000`), **not** to the internal Compose
> network hostname (e.g. `app`), which the browser cannot resolve.

### `.env` files

- **`.env.example`** — template tracked in git. It's the reference for which variables you
  need to define.
- **`.env`** (and `.env.*`) — **ignored by git** (see `.gitignore`). Each person creates
  their own locally.
- In **tests**, `VITE_API_URL` is injected directly from `vitest.config.js`, so you don't
  need a `.env` to run the suite.

---

## Available scripts

| Script                  | Command                 | Description                                            |
| ----------------------- | ----------------------- | ------------------------------------------------------ |
| `npm run dev`           | `vite`                  | Dev server with HMR (http://localhost:5173).           |
| `npm run build`         | `vite build`            | Production build to `dist/`.                           |
| `npm run preview`       | `vite preview`          | Serves the `dist/` build locally (pre-deploy check).   |
| `npm run lint`          | `eslint .`              | Runs ESLint across the project.                        |
| `npm run format`        | `prettier --write .`    | Formats the code in-place with Prettier.               |
| `npm run format:check`  | `prettier --check .`    | Verifies formatting without modifying (useful for CI). |
| `npm test`              | `vitest run`            | Runs the test suite once.                              |
| `npm run test:watch`    | `vitest`                | Tests in watch mode.                                   |
| `npm run test:coverage` | `vitest run --coverage` | Tests with a coverage report (see thresholds below).   |

---

## Project structure

```
proyecto-final-front/
├── public/                     # Static assets (favicon.svg, icons.svg)
├── src/
│   ├── components/
│   │   ├── common/             # ErrorBoundary, Loading, Toast
│   │   ├── layout/             # AppLayout, Header, Sidebar, UserMenu
│   │   ├── ui/                 # Badge, Button, Card, Modal, StatCard, TextInput, Toast
│   │   └── PrivateRoute.jsx    # Route guard (session + role)
│   ├── constants/
│   │   └── sources.js          # Source catalog (calendar, jira, drive, otro) and styling
│   ├── contexts/
│   │   ├── AuthContext.jsx     # Session provider (hydrates via GET /auth/me)
│   │   ├── auth-context.js     # Auth context definition
│   │   ├── ActivityContext.jsx # Shared activity state + selected date
│   │   └── ActivityContextDef.jsx
│   ├── hooks/                  # useAuth, useActivities, useActivityData,
│   │   │                       # useJiraConnection, useReport, useToast
│   ├── pages/
│   │   ├── Admin/              # User management (UserTable)
│   │   ├── Dashboard/          # Dashboard + components/, utils/, mocks/
│   │   ├── History/            # Report history
│   │   ├── Login.jsx           # Login screen ("Continue with Google" button)
│   │   ├── Callback.jsx        # OAuth return; confirms session and redirects
│   │   ├── Settings.jsx        # User settings
│   │   └── NotFound.jsx        # 404
│   ├── services/               # API access layer (Axios)
│   │   ├── api.js              # Base Axios instance + refresh interceptor
│   │   ├── activitiesApi.js    # Activity CRUD
│   │   ├── adminApi.js         # Administration endpoints
│   │   ├── jiraApi.js          # Jira status / auth / disconnect
│   │   ├── reportsService.js   # Reports and history
│   │   └── userSettingsApi.js  # User preferences
│   ├── styles/
│   │   └── global.css          # Tailwind import + theme (Inter font, colors)
│   ├── test/
│   │   └── setup.js            # Vitest / Testing Library setup
│   ├── utils/
│   │   ├── apiErrors.js        # Maps API error codes to human-readable messages
│   │   └── dateHelpers.js      # Date helpers
│   ├── App.jsx                 # Router + providers (Auth/Activity)
│   └── main.jsx                # Entry point (createRoot + ErrorBoundary)
├── .env.example                # Environment-variable template
├── Dockerfile                  # App image (build + vite preview)
├── eslint.config.js            # ESLint configuration (flat config)
├── vite.config.js              # Vite configuration (React + Tailwind plugins)
├── vitest.config.js            # Test and coverage configuration
├── CHANGELOG.md                # Change history (Keep a Changelog)
└── package.json
```

> Each code folder keeps its tests alongside it in `__tests__/` subfolders.

---

## Architecture

### Authentication (`HttpOnly` cookies)

The frontend does **not** handle the session token or store it in `localStorage`: the
session lives in `HttpOnly` cookies that the backend sets and manages. The flow is:

1. On `/login`, the user clicks **"Continue with Google"** and the browser is redirected to
   `${VITE_API_URL}/auth/google`.
2. The backend resolves the OAuth flow with Google, sets the session cookies and redirects
   back to `/callback?redirect=...`.
3. `Callback.jsx` calls `refreshUser()` (→ `GET /auth/me`) to confirm the session and
   navigates to the destination chosen by the backend, **validating it against an allowlist**
   (`/admin`, `/dashboard`) to prevent _open redirects_.
4. `AuthContext` hydrates the user on mount via `GET /auth/me`. `PrivateRoute` respects the
   `loading` state to avoid flashing toward the login before the session is known, and
   supports `requiredRole` to protect routes by role (e.g. `ADMIN`).

### API layer and transparent refresh

`src/services/api.js` centralizes an Axios instance with:

- `baseURL: VITE_API_URL` and `withCredentials: true` (sends/receives the session cookies
  cross-origin).
- A **response interceptor** that, on a `401`, tries `POST /auth/refresh` **once** and
  retries the original request. Concurrent refreshes are _coalesced_ into a single promise
  (no refresh storm). If the refresh fails, it redirects to `/login`.

The remaining services (`activitiesApi`, `reportsService`, etc.) import this instance, so
they all inherit that behavior.

### State

- **Session / user:** `AuthContext` (React Context).
- **Activities + selected date:** `ActivityContext`, which wraps only the protected routes
  and shares state across Dashboard, History and Settings.
- **Remote data:** `@tanstack/react-query` for caching and synchronization.

---

## Application routes

| Route        | Access              | Description                                       |
| ------------ | ------------------- | ------------------------------------------------- |
| `/`          | —                   | Redirects to `/dashboard`.                        |
| `/login`     | Public              | Google login screen.                              |
| `/callback`  | Public              | OAuth return; confirms the session and redirects. |
| `/dashboard` | Protected           | Activity dashboard for the day.                   |
| `/history`   | Protected           | Report history.                                   |
| `/settings`  | Protected           | User settings.                                    |
| `/admin`     | Protected (`ADMIN`) | User management.                                  |
| `*`          | —                   | 404 page.                                         |

---

## API consumed by the frontend

Quick reference of the backend endpoints the frontend uses (all relative to
`VITE_API_URL`):

| Domain     | Method and path                     | Service                |
| ---------- | ----------------------------------- | ---------------------- |
| Auth       | `GET /auth/google`                  | `pages/Login.jsx`      |
| Auth       | `GET /auth/me`                      | `contexts/AuthContext` |
| Auth       | `POST /auth/refresh`                | `services/api.js`      |
| Auth       | `POST /auth/logout`                 | `contexts/AuthContext` |
| Activities | `GET / POST /api/activities`        | `activitiesApi.js`     |
| Activities | `PUT / DELETE /api/activities/:id`  | `activitiesApi.js`     |
| Reports    | `GET /api/reports`                  | `reportsService.js`    |
| Reports    | `POST /api/reports/generate`        | `reportsService.js`    |
| Jira       | `GET /api/jira/status`              | `jiraApi.js`           |
| Jira       | `GET /api/jira/auth`                | `jiraApi.js`           |
| Jira       | `DELETE /api/jira/connection`       | `jiraApi.js`           |
| Admin      | `GET / POST /api/admin/users`       | `adminApi.js`          |
| Admin      | `PATCH /api/admin/users/:id`        | `adminApi.js`          |
| Admin      | `PATCH /api/admin/users/:id/status` | `adminApi.js`          |
| Settings   | `GET / PUT /api/users/me/settings`  | `userSettingsApi.js`   |

> Security notes already implemented in the frontend: `reportsService.generateReport` uses a
> 120s timeout to tolerate the backend's worst case (AI processing), and
> `jiraApi.getJiraAuthUrl` validates that the authorization URL belongs to
> `https://auth.atlassian.com` before redirecting (anti _open redirect_).

---

## Testing

Tests use **Vitest** + **Testing Library** on a **jsdom** environment. Test files live next
to the code in `__tests__/` subfolders and follow the `*.{test,spec}.{js,jsx}` pattern.

```bash
npm test              # single run
npm run test:watch    # watch mode
npm run test:coverage # with coverage report
```

The configuration (`vitest.config.js`) sets **80% coverage thresholds** for lines,
statements, functions and branches. The report is generated in `coverage/` (`text`, `html`
and `lcov` formats). Some files are excluded from coverage because they are entry points or
infrastructure (`main.jsx`, `AuthContext.jsx`, `useAuth.js`, test setup, etc.).

---

## Linting and formatting

```bash
npm run lint          # ESLint (flat config in eslint.config.js)
npm run format        # Prettier: formats in-place
npm run format:check  # Prettier: check only
```

Prettier rules (`.prettierrc`): 2-space indentation, no semicolons, single quotes. ESLint
uses the recommended JS config plus the React Hooks and React Refresh plugins.

---

## Docker

The `Dockerfile` builds the app and serves it with `vite preview` on port **80**. Since
`VITE_API_URL` is resolved at **build time**, it must be passed as a `--build-arg`:

```bash
# Build (inlines the backend URL into the bundle)
docker build --build-arg VITE_API_URL=http://localhost:3000 -t proyecto-final-front .

# Run
docker run -p 8080:80 proyecto-final-front
# The app is available at http://localhost:8080
```

> Remember that, being a build-time variable, the image is "tied" to that `VITE_API_URL`. To
> point at a different backend you must rebuild the image with a different `--build-arg`.

---

## CI/CD and branching model

### Continuous integration

On every Pull Request targeting `main` or `develop`, the **CI** workflow
(`.github/workflows/ci.yml`) runs on Node 20:

1. `npm ci`
2. `npm run lint`
3. `npm run test:coverage`
4. `npm run build`

There are also **CodeQL** (`codeql.yml`) and **security** (`security.yml`) workflows for
security analysis.

### Branching model (GitFlow)

- **`develop`** — integration branch. Features are merged here first.
- **`main`** — production/release branch.
- The **PR Branch Guard** workflow (`.github/workflows/pr-guard.yml`) **blocks** PRs to
  `main` that don't come from `release/*` or `hotfix/*`. If you're working on a feature,
  merge it to `develop` first.

Branch naming convention: `feature/*`, `fix/*`, `release/*`, `hotfix/*`.

---

## Related resources

- [`CHANGELOG.md`](CHANGELOG.md) — detailed change history per version.
- **Backend** repository — the REST API this frontend consumes (same team, separate repo).
  It's required to be running in order to use the app.
