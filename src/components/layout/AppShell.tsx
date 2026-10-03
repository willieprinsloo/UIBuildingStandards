// src/components/layout/AppShell.tsx
import { useState, type ReactNode } from 'react';
import './AppShell.css';

export interface NavItem {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}

export interface NavSection {
  label?: ReactNode;
  items: NavItem[];
}

export interface AppShellProps {
  /** Top-left slot (logo / wordmark). */
  brand?: ReactNode;
  /** Top-right slot (theme toggle, user menu, …). */
  topbar?: ReactNode;
  /** Primary navigation, grouped into sections. */
  nav: NavSection[];
  /** Bottom-of-sidebar items (user / settings / logout). */
  footer?: NavItem[];
  /** Controlled collapse. When omitted, internal state is used (and CSS
   * collapses automatically below 1024px). */
  collapsed?: boolean;
  /** When provided, a collapse toggle button is rendered. */
  onToggleCollapse?: () => void;
  children: ReactNode;
}

/** When the label is a plain string, expose it as an accessible name so a
 * collapsed (icon-only) item still has one. */
function labelText(label: ReactNode): string | undefined {
  return typeof label === 'string' ? label : undefined;
}

function NavLink({ item }: { item: NavItem }) {
  const className = `ui-appshell__nav-item${item.active ? ' ui-appshell__nav-item--active' : ''}`;
  const inner = (
    <>
      {item.icon != null && (
        <span className="ui-appshell__nav-icon" aria-hidden="true">
          {item.icon}
        </span>
      )}
      <span className="ui-appshell__nav-label">{item.label}</span>
    </>
  );
  if (item.href) {
    return (
      <a
        className={className}
        href={item.href}
        aria-current={item.active ? 'page' : undefined}
        aria-label={labelText(item.label)}
      >
        {inner}
      </a>
    );
  }
  return (
    <button
      type="button"
      className={className}
      onClick={item.onClick}
      aria-current={item.active ? 'page' : undefined}
      aria-label={labelText(item.label)}
    >
      {inner}
    </button>
  );
}

/** The admin-system frame: sticky top bar + collapsible left sidebar + a
 * scrollable content region. Generic tokens only; dependency-free. */
export function AppShell({
  brand,
  topbar,
  nav,
  footer,
  collapsed,
  onToggleCollapse,
  children,
}: AppShellProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = collapsed ?? internalCollapsed;

  function toggle() {
    if (onToggleCollapse) onToggleCollapse();
    else setInternalCollapsed((c) => !c);
  }

  return (
    <div className={`ui-appshell${isCollapsed ? ' ui-appshell--collapsed' : ''}`}>
      <header className="ui-appshell__topbar">
        <div className="ui-appshell__brand">{brand}</div>
        <div className="ui-appshell__topbar-actions">{topbar}</div>
      </header>

      <nav className="ui-appshell__sidebar" aria-label="Primary">
        <div className="ui-appshell__nav-scroll">
          {nav.map((section, i) => (
            <div className="ui-appshell__nav-section" key={i}>
              {section.label != null && (
                <div className="ui-appshell__nav-section-label">{section.label}</div>
              )}
              {section.items.map((item) => (
                <NavLink key={item.id} item={item} />
              ))}
            </div>
          ))}
        </div>

        {footer && footer.length > 0 && (
          <div className="ui-appshell__nav-footer">
            {footer.map((item) => (
              <NavLink key={item.id} item={item} />
            ))}
          </div>
        )}

        {(onToggleCollapse || collapsed === undefined) && (
          <button
            type="button"
            className="ui-appshell__collapse"
            onClick={toggle}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-pressed={isCollapsed}
          >
            <span aria-hidden="true">{isCollapsed ? '»' : '«'}</span>
          </button>
        )}
      </nav>

      <main className="ui-appshell__content">{children}</main>
    </div>
  );
}
