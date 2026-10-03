// src/components/theme/ThemeToggle.tsx
import { useTheme } from './useTheme';
import { getTheme } from './registry';
import './ThemeToggle.css';

export interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setPreference } = useTheme();
  const isDark = getTheme(resolvedTheme)?.mode === 'dark';

  return (
    <button
      type="button"
      className={['ui-theme-toggle', className].filter(Boolean).join(' ')}
      aria-pressed={isDark}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={() => setPreference(isDark ? 'warehouse' : 'precision')}
    >
      <span aria-hidden="true" className="ui-theme-toggle__icon">
        {isDark ? '☾' : '☀'}
      </span>
    </button>
  );
}
