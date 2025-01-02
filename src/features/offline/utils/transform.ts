import { DiffResult, DiffOperation, TransformResult } from '../types';

export const operationalTransform = {
  /**
   * Transform concurrent operations to maintain consistency
   */
  transform(operation1: DiffResult, operation2: DiffResult): TransformResult {
    if (operation1.type === 'none' || operation2.type === 'none') {
      return {
        operation1,
        operation2,
      };
    }

    if (operation1.type === 'array' && operation2.type === 'array') {
      return this.transformArrayOperations(operation1, operation2);
    }

    if (operation1.type === 'object' && operation2.type === 'object') {
      return this.transformObjectOperations(operation1, operation2);
    }

    // For replace operations or mixed types, keep both changes
    return {
      operation1,
      operation2,
    };
  },

  /**
   * Transform array operations
   */
  private transformArrayOperations(op1: DiffResult, op2: DiffResult): TransformResult {
    const transformed1: DiffOperation[] = [];
    const transformed2: DiffOperation[] = [];

    // Clone operations to avoid mutating the originals
    const ops1 = [...(op1.operations || [])];
    const ops2 = [...(op2.operations || [])];

    // Sort operations by index
    ops1.sort((a, b) => (a.index || 0) - (b.index || 0));
    ops2.sort((a, b) => (a.index || 0) - (b.index || 0));

    // Transform each operation
    for (const operation of ops1) {
      const transformedOp = this.adjustArrayOperation(operation, ops2);
      if (transformedOp) {
        transformed1.push(transformedOp);
      }
    }

    for (const operation of ops2) {
      const transformedOp = this.adjustArrayOperation(operation, ops1);
      if (transformedOp) {
        transformed2.push(transformedOp);
      }
    }

    return {
      operation1: { ...op1, operations: transformed1 },
      operation2: { ...op2, operations: transformed2 },
    };
  },

  /**
   * Transform object operations
   */
  private transformObjectOperations(op1: DiffResult, op2: DiffResult): TransformResult {
    const transformed1: DiffOperation[] = [];
    const transformed2: DiffOperation[] = [];

    // Handle operations that don't conflict
    for (const operation of op1.operations || []) {
      if (!this.operationsConflict(operation, op2.operations || [])) {
        transformed1.push(operation);
      }
    }

    for (const operation of op2.operations || []) {
      if (!this.operationsConflict(operation, op1.operations || [])) {
        transformed2.push(operation);
      }
    }

    return {
      operation1: { ...op1, operations: transformed1 },
      operation2: { ...op2, operations: transformed2 },
    };
  },

  /**
   * Adjust array operation based on concurrent operations
   */
  private adjustArrayOperation(operation: DiffOperation, concurrentOps: DiffOperation[]): DiffOperation | null {
    let adjustedOp = { ...operation };
    let offset = 0;

    for (const concurrentOp of concurrentOps) {
      if ((concurrentOp.index || 0) < (adjustedOp.index || 0)) {
        if (concurrentOp.type === 'add') {
          offset++;
        } else if (concurrentOp.type === 'remove') {
          offset--;
        }
      }
    }

    if (adjustedOp.index !== undefined) {
      adjustedOp.index += offset;
    }

    return adjustedOp;
  },

  /**
   * Check if operations conflict
   */
  private operationsConflict(operation: DiffOperation, concurrentOps: DiffOperation[]): boolean {
    return concurrentOps.some(
      (concurrentOp) =>
        operation.key === concurrentOp.key || 
        operation.index === concurrentOp.index
    );
  },
};
