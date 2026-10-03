# Color & theming

Components never hardcode color. They reference a fixed set of **generic
tokens** — the same names in every theme, with different values — so that
swapping themes (or adding a new one) requires zero component changes.

## The generic-token contract

Every file in `src/tokens/themes/<id>.css` scopes its rule to
`[data-theme="<id>"]` and must define all of the following tokens. This is
the full contract, verbatim, grouped by purpose:

**Backgrounds**

- `--bg-base`
- `--bg-surface-1`
- `--bg-surface-2`
- `--bg-surface-3`
- `--bg-inset`

**Text**

- `--text-primary`
- `--text-secondary`
- `--text-tertiary`
- `--text-muted`
- `--text-on-accent`

**Accent**

- `--accent`
- `--accent-hover`
- `--accent-active`
- `--accent-subtle`

**Status**

- `--status-success`
- `--status-success-subtle`
- `--status-warning`
- `--status-warning-subtle`
- `--status-error`
- `--status-error-subtle`
- `--status-info`
- `--status-info-subtle`

**Borders**

- `--border`
- `--border-subtle`
- `--border-emphasis`
- `--border-focus`

**Shadows**

- `--shadow-sm`
- `--shadow-md`
- `--shadow-lg`
- `--shadow-xl`

Component CSS (and inline styles) must only ever reference tokens from this
list (plus the structural tokens in `docs/foundations/design-tokens.md`) —
never a raw hex/rgb value and never a theme-specific token name. That is what
makes a component "theme-blind": it looks correct in every theme, including
ones that don't exist yet.

### The two shipped themes

UIStandards ships two default themes that together define the contract:

- **`precision`** (`src/tokens/themes/precision.css`) — the default dark
  theme. `mode: dark`. Depth comes from surface lightness, so all four
  `--shadow-*` tokens are `none`.
- **`warehouse`** (`src/tokens/themes/warehouse.css`) — the default light
  theme. `mode: light`. Uses real box-shadow values for depth (e.g.
  `--shadow-sm: 0 1px 2px rgba(28, 25, 23, 0.05)`).

Both themes define identical token names with different values — that
equivalence is what the contract guarantees.

## `data-theme` and `data-theme-mode`

Two attributes on `<html>` (`document.documentElement`) drive theming:

- **`data-theme`** — the resolved theme id (e.g. `"precision"`,
  `"warehouse"`, or any custom id added later). This selects which
  `[data-theme="<id>"]` CSS block in `src/tokens/themes/*.css` is active and
  therefore which values the generic tokens resolve to.
- **`data-theme-mode`** — the theme's mode, `"dark"` or `"light"`. This lets
  surrounding chrome (browser UI, `<meta name="color-scheme">`, third-party
  widgets) react to light/dark independently of which specific theme id is
  active.

Both attributes are always written together, never independently.

## How `useTheme` applies them

`src/components/theme/useTheme.ts` is the runtime source of truth:

- It persists the user's **preference** (`'system'` or an explicit theme id)
  under the `ui-theme` localStorage key, and the last resolved **mode** under
  `ui-theme-mode`.
- When preference is `'system'`, it resolves to the canonical theme for the
  OS color-scheme: `precision` for dark, `warehouse` for light (via
  `matchMedia('(prefers-color-scheme: dark)')`), and re-resolves live if the
  OS theme changes while preference stays `'system'`.
- Resolving a theme writes `data-theme` and `data-theme-mode` onto
  `document.documentElement` (`applyTheme()`), and looks up the mode for a
  given theme id via the registry (`getTheme(id).mode`).
- The hook returns `{ preference, resolvedTheme, setPreference }` for
  `ThemeToggle`/`ThemePicker` to consume.

## The pre-paint snippet (no FOUC)

Because `useTheme` only applies attributes after React mounts, a page would
flash the wrong theme on load. `docs/foundations/pre-paint-snippet.md`
documents a small inline `<script>` for the host app's `index.html` `<head>`
— placed before any stylesheet — that reads the same `ui-theme` /
`ui-theme-mode` localStorage keys and writes `data-theme` /
`data-theme-mode` synchronously before first paint. It deliberately doesn't
know which themes exist (no hardcoded theme list) — it only replays what
`useTheme` last persisted, falling back to `precision`/`dark` on any error.

## Add a theme

To add a new theme to the standard:

1. **Create `src/tokens/themes/<id>.css`** scoped to `[data-theme="<id>"]`,
   mapping *every* generic token in the contract above (all backgrounds,
   text, accent, status, border, and shadow tokens) — an incomplete mapping
   leaves tokens undefined for that theme, which is a loud visual failure,
   not a silent fallback.
2. **Add one `@import` to `src/tokens/global.css`**, in the correct mode
   block (`/* Dark themes */` or `/* Light themes */`), after the structural
   `tokens.css` import. Import order matters: structural tokens first, then
   every theme file.
3. **Add a `THEMES` entry to `src/components/theme/registry.ts`** — `id`,
   `label`, `shortLabel`, `mode`, `family`, `description`, `iconName`, and a
   `swatch` (used by `ThemePicker` preview chips). The `as const satisfies
   readonly ThemeMeta[]` annotation on `THEMES` type-checks the new entry
   automatically.
4. **Run `npm run typecheck`** to confirm `ThemeId` picked up the new id
   everywhere it's used (e.g. any exhaustive switches over theme ids).
