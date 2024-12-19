export type AuditLogAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'SOFT_DELETE'
  | 'RESTORE'
  | 'VIEW'
  | 'EXPORT'
  | 'IMPORT'
  | 'LOGIN'
  | 'LOGOUT'
  | 'PERMISSION_CHANGE'
  | 'STATUS_CHANGE'
  | 'REGISTRATION_UPDATE'
  | 'COMPLIANCE_CHECK';

export type AuditLogStatus = 'SUCCESS' | 'FAILURE';

export type AuditLogActorType = 'USER' | 'SYSTEM' | 'API' | 'INTEGRATION'; 


