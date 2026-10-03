// src/components/primitives/Badge.tsx
import type { HTMLAttributes, ReactNode } from 'react';
import './Badge.css';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'accent';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  children?: ReactNode;
}

/** A small status/label pill. Tone maps to the status token family (neutral +
 * success/warning/error/info + accent). Decorative by default; pass a role/
 * aria-label via props when the tone itself carries meaning. */
export function Badge({ tone = 'neutral', className, children, ...rest }: BadgeProps) {
  const classes = ['ui-badge', `ui-badge--${tone}`, className].filter(Boolean).join(' ');
  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
}
