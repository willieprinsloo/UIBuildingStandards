// src/components/data/DataTable.tsx
import type { ReactNode } from 'react';
import { EmptyState } from './EmptyState';
import { Pagination } from './Pagination';
import { Skeleton } from './Skeleton';
import './DataTable.css';

export type SortDirection = 'asc' | 'desc';

export interface DataTableSort {
  column: string;
  direction: SortDirection;
}

export interface DataTableQuery {
  /** 1-based page. */
  page: number;
  pageSize: number;
  sort?: DataTableSort;
  search?: string;
}

export interface DataTableColumn<Row> {
  key: string;
  header: ReactNode;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  /** Cell renderer; defaults to `String(row[key])`. */
  render?: (row: Row) => ReactNode;
}

export interface DataTableProps<Row> {
  columns: DataTableColumn<Row>[];
  rows: Row[];
  /** Total matching rows across all pages — drives Pagination. */
  total: number;
  query: DataTableQuery;
  /** Fires on sort / search / page change. The server re-queries. */
  onQueryChange: (next: DataTableQuery) => void;
  rowKey: (row: Row) => string;
  loading?: boolean;
  /** Show the search box. */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Shown when there are no rows and not loading. */
  emptyState?: ReactNode;
  'aria-label'?: string;
}

function ariaSort(
  col: DataTableColumn<unknown>,
  sort?: DataTableSort,
): 'ascending' | 'descending' | 'none' | undefined {
  if (!col.sortable) return undefined;
  if (sort?.column !== col.key) return 'none';
  return sort.direction === 'asc' ? 'ascending' : 'descending';
}

/** Server-driven table: sorting, search and paging all operate against the
 * server via the controlled `query` + `onQueryChange`. Generic tokens only. */
export function DataTable<Row>({
  columns,
  rows,
  total,
  query,
  onQueryChange,
  rowKey,
  loading = false,
  searchable = false,
  searchPlaceholder = 'Search…',
  emptyState,
  'aria-label': ariaLabel,
}: DataTableProps<Row>) {
  function toggleSort(col: DataTableColumn<Row>) {
    if (!col.sortable) return;
    const current = query.sort;
    let direction: SortDirection = 'asc';
    if (current?.column === col.key) {
      direction = current.direction === 'asc' ? 'desc' : 'asc';
    }
    onQueryChange({ ...query, sort: { column: col.key, direction }, page: 1 });
  }

  function cell(col: DataTableColumn<Row>, row: Row): ReactNode {
    if (col.render) return col.render(row);
    const value = (row as Record<string, unknown>)[col.key];
    return value == null ? '' : String(value);
  }

  const showEmpty = !loading && rows.length === 0;

  return (
    <div className="ui-datatable">
      {searchable && (
        <div className="ui-datatable__toolbar">
          <input
            type="search"
            className="ui-datatable__search"
            value={query.search ?? ''}
            placeholder={searchPlaceholder}
            aria-label="Search"
            onChange={(e) => onQueryChange({ ...query, search: e.target.value, page: 1 })}
          />
        </div>
      )}

      <div className="ui-datatable__scroll">
        <table className="ui-datatable__table" aria-label={ariaLabel} aria-busy={loading}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={ariaSort(col as DataTableColumn<unknown>, query.sort)}
                  className={`ui-datatable__th ui-datatable__th--${col.align ?? 'left'}`}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      className="ui-datatable__sort"
                      onClick={() => toggleSort(col)}
                    >
                      {col.header}
                      <span className="ui-datatable__sort-glyph" aria-hidden="true">
                        {query.sort?.column === col.key
                          ? query.sort.direction === 'asc'
                            ? '▲'
                            : '▼'
                          : '↕'}
                      </span>
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: Math.min(query.pageSize, 8) }).map((_, r) => (
                  <tr key={`sk-${r}`}>
                    {columns.map((col) => (
                      <td key={col.key} className="ui-datatable__td">
                        <Skeleton />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((row) => (
                  <tr key={rowKey(row)}>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`ui-datatable__td ui-datatable__td--${col.align ?? 'left'}`}
                      >
                        {cell(col, row)}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {showEmpty && (
        <div className="ui-datatable__empty">
          {emptyState ?? <EmptyState title="No results" description="Nothing matches your filters yet." />}
        </div>
      )}

      {!showEmpty && (
        <div className="ui-datatable__footer">
          <span className="ui-datatable__count" aria-live="polite">
            {total} {total === 1 ? 'row' : 'rows'}
          </span>
          <Pagination
            page={query.page}
            pageSize={query.pageSize}
            total={total}
            onPageChange={(page) => onQueryChange({ ...query, page })}
          />
        </div>
      )}
    </div>
  );
}
