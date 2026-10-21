# Repository Guidelines

## Project overview

Family League Legacy is a React, TypeScript, and Vite fantasy-football dashboard. The browser gets standings from `/api/standings`; the server-side ESPN adapter validates and normalizes upstream data before returning it to the UI.

## Project layout

- `src/` — React application, domain types, components, styles, and hooks.
- `server/` — ESPN client and shared standings HTTP handler.
- `api/` — Vercel function entry point.
- `tests/` — Node.js tests for the adapter, HTTP handler, and sorting.
- `docs/` — Architecture, development, ESPN setup, engineering decisions, and roadmap documentation.
- `README.md` — Root-level project entry point and links to the detailed documentation.

Keep detailed project documents in `docs/`. Keep `AGENTS.md` at the repository root so coding agents can discover these instructions, and keep `README.md` at the root as the standard repository landing page.

## Development and verification

Use Node.js 24 and npm. Install dependencies with `npm ci`. Available commands:

```bash
npm run dev
npm run lint
npm test
npm run build
```

Run the relevant checks for each change; before completing a change that affects application code, run lint, tests, and the production build when practical. Tests use synthetic data and should not require live ESPN credentials.

## Implementation guidance

- Preserve the boundary between ESPN response data and the typed dashboard domain model. Validate and normalize upstream data in `server/`; do not expose raw ESPN payloads to the browser.
- Keep official standings rank separate from local table sorting.
- Represent unknown historical data as unavailable (`null`), not as fabricated zeroes or sample achievements.
- Use the existing React, TypeScript, CSS, and Node test patterns. Avoid adding dependencies unless a requirement calls for them.
- Keep documentation in `docs/` current when changing documented behavior, configuration, or development workflows.

## Credentials and data handling

- ESPN cookies (`ESPN_S2` and `ESPN_SWID`) are server-only environment variables. Never use `VITE_` prefixes, commit credentials, or include their values in logs, tests, screenshots, or documentation.
- Do not add authentication secrets or other private league data to source control.
- The standings endpoint is publicly readable; do not imply the dashboard has access control.
