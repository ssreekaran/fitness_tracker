// Setup for tests with Vitest and Testing Library
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
Object.entries(matchers).forEach(([key, value]) => {
  // Use type assertion with a more specific type
  (expect as typeof expect & {
    extend(matchers: Record<string, unknown>): void;
  }).extend({ [key]: value });
});

// Mock window.matchMedia which is not implemented in JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

// Run cleanup after each test case
afterEach(() => {
  cleanup();
});
