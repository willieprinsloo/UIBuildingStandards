// src/components/layout/Breadcrumbs.tsx
import type { ReactNode } from 'react';
import './Breadcrumbs.css';

export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  /** Separator between items; rendered aria-hidden. Default "/". */
  separator?: ReactNode;
}

/** Hierarchical trail. The last item is the current page (aria-current). */
export function Breadcrumbs({ items, separator = '/' }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="ui-breadcrumbs">
      <ol className="ui-breadcrumbs__list">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="ui-breadcrumbs__item">
              {last ? (
                <span aria-current="page" className="ui-breadcrumbs__current">
                  {item.label}
                </span>
              ) : item.href ? (
                <a className="ui-breadcrumbs__link" href={item.href}>
                  {item.label}
                </a>
              ) : item.onClick ? (
                <button
                  type="button"
                  className="ui-breadcrumbs__link ui-breadcrumbs__link--button"
                  onClick={item.onClick}
                >
                  {item.label}
                </button>
              ) : (
                <span className="ui-breadcrumbs__text">{item.label}</span>
              )}
              {!last && (
                <span aria-hidden="true" className="ui-breadcrumbs__sep">
                  {separator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
