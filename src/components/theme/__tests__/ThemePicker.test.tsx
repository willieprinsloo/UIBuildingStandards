// src/components/theme/__tests__/ThemePicker.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemePicker } from '../ThemePicker';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: q.includes('dark'), media: q,
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
    addListener: vi.fn(), removeListener: vi.fn(),
    onchange: null, dispatchEvent: vi.fn(),
  }));
});

describe('ThemePicker', () => {
  it('opens the listbox and lists both themes + System', async () => {
    render(<ThemePicker />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /precision/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /warehouse/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /system/i })).toBeInTheDocument();
  });

  it('applies the chosen theme and closes', async () => {
    render(<ThemePicker />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByRole('option', { name: /warehouse/i }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('warehouse');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    render(<ThemePicker />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('moves focus between options with ArrowDown/ArrowUp (roving tabindex)', async () => {
    render(<ThemePicker />);
    await userEvent.click(screen.getByRole('button'));

    const system = screen.getByRole('option', { name: /system/i });
    const precision = screen.getByRole('option', { name: /precision/i });
    const warehouse = screen.getByRole('option', { name: /warehouse/i });

    // System has no current preference match by default -> 'system' is active.
    expect(document.activeElement).toBe(system);

    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(precision);

    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(warehouse);

    await userEvent.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(precision);
  });

  it('keeps exactly one option in the tab order (roving tabindex)', async () => {
    render(<ThemePicker />);
    await userEvent.click(screen.getByRole('button'));

    const options = screen.getAllByRole('option');
    const zeroTabIndex = options.filter((o) => o.getAttribute('tabindex') === '0');
    expect(zeroTabIndex).toHaveLength(1);
    expect(zeroTabIndex[0]).toHaveAccessibleName(/system/i);

    await userEvent.keyboard('{ArrowDown}');

    const optionsAfter = screen.getAllByRole('option');
    const zeroTabIndexAfter = optionsAfter.filter((o) => o.getAttribute('tabindex') === '0');
    expect(zeroTabIndexAfter).toHaveLength(1);
    expect(zeroTabIndexAfter[0]).toHaveAccessibleName(/precision/i);
  });

  it('selects the focused option with Enter', async () => {
    render(<ThemePicker />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.keyboard('{ArrowDown}{ArrowDown}'); // System -> Precision -> Warehouse
    await userEvent.keyboard('{Enter}');
    expect(document.documentElement.getAttribute('data-theme')).toBe('warehouse');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
