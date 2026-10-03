// @vitest-environment node
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
