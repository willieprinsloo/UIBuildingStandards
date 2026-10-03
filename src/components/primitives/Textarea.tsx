// src/components/primitives/Textarea.tsx
import type { TextareaHTMLAttributes } from 'react';
import './Input.css';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({ invalid = false, className, ...rest }: TextareaProps) {
  const classes = ['ui-textarea', invalid ? 'ui-textarea--invalid' : '', className]
    .filter(Boolean)
    .join(' ');
  return <textarea className={classes} aria-invalid={invalid || undefined} {...rest} />;
}
