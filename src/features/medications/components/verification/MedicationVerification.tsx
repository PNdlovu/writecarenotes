import React, { useState } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog/Dialog';
import { Badge } from '@/components/ui/Badge/Badge';
import { Card } from '@/components/ui/Card';
import {
  Fingerprint,
  ScanLine,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { PINVerification, BarcodeVerification } from '../../types/verification';
import { auditService } from '@/services/auditService';
import { getDeviceId } from '@/utils/deviceId';
import { BarcodeScanner } from './BarcodeScanner';

interface MedicationVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (verification: PINVerification | BarcodeVerification) => Promise<boolean>;
  verificationType: 'PIN' | 'BARCODE';
  medicationId?: string;
  medicationName?: string;
  onVerificationComplete: () => void;
}

export const MedicationVerification: React.FC<MedicationVerificationProps> = ({
  isOpen,
  onClose,
  onVerify,
  verificationType,
  medicationId,
  medicationName,
  onVerificationComplete,
}) => {
  const [staffId, setStaffId] = useState('');
  const [staffName, setStaffName] = useState('');
  const [pin, setPin] = useState('');
  const [barcode, setBarcode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 3;
  const LOCKOUT_DURATION = 300000; // 5 minutes in milliseconds

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError(null);

    if (attempts >= MAX_ATTEMPTS) {
      setError(`Too many failed attempts. Please try again in ${LOCKOUT_DURATION / 60000} minutes.`);
      return;
    }

    try {
      let verificationData: PINVerification | BarcodeVerification;

      if (verificationType === 'PIN') {
        verificationData = {
          type: 'ADMINISTRATION',
          staffId,
          pin,
          timestamp: new Date().toISOString(),
          deviceId: await getDeviceId(),
        };
      } else {
        if (!medicationId) {
          throw new Error('Medication ID is required for barcode verification');
        }
        verificationData = {
          medicationId,
          barcode,
          verifiedAt: new Date().toISOString(),
          verifiedBy: {
            id: staffId,
            name: staffName,
          },
          deviceId: await getDeviceId(),
        };
      }

      const success = await onVerify(verificationData);
      if (success) {
        // Reset attempts on success
        setAttempts(0);
        resetForm();
        onClose();
        onVerificationComplete();
        // Audit successful verification
        await auditService.logAction({
          action: 'MEDICATION_VERIFICATION',
          status: 'SUCCESS',
          details: {
            verificationType,
            medicationId,
            staffId,
            timestamp: new Date().toISOString(),
          },
        });
      } else {
        handleFailedAttempt();
      }
    } catch (err) {
      handleFailedAttempt();
      setError(err instanceof Error ? err.message : 'An error occurred during verification');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFailedAttempt = async () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (newAttempts >= MAX_ATTEMPTS) {
      // Log security event
      await auditService.logAction({
        action: 'MEDICATION_VERIFICATION',
        status: 'LOCKED',
        details: {
          verificationType,
          medicationId,
          staffId,
          attempts: newAttempts,
          timestamp: new Date().toISOString(),
        },
      });

      // Start lockout timer
      setTimeout(() => {
        setAttempts(0);
      }, LOCKOUT_DURATION);
    }

    // Log failed attempt
    await auditService.logAction({
      action: 'MEDICATION_VERIFICATION',
      status: 'FAILED',
      details: {
        verificationType,
        medicationId,
        staffId,
        attempts: newAttempts,
        timestamp: new Date().toISOString(),
      },
    });
  };

  const resetForm = () => {
    setStaffId('');
    setStaffName('');
    setPin('');
    setBarcode('');
    setError(null);
  };

  const remainingAttempts = MAX_ATTEMPTS - attempts;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {verificationType === 'PIN' ? (
              <>
                <Fingerprint className="h-5 w-5 text-primary" />
                PIN Verification
              </>
            ) : (
              <>
                <ScanLine className="h-5 w-5 text-primary" />
                Barcode Verification
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {medicationName && (
          <div className="mb-4">
            <Badge variant="secondary" className="gap-1">
              <ShieldCheck className="h-4 w-4" />
              {medicationName}
            </Badge>
          </div>
        )}

        {attempts < MAX_ATTEMPTS ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Staff ID</label>
              <Input
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                placeholder="Enter staff ID"
                required
                disabled={isVerifying}
              />
            </div>

            {verificationType === 'PIN' ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">PIN</label>
                <Input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter PIN"
                  required
                  disabled={isVerifying}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  minLength={4}
                  maxLength={6}
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Staff Name</label>
                  <Input
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    placeholder="Enter staff name"
                    required
                    disabled={isVerifying}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Barcode</label>
                  <BarcodeScanner
                    medicationId={medicationId}
                    onSuccess={(barcode) => setBarcode(barcode)}
                    onError={(errorMessage) => setError(errorMessage)}
                  />
                </div>
              </>
            )}

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {remainingAttempts < MAX_ATTEMPTS && (
              <div className="text-sm text-muted-foreground">
                {remainingAttempts} attempts remaining
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                disabled={isVerifying}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isVerifying}>
                {isVerifying ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 p-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Account Locked</AlertTitle>
              <AlertDescription>
                Too many failed attempts. Please try again in {LOCKOUT_DURATION / 60000} minutes.
              </AlertDescription>
            </Alert>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => {
                resetForm();
                onClose();
              }}
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
