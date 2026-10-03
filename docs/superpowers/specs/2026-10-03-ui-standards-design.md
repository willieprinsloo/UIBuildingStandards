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

### Component catalog (~34 core; see the coverage map below for the full admin picture)
- **primitives**: Button, Input, Select, Textarea, Checkbox, Radio, Switch, FormField, Badge/StatusBadge, FileUpload (drag-drop + progress)
- **data**: DataTable (**standard: column sorting + search + paging, all server-driven**; plus filter / bulk-actions), Pagination, StatCard, EmptyState, Skeleton
- **overlay**: Modal (+ ConfirmDialog usage), Drawer, Toast, DropdownMenu, Tooltip, Popover, Combobox, DatePicker, CommandPalette, NotificationsCenter
- **layout**: AppShell (sidebar + topnav), PageHeader, Tabs, Breadcrumbs, Card, DescriptionList (record fields), Stepper/Wizard
- **auth**: LoginScreen, ChangePassword, ForgotPassword, ResetPassword
- **theme**: the ERP theme engine ported — `registry.ts`, `useTheme`, `ThemeToggle`, `ThemePicker`, pre-paint script snippet
- **dataviz**: themed chart wrappers (line / bar / area / pie), Sparkline, + dashboard composition guidance (follows the `dataviz` palette & a11y rules)

### Administration site layout contract (AppShell — ERP default)

Every administration site built on these standards uses the **same shell as the
MetaLogix ERP**. This is the compliance baseline — deviations require explicit
justification. It lands as code in Phase 3 (`AppShell`, `PageHeader`); documented here
so it is built right.

**Overall structure** — three regions:
- A **top nav bar** spanning the full width, height `--topnav-height` (56px).
- A **vertical left sidebar** (the primary site menu) below the top nav, width
  `--sidebar-width-expanded` (240px) when expanded, `--sidebar-width-collapsed` (56px,
  icons only) when collapsed.
- A **scrollable content region** to the right of the sidebar, holding the page shell.

**Vertical site menu (left sidebar) — the standard navigation:**
- **One continuous surface** — the sidebar uses the SAME background as the page
  (`--bg-base`), separated only by a single `--border-emphasis` line on its right edge.
  No differently-coloured sidebar block (a colour block fragments the UI into two zones;
  structure comes from borders + spacing, not colour).
- **Nav items** — `--nav-item-height` (36px) each, icon-forward: a 20px icon + label,
  with `--space-3` left padding.
- **Active item** — a **2px left border in `--accent`**, an `--accent-subtle` background,
  and `--accent` text. (Exactly one active item reflects the current route.)
- **Sections** — grouped with muted section labels (caption size, uppercase, tracked —
  the eyebrow style).
- **Bottom section** — user avatar, settings, and logout, separated from the nav list by
  a border.
- **Collapse** — a chevron button at the sidebar bottom toggles expanded/collapsed; the
  sidebar **auto-collapses below 1024px**. Collapsed state shows icons only (labels become
  tooltips).

**Menu grouping (how the sidebar is organised):**
- **Groups = labelled sections.** Related nav items are organised into groups, each with a
  muted uppercase/tracked **section label** (eyebrow style). Groups are separated by spacing
  (and, where it aids scanning, a subtle divider).
- **Ordering convention (top → bottom):**
  1. A single **primary/overview item** (e.g. Dashboard/Home) at the very top, *ungrouped*.
  2. **Functional groups** in order of importance / daily use — typically one group per
     domain or module (e.g. *Sales*, *Inventory*, *Purchasing*, *Reports*). Order groups by
     how often they're used, most-used first.
  3. A **bottom/account section** (user, settings, logout), pinned to the bottom and
     separated by a border — this is always last.
- **When to group:** group once a flat list gets hard to scan (rule of thumb: **> ~7
  items**, or whenever there are clear domains). Small apps may stay flat (no section
  labels) — that's allowed; don't invent groups for 3–4 items.
- **Group size:** aim for **~3–7 items per group**; if a group grows beyond that, split it or
  promote it to its own area. Avoid single-item groups (just leave the item ungrouped).
- **Nesting / sub-menus:** prefer **flat groups**. At most **one level** of expandable
  sub-items under a parent item, for a module with many pages — never deeper. Use *either*
  section grouping *or* expandable parents for a given area, consistently, not both at once.
  An expandable parent shows a chevron, remembers open/closed state, and marks the parent as
  active when a child route is active.
- **Collapsed sidebar (≤1024px or manual):** section **labels are hidden**; groups are shown
  as icon clusters separated by a divider/extra spacing, labels become tooltips. Expandable
  parents open as a flyout popover rather than inline.
- **Badges:** a nav item may carry a count/status badge (e.g. unread) right-aligned; keep it
  subtle and token-driven.

**Account / user section (pinned to the sidebar bottom):**
- **Placement** — always the last block in the sidebar, pinned to the bottom and separated
  from the nav groups by a border. Present on every admin screen.
- **Trigger** — the user's **avatar** (image, or initials fallback on an `--accent`/neutral
  circle) + **display name**, with a secondary line (email, role, or active org/tenant) in
  `--text-secondary`. A chevron hints it opens a menu. In the collapsed sidebar only the
  avatar shows.
- **Opens a user menu** — a `DropdownMenu` (overlay component, Phase 5) that opens **upward**
  from the trigger (a flyout popover when the sidebar is collapsed). Full menu a11y:
  `role="menu"`/`menuitem`, arrow-key navigation, `Escape` closes and returns focus, visible
  focus rings.
- **Standard menu contents (in this order):**
  1. **My profile / account** — view/edit the user's own profile.
  2. **Settings** — app/account settings (or the settings area entry if app-wide).
  3. **Appearance / theme** — quick theme control; may embed the `ThemeToggle` or link to a
     fuller appearance page (`ThemePicker`).
  4. *(optional)* **Organisation / workspace switcher** — for multi-tenant apps, switch the
     active org/tenant.
  5. *(optional)* **Help & support / docs / keyboard shortcuts.**
  6. — divider —
  7. **Log out** — **always last**, visually distinct (treated as a destructive/strong
     action). Logs out immediately; if there is unsaved work, confirm first.
- **Model** — the account section is configured separately from `nav` (it is not a
  `NavGroup`), e.g. an `account: { user: {...}, items: NavItem[] }` passed to `AppShell`,
  so `Log out` and the switcher can carry their own handlers rather than plain routes.

**Nav configuration shape** (drives `AppShell`, Phase 3 — data, not markup):

```ts
interface NavItem {
  label: string;
  icon: string;          // icon name (resolved by the host, like the theme registry)
  to: string;            // route
  badge?: number | string;
  children?: NavItem[];  // at most one level deep
}
interface NavGroup {
  label?: string;        // omitted → ungrouped (e.g. the top Dashboard item, or a flat menu)
  items: NavItem[];
}
// AppShell receives `nav: NavGroup[]` plus a bottom/account section; it renders the grouping,
// active state, collapse, and (if present) one level of expandable children.
```

**Top nav bar:** brand/logo or page/breadcrumb context on the left; global actions on the
right (e.g. search, `ThemeToggle`/`ThemePicker`, notifications, user menu).

**Page shell (inside the content region):** `.page` uses padding `--space-6 --space-8`
(24px/32px), `display:flex; flex-direction:column; gap:--space-6` (24px), `min-height:0`
(so scrolling children work). Tighten to `--space-4` padding + gap at ≤640px. Inside it:
a **PageHeader** (title in `--type-h1` + optional subtitle in `--text-secondary`, with a
right-aligned actions cluster; stacks to a column at ≤640px), then an optional toolbar,
then the main content.

**Page width archetypes** — exactly three sanctioned treatments (anything else is drift):
1. **Full-width list/detail** — NO `max-width` on `.page` (list pages, hubs, detail pages).
2. **Left-aligned wizard/form** — `max-width: calc(960px + var(--space-8)*2)`, no auto margin.
3. **Centered narrow tool/document** — `max-width:<N>px; margin:0 auto; width:100%`.

Never ship `max-width` WITHOUT `margin:0 auto` on a `.page` root (it leaves a left-stuck
column). When a page mixes a form with a primary list, the list wins — full-width.

Documented in `docs/patterns/page-shell.md` and `docs/patterns/navigation.md`; shown in
the gallery and exercised by the demo app.

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

### Admin-system coverage map (completeness checklist)

So nothing an administration system typically needs is silently missed, this is the full
map of admin capabilities to how the standard covers them. **In scope** = shipped or
planned in a phase; **Pattern** = documented usage/composition (often of existing
components), not a new component; **Opt-in** = available on request, not built by default.

**Navigation & shell**
- App shell (top nav + vertical sidebar + content) — ✅ Phase 3 (AppShell).
- Vertical site menu with grouping — ✅ Phase 3 (see menu-grouping standard).
- Account/user section (profile, settings, logout, org switcher) — ✅ Phase 3.
- Breadcrumbs, Tabs, PageHeader, Card — ✅ Phase 3.
- Global search / command palette — ✅ Phase 5 (CommandPalette).
- Keyboard shortcuts + shortcuts help — Pattern (CommandPalette + a shortcuts overlay).

**Forms & data entry**
- Inputs: text, Textarea, Select, Checkbox, Radio, Switch, FormField, Badge — ✅ Phase 2.
- Combobox/autocomplete, DatePicker — ✅ Phase 5.
- Form layout + **validation** (required/error/inline help, field groups) — Pattern
  (`forms-and-validation.md`, Phase 7) over Phase 2 primitives.
- **Dirty-state / unsaved-changes guard** on forms — Pattern (Phase 7).
- Record **create** (quick-create modal + full form page) and **edit** — Pattern
  (record patterns, Phase 7; mirrors the ERP Record Creation Pattern).
- **File upload / attachments** (drag-drop, progress, type/size validation) — ✅ Phase 2.
- Multi-step **wizard / stepper** — ✅ Phase 3.

**Data display**
- DataTable (server-driven sort/search/paging + filter + bulk actions + row selection) —
  ✅ Phase 4.
- Pagination, StatCard/KPI, EmptyState, Skeleton — ✅ Phase 4.
- **Filter bar + saved views / column visibility + density toggle** — Pattern over DataTable
  (`data-tables.md`, Phase 4/7).
- **Record detail / read view** + **DescriptionList** (key-value record fields) — Pattern
  (+ a small DescriptionList), Phase 3/7.
- Tags/chips — covered by Badge + a chip usage Pattern.
- **Charts / dataviz** — ✅ Phase 8 (chart wrappers + dashboard guidance, following the
  `dataviz` palette/accessibility rules, themed via the generic tokens).
- **Tree view**, **calendar/scheduling** — **Opt-in** (add on request).
- Import/export (CSV) — **Opt-in**, but now composes the in-scope Wizard + FileUpload.

**Overlays, feedback & status**
- Modal, Drawer, Toast, DropdownMenu — ✅ Phase 5.
- **Confirmation dialog** (destructive confirm) — Pattern (a Modal usage), Phase 5.
- **Tooltip** and **Popover** — ✅ added to Phase 5 overlay catalog.
- Inline **Alert / Banner** (page + section level) and empty/loading states — Pattern
  (`feedback.md`, Phase 7) + Skeleton.
- **Progress / Spinner** (determinate + indeterminate) — Pattern over motion tokens, Phase 5.
- Status system (success/warning/error/info + holiday) via StatusBadge + status tokens — ✅.
- **Notifications center** (in-app notifications panel: Drawer/Popover + list, read/unread,
  mark-all-read) — ✅ Phase 5.
- **Undo** affordance on toasts for reversible actions — Pattern.

**Auth, account & access**
- LoginScreen (split-screen), ForgotPassword, ResetPassword, ChangePassword — ✅ Phase 6.
- Email verification / sign-up — Pattern (reuses the auth shell + MetaMail).
- 2FA/MFA entry, session-timeout re-auth — **Opt-in** (auth-shell variants on request).
- **Permissions / RBAC in the UI** — **Pattern (cross-cutting, Phase 7):** how to
  hide vs. disable actions by permission, show "no access" (403) states, and gate nav items.

**System & cross-cutting**
- Day/night theming + theme picker — ✅ Phase 1.
- Accessibility (WCAG AA, focus, keyboard, reduced-motion) — ✅ hard requirement, all phases.
- **Error pages** (403 / 404 / 500) + React **error boundary** — Pattern/components, Phase 7.
- Responsive / mobile admin (shell collapse, stacking) — ✅ built into the shell.
- Localization & formatting (dates, numbers, currency; tabular figures via `--font-mono`) —
  Pattern (formatting conventions, Phase 7).
- Print / document view — the "centered narrow document" width archetype (Phase 3).
- Onboarding / guidance — via EmptyState guidance + Tooltips.

Items marked **Opt-in** are deliberately out of the default build (YAGNI) but are recognised
admin needs — ask for any of them and they get a phase/plan. If a project needs an Opt-in
item, that's a signal to add it to the standard rather than improvise a one-off.

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
- Still out of scope (opt-in, add on request): tree view, calendar/scheduling, CSV
  import/export, 2FA/MFA. (File upload, wizard/stepper, notifications center, and
  charts/dataviz were pulled INTO scope — see §5 catalog + coverage map.)
- No multi-theme catalog — two polished defaults plus the documented contract so each
  project adds its own themes.

## 9. Build sequence (for the implementation plan)

1. `tokens/` (structural + dark + light + JSON)
2. `theme/` — port the ERP theme engine (registry.ts, useTheme, ThemeToggle, ThemePicker, pre-paint snippet) + day/night wiring
3. `primitives/` (incl. FileUpload)
4. `layout/` (AppShell, PageHeader, Tabs, Breadcrumbs, Card, DescriptionList, Stepper/Wizard)
5. `data/`
6. `overlay/` (incl. Tooltip, Popover, NotificationsCenter)
7. `auth/`
8. `dataviz/` (themed chart wrappers + Sparkline + dashboard guidance)
9. `docs/` (foundations, patterns, per-component specs)
10. `gallery/index.html`
11. `skills/ui-standards/SKILL.md` + README

Component groups (3–8) are independent and are good candidates for parallel agents,
each consuming the same tokens and theming contract.
