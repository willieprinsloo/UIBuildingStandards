// src/components/primitives/Input.tsx
import type { InputHTMLAttributes } from 'react';
import './Input.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Mark the field invalid (sets aria-invalid + error styling). */
  invalid?: boolean;
}

export function Input({ invalid = false, className, ...rest }: InputProps) {
  const classes = ['ui-input', invalid ? 'ui-input--invalid' : '', className]
    .filter(Boolean)
    .join(' ');
  return <input className={classes} aria-invalid={invalid || undefined} {...rest} />;
}
