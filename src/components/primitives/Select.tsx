// src/components/primitives/Select.tsx
import type { ReactNode, SelectHTMLAttributes } from 'react';
import './Input.css';
import './Select.css';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
  children?: ReactNode;
}

export function Select({ invalid = false, className, children, ...rest }: SelectProps) {
  const classes = ['ui-select', invalid ? 'ui-select--invalid' : '', className]
    .filter(Boolean)
    .join(' ');
  return (
    <div className="ui-select-wrap">
      <select className={classes} aria-invalid={invalid || undefined} {...rest}>
        {children}
      </select>
      <span className="ui-select__chevron" aria-hidden="true">
        ▾
      </span>
    </div>
  );
}
