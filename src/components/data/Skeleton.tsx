// src/components/data/Skeleton.tsx
import type { CSSProperties } from 'react';
import './Skeleton.css';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  /** Border radius override; defaults to --radius-sm (or a circle). */
  radius?: string;
  /** Render a circle (equal width/height, fully rounded). */
  circle?: boolean;
  className?: string;
}

/** A shimmering loading placeholder. Decorative (aria-hidden); announce the
 * loading state with aria-busy on the owning region. Honours reduced-motion. */
export function Skeleton({ width, height, radius, circle, className }: SkeletonProps) {
  const style: CSSProperties = {
    width: width ?? (circle ? '2rem' : '100%'),
    height: height ?? (circle ? '2rem' : '1em'),
    borderRadius: radius ?? (circle ? '50%' : undefined),
  };
  const classes = ['ui-skeleton', className].filter(Boolean).join(' ');
  return <span className={classes} style={style} aria-hidden="true" />;
}
