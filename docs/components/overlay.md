# Overlay (Phase 5)

Layered UI: dialogs, menus, pickers, notifications. Generic tokens only,
dependency-free. The modal-type overlays share `useOverlay` (focus trap +
Esc-to-close + body scroll lock + focus restore).

## Modal — `Modal.tsx` + `Modal.css`
Centered `role="dialog" aria-modal` over a backdrop.
`{ open, onClose, title?, children, footer?, closeOnBackdrop?, size? }`
(`size` = `sm | md | lg`). Focus-trapped; Esc and backdrop close.

## Drawer — `Drawer.tsx` + `Drawer.css`
Side panel over a backdrop. Same behaviour as Modal plus `side` = `right | left`.

## Toast — `Toast.tsx` + `Toast.css`
`ToastProvider` wraps the app; `useToast()` returns `{ toast(opts), dismiss(id) }`.
`ToastOptions = { title?, description?, tone?, duration? }` (`duration` 0 = sticky,
default 5000). Error toasts are assertive alerts; others are polite status.

## DropdownMenu — `DropdownMenu.tsx` + `DropdownMenu.css`
A trigger button that opens a `role="menu"`. `{ trigger, items, align?, aria-label? }`
where `items = { id, label, onSelect?, disabled?, danger? }[]`. Arrow/Home/End
move focus; Esc or outside-click or selection closes.

## Combobox — `Combobox.tsx` + `Combobox.css`
Editable, filterable single-select (WAI-ARIA combobox + listbox).
`{ options, value?, onChange, placeholder?, emptyText?, aria-label? }` where
`options = { value, label, disabled? }[]`. Arrow keys move the active option
(`aria-activedescendant`); Enter selects; Esc closes.

## DatePicker — `DatePicker.tsx` + `DatePicker.css`
A date field with a calendar popover — **no date library**.
`{ value?, onChange, min?, max?, aria-label? }` (ISO `yyyy-mm-dd`). In the grid:
Arrow keys move by day/week, Home/End to week ends, PageUp/PageDown by month,
Enter/Space selects, Esc closes.

## CommandPalette — `CommandPalette.tsx` + `CommandPalette.css`
A ⌘K-style modal command launcher. `{ open, onClose, commands, placeholder? }`
where `commands = { id, label, hint?, keywords?, onRun }[]`. Type to filter
(label + keywords); Arrow keys move the active command; Enter runs + closes.
Focus-trapped via `useOverlay`.
