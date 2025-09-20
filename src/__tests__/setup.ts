import '@testing-library/jest-dom';

// Global test setup
beforeEach(() => {
  // Reset any global state before each test
});

// Mock Next.js modules that are commonly used in components
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/test-path',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    React.createElement('a', { href, ...props }, children)
  ),
}));

// Mock React import for JSX
import React from 'react';
global.React = React;