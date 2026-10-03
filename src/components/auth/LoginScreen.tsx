// src/components/auth/LoginScreen.tsx
import type { ReactNode } from 'react';
import './LoginScreen.css';

export interface LoginScreenProps {
  /** Left panel (visually dominant, ~4/5): product name/logo, headline,
   * supporting description, optional marketing content. A slot the consuming
   * project fills with its own brand. */
  brand: ReactNode;
  /** Right panel (focused, ~1/5): the sign-in form. The standard is a
   * password form (email + password + remember-me + submit + forgot link);
   * a consuming app may slot any sign-in flow (e.g. passwordless). */
  children: ReactNode;
  /** Optional element pinned to the top-right of the form panel, e.g. a
   * `ThemeToggle`. */
  aside?: ReactNode;
}

/**
 * Standard split-screen auth layout: a large brand/description panel beside a
 * focused form panel. Layout only -- both sides are slots; colours come from
 * the generic theme tokens, so it re-themes with everything else. Below the
 * breakpoint the panels stack and the brand collapses to a slim header so
 * mobile users land on the form.
 *
 * The 4 : 1 ratio is the documented default; override `--login-brand-flex` /
 * `--login-form-flex` on `.login-screen` to change it. Reused for forgot /
 * reset password (`ChangePassword` is an in-app form, not this layout).
 */
export function LoginScreen({ brand, children, aside }: LoginScreenProps) {
  return (
    <div className="login-screen">
      <section className="login-screen__brand" aria-label="About this product">
        <div className="login-screen__brand-inner">{brand}</div>
      </section>
      <section className="login-screen__form-panel" aria-label="Sign in">
        {aside && <div className="login-screen__aside">{aside}</div>}
        <div className="login-screen__form">{children}</div>
      </section>
    </div>
  );
}
