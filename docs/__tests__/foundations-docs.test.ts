// @vitest-environment node
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
