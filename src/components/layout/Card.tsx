// src/components/layout/Card.tsx
import type { HTMLAttributes, ReactNode } from 'react';
import './Card.css';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Optional header title. */
  title?: ReactNode;
  /** Optional header right-aligned slot (e.g. a Button). */
  actions?: ReactNode;
  /** Optional footer region, separated by a top border. */
  footer?: ReactNode;
  /** Body padding. */
  padding?: 'none' | 'sm' | 'md';
  children: ReactNode;
}

/** A surface container that groups content. Generic tokens only. */
export function Card({
  title,
  actions,
  footer,
  padding = 'md',
  className,
  children,
  ...rest
}: CardProps) {
  const classes = ['ui-card', className].filter(Boolean).join(' ');
  const hasHeader = title != null || actions != null;
  return (
    <div className={classes} {...rest}>
      {hasHeader && (
        <div className="ui-card__header">
          {title != null && <div className="ui-card__title">{title}</div>}
          {actions != null && <div className="ui-card__actions">{actions}</div>}
        </div>
      )}
      <div className={`ui-card__body ui-card__body--${padding}`}>{children}</div>
      {footer != null && <div className="ui-card__footer">{footer}</div>}
    </div>
  );
}
