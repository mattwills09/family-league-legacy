# Development

Local setup, verification, and deployment for the React frontend and server-side ESPN adapter.

[Architecture](architecture.md) · [ESPN Setup](espn-setup.md) · [Engineering Decisions](engineering-decisions.md)

---

## Requirements and Setup

Use Node.js 24 and npm. Node's native TypeScript support runs the current test suite without a separate test framework.

```bash
git clone https://github.com/mattwills09/family-league-legacy.git
cd family-league-legacy
npm ci
```

Copy `.env.example` to `.env.local` without overwriting an existing configuration. Add credentials privately using the [ESPN Setup](espn-setup.md) guide. The local environment file is ignored by Git. ESPN cookies must never use `VITE_` prefixes.

```bash
npm run dev
```

Open the local URL printed by Vite. Its development middleware runs `/api/standings` through the same HTTP handler used on Vercel. Restart after changing environment variables. Without a working connection, the error state offers a labeled sample dashboard.

## Commands

| Command | Purpose |
| --- | --- |
| `npm ci` | Install dependencies from the lockfile |
| `npm run dev` | Run the frontend and local ESPN API middleware |
| `npm run lint` | Check configured TypeScript and React rules |
| `npm test` | Run adapter, HTTP-boundary, and sorting tests |
| `npm run build` | Check frontend/server TypeScript settings and bundle the frontend |
| `npm run preview` | Serve the static production frontend; does not run the API |

## Verification

Before committing code changes:

```bash
npm run lint
npm test
npm run build
```

Tests use synthetic fixtures rather than live credentials. Coverage includes ESPN field mapping, missing/invalid data, safe upstream errors, HTTP method handling, and all standings columns in both directions. Sorting tests check tied records, stable ordering, and unchanged source data.

Browser verification should check real standings against ESPN, header sorting with mouse and keyboard, official ranks after reordering, team disclosures, both themes, and contained table overflow at narrow widths. Live upstream checks are separate from automated tests.

Component tests, broader accessibility checks, and automated CI checks remain [roadmap](roadmap.md) work.

## TypeScript Configuration

| File | Purpose |
| --- | --- |
| `tsconfig.app.json` | React/browser application |
| `tsconfig.node.json` | Vite configuration, server code, and tests in the local project build |
| `tsconfig.json` | Project references plus server settings read by Vercel |
| `tsconfig.api.json` | Root server settings without project references, checked by the build |

Vercel's function compiler reads the root configuration without following project references. Node types and server import settings therefore live at the root as well as in the local build setup. `rewriteRelativeImportExtensions` converts relative `.ts` imports to `.js` when server code is emitted. Generated TypeScript build-info files are ignored.

## Vercel Deployment

Connect the GitHub repository to a Vercel project using:

```text
Framework preset: Vite
Build command: npm run build
Output directory: dist
Node.js version: 24.x
```

The root `api/standings.ts` file provides the server function alongside the frontend. Configure server environment variables using [ESPN Setup](espn-setup.md). Commit and push source changes to the connected deployment branch. Redeploy after changing environment variables; existing deployments keep their previous settings.

After deployment, confirm the displayed season, real teams, standings, and scores. An unavailable-data message indicates that the server connection needs investigation; a static frontend build alone does not verify the function.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| ESPN access error | Both cookies are present, current, and associated with an account that can access the league |
| Wrong or missing season | `ESPN_LEAGUE_ID` and `ESPN_SEASON` are correct on the server |
| Local changes to variables have no effect | Restart the development server |
| Vercel variables have no effect | Select the correct target environment and create a new deployment |
| `.ts` import or missing Node type build errors | Root TypeScript settings are included in the deployed commit |
| API unavailable under `npm run preview` | Use `npm run dev` or a Vercel deployment to run the server function |

Keep cookie values out of logs, screenshots, issues, and committed files when investigating failures.
