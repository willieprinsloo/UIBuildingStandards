# UIStandards — Phase 1: Foundation (Tokens + Theme Engine) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the dependency-free design-token layer and port the ERP theme engine (registry + `useTheme` + pre-paint anti-flash script + `ThemeToggle` + `ThemePicker`) so any downstream component can be built on a themeable, day/night-capable base.

**Architecture:** Structural tokens live in `:root` (identical across themes). Each theme CSS file maps theme-private primitives → a fixed generic-token contract and is scoped to `[data-theme="<id>"]`. A TypeScript registry is the single source of truth for theme metadata; `useTheme` resolves a stored preference to a theme, writes `data-theme` + `data-theme-mode` on `<html>`, and persists to `localStorage`. Components only ever reference generic tokens.

**Tech Stack:** TypeScript, React 18, Vite (library + dev), Vitest + React Testing Library + jsdom (tests), plain CSS (CSS variables + CSS Modules-style co-located files). No runtime dependencies beyond React.

## Global Constraints

- **Runtime dependencies:** none beyond `react` / `react-dom`. Everything else is a devDependency. Components/engine must not import any third-party runtime package.
- **Node floor:** Node 20+. **React floor:** 18+.
- **Generic-token contract (every theme MUST export, verbatim names):** `--bg-base`, `--bg-surface-1`, `--bg-surface-2`, `--bg-surface-3`, `--bg-inset`; `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-muted`, `--text-on-accent`; `--accent`, `--accent-hover`, `--accent-active`, `--accent-subtle`; `--status-success`, `--status-success-subtle`, `--status-warning`, `--status-warning-subtle`, `--status-error`, `--status-error-subtle`, `--status-info`, `--status-info-subtle`; `--border`, `--border-subtle`, `--border-emphasis`, `--border-focus`; `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`.
- **Two attributes, never one:** `data-theme` carries the theme id; `data-theme-mode` carries `dark`/`light`. Mode-dependent CSS keys off `data-theme-mode` and must never enumerate theme ids.
- **Canonical pair:** `'system'` preference resolves to `precision` (dark) or `warehouse` (light) via `prefers-color-scheme`.
- **Accessibility:** focus rings use `--border-focus`; all animations gated behind `prefers-reduced-motion`.
- **localStorage keys:** `ui-theme` (preference) and `ui-theme-mode` (resolved mode mirror for the pre-paint script).
- **Commit style:** small, frequent commits per task; message bodies end with the Co-Authored-By trailer used in this repo.

---

### Task 1: Project scaffolding & test harness

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `.gitignore`
- Create: `src/__tests__/smoke.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: an `npm test` command (Vitest, jsdom env, RTL matchers) and a TypeScript project other tasks compile against. Path alias `@/*` → `src/*`. Source root is `src/` with top-level dirs `src/tokens`, `src/components`, `src/docs-assets` created lazily by later tasks.

- [ ] **Step 1: Write the failing test**

```ts
// src/__tests__/smoke.test.ts
import { describe, it, expect } from 'vitest';

describe('harness', () => {
  it('runs TypeScript tests', () => {
    expect(1 + 1).toBe(2);
  });
  it('has jsdom document', () => {
    expect(typeof document).toBe('object');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `npm` error "Missing script: test" / no `package.json`.

- [ ] **Step 3: Create the scaffolding**

```json
// package.json
{
  "name": "@metalogix/ui-standards",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "description": "MetaLogix UI Standards — reusable admin-system UI standards + copy-paste React components.",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "jsdom": "^24.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "typescript": "^5.5.0",
    "vitest": "^2.0.0"
  }
}
```

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2021",
    "lib": ["ES2021", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src"]
}
```

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    css: true,
  },
});
```

```ts
// vitest.setup.ts
import '@testing-library/jest-dom/vitest';
```

```gitignore
# .gitignore
node_modules/
dist/
coverage/
*.log
.DS_Store
```

- [ ] **Step 4: Install and run the test to verify it passes**

Run: `npm install && npm test`
Expected: PASS — 2 passing tests in `smoke.test.ts`.

- [ ] **Step 5: Commit**

```bash
git add package.json tsconfig.json vitest.config.ts vitest.setup.ts .gitignore src/__tests__/smoke.test.ts package-lock.json
git commit -m "chore: scaffold UIStandards project + Vitest/RTL harness

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Structural tokens (`tokens.css` + `tokens.json`)

Port the ERP's theme-invariant structural tokens from
`~/Documents/Projects/MetaLogixERP/apps/frontend/src/styles/variables.css`. These
hold NO color values — colors belong to theme files (Tasks 3–4).

**Files:**
- Create: `src/tokens/tokens.css`
- Create: `src/tokens/tokens.json`
- Test: `src/tokens/__tests__/tokens.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `tokens.css` defining all structural custom properties on `:root`; `tokens.json` exporting the same values as a nested object `{ space, font, type, radius, z, motion, layout }` for non-CSS consumers.

- [ ] **Step 1: Write the failing test**

```ts
// src/tokens/__tests__/tokens.test.ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import tokens from '../tokens.json';

const css = readFileSync(
  fileURLToPath(new URL('../tokens.css', import.meta.url)),
  'utf8',
);

describe('structural tokens', () => {
  it('defines the spacing scale in :root', () => {
    for (const n of [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24]) {
      expect(css).toContain(`--space-${n}:`);
    }
  });

  it('defines font families and the type scale', () => {
    expect(css).toContain('--font-sans:');
    expect(css).toContain('--font-mono:');
    expect(css).toContain('--type-body-size:');
    expect(css).toContain('--type-h1-size:');
  });

  it('defines radius, z-index, motion and layout constants', () => {
    expect(css).toContain('--radius-sm:');
    expect(css).toContain('--z-modal:');
    expect(css).toContain('--duration-base:');
    expect(css).toContain('--ease-default:');
    expect(css).toContain('--sidebar-width-expanded:');
    expect(css).toContain('--input-height:');
  });

  it('contains NO color values (colors live in theme files)', () => {
    expect(css).not.toMatch(/#[0-9a-fA-F]{6}/);
  });

  it('tokens.json mirrors the key groups', () => {
    expect(tokens.space['4']).toBe('16px');
    expect(tokens.radius.sm).toBe('4px');
    expect(tokens.layout.inputHeight).toBe('36px');
    expect(tokens.font.sans).toContain('Inter');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tokens`
Expected: FAIL — cannot find `../tokens.json` / `../tokens.css`.

- [ ] **Step 3: Create `tokens.css`**

```css
/* src/tokens/tokens.css
 * UIStandards — Structural Tokens (theme-invariant). Ported from MetaLogix ERP
 * variables.css. NO color values here — colors live in tokens/themes/<id>.css.
 */
:root {
  /* ─── Spacing (base 4px) ─── */
  --space-0: 0;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;

  /* ─── Typography ─── */
  --font-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;

  --type-display-size: 1.875rem;
  --type-h1-size: 1.5rem;
  --type-h2-size: 1.25rem;
  --type-h3-size: 1rem;
  --type-card-title-size: 0.9375rem;
  --type-body-size: 0.875rem;
  --type-label-size: 0.8125rem;
  --type-caption-size: 0.75rem;
  --type-data-size: 0.8125rem;
  --type-eyebrow-size: 0.6875rem;

  --type-display-weight: 700;
  --type-h1-weight: 600;
  --type-h2-weight: 600;
  --type-h3-weight: 600;
  --type-card-title-weight: 600;
  --type-body-weight: 400;
  --type-label-weight: 500;
  --type-caption-weight: 400;
  --type-data-weight: 500;
  --type-body-emphasis-weight: 500;
  --type-eyebrow-weight: 600;

  --type-display-tracking: -0.02em;
  --type-h1-tracking: -0.015em;
  --type-h2-tracking: -0.01em;
  --type-body-tracking: 0;
  --type-label-tracking: 0.01em;
  --type-caption-tracking: 0.01em;
  --type-eyebrow-tracking: 0.06em;

  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-loose: 1.75;

  --type-display: var(--type-display-weight) var(--type-display-size) / var(--leading-tight) var(--font-sans);
  --type-h1: var(--type-h1-weight) var(--type-h1-size) / var(--leading-tight) var(--font-sans);
  --type-h2: var(--type-h2-weight) var(--type-h2-size) / var(--leading-tight) var(--font-sans);
  --type-h3: var(--type-h3-weight) var(--type-h3-size) / var(--leading-normal) var(--font-sans);
  --type-body: var(--type-body-weight) var(--type-body-size) / var(--leading-normal) var(--font-sans);
  --type-label: var(--type-label-weight) var(--type-label-size) / var(--leading-normal) var(--font-sans);
  --type-caption: var(--type-caption-weight) var(--type-caption-size) / var(--leading-normal) var(--font-sans);
  --type-data: var(--type-data-weight) var(--type-data-size) / var(--leading-normal) var(--font-mono);

  /* ─── Radius ─── */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-full: 9999px;

  /* ─── Z-index ─── */
  --z-base: 0;
  --z-raised: 10;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-overlay: 300;
  --z-modal: 400;
  --z-popover: 450;
  --z-toast: 500;
  --z-tooltip: 600;

  /* ─── Motion ─── */
  --ease-default: cubic-bezier(0.25, 0.1, 0.25, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --duration-fast: 100ms;
  --duration-base: 150ms;
  --duration-slow: 250ms;
  --duration-slower: 400ms;
  --duration-loop-spinner: 800ms;
  --duration-loop-skeleton: 1.4s;
  --duration-loop-pulse: 1.5s;

  /* ─── Layout constants ─── */
  --topnav-height: 56px;
  --sidebar-width-expanded: 240px;
  --sidebar-width-collapsed: 56px;
  --nav-item-height: 36px;
  --input-height: 36px;
}

/* Honour reduced-motion globally — individual components still gate their own. */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 4: Create `tokens.json`**

```json
{
  "space": {
    "0": "0", "1": "4px", "2": "8px", "3": "12px", "4": "16px", "5": "20px",
    "6": "24px", "8": "32px", "10": "40px", "12": "48px", "16": "64px",
    "20": "80px", "24": "96px"
  },
  "font": {
    "sans": "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    "mono": "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace"
  },
  "type": {
    "displaySize": "1.875rem", "h1Size": "1.5rem", "h2Size": "1.25rem",
    "h3Size": "1rem", "bodySize": "0.875rem", "labelSize": "0.8125rem",
    "captionSize": "0.75rem", "dataSize": "0.8125rem", "eyebrowSize": "0.6875rem"
  },
  "radius": { "sm": "4px", "md": "6px", "lg": "8px", "xl": "12px", "full": "9999px" },
  "z": {
    "base": 0, "raised": 10, "dropdown": 100, "sticky": 200, "overlay": 300,
    "modal": 400, "popover": 450, "toast": 500, "tooltip": 600
  },
  "motion": {
    "easeDefault": "cubic-bezier(0.25, 0.1, 0.25, 1)",
    "easeOut": "cubic-bezier(0, 0, 0.2, 1)",
    "easeIn": "cubic-bezier(0.4, 0, 1, 1)",
    "durationFast": "100ms", "durationBase": "150ms",
    "durationSlow": "250ms", "durationSlower": "400ms"
  },
  "layout": {
    "topnavHeight": "56px", "sidebarWidthExpanded": "240px",
    "sidebarWidthCollapsed": "56px", "navItemHeight": "36px", "inputHeight": "36px"
  }
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- tokens`
Expected: PASS — all `structural tokens` assertions green.

- [ ] **Step 6: Commit**

```bash
git add src/tokens/tokens.css src/tokens/tokens.json src/tokens/__tests__/tokens.test.ts
git commit -m "feat(tokens): add structural design tokens (css + json)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Default dark theme (`precision`)

Port the generic-token mapping from the ERP `precision.css`. Only the generic
contract is required here (theme-private `--p-*` primitives may be inlined directly
as the values to keep the file self-contained).

**Files:**
- Create: `src/tokens/themes/precision.css`
- Test: `src/tokens/themes/__tests__/precision.test.ts`

**Interfaces:**
- Consumes: the generic-token contract names (Global Constraints).
- Produces: a `[data-theme="precision"]` block exporting every generic token. Dark mode → all shadows `none`.

- [ ] **Step 1: Write the failing test**

```ts
// src/tokens/themes/__tests__/precision.test.ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const css = readFileSync(
  fileURLToPath(new URL('../precision.css', import.meta.url)),
  'utf8',
);
const CONTRACT = [
  '--bg-base','--bg-surface-1','--bg-surface-2','--bg-surface-3','--bg-inset',
  '--text-primary','--text-secondary','--text-tertiary','--text-muted','--text-on-accent',
  '--accent','--accent-hover','--accent-active','--accent-subtle',
  '--status-success','--status-success-subtle','--status-warning','--status-warning-subtle',
  '--status-error','--status-error-subtle','--status-info','--status-info-subtle',
  '--border','--border-subtle','--border-emphasis','--border-focus',
  '--shadow-sm','--shadow-md','--shadow-lg','--shadow-xl',
];

describe('precision (dark) theme', () => {
  it('is scoped to [data-theme="precision"]', () => {
    expect(css).toContain('[data-theme="precision"]');
  });
  it('exports every generic token', () => {
    for (const token of CONTRACT) expect(css, token).toContain(`${token}:`);
  });
  it('uses the azure accent', () => {
    expect(css).toContain('#2E6BE6');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- precision`
Expected: FAIL — cannot find `../precision.css`.

- [ ] **Step 3: Create `precision.css`**

```css
/* src/tokens/themes/precision.css — Default dark theme. Ported from MetaLogix ERP. */
[data-theme="precision"] {
  --bg-base: #0C0D11;
  --bg-surface-1: #13141A;
  --bg-surface-2: #1A1B23;
  --bg-surface-3: #22232D;
  --bg-inset: #0A0A0E;

  --text-primary: #EDEDF0;
  --text-secondary: #A0A1A8;
  --text-tertiary: #7D7E87;
  --text-muted: #5C5E68;
  --text-on-accent: #FFFFFF;

  --accent: #2E6BE6;
  --accent-hover: #5B8DEF;
  --accent-active: #2154C4;
  --accent-subtle: rgba(46, 107, 230, 0.12);

  --status-success: #34D399;
  --status-success-subtle: rgba(52, 211, 153, 0.12);
  --status-warning: #FBBF24;
  --status-warning-subtle: rgba(251, 191, 36, 0.12);
  --status-error: #F87171;
  --status-error-subtle: rgba(248, 113, 113, 0.12);
  --status-info: #60A5FA;
  --status-info-subtle: rgba(96, 165, 250, 0.12);

  --border: rgba(255, 255, 255, 0.08);
  --border-subtle: rgba(255, 255, 255, 0.05);
  --border-emphasis: rgba(255, 255, 255, 0.14);
  --border-focus: #2E6BE6;

  /* Dark themes: shadows off — depth comes from surface lightness. */
  --shadow-sm: none;
  --shadow-md: none;
  --shadow-lg: none;
  --shadow-xl: none;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- precision`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/tokens/themes/precision.css src/tokens/themes/__tests__/precision.test.ts
git commit -m "feat(tokens): add default dark theme (precision)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Default light theme (`warehouse`)

Port the generic-token mapping from the ERP `warehouse.css`.

**Files:**
- Create: `src/tokens/themes/warehouse.css`
- Test: `src/tokens/themes/__tests__/warehouse.test.ts`

**Interfaces:**
- Consumes: the generic-token contract names.
- Produces: a `[data-theme="warehouse"]` block exporting every generic token. Light mode → real warm shadows.

- [ ] **Step 1: Write the failing test**

```ts
// src/tokens/themes/__tests__/warehouse.test.ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const css = readFileSync(
  fileURLToPath(new URL('../warehouse.css', import.meta.url)),
  'utf8',
);
const CONTRACT = [
  '--bg-base','--bg-surface-1','--bg-surface-2','--bg-surface-3','--bg-inset',
  '--text-primary','--text-secondary','--text-tertiary','--text-muted','--text-on-accent',
  '--accent','--accent-hover','--accent-active','--accent-subtle',
  '--status-success','--status-success-subtle','--status-warning','--status-warning-subtle',
  '--status-error','--status-error-subtle','--status-info','--status-info-subtle',
  '--border','--border-subtle','--border-emphasis','--border-focus',
  '--shadow-sm','--shadow-md','--shadow-lg','--shadow-xl',
];

describe('warehouse (light) theme', () => {
  it('is scoped to [data-theme="warehouse"]', () => {
    expect(css).toContain('[data-theme="warehouse"]');
  });
  it('exports every generic token', () => {
    for (const token of CONTRACT) expect(css, token).toContain(`${token}:`);
  });
  it('uses the teal accent and real shadows', () => {
    expect(css).toContain('#0D9488');
    expect(css).not.toMatch(/--shadow-sm:\s*none/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- warehouse`
Expected: FAIL — cannot find `../warehouse.css`.

- [ ] **Step 3: Create `warehouse.css`**

```css
/* src/tokens/themes/warehouse.css — Default light theme. Ported from MetaLogix ERP. */
[data-theme="warehouse"] {
  --bg-base: #F6F3EE;
  --bg-surface-1: #FFFFFF;
  --bg-surface-2: #FAFAF7;
  --bg-surface-3: #FFFFFF;
  --bg-inset: #EFECE6;

  --text-primary: #1C1917;
  --text-secondary: #57534E;
  --text-tertiary: #6F6A65;
  --text-muted: #8B8681;
  --text-on-accent: #1C1917;

  --accent: #0D9488;
  --accent-hover: #0F766E;
  --accent-active: #115E59;
  --accent-subtle: rgba(13, 148, 136, 0.08);

  --status-success: #16A34A;
  --status-success-subtle: #F0FDF4;
  --status-warning: #D97706;
  --status-warning-subtle: #FFFBEB;
  --status-error: #DC2626;
  --status-error-subtle: #FEF2F2;
  --status-info: #0284C7;
  --status-info-subtle: #F0F9FF;

  --border: rgba(28, 25, 23, 0.08);
  --border-subtle: rgba(28, 25, 23, 0.05);
  --border-emphasis: rgba(28, 25, 23, 0.15);
  --border-focus: #0D9488;

  --shadow-sm: 0 1px 2px rgba(28, 25, 23, 0.05);
  --shadow-md: 0 2px 8px rgba(28, 25, 23, 0.08);
  --shadow-lg: 0 8px 24px rgba(28, 25, 23, 0.12);
  --shadow-xl: 0 16px 48px rgba(28, 25, 23, 0.16);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- warehouse`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/tokens/themes/warehouse.css src/tokens/themes/__tests__/warehouse.test.ts
git commit -m "feat(tokens): add default light theme (warehouse)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: `global.css` aggregator

The loud `@import` list: structural tokens first, then every theme file. A missing
import leaves generic tokens undefined for that theme — intentionally obvious.

**Files:**
- Create: `src/tokens/global.css`
- Test: `src/tokens/__tests__/global.test.ts`

**Interfaces:**
- Consumes: `tokens.css`, `themes/precision.css`, `themes/warehouse.css`.
- Produces: a single CSS entry (`src/tokens/global.css`) that a host app imports once.

- [ ] **Step 1: Write the failing test**

```ts
// src/tokens/__tests__/global.test.ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const css = readFileSync(
  fileURLToPath(new URL('../global.css', import.meta.url)),
  'utf8',
);

describe('global.css', () => {
  it('imports structural tokens first', () => {
    expect(css.indexOf("@import './tokens.css'")).toBeGreaterThanOrEqual(0);
  });
  it('imports both default themes', () => {
    expect(css).toContain("@import './themes/precision.css'");
    expect(css).toContain("@import './themes/warehouse.css'");
  });
  it('imports structural tokens before any theme', () => {
    expect(css.indexOf('tokens.css')).toBeLessThan(css.indexOf('precision.css'));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- global`
Expected: FAIL — cannot find `../global.css`.

- [ ] **Step 3: Create `global.css`**

```css
/* src/tokens/global.css
 * The single stylesheet a host app imports. ORDER MATTERS:
 *   1. structural tokens (:root, theme-invariant)
 *   2. every theme file ([data-theme="<id>"])
 * Adding a theme = add its CSS file + one @import line here + a registry entry.
 * A missing @import leaves that theme's generic tokens undefined — a loud failure.
 */
@import './tokens.css';

/* Dark themes */
@import './themes/precision.css';

/* Light themes */
@import './themes/warehouse.css';
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- global`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/tokens/global.css src/tokens/__tests__/global.test.ts
git commit -m "feat(tokens): add global.css aggregator import list

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Theme registry (`registry.ts`)

Port the ERP registry, generalized: `iconName` is a plain `string` (no icon-bundle
dependency). Single source of truth for theme metadata + lookup helpers.

**Files:**
- Create: `src/components/theme/registry.ts`
- Test: `src/components/theme/__tests__/registry.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type ThemeMode = 'dark' | 'light'`
  - `type ThemeFamily = 'cool' | 'warm' | 'mono' | 'organic' | 'neon' | 'editorial' | 'industrial' | 'pastel' | 'mathematical'`
  - `interface ThemeSwatch { bgBase; bgSurface; sidebarBorder; accent; text: string }`
  - `interface ThemeMeta { id; label; shortLabel: string; mode: ThemeMode; family: ThemeFamily; description: string; iconName: string; swatch: ThemeSwatch; sort?: number }`
  - `const THEMES` (`as const satisfies readonly ThemeMeta[]`)
  - `const THEME_IDS: readonly ThemeId[]`
  - `type ThemeId = (typeof THEMES)[number]['id']` (union `'precision' | 'warehouse'`)
  - `type ThemeEntry = ThemeMeta & { id: ThemeId }`
  - `getTheme(id: string): ThemeEntry | undefined`
  - `themesByMode(mode: ThemeMode): ThemeEntry[]`
  - `themesByFamily(): Record<ThemeFamily, ThemeEntry[]>`

- [ ] **Step 1: Write the failing test**

```ts
// src/components/theme/__tests__/registry.test.ts
import { describe, it, expect } from 'vitest';
import { THEMES, THEME_IDS, getTheme, themesByMode } from '../registry';

describe('theme registry', () => {
  it('ships precision (dark) and warehouse (light)', () => {
    expect(THEME_IDS).toContain('precision');
    expect(THEME_IDS).toContain('warehouse');
  });
  it('getTheme returns an entry with a mode', () => {
    expect(getTheme('precision')?.mode).toBe('dark');
    expect(getTheme('warehouse')?.mode).toBe('light');
  });
  it('getTheme returns undefined for unknown ids', () => {
    expect(getTheme('nope')).toBeUndefined();
  });
  it('themesByMode filters by mode', () => {
    expect(themesByMode('dark').every(t => t.mode === 'dark')).toBe(true);
    expect(themesByMode('light').map(t => t.id)).toContain('warehouse');
  });
  it('every theme has a full swatch', () => {
    for (const t of THEMES) {
      expect(t.swatch.bgBase).toMatch(/^#|rgb/);
      expect(t.swatch.accent).toMatch(/^#|rgb/);
      expect(t.swatch.text).toMatch(/^#|rgb/);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- registry`
Expected: FAIL — cannot find `../registry`.

- [ ] **Step 3: Create `registry.ts`**

```ts
// src/components/theme/registry.ts
export type ThemeMode = 'dark' | 'light';

export type ThemeFamily =
  | 'cool' | 'warm' | 'mono' | 'organic' | 'neon'
  | 'editorial' | 'industrial' | 'pastel' | 'mathematical';

export interface ThemeSwatch {
  /** Page background */
  bgBase: string;
  /** Card / sidebar surface */
  bgSurface: string;
  /** Sidebar separator border */
  sidebarBorder: string;
  /** Primary accent */
  accent: string;
  /** Primary text */
  text: string;
}

export interface ThemeMeta {
  id: string;
  label: string;
  shortLabel: string;
  mode: ThemeMode;
  family: ThemeFamily;
  /** One sentence, <=80 chars */
  description: string;
  /** Icon name string — the picker resolves it to a glyph however it likes. */
  iconName: string;
  swatch: ThemeSwatch;
  /** Sort weight within mode group — lower first. Default 100. */
  sort?: number;
}

/**
 * Every theme the standard ships. Keep annotation-free: `as const satisfies`
 * (in that order) type-checks each entry AND keeps the literal tuple so
 * `ThemeId` stays a precise union rather than collapsing to `string`.
 */
export const THEMES = [
  {
    id: 'precision',
    label: 'Precision (Dark)',
    shortLabel: 'Precision',
    mode: 'dark',
    family: 'cool',
    description: 'High-contrast dark interface for focused work.',
    iconName: 'Moon',
    sort: 10,
    swatch: {
      bgBase: '#0C0D11',
      bgSurface: '#13141A',
      sidebarBorder: 'rgba(255,255,255,0.12)',
      accent: '#2E6BE6',
      text: '#EDEDF0',
    },
  },
  {
    id: 'warehouse',
    label: 'Warehouse (Light)',
    shortLabel: 'Warehouse',
    mode: 'light',
    family: 'warm',
    description: 'Warm, paper-like light interface for daytime work.',
    iconName: 'Sun',
    sort: 10,
    swatch: {
      bgBase: '#F6F3EE',
      bgSurface: '#FFFFFF',
      sidebarBorder: 'rgba(28,25,23,0.15)',
      accent: '#0D9488',
      text: '#1C1917',
    },
  },
] as const satisfies readonly ThemeMeta[];

export type ThemeId = (typeof THEMES)[number]['id'];
export const THEME_IDS: readonly ThemeId[] = THEMES.map((t) => t.id);
export type ThemeEntry = ThemeMeta & { id: ThemeId };

export function getTheme(id: string): ThemeEntry | undefined {
  return THEMES.find((t) => t.id === id) as ThemeEntry | undefined;
}

export function themesByMode(mode: ThemeMode): ThemeEntry[] {
  return (THEMES as readonly ThemeEntry[])
    .filter((t) => t.mode === mode)
    .sort((a, b) => (a.sort ?? 100) - (b.sort ?? 100) || a.label.localeCompare(b.label));
}

export function themesByFamily(): Record<ThemeFamily, ThemeEntry[]> {
  const result = {} as Record<ThemeFamily, ThemeEntry[]>;
  for (const theme of THEMES as readonly ThemeEntry[]) {
    (result[theme.family] ??= []).push(theme);
  }
  for (const family of Object.keys(result) as ThemeFamily[]) {
    result[family].sort(
      (a, b) => (a.sort ?? 100) - (b.sort ?? 100) || a.label.localeCompare(b.label),
    );
  }
  return result;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- registry` then `npm run typecheck`
Expected: PASS; typecheck clean (confirms `ThemeId` is the `'precision' | 'warehouse'` union).

- [ ] **Step 5: Commit**

```bash
git add src/components/theme/registry.ts src/components/theme/__tests__/registry.test.ts
git commit -m "feat(theme): port theme registry (single source of truth)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: `useTheme` hook

Port the ERP hook, generalized storage keys. Resolves preference → theme, writes
both attributes, persists, and listens for OS changes when `'system'`.

**Files:**
- Create: `src/components/theme/useTheme.ts`
- Test: `src/components/theme/__tests__/useTheme.test.tsx`

**Interfaces:**
- Consumes: `registry.ts` (`THEME_IDS`, `getTheme`, `ThemeId`, `ThemeMode`).
- Produces:
  - `type ResolvedTheme = ThemeId`
  - `type ThemePreference = ResolvedTheme | 'system'`
  - `interface UseThemeReturn { preference: ThemePreference; resolvedTheme: ResolvedTheme; setPreference(p: ThemePreference): void }`
  - `function useTheme(): UseThemeReturn`
  - Side effects: sets `document.documentElement` attributes `data-theme` (id) and `data-theme-mode` (`dark`/`light`); writes `localStorage` keys `ui-theme` and `ui-theme-mode`.
  - Canonical mapping: system dark → `precision`, system light → `warehouse`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/theme/__tests__/useTheme.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../useTheme';

function mockMatchMedia(dark: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: dark && query.includes('dark'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    onchange: null,
    dispatchEvent: vi.fn(),
  }));
}

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-theme-mode');
  });

  it("defaults to 'system' and resolves via prefers-color-scheme (dark)", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useTheme());
    expect(result.current.preference).toBe('system');
    expect(result.current.resolvedTheme).toBe('precision');
    expect(document.documentElement.getAttribute('data-theme')).toBe('precision');
    expect(document.documentElement.getAttribute('data-theme-mode')).toBe('dark');
  });

  it("resolves 'system' to warehouse when OS is light", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useTheme());
    expect(result.current.resolvedTheme).toBe('warehouse');
    expect(document.documentElement.getAttribute('data-theme-mode')).toBe('light');
  });

  it('applies and persists an explicit preference', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setPreference('warehouse'));
    expect(result.current.resolvedTheme).toBe('warehouse');
    expect(document.documentElement.getAttribute('data-theme')).toBe('warehouse');
    expect(document.documentElement.getAttribute('data-theme-mode')).toBe('light');
    expect(localStorage.getItem('ui-theme')).toBe('warehouse');
    expect(localStorage.getItem('ui-theme-mode')).toBe('light');
  });

  it('reads a stored explicit preference on mount', () => {
    mockMatchMedia(true);
    localStorage.setItem('ui-theme', 'warehouse');
    const { result } = renderHook(() => useTheme());
    expect(result.current.preference).toBe('warehouse');
    expect(result.current.resolvedTheme).toBe('warehouse');
  });

  it('falls back to system for an unknown stored id', () => {
    mockMatchMedia(true);
    localStorage.setItem('ui-theme', 'retired-theme');
    const { result } = renderHook(() => useTheme());
    expect(result.current.preference).toBe('system');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- useTheme`
Expected: FAIL — cannot find `../useTheme`.

- [ ] **Step 3: Create `useTheme.ts`**

```ts
// src/components/theme/useTheme.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { THEME_IDS, getTheme, type ThemeId, type ThemeMode } from './registry';

export type ResolvedTheme = ThemeId;
export type ThemePreference = ResolvedTheme | 'system';

const STORAGE_KEY = 'ui-theme';
const MODE_STORAGE_KEY = 'ui-theme-mode';

/** Canonical theme pair that `'system'` resolves to. */
const SYSTEM_DARK: ThemeId = 'precision';
const SYSTEM_LIGHT: ThemeId = 'warehouse';

const EXPLICIT_THEMES = new Set<string>(THEME_IDS);

function isResolvedTheme(value: unknown): value is ResolvedTheme {
  return typeof value === 'string' && EXPLICIT_THEMES.has(value);
}

function resolveSystemMode(): ThemeMode {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveSystemTheme(): ResolvedTheme {
  return resolveSystemMode() === 'dark' ? SYSTEM_DARK : SYSTEM_LIGHT;
}

function modeOf(resolved: ResolvedTheme): ThemeMode {
  return getTheme(resolved)?.mode ?? resolveSystemMode();
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference === 'system' ? resolveSystemTheme() : preference;
}

function readStoredPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'system' || isResolvedTheme(stored)) return stored;
  } catch {
    /* localStorage unavailable */
  }
  return 'system';
}

function applyTheme(resolved: ResolvedTheme): void {
  const mode = modeOf(resolved);
  document.documentElement.setAttribute('data-theme', resolved);
  document.documentElement.setAttribute('data-theme-mode', mode);
  try {
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  } catch {
    /* both attributes already written */
  }
}

export interface UseThemeReturn {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
}

export function useTheme(): UseThemeReturn {
  const [preference, setPreferenceState] = useState<ThemePreference>(readStoredPreference);
  const resolvedTheme = useMemo<ResolvedTheme>(() => resolveTheme(preference), [preference]);

  useEffect(() => {
    applyTheme(resolvedTheme);
    try {
      localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      /* theme still applied via attributes */
    }
  }, [preference, resolvedTheme]);

  useEffect(() => {
    if (preference !== 'system' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handle = () => applyTheme(resolveSystemTheme());
    if (mq.addEventListener) {
      mq.addEventListener('change', handle);
      return () => mq.removeEventListener('change', handle);
    }
    mq.addListener(handle);
    return () => mq.removeListener(handle);
  }, [preference]);

  const setPreference = useCallback((next: ThemePreference) => setPreferenceState(next), []);

  return { preference, resolvedTheme, setPreference };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- useTheme`
Expected: PASS — all 5 cases.

- [ ] **Step 5: Commit**

```bash
git add src/components/theme/useTheme.ts src/components/theme/__tests__/useTheme.test.tsx
git commit -m "feat(theme): port useTheme hook (preference resolution + dual attrs)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: `ThemeToggle` component

Quick dark/light switch. Toggles between the canonical pair based on current mode.

**Files:**
- Create: `src/components/theme/ThemeToggle.tsx`
- Create: `src/components/theme/ThemeToggle.css`
- Test: `src/components/theme/__tests__/ThemeToggle.test.tsx`

**Interfaces:**
- Consumes: `useTheme`, `getTheme`.
- Produces: `function ThemeToggle(props: { className?: string }): JSX.Element` — an accessible `<button>` with `aria-pressed` reflecting dark mode, `aria-label` "Switch to light/dark theme", toggling preference between `precision` and `warehouse`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/theme/__tests__/ThemeToggle.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '../ThemeToggle';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: q.includes('dark'), media: q,
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
    addListener: vi.fn(), removeListener: vi.fn(),
    onchange: null, dispatchEvent: vi.fn(),
  }));
});

describe('ThemeToggle', () => {
  it('renders an accessible button reflecting the current mode', () => {
    render(<ThemeToggle />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-pressed', 'true'); // system dark
    expect(btn).toHaveAccessibleName(/light/i);
  });

  it('switches theme when clicked', async () => {
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole('button'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('warehouse');
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- ThemeToggle`
Expected: FAIL — cannot find `../ThemeToggle`.

- [ ] **Step 3: Create `ThemeToggle.tsx` and `ThemeToggle.css`**

```tsx
// src/components/theme/ThemeToggle.tsx
import { useTheme } from './useTheme';
import { getTheme } from './registry';
import './ThemeToggle.css';

export interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setPreference } = useTheme();
  const isDark = getTheme(resolvedTheme)?.mode === 'dark';

  return (
    <button
      type="button"
      className={['ui-theme-toggle', className].filter(Boolean).join(' ')}
      aria-pressed={isDark}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={() => setPreference(isDark ? 'warehouse' : 'precision')}
    >
      <span aria-hidden="true" className="ui-theme-toggle__icon">
        {isDark ? '☾' : '☀'}
      </span>
    </button>
  );
}
```

```css
/* src/components/theme/ThemeToggle.css */
.ui-theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--input-height);
  height: var(--input-height);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-surface-1);
  color: var(--text-secondary);
  cursor: pointer;
  transition: background var(--duration-base) var(--ease-default),
    color var(--duration-base) var(--ease-default);
}
.ui-theme-toggle:hover {
  color: var(--text-primary);
  background: var(--bg-surface-2);
}
.ui-theme-toggle:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}
.ui-theme-toggle__icon {
  font-size: 1rem;
  line-height: 1;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- ThemeToggle`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/theme/ThemeToggle.tsx src/components/theme/ThemeToggle.css src/components/theme/__tests__/ThemeToggle.test.tsx
git commit -m "feat(theme): add ThemeToggle component

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 9: `ThemePicker` component

Full theme catalog picker: a trigger button showing the active theme swatch, and a
popover listing themes grouped by mode. Keyboard + outside-click close.

**Files:**
- Create: `src/components/theme/ThemePicker.tsx`
- Create: `src/components/theme/ThemePicker.css`
- Test: `src/components/theme/__tests__/ThemePicker.test.tsx`

**Interfaces:**
- Consumes: `useTheme`, `themesByMode`, `getTheme`, `ThemeEntry`.
- Produces: `function ThemePicker(props: { className?: string }): JSX.Element` — trigger `<button aria-haspopup="listbox" aria-expanded>`; popover `role="listbox"` with `role="option"` rows (`aria-selected` on the active one). Selecting a row calls `setPreference(id)` and closes. `Escape` closes and returns focus to the trigger. Includes a "System" option mapping to `setPreference('system')`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/theme/__tests__/ThemePicker.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemePicker } from '../ThemePicker';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: q.includes('dark'), media: q,
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
    addListener: vi.fn(), removeListener: vi.fn(),
    onchange: null, dispatchEvent: vi.fn(),
  }));
});

describe('ThemePicker', () => {
  it('opens the listbox and lists both themes + System', async () => {
    render(<ThemePicker />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /precision/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /warehouse/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /system/i })).toBeInTheDocument();
  });

  it('applies the chosen theme and closes', async () => {
    render(<ThemePicker />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByRole('option', { name: /warehouse/i }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('warehouse');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    render(<ThemePicker />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- ThemePicker`
Expected: FAIL — cannot find `../ThemePicker`.

- [ ] **Step 3: Create `ThemePicker.tsx` and `ThemePicker.css`**

```tsx
// src/components/theme/ThemePicker.tsx
import { useEffect, useRef, useState } from 'react';
import { useTheme } from './useTheme';
import { themesByMode, getTheme, type ThemeEntry } from './registry';
import type { ThemePreference } from './useTheme';
import './ThemePicker.css';

export interface ThemePickerProps {
  className?: string;
}

export function ThemePicker({ className }: ThemePickerProps) {
  const { preference, resolvedTheme, setPreference } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const dark = themesByMode('dark');
  const light = themesByMode('light');
  const active = getTheme(resolvedTheme);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  function choose(pref: ThemePreference) {
    setPreference(pref);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape' && open) {
      e.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
    }
  }

  function renderGroup(label: string, entries: ThemeEntry[]) {
    return (
      <div className="ui-theme-picker__group" role="group" aria-label={label}>
        <div className="ui-theme-picker__group-label">{label}</div>
        {entries.map((t) => (
          <button
            key={t.id}
            type="button"
            role="option"
            aria-selected={preference === t.id}
            className="ui-theme-picker__option"
            onClick={() => choose(t.id)}
          >
            <span
              className="ui-theme-picker__swatch"
              aria-hidden="true"
              style={{ background: t.swatch.bgBase, borderColor: t.swatch.sidebarBorder }}
            >
              <span style={{ background: t.swatch.accent }} />
            </span>
            <span className="ui-theme-picker__label">{t.label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className={['ui-theme-picker', className].filter(Boolean).join(' ')}
      onKeyDown={onKeyDown}
    >
      <button
        ref={triggerRef}
        type="button"
        className="ui-theme-picker__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span
          className="ui-theme-picker__swatch"
          aria-hidden="true"
          style={{ background: active?.swatch.bgBase, borderColor: active?.swatch.sidebarBorder }}
        >
          <span style={{ background: active?.swatch.accent }} />
        </span>
        <span className="ui-theme-picker__label">{active?.shortLabel ?? 'Theme'}</span>
      </button>

      {open && (
        <div className="ui-theme-picker__popover" role="listbox" aria-label="Theme">
          <button
            type="button"
            role="option"
            aria-selected={preference === 'system'}
            className="ui-theme-picker__option"
            onClick={() => choose('system')}
          >
            <span className="ui-theme-picker__swatch ui-theme-picker__swatch--system" aria-hidden="true" />
            <span className="ui-theme-picker__label">System</span>
          </button>
          {renderGroup('Dark', dark)}
          {renderGroup('Light', light)}
        </div>
      )}
    </div>
  );
}
```

```css
/* src/components/theme/ThemePicker.css */
.ui-theme-picker { position: relative; display: inline-block; }

.ui-theme-picker__trigger,
.ui-theme-picker__option {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font: var(--type-body);
  color: var(--text-primary);
  background: var(--bg-surface-1);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
  cursor: pointer;
}
.ui-theme-picker__trigger:focus-visible,
.ui-theme-picker__option:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

.ui-theme-picker__popover {
  position: absolute;
  top: calc(100% + var(--space-1));
  right: 0;
  z-index: var(--z-dropdown);
  min-width: 220px;
  max-height: 320px;
  overflow-y: auto;
  padding: var(--space-2);
  background: var(--bg-surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.ui-theme-picker__option {
  width: 100%;
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
}
.ui-theme-picker__option:hover { background: var(--accent-subtle); }
.ui-theme-picker__option[aria-selected='true'] {
  background: var(--accent-subtle);
  color: var(--accent);
}

.ui-theme-picker__group { display: flex; flex-direction: column; gap: 2px; }
.ui-theme-picker__group-label {
  font: var(--type-eyebrow-weight) var(--type-eyebrow-size) / 1 var(--font-sans);
  letter-spacing: var(--type-eyebrow-tracking);
  text-transform: uppercase;
  color: var(--text-tertiary);
  padding: var(--space-2) var(--space-3) var(--space-1);
}

.ui-theme-picker__swatch {
  position: relative;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  flex: none;
  overflow: hidden;
}
.ui-theme-picker__swatch > span {
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
}
.ui-theme-picker__swatch--system {
  background: linear-gradient(135deg, #0C0D11 0 50%, #F6F3EE 50% 100%);
}
.ui-theme-picker__label { white-space: nowrap; }
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- ThemePicker`
Expected: PASS — all 3 cases.

- [ ] **Step 5: Commit**

```bash
git add src/components/theme/ThemePicker.tsx src/components/theme/ThemePicker.css src/components/theme/__tests__/ThemePicker.test.tsx
git commit -m "feat(theme): add ThemePicker (grouped, keyboard-accessible)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 10: Theme barrel + pre-paint snippet doc

**Files:**
- Create: `src/components/theme/index.ts`
- Create: `docs/foundations/pre-paint-snippet.md`
- Test: `src/components/theme/__tests__/index.test.ts`

**Interfaces:**
- Consumes: all theme modules.
- Produces: a single import surface `@/components/theme` re-exporting `useTheme`, `ThemeToggle`, `ThemePicker`, the registry API, and the public types. The snippet doc holds the copy-paste `<head>` script host apps add to prevent FOUC.

- [ ] **Step 1: Write the failing test**

```ts
// src/components/theme/__tests__/index.test.ts
import { describe, it, expect } from 'vitest';
import * as theme from '../index';

describe('theme barrel', () => {
  it('re-exports the public API', () => {
    expect(typeof theme.useTheme).toBe('function');
    expect(typeof theme.ThemeToggle).toBe('function');
    expect(typeof theme.ThemePicker).toBe('function');
    expect(typeof theme.getTheme).toBe('function');
    expect(theme.THEME_IDS).toContain('precision');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- theme/__tests__/index`
Expected: FAIL — cannot find `../index`.

- [ ] **Step 3: Create the barrel and the snippet doc**

```ts
// src/components/theme/index.ts
export { useTheme } from './useTheme';
export type { ThemePreference, ResolvedTheme, UseThemeReturn } from './useTheme';
export { ThemeToggle } from './ThemeToggle';
export type { ThemeToggleProps } from './ThemeToggle';
export { ThemePicker } from './ThemePicker';
export type { ThemePickerProps } from './ThemePicker';
export {
  THEMES, THEME_IDS, getTheme, themesByMode, themesByFamily,
} from './registry';
export type {
  ThemeId, ThemeMode, ThemeFamily, ThemeMeta, ThemeEntry, ThemeSwatch,
} from './registry';
```

````markdown
<!-- docs/foundations/pre-paint-snippet.md -->
# Pre-paint theme script (FOUC prevention)

Add this script to your host app's `index.html` `<head>`, BEFORE any stylesheet,
so the correct theme is on `<html>` before first paint. It deliberately does not
know which themes exist — it only reads what `useTheme` persisted.

```html
<script>
  (function () {
    try {
      var pref = localStorage.getItem('ui-theme');      // theme id or 'system' or null
      var mode = localStorage.getItem('ui-theme-mode');  // 'dark' | 'light' | null
      var systemDark = matchMedia('(prefers-color-scheme: dark)').matches;
      var resolvedMode = mode || (systemDark ? 'dark' : 'light');
      // Canonical pair when preference is 'system' or unset.
      var theme = (pref && pref !== 'system') ? pref
        : (resolvedMode === 'dark' ? 'precision' : 'warehouse');
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.setAttribute('data-theme-mode', resolvedMode);
    } catch (e) {
      document.documentElement.setAttribute('data-theme', 'precision');
      document.documentElement.setAttribute('data-theme-mode', 'dark');
    }
  })();
</script>
```

Then import the tokens once in your app entry:

```ts
import '@metalogix/ui-standards/tokens/global.css'; // or the copied path
```
````

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- theme/__tests__/index` then `npm run typecheck`
Expected: PASS; typecheck clean.

- [ ] **Step 5: Commit**

```bash
git add src/components/theme/index.ts docs/foundations/pre-paint-snippet.md src/components/theme/__tests__/index.test.ts
git commit -m "feat(theme): add theme barrel + pre-paint FOUC snippet doc

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 11: Foundation docs (design-tokens + color-and-theming)

Document what Phase 1 built so downstream component authors and agents follow it.

**Files:**
- Create: `docs/foundations/design-tokens.md`
- Create: `docs/foundations/color-and-theming.md`
- Create: `docs/foundations/accessibility.md`
- Test: `docs/__tests__/foundations-docs.test.ts`

**Interfaces:**
- Consumes: the generic-token contract, the registry "add a theme" flow.
- Produces: three reference docs. The docs test asserts they exist and name the contract + the add-a-theme checklist so they can't silently drift to stubs.

- [ ] **Step 1: Write the failing test**

```ts
// docs/__tests__/foundations-docs.test.ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

function read(rel: string) {
  return readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');
}

describe('foundation docs', () => {
  it('design-tokens doc lists the structural token groups', () => {
    const d = read('../foundations/design-tokens.md');
    for (const h of ['Spacing', 'Typography', 'Radius', 'Z-index', 'Motion', 'Layout']) {
      expect(d).toContain(h);
    }
  });
  it('color-and-theming doc names the generic-token contract + add-a-theme steps', () => {
    const d = read('../foundations/color-and-theming.md');
    expect(d).toContain('--bg-base');
    expect(d).toContain('--border-focus');
    expect(d).toContain('data-theme-mode');
    expect(d.toLowerCase()).toContain('add a theme');
  });
  it('accessibility doc states the hard requirements', () => {
    const d = read('../foundations/accessibility.md');
    expect(d.toLowerCase()).toContain('focus');
    expect(d.toLowerCase()).toContain('keyboard');
    expect(d).toContain('prefers-reduced-motion');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- foundations-docs`
Expected: FAIL — cannot find the doc files.

- [ ] **Step 3: Write the three docs**

Write `docs/foundations/design-tokens.md` documenting every structural token group
(Spacing, Typography, Radius, Z-index, Motion, Layout) with the exact values from
`src/tokens/tokens.css` and a one-line usage note per group.

Write `docs/foundations/color-and-theming.md` documenting: the generic-token
contract (the full list, verbatim), the `data-theme` + `data-theme-mode` convention,
how `useTheme`/the pre-paint snippet apply them, and the **"Add a theme"** checklist:
(1) create `src/tokens/themes/<id>.css` mapping all generic tokens, (2) add one
`@import` to `src/tokens/global.css` in the right mode block, (3) add a `THEMES`
entry to `registry.ts`, (4) run `npm run typecheck`.

Write `docs/foundations/accessibility.md` stating the hard requirements: WCAG AA
contrast floors, always-visible focus rings via `--border-focus`, full keyboard
operability for every interactive component, and `prefers-reduced-motion` honored by
all animation.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- foundations-docs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add docs/foundations/design-tokens.md docs/foundations/color-and-theming.md docs/foundations/accessibility.md docs/__tests__/foundations-docs.test.ts
git commit -m "docs: add foundation docs (tokens, theming, accessibility)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Phase 1 exit criteria

- `npm test` and `npm run typecheck` both pass.
- Importing `src/tokens/global.css` + wiring `useTheme`/`ThemeToggle` in any React app yields working day/night + full theme switching with no FOUC.
- The generic-token contract and the add-a-theme flow are documented.

This is the base every later phase builds on. Components in Phases 2–6 reference ONLY generic tokens, so they inherit day/night for free.

---

## Subsequent phase-plans (written just-in-time, same format)

Each is its own `docs/superpowers/plans/` file, produced when we reach it, and each produces working, tested software on its own:

- **Phase 2 — Primitives:** Button, Input, Textarea, Select, Checkbox, Radio, Switch, FormField, Badge/StatusBadge, **FileUpload** (drag-drop + progress + validation). Establishes the component+CSS+test pattern and the a11y conventions all later components reuse.
- **Phase 3 — Layout & shell:** AppShell (sidebar + topnav, **menu grouping**, **account/user section**, collapse), PageHeader (+ width archetypes), Tabs, Breadcrumbs, Card, **DescriptionList**, **Stepper/Wizard**. Consumes the Administration-site-layout contract (§5 of the spec). Depends on Phase 2 + `ThemeToggle`/`ThemePicker`.
- **Phase 4 — Data:** DataTable (server-driven sorting + search + paging, the controlled `DataTableQuery` contract), Pagination, StatCard, EmptyState, Skeleton.
- **Phase 5 — Overlay:** Modal (focus trap) + **ConfirmDialog**, Drawer, Toast (+ provider), DropdownMenu, **Tooltip**, **Popover**, Combobox, DatePicker, CommandPalette, **NotificationsCenter**.
- **Phase 6 — Auth:** LoginScreen (standard 4/5 **near-black brand** : 1/5 form split), ForgotPassword, ResetPassword (reuse the split shell; email via MetaMail), ChangePassword (in-app form).
- **Phase 7 — Docs, gallery & skill:** per-component docs, pattern docs (page-shell, forms-and-validation, data-tables, navigation, feedback, auth, **permissions/RBAC**, **error-pages**, record/detail), self-contained `gallery/index.html` (both themes), `skills/ui-standards/SKILL.md`, and the top-level `README.md`.
- **Phase 8 — Dataviz:** themed chart wrappers (line / bar / area / pie), Sparkline, and dashboard composition guidance following the `dataviz` palette & accessibility rules (themed via the generic tokens).

Still **opt-in** (add on request, each would get its own phase/plan): tree view, calendar/scheduling, CSV import/export, 2FA/MFA. See the Admin-system coverage map in the design spec for the full picture.
