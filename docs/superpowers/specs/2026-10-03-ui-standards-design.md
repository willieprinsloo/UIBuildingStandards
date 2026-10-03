# UIStandards — Design Spec

**Date:** 2026-10-03
**Status:** Approved (brainstorming complete)
**Author:** Willie Prinsloo + Claude

## 1. Purpose

A standalone repository that distills the proven MetaLogix ERP design system into
**generalized, reusable UI standards and copy-paste React components** for building
best-practice administration systems (ERP / CRM / dashboards) — and any other project
that wants a solid, accessible, themeable UI foundation.

Nothing in this repo is ERP-specific. The ERP's `.interface-design/system.md` (68KB,
36 themes, inventory examples) is the *source of truth* we distill from; the output is
a clean, standalone standard with two polished default themes and a documented theming
contract so other projects add their own.

### Decisions locked during brainstorming

| # | Decision | Choice |
|---|----------|--------|
| 1 | Target stack | **Framework-agnostic standards + React reference implementation** |
| 2 | Consumption | **Markdown docs + copy-paste components _and_ a Claude Code Skill wrapper** |
| 3 | Theming | **MetaLogix-branded defaults, fully themeable** |
| 4 | Brand values | Pulled from the live ERP: azure accent `#2E6BE6`, Inter + JetBrains Mono, conservative radii, 4px spacing base, full day/night |
| 5 | Component scope | **Core + data-heavy admin backbone (~20)** plus auth screens |
| 6 | Relationship to ERP `system.md` | **Distill & generalize it** into a standalone standard |
| 7 | Styling strategy | **Dependency-free TS React + CSS variables + per-component CSS**, with a Tailwind token-mapping appendix |

## 2. Consumers

Two consumption modes, both first-class:

1. **Humans / agents reading docs** — a clean `/docs` tree of principles and patterns.
2. **Agents invoking a Skill** — a `ui-standards` `SKILL.md` that tells an agent how to
   apply the tokens, theming contract, pattern docs, and component files inside any
   target repository, and how to verify the result against the accessibility checklist.

Primary target is administration systems, but the standard is written to be general.

## 3. Repository structure

```
UIStandards/
├── README.md                    # what it is, quick start, how agents consume it
├── docs/
│   ├── 00-overview.md           # philosophy, how to use, agent workflow
│   ├── foundations/
│   │   ├── design-tokens.md     # spacing, type scale, radius, z-index, motion, layout constants
│   │   ├── color-and-theming.md # generic-token contract, day/night, how to add a theme
│   │   ├── typography.md        # families, scale, weights, usage
│   │   ├── spacing-and-density.md
│   │   ├── motion.md            # durations, easing, reduced-motion
│   │   └── accessibility.md     # WCAG floors, focus, keyboard, reduced-motion (hard requirements)
│   ├── patterns/
│   │   ├── page-shell.md        # app shell, page header, width archetypes, sticky elements
│   │   ├── forms-and-validation.md
│   │   ├── data-tables.md
│   │   ├── navigation.md
│   │   ├── feedback.md          # toast / banner / empty / loading
│   │   └── auth.md              # login / change password / forgot / reset
│   └── components/              # one spec per component (anatomy, props, a11y, do/don't)
├── tokens/
│   ├── tokens.css               # structural tokens (:root) — identical across themes
│   ├── theme-dark.css           # MetaLogix default dark (derived from "precision")
│   ├── theme-light.css          # MetaLogix default light (derived from "warehouse")
│   └── tokens.json              # same values as JSON for non-CSS consumers
├── components/react/
│   ├── primitives/              # Button, Input, Select, Textarea, Checkbox, Radio, Switch, FormField, Badge
│   ├── data/                    # DataTable (sort/filter/bulk), Pagination, StatCard, EmptyState, Skeleton
│   ├── overlay/                 # Modal, Drawer, Toast, DropdownMenu, Combobox, DatePicker, CommandPalette
│   ├── layout/                  # AppShell (sidebar+topnav), PageHeader, Tabs, Breadcrumbs, Card
│   ├── auth/                    # LoginScreen, ChangePassword, ForgotPassword, ResetPassword
│   ├── theme/                   # ERP theme engine (ported): registry.ts, useTheme.ts,
│   │                            #   ThemeToggle, ThemePicker, pre-paint-snippet.md
│   └── index.ts
├── gallery/
│   └── index.html               # self-contained preview: every component, light/dark toggle
└── skills/ui-standards/
    └── SKILL.md                 # the invocable skill wrapper
```

## 4. Foundations (distilled from the ERP `system.md`)

### Structural tokens (identical across all themes; live in `:root`)
- **Spacing**: 4px base scale (`--space-0..24`).
- **Typography**: `--font-sans: Inter`, `--font-mono: JetBrains Mono`; full type scale
  (display → caption), weights, letter-spacing, line-heights, composite shorthands.
- **Radius**: conservative — `sm 4px / md 6px / lg 8px / xl 12px / full 9999px`.
- **Z-index**: documented scale (base → tooltip).
- **Motion**: easing tokens (`--ease-default/out/in`), one-shot durations
  (`fast/base/slow/slower`), loop durations (spinner/skeleton/pulse/ambient).
- **Layout constants**: topnav 56px, sidebar 240/56px, nav item 36px, input 36px.

### Theming contract (the core reuse mechanism)
Every theme file MUST export the same **generic** token names. Components reference
ONLY generic tokens, never theme primitives — so re-theming is swapping one CSS file.

Required generic tokens:
- Backgrounds: `--bg-base`, `--bg-surface-1`, `--bg-surface-2`, `--bg-surface-3`, `--bg-inset`
- Text: `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-muted`, `--text-on-accent`
- Accent: `--accent`, `--accent-hover`, `--accent-active`, `--accent-subtle`
- Status: `--success`/`--warning`/`--error`/`--info` each with a `-subtle` pair
- Borders: `--border`, `--border-subtle`, `--border-emphasis`, `--border-focus`
- Shadows: `--shadow-sm`/`-md`/`-lg`/`-xl` (dark themes may set all to `none`)

### Default theme values
- **Dark (default)**: `--bg-base #0C0D11`, surfaces `#13141A / #1A1B23 / #22232D`,
  inset `#0A0A0E`; text `#EDEDF0 / #A0A1A8 / #7D7E87 / #5C5E68`; accent azure
  `#2E6BE6` (hover `#5B8DEF`, active `#2154C4`, subtle `rgba(46,107,230,0.12)`);
  status `#34D399 / #FBBF24 / #F87171 / #60A5FA`.
- **Light (default)**: derived from the ERP "warehouse" theme (to be captured during
  implementation from `apps/frontend/src/styles/themes/warehouse.css`), satisfying the
  same contract and WCAG floors.

### Theme engine (ported from the ERP — NOT reinvented)

We port the ERP's proven theme engine verbatim (generalized, ERP-specific ids
stripped), not a simplified provider. Its moving parts:

- **`registry.ts`** — the single source of truth for theme metadata
  (`id`, `label`, `shortLabel`, `mode`, `family`, `description`, `iconName`,
  `swatch`, `sort`). Adding a theme = adding one registry entry + one CSS file;
  every consumer (hook, toggle, picker) picks it up automatically. Exposes
  `THEMES`, `THEME_IDS`, `ThemeId`, `getTheme(id)`, `themesByMode()`,
  `themesByFamily()`.
- **`useTheme()` hook** — resolves a stored `ThemePreference` (`'system'` or an
  explicit `ThemeId`) to a `ResolvedTheme`; `'system'` follows
  `prefers-color-scheme` mapped to the canonical pair (dark→default-dark,
  light→default-light); persists to `localStorage`; and writes **two**
  attributes on `<html>`: `data-theme` (the id) and `data-theme-mode`
  (dark/light, resolved from the registry). Mode-dependent CSS (scrollbars,
  image darkening) keys off `data-theme-mode` so it never enumerates theme ids.
- **Pre-paint script** — a tiny inline script for the host app's `index.html`
  that reads the persisted preference/mode and writes the attributes before
  first paint, preventing a theme/scrollbar flash. Ships as a documented
  snippet.
- **`ThemeToggle`** — quick dark/light switch.
- **`ThemePicker`** — the Linear-grade picker (trigger swatch + grouped,
  searchable popover) for apps exposing the full theme catalog.
- **CSS architecture** — structural `tokens.css` in `:root`; one CSS file per
  theme mapping theme primitives → the generic-token contract; a `global.css`
  that imports the active theme files. Documented in `color-and-theming.md`.

We ship the two canonical themes (default dark + default light) wired through
this engine. The engine scales to N themes exactly as the ERP's does (36 today),
so any project can add its own themes by following the registry checklist — no
engine changes. Day/night mode is therefore a built-in, required capability of
every app built on this standard.

### Accessibility floors (hard requirements, documented in `accessibility.md`)
- WCAG AA contrast minimums for text and UI (per the ERP's documented floors).
- Always-visible focus ring using `--border-focus`.
- Full keyboard operability for every interactive component.
- `prefers-reduced-motion` honored by all animations.

## 5. Component standard

Approach 1 — **dependency-free**. Each component is:
- One `.tsx` + a co-located `.css` using ONLY generic tokens.
- Typed props (TypeScript), sensible defaults.
- Correct ARIA roles/attributes and keyboard interaction hand-rolled.
- No runtime dependencies beyond React.

Each component also has:
- A `docs/components/<name>.md` spec: anatomy, props table, a11y notes, do/don't.
- An entry in the gallery rendered in both themes.

Reuse workflow for an agent: copy the token files once into the target project, then
copy the needed component `.tsx` + `.css` files. No build config required.

### Component catalog (~24)
- **primitives**: Button, Input, Select, Textarea, Checkbox, Radio, Switch, FormField, Badge/StatusBadge
- **data**: DataTable (**standard: column sorting + search + paging, all server-driven**; plus filter / bulk-actions), Pagination, StatCard, EmptyState, Skeleton
- **overlay**: Modal, Drawer, Toast, DropdownMenu, Combobox, DatePicker, CommandPalette
- **layout**: AppShell (sidebar + topnav), PageHeader, Tabs, Breadcrumbs, Card
- **auth**: LoginScreen, ChangePassword, ForgotPassword, ResetPassword
- **theme**: the ERP theme engine ported — `registry.ts`, `useTheme`, `ThemeToggle`, `ThemePicker`, pre-paint script snippet

### DataTable contract (server-driven by default)

The DataTable / list component is the backbone of admin systems, so its standard
behavior is fixed:

- **Column sorting**, **search**, and **paging** are built-in and enabled by default.
- **Search and paging are performed on the server** — the component is a *controlled*
  component. It does NOT fetch or filter data itself; it raises a single query-state
  object and renders whatever rows it is given.
- Sorting is server-driven for the same reason (the server returns the sorted,
  searched, paged page of rows). A documented client-side fallback is allowed for
  small, fully-loaded datasets, but server-side is the default and the documented path.

The component exposes a controlled query state and change callback, e.g.:

```ts
interface DataTableQuery {
  page: number;          // 1-based
  pageSize: number;
  sort?: { columnId: string; direction: 'asc' | 'desc' };
  search?: string;       // debounced free-text search term
}

interface DataTableProps<Row> {
  columns: ColumnDef<Row>[];
  rows: Row[];           // the current page of rows, already sorted/searched/paged by the server
  total: number;         // total matching rows across all pages — drives Pagination
  query: DataTableQuery;
  onQueryChange: (next: DataTableQuery) => void; // fires on sort / search / page change
  loading?: boolean;     // shows Skeleton rows while the server round-trips
}
```

Consuming the callback (debounced search, mapping `query` to API params, showing
`loading` during the round-trip) is documented in `docs/patterns/data-tables.md`,
including an example wired to a paginated REST endpoint (`?page=&pageSize=&sort=&q=`).

### LoginScreen layout contract (standard split-screen)

The standard sign-in layout is a two-panel split screen:

- **Left panel — description / brand (~4/5 width).** A **dark, near-black brand
  surface** (NOT a purple/accent-tinted panel) holding the product logo/wordmark, a
  headline, and a short supporting description, optionally with restrained decoration.
  This is the large, visually dominant, calm brand side.
  - **Colour:** a dedicated token `--login-brand-bg` defaulting to **near-black**
    (`#0C0D11`, the dark theme's `--bg-base`), with `--login-brand-text` as a light
    off-white for the copy and `--login-brand-text-muted` for secondary lines. The
    panel stays dark in BOTH light and dark mode — it is a fixed brand surface, not a
    themed one — so the brand reads consistently regardless of the user's theme.
  - **No purple, no accent fill.** The accent colour appears only sparingly (e.g. a
    small logo mark, a link, or a thin detail), never as the panel background.
  - **Type:** headline in `--type-display`/`--type-h1`, body in `--type-body`; generous
    whitespace; content block vertically centered or anchored with comfortable padding.
  - **Decoration (optional, subtle):** a faint low-contrast pattern, a soft radial glow,
    or a product screenshot — always quiet enough that the near-black reads as the base.
- **Right panel — login form (~1/5 width).** The actual sign-in form on a themed
  `--bg-surface-1` panel (this side DOES follow the active theme): email/username,
  password, remember-me, submit, "forgot password?" link. Narrow, focused column with a
  sensible `min-width` (so the form stays usable on very wide screens) and vertically
  centered.
- **Responsive:** below a breakpoint the panels stack — form first (or the brand
  panel collapses to a slim header) so mobile users land on the form.
- The same split-screen shell is reused for `ForgotPassword` and `ResetPassword`;
  `ChangePassword` is an in-app form (no split screen, lives inside the AppShell).

This `LoginScreen` layout is the documented default in `docs/patterns/auth.md` and
shown in the gallery. The 4/5 : 1/5 ratio is the standard; the left panel content
is a slot the consuming project fills with its own description/brand.

**Transactional email:** `ForgotPassword` / `ResetPassword` and sign-up verification
send email via **MetaMail**, the MetaLogix transactional email platform. The frontend
triggers a backend endpoint (never calling MetaMail directly with an API key); the
backend sends through MetaMail. See `docs/references/metamail.md` and the API docs at
https://metamail.metalogix.solutions/api-docs (or `/metaMailAgent`).

## 6. The Skill

`skills/ui-standards/SKILL.md` instructs an agent working in any repo to:
1. Copy/confirm the `tokens/` files are present in the target project.
2. Apply the theming contract and wire the `ThemeProvider` (day/night).
3. Follow the relevant pattern doc (page-shell, forms, tables, auth, etc.).
4. Copy the required component files.
5. Verify the result against the accessibility checklist.

Installable by linking the skill folder into `~/.claude/skills` (documented in README).
The skill is additive to the docs — it does not duplicate them, it points at them.

## 7. Gallery

A single self-contained `gallery/index.html` (inline CSS/JS, importing the token CSS)
that renders every component in both themes with a light/dark toggle. No build step, so
it opens directly in a browser for humans and agents to verify visually.

## 8. Out of scope (YAGNI)

- No npm package / build pipeline / versioning.
- No Tailwind dependency — only a token-mapping appendix for projects that use Tailwind.
- No charts / dataviz, wizard/stepper, tree view, calendar, notifications center,
  file-upload (the Option-C extras) — can be added later once the pattern proves out.
- No multi-theme catalog — two polished defaults plus the documented contract so each
  project adds its own themes.

## 9. Build sequence (for the implementation plan)

1. `tokens/` (structural + dark + light + JSON)
2. `theme/` — port the ERP theme engine (registry.ts, useTheme, ThemeToggle, ThemePicker, pre-paint snippet) + day/night wiring
3. `primitives/`
4. `layout/` (AppShell, PageHeader, Tabs, Breadcrumbs, Card)
5. `data/`
6. `overlay/`
7. `auth/`
8. `docs/` (foundations, patterns, per-component specs)
9. `gallery/index.html`
10. `skills/ui-standards/SKILL.md` + README

Component groups (3–7) are independent and are good candidates for parallel agents,
each consuming the same tokens and theming contract.
