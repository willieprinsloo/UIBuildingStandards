// src/components/primitives/Radio.tsx
import type { InputHTMLAttributes, ReactNode } from 'react';
import './Choice.css';

export interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
}

export function Radio({ label, className, ...rest }: RadioProps) {
  const classes = ['ui-choice', className].filter(Boolean).join(' ');
  return (
    <label className={classes}>
      <input type="radio" className="ui-choice__control" {...rest} />
      {label != null && <span className="ui-choice__label">{label}</span>}
    </label>
  );
}
