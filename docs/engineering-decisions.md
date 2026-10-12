# Engineering Decisions

Key tradeoffs behind the current implementation. This document describes the resulting architecture rather than a chronological work log.

[Architecture](architecture.md) · [Development](development.md) · [Roadmap](roadmap.md)

---

## Server-Side ESPN Adapter

**Problem:** Private ESPN leagues require authentication cookies, and their response format should not become the dashboard's domain model.

**Decision:** Fetch ESPN from a server endpoint, validate the response, and return whitelisted fields as `LeagueDashboardData`. Reuse one handler in Vercel and local Vite middleware. Store cookies only in server environment variables.

**Tradeoff:** The application now depends on a server function and an unofficial upstream API. Cookies can expire, so configuration and sanitized error states are necessary. The public endpoint exposes normalized standings, while access control remains a separate future requirement.

## Explicit Unknown History

**Problem:** Current-season standings do not prove all-time achievements or the previous season's champion.

**Decision:** Make historical numeric fields nullable and display unavailable states. Leave `previousSeasonChampionTeamId` null until the preceding season result is supplied.

**Tradeoff:** Historical layouts appear incomplete during this milestone, but unknown values cannot be confused with zero titles or verified history. Future import logic must populate these fields deliberately.

## Official Rank Separate from Table Sorting

**Problem:** Sorting by owner, score, or team name must not change the league leader or imply new standings ranks.

**Decision:** Derive official rank from complete ESPN playoff seeds, with the existing ranking rules as a fallback. Keep a separate table sort state and preserve rank labels, leader highlighting, and detail-card ranks.

**Tradeoff:** The dashboard maintains two orderings, but each has a clear meaning. Local sorting uses no additional requests and does not mutate source data. Equal column values retain official rank order.

## Numeric Records Including Ties

**Problem:** Record strings sort incorrectly as text, and tied games need consistent treatment across the interface.

**Decision:** Render wins-losses-ties everywhere and calculate win percentage as `(wins + ties / 2) / games`, guarding zero games. Sort Record by percentage, then wins, losses, and ties.

**Tradeoff:** Record sorting measures performance rather than comparing the visible string or reproducing ESPN's official ranking. The Rank column remains the authoritative league order.

## Explicit Sample Fallback

**Problem:** Replacing a failed live request silently with sample results could mislead users.

**Decision:** Offer retry and an opt-in sample dashboard with a visible label. Keep mock teams and achievements separate from real ESPN teams.

**Tradeoff:** Users take an extra action during a failure, but the interface stays useful without presenting fabricated results as live data.

## Native Accessible Controls

**Problem:** Sorting, details, and wide statistics need usable keyboard and screen-reader behavior without unnecessary dependencies.

**Decision:** Use semantic table headers, native buttons, `aria-sort`, a focusable overflow region, and `details`/`summary` disclosures. Display metric labels with definition lists.

**Tradeoff:** Native controls provide a practical accessibility foundation while limiting bespoke interaction styling. Broader accessibility testing remains necessary as the product grows.

## Theme Tokens and League Branding

**Problem:** The product needs a distinctive identity while keeping data legible and allowing later reuse for other leagues.

**Decision:** Use shared semantic CSS tokens, Roboto Slab display typography, DM Sans body text, and tabular numerals. Keep league identity in `leagueBranding.ts`, apart from statistics and reusable components. Persist theme preference in browser storage.

**Tradeoff:** Custom CSS requires maintaining the design system directly. Separating identity supports reuse, but does not implement multi-tenancy or runtime branding settings.

## Incremental Infrastructure

**Problem:** History, navigation, and persistence could add substantial complexity before their data requirements are established.

**Decision:** Connect current-season data through the existing model and UI first. Defer React Router, Supabase, PostgreSQL, and additional state libraries until a feature needs them.

**Tradeoff:** The current app has no persistent league history or dedicated routed team pages. The smaller architecture makes current behavior easier to validate and avoids speculative infrastructure.

## Deployment-Aware TypeScript Checks

**Problem:** Local project-reference checks passed while Vercel's separate function compiler failed on missing Node types and `.ts` import settings.

**Decision:** Put required server compiler options in the root configuration and add `tsconfig.api.json` to the regular build. Enable emitted import-extension rewriting while preserving native TypeScript tests.

**Tradeoff:** There is an additional configuration to maintain. It makes deployment assumptions explicit, though successful deployment and runtime verification are still separate from local checks.
