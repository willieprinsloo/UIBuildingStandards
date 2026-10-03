// src/components/overlay/Modal.tsx
import { useRef, type ReactNode } from 'react';
import { useOverlay } from './useOverlay';
import './Modal.css';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  /** Footer region (actions). */
  footer?: ReactNode;
  /** Close when the backdrop is clicked. Default true. */
  closeOnBackdrop?: boolean;
  /** Max width of the dialog. */
  size?: 'sm' | 'md' | 'lg';
}

/** A centered modal dialog with a backdrop. Focus-trapped, Esc-closable,
 * scroll-locked; restores focus on close. Generic tokens only. */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  closeOnBackdrop = true,
  size = 'md',
}: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = 'ui-modal-title';
  useOverlay(ref, { open, onClose });
  if (!open) return null;

  return (
    <div
      className="ui-modal__backdrop"
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title != null ? titleId : undefined}
        tabIndex={-1}
        className={`ui-modal ui-modal--${size}`}
      >
        {title != null && (
          <div className="ui-modal__header">
            <h2 id={titleId} className="ui-modal__title">
              {title}
            </h2>
            <button
              type="button"
              className="ui-modal__close"
              onClick={onClose}
              aria-label="Close"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        )}
        <div className="ui-modal__body">{children}</div>
        {footer != null && <div className="ui-modal__footer">{footer}</div>}
      </div>
    </div>
  );
}
