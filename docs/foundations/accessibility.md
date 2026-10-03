# Accessibility

These are hard requirements for every component in UIStandards, not
aspirations. A component that doesn't meet these is not done, regardless of
how it looks.

## WCAG AA contrast floors

Every text/background and icon/background pairing produced by a theme must
meet WCAG 2.1 AA contrast minimums:

- **4.5:1** for normal body text (`--text-primary`, `--text-secondary` on
  `--bg-base`/`--bg-surface-*`).
- **3:1** for large text (≥ 18pt/24px regular, or ≥ 14pt/18.66px bold, e.g.
  `--type-h1`/`--type-display`) and for meaningful non-text UI like icons,
  focus rings, and status indicators against their adjacent background.

Both shipped themes (`precision` and `warehouse`, in
`src/tokens/themes/`) are built to clear these floors for their
`--text-primary`/`--text-secondary` pairings against `--bg-base` and
`--bg-surface-*`. When adding a new theme (see
`docs/foundations/color-and-theming.md`), check every generic-token
foreground/background combination a component actually uses — don't assume
a color "looks dark enough." Status colors (`--status-success`,
`--status-warning`, `--status-error`, `--status-info`) must stay legible on
both their own `-subtle` background and on `--bg-surface-1`.

## Always-visible focus rings via `--border-focus`

Every interactive element (button, link, input, tab, menu item, checkbox,
custom control) must render a visible focus indicator when it receives
keyboard focus — never `outline: none` with nothing in its place.

- Use the theme's `--border-focus` token for the focus ring/outline color
  (in `precision` this is `#2E6BE6`; in `warehouse` it's `#0D9488` — the
  token is what components reference, never the literal color).
- The focus ring must be driven by `:focus-visible` (not bare `:focus`), so
  mouse/pointer interaction doesn't show a ring that only keyboard users
  need, while keyboard interaction always does.
- Focus rings must never be suppressed for "visual cleanliness" — if a
  design calls for removing a browser default outline, it must be replaced
  with an equally visible `--border-focus` treatment, not removed outright.

## Full keyboard operability

Every interactive component must be fully operable without a mouse:

- All interactive elements are reachable via `Tab`/`Shift+Tab` in a logical
  order that matches visual/reading order.
- Activation works via `Enter`/`Space` as appropriate for the control's
  native role (buttons activate on both; links on `Enter`).
- Composite widgets (menus, tabs, comboboxes, pickers — e.g. `ThemePicker`)
  implement the expected arrow-key navigation for their role, `Escape` to
  dismiss/cancel, and trap or return focus sensibly on open/close.
- No functionality may depend on `hover`, `drag`, or any pointer-only event
  with no keyboard equivalent.
- Disabled controls are excluded from the tab order (`disabled` /
  `aria-disabled` + `tabIndex` handled consistently); they are never a
  silent dead end for keyboard users.

## `prefers-reduced-motion` is honored by all animation

`src/tokens/tokens.css` installs a global rule:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

This is a safety net, not a substitute for component-level care. Components
that build animation beyond plain CSS `animation`/`transition` (e.g.
JS-driven motion, `requestAnimationFrame` loops, libraries that bypass CSS
timing) must check `window.matchMedia('(prefers-reduced-motion: reduce)')`
themselves and skip or shorten the motion accordingly. No component may
layer in motion that defeats this preference — looping affordances like
spinners/skeletons (`--duration-loop-spinner`, `--duration-loop-skeleton`,
`--duration-loop-pulse`) still need a static/reduced fallback when the
preference is set, since an `!important` duration override alone can leave
an infinite-iteration loop still visually cycling.
