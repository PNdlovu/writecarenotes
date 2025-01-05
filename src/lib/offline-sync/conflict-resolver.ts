import { MedicationAction, ConflictResolutionStrategy } from './types';
import { hashObject } from './utils';

export class ConflictResolver {
  /**
   * Resolves conflicts between client and server data
   */
  static async resolveConflict(
    clientAction: MedicationAction,
    serverData: any,
    strategy: ConflictResolutionStrategy
  ): Promise<any> {
    switch (strategy) {
      case 'client_wins':
        return clientAction.data;
        
      case 'server_wins':
        return serverData;
        
      case 'merge':
        return await this.mergeData(clientAction.data, serverData);
        
      case 'manual':
        return {
          _conflict: true,
          clientData: clientAction.data,
          serverData: serverData,
          needsResolution: true,
        };
        
      default:
        throw new Error(`Unknown conflict resolution strategy: ${strategy}`);
    }
  }

  /**
   * Merges client and server data intelligently based on data type
   */
  private static async mergeData(clientData: any, serverData: any): Promise<any> {
    // If either is null/undefined, return the other
    if (!clientData) return serverData;
    if (!serverData) return clientData;

    // If different types, can't merge
    if (typeof clientData !== typeof serverData) {
      throw new Error('Cannot merge different data types');
    }

    // Handle arrays
    if (Array.isArray(clientData) && Array.isArray(serverData)) {
      return this.mergeArrays(clientData, serverData);
    }

    // Handle objects
    if (typeof clientData === 'object' && typeof serverData === 'object') {
      return this.mergeObjects(clientData, serverData);
    }

    // For primitive types, prefer server data
    return serverData;
  }

  /**
   * Merges arrays by comparing object hashes
   */
  private static mergeArrays(clientArray: any[], serverArray: any[]): any[] {
    const merged = new Map();
    
    // Add all server items
    for (const item of serverArray) {
      const hash = hashObject(item);
      merged.set(hash, item);
    }
    
    // Add client items that don't exist in server
    for (const item of clientArray) {
      const hash = hashObject(item);
      if (!merged.has(hash)) {
        merged.set(hash, item);
      }
    }
    
    return Array.from(merged.values());
  }

  /**
   * Merges objects recursively
   */
  private static mergeObjects(clientObj: any, serverObj: any): any {
    const merged = { ...serverObj };
    
    for (const [key, value] of Object.entries(clientObj)) {
      // If key doesn't exist in server, add it
      if (!(key in serverObj)) {
        merged[key] = value;
        continue;
      }
      
      // If both are objects, merge recursively
      if (
        typeof value === 'object' &&
        value !== null &&
        typeof serverObj[key] === 'object' &&
        serverObj[key] !== null
      ) {
        merged[key] = this.mergeObjects(value, serverObj[key]);
      }
      // Otherwise keep server value
    }
    
    return merged;
  }
}


