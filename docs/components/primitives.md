# Primitives (Phase 2)

Dependency-free form + label primitives. Each is one `.tsx` + co-located `.css`
referencing ONLY generic tokens, so they inherit any theme. Copy the `.tsx` +
`.css` (and `Input.css`/`Choice.css` where shared) into a project and import the
component.

All primitives: visible `:focus-visible` ring via `--border-focus`, full
keyboard operability (native elements), `prefers-reduced-motion` honored, and
WCAG-AA token pairings.

## Button — `Button.tsx` + `Button.css`
A clickable action. Native `<button>`, so Enter/Space + focus are free.

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `variant` | `primary \| secondary \| ghost \| danger` | `primary` | tone; `danger` uses `--status-error` |
| `size` | `sm \| md` | `md` | `md` = `--input-height` |
| `loading` | `boolean` | `false` | shows a spinner, sets `aria-busy`, disables |
| `fullWidth` | `boolean` | `false` | stretch to container |
| …`ButtonHTMLAttributes` | | | `type` defaults to `button` |

- **Do** give every button a text label (or `aria-label` for icon-only).
- **Don't** rely on color alone for `danger` — the label should say the action.

## Input / Textarea / Select — `Input.tsx` / `Textarea.tsx` / `Select.tsx`
Themed text controls. Share `Input.css`; `Select` adds a chevron (`Select.css`).

| Prop | Type | Notes |
|------|------|-------|
| `invalid` | `boolean` | sets `aria-invalid` + error border; also styled off `aria-invalid="true"` so `FormField` can drive it |
| …native attrs | | value/onChange/placeholder/disabled/… pass through |

- Pair every control with a `<label>` — use `FormField`, or `aria-label`.
- Focus shows a border in `--border-focus` + a 2px `--accent-subtle` ring.

## Checkbox / Radio — `Checkbox.tsx` / `Radio.tsx` (share `Choice.css`)
Native `<input type=checkbox|radio>` themed via `accent-color: var(--accent)`,
wrapped in a `<label>` with an optional `label` node.

- Group radios with a shared `name`.
- `Do` keep the label clickable (it wraps the control).

## Switch — `Switch.tsx` + `Switch.css`
An on/off toggle built on a native checkbox with `role="switch"` (keyboard +
form semantics free). The real control is visually hidden but focusable; the
track/thumb are decorative (`aria-hidden`).

## FormField — `FormField.tsx` + `FormField.css`
Labels one control and wires accessibility for you. Pass `htmlFor` (the
control's id) and a single control as the child; FormField injects the child's
`id`, `aria-describedby` (description + error), and `aria-invalid` when `error`
is set, and renders the error as `role="alert"`.

| Prop | Type | Notes |
|------|------|-------|
| `htmlFor` | `string` | control id + base for `-desc` / `-error` ids |
| `label` | `ReactNode` | required |
| `required` | `boolean` | renders a `*` (decorative) |
| `description` | `ReactNode` | hint text, referenced via `aria-describedby` |
| `error` | `ReactNode` | error message; marks the control invalid + `role=alert` |
| `children` | `ReactElement` | exactly one control |

- **Do** give the control a stable `htmlFor` id.
- **Don't** put more than one control inside a single FormField.

## Badge — `Badge.tsx` + `Badge.css`
A small status/label pill. `tone`: `neutral` (default) / `success` / `warning`
/ `error` / `info` / `accent`, each mapped to its `--status-*`/`--accent`
token + `-subtle` background.

- Badges are decorative by default; when the tone itself is the only signal,
  add an `aria-label` (don't rely on color alone).
