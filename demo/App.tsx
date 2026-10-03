import { useState } from 'react';
import { ThemeToggle, ThemePicker, useTheme } from '@/components/theme';
import { Gallery } from './Gallery';

const NAV_ITEMS = ['Dashboard', 'Orders', 'Products', 'Customers', 'Settings'] as const;

const BG_SWATCHES = [
  { label: '--bg-base', token: '--bg-base' },
  { label: '--bg-surface-1', token: '--bg-surface-1' },
  { label: '--bg-surface-2', token: '--bg-surface-2' },
  { label: '--bg-surface-3', token: '--bg-surface-3' },
  { label: '--accent', token: '--accent' },
] as const;

const STATUS_SWATCHES = [
  { label: '--status-success', token: '--status-success' },
  { label: '--status-warning', token: '--status-warning' },
  { label: '--status-error', token: '--status-error' },
  { label: '--status-info', token: '--status-info' },
] as const;

const TYPE_SAMPLES = [
  { label: '--type-display', token: '--type-display', text: 'Display heading' },
  { label: '--type-h1', token: '--type-h1', text: 'Heading one' },
  { label: '--type-h2', token: '--type-h2', text: 'Heading two' },
  { label: '--type-body', token: '--type-body', text: 'Body text reads comfortably at this size.' },
  { label: '--type-caption', token: '--type-caption', text: 'Caption text for supporting detail.' },
] as const;

const SPACE_SAMPLES = [
  { label: '--space-2', token: '--space-2' },
  { label: '--space-4', token: '--space-4' },
  { label: '--space-6', token: '--space-6' },
  { label: '--space-8', token: '--space-8' },
] as const;

const RADIUS_SAMPLES = [
  { label: '--radius-sm', token: '--radius-sm' },
  { label: '--radius-md', token: '--radius-md' },
  { label: '--radius-lg', token: '--radius-lg' },
  { label: '--radius-xl', token: '--radius-xl' },
] as const;

function Swatch({ label, token }: { label: string; token: string }) {
  return (
    <div className="swatch">
      <div className="swatch__tile" style={{ background: `var(${token})` }} />
      <div className="swatch__label">{label}</div>
    </div>
  );
}

export function App() {
  const { resolvedTheme } = useTheme();
  const [activeNav, setActiveNav] = useState<string>(NAV_ITEMS[0]);

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar__brand">UI Standards</div>
        <div className="topbar__actions">
          <ThemeToggle />
          <ThemePicker />
        </div>
      </header>

      <div className="shell__body">
        <nav className="sidebar" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              type="button"
              className={
                item === activeNav ? 'sidebar__item sidebar__item--active' : 'sidebar__item'
              }
              onClick={() => setActiveNav(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        <main className="content">
          <section className="showcase-intro">
            <h1 className="showcase-intro__title">Token showcase</h1>
            <p className="showcase-intro__subtitle">
              Current resolved theme: <strong>{resolvedTheme}</strong>
            </p>
          </section>

          <section className="showcase-section">
            <h2 className="showcase-section__title">Surface &amp; accent colours</h2>
            <div className="swatch-row">
              {BG_SWATCHES.map((s) => (
                <Swatch key={s.token} label={s.label} token={s.token} />
              ))}
            </div>
          </section>

          <section className="showcase-section">
            <h2 className="showcase-section__title">Status colours</h2>
            <div className="swatch-row">
              {STATUS_SWATCHES.map((s) => (
                <Swatch key={s.token} label={s.label} token={s.token} />
              ))}
            </div>
          </section>

          <section className="showcase-section">
            <h2 className="showcase-section__title">Typography</h2>
            <div className="type-samples">
              {TYPE_SAMPLES.map((t) => (
                <div key={t.token} className="type-samples__row">
                  <div className="type-samples__label">{t.label}</div>
                  <div className="type-samples__text" style={{ font: `var(${t.token})` }}>
                    {t.text}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="showcase-section">
            <h2 className="showcase-section__title">Spacing scale</h2>
            <div className="space-row">
              {SPACE_SAMPLES.map((s) => (
                <div key={s.token} className="space-row__item">
                  <div className="space-row__bar" style={{ width: `var(${s.token})` }} />
                  <div className="space-row__label">{s.label}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="showcase-section">
            <h2 className="showcase-section__title">Radius scale</h2>
            <div className="radius-row">
              {RADIUS_SAMPLES.map((r) => (
                <div key={r.token} className="radius-row__item">
                  <div className="radius-row__box" style={{ borderRadius: `var(${r.token})` }} />
                  <div className="radius-row__label">{r.label}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="showcase-section">
            <h2 className="showcase-section__title">Component gallery</h2>
            <Gallery />
          </section>
        </main>
      </div>
    </div>
  );
}
