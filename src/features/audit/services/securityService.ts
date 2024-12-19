/**
 * @fileoverview Security service for audit exports
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { SecurityOptions, ExportField } from '../types/export.types';
import * as crypto from 'crypto';

export class SecurityService {
  private static instance: SecurityService;
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly saltLength = 64;

  private constructor() {}

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  /**
   * Encrypts data with a password
   */
  async encryptData(data: Buffer, password: string): Promise<Buffer> {
    const salt = crypto.randomBytes(this.saltLength);
    const iv = crypto.randomBytes(this.ivLength);
    const key = await this.deriveKey(password, salt);

    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    const encrypted = Buffer.concat([
      cipher.update(data),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    // Combine all components: salt + iv + authTag + encrypted data
    return Buffer.concat([
      salt,
      iv,
      authTag,
      encrypted,
    ]);
  }

  /**
   * Decrypts data with a password
   */
  async decryptData(encryptedData: Buffer, password: string): Promise<Buffer> {
    const salt = encryptedData.slice(0, this.saltLength);
    const iv = encryptedData.slice(this.saltLength, this.saltLength + this.ivLength);
    const authTag = encryptedData.slice(
      this.saltLength + this.ivLength,
      this.saltLength + this.ivLength + 16
    );
    const data = encryptedData.slice(this.saltLength + this.ivLength + 16);

    const key = await this.deriveKey(password, salt);
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([
      decipher.update(data),
      decipher.final(),
    ]);
  }

  /**
   * Masks sensitive fields based on security options
   */
  maskSensitiveData(data: any, fields: ExportField[], options: SecurityOptions): any {
    const mask = options.sensitiveFieldMask || 'XXXXX';
    
    if (Array.isArray(data)) {
      return data.map(item => this.maskSensitiveData(item, fields, options));
    }

    if (typeof data === 'object' && data !== null) {
      const masked = { ...data };
      fields.forEach(field => {
        if (field.sensitive && masked[field.key]) {
          masked[field.key] = mask;
        }
      });
      return masked;
    }

    return data;
  }

  /**
   * Adds PDF security restrictions
   */
  getPDFSecurityOptions(options: SecurityOptions) {
    return {
      userPassword: options.password,
      ownerPassword: this.generateOwnerPassword(),
      permissions: {
        printing: options.allowPrinting ? 'highResolution' : 'none',
        modifying: options.allowModifying,
        copying: options.allowCopying,
        annotating: false,
        fillingForms: false,
        contentAccessibility: true,
        documentAssembly: false,
      },
      pdfVersion: '1.7ext3',
    };
  }

  /**
   * Validates security options
   */
  validateSecurityOptions(options: SecurityOptions): void {
    if (options.encrypt && !options.password) {
      throw new Error('Password is required when encryption is enabled');
    }

    if (options.expiresAt && options.expiresAt < new Date()) {
      throw new Error('Expiration date must be in the future');
    }

    if (options.password && options.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
  }

  /**
   * Checks if the export has expired
   */
  hasExpired(options: SecurityOptions): boolean {
    return !!(options.expiresAt && options.expiresAt < new Date());
  }

  /**
   * Generates a digital signature for the export
   */
  async generateSignature(data: Buffer): Promise<string> {
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
  }

  private async deriveKey(password: string, salt: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(
        password,
        salt,
        100000,
        this.keyLength,
        'sha512',
        (err, key) => {
          if (err) reject(err);
          else resolve(key);
        }
      );
    });
  }

  private generateOwnerPassword(): string {
    return crypto.randomBytes(32).toString('hex');
  }
} 


