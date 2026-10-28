# Roadmap

Current capabilities and intended next steps. Future items describe direction rather than delivery commitments.

[Architecture](architecture.md) · [Engineering Decisions](engineering-decisions.md)

---

## Shipped

- Current-season ESPN teams, standings, records, and scoring data through a server-side adapter
- Credentials kept server-side, validated upstream data, and sanitized error handling
- Loading, retry, and an explicit sample-dashboard fallback
- Sorting across every standings column, independent of official rank
- Expandable team details and wins-losses-ties records
- Persistent light/dark themes, responsive layouts, and semantic interactive controls
- Automated adapter, HTTP-boundary, and sorting tests
- Vercel deployment with frontend and function TypeScript checks
- Current/previous-season selection, a separate completed-season championship summary, and the preceding champion badge when identity matches

## Next: Verified League History

- Establish which seasons are available and validate historical ESPN results.
- Resolve team and owner identity across seasons, including renamed teams and ownership changes.
- Expand the initial two-season selector to older verified seasons.
- Populate playoff appearances, championship appearances, titles, and the preceding season's champion from verified results.

The first completed season establishes its championship result; lifetime totals remain unavailable until broader historical coverage and identity mapping are verified.

## Later: Navigation and Persistence

- Add dedicated team and season views; introduce routing when those pages need it.
- Define a persistence model for seasons, teams, owners, results, and import provenance.
- Evaluate Supabase/PostgreSQL for verified historical data and import workflows.
- Establish access requirements before adding private league features or write operations.

React Router, Supabase, and PostgreSQL are not implemented. Server-state or client-state libraries will be evaluated only when current requirements justify them.

## Later: Analytics and Product Expansion

- Head-to-head records, league records, and historical comparisons
- Draft and transaction history after availability and attribution are established
- Additional league branding and configuration; multi-league support requires further design
- Component tests, broader accessibility verification, and automated CI checks

Data correctness and provenance take priority over expanding the number of statistics displayed.
