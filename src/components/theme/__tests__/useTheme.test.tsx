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

/**
 * Like mockMatchMedia, but captures the listener registered via
 * addEventListener('change', ...) so a test can simulate an OS theme
 * change by invoking it directly.
 */
function mockMatchMediaWithChangeCapture(dark: boolean) {
  let changeHandler: (() => void) | undefined;
  let currentlyDark = dark;
  vi.stubGlobal('matchMedia', (query: string) => ({
    get matches() {
      return currentlyDark && query.includes('dark');
    },
    media: query,
    addEventListener: vi.fn((event: string, handler: () => void) => {
      if (event === 'change') changeHandler = handler;
    }),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    onchange: null,
    dispatchEvent: vi.fn(),
  }));
  return {
    simulateChange(nextDark: boolean) {
      currentlyDark = nextDark;
      changeHandler?.();
    },
  };
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

  it("updates resolvedTheme and DOM attributes when the OS theme changes while preference is 'system'", () => {
    const mq = mockMatchMediaWithChangeCapture(true);
    const { result } = renderHook(() => useTheme());

    expect(result.current.preference).toBe('system');
    expect(result.current.resolvedTheme).toBe('precision');
    expect(document.documentElement.getAttribute('data-theme')).toBe('precision');
    expect(document.documentElement.getAttribute('data-theme-mode')).toBe('dark');

    act(() => {
      mq.simulateChange(false);
    });

    expect(result.current.resolvedTheme).toBe('warehouse');
    expect(document.documentElement.getAttribute('data-theme')).toBe('warehouse');
    expect(document.documentElement.getAttribute('data-theme-mode')).toBe('light');
  });
});
