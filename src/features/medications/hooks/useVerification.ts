import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { verificationService } from '../services/verificationService';
import { useToast } from '@/components/ui/UseToast';
import { VerificationStatus, VerificationErrorType } from '../types';

export function useVerification() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Verify medication barcode
  const verifyMutation = useMutation({
    mutationFn: ({ administrationId, barcode }: { administrationId: string; barcode: string }) =>
      verificationService.verifyMedicationBarcode(administrationId, barcode),
    onSuccess: () => {
      queryClient.invalidateQueries(['medications']);
      toast({
        title: 'Verification Successful',
        description: 'Medication has been verified successfully',
      });
    },
    onError: (error: any) => {
      setScanError(error.message);
      toast({
        title: 'Verification Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Override verification
  const overrideMutation = useMutation({
    mutationFn: ({ administrationId, reason }: { administrationId: string; reason: string }) =>
      verificationService.overrideVerification(administrationId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['medications']);
      toast({
        title: 'Override Successful',
        description: 'Verification has been overridden',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Override Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Start barcode scanning
  const startScanning = () => {
    setIsScanning(true);
    setScanError(null);
  };

  // Stop barcode scanning
  const stopScanning = () => {
    setIsScanning(false);
    setScanError(null);
  };

  // Handle barcode scan
  const handleScan = async (administrationId: string, barcode: string) => {
    try {
      await verifyMutation.mutateAsync({ administrationId, barcode });
      stopScanning();
    } catch (error) {
      // Error handling is done in mutation
    }
  };

  // Handle manual override
  const handleOverride = async (administrationId: string, reason: string) => {
    try {
      await overrideMutation.mutateAsync({ administrationId, reason });
    } catch (error) {
      // Error handling is done in mutation
    }
  };

  // Get verification status text
  const getStatusText = (status: VerificationStatus): string => {
    const statusText = {
      [VerificationStatus.PENDING]: 'Pending Verification',
      [VerificationStatus.VERIFIED]: 'Verified',
      [VerificationStatus.FAILED]: 'Verification Failed',
      [VerificationStatus.OVERRIDE]: 'Manually Verified'
    };
    return statusText[status] || 'Unknown Status';
  };

  // Get error message
  const getErrorMessage = (type: VerificationErrorType): string => {
    const errorMessages = {
      [VerificationErrorType.BARCODE_MISMATCH]: 'Wrong medication - barcode does not match',
      [VerificationErrorType.INVALID_BARCODE]: 'Invalid barcode format',
      [VerificationErrorType.EXPIRED_MEDICATION]: 'This medication has expired',
      [VerificationErrorType.WRONG_RESIDENT]: 'Wrong resident - medication not prescribed',
      [VerificationErrorType.WRONG_TIME]: 'Wrong time - not scheduled for now',
      [VerificationErrorType.SYSTEM_ERROR]: 'System error - please try again'
    };
    return errorMessages[type] || 'Unknown error occurred';
  };

  return {
    // State
    isScanning,
    scanError,
    
    // Mutations
    verifyBarcode: verifyMutation.mutate,
    override: overrideMutation.mutate,
    
    // Loading states
    isVerifying: verifyMutation.isLoading,
    isOverriding: overrideMutation.isLoading,
    
    // Actions
    startScanning,
    stopScanning,
    handleScan,
    handleOverride,
    
    // Utility functions
    getStatusText,
    getErrorMessage,
  };
}
