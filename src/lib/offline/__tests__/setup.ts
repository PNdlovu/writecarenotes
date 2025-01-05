/**
 * @writecarenotes.com
 * @fileoverview Test setup for offline module
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Setup file for offline module tests. Mocks browser APIs including
 * IndexedDB, localStorage, and fetch. Provides a clean testing
 * environment for offline functionality.
 */

import { vi } from 'vitest';
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { IDBKeyRange } from 'fake-indexeddb';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

// Mock window.navigator.onLine
Object.defineProperty(window.navigator, 'onLine', {
  get: () => true,
  configurable: true,
});

// Mock fetch if not in a browser environment
if (!globalThis.fetch) {
  globalThis.fetch = vi.fn();
}

// Mock IndexedDB
Object.defineProperty(window, 'indexedDB', {
  value: new IDBFactory(),
});

Object.defineProperty(window, 'IDBKeyRange', {
  value: IDBKeyRange,
});

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock online/offline events
window.addEventListener = vi.fn();
window.removeEventListener = vi.fn();

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
}); 