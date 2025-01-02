/**
 * @fileoverview Test setup for calendar module
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next-i18next
vi.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
    },
  }),
}));

// Mock network status
vi.mock('@/hooks/use-network', () => ({
  useNetwork: () => ({
    isOnline: true,
  }),
}));

// Mock toast notifications
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

// Mock API client
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock offline sync
vi.mock('@/hooks/use-offline-sync', () => ({
  useOfflineSync: () => ({
    queueOfflineAction: vi.fn(),
    syncOfflineActions: vi.fn(),
    getPendingActions: () => [],
  }),
})); 