// src/components/data/StatCard.tsx
import type { ReactNode } from 'react';
import './StatCard.css';

export type StatTrendDirection = 'up' | 'down' | 'flat';
export type StatCardTone = 'default' | 'accent' | 'success' | 'warning' | 'error';

export interface StatCardProps {
  /** Short caption above the value (e.g. "Total views"). */
  label: ReactNode;
  /** The headline figure. */
  value: ReactNode;
  /** Optional secondary line under the value (e.g. "50% of total"). */
  hint?: ReactNode;
  /** Optional trend chip. Direction is conveyed by a glyph + the label text,
   * never colour alone (a11y). */
  trend?: { direction: StatTrendDirection; label: ReactNode };
  /** Tone colours the value + trend accent; `accent` also lifts the surface. */
  tone?: StatCardTone;
  /** Optional leading icon slot. */
  icon?: ReactNode;
}

const TREND_GLYPH: Record<StatTrendDirection, string> = {
  up: '▲',
  down: '▼',
  flat: '→',
};

/** A single dashboard stat tile. Generic tokens only; inherits the theme. */
export function StatCard({ label, value, hint, trend, tone = 'default', icon }: StatCardProps) {
  return (
    <div className={`ui-statcard ui-statcard--${tone}`}>
      {icon && <span className="ui-statcard__icon" aria-hidden="true">{icon}</span>}
      <span className="ui-statcard__label">{label}</span>
      <span className="ui-statcard__value">{value}</span>
      {hint && <span className="ui-statcard__hint">{hint}</span>}
      {trend && (
        <span className={`ui-statcard__trend ui-statcard__trend--${trend.direction}`}>
          <span aria-hidden="true">{TREND_GLYPH[trend.direction]}</span> {trend.label}
        </span>
      )}
    </div>
  );
}
