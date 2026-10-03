# Auth — LoginScreen + password forms (Phase 6)

The standard sign-in layout is a **split screen**: a large brand / description
panel beside a focused form panel. `LoginScreen` owns the layout only — both
sides are slots, and it references ONLY generic tokens, so it inherits any
theme. Copy `LoginScreen.tsx` + `LoginScreen.css` into a project and import it.

> Phase 6 components: `LoginScreen` (split-screen shell), `ChangePassword`
> (in-app), and `ForgotPassword` / `ResetPassword` (slot into the LoginScreen
> form panel). All built from the Phase 2 primitives.

## LoginScreen — `LoginScreen.tsx` + `LoginScreen.css`

| Prop | Type | Notes |
|------|------|-------|
| `brand` | `ReactNode` | Left panel (~4/5): product name/logo, headline, description. A slot. |
| `children` | `ReactNode` | Right panel (~1/5): the sign-in form. A slot. |
| `aside` | `ReactNode` | Optional element pinned top-right of the form panel (e.g. a `ThemeToggle`). |

### Layout contract
- **Left — brand (visually dominant).** A **fixed near-black surface in both
  themes** — `--login-brand-bg` (default `#0C0D11`) with `--login-brand-text`
  (light off-white) and `--login-brand-text-muted` for secondary lines. It is
  NOT an accent/purple fill and NOT theme-dependent, so the brand reads
  consistently regardless of the user's theme. The accent appears only as a
  sparing detail (logo mark, a link, a thin rule) — never as the background.
  Override `--login-brand-bg` (a gradient value is fine) for a custom brand.
- **Right — form.** This side DOES follow the active theme: on `--bg-surface-1`
  with themed text, a narrow column with a usable `min-width`, vertically
  centered.
- **Ratio.** `4 : 1` is the default; override `--login-brand-flex` /
  `--login-form-flex` on `.login-screen` to change it (e.g. `7 / 3`).
- **Responsive.** Below `52rem` the panels stack and the brand collapses to a
  slim header, so mobile users land on the form.
- Reused for `ForgotPassword` / `ResetPassword`; `ChangePassword` is an in-app
  form (inside the AppShell), not this layout.

### The standard form (right panel)
The MetaLogix standard sign-in is **password-based**: email + password,
remember-me, a primary submit, and a "forgot password?" link — built from the
Phase 2 primitives (`FormField` + `Input` + `Button`). Example:

```tsx
<LoginScreen brand={<MyBrand />} aside={<ThemeToggle />}>
  <h2>Welcome back</h2>
  <form onSubmit={handleSubmit}>
    <FormField htmlFor="email" label="Email address">
      <Input type="email" autoComplete="email" />
    </FormField>
    <FormField htmlFor="password" label="Password">
      <Input type="password" autoComplete="current-password" />
    </FormField>
    <Checkbox label="Remember me" />
    <Button type="submit" fullWidth>Sign in</Button>
    <a href="/forgot">Forgot password?</a>
  </form>
</LoginScreen>
```

### Consumer variants
The right panel is a slot, so a project may use a different sign-in flow and a
bespoke identity without forking the layout:
- **Passwordless (magic-link).** Swap the password form for an email-only
  "send me a link" form. The link email is sent server-side via **MetaMail**
  (never a mail key in client code) — see `docs/references/metamail.md`.
- **Committed brand palette.** A project can override the login-scoped tokens
  on `.login-screen` (e.g. a fixed dark navy brand + amber CTA) so the screen
  commits to one identity regardless of the app theme. Because the primitives
  read generic tokens, overriding `--accent`, `--bg-surface-1`, `--text-*`,
  `--border-focus` on `.login-screen` re-skins the whole form automatically.

### Accessibility
- Both panels are labelled regions.
- Visible `:focus-visible` ring via `--border-focus`; full keyboard operability
  (native controls from the primitives).
- Token pairings are WCAG-AA: `--login-brand-text` on near-black
  `--login-brand-bg` (brand), `--text-primary` on `--bg-surface-1` (form).
