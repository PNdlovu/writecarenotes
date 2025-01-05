interface PriorityQueueItem<T> {
  id: string;
  data: T;
  priority: number;
  timestamp: number;
  retryCount: number;
  dependencies?: string[];
}

export class PriorityQueue<T> {
  private items: PriorityQueueItem<T>[] = [];
  private maxRetries: number = 3;
  private processingItems: Set<string> = new Set();

  constructor(maxRetries: number = 3) {
    this.maxRetries = maxRetries;
  }

  enqueue(
    id: string,
    data: T,
    priority: number = 0,
    dependencies: string[] = []
  ): void {
    const existingIndex = this.items.findIndex(item => item.id === id);
    const newItem: PriorityQueueItem<T> = {
      id,
      data,
      priority,
      timestamp: Date.now(),
      retryCount: 0,
      dependencies
    };

    if (existingIndex !== -1) {
      // Update existing item
      this.items[existingIndex] = {
        ...this.items[existingIndex],
        ...newItem,
        retryCount: this.items[existingIndex].retryCount
      };
    } else {
      this.items.push(newItem);
    }

    this.sort();
  }

  dequeue(): PriorityQueueItem<T> | null {
    if (this.isEmpty()) return null;

    // Find the first item that can be processed (no unprocessed dependencies)
    const index = this.items.findIndex(item => 
      !item.dependencies?.some(dep => this.items.some(i => i.id === dep))
    );

    if (index === -1) return null;

    const item = this.items[index];
    this.items.splice(index, 1);
    this.processingItems.add(item.id);
    return item;
  }

  peek(): PriorityQueueItem<T> | null {
    return this.isEmpty() ? null : this.items[0];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }

  markAsComplete(id: string): void {
    this.processingItems.delete(id);
  }

  markAsFailed(id: string): void {
    const item = this.items.find(item => item.id === id);
    if (item) {
      item.retryCount++;
      if (item.retryCount >= this.maxRetries) {
        this.processingItems.delete(id);
      } else {
        // Requeue with reduced priority
        this.enqueue(
          item.id,
          item.data,
          item.priority - 1,
          item.dependencies
        );
      }
    }
    this.processingItems.delete(id);
  }

  isProcessing(id: string): boolean {
    return this.processingItems.has(id);
  }

  getProcessingCount(): number {
    return this.processingItems.size;
  }

  clear(): void {
    this.items = [];
    this.processingItems.clear();
  }

  private sort(): void {
    this.items.sort((a, b) => {
      // First, check dependencies
      const aDepsReady = !a.dependencies?.some(dep => 
        this.items.some(i => i.id === dep)
      );
      const bDepsReady = !b.dependencies?.some(dep => 
        this.items.some(i => i.id === dep)
      );

      if (aDepsReady !== bDepsReady) {
        return aDepsReady ? -1 : 1;
      }

      // Then, check priority
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }

      // Finally, check timestamp
      return a.timestamp - b.timestamp;
    });
  }

  getDependencyGraph(): Map<string, string[]> {
    const graph = new Map<string, string[]>();
    this.items.forEach(item => {
      graph.set(item.id, item.dependencies || []);
    });
    return graph;
  }

  getItemsByPriority(): Map<number, PriorityQueueItem<T>[]> {
    const priorityMap = new Map<number, PriorityQueueItem<T>[]>();
    this.items.forEach(item => {
      const items = priorityMap.get(item.priority) || [];
      items.push(item);
      priorityMap.set(item.priority, items);
    });
    return priorityMap;
  }
}
