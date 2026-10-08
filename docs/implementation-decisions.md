# Study and interview decision log

## Baseline inspected — October 8, 2026
- Commit: 5a2e844, main; clean working tree before this feature. Local origin/main points at the same commit; remote freshness is unverified.
- React 19, TypeScript, Vite, Lucide, custom CSS; no React Router or Supabase.
- Actual structure: components contains pages/, data/, and types/. README structure is illustrative and differs from disk.
- App owns theme state; DashboardPage consumes typed mock teams and derives standings and championship leadership.
- README specifies Vercel, npm run build, and dist. No deployment URL or deployment metadata found; live production status is unverified.

## Team details disclosure
- Add expandable details to existing legacy cards to connect current-season performance with historical achievements.
- Native details/summary provides keyboard interaction and disclosure semantics without adding dependencies or shared state.
- Use dl/dt/dd for labeled metrics and existing CSS design tokens for both themes.
- Derive standings rank from the same sorted list used by the standings display. Derive win percentage; guard zero games rather than displaying NaN.
- Show championships won as a count of appearances, guarding zero appearances. No invented seasons or historical results.
- Keep current component/data paths and architecture. Dedicated routes and persistence remain future increments.
- Interview discussion: explain derived data versus stored state, native HTML versus custom interaction logic, and incremental delivery before infrastructure expansion.

## Validation
- Run lint and production build after implementation; record results when completed.

- ESLint passed. TypeScript and Vite production build passed on October 8, 2026. Browser visual/interaction verification remains outstanding. No deployment performed.

## Product direction and branding — October 8, 2026
- Position the app as a polished league-history product that could support other leagues later. Current league identity is Pittsburgh-inspired black and gold; use original typography and styling without team logos.
- Roboto Slab gives headings a vintage sports-record character. DM Sans remains the data/body typeface; tabular numerals keep statistics aligned.
- Dark mode uses charcoal and bright gold. Light mode uses warm ivory and deeper gold for readable text. All components consume semantic CSS tokens so future league palettes can reuse the UI.
- Separate league name, product name, and description into a typed branding configuration. Header consumes this configuration rather than hard-coding this league's identity. Colors remain centralized in CSS; runtime league palette selection and branding settings are future work, not implemented multi-tenancy.
- Keep existing card layout, responsive structure, theme persistence, domain models, and disclosure feature. No routing, backend, or new UI dependencies added.
- Replace div-based standings with a semantic table, scoped headers, expanded abbreviation labels, stronger text contrast, 16px body text, tabular numbers, and larger cell padding. Horizontal overflow is supported at every width with a keyboard-focusable scroll region.
- Avoid unsubstantiated claims of historical accuracy while the application uses mock data. Use a concise, configurable league description.
- Interview discussion: distinguish reusable product presentation from league-specific configuration; explain display typography versus data legibility and semantic HTML accessibility.

## Current verification
- Live baseline verified at https://family-league-legacy.vercel.app/ on October 8, 2026. Visible mock standings and legacy metrics match the initial local milestone; exact deployed commit is unverified.
- Updated app passes ESLint and TypeScript/Vite production build.
- Browser verified light and dark themes, semantic standings, Roboto Slab font application, team disclosure showing 62.5% for Team Alpha, and a 390px mobile viewport with table overflow contained inside its scroll region.
- Updated styling and branding remain local and uncommitted; no production deployment performed.

## Tied games — October 8, 2026
- Add a required numeric ties field to FantasyTeam. Both mock teams now include one tie as sample data; these are illustrative 17-game records, not actual league history.
- Render wins-losses-ties consistently in the leader summary, standings table, and expanded team details, including a zero when no ties exist.
- Win percentage uses (wins + 0.5 * ties) / (wins + losses + ties), with the existing no-games guard. Team Alpha's 10-6-1 record yields 61.8%; Team Beta's 8-8-1 yields 50.0%.
- Preserve wins-first standings; among equal wins, more ties rank ahead before the existing point differential and points-for tiebreakers. Official league ranking rules can be configured when real data is introduced.
- Label the table record header with its wins-losses-ties meaning.
- Validation: ESLint, TypeScript/Vite build, and whitespace checks passed. Browser confirmed 10-6-1 in leader summary, standings, and expanded details, with 61.8% win percentage.

## Previous-season champion badge — October 8, 2026
- The team-card trophy identifies the previous season's champion only; all-time championship totals do not determine this badge.
- Introduce typed LeagueSeasonContext with a single nullable previousSeasonChampionTeamId referencing FantasyTeam.id. One season-level ID avoids conflicting champion flags across teams.
- Leave the champion ID null until actual league data supplies the winner. Do not infer a champion from lifetime titles or invent a season result. An unmatched ID also yields no badge.
- Compare each team's ID to the supplied champion ID. Give the trophy an accessible label and tooltip describing its meaning.
- When connecting real data, populate this field from the season immediately preceding the displayed season, not from the calendar year or all-time leader.

## Application footer — October 8, 2026
- Add a semantic, reusable Footer beneath the dashboard, with a quiet border and alignment matching the page's responsive gutters.
- Display the browser's current year and package.json version (currently v1.0.2). Enable typed JSON imports so the package version is the single source of truth.
- Use the existing secondary and muted theme tokens; version text is lighter than the year in both themes.
- Flex page layout keeps the footer at the bottom on short pages and after content on long pages without a fixed overlay.

## Dashboard section dividers — October 8, 2026
- Add semantic hr separators after the current-leader/record summary and after the standings table.
- Use the existing theme border token for subtle lines in both light and dark modes. Split the existing section gap around each divider rather than adding excessive vertical space; reduce spacing on mobile.
