// src/components/primitives/Switch.tsx
import type { InputHTMLAttributes, ReactNode } from 'react';
import './Switch.css';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
}

/** A labelled on/off switch. Built on a native checkbox (keyboard + form
 * semantics for free) with role="switch" and a visual track/thumb. */
export function Switch({ label, className, ...rest }: SwitchProps) {
  const classes = ['ui-switch', className].filter(Boolean).join(' ');
  return (
    <label className={classes}>
      <input type="checkbox" role="switch" className="ui-switch__control" {...rest} />
      <span className="ui-switch__track" aria-hidden="true">
        <span className="ui-switch__thumb" />
      </span>
      {label != null && <span className="ui-switch__label">{label}</span>}
    </label>
  );
}
