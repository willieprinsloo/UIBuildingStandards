import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard, EmptyState } from '../index';

describe('StatCard', () => {
  it('renders label, value, hint and tone class', () => {
    render(<StatCard label="Total views" value={42} hint="last 30 days" tone="accent" />);
    expect(screen.getByText('Total views')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('last 30 days')).toBeInTheDocument();
    expect(document.querySelector('.ui-statcard--accent')).not.toBeNull();
  });

  it('conveys trend by text label, not colour alone', () => {
    render(<StatCard label="Views" value={10} trend={{ direction: 'up', label: '+12%' }} />);
    // The percentage text is present (screen-reader accessible), glyph is aria-hidden.
    expect(screen.getByText('+12%')).toBeInTheDocument();
    expect(document.querySelector('.ui-statcard__trend--up')).not.toBeNull();
  });
});

describe('EmptyState', () => {
  it('renders title + description with a status role', () => {
    render(<EmptyState title="No visits yet" description="Data appears once live." />);
    const region = screen.getByRole('status');
    expect(region).toHaveTextContent('No visits yet');
    expect(region).toHaveTextContent('Data appears once live.');
  });

  it('renders an action slot when provided', () => {
    render(<EmptyState title="Empty" action={<button type="button">Add</button>} />);
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });
});
