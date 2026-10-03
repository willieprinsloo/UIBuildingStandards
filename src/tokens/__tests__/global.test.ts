// @vitest-environment node
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
