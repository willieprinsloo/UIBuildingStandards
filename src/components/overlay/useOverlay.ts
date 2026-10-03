// src/components/overlay/useOverlay.ts
import { useEffect, type RefObject } from 'react';

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

export interface UseOverlayOptions {
  open: boolean;
  onClose: () => void;
  /** Trap focus within the container and restore it on close. Default true. */
  trapFocus?: boolean;
  /** Close on Escape. Default true. */
  closeOnEsc?: boolean;
  /** Lock body scroll while open. Default true. */
  lockScroll?: boolean;
}

/** Shared modal-overlay behaviour: focus trap + Esc-to-close + scroll lock +
 * focus restore. Dependency-free. Attach the returned ref to the dialog
 * container. */
export function useOverlay(
  containerRef: RefObject<HTMLElement | null>,
  { open, onClose, trapFocus = true, closeOnEsc = true, lockScroll = true }: UseOverlayOptions,
): void {
  useEffect(() => {
    if (!open) return;
    const container = containerRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Initial focus: first focusable in the container, else the container.
    const focusables = container?.querySelectorAll<HTMLElement>(FOCUSABLE);
    if (focusables && focusables.length > 0) {
      focusables[0].focus();
    } else {
      container?.focus();
    }

    function onKeyDown(e: KeyboardEvent) {
      if (closeOnEsc && e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (!trapFocus || e.key !== 'Tab' || !container) return;
      const nodes = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (n) => n.offsetParent !== null || n === document.activeElement,
      );
      if (nodes.length === 0) {
        e.preventDefault();
        container.focus();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement as HTMLElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown, true);
    const prevOverflow = document.body.style.overflow;
    if (lockScroll) document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      if (lockScroll) document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, onClose, trapFocus, closeOnEsc, lockScroll, containerRef]);
}
