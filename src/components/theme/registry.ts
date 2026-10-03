// src/components/theme/registry.ts
export type ThemeMode = 'dark' | 'light';

export type ThemeFamily =
  | 'cool' | 'warm' | 'mono' | 'organic' | 'neon'
  | 'editorial' | 'industrial' | 'pastel' | 'mathematical';

export interface ThemeSwatch {
  /** Page background */
  bgBase: string;
  /** Card / sidebar surface */
  bgSurface: string;
  /** Sidebar separator border */
  sidebarBorder: string;
  /** Primary accent */
  accent: string;
  /** Primary text */
  text: string;
}

export interface ThemeMeta {
  id: string;
  label: string;
  shortLabel: string;
  mode: ThemeMode;
  family: ThemeFamily;
  /** One sentence, <=80 chars */
  description: string;
  /** Icon name string — the picker resolves it to a glyph however it likes. */
  iconName: string;
  swatch: ThemeSwatch;
  /** Sort weight within mode group — lower first. Default 100. */
  sort?: number;
}

/**
 * Every theme the standard ships. Keep annotation-free: `as const satisfies`
 * (in that order) type-checks each entry AND keeps the literal tuple so
 * `ThemeId` stays a precise union rather than collapsing to `string`.
 */
export const THEMES = [
  {
    id: 'precision',
    label: 'Precision (Dark)',
    shortLabel: 'Precision',
    mode: 'dark',
    family: 'cool',
    description: 'High-contrast dark interface for focused work.',
    iconName: 'Moon',
    sort: 10,
    swatch: {
      bgBase: '#0C0D11',
      bgSurface: '#13141A',
      sidebarBorder: 'rgba(255,255,255,0.12)',
      accent: '#2E6BE6',
      text: '#EDEDF0',
    },
  },
  {
    id: 'warehouse',
    label: 'Warehouse (Light)',
    shortLabel: 'Warehouse',
    mode: 'light',
    family: 'warm',
    description: 'Warm, paper-like light interface for daytime work.',
    iconName: 'Sun',
    sort: 10,
    swatch: {
      bgBase: '#F6F3EE',
      bgSurface: '#FFFFFF',
      sidebarBorder: 'rgba(28,25,23,0.15)',
      accent: '#0D9488',
      text: '#1C1917',
    },
  },
] as const satisfies readonly ThemeMeta[];

export type ThemeId = (typeof THEMES)[number]['id'];
export const THEME_IDS: readonly ThemeId[] = THEMES.map((t) => t.id);
export type ThemeEntry = ThemeMeta & { id: ThemeId };

export function getTheme(id: string): ThemeEntry | undefined {
  return THEMES.find((t) => t.id === id) as ThemeEntry | undefined;
}

export function themesByMode(mode: ThemeMode): ThemeEntry[] {
  return (THEMES as readonly ThemeEntry[])
    .filter((t) => t.mode === mode)
    .sort((a, b) => (a.sort ?? 100) - (b.sort ?? 100) || a.label.localeCompare(b.label));
}

export function themesByFamily(): Record<ThemeFamily, ThemeEntry[]> {
  const result = {} as Record<ThemeFamily, ThemeEntry[]>;
  for (const theme of THEMES as readonly ThemeEntry[]) {
    (result[theme.family] ??= []).push(theme);
  }
  for (const family of Object.keys(result) as ThemeFamily[]) {
    result[family].sort(
      (a, b) => (a.sort ?? 100) - (b.sort ?? 100) || a.label.localeCompare(b.label),
    );
  }
  return result;
}
