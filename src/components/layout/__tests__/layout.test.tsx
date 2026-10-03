import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppShell, Breadcrumbs, Card, PageHeader, Tabs } from '../index';

describe('Card', () => {
  it('renders body; header only when title/actions given', () => {
    const { rerender } = render(<Card>body</Card>);
    expect(screen.getByText('body')).toBeInTheDocument();
    expect(document.querySelector('.ui-card__header')).toBeNull();
    rerender(
      <Card title="T" actions={<button type="button">A</button>}>
        body
      </Card>,
    );
    expect(screen.getByText('T')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'A' })).toBeInTheDocument();
  });
  it('applies padding modifier + forwards className', () => {
    render(
      <Card padding="sm" className="x">
        c
      </Card>,
    );
    expect(document.querySelector('.ui-card__body--sm')).not.toBeNull();
    expect(document.querySelector('.ui-card.x')).not.toBeNull();
  });
});

describe('Breadcrumbs', () => {
  it('marks the last item current and links the rest', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Reports', href: '/r' },
          { label: 'Views' },
        ]}
      />,
    );
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    const current = screen.getByText('Views');
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('link', { name: 'Views' })).toBeNull();
  });
});

describe('PageHeader', () => {
  it('renders title as h1 + optional slots', () => {
    render(
      <PageHeader
        title="Analytics"
        description="desc"
        actions={<button type="button">New</button>}
        breadcrumbs={<span>crumbs</span>}
      />,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Analytics' })).toBeInTheDocument();
    expect(screen.getByText('desc')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument();
    expect(screen.getByText('crumbs')).toBeInTheDocument();
  });
});

describe('Tabs', () => {
  const tabs = [
    { id: 'a', label: 'A' },
    { id: 'b', label: 'B', disabled: true },
    { id: 'c', label: 'C' },
  ];
  it('exposes a tablist with the active tab selected', () => {
    render(<Tabs tabs={tabs} value="a" onChange={() => {}} aria-label="Views" />);
    expect(screen.getByRole('tablist', { name: 'Views' })).toBeInTheDocument();
    const a = screen.getByRole('tab', { name: 'A' });
    expect(a).toHaveAttribute('aria-selected', 'true');
    expect(a).toHaveAttribute('tabindex', '0');
  });
  it('ArrowRight skips disabled tabs and selects the next enabled', async () => {
    const onChange = vi.fn();
    render(<Tabs tabs={tabs} value="a" onChange={onChange} />);
    screen.getByRole('tab', { name: 'A' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalledWith('c');
  });
  it('clicking a tab calls onChange', async () => {
    const onChange = vi.fn();
    render(<Tabs tabs={tabs} value="a" onChange={onChange} />);
    await userEvent.click(screen.getByRole('tab', { name: 'C' }));
    expect(onChange).toHaveBeenCalledWith('c');
  });
});

describe('AppShell', () => {
  const nav = [{ label: 'Main', items: [{ id: 'home', label: 'Home', href: '/', active: true }] }];
  it('renders topbar, primary nav and main content', () => {
    render(
      <AppShell brand={<span>Brand</span>} topbar={<span>Top</span>} nav={nav}>
        <p>page</p>
      </AppShell>,
    );
    expect(screen.getByText('Brand')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveTextContent('page');
    const home = screen.getByRole('link', { name: 'Home' });
    expect(home).toHaveAttribute('aria-current', 'page');
  });
  it('button nav items fire onClick; footer items render', async () => {
    const onClick = vi.fn();
    render(
      <AppShell
        nav={[{ items: [{ id: 'x', label: 'X', onClick }] }]}
        footer={[{ id: 'out', label: 'Sign out', onClick: () => {} }]}
      >
        c
      </AppShell>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'X' }));
    expect(onClick).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
  });
});
