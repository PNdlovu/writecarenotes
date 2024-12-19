import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useVerification } from '../../hooks/useVerification';
import { BarcodeVerification } from '../../types/medication-verification';
import { Button, Box, Typography, CircularProgress, Alert } from '@mui/material';

interface BarcodeScannerProps {
  medicationId: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  medicationId,
  onSuccess,
  onError,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const { verifyBarcode, isVerifying, error } = useVerification();
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isScanning && !scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        'barcode-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          defaultZoomValueIfSupported: 2,
        },
        false
      );

      scannerRef.current.render(onScanSuccess, onScanError);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, [isScanning]);

  const onScanSuccess = async (decodedText: string) => {
    if (scannerRef.current) {
      scannerRef.current.pause();
    }

    const verification: BarcodeVerification = {
      method: 'BARCODE',
      medicationId,
      barcode: decodedText,
    };

    try {
      const success = await verifyBarcode(verification);
      if (success) {
        onSuccess();
      } else {
        onError('Barcode verification failed');
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Barcode verification failed');
    } finally {
      if (scannerRef.current) {
        scannerRef.current.resume();
      }
    }
  };

  const onScanError = (error: string) => {
    console.error('Scan error:', error);
    onError('Failed to scan barcode');
  };

  const startScanning = () => {
    setIsScanning(true);
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 500, mx: 'auto', p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Scan Medication Barcode
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isVerifying && (
        <Box display="flex" justifyContent="center" my={2}>
          <CircularProgress />
        </Box>
      )}

      <Box id="barcode-reader" sx={{ mb: 2 }} />

      <Box display="flex" justifyContent="center" gap={2}>
        {!isScanning ? (
          <Button
            variant="contained"
            color="primary"
            onClick={startScanning}
            disabled={isVerifying}
          >
            Start Scanning
          </Button>
        ) : (
          <Button
            variant="contained"
            color="secondary"
            onClick={stopScanning}
            disabled={isVerifying}
          >
            Stop Scanning
          </Button>
        )}
      </Box>

      <Typography variant="body2" color="text.secondary" align="center" mt={2}>
        Position the barcode within the frame to scan
      </Typography>
    </Box>
  );
};
