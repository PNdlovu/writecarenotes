export type CareHomeErrorType = 
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CREATE_ERROR'
  | 'UPDATE_ERROR'
  | 'DELETE_ERROR'
  | 'FETCH_ERROR'
  | 'REGISTRATION_ERROR';

export class CareHomeError extends Error {
  constructor(
    message: string,
    public type: CareHomeErrorType,
    public cause?: unknown
  ) {
    super(message);
    this.name = 'CareHomeError';
  }
} 


