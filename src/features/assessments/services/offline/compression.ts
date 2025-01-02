import pako from 'pako';

export class CompressionService {
  private static instance: CompressionService;
  private compressionThreshold: number = 1024; // 1KB

  private constructor() {}

  static getInstance(): CompressionService {
    if (!CompressionService.instance) {
      CompressionService.instance = new CompressionService();
    }
    return CompressionService.instance;
  }

  setCompressionThreshold(bytes: number): void {
    this.compressionThreshold = bytes;
  }

  shouldCompress(data: string): boolean {
    return data.length > this.compressionThreshold;
  }

  compress(data: any): string {
    const jsonString = JSON.stringify(data);
    
    if (!this.shouldCompress(jsonString)) {
      return jsonString;
    }

    const compressed = pako.deflate(jsonString, { to: 'string' });
    return `compressed:${compressed}`;
  }

  decompress(data: string): any {
    if (!data.startsWith('compressed:')) {
      return JSON.parse(data);
    }

    const compressed = data.slice('compressed:'.length);
    const decompressed = pako.inflate(compressed, { to: 'string' });
    return JSON.parse(decompressed);
  }

  // Compress specific fields in an object
  compressFields<T extends object>(
    data: T,
    fieldsToCompress: (keyof T)[]
  ): T {
    const compressedData = { ...data };

    fieldsToCompress.forEach((field) => {
      if (data[field]) {
        const fieldData = JSON.stringify(data[field]);
        if (this.shouldCompress(fieldData)) {
          (compressedData as any)[field] = this.compress(data[field]);
        }
      }
    });

    return compressedData;
  }

  // Decompress specific fields in an object
  decompressFields<T extends object>(
    data: T,
    fieldsToDecompress: (keyof T)[]
  ): T {
    const decompressedData = { ...data };

    fieldsToDecompress.forEach((field) => {
      if (data[field] && typeof data[field] === 'string') {
        try {
          (decompressedData as any)[field] = this.decompress(data[field] as string);
        } catch (error) {
          console.warn(`Failed to decompress field ${String(field)}:`, error);
          (decompressedData as any)[field] = data[field];
        }
      }
    });

    return decompressedData;
  }

  // Get compression stats
  getCompressionStats(original: any, compressed: string): {
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
  } {
    const originalSize = JSON.stringify(original).length;
    const compressedSize = compressed.length;
    const compressionRatio = (compressedSize / originalSize) * 100;

    return {
      originalSize,
      compressedSize,
      compressionRatio,
    };
  }
}
