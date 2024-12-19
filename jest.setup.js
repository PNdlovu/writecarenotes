// Add fetch polyfill for tests
require('whatwg-fetch')

// Add React Testing Library matchers
require('@testing-library/jest-dom')

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: {},
      asPath: '',
      push: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn()
      },
      beforePopState: jest.fn(() => null),
      prefetch: jest.fn(() => null)
    };
  },
}));

// Mock IndexedDB
const indexedDB = {
  open: jest.fn(),
  deleteDatabase: jest.fn(),
};
global.indexedDB = indexedDB;

// Mock window.navigator
Object.defineProperty(window, 'navigator', {
  value: {
    onLine: true,
    serviceWorker: {
      register: jest.fn().mockResolvedValue({}),
      ready: Promise.resolve({
        active: {
          postMessage: jest.fn()
        }
      })
    }
  },
  writable: true
});

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({ data: null, status: 'unauthenticated' })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn()
}));

// Suppress console errors and warnings during tests
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  if (args[0]?.includes?.('Warning:')) return;
  originalError.call(console, ...args);
};

console.warn = (...args) => {
  if (args[0]?.includes?.('Warning:')) return;
  originalWarn.call(console, ...args);
};

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
