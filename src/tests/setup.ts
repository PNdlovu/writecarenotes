import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { TextEncoder, TextDecoder } from 'util';

// Mock browser APIs
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;
global.crypto = {
  randomUUID: () => 'test-uuid',
  subtle: {} as any,
} as any;

// Mock IndexedDB
const indexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
};
global.indexedDB = indexedDB as any;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

// Mock fetch
global.fetch = vi.fn();

// Mock window.navigator
Object.defineProperty(window.navigator, 'onLine', {
  configurable: true,
  value: true,
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  indexedDB.open.mockReset();
});


