// src/components/primitives/FormField.tsx
import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import './FormField.css';

export interface FormFieldProps {
  /** The control's id; also used to wire the <label for> + describedby ids. */
  htmlFor: string;
  label: ReactNode;
  required?: boolean;
  description?: ReactNode;
  /** When present the field is in an error state and the control is marked
   * aria-invalid + described by the error message. */
  error?: ReactNode;
  /** A single form control (Input/Select/Textarea/…). */
  children: ReactElement;
  className?: string;
}

/** Labels a control and wires description/error to it accessibly: injects the
 * control's id, aria-describedby (description + error), and aria-invalid. */
export function FormField({
  htmlFor,
  label,
  required = false,
  description,
  error,
  children,
  className,
}: FormFieldProps) {
  const descId = description ? `${htmlFor}-desc` : undefined;
  const errId = error ? `${htmlFor}-error` : undefined;

  let control: ReactNode = children;
  if (isValidElement(children)) {
    const childProps = children.props as Record<string, unknown>;
    const describedBy = [childProps['aria-describedby'] as string | undefined, descId, errId]
      .filter(Boolean)
      .join(' ');
    control = cloneElement(children, {
      id: (childProps.id as string | undefined) ?? htmlFor,
      'aria-describedby': describedBy || undefined,
      'aria-invalid': error ? true : (childProps['aria-invalid'] as boolean | undefined),
    } as Record<string, unknown>);
  }

  return (
    <div className={['ui-field', className].filter(Boolean).join(' ')}>
      <label className="ui-field__label" htmlFor={htmlFor}>
        {label}
        {required && (
          <span className="ui-field__required" aria-hidden="true">
            {' *'}
          </span>
        )}
      </label>
      {description && (
        <p id={descId} className="ui-field__description">
          {description}
        </p>
      )}
      {control}
      {error && (
        <p id={errId} className="ui-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
