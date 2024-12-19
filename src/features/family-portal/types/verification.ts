export interface SignatureVerification {
  id: string;
  signature: string;
  timestamp: Date;
  ipAddress: string;
  deviceInfo: string;
  verificationMethod: 'DIGITAL' | 'BIOMETRIC';
}


