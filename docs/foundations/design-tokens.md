# Design tokens

UIStandards separates tokens into two layers:

- **Structural tokens** (`src/tokens/tokens.css`) — theme-invariant. Spacing,
  typography, radius, z-index, motion, and layout constants. No color values
  live here.
- **Generic (color) tokens** — defined per theme in `src/tokens/themes/<id>.css`.
  See `docs/foundations/color-and-theming.md` for that contract.

This document covers the structural layer: every token group in
`src/tokens/tokens.css`, with exact values and when to reach for it.

## Spacing

Base unit: 4px.

| Token | Value |
| --- | --- |
| `--space-0` | `0` |
| `--space-1` | `4px` |
| `--space-2` | `8px` |
| `--space-3` | `12px` |
| `--space-4` | `16px` |
| `--space-5` | `20px` |
| `--space-6` | `24px` |
| `--space-8` | `32px` |
| `--space-10` | `40px` |
| `--space-12` | `48px` |
| `--space-16` | `64px` |
| `--space-20` | `80px` |
| `--space-24` | `96px` |

Usage: use `--space-*` for every margin, padding, and gap — never hardcode a
pixel value for spacing in component CSS.

## Typography

Font families:

| Token | Value |
| --- | --- |
| `--font-sans` | `'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` |
| `--font-mono` | `'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace` |

Sizes:

| Token | Value |
| --- | --- |
| `--type-display-size` | `1.875rem` |
| `--type-h1-size` | `1.5rem` |
| `--type-h2-size` | `1.25rem` |
| `--type-h3-size` | `1rem` |
| `--type-card-title-size` | `0.9375rem` |
| `--type-body-size` | `0.875rem` |
| `--type-label-size` | `0.8125rem` |
| `--type-caption-size` | `0.75rem` |
| `--type-data-size` | `0.8125rem` |
| `--type-eyebrow-size` | `0.6875rem` |

Weights:

| Token | Value |
| --- | --- |
| `--type-display-weight` | `700` |
| `--type-h1-weight` | `600` |
| `--type-h2-weight` | `600` |
| `--type-h3-weight` | `600` |
| `--type-card-title-weight` | `600` |
| `--type-body-weight` | `400` |
| `--type-label-weight` | `500` |
| `--type-caption-weight` | `400` |
| `--type-data-weight` | `500` |
| `--type-body-emphasis-weight` | `500` |
| `--type-eyebrow-weight` | `600` |

Tracking (letter-spacing):

| Token | Value |
| --- | --- |
| `--type-display-tracking` | `-0.02em` |
| `--type-h1-tracking` | `-0.015em` |
| `--type-h2-tracking` | `-0.01em` |
| `--type-body-tracking` | `0` |
| `--type-label-tracking` | `0.01em` |
| `--type-caption-tracking` | `0.01em` |
| `--type-eyebrow-tracking` | `0.06em` |

Line-height:

| Token | Value |
| --- | --- |
| `--leading-tight` | `1.25` |
| `--leading-normal` | `1.5` |
| `--leading-loose` | `1.75` |

Composite shorthands (weight / size / line-height / family — use these
directly in `font:` declarations rather than recombining the parts):

| Token | Value |
| --- | --- |
| `--type-display` | `var(--type-display-weight) var(--type-display-size) / var(--leading-tight) var(--font-sans)` |
| `--type-h1` | `var(--type-h1-weight) var(--type-h1-size) / var(--leading-tight) var(--font-sans)` |
| `--type-h2` | `var(--type-h2-weight) var(--type-h2-size) / var(--leading-tight) var(--font-sans)` |
| `--type-h3` | `var(--type-h3-weight) var(--type-h3-size) / var(--leading-normal) var(--font-sans)` |
| `--type-body` | `var(--type-body-weight) var(--type-body-size) / var(--leading-normal) var(--font-sans)` |
| `--type-label` | `var(--type-label-weight) var(--type-label-size) / var(--leading-normal) var(--font-sans)` |
| `--type-caption` | `var(--type-caption-weight) var(--type-caption-size) / var(--leading-normal) var(--font-sans)` |
| `--type-data` | `var(--type-data-weight) var(--type-data-size) / var(--leading-normal) var(--font-mono)` |

Usage: pick the composite `--type-*` shorthand that matches the role of the
text (heading, body, label, caption, tabular data) instead of assembling
size/weight/family by hand.

## Radius

| Token | Value |
| --- | --- |
| `--radius-sm` | `4px` |
| `--radius-md` | `6px` |
| `--radius-lg` | `8px` |
| `--radius-xl` | `12px` |
| `--radius-full` | `9999px` |

Usage: `--radius-full` is for pills/avatars/badges; everything else (buttons,
inputs, cards, menus) picks the smallest radius that still reads as
intentional for its size.

## Z-index

| Token | Value |
| --- | --- |
| `--z-base` | `0` |
| `--z-raised` | `10` |
| `--z-dropdown` | `100` |
| `--z-sticky` | `200` |
| `--z-overlay` | `300` |
| `--z-modal` | `400` |
| `--z-popover` | `450` |
| `--z-toast` | `500` |
| `--z-tooltip` | `600` |

Usage: never author a raw `z-index` number in component CSS — pick the
`--z-*` token for the layer the element belongs to, so stacking order stays
consistent across the whole library.

## Motion

Easing curves:

| Token | Value |
| --- | --- |
| `--ease-default` | `cubic-bezier(0.25, 0.1, 0.25, 1)` |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` |

Durations:

| Token | Value |
| --- | --- |
| `--duration-fast` | `100ms` |
| `--duration-base` | `150ms` |
| `--duration-slow` | `250ms` |
| `--duration-slower` | `400ms` |
| `--duration-loop-spinner` | `800ms` |
| `--duration-loop-skeleton` | `1.4s` |
| `--duration-loop-pulse` | `1.5s` |

Usage: use `--duration-*` + `--ease-*` for every transition/animation, and
remember `tokens.css` already wraps a global
`@media (prefers-reduced-motion: reduce)` rule that clamps all animation and
transition durations to near-zero — see `docs/foundations/accessibility.md`.

## Layout

| Token | Value |
| --- | --- |
| `--topnav-height` | `56px` |
| `--sidebar-width-expanded` | `240px` |
| `--sidebar-width-collapsed` | `56px` |
| `--nav-item-height` | `36px` |
| `--input-height` | `36px` |

Usage: these are the fixed dimensions shared by the app shell (topnav,
sidebar) and form controls (inputs, nav items) — reference them instead of
hardcoding pixel heights/widths so the shell and controls stay in lockstep if
a dimension ever changes.
