import { DatabaseManager } from '../../utils/db';

// Mock IndexedDB
const indexedDB = {
  open: jest.fn(),
  deleteDatabase: jest.fn(),
};
(global as any).indexedDB = indexedDB;

describe('DatabaseManager', () => {
  let db: DatabaseManager;

  beforeEach(() => {
    db = DatabaseManager.getInstance();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const instance1 = DatabaseManager.getInstance();
      const instance2 = DatabaseManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('connect', () => {
    it('should connect to IndexedDB', async () => {
      const mockDB = {
        createObjectStore: jest.fn(),
      };
      const mockUpgrade = jest.fn((db) => {
        db.createObjectStore('schedules', { keyPath: 'id' });
        db.createObjectStore('changes', { keyPath: 'id' });
        db.createObjectStore('notifications', { keyPath: 'id' });
      });

      indexedDB.open.mockImplementation(() => ({
        result: mockDB,
        onupgradeneeded: mockUpgrade,
      }));

      await db.connect();
      expect(indexedDB.open).toHaveBeenCalledWith('schedule-db', 1);
    });
  });

  describe('saveSchedule', () => {
    it('should save schedule and track change', async () => {
      const schedule = {
        id: '123',
        title: 'Test Schedule',
      };

      const mockStore = {
        put: jest.fn(),
        add: jest.fn(),
      };

      const mockTransaction = {
        objectStore: jest.fn(() => mockStore),
      };

      (db as any).db = {
        transaction: jest.fn(() => mockTransaction),
      };

      await db.saveSchedule(schedule);

      expect(mockStore.put).toHaveBeenCalledWith({
        id: '123',
        data: schedule,
        lastModified: expect.any(Date),
        syncStatus: 'pending',
      });
    });
  });

  describe('getSchedule', () => {
    it('should retrieve schedule by id', async () => {
      const mockSchedule = {
        id: '123',
        data: { title: 'Test Schedule' },
      };

      const mockStore = {
        get: jest.fn().mockResolvedValue(mockSchedule),
      };

      const mockTransaction = {
        objectStore: jest.fn(() => mockStore),
      };

      (db as any).db = {
        transaction: jest.fn(() => mockTransaction),
      };

      const result = await db.getSchedule('123');
      expect(result).toEqual(mockSchedule.data);
    });
  });

  describe('deleteSchedule', () => {
    it('should delete schedule and track change', async () => {
      const mockStore = {
        delete: jest.fn(),
        add: jest.fn(),
      };

      const mockTransaction = {
        objectStore: jest.fn(() => mockStore),
      };

      (db as any).db = {
        transaction: jest.fn(() => mockTransaction),
      };

      await db.deleteSchedule('123');
      expect(mockStore.delete).toHaveBeenCalledWith('123');
    });
  });

  describe('getStorageEstimate', () => {
    it('should return storage usage estimate', async () => {
      const mockEstimate = {
        usage: 1000,
        quota: 10000,
      };

      (navigator as any).storage = {
        estimate: jest.fn().mockResolvedValue(mockEstimate),
      };

      const result = await db.getStorageEstimate();
      expect(result).toEqual(mockEstimate);
    });
  });
});
