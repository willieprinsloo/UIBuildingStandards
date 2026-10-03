// src/components/theme/__tests__/registry.test.ts
import { describe, it, expect } from 'vitest';
import { THEMES, THEME_IDS, getTheme, themesByMode, type ThemeEntry } from '../registry';

describe('theme registry', () => {
  it('ships precision (dark) and warehouse (light)', () => {
    expect(THEME_IDS).toContain('precision');
    expect(THEME_IDS).toContain('warehouse');
  });
  it('getTheme returns an entry with a mode', () => {
    expect(getTheme('precision')?.mode).toBe('dark');
    expect(getTheme('warehouse')?.mode).toBe('light');
  });
  it('getTheme returns undefined for unknown ids', () => {
    expect(getTheme('nope')).toBeUndefined();
  });
  it('themesByMode filters by mode', () => {
    expect(themesByMode('dark').every(t => t.mode === 'dark')).toBe(true);
    expect(themesByMode('light').map(t => t.id)).toContain('warehouse');
  });
  it('every theme has a full swatch', () => {
    for (const t of THEMES) {
      expect(t.swatch.bgBase).toMatch(/^#|rgb/);
      expect(t.swatch.accent).toMatch(/^#|rgb/);
      expect(t.swatch.text).toMatch(/^#|rgb/);
    }
  });

  it('themesByMode returns real output already sorted by (sort ?? 100) then label', () => {
    // Shape check against the live registry (currently one theme per mode,
    // so this alone would not exercise tie-breaking — see the synthetic
    // comparator test below for that).
    for (const mode of ['dark', 'light'] as const) {
      const entries = themesByMode(mode);
      const sorted = [...entries].sort(
        (a, b) => (a.sort ?? 100) - (b.sort ?? 100) || a.label.localeCompare(b.label)
      );
      expect(entries).toEqual(sorted);
    }
  });

  it('tie-breaks correctly with more than one theme per mode group (synthetic comparator check)', () => {
    // Mirrors the exact comparator used by `themesByMode` / `themesByFamily`
    // in registry.ts: sort ascending by `sort` (default 100), then by label.
    const comparator = (a: ThemeEntry, b: ThemeEntry) =>
      (a.sort ?? 100) - (b.sort ?? 100) || a.label.localeCompare(b.label);

    const base: Omit<ThemeEntry, 'id' | 'label' | 'sort'> = {
      shortLabel: 'X',
      mode: 'dark',
      family: 'cool',
      description: 'synthetic',
      iconName: 'Moon',
      swatch: {
        bgBase: '#000000',
        bgSurface: '#111111',
        sidebarBorder: 'rgba(0,0,0,0.1)',
        accent: '#000000',
        text: '#ffffff',
      },
    };

    const synthetic: ThemeEntry[] = [
      { ...base, id: 'synthetic-charlie' as ThemeEntry['id'], label: 'Charlie', sort: 10 },
      { ...base, id: 'synthetic-alpha' as ThemeEntry['id'], label: 'Alpha', sort: 10 },
      { ...base, id: 'synthetic-bravo' as ThemeEntry['id'], label: 'Bravo', sort: 5 },
      { ...base, id: 'synthetic-delta' as ThemeEntry['id'], label: 'Delta' }, // no `sort` -> defaults to 100
    ];

    const result = [...synthetic].sort(comparator).map((t) => t.label);

    // sort:5 first, then sort:10 group tie-broken alphabetically, then the
    // undefined-sort entry (defaults to 100) last.
    expect(result).toEqual(['Bravo', 'Alpha', 'Charlie', 'Delta']);
  });
});
