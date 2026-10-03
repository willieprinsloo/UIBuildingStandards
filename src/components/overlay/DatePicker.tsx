// src/components/overlay/DatePicker.tsx
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import './DatePicker.css';

export interface DatePickerProps {
  /** Selected date as ISO yyyy-mm-dd. */
  value?: string;
  onChange: (iso: string) => void;
  /** Inclusive bounds as ISO yyyy-mm-dd. */
  min?: string;
  max?: string;
  'aria-label'?: string;
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function iso(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}
function parse(s?: string): Date | null {
  if (!s) return null;
  const d = new Date(`${s}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}
/** Monday-first weekday index (0=Mon … 6=Sun). */
function mondayIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

/** A date field with a calendar popover. Arrow keys move by day/week in the
 * grid; Esc closes. Generic tokens only; dependency-free (no date library). */
export function DatePicker({ value, onChange, min, max, 'aria-label': ariaLabel }: DatePickerProps) {
  const selected = parse(value);
  const minD = parse(min);
  const maxD = parse(max);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Date>(selected ?? new Date());
  const [focusDate, setFocusDate] = useState<Date>(selected ?? new Date());
  const rootRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  function disabled(d: Date): boolean {
    if (minD && d < minD) return true;
    if (maxD && d > maxD) return true;
    return false;
  }

  function focusCell(d: Date) {
    setFocusDate(d);
    setView(new Date(d.getFullYear(), d.getMonth(), 1));
    requestAnimationFrame(() => {
      gridRef.current
        ?.querySelector<HTMLButtonElement>(`[data-iso="${iso(d)}"]`)
        ?.focus();
    });
  }

  function onGridKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const d = new Date(focusDate);
    let handled = true;
    switch (e.key) {
      case 'ArrowLeft': d.setDate(d.getDate() - 1); break;
      case 'ArrowRight': d.setDate(d.getDate() + 1); break;
      case 'ArrowUp': d.setDate(d.getDate() - 7); break;
      case 'ArrowDown': d.setDate(d.getDate() + 7); break;
      case 'Home': d.setDate(d.getDate() - mondayIndex(d)); break;
      case 'End': d.setDate(d.getDate() + (6 - mondayIndex(d))); break;
      case 'PageUp': d.setMonth(d.getMonth() - 1); break;
      case 'PageDown': d.setMonth(d.getMonth() + 1); break;
      case 'Escape': setOpen(false); handled = true; break;
      case 'Enter':
      case ' ':
        if (!disabled(focusDate)) {
          onChange(iso(focusDate));
          setOpen(false);
        }
        break;
      default: handled = false;
    }
    if (handled) {
      e.preventDefault();
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key)) {
        focusCell(d);
      }
    }
  }

  // Build the weeks grid for the current view month.
  const year = view.getFullYear();
  const month = view.getMonth();
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(1 - mondayIndex(first));
  const weeks: Date[][] = [];
  const cursor = new Date(start);
  for (let w = 0; w < 6; w++) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  return (
    <div className="ui-datepicker" ref={rootRef}>
      <button
        type="button"
        className="ui-datepicker__field"
        aria-label={ariaLabel ?? 'Choose date'}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={selected ? '' : 'ui-datepicker__placeholder'}>
          {selected ? iso(selected) : 'yyyy-mm-dd'}
        </span>
        <span aria-hidden="true" className="ui-datepicker__icon">📅</span>
      </button>

      {open && (
        <div className="ui-datepicker__popover" role="dialog" aria-label="Calendar">
          <div className="ui-datepicker__nav">
            <button type="button" aria-label="Previous month" onClick={() => setView(new Date(year, month - 1, 1))}>‹</button>
            <span className="ui-datepicker__month" aria-live="polite">{MONTHS[month]} {year}</span>
            <button type="button" aria-label="Next month" onClick={() => setView(new Date(year, month + 1, 1))}>›</button>
          </div>
          <div className="ui-datepicker__weekdays" aria-hidden="true">
            {WEEKDAYS.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>
          <div className="ui-datepicker__grid" role="grid" ref={gridRef} onKeyDown={onGridKeyDown}>
            {weeks.map((week, wi) => (
              <div className="ui-datepicker__week" role="row" key={wi}>
                {week.map((d) => {
                  const inMonth = d.getMonth() === month;
                  const isSel = selected != null && iso(d) === iso(selected);
                  const isFocus = iso(d) === iso(focusDate);
                  const dis = disabled(d);
                  return (
                    <button
                      key={iso(d)}
                      type="button"
                      role="gridcell"
                      data-iso={iso(d)}
                      tabIndex={isFocus ? 0 : -1}
                      aria-selected={isSel}
                      aria-label={d.toDateString()}
                      disabled={dis}
                      className={[
                        'ui-datepicker__day',
                        inMonth ? '' : 'ui-datepicker__day--muted',
                        isSel ? 'ui-datepicker__day--selected' : '',
                      ].filter(Boolean).join(' ')}
                      onClick={() => {
                        if (dis) return;
                        onChange(iso(d));
                        setOpen(false);
                      }}
                    >
                      {d.getDate()}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
