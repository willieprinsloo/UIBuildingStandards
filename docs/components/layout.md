# Layout & shell (Phase 3)

The admin-system frame and page structure. Each is one `.tsx` + co-located
`.css`, generic tokens only, dependency-free. Copy the files you need.

## AppShell — `AppShell.tsx` + `AppShell.css`
The application frame: a sticky top bar + a collapsible left sidebar (the
primary menu) + a scrollable content region.

| Prop | Type | Notes |
|------|------|-------|
| `brand` | `ReactNode` | Top-left slot (logo / wordmark). |
| `topbar` | `ReactNode` | Top-right slot (theme toggle, user menu). |
| `nav` | `NavSection[]` | Grouped nav: `{ label?, items: NavItem[] }`. |
| `footer` | `NavItem[]` | Bottom-of-sidebar items (user / settings / logout). |
| `collapsed` | `boolean` | Controlled collapse; omit to use internal state. |
| `onToggleCollapse` | `() => void` | Renders a collapse toggle. |

`NavItem = { id, label, icon?, href?, onClick?, active? }`. Items with `href`
render `<a>` (with `aria-current="page"` when active), else `<button>`. Topbar
is `<header>`, sidebar is `<nav aria-label="Primary">`, content is `<main>`.
**Active item = 2px left accent border + `--accent-subtle` bg + `--accent` text.**
Auto-collapses below 1024px.

## PageHeader — `PageHeader.tsx` + `PageHeader.css`
The title block at the top of a content area.

| Prop | Type | Notes |
|------|------|-------|
| `title` | `ReactNode` | Rendered as the page `<h1>`. |
| `description` | `ReactNode` | Supporting line. |
| `actions` | `ReactNode` | Right-aligned on the title row. |
| `breadcrumbs` | `ReactNode` | Slot above the title (pass `<Breadcrumbs>`). |
| `children` | `ReactNode` | Below (e.g. `<Tabs>`). |

## Tabs — `Tabs.tsx` + `Tabs.css`
Controlled WAI-ARIA tablist (renders tabs only; the consumer renders the
panel with `id="${tabId}-panel"` and `role="tabpanel"`).

| Prop | Type | Notes |
|------|------|-------|
| `tabs` | `TabItem[]` | `{ id, label, disabled? }`. |
| `value` | `string` | Active tab id. |
| `onChange` | `(id) => void` | |
| `aria-label` | `string` | Names the tablist. |

Roving `tabindex`; Arrow/Home/End move + activate, skipping disabled tabs.

## Breadcrumbs — `Breadcrumbs.tsx` + `Breadcrumbs.css`
`items: { label, href?, onClick? }[]` inside `<nav aria-label="Breadcrumb">`.
The last item is the current page (`aria-current="page"`, not a link);
separators are `aria-hidden`.

## Card — `Card.tsx` + `Card.css`
Surface container: optional `title` + `actions` header, `children` body
(`padding` = `none | sm | md`), optional `footer`. Extends div attributes.
