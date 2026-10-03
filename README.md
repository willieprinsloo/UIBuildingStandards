# UI Building Standards

Reusable, best-practice UI standards and copy-paste React components for building
**administration systems** (ERP / CRM / dashboards) — and any other project that wants
a solid, accessible, themeable foundation.

It distills the battle-tested MetaLogix ERP design system into a **standalone,
framework-agnostic standard** with a **dependency-free React reference implementation**,
so any project (and any AI coding agent) can adopt the same look, behaviour, and quality
bar without pulling in a heavy component library or a build toolchain.

---

## Why this exists

Admin systems live or die on consistency — spacing, colour, typography, density, focus
behaviour, dark/light mode, tables, forms, and auth screens that all feel like one
product. Rebuilding that foundation per project is wasteful and drifts over time. This
repo is the single source of truth:

- **Standards as docs** — principles, tokens, and patterns written to be stack-neutral,
  so even non-React projects can follow them.
- **Components as code** — copy-paste TypeScript React components that implement the
  standards exactly, with zero runtime dependencies beyond React.
- **An agent entry point** — a `ui-standards` skill (planned) that lets an AI agent apply
  these standards inside any target repo.

## Design principles

- **Dependency-free** — components are plain TypeScript React + CSS variables. An agent
  copies a file (and its CSS) into any project and it just works. No Tailwind, no UI
  library, no build config required. (A Tailwind token-mapping appendix is provided for
  projects that want it.)
- **Themeable by contract** — every component references only *generic* design tokens
  (`--bg-base`, `--text-primary`, `--accent`, …). Re-theming is swapping one CSS file.
- **Day/night built in** — the ported ERP theme engine ships working dark + light themes
  and respects the OS preference with a user override; it scales to N themes.
- **Accessible by default** — WCAG AA contrast floors, always-visible focus rings, full
  keyboard operability, and `prefers-reduced-motion` are hard requirements, not extras.
- **MetaLogix-branded defaults** — azure accent `#2E6BE6` (dark) / teal `#0D9488`
  (light), Inter + JetBrains Mono, a 4px spacing scale, and conservative radii — all
  re-themeable.

## How to consume it

1. **Read the docs** in [`docs/`](docs/) — foundations and patterns.
2. **Copy the tokens once** — drop [`src/tokens/`](src/tokens/) into your project and
   import `tokens/global.css` at your app entry.
3. **Copy the components you need** — each lives as a `.tsx` + co-located `.css`.
4. **Wire day/night** — add the pre-paint snippet
   ([`docs/foundations/pre-paint-snippet.md`](docs/foundations/pre-paint-snippet.md)) to
   your `index.html`, then use `useTheme` / `ThemeToggle` / `ThemePicker`.

## Repository layout

```
UIStandards/
├── docs/
│   ├── foundations/        # design tokens, colour & theming, accessibility, pre-paint snippet
│   ├── patterns/           # page-shell, forms, data-tables, navigation, feedback, auth (upcoming)
│   └── components/          # per-component specs (upcoming)
├── src/
│   ├── tokens/             # structural tokens + default themes
│   │   ├── tokens.css      # theme-invariant structural tokens (:root)
│   │   ├── tokens.json     # same values as JSON for non-CSS consumers
│   │   ├── themes/
│   │   │   ├── precision.css   # default DARK theme
│   │   │   └── warehouse.css   # default LIGHT theme
│   │   └── global.css      # the single stylesheet to import (tokens + themes)
│   └── components/
│       └── theme/          # the theme engine: registry, useTheme, ThemeToggle, ThemePicker
└── docs/superpowers/       # design spec + phased implementation plans
```

## Theme engine

Ported from the MetaLogix ERP (which runs 36 themes in production), generalized:

- **`registry.ts`** — the single source of truth for theme metadata. Adding a theme =
  one CSS file + one `@import` + one registry entry.
- **`useTheme()`** — resolves a stored preference (`'system'` or a theme id), writes
  `data-theme` (the id) and `data-theme-mode` (`dark`/`light`) on `<html>`, persists to
  `localStorage`, and follows OS changes when set to `system`.
- **`ThemeToggle`** — quick dark/light switch. **`ThemePicker`** — full catalog picker.
- **Pre-paint snippet** — prevents a theme flash on first load.

See [`docs/foundations/color-and-theming.md`](docs/foundations/color-and-theming.md) for
the full generic-token contract and the "add a theme" checklist.

## Status & roadmap

Built in phases; each phase produces working, tested software.

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Foundation — design tokens + theme engine (registry, `useTheme`, `ThemeToggle`, `ThemePicker`) + foundation docs | ✅ Complete |
| 2 | Primitives — Button, Input, Select, Textarea, Checkbox, Radio, Switch, FormField, Badge | ✅ Complete |
| 3 | Layout & shell — AppShell (sidebar + topnav), PageHeader, Tabs, Breadcrumbs, Card | ⏳ Planned |
| 4 | Data — DataTable (server-driven sorting + search + paging), Pagination, StatCard, EmptyState, Skeleton | ⏳ Planned |
| 5 | Overlay — Modal, Drawer, Toast, DropdownMenu, Combobox, DatePicker, CommandPalette | ⏳ Planned |
| 6 | Auth — LoginScreen (split-screen) ✅ · ChangePassword, ForgotPassword, ResetPassword ⏳ | 🔸 In progress |
| 7 | Docs, gallery & `ui-standards` skill | ⏳ Planned |

Two standards worth calling out early:
- **DataTable is server-driven** — column sorting, search, and paging are built in and
  operate against the server via a controlled `{ page, pageSize, sort, search }` query.
- **LoginScreen is a split-screen** — a large (~4/5) brand/description panel on the left,
  a focused (~1/5) login form on the right; reused for forgot/reset password.

Full design: [`docs/superpowers/specs/2026-10-03-ui-standards-design.md`](docs/superpowers/specs/2026-10-03-ui-standards-design.md).

## Related MetaLogix services

- **MetaMail — transactional email.** Auth flows (password reset, email verification) and
  notifications send mail via MetaMail. See [`docs/references/metamail.md`](docs/references/metamail.md)
  and the live API docs at <https://metamail.metalogix.solutions/api-docs> (or ask
  `/metaMailAgent`).

## Development

```bash
npm install
npm test          # Vitest + React Testing Library (jsdom)
npm run typecheck # tsc --noEmit
```

Components follow TDD; every token, theme, and component ships with tests.

## License

Internal MetaLogix standard. Reuse across MetaLogix and client projects.
