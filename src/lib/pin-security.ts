import { prisma } from '@/lib/prisma';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
const PIN_EXPIRY_DAYS = 90;

interface PINAttempt {
  userId: string;
  timestamp: number;
  success: boolean;
}

// In-memory store for PIN attempts (consider using Redis in production)
const pinAttempts = new Map<string, PINAttempt[]>();

export async function validatePINRequirements(userId: string): Promise<{
  valid: boolean;
  error?: string;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      medPIN: true,
      lastPINChange: true,
      requirePINChange: true,
    },
  });

  if (!user?.medPIN) {
    return { valid: false, error: 'PIN not set' };
  }

  if (user.requirePINChange) {
    return { valid: false, error: 'PIN change required' };
  }

  // Check PIN expiration
  if (user.lastPINChange) {
    const expiryDate = new Date(user.lastPINChange);
    expiryDate.setDate(expiryDate.getDate() + PIN_EXPIRY_DAYS);

    if (new Date() > expiryDate) {
      await prisma.user.update({
        where: { id: userId },
        data: { requirePINChange: true },
      });
      return { valid: false, error: 'PIN expired' };
    }
  }

  return { valid: true };
}

export function recordPINAttempt(userId: string, success: boolean): boolean {
  const now = Date.now();
  const userAttempts = pinAttempts.get(userId) || [];

  // Remove attempts older than lockout duration
  const recentAttempts = userAttempts.filter(
    attempt => now - attempt.timestamp < LOCKOUT_DURATION
  );

  // Add new attempt
  recentAttempts.push({ userId, timestamp: now, success });
  pinAttempts.set(userId, recentAttempts);

  // Check if user should be locked out
  const failedAttempts = recentAttempts.filter(attempt => !attempt.success);
  return failedAttempts.length >= MAX_FAILED_ATTEMPTS;
}

export function isUserLockedOut(userId: string): boolean {
  const now = Date.now();
  const userAttempts = pinAttempts.get(userId) || [];
  const recentAttempts = userAttempts.filter(
    attempt => now - attempt.timestamp < LOCKOUT_DURATION
  );

  const failedAttempts = recentAttempts.filter(attempt => !attempt.success);
  return failedAttempts.length >= MAX_FAILED_ATTEMPTS;
}

export function getFailedAttempts(userId: string): number {
  const now = Date.now();
  const userAttempts = pinAttempts.get(userId) || [];
  const recentAttempts = userAttempts.filter(
    attempt => now - attempt.timestamp < LOCKOUT_DURATION
  );

  return recentAttempts.filter(attempt => !attempt.success).length;
}

export function clearFailedAttempts(userId: string): void {
  pinAttempts.delete(userId);
}

export function generateTemporaryPIN(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function isPINSecure(pin: string): boolean {
  // Check if PIN is exactly 4 digits
  if (!/^\d{4}$/.test(pin)) {
    return false;
  }

  // Check for sequential numbers (e.g., 1234, 4321)
  const sequential = ['0123', '1234', '2345', '3456', '4567', '5678', '6789', '9876', '8765', '7654', '6543', '5432', '4321', '3210'];
  if (sequential.includes(pin)) {
    return false;
  }

  // Check for repeated digits (e.g., 1111, 2222)
  if (/^(.)\1{3}$/.test(pin)) {
    return false;
  }

  return true;
}


