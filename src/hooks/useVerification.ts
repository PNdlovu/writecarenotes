import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/Toast/use-toast';
import { verificationService } from '@/services/verificationService';
import type { PINVerification, VerificationResult } from '@/types/verification';

interface UseVerificationProps {
  onBarcodeVerified?: (result: VerificationResult) => void;
  onPINVerified?: (result: VerificationResult) => void;
}

export function useVerification({ onBarcodeVerified, onPINVerified }: UseVerificationProps = {}) {
  const [isScanning, setIsScanning] = useState(false);
  const [isVerifyingPIN, setIsVerifyingPIN] = useState(false);
  const [lastVerificationResult, setLastVerificationResult] = useState<VerificationResult | null>(null);
  const { toast } = useToast();

  const handleBarcodeScanned = useCallback(async (code: string) => {
    setIsScanning(true);
    try {
      const result = await verificationService.verifyBarcode(code);
      setLastVerificationResult(result);
      
      if (result.success) {
        toast({
          title: 'Verification Successful',
          description: `Verified ${result.data?.medicationName || result.data?.residentName || result.data?.staffName}`,
        });
        onBarcodeVerified?.(result);
      } else {
        toast({
          title: 'Verification Failed',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to verify barcode',
        variant: 'destructive',
      });
    } finally {
      setIsScanning(false);
    }
  }, [onBarcodeVerified, toast]);

  const verifyPIN = useCallback(async (verification: PINVerification) => {
    setIsVerifyingPIN(true);
    try {
      const result = await verificationService.verifyPIN(verification);
      setLastVerificationResult(result);

      if (result.success) {
        toast({
          title: 'PIN Verified',
          description: `Verified ${result.data?.staffName}`,
        });
        onPINVerified?.(result);
      } else {
        toast({
          title: 'PIN Verification Failed',
          description: result.message,
          variant: 'destructive',
        });
      }

      return result;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to verify PIN',
        variant: 'destructive',
      });
      return {
        success: false,
        message: 'Failed to verify PIN',
      };
    } finally {
      setIsVerifyingPIN(false);
    }
  }, [onPINVerified, toast]);

  const generateBarcode = useCallback(async (type: 'MEDICATION' | 'RESIDENT' | 'STAFF', id: string) => {
    try {
      const barcode = await verificationService.generateBarcode(type, id);
      toast({
        title: 'Barcode Generated',
        description: `New barcode: ${barcode}`,
      });
      return barcode;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate barcode',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const updatePIN = useCallback(async (staffId: string, newPIN: string) => {
    try {
      const success = await verificationService.updatePIN(staffId, newPIN);
      if (success) {
        toast({
          title: 'PIN Updated',
          description: 'Your PIN has been updated successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update PIN',
          variant: 'destructive',
        });
      }
      return success;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update PIN',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  return {
    isScanning,
    isVerifyingPIN,
    lastVerificationResult,
    handleBarcodeScanned,
    verifyPIN,
    generateBarcode,
    updatePIN,
  };
}


