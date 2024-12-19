export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: DocumentMetadata;
}

export interface DocumentMetadata {
  version: string;
  tags: string[];
  securityLevel: SecurityLevel;
  retentionPeriod?: number;
}

export enum SecurityLevel {
  PUBLIC = 'PUBLIC',
  INTERNAL = 'INTERNAL',
  CONFIDENTIAL = 'CONFIDENTIAL',
  RESTRICTED = 'RESTRICTED'
}

export type DocumentFilter = {
  searchTerm?: string;
  tags?: string[];
  securityLevel?: SecurityLevel;
  dateRange?: {
    start: Date;
    end: Date;
  };
};


