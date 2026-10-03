// src/components/primitives/Checkbox.tsx
import type { InputHTMLAttributes, ReactNode } from 'react';
import './Choice.css';

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
}

export function Checkbox({ label, className, ...rest }: CheckboxProps) {
  const classes = ['ui-choice', className].filter(Boolean).join(' ');
  return (
    <label className={classes}>
      <input type="checkbox" className="ui-choice__control" {...rest} />
      {label != null && <span className="ui-choice__label">{label}</span>}
    </label>
  );
}
