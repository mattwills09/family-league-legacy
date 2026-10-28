# Family League Legacy

A fantasy football dashboard for The 12th Timers, combining live ESPN standings with a foundation for long-term league history and analytics.

[Live Application](https://family-league-legacy.vercel.app/)

---

## Overview

- Live team standings, wins-losses-ties records, and scoring statistics
- Sortable columns and expandable team details
- Current/previous-season selection, a verified historical championship summary, and the prior-season champion badge
- Persistent light and dark themes with responsive, accessible layouts
- Server-side ESPN integration with loading, retry, and a labeled sample fallback

The current and previous season are connected. Older seasons and lifetime achievements remain planned; unavailable history is clearly identified in the dashboard.

---

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, TypeScript, Vite |
| Styling | Custom CSS, CSS custom properties, Lucide React |
| Server & Data | Node.js, Vercel Functions, ESPN Fantasy API |
| Quality | ESLint, TypeScript checks, Node.js test runner |
| Deployment | Vercel, GitHub |

---

## Development

Use Node.js 24. Install dependencies and start the local app:

```bash
npm ci
npm run dev
```

Configure `.env.local` using the [ESPN setup guide](docs/espn-setup.md). Keep credentials server-side and out of version control.

```bash
npm run lint
npm test
npm run build
```

---

## Documentation

- [Architecture](docs/architecture.md) — data flow, models, components, and server boundary
- [Development](docs/development.md) — local setup, testing, deployment, and troubleshooting
- [ESPN Setup](docs/espn-setup.md) — authentication and environment configuration
- [Engineering Decisions](docs/engineering-decisions.md) — problems, decisions, and tradeoffs
- [Roadmap](docs/roadmap.md) — shipped capabilities and planned work

---

## Planned Development

Historical season views, league records, and analytics, followed by persistence with Supabase and PostgreSQL. See the [roadmap](docs/roadmap.md) for scope and sequencing.

---

## Author

**Matthew Williams** — Senior Software Engineer
