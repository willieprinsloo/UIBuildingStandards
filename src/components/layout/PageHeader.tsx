// src/components/layout/PageHeader.tsx
import type { ReactNode } from 'react';
import './PageHeader.css';

export interface PageHeaderProps {
  /** Page title — rendered as the page's h1. */
  title: ReactNode;
  /** Optional supporting description below the title. */
  description?: ReactNode;
  /** Optional right-aligned actions on the title row. */
  actions?: ReactNode;
  /** Optional slot above the title (e.g. a <Breadcrumbs>). */
  breadcrumbs?: ReactNode;
  /** Optional content below (e.g. <Tabs>). */
  children?: ReactNode;
}

/** The standard page title block at the top of a content area. */
export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  children,
}: PageHeaderProps) {
  return (
    <header className="ui-page-header">
      {breadcrumbs != null && (
        <div className="ui-page-header__breadcrumbs">{breadcrumbs}</div>
      )}
      <div className="ui-page-header__row">
        <h1 className="ui-page-header__title">{title}</h1>
        {actions != null && <div className="ui-page-header__actions">{actions}</div>}
      </div>
      {description != null && (
        <p className="ui-page-header__description">{description}</p>
      )}
      {children != null && <div className="ui-page-header__extra">{children}</div>}
    </header>
  );
}
