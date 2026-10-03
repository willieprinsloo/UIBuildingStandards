// @vitest-environment node
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
