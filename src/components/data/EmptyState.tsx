// src/components/data/EmptyState.tsx
import type { ReactNode } from 'react';
import './EmptyState.css';

export interface EmptyStateProps {
  /** The headline — what's empty, in the user's words. */
  title: ReactNode;
  /** Optional supporting line: why it's empty or what to do next. */
  description?: ReactNode;
  /** Optional decorative icon/illustration slot. */
  icon?: ReactNode;
  /** Optional primary action (e.g. a Button). */
  action?: ReactNode;
}

/** A calm placeholder for empty lists / tables / dashboards. Generic tokens. */
export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="ui-empty" role="status">
      {icon && <div className="ui-empty__icon" aria-hidden="true">{icon}</div>}
      <p className="ui-empty__title">{title}</p>
      {description && <p className="ui-empty__description">{description}</p>}
      {action && <div className="ui-empty__action">{action}</div>}
    </div>
  );
}
