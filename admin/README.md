# AgriMind — Admin Dashboard

React + Vite + TypeScript web console for agricultural administrators.

Online-only and English-only. Talks to the AgriMind API at `VITE_API_BASE_URL`.

## Structure

```text
src/pages/        one per admin screen (Dashboard, Users, Knowledge Base, Announcements, Audit Logs)
src/components/   tables, filters, modals, DNF rule builder primitives
src/api/          typed client for /api/v1/admin/*
```

## Commands

```bash
npm install
npm run dev       # http://localhost:5173
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

## Rules

- All API communication lives in `src/api/`, never inline in components.
- TypeScript strict mode is enabled; `any` is not permitted.
- Match the approved design tokens in the design system; do not restyle screens.
