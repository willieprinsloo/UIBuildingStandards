import { describe, it, expect } from 'vitest';
import * as theme from '../index';

describe('theme barrel', () => {
  it('re-exports the public API', () => {
    expect(typeof theme.useTheme).toBe('function');
    expect(typeof theme.ThemeToggle).toBe('function');
    expect(typeof theme.ThemePicker).toBe('function');
    expect(typeof theme.getTheme).toBe('function');
    expect(theme.THEME_IDS).toContain('precision');
  });
});
