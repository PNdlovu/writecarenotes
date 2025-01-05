import { SignatureVerification } from '../types/verification';

interface EncryptedSignature {
  id: string;
  encryptedData: string;
  iv: string;
  timestamp: string;
}

class SignatureStorageService {
  private readonly ENCRYPTION_KEY: string;
  private readonly STORAGE_PREFIX = 'signature_';

  constructor() {
    // In production, this would be loaded from secure environment variables
    this.ENCRYPTION_KEY = process.env.SIGNATURE_ENCRYPTION_KEY || 'your-secure-key';
  }

  private async encrypt(data: string): Promise<{ encryptedData: string; iv: string }> {
    try {
      // Implementation would use Web Crypto API for encryption
      const encoder = new TextEncoder();
      const encodedData = encoder.encode(data);

      // Generate a random IV
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // Import encryption key
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(this.ENCRYPTION_KEY),
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
      );

      // Encrypt the data
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv,
        },
        key,
        encodedData
      );

      return {
        encryptedData: Buffer.from(encryptedBuffer).toString('base64'),
        iv: Buffer.from(iv).toString('base64'),
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt signature');
    }
  }

  private async decrypt(encryptedData: string, iv: string): Promise<string> {
    try {
      // Implementation would use Web Crypto API for decryption
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      // Import decryption key
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(this.ENCRYPTION_KEY),
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );

      // Decrypt the data
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: Buffer.from(iv, 'base64'),
        },
        key,
        Buffer.from(encryptedData, 'base64')
      );

      return decoder.decode(decryptedBuffer);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt signature');
    }
  }

  public async storeSignature(
    verification: SignatureVerification
  ): Promise<string> {
    try {
      const { encryptedData, iv } = await this.encrypt(verification.signatureData);

      const encryptedSignature: EncryptedSignature = {
        id: verification.id,
        encryptedData,
        iv,
        timestamp: new Date().toISOString(),
      };

      // Store in secure storage (e.g., encrypted database or secure file system)
      // For now, we'll use localStorage as a placeholder
      localStorage.setItem(
        `${this.STORAGE_PREFIX}${verification.id}`,
        JSON.stringify(encryptedSignature)
      );

      return verification.id;
    } catch (error) {
      console.error('Failed to store signature:', error);
      throw new Error('Failed to store signature securely');
    }
  }

  public async retrieveSignature(id: string): Promise<string> {
    try {
      // Retrieve from secure storage
      const storedData = localStorage.getItem(`${this.STORAGE_PREFIX}${id}`);
      if (!storedData) {
        throw new Error('Signature not found');
      }

      const encryptedSignature: EncryptedSignature = JSON.parse(storedData);
      return await this.decrypt(encryptedSignature.encryptedData, encryptedSignature.iv);
    } catch (error) {
      console.error('Failed to retrieve signature:', error);
      throw new Error('Failed to retrieve signature');
    }
  }

  public async deleteSignature(id: string): Promise<void> {
    try {
      localStorage.removeItem(`${this.STORAGE_PREFIX}${id}`);
    } catch (error) {
      console.error('Failed to delete signature:', error);
      throw new Error('Failed to delete signature');
    }
  }

  public async validateSignature(id: string): Promise<boolean> {
    try {
      await this.retrieveSignature(id);
      return true;
    } catch {
      return false;
    }
  }
}

export const signatureStorage = new SignatureStorageService();


