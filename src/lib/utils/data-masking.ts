/**
 * @fileoverview Data masking utilities for GDPR compliance
 * @version 1.0.0
 * @created 2024-03-21
 * @copyright Write Care Notes Ltd
 */

interface AuthLog {
  id: string;
  createdAt: string;
  action: string;
  success: boolean;
  ip?: string;
  userAgent?: string;
  error?: string;
  user?: {
    email: string;
    name: string;
    role: string;
    organization: {
      name: string;
    };
  };
  metadata?: Record<string, any>;
}

export function maskSensitiveData(log: AuthLog): AuthLog {
  return {
    ...log,
    ip: log.ip ? maskIP(log.ip) : null,
    userAgent: log.userAgent ? maskUserAgent(log.userAgent) : null,
    user: log.user ? {
      ...log.user,
      email: maskEmail(log.user.email),
      name: maskName(log.user.name)
    } : undefined,
    metadata: log.metadata ? maskMetadata(log.metadata) : undefined
  };
}

function maskIP(ip: string): string {
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.*.*`;
  }
  // Handle IPv6
  return ip.replace(/[0-9a-f]{4}$/gi, '****');
}

function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  const maskedLocal = localPart.length > 2
    ? `${localPart[0]}${'*'.repeat(localPart.length - 2)}${localPart[localPart.length - 1]}`
    : '*'.repeat(localPart.length);
  return `${maskedLocal}@${domain}`;
}

function maskName(name: string): string {
  const parts = name.split(' ');
  return parts.map(part => 
    part.length > 1
      ? `${part[0]}${'*'.repeat(part.length - 1)}`
      : part
  ).join(' ');
}

function maskUserAgent(userAgent: string): string {
  // Only show browser and OS info, mask version numbers
  return userAgent
    .replace(/\d+\.\d+\.\d+/g, '*.*.*')
    .replace(/\d+\.\d+/g, '*.*');
}

function maskMetadata(metadata: Record<string, any>): Record<string, any> {
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth', 'cookie'];
  
  return Object.entries(metadata).reduce((masked, [key, value]) => {
    // Check if the key contains any sensitive words
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      masked[key] = '********';
    } else if (typeof value === 'object' && value !== null) {
      masked[key] = maskMetadata(value);
    } else {
      masked[key] = value;
    }
    return masked;
  }, {} as Record<string, any>);
} 


