// src/components/theme/ThemePicker.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from './useTheme';
import { themesByMode, getTheme, type ThemeEntry } from './registry';
import type { ThemePreference } from './useTheme';
import './ThemePicker.css';

export interface ThemePickerProps {
  className?: string;
}

/** A flattened, orderable option in the listbox: System, then Dark, then Light. */
interface PickerOption {
  pref: ThemePreference;
  label: string;
}

export function ThemePicker({ className }: ThemePickerProps) {
  const { preference, resolvedTheme, setPreference } = useTheme();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const dark = themesByMode('dark');
  const light = themesByMode('light');
  const active = getTheme(resolvedTheme);

  const options = useMemo<PickerOption[]>(
    () => [
      { pref: 'system', label: 'System' },
      ...dark.map((t) => ({ pref: t.id as ThemePreference, label: t.label })),
      ...light.map((t) => ({ pref: t.id as ThemePreference, label: t.label })),
    ],
    [dark, light]
  );

  const systemSwatchStyle = useMemo(() => {
    const darkBg = getTheme('precision')?.swatch.bgBase;
    const lightBg = getTheme('warehouse')?.swatch.bgBase;
    return { background: `linear-gradient(135deg, ${darkBg} 0 50%, ${lightBg} 50% 100%)` };
  }, []);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const initialIndex = Math.max(0, options.findIndex((o) => o.pref === preference));
    setActiveIndex(initialIndex);
    optionRefs.current[initialIndex]?.focus();
    // Only on open — subsequent keyboard moves manage focus themselves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function choose(pref: ThemePreference) {
    setPreference(pref);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function moveTo(index: number) {
    const clamped = Math.max(0, Math.min(options.length - 1, index));
    setActiveIndex(clamped);
    optionRefs.current[clamped]?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      if (open) {
        e.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }
      return;
    }
    if (!open) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        moveTo(activeIndex + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        moveTo(activeIndex - 1);
        break;
      case 'Home':
        e.preventDefault();
        moveTo(0);
        break;
      case 'End':
        e.preventDefault();
        moveTo(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        choose(options[activeIndex].pref);
        break;
      default:
        break;
    }
  }

  function renderGroup(label: string, entries: ThemeEntry[], indexOffset: number) {
    return (
      <div className="ui-theme-picker__group" role="group" aria-label={label}>
        <div className="ui-theme-picker__group-label">{label}</div>
        {entries.map((t, i) => {
          const index = indexOffset + i;
          return (
            <button
              key={t.id}
              ref={(el) => {
                optionRefs.current[index] = el;
              }}
              type="button"
              role="option"
              aria-selected={preference === t.id}
              tabIndex={index === activeIndex ? 0 : -1}
              className="ui-theme-picker__option"
              onClick={() => choose(t.id)}
            >
              <span
                className="ui-theme-picker__swatch"
                aria-hidden="true"
                style={{ background: t.swatch.bgBase, borderColor: t.swatch.sidebarBorder }}
              >
                <span style={{ background: t.swatch.accent }} />
              </span>
              <span className="ui-theme-picker__label">{t.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className={['ui-theme-picker', className].filter(Boolean).join(' ')}
      onKeyDown={onKeyDown}
    >
      <button
        ref={triggerRef}
        type="button"
        className="ui-theme-picker__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span
          className="ui-theme-picker__swatch"
          aria-hidden="true"
          style={{ background: active?.swatch.bgBase, borderColor: active?.swatch.sidebarBorder }}
        >
          <span style={{ background: active?.swatch.accent }} />
        </span>
        <span className="ui-theme-picker__label">{active?.shortLabel ?? 'Theme'}</span>
      </button>

      {open && (
        <div className="ui-theme-picker__popover" role="listbox" aria-label="Theme">
          <button
            ref={(el) => {
              optionRefs.current[0] = el;
            }}
            type="button"
            role="option"
            aria-selected={preference === 'system'}
            tabIndex={0 === activeIndex ? 0 : -1}
            className="ui-theme-picker__option"
            onClick={() => choose('system')}
          >
            <span
              className="ui-theme-picker__swatch ui-theme-picker__swatch--system"
              aria-hidden="true"
              style={systemSwatchStyle}
            />
            <span className="ui-theme-picker__label">System</span>
          </button>
          {renderGroup('Dark', dark, 1)}
          {renderGroup('Light', light, 1 + dark.length)}
        </div>
      )}
    </div>
  );
}
