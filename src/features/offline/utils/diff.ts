import { DiffResult, DiffOperation } from '../types';

export const diffCalculator = {
  /**
   * Calculate the difference between two objects
   */
  calculate(oldValue: any, newValue: any): DiffResult {
    if (typeof oldValue !== typeof newValue) {
      return {
        type: 'replace',
        oldValue,
        newValue,
      };
    }

    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      return this.calculateArrayDiff(oldValue, newValue);
    }

    if (typeof oldValue === 'object' && oldValue !== null) {
      return this.calculateObjectDiff(oldValue, newValue);
    }

    if (oldValue !== newValue) {
      return {
        type: 'replace',
        oldValue,
        newValue,
      };
    }

    return {
      type: 'none',
      oldValue,
      newValue,
    };
  },

  /**
   * Calculate differences between arrays
   */
  private calculateArrayDiff(oldArray: any[], newArray: any[]): DiffResult {
    const operations: DiffOperation[] = [];
    const maxLength = Math.max(oldArray.length, newArray.length);

    for (let i = 0; i < maxLength; i++) {
      if (i >= oldArray.length) {
        operations.push({
          type: 'add',
          index: i,
          value: newArray[i],
        });
      } else if (i >= newArray.length) {
        operations.push({
          type: 'remove',
          index: i,
          value: oldArray[i],
        });
      } else if (oldArray[i] !== newArray[i]) {
        operations.push({
          type: 'replace',
          index: i,
          oldValue: oldArray[i],
          newValue: newArray[i],
        });
      }
    }

    return {
      type: 'array',
      operations,
    };
  },

  /**
   * Calculate differences between objects
   */
  private calculateObjectDiff(oldObj: Record<string, any>, newObj: Record<string, any>): DiffResult {
    const operations: DiffOperation[] = [];
    const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

    for (const key of allKeys) {
      if (!(key in oldObj)) {
        operations.push({
          type: 'add',
          key,
          value: newObj[key],
        });
      } else if (!(key in newObj)) {
        operations.push({
          type: 'remove',
          key,
          value: oldObj[key],
        });
      } else if (oldObj[key] !== newObj[key]) {
        operations.push({
          type: 'replace',
          key,
          oldValue: oldObj[key],
          newValue: newObj[key],
        });
      }
    }

    return {
      type: 'object',
      operations,
    };
  },
};
