import { Assessment } from '../../types/assessment.types';
import { Visit } from '../../types/visit.types';

export type ConflictResolutionStrategy = 'CLIENT_WINS' | 'SERVER_WINS' | 'MANUAL_MERGE';

interface ConflictMetadata {
  entityId: string;
  entityType: 'ASSESSMENT' | 'VISIT';
  clientVersion: number;
  serverVersion: number;
  clientTimestamp: number;
  serverTimestamp: number;
  conflictFields: string[];
}

export class ConflictResolver {
  private static instance: ConflictResolver;
  private defaultStrategy: ConflictResolutionStrategy = 'CLIENT_WINS';
  private manualResolvers: Map<string, (conflict: any) => Promise<any>> = new Map();

  private constructor() {}

  static getInstance(): ConflictResolver {
    if (!ConflictResolver.instance) {
      ConflictResolver.instance = new ConflictResolver();
    }
    return ConflictResolver.instance;
  }

  setDefaultStrategy(strategy: ConflictResolutionStrategy): void {
    this.defaultStrategy = strategy;
  }

  registerManualResolver(
    entityType: string,
    resolver: (conflict: any) => Promise<any>
  ): void {
    this.manualResolvers.set(entityType, resolver);
  }

  async resolveConflict<T extends Assessment | Visit>(
    clientData: T,
    serverData: T,
    metadata: ConflictMetadata,
    strategy?: ConflictResolutionStrategy
  ): Promise<T> {
    const resolveStrategy = strategy || this.defaultStrategy;

    switch (resolveStrategy) {
      case 'CLIENT_WINS':
        return this.resolveClientWins(clientData, serverData, metadata);
      case 'SERVER_WINS':
        return this.resolveServerWins(clientData, serverData, metadata);
      case 'MANUAL_MERGE':
        return this.resolveManualMerge(clientData, serverData, metadata);
      default:
        throw new Error(`Unknown conflict resolution strategy: ${resolveStrategy}`);
    }
  }

  private async resolveClientWins<T>(
    clientData: T,
    serverData: T,
    metadata: ConflictMetadata
  ): Promise<T> {
    // Keep client changes but merge non-conflicting server updates
    const mergedData = { ...serverData };
    
    metadata.conflictFields.forEach(field => {
      if (field.includes('.')) {
        // Handle nested fields
        const parts = field.split('.');
        let current: any = mergedData;
        for (let i = 0; i < parts.length - 1; i++) {
          current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = (clientData as any)[parts[0]][parts[parts.length - 1]];
      } else {
        (mergedData as any)[field] = (clientData as any)[field];
      }
    });

    return mergedData;
  }

  private async resolveServerWins<T>(
    clientData: T,
    serverData: T,
    metadata: ConflictMetadata
  ): Promise<T> {
    // Keep server data but preserve non-conflicting client changes
    const mergedData = { ...clientData };
    
    metadata.conflictFields.forEach(field => {
      if (field.includes('.')) {
        // Handle nested fields
        const parts = field.split('.');
        let current: any = mergedData;
        for (let i = 0; i < parts.length - 1; i++) {
          current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = (serverData as any)[parts[0]][parts[parts.length - 1]];
      } else {
        (mergedData as any)[field] = (serverData as any)[field];
      }
    });

    return mergedData;
  }

  private async resolveManualMerge<T>(
    clientData: T,
    serverData: T,
    metadata: ConflictMetadata
  ): Promise<T> {
    const resolver = this.manualResolvers.get(metadata.entityType);
    if (resolver) {
      return await resolver({
        clientData,
        serverData,
        metadata,
      });
    }

    throw new Error(
      `No manual resolver registered for entity type: ${metadata.entityType}`
    );
  }

  detectConflicts<T extends Assessment | Visit>(
    clientData: T,
    serverData: T
  ): ConflictMetadata {
    const conflicts: string[] = [];
    const clientTimestamp = new Date(clientData.updatedAt).getTime();
    const serverTimestamp = new Date(serverData.updatedAt).getTime();

    // Compare all fields recursively
    this.compareObjects(clientData, serverData, '', conflicts);

    return {
      entityId: clientData.id,
      entityType: this.getEntityType(clientData),
      clientVersion: clientData.version as unknown as number,
      serverVersion: serverData.version as unknown as number,
      clientTimestamp,
      serverTimestamp,
      conflictFields: conflicts,
    };
  }

  private getEntityType(data: Assessment | Visit): 'ASSESSMENT' | 'VISIT' {
    return 'visitType' in data ? 'VISIT' : 'ASSESSMENT';
  }

  private compareObjects(obj1: any, obj2: any, path: string, conflicts: string[]): void {
    for (const key in obj1) {
      const currentPath = path ? `${path}.${key}` : key;

      if (typeof obj1[key] === 'object' && obj1[key] !== null) {
        if (typeof obj2[key] === 'object' && obj2[key] !== null) {
          this.compareObjects(obj1[key], obj2[key], currentPath, conflicts);
        } else if (obj1[key] !== obj2[key]) {
          conflicts.push(currentPath);
        }
      } else if (obj1[key] !== obj2[key]) {
        conflicts.push(currentPath);
      }
    }
  }
}
