// src/features/offline/types/errors.ts
export class OfflineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OfflineError';
  }
}

export class SyncError extends OfflineError {
  constructor(message: string, public readonly changes?: any[]) {
    super(message);
    this.name = 'SyncError';
  }
}

export class StorageError extends OfflineError {
  constructor(message: string, public readonly operation: string) {
    super(message);
    this.name = 'StorageError';
  }
}

export class ValidationError extends OfflineError {
  constructor(message: string, public readonly entity: string, public readonly data: any) {
    super(message);
    this.name = 'ValidationError';
  }
}
