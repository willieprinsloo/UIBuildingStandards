import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable, Pagination, Skeleton } from '../index';
import type { DataTableColumn, DataTableQuery } from '../index';

describe('Skeleton', () => {
  it('is decorative (aria-hidden) and sizeable', () => {
    const { container } = render(<Skeleton width={120} height={8} />);
    const el = container.querySelector('.ui-skeleton') as HTMLElement;
    expect(el).not.toBeNull();
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.style.width).toBe('120px');
  });
});

describe('Pagination', () => {
  it('hides itself on a single page', () => {
    const { container } = render(
      <Pagination page={1} pageSize={10} total={8} onPageChange={() => {}} />,
    );
    expect(container.querySelector('.ui-pagination')).toBeNull();
  });
  it('disables prev on first page and fires onPageChange', async () => {
    const onPage = vi.fn();
    render(<Pagination page={1} pageSize={10} total={50} onPageChange={onPage} />);
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPage).toHaveBeenCalledWith(2);
  });
  it('marks the current page', () => {
    render(<Pagination page={2} pageSize={10} total={50} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
  });
});

interface Row {
  id: string;
  name: string;
  views: number;
}
const columns: DataTableColumn<Row>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'views', header: 'Views', sortable: true, align: 'right' },
];
const rows: Row[] = [
  { id: '1', name: 'Alpha', views: 10 },
  { id: '2', name: 'Beta', views: 3 },
];
const query: DataTableQuery = { page: 1, pageSize: 10 };

describe('DataTable', () => {
  it('renders rows via columns and a total count', () => {
    render(
      <DataTable
        columns={columns}
        rows={rows}
        total={2}
        query={query}
        onQueryChange={() => {}}
        rowKey={(r) => r.id}
      />,
    );
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('2 rows')).toBeInTheDocument();
  });

  it('server-driven sort: clicking a sortable header emits a sort query (page reset)', async () => {
    const onQueryChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        rows={rows}
        total={2}
        query={{ page: 3, pageSize: 10 }}
        onQueryChange={onQueryChange}
        rowKey={(r) => r.id}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /Name/ }));
    expect(onQueryChange).toHaveBeenCalledWith(
      expect.objectContaining({ sort: { column: 'name', direction: 'asc' }, page: 1 }),
    );
  });

  it('reflects active sort via aria-sort', () => {
    render(
      <DataTable
        columns={columns}
        rows={rows}
        total={2}
        query={{ page: 1, pageSize: 10, sort: { column: 'views', direction: 'desc' } }}
        onQueryChange={() => {}}
        rowKey={(r) => r.id}
      />,
    );
    const th = screen.getByRole('columnheader', { name: /Views/ });
    expect(th).toHaveAttribute('aria-sort', 'descending');
  });

  it('search emits a query with page reset', async () => {
    const onQueryChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        rows={rows}
        total={2}
        query={{ page: 2, pageSize: 10 }}
        onQueryChange={onQueryChange}
        rowKey={(r) => r.id}
        searchable
      />,
    );
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search' }), 'a');
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: 'a', page: 1 }),
    );
  });

  it('shows an empty state when there are no rows', () => {
    render(
      <DataTable
        columns={columns}
        rows={[]}
        total={0}
        query={query}
        onQueryChange={() => {}}
        rowKey={(r) => r.id}
      />,
    );
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('shows skeleton rows while loading and marks the table busy', () => {
    const { container } = render(
      <DataTable
        columns={columns}
        rows={[]}
        total={0}
        query={query}
        onQueryChange={() => {}}
        rowKey={(r) => r.id}
        loading
      />,
    );
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');
    expect(container.querySelectorAll('.ui-skeleton').length).toBeGreaterThan(0);
  });
});
