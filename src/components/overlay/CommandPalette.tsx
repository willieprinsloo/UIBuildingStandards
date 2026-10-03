// src/components/overlay/CommandPalette.tsx
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { useOverlay } from './useOverlay';
import './CommandPalette.css';

export interface Command {
  id: string;
  label: string;
  hint?: ReactNode;
  keywords?: string[];
  onRun: () => void;
}

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  commands: Command[];
  placeholder?: string;
}

/** A searchable command launcher in a modal overlay (⌘K style). Focus-trapped,
 * Esc-closable. Arrow keys move the active command; Enter runs it. Generic
 * tokens only; dependency-free. */
export function CommandPalette({
  open,
  onClose,
  commands,
  placeholder = 'Type a command…',
}: CommandPaletteProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  useOverlay(ref, { open, onClose });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => {
      const hay = [c.label, ...(c.keywords ?? [])].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [commands, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  if (!open) return null;

  function run(cmd: Command | undefined) {
    if (!cmd) return;
    cmd.onRun();
    onClose();
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(filtered[activeIndex]);
    }
  }

  const listId = 'ui-cmdk-list';

  return (
    <div
      className="ui-cmdk__backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="ui-cmdk"
        onKeyDown={onKeyDown}
      >
        <input
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={filtered[activeIndex] ? `${listId}-${activeIndex}` : undefined}
          aria-autocomplete="list"
          aria-label="Command"
          className="ui-cmdk__input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <ul id={listId} role="listbox" className="ui-cmdk__list">
          {filtered.length === 0 ? (
            <li className="ui-cmdk__empty" aria-disabled="true">
              No commands
            </li>
          ) : (
            filtered.map((cmd, i) => (
              <li
                key={cmd.id}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                className={`ui-cmdk__item${i === activeIndex ? ' ui-cmdk__item--active' : ''}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  run(cmd);
                }}
                onMouseEnter={() => setActiveIndex(i)}
              >
                <span className="ui-cmdk__label">{cmd.label}</span>
                {cmd.hint != null && <span className="ui-cmdk__hint">{cmd.hint}</span>}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
