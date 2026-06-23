# Changelog

All notable changes to this project will be documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

## [1.0.0] - 2026-06-23

Primera versión funcional completa: integración con Jira, generación de reportes
consolidados por IA, historial, configuración de usuario, ABM de usuarios para
administradores y migración de la sesión a cookies `HttpOnly`.

### Added
- **Integración con Jira (OAuth)**: `services/jiraApi.js` (`getJiraStatus`, `getJiraAuthUrl`, `disconnectJira`) con validación de que la URL de autorización pertenezca a `auth.atlassian.com`, hook `useJiraConnection.js` y componentes `JiraIntegrationCard` + `JiraCallbackBanner` en el Dashboard para conectar/desconectar la cuenta.
- **Generación de reportes consolidados por IA**: `services/reportsService.js` (`getReportByDate`, `generateReport` con timeout de 120s para tolerar el peor caso del backend, `getHistory`), hook `useReport.js` y componente `ReportView`.
- **Página de Historial de reportes** (`pages/History`): listado paginado con filtros por rango de fechas, estado persistido en query params y descarga del Excel consolidado (`xlsxUrl`).
- **Página de Configuración de usuario** (`pages/Settings`): horario laboral (inicio/fin), duración default de actividad (1–24 h) y opción de evitar solapamientos al consolidar. Servicio `services/userSettingsApi.js` (`GET/PUT /api/users/me/settings`).
- **ABM de usuarios para administradores** en `pages/Admin`: `services/adminApi.js` (listar, crear, editar, habilitar/deshabilitar), componente `Admin/components/UserTable`, filtros de búsqueda por nombre/email/rol/estado en query params y validación de formato de nombre y email.
- **`ActivityContext` + `useActivities`**: estado compartido de actividades y fecha seleccionada entre las rutas protegidas, con conteo de actividades por fuente para el sidebar.
- **`services/activitiesApi.js`**: CRUD de actividades contra el backend con filtros (`date`, `timezone`, `source`).
- **`Dashboard/utils/activityMapper.js`**: mapeo entre el modelo del backend y el del front (`apiToActivity`, construcción de payloads, updates optimistas y filtrado por fecha local).
- **Sistema de notificaciones Toast**: componentes `ui/Toast` y `common/Toast` + hook `useToast.js`.
- **`utils/apiErrors.js`**: traduce códigos de error de la API a mensajes legibles, con mensajes comunes y específicos por dominio (Jira, Admin).
- Componentes de Dashboard `EmptyState` y `StatusBadge`.
- Catálogo de fuentes ampliado: fuente `otro` ("Other"), fuente `Desconocida` como fallback y unificación de Docs/Sheets/Slides bajo `drive`.
- Dependencia `@tanstack/react-query`.
- Amplia suite de tests (Vitest) cubriendo los nuevos hooks, servicios, páginas y utilidades.

### Changed
- **Auth migrada a cookies HttpOnly**: `api.js` usa `withCredentials: true` y un interceptor de response que renueva la sesión con `POST /auth/refresh` ante un 401 y reintenta (con coalescing); se eliminó el interceptor que leía el token de `localStorage`.
- `AuthContext.jsx`: hidrata la sesión con `GET /auth/me` y expone `loading` + `refreshUser` (ya no decodifica el JWT en el cliente ni usa `localStorage`).
- `PrivateRoute.jsx`: respeta `loading` para evitar el flash de redirect-a-login antes de hidratar y soporta `requiredRole` (ej. `ADMIN`) para proteger rutas por rol.
- `App.jsx`: nuevas rutas protegidas `/history` y `/settings`; `/admin` exige rol `ADMIN`; `ActivityProvider` envuelve solo las rutas protegidas y la navegación usa `replace` para mejorar el flujo de autenticación.
- `Callback.jsx`: simplificado, ya no lee `?token=` de la URL.
- `main.jsx`: removido el import muerto de `AuthProvider`.
- `UserMenu.jsx`: simplificado: la configuración de horas dejó de vivir inline en el menú y se movió a la página `/settings`.
- `Dashboard` y sus componentes (`ActivitiesTable`, `ActivityRow`, `ActivityFormRow`, `DashboardStats`, `TimeDistributionChart`, etc.): refactor para consumir `ActivityContext`/`activityMapper`, mostrar la duración en horas, truncar descripciones largas con `…`, limitar a 24 h y calcular la productividad con la jornada real configurada.
- `Sidebar` y `Header`: refactor de layout, conteo de batches por fuente desde el context, soporte de cambio de fecha y ajuste de colores del historial.

### Removed
- Sincronización manual con Jira (jira sync) y columna "Estado" en desuso del historial y el dashboard.
- Página/objeto Profile.
- Campos de configuración de horas inline en `UserMenu` (movidos a `/settings`).

### Fixed
- Redirección de administradores a `/admin`.
- Cálculo de tiempo en Configuración: el fin de jornada no puede ser menor al inicio y la productividad usa la jornada real; duración por defecto aplicada en el backend.
- Manejo de errores restaurado en las operaciones CRUD de actividades.
- Carga de actividades desde todas las fuentes y fallback para fuentes desconocidas.
- Imagen de Google en la pantalla de Login.
- Labels de duración corregidos de minutos a horas en el Dashboard.

### Security
- El token de sesión ya no se guarda en `localStorage` ni se lee en el cliente: vive en cookies `HttpOnly` que maneja el browser (mitiga robo por XSS). Las preferencias no sensibles (`workdayHours`, `defaultActivityHours`) siguen en `localStorage`.
- `jiraApi.getJiraAuthUrl` valida que la URL de autorización sea `https://auth.atlassian.com` antes de redirigir, para evitar open redirect.

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
