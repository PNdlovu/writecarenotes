/**
 * @fileoverview Document type definitions for WriteNotes Enterprise Platform
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Phibu Cloud Solutions Ltd.
 */

import { User } from '@prisma/client';

export interface DocumentVersion {
  id: string;
  version: number;
  createdAt: string;
  createdBy?: {
    name: string;
  };
  changes?: string[];
}

export interface DocumentShare {
  id: string;
  user: Pick<User, 'id' | 'email' | 'name'>;
  permission: 'VIEW' | 'EDIT' | 'MANAGE';
  createdAt: string;
  expiresAt?: string;
}

export interface DocumentSecurity {
  isEncrypted: boolean;
  password?: string;
  watermark?: string;
  expiryDate?: string;
  trackDownloads: boolean;
  retentionPeriod?: string;
  lastAccessedAt?: string;
  accessCount?: number;
}

export interface DocumentMetadata {
  id: string;
  title: string;
  description?: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  updatedAt: string;
  createdBy: Pick<User, 'id' | 'name'>;
  updatedBy: Pick<User, 'id' | 'name'>;
  tags?: string[];
  category?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export interface DocumentPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
  canManage: boolean;
}

export interface DocumentStats {
  viewCount: number;
  downloadCount: number;
  shareCount: number;
  lastViewed?: string;
  lastDownloaded?: string;
  lastShared?: string;
}

export interface Document {
  id: string;
  metadata: DocumentMetadata;
  security: DocumentSecurity;
  permissions: DocumentPermissions;
  stats: DocumentStats;
  content?: string;
  versions?: DocumentVersion[];
  shares?: DocumentShare[];
}

export type DocumentAction = 
  | { type: 'VIEW' }
  | { type: 'EDIT'; changes: string[] }
  | { type: 'SHARE'; shareWith: string; permission: DocumentShare['permission'] }
  | { type: 'DOWNLOAD' }
  | { type: 'DELETE' }
  | { type: 'ARCHIVE' }
  | { type: 'RESTORE' }; 


