// src/components/theme/ThemePicker.tsx
import { useEffect, useRef, useState } from 'react';
import { useTheme } from './useTheme';
import { themesByMode, getTheme, type ThemeEntry } from './registry';
import type { ThemePreference } from './useTheme';
import './ThemePicker.css';

export interface ThemePickerProps {
  className?: string;
}

export function ThemePicker({ className }: ThemePickerProps) {
  const { preference, resolvedTheme, setPreference } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const dark = themesByMode('dark');
  const light = themesByMode('light');
  const active = getTheme(resolvedTheme);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  function choose(pref: ThemePreference) {
    setPreference(pref);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape' && open) {
      e.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
    }
  }

  function renderGroup(label: string, entries: ThemeEntry[]) {
    return (
      <div className="ui-theme-picker__group" role="group" aria-label={label}>
        <div className="ui-theme-picker__group-label">{label}</div>
        {entries.map((t) => (
          <button
            key={t.id}
            type="button"
            role="option"
            aria-selected={preference === t.id}
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
        ))}
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
            type="button"
            role="option"
            aria-selected={preference === 'system'}
            className="ui-theme-picker__option"
            onClick={() => choose('system')}
          >
            <span className="ui-theme-picker__swatch ui-theme-picker__swatch--system" aria-hidden="true" />
            <span className="ui-theme-picker__label">System</span>
          </button>
          {renderGroup('Dark', dark)}
          {renderGroup('Light', light)}
        </div>
      )}
    </div>
  );
}
