# Changelog

All notable changes to this project will be documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Changed
- **Auth migrada a cookies HttpOnly**: `api.js` usa `withCredentials: true` y un interceptor de response que renueva la sesión con `POST /auth/refresh` ante un 401 y reintenta (con coalescing); se eliminó el interceptor que leía el token de `localStorage`.
- `AuthContext.jsx`: hidrata la sesión con `GET /auth/me` y expone `loading` + `refreshUser` (ya no decodifica el JWT en el cliente ni usa `localStorage`).
- `PrivateRoute.jsx`: respeta `loading` para evitar el flash de redirect-a-login antes de hidratar.
- `Callback.jsx`: simplificado, ya no lee `?token=` de la URL.
- `main.jsx`: removido el import muerto de `AuthProvider`.

### Security
- El token de sesión ya no se guarda en `localStorage` ni se lee en el cliente: vive en cookies `HttpOnly` que maneja el browser (mitiga robo por XSS). Las preferencias no sensibles (`workdayHours`, `defaultActivityHours`) siguen en `localStorage`.

## [0.3.0] - 2026-05-17

### Added
- Flujo de autenticación completo: `AuthContext.jsx`, `useAuth.js`, `PrivateRoute.jsx` y página `Callback.jsx` con manejo de OAuth callback y almacenamiento de JWT.
- Dashboard responsive con CRUD de actividades: componentes `ActivitiesTable`, `ActivityFormRow`, `ActivityMobileCard`, `ActivityRow`, `DashboardStats`, `SourceSummary` y `TimeDistributionChart`.
- Componentes UI reutilizables: `Badge`, `Button`, `Card`, `Modal`, `StatCard` y `TextInput`.
- Componentes de layout: `AppLayout`, `Header`, `Sidebar` y `UserMenu`.
- Componentes comunes `ErrorBoundary` y `Loading`.
- `constants/sources.js` con catálogo de fuentes de actividades.
- Utilidades: `dateHelpers.js`, `activityValidation.js` y `dashboardCalculations.js`.
- Suite completa de tests unitarios con Vitest (`vitest.config.js`, `src/test/setup.js`) cubriendo todos los componentes, páginas, servicios y utilidades.
- `.prettierrc` y `eslint.config.js` para formateo y linting consistente.

### Changed
- `App.jsx`: routing actualizado con rutas protegidas (`PrivateRoute`) y nueva estructura de navegación.
- `main.jsx`: setup actualizado con `AuthProvider`.
- `Login.jsx`: refactor del flujo de login para integrar con el nuevo `AuthContext`.
- `Dashboard.jsx`: refactor completo hacia diseño responsive con CRUD de actividades.
- `global.css`: estilos actualizados para soportar el nuevo layout.
- `vite.config.js`: configuración actualizada.
- `.env.example` y `.gitleaks.toml`: reglas y variables de entorno ajustadas.
- Workflows de CI: ajustes menores en `ci.yml` y `security.yml`.

### Fixed
- Errores de lint en `AuthContext`.
- Flujo completo de login/callback/routing luego de refactors.

### Removed
- Validación de JWT en el frontend — responsabilidad delegada al backend.

## [0.2.0] - 2026-05-02

### Added
- GitHub workflows: `ci.yml` (lint + test + build), `pr-guard.yml` (source branch check), `security.yml` (gitleaks + CHANGELOG check), `codeql.yml` (análisis estático de seguridad).
- `.github/pull_request_template.md`.
- `.gitleaks.toml` with default rules and `.env.example` allowlist.
- `CHANGELOG.md` following Keep a Changelog format.
- `noop` test script in `package.json` so CI no rompe hasta tener tests reales.
- Estructura base del frontend con React Router: páginas y routing setup (`Login`, `Dashboard`, `Admin`, `NotFound`).
- Integración con API via Axios (`src/services/api.js`): valida `VITE_API_URL` al arrancar e inyecta automáticamente el Bearer token desde `localStorage` en cada request.
- Scaffolding de autenticación: `src/contexts/AuthContext.jsx` y `src/hooks/useAuth.js` (estructura creada, implementación pendiente).
- Docker + nginx: `Dockerfile`, `.dockerignore` y configuración de servidor estático.

### Changed
- `.gitignore` ahora excluye `.env` y `.env.*` manteniendo `.env.example`.
- `pr-guard.yml`: solo acepta PRs a `main` desde `release/*` o `hotfix/*` (antes también permitía `develop`).

### Removed
- `.env` desregistrado del repo (antes trackeado con `VITE_API_URL=` vacío) — ahora local-only vía `.gitignore`. No se reescribe historia porque nunca contuvo secrets reales.
- Archivo Docker sin uso eliminado.

## [0.1.0] - 2026-04-15

### Added
- Setup inicial del frontend con React + Vite.
