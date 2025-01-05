/**
 * @writecarenotes.com
 * @fileoverview Utility functions for offline module
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Utility functions for the offline module including data encryption,
 * compression, and various helper functions. Implements security best
 * practices and compliance requirements for healthcare data.
 */

import { deflate, inflate } from 'pako';
import { SECURITY_CONFIG } from './constants';

/**
 * Convert string to Uint8Array
 */
function str2ab(str: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

/**
 * Convert Uint8Array to string
 */
function ab2str(buf: Uint8Array): string {
  const decoder = new TextDecoder();
  return decoder.decode(buf);
}

/**
 * Generate encryption key
 */
async function generateKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Get or create encryption key
 */
async function getEncryptionKey(): Promise<CryptoKey> {
  const storedKey = localStorage.getItem('encryptionKey');
  if (storedKey) {
    const keyData = str2ab(atob(storedKey));
    return await window.crypto.subtle.importKey(
      'raw',
      keyData,
      'AES-GCM',
      true,
      ['encrypt', 'decrypt']
    );
  }

  const key = await generateKey();
  const exportedKey = await window.crypto.subtle.exportKey('raw', key);
  localStorage.setItem('encryptionKey', btoa(ab2str(new Uint8Array(exportedKey))));
  return key;
}

/**
 * Encrypt data
 */
export async function encryptData<T>(data: T): Promise<T> {
  if (!SECURITY_CONFIG.ENCRYPTION_ENABLED) return data;

  try {
    const key = await getEncryptionKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedData = str2ab(JSON.stringify(data));

    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      encodedData
    );

    return {
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encryptedData))
    } as unknown as T;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw error;
  }
}

/**
 * Decrypt data
 */
export async function decryptData<T>(encryptedData: any): Promise<T> {
  if (!SECURITY_CONFIG.ENCRYPTION_ENABLED) return encryptedData;

  try {
    const key = await getEncryptionKey();
    const iv = new Uint8Array(encryptedData.iv);
    const data = new Uint8Array(encryptedData.data);

    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      data
    );

    return JSON.parse(ab2str(new Uint8Array(decryptedData)));
  } catch (error) {
    console.error('Decryption failed:', error);
    throw error;
  }
}

/**
 * Compress data
 */
export async function compressData<T>(data: T): Promise<T> {
  if (!SECURITY_CONFIG.COMPRESSION_ENABLED) return data;

  try {
    const jsonString = JSON.stringify(data);
    const compressed = deflate(jsonString);
    return Array.from(compressed) as unknown as T;
  } catch (error) {
    console.error('Compression failed:', error);
    throw error;
  }
}

/**
 * Decompress data
 */
export async function decompressData<T>(compressedData: any): Promise<T> {
  if (!SECURITY_CONFIG.COMPRESSION_ENABLED) return compressedData;

  try {
    const uint8Array = new Uint8Array(compressedData);
    const decompressed = inflate(uint8Array);
    const jsonString = ab2str(decompressed);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Decompression failed:', error);
    throw error;
  }
}

/**
 * Generate device ID
 */
export function generateDeviceId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Validate data size
 */
export function validateDataSize(data: any): boolean {
  const size = new Blob([JSON.stringify(data)]).size;
  return size <= 5 * 1024 * 1024; // 5MB limit
}

/**
 * Get browser storage estimate
 */
export async function getStorageEstimate(): Promise<{ usage: number; quota: number }> {
  if (navigator.storage && navigator.storage.estimate) {
    const { usage, quota } = await navigator.storage.estimate();
    return { usage: usage || 0, quota: quota || 0 };
  }
  return { usage: 0, quota: 0 };
}

/**
 * Check if browser supports required features
 */
export function checkBrowserSupport(): boolean {
  return !!(
    window.indexedDB &&
    window.crypto &&
    window.crypto.subtle &&
    window.TextEncoder &&
    window.TextDecoder
  );
}

/**
 * Sanitize data for storage
 */
export function sanitizeData<T>(data: T): T {
  if (typeof data !== 'object' || data === null) return data;
  return JSON.parse(JSON.stringify(data));
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Compare versions
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;
    if (num1 < num2) return -1;
    if (num1 > num2) return 1;
  }
  
  return 0;
}


