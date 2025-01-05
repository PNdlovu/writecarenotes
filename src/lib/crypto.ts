import { hash, compare } from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

export async function encryptDocument(content: string, password: string): Promise<string> {
  // TODO: Implement document encryption using a secure encryption library
  // For now, this is a placeholder that just returns the content
  return content;
}

export async function decryptDocument(encryptedContent: string, password: string): Promise<string> {
  // TODO: Implement document decryption using a secure encryption library
  // For now, this is a placeholder that just returns the content
  return encryptedContent;
}


