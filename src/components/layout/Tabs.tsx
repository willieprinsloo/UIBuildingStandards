// src/components/layout/Tabs.tsx
import type { KeyboardEvent, ReactNode } from 'react';
import './Tabs.css';

export interface TabItem {
  id: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  /** Active tab id (controlled). */
  value: string;
  onChange: (id: string) => void;
  /** Accessible name for the tablist. */
  'aria-label'?: string;
}

/** Controlled WAI-ARIA tablist. Renders tabs only; the consumer renders the
 * panel with id `${tabId}-panel` and `role="tabpanel"`. */
export function Tabs({ tabs, value, onChange, 'aria-label': ariaLabel }: TabsProps) {
  const enabled = tabs.filter((t) => !t.disabled);

  function move(delta: number, fromId: string) {
    if (enabled.length === 0) return;
    const idx = enabled.findIndex((t) => t.id === fromId);
    const base = idx === -1 ? 0 : idx;
    const next = enabled[(base + delta + enabled.length) % enabled.length];
    if (next) onChange(next.id);
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, id: string) {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        move(1, id);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        move(-1, id);
        break;
      case 'Home':
        e.preventDefault();
        if (enabled[0]) onChange(enabled[0].id);
        break;
      case 'End':
        e.preventDefault();
        if (enabled.length) onChange(enabled[enabled.length - 1].id);
        break;
    }
  }

  return (
    <div role="tablist" aria-label={ariaLabel} className="ui-tabs">
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${tab.id}-tab`}
            aria-selected={active}
            aria-controls={`${tab.id}-panel`}
            disabled={tab.disabled}
            tabIndex={active ? 0 : -1}
            className={`ui-tabs__tab${active ? ' ui-tabs__tab--active' : ''}`}
            onClick={() => !tab.disabled && onChange(tab.id)}
            onKeyDown={(e) => onKeyDown(e, tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
