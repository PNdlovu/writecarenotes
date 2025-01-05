/**
 * @fileoverview Data compression utility for offline storage optimization
 * @version 1.0.0
 */

import { Logger } from '@/lib/logger';
import { Metrics } from '@/lib/metrics';
import { CompressionError } from '../types/errors';

export class CompressionUtil {
  private logger: Logger;
  private metrics: Metrics;

  constructor() {
    this.logger = new Logger('CompressionUtil');
    this.metrics = new Metrics('compression');
  }

  /**
   * Compress data using efficient algorithms
   */
  async compress(data: any): Promise<Uint8Array> {
    const startTime = performance.now();
    
    try {
      // Convert data to string if not already
      const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
      
      // Convert string to Uint8Array
      const textEncoder = new TextEncoder();
      const uint8Array = textEncoder.encode(jsonString);
      
      // Compress using CompressionStream
      const cs = new CompressionStream('deflate');
      const writer = cs.writable.getWriter();
      const reader = cs.readable.getReader();
      
      // Write data
      await writer.write(uint8Array);
      await writer.close();
      
      // Read compressed data
      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      
      // Combine chunks
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }
      
      // Record metrics
      const duration = performance.now() - startTime;
      this.metrics.recordTiming('compression_duration', duration);
      this.metrics.record('compression_ratio', {
        original: uint8Array.length,
        compressed: result.length,
        ratio: result.length / uint8Array.length
      });
      
      return result;
    } catch (error) {
      this.logger.error('Compression failed', error);
      throw new CompressionError('Failed to compress data', { cause: error });
    }
  }

  /**
   * Decompress data
   */
  async decompress(data: Uint8Array): Promise<any> {
    const startTime = performance.now();
    
    try {
      // Decompress using DecompressionStream
      const ds = new DecompressionStream('deflate');
      const writer = ds.writable.getWriter();
      const reader = ds.readable.getReader();
      
      // Write compressed data
      await writer.write(data);
      await writer.close();
      
      // Read decompressed data
      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      
      // Combine chunks
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }
      
      // Convert back to string
      const textDecoder = new TextDecoder();
      const jsonString = textDecoder.decode(result);
      
      // Parse JSON
      const parsed = JSON.parse(jsonString);
      
      // Record metrics
      const duration = performance.now() - startTime;
      this.metrics.recordTiming('decompression_duration', duration);
      
      return parsed;
    } catch (error) {
      this.logger.error('Decompression failed', error);
      throw new CompressionError('Failed to decompress data', { cause: error });
    }
  }
}

export const compressionUtil = new CompressionUtil();
