import CryptoJS from 'crypto-js';

export class EncryptionService {
  private static instance: EncryptionService;
  private encryptionKey: string;

  private constructor() {
    // In production, this should be securely stored and retrieved
    this.encryptionKey = process.env.ENCRYPTION_KEY || 'default-encryption-key';
  }

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  setEncryptionKey(key: string): void {
    this.encryptionKey = key;
  }

  encrypt(data: any): string {
    const jsonStr = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonStr, this.encryptionKey).toString();
  }

  decrypt(encryptedData: string): any {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
    const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedStr);
  }

  // Encrypt specific fields in an object
  encryptFields<T extends object>(
    data: T,
    sensitiveFields: (keyof T)[]
  ): T {
    const encryptedData = { ...data };

    sensitiveFields.forEach((field) => {
      if (data[field]) {
        (encryptedData as any)[field] = this.encrypt(data[field]);
      }
    });

    return encryptedData;
  }

  // Decrypt specific fields in an object
  decryptFields<T extends object>(
    data: T,
    sensitiveFields: (keyof T)[]
  ): T {
    const decryptedData = { ...data };

    sensitiveFields.forEach((field) => {
      if (data[field]) {
        (decryptedData as any)[field] = this.decrypt(data[field] as string);
      }
    });

    return decryptedData;
  }

  // Generate a secure key
  generateKey(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      key += chars.charAt(array[i] % chars.length);
    }
    
    return key;
  }
}
