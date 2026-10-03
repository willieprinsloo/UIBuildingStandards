import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Combobox,
  CommandPalette,
  DatePicker,
  Drawer,
  DropdownMenu,
  Modal,
  ToastProvider,
  useToast,
} from '../index';

describe('Modal', () => {
  it('renders a labelled dialog when open and closes on Escape', async () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Confirm">
        body
      </Modal>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Confirm' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
  it('renders nothing when closed', () => {
    render(
      <Modal open={false} onClose={() => {}}>
        x
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('Drawer', () => {
  it('renders a dialog and closes via the close button', async () => {
    const onClose = vi.fn();
    render(
      <Drawer open onClose={onClose} title="Filters">
        body
      </Drawer>,
    );
    expect(screen.getByRole('dialog', { name: 'Filters' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalled();
  });
});

describe('Toast', () => {
  it('shows a toast when the hook fires', async () => {
    function Trigger() {
      const { toast } = useToast();
      return (
        <button type="button" onClick={() => toast({ title: 'Saved', tone: 'success' })}>
          go
        </button>
      );
    }
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'go' }));
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });
});

describe('DropdownMenu', () => {
  it('opens a menu and runs an item', async () => {
    const onSelect = vi.fn();
    render(
      <DropdownMenu
        trigger="Actions"
        items={[{ id: 'edit', label: 'Edit', onSelect }]}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));
    expect(onSelect).toHaveBeenCalled();
  });
});

describe('Combobox', () => {
  it('filters options and selects one', async () => {
    const onChange = vi.fn();
    render(
      <Combobox
        aria-label="Fruit"
        options={[
          { value: 'a', label: 'Apple' },
          { value: 'b', label: 'Banana' },
        ]}
        onChange={onChange}
      />,
    );
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    await userEvent.click(input);
    await userEvent.type(input, 'ban');
    const option = screen.getByRole('option', { name: 'Banana' });
    await userEvent.click(option);
    expect(onChange).toHaveBeenCalledWith('b');
  });
});

describe('DatePicker', () => {
  it('opens the calendar and picks a day', async () => {
    const onChange = vi.fn();
    render(<DatePicker value="2026-06-15" onChange={onChange} aria-label="Date" />);
    await userEvent.click(screen.getByRole('button', { name: 'Date' }));
    expect(screen.getByRole('dialog', { name: 'Calendar' })).toBeInTheDocument();
    // Pick the selected day's neighbour label is unstable; click day "20".
    await userEvent.click(screen.getByRole('gridcell', { name: /Jun 20 2026/ }));
    expect(onChange).toHaveBeenCalledWith('2026-06-20');
  });
});

describe('CommandPalette', () => {
  it('filters commands and runs on Enter', async () => {
    const onRun = vi.fn();
    const onClose = vi.fn();
    render(
      <CommandPalette
        open
        onClose={onClose}
        commands={[
          { id: 'new', label: 'New file', onRun },
          { id: 'open', label: 'Open file', onRun: () => {} },
        ]}
      />,
    );
    const input = screen.getByRole('combobox', { name: 'Command' });
    await userEvent.type(input, 'new');
    await userEvent.keyboard('{Enter}');
    expect(onRun).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
