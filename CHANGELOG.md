# Changelog

All notable changes to this project will be documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

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
