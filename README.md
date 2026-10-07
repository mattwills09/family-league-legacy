# Family League Legacy

A modern fantasy football league history and analytics application built with React and TypeScript.

Family League Legacy is designed to centralize current-season standings, long-term league history, championship records, playoff performance, and team-level analytics in a clean, responsive interface.

The project is being built as a production-style frontend application with an emphasis on reusable component architecture, strong TypeScript modeling, responsive UI design, maintainability, accessibility, and incremental full-stack expansion.

## Overview

Fantasy football leagues often accumulate years of history across spreadsheets, league platforms, group chats, and individual records. Family League Legacy provides a dedicated interface for preserving and exploring that history.

The current application includes:

- Current-season league standings
- Current league leader and record
- Points for and points against
- Point differential
- Championship leader
- Championship totals
- Championship appearances
- Playoff appearances
- All-time team highlights
- Responsive desktop and mobile layouts
- Persistent light and dark themes
- Reusable UI components
- Strongly typed league data

The application is intentionally structured so that the current mock-data implementation can later be replaced by persistent league data without requiring a major frontend rewrite.

---

## Tech Stack

### React

React provides the component model and application runtime.

The project uses functional components and React hooks for UI state and application behavior.

Current React APIs include:

```ts
import { useEffect, useState } from 'react'
```

#### `useState`

Used to manage client-side UI state, including the currently selected application theme.

```ts
const [theme, setTheme] = useState<Theme>(getInitialTheme)
```

#### `useEffect`

Used to synchronize React state with browser APIs.

The theme implementation updates the root HTML element and persists the user's preference in `localStorage`.

```ts
useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}, [theme])
```

---

### TypeScript

TypeScript provides static typing across application data, component props, and UI behavior.

League entities are modeled explicitly instead of relying on loosely structured JavaScript objects.

Example:

```ts
export interface FantasyTeam {
  id: number
  name: string
  owner: string
  wins: number
  losses: number
  pointsFor: number
  pointsAgainst: number
  pointDifferential: number
  playoffAppearances: number
  championshipsWon: number
  championshipAppearances: number
}
```

This creates a clear contract for league data and gives the application compile-time protection as features become more complex.

TypeScript is also used for component APIs.

For example, `DetailCard` accepts a Lucide icon component through the `LucideIcon` type:

```ts
import type { LucideIcon } from 'lucide-react'

interface DetailCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
}
```

---

### Vite

Vite provides the frontend development and production build tooling.

It is responsible for:

- Local development server
- Hot module replacement
- TypeScript/React development workflow
- Production asset bundling
- Optimized deployment output

Typical development commands:

```bash
npm run dev
npm run lint
npm run build
```

---

### Lucide React

Lucide React provides the application's icon system.

```bash
npm install lucide-react
```

Current icon imports include:

```ts
import {
  ChartNoAxesColumnIncreasing,
  Crown,
  Medal,
  Moon,
  ShieldCheck,
  Sun,
  Trophy,
} from 'lucide-react'
```

Icons are passed into reusable components instead of being tightly coupled to those components.

Example:

```tsx
<DetailCard
  label="Current Leader"
  value={topTeam.name}
  icon={Trophy}
/>
```

This keeps `DetailCard` generic while allowing different semantic icons depending on the data being presented.

### Current Icon Usage

- `Trophy` — current leader and championship-related information
- `ChartNoAxesColumnIncreasing` — team record and statistical performance
- `Crown` — championship leader
- `ShieldCheck` — league championship totals
- `Medal` — championship appearances
- `Sun` — switch to light mode
- `Moon` — switch to dark mode

---

### CSS

The interface uses custom CSS rather than a component framework.

This was an intentional design decision to retain full control over layout, visual hierarchy, responsiveness, and theming.

The design system uses CSS custom properties for values such as:

```css
--background
--surface
--surface-hover
--text-primary
--text-secondary
--text-muted
--border
--border-strong
--accent
--accent-soft
--danger
```

This allows components to remain theme-independent.

For example:

```css
.detail-card {
  background: var(--surface);
  color: var(--text-primary);
  border: 1px solid var(--border);
}
```

The same component automatically responds to light and dark themes without requiring separate component logic.

---

## Light and Dark Themes

Family League Legacy includes persistent light and dark modes.

The implementation combines:

- React state
- `localStorage`
- `window.matchMedia`
- CSS custom properties
- The HTML `data-theme` attribute

When no saved preference exists, the application checks the user's operating-system preference:

```ts
window.matchMedia('(prefers-color-scheme: dark)').matches
```

The resulting theme is stored as:

```ts
type Theme = 'light' | 'dark'
```

and applied to the document:

```ts
document.documentElement.setAttribute('data-theme', theme)
```

The user's selected theme persists across page refreshes through:

```ts
localStorage.setItem('theme', theme)
```

This keeps the theme implementation lightweight while maintaining a clear separation between React behavior and CSS presentation.

---

## Component Architecture

The UI is intentionally decomposed into reusable components instead of placing the entire application inside a single page component.

Current structure:

```text
src/
├── components/
│   ├── DetailCard.tsx
│   └── Header.tsx
│
├── data/
│   └── mockLeagueData.ts
│
├── pages/
│   └── DashboardPage.tsx
│
├── types/
│   └── league.ts
│
├── App.tsx
├── App.css
└── main.tsx
```

### `App.tsx`

The application root currently owns global theme state and composes the primary application structure.

Current local imports include:

```ts
import { Header } from './components/Header'
import { DashboardPage } from './pages/DashboardPage'
import './App.css'
```

It also imports:

```ts
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
```

---

### `Header.tsx`

Responsible for application-level branding and introductory context.

Keeping the header independent from the dashboard prevents page-specific logic from becoming coupled to global application chrome.

---

### `DetailCard.tsx`

`DetailCard` is a reusable summary/statistic component.

Rather than creating separate components for leader cards, championship cards, record cards, and other metrics, the component receives its presentation through props:

```ts
interface DetailCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
}
```

This allows the same component to represent multiple types of league information while keeping the visual language consistent.

---

### `DashboardPage.tsx`

The dashboard coordinates the application's current-season and historical league views.

Current imports include:

```ts
import {
  ChartNoAxesColumnIncreasing,
  Crown,
  Medal,
  ShieldCheck,
  Trophy,
} from 'lucide-react'

import { DetailCard } from '../components/DetailCard'
import { teams } from '../data/mockLeagueData'
```

Responsibilities currently include:

- Sorting standings
- Determining the current league leader
- Determining the championship leader
- Rendering current-season summary information
- Rendering league standings
- Rendering historical league summaries
- Rendering team-level legacy statistics

---

## Derived Data

The dashboard avoids duplicating values that can be calculated from the existing data set.

For example, league standings are derived from team data:

```ts
const sortedTeams = [...teams].sort((a, b) => {
  if (b.wins !== a.wins) {
    return b.wins - a.wins
  }

  if (b.pointDifferential !== a.pointDifferential) {
    return b.pointDifferential - a.pointDifferential
  }

  return b.pointsFor - a.pointsFor
})
```

The current leader can then be selected directly from the sorted result:

```ts
const topTeam = sortedTeams[0]
```

Championship leadership is calculated separately:

```ts
const championshipLeader = [...teams].sort((a, b) => {
  if (b.championshipsWon !== a.championshipsWon) {
    return b.championshipsWon - a.championshipsWon
  }

  return b.championshipAppearances - a.championshipAppearances
})[0]
```

This keeps source data normalized and derives display-specific values in the application layer.

---

## Dashboard Layout

The dashboard currently follows three primary information tiers.

### Current Season Summary

The top-level summary highlights:

- Current leader
- Current leader record

### League Standings

The standings view includes:

- Rank
- Team
- Owner
- Record
- Points For
- Points Against
- Point Differential

Standings currently prioritize:

1. Wins
2. Point differential
3. Points scored

### All-Time Highlights

Historical summary cards include:

- Championship leader
- League titles
- Championship appearances

Individual team legacy cards include:

- Championships
- Championship appearances
- Playoff appearances

This separates current-season performance from historical league achievements.

---

## Responsive Design

The application was designed for responsive behavior rather than desktop-only presentation.

The layout adapts across several breakpoints.

Desktop layouts use multi-column CSS Grid structures for summary cards and historical statistics.

At narrower widths, grids progressively collapse until the application reaches a single-column mobile presentation.

The standings table supports horizontal overflow on smaller devices so league statistics remain readable without compressing columns into unusable widths.

---

## Accessibility Considerations

Current accessibility considerations include:

- Semantic HTML elements
- Actual `<button>` elements for interactive controls
- Theme-toggle `aria-label`
- Keyboard focus styling
- Responsive typography
- High-contrast theme variables
- Icons used alongside textual labels instead of as the sole source of meaning

Accessibility will continue to be evaluated as navigation and interactive features are added.

---

## Data Model

Current development uses typed mock data stored separately from the UI.

```ts
import type { FantasyTeam } from '../types/league'
```

This separation is intentional.

The UI consumes the `FantasyTeam` contract without needing to know whether the underlying data originated from:

- Static development data
- PostgreSQL
- Supabase
- A REST API
- A third-party fantasy football API

That boundary will make migration to persistent data significantly cleaner.

---

## Code Quality

The project uses ESLint for static code analysis.

```bash
npm run lint
```

Linting helps identify issues including:

- Unused imports
- Unused variables
- Invalid React Hook patterns
- Suspicious JavaScript/TypeScript constructs
- Violations of configured project rules

The production build can be verified with:

```bash
npm run build
```

Before major commits, the intended verification workflow is:

```bash
npm run lint
npm run build
```

A dedicated TypeScript type-check command may also be added as the project expands.

---

## Development

Clone the repository:

```bash
git clone https://github.com/mattwills09/family-league-legacy.git
```

Enter the project:

```bash
cd family-league-legacy
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Run linting:

```bash
npm run lint
```

---

## Deployment

The application is designed to be deployed through Vercel.

The current frontend deployment configuration uses:

```text
Framework: Vite
Build command: npm run build
Output directory: dist
```

Connecting Vercel directly to the GitHub repository enables subsequent production deployments to be created from repository updates.

---

## Engineering Decisions

Several implementation decisions are intentional.

### Reusable Components Over Page-Specific Markup

Shared presentation patterns such as dashboard statistics are represented through reusable components instead of repeated markup.

This reduces duplication and makes visual changes easier to apply consistently.

### Typed Domain Models

Fantasy league entities are represented as TypeScript interfaces rather than untyped objects.

This allows the domain model to evolve safely as backend persistence, seasons, matchups, owners, and additional analytics are introduced.

### Derived State Over Duplicated State

Values such as standings and league leaders are calculated from the source team data instead of being independently stored.

This reduces synchronization problems and keeps the data model easier to reason about.

### CSS Variables for Theming

Theme differences are implemented through design tokens rather than separate component styles.

This provides a lightweight theming system while maintaining strong separation between UI logic and presentation.

### Incremental Architecture

The application is being built in phases.

The frontend architecture and domain model are being established before introducing persistence and additional infrastructure.

This provides a stable UI foundation while avoiding unnecessary complexity during early development.

---

## Planned Development

Future iterations are expected to include:

- React Router navigation
- Dedicated team pages
- Historical season views
- Head-to-head records
- League records and achievements
- Supabase integration
- PostgreSQL persistence
- TanStack Query for server-state management
- Custom React hooks
- Historical analytics
- Additional derived statistics
- Automated component and application testing
- Accessibility testing
- CI/CD enhancements
- Expanded responsive navigation

State-management libraries such as Zustand or Redux Toolkit will only be introduced if application complexity creates a genuine need for shared client-side state.

---

## Planned Data Architecture

The current mock dataset will eventually be replaced with persistent data.

The likely architecture is:

```text
React / TypeScript
        ↓
TanStack Query
        ↓
Supabase
        ↓
PostgreSQL
```

The frontend will continue to depend on typed application models rather than directly coupling individual components to database implementation details.

---

## Testing Strategy

Automated testing is planned using:

- Vitest
- React Testing Library

Testing will focus on user-visible behavior and business logic rather than implementation details.

Expected coverage includes:

- Component rendering
- Theme behavior
- Standings calculations
- Sorting and ranking
- Historical statistics
- User interactions
- Accessibility-sensitive behavior

---

## AI-Assisted Development

AI-assisted development tools are being used selectively during implementation for tasks such as:

- Architectural brainstorming
- Component scaffolding
- Type modeling
- Refactoring
- CSS iteration
- Debugging
- Test-case generation
- Documentation
- Accessibility review

Architecture, implementation decisions, validation, integration, and final code ownership remain developer responsibilities.

The goal is to use AI as an engineering productivity tool while maintaining deliberate technical judgment and understanding of the resulting implementation.

---

## Project Goals

Family League Legacy serves two purposes.

First, it is a practical application for preserving and exploring the history of a long-running fantasy football league.

Second, it serves as a production-style React engineering project demonstrating experience with:

- React
- TypeScript
- Component architecture
- UI/UX development
- Responsive layouts
- State management
- Browser APIs
- Derived application data
- Domain modeling
- Theming
- Accessibility
- Testing
- API integration
- Database-backed applications
- Modern frontend deployment practices

The long-term objective is a maintainable full-stack application rather than a static portfolio demo.

---

## Author

**Matthew Williams**

Senior Software Engineer focused on modern frontend architecture, TypeScript, component-based application development, full-stack systems, and product-oriented engineering.