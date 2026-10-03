# Data (Phase 4)

Data-display components. Generic tokens only, dependency-free, a11y by default.

## DataTable — `DataTable.tsx` + `DataTable.css`
**Server-driven by contract**: sorting, search, and paging all operate against
the server via a controlled query. The component renders; the server queries.

```ts
interface DataTableQuery { page: number; pageSize: number; sort?: { column, direction }; search?: string }
```

| Prop | Type | Notes |
|------|------|-------|
| `columns` | `DataTableColumn<Row>[]` | `{ key, header, sortable?, align?, render? }`. |
| `rows` | `Row[]` | The current page's rows (already fetched). |
| `total` | `number` | Total matching rows across all pages → drives paging. |
| `query` | `DataTableQuery` | Controlled. |
| `onQueryChange` | `(next) => void` | Fires on sort / search / page change; re-query the server. |
| `rowKey` | `(row) => string` | Stable React key. |
| `loading` | `boolean` | Shows skeleton rows + `aria-busy`. |
| `searchable` | `boolean` | Shows the search box. |
| `emptyState` | `ReactNode` | Shown when `rows` is empty and not loading. |

Sortable headers expose `aria-sort`; changing sort/search resets to page 1.

## Pagination — `Pagination.tsx` + `Pagination.css`
Controlled page navigator. `{ page, pageSize, total, onPageChange, siblingCount? }`.
First/last always shown with ellipsis gaps; current page has `aria-current`.
Renders nothing on a single page.

## StatCard — `StatCard.tsx` + `StatCard.css`
A dashboard stat tile. `{ label, value, hint?, trend?, tone?, icon? }`.
`tone` ∈ `default | accent | success | warning | error` (accent lifts the
surface + colours the value). `trend = { direction: 'up'|'down'|'flat', label }`
— direction is conveyed by a glyph **and** the label text, never colour alone.

## EmptyState — `EmptyState.tsx` + `EmptyState.css`
Calm placeholder for empty lists/tables. `{ title, description?, icon?, action? }`,
rendered in a `role="status"` region.

## Skeleton — `Skeleton.tsx` + `Skeleton.css`
Shimmer loading placeholder. `{ width?, height?, radius?, circle? }`. Decorative
(`aria-hidden`); announce loading via `aria-busy` on the owning region. Honours
`prefers-reduced-motion`.
