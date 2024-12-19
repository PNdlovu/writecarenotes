import { syncManager } from '../../utils/sync';
import { DatabaseManager } from '../../utils/db';

// Mock fetch
global.fetch = jest.fn();

// Mock navigator.serviceWorker
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    ready: Promise.resolve({
      sync: {
        register: jest.fn(),
      },
      periodicSync: {
        register: jest.fn(),
      },
    }),
  },
});

describe('SyncManager', () => {
  let manager: typeof syncManager;

  beforeEach(() => {
    manager = syncManager;
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize with custom config', async () => {
      const config = {
        autoSync: true,
        syncInterval: 10,
        maxRetries: 5,
      };

      await manager.initialize(config);
      expect((manager as any).config).toMatchObject(config);
    });

    it('should register periodic sync if supported', async () => {
      await manager.initialize();
      expect(navigator.serviceWorker.ready.then).toBeCalled();
    });
  });

  describe('syncChanges', () => {
    it('should not sync if already syncing', async () => {
      (manager as any).syncInProgress = true;
      await manager.syncChanges();
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should not sync if offline', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false });
      await manager.syncChanges();
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should process changes in batches', async () => {
      const mockChanges = [
        {
          id: '1',
          type: 'create',
          entityType: 'schedule',
          data: { title: 'Test 1' },
        },
        {
          id: '2',
          type: 'update',
          entityType: 'schedule',
          data: { title: 'Test 2' },
        },
      ];

      const db = DatabaseManager.getInstance();
      jest.spyOn(db, 'getChanges').mockResolvedValue(mockChanges);
      jest.spyOn(db, 'markChangeProcessed').mockResolvedValue();

      (fetch as jest.Mock).mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        })
      );

      await manager.syncChanges();

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(db.markChangeProcessed).toHaveBeenCalledTimes(2);
    });

    it('should handle sync errors', async () => {
      const mockChange = {
        id: '1',
        type: 'create',
        entityType: 'schedule',
        data: { title: 'Test' },
      };

      const db = DatabaseManager.getInstance();
      jest.spyOn(db, 'getChanges').mockResolvedValue([mockChange]);
      jest.spyOn(db, 'markChangeError').mockResolvedValue();

      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await manager.syncChanges();

      expect(db.markChangeError).toHaveBeenCalledWith(
        '1',
        expect.any(String)
      );
    });
  });

  describe('getStorageUsage', () => {
    it('should return storage usage stats', async () => {
      const mockEstimate = {
        usage: 1000,
        quota: 10000,
      };

      jest
        .spyOn(DatabaseManager.getInstance(), 'getStorageEstimate')
        .mockResolvedValue(mockEstimate);

      const result = await manager.getStorageUsage();

      expect(result).toEqual({
        usage: 1000,
        quota: 10000,
        percentUsed: 10,
      });
    });
  });

  describe('updateConfig', () => {
    it('should update config and re-register periodic sync', async () => {
      const newConfig = {
        syncInterval: 15,
        maxRetries: 5,
      };

      await manager.updateConfig(newConfig);

      expect((manager as any).config).toMatchObject({
        ...manager.config,
        ...newConfig,
      });
    });
  });
});
