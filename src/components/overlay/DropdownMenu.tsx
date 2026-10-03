// src/components/overlay/DropdownMenu.tsx
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import './DropdownMenu.css';

export interface DropdownMenuItem {
  id: string;
  label: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  danger?: boolean;
}

export interface DropdownMenuProps {
  /** The trigger button's content. */
  trigger: ReactNode;
  items: DropdownMenuItem[];
  /** Horizontal alignment of the menu to the trigger. Default 'start'. */
  align?: 'start' | 'end';
  'aria-label'?: string;
}

/** A button that opens a keyboard-navigable menu. Closes on outside click,
 * Esc, or selection. Generic tokens only; dependency-free. */
export function DropdownMenu({ trigger, items, align = 'start', 'aria-label': ariaLabel }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const enabledIndexes = items.map((it, i) => (it.disabled ? -1 : i)).filter((i) => i >= 0);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open, close]);

  useEffect(() => {
    if (open) {
      const first = enabledIndexes[0] ?? 0;
      setActiveIndex(first);
      // focus after paint
      requestAnimationFrame(() => itemRefs.current[first]?.focus());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function moveActive(delta: number) {
    if (enabledIndexes.length === 0) return;
    const pos = enabledIndexes.indexOf(activeIndex);
    const nextPos = (pos + delta + enabledIndexes.length) % enabledIndexes.length;
    const next = enabledIndexes[nextPos];
    setActiveIndex(next);
    itemRefs.current[next]?.focus();
  }

  function onMenuKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        moveActive(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        moveActive(-1);
        break;
      case 'Home':
        e.preventDefault();
        if (enabledIndexes[0] != null) {
          setActiveIndex(enabledIndexes[0]);
          itemRefs.current[enabledIndexes[0]]?.focus();
        }
        break;
      case 'End':
        e.preventDefault();
        {
          const last = enabledIndexes[enabledIndexes.length - 1];
          if (last != null) {
            setActiveIndex(last);
            itemRefs.current[last]?.focus();
          }
        }
        break;
      case 'Escape':
        e.preventDefault();
        close();
        break;
    }
  }

  function select(item: DropdownMenuItem) {
    if (item.disabled) return;
    item.onSelect?.();
    close();
  }

  return (
    <div className="ui-dropdown" ref={rootRef}>
      <button
        type="button"
        className="ui-dropdown__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        {trigger}
      </button>
      {open && (
        <div
          role="menu"
          aria-label={ariaLabel}
          className={`ui-dropdown__menu ui-dropdown__menu--${align}`}
          onKeyDown={onMenuKeyDown}
        >
          {items.map((item, i) => (
            <button
              key={item.id}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              type="button"
              role="menuitem"
              tabIndex={i === activeIndex ? 0 : -1}
              disabled={item.disabled}
              className={`ui-dropdown__item${item.danger ? ' ui-dropdown__item--danger' : ''}`}
              onClick={() => select(item)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
