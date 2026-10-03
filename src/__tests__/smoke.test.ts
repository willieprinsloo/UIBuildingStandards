import { describe, it, expect } from 'vitest';

describe('harness', () => {
  it('runs TypeScript tests', () => {
    expect(1 + 1).toBe(2);
  });
  it('has jsdom document', () => {
    expect(typeof document).toBe('object');
  });
});
