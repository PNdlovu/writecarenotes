import '@testing-library/jest-dom';
import 'whatwg-fetch';
import { TextEncoder, TextDecoder } from 'util';
import 'fake-indexeddb/auto';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock crypto
Object.defineProperty(window, 'crypto', {
  value: {
    subtle: {
      encrypt: jest.fn(),
      decrypt: jest.fn(),
      generateKey: jest.fn(),
    },
    randomUUID: () => 'test-uuid',
    getRandomValues: jest.fn()
  }
});

// Mock TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Cache class
class CacheMock {
  private store = new Map<Request | string, Response>();

  async add(request: string | Request): Promise<void> {
    const response = new Response();
    this.store.set(request, response);
  }

  async addAll(requests: Array<string | Request>): Promise<void> {
    await Promise.all(requests.map(request => this.add(request)));
  }

  async delete(request: string | Request, options?: CacheQueryOptions): Promise<boolean> {
    return this.store.delete(request);
  }

  async match(request: string | Request, options?: CacheQueryOptions): Promise<Response | undefined> {
    return this.store.get(request);
  }

  async matchAll(request?: string | Request, options?: CacheQueryOptions): Promise<Response[]> {
    if (request) {
      const match = await this.match(request, options);
      return match ? [match] : [];
    }
    return Array.from(this.store.values());
  }

  async keys(request?: string | Request, options?: CacheQueryOptions): Promise<ReadonlyArray<Request>> {
    const keys = Array.from(this.store.keys());
    return keys.map(key => typeof key === 'string' ? new Request(key) : key);
  }

  async put(request: string | Request, response: Response): Promise<void> {
    this.store.set(request, response);
  }
}

// Set up Cache mock
global.Cache = CacheMock as any;

// Mock IDB
jest.mock('idb', () => ({
  openDB: jest.fn().mockImplementation(() => ({
    transaction: jest.fn(),
    objectStoreNames: {
      contains: jest.fn().mockReturnValue(true)
    },
    createObjectStore: jest.fn(),
    close: jest.fn()
  }))
}));

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
