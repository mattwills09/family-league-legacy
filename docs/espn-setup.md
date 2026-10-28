# Current-season ESPN connection

[Architecture](architecture.md) · [Development](development.md) · [Engineering Decisions](engineering-decisions.md)

The dashboard requests `/api/standings` on its own origin. A Vercel Node function fetches ESPN and normalizes its response into `FantasyTeam` objects. Local `npm run dev` serves the same handler through Vite middleware. No React Router or Supabase is required.

## Local setup

1. Use Node 24 (the tests use native TypeScript support).
2. Copy `.env.example` to `.env.local` if that file does not already exist. The initial integration prepares it with league `684618` and season `2026` and blank credentials.
3. Sign into ESPN in your own browser and open your fantasy league. In browser developer tools, open Application / Storage > Cookies for ESPN. Copy the values of `espn_s2` and `SWID` into `ESPN_S2` and `ESPN_SWID` in `.env.local`. Keep the SWID braces if present. Do not paste these values into chat, commit them, or prefix them with `VITE_`. Do not enter your ESPN password.
4. Restart `npm run dev` after editing environment variables. Open the local Vite URL.
5. Confirm the ESPN season label, team names, W-L-T records, and points against the ESPN standings page. Use another season by changing `ESPN_SEASON` explicitly.

Local integration was verified with 12 teams and a complete ESPN seed order. Credentials were not displayed or copied into source files. The deployed connection was subsequently confirmed working after the Vercel TypeScript configuration fix.

## Vercel setup

Set `ESPN_LEAGUE_ID`, `ESPN_SEASON`, `ESPN_S2`, and `ESPN_SWID` in this project's Vercel environment settings for the environments that should connect to ESPN. Store credentials as Secret variables (Sensitive in older interfaces). Redeploy after changing settings; local `.env.local` is never deployed. Vercel serves `api/standings.ts` as a Node function alongside the Vite app.

The public dashboard exposes normalized team names, owner names, records, and scores. It does not expose ESPN cookies, member email addresses, rosters, raw responses, or transaction data. If league standings need access control, implement that before adding private views.

`npm run preview` is a static production preview and does not run the API; use `npm run dev` for local integration or a Vercel preview deployment for deployment verification.

## Behavior and limits

- ESPN is an unofficial upstream integration, with no guaranteed stable API. Authentication cookies may expire; replace them privately and restart/redeploy.
- ESPN IDs are preserved. The adapter handles current `name` and older `location` / `nickname` fields, and resolves co-owners from member IDs without publishing member records.
- W-L-T and points use `record.overall`. Missing records fail validation rather than becoming fictitious zeroes. Genuine zero records remain valid.
- Complete, unique ESPN playoff seeds provide standings order. When seeds are unavailable, the existing wins, ties, differential, points-for sort is retained.
- Historical achievement fields remain nullable; one completed season does not establish lifetime totals. The selector offers the configured year and its predecessor. A completed winners-bracket final establishes the historical championship result and the current year's prior-champion badge when owner IDs match.
- The browser shows loading, error, retry, and an explicitly labeled sample-dashboard fallback. Live standings never mix with mock all-time achievements. No automatic polling or credential persistence in the browser.
- Only a fixed ESPN host and configured league are called. The optional season query is restricted to the configured year and its predecessor. Each upstream request times out after 12 seconds and refuses redirects. Error bodies are sanitized, and responses use `Cache-Control: no-store`.

## Validation

Run `npm test`, `npm run lint`, and `npm run build`. Tests use synthetic fixtures and never depend on private credentials or real league activity. Live verification and Vercel deployment verification remain separate steps.

Implementation references: [ESPN client request implementation](https://github.com/cwendt94/espn-api/blob/master/espn_api/requests/espn_requests.py), [team field mapping](https://github.com/cwendt94/espn-api/blob/master/espn_api/football/team.py), [Vercel Node functions](https://vercel.com/docs/functions/runtimes/node-js), [Vite server middleware](https://vite.dev/guide/api-plugin.html#configureserver).
