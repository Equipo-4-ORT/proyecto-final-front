# Changelog

All notable changes to this project will be documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- GitHub workflows: `ci.yml` (lint + test + build), `pr-guard.yml` (source branch check), `security.yml` (gitleaks + CHANGELOG check).
- `.github/pull_request_template.md`.
- `.gitleaks.toml` with default rules and `.env.example` allowlist.
- `CHANGELOG.md` following Keep a Changelog format.
- `noop` test script in `package.json` so CI no rompe hasta tener tests reales.

### Changed
- `.gitignore` ahora excluye `.env` y `.env.*` manteniendo `.env.example`.

### Removed

## [0.1.0] - 2026-04-15

### Added
- Setup inicial del frontend con React + Vite.
