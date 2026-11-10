# AgriMind — Mobile App

Expo React Native farmer application (TypeScript).

Offline-first: local SQLite cache plus a sync outbox. Localized in English, Filipino, and Cebuano.

## Structure

```text
screens/       one per documented screen; no business rules, no direct network calls
components/    reusable presentational units matching the design system
hooks/         screen state, form state, language (i18n)
data-access/   API client, local SQLite repository, sync queue
  ├── api/     typed requests/responses, auth header, error mapping
  ├── local/   SQLite schema, offline reads, cache writes
  └── sync/    outbox writer, replay, conflict handling
```

## Commands

```bash
npm install
npm start          # Expo dev server
npm run android
npm run ios
npx tsc --noEmit
```

## Rules

- Screens never call the network directly; all API and SQLite access lives under `data-access/`.
- TypeScript strict mode is enabled; `any` is not permitted.
- Every screen handles loading, empty, error, disabled, and offline/stale states.
- Follow the approved design tokens and prototype; do not restyle screens.
