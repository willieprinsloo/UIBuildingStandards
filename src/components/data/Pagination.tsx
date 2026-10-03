// src/components/data/Pagination.tsx
import './Pagination.css';

export interface PaginationProps {
  /** 1-based current page. */
  page: number;
  pageSize: number;
  /** Total matching rows across all pages. */
  total: number;
  onPageChange: (page: number) => void;
  /** Pages shown on each side of the current page. Default 1. */
  siblingCount?: number;
}

type Slot = number | 'gap';

function pages(current: number, totalPages: number, sibling: number): Slot[] {
  const first = 1;
  const last = totalPages;
  const start = Math.max(first, current - sibling);
  const end = Math.min(last, current + sibling);
  const slots: Slot[] = [];
  slots.push(first);
  if (start > first + 1) slots.push('gap');
  for (let p = start; p <= end; p++) {
    if (p !== first && p !== last) slots.push(p);
  }
  if (end < last - 1) slots.push('gap');
  if (last !== first) slots.push(last);
  return slots;
}

/** Page navigator for a paged list. Controlled by `page`. */
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  siblingCount = 1,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  if (totalPages <= 1) return null;
  const slots = pages(page, totalPages, siblingCount);

  return (
    <nav className="ui-pagination" aria-label="Pagination">
      <button
        type="button"
        className="ui-pagination__btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        ‹
      </button>
      {slots.map((slot, i) =>
        slot === 'gap' ? (
          <span key={`gap-${i}`} className="ui-pagination__gap" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={slot}
            type="button"
            className={`ui-pagination__btn${slot === page ? ' ui-pagination__btn--active' : ''}`}
            onClick={() => onPageChange(slot)}
            aria-current={slot === page ? 'page' : undefined}
            aria-label={`Page ${slot}`}
          >
            {slot}
          </button>
        ),
      )}
      <button
        type="button"
        className="ui-pagination__btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        ›
      </button>
    </nav>
  );
}
