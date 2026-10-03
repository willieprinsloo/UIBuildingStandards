// src/components/theme/__tests__/registry.test.ts
import { describe, it, expect } from 'vitest';
import { THEMES, THEME_IDS, getTheme, themesByMode } from '../registry';

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
});
