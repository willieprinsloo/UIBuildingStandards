// src/components/overlay/Drawer.tsx
import { useRef, type ReactNode } from 'react';
import { useOverlay } from './useOverlay';
import './Drawer.css';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** Edge the panel slides in from. Default 'right'. */
  side?: 'right' | 'left';
  closeOnBackdrop?: boolean;
}

/** A side panel over a backdrop. Focus-trapped, Esc-closable, scroll-locked;
 * restores focus on close. Generic tokens only. */
export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  side = 'right',
  closeOnBackdrop = true,
}: DrawerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = 'ui-drawer-title';
  useOverlay(ref, { open, onClose });
  if (!open) return null;

  return (
    <div
      className="ui-drawer__backdrop"
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
        className={`ui-drawer ui-drawer--${side}`}
      >
        {title != null && (
          <div className="ui-drawer__header">
            <h2 id={titleId} className="ui-drawer__title">
              {title}
            </h2>
            <button type="button" className="ui-drawer__close" onClick={onClose} aria-label="Close">
              <span aria-hidden="true">×</span>
            </button>
          </div>
        )}
        <div className="ui-drawer__body">{children}</div>
        {footer != null && <div className="ui-drawer__footer">{footer}</div>}
      </div>
    </div>
  );
}
