import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button/Button';
import { Camera, X } from 'lucide-react';
import { useVerification } from '../hooks/useVerification';
import Quagga from 'quagga';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function BarcodeScanner({ onScan, onClose, isOpen }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { isScanning, startScanning, stopScanning } = useVerification();

  useEffect(() => {
    if (isOpen && videoRef.current) {
      initializeScanner();
    }
    return () => {
      Quagga.stop();
    };
  }, [isOpen]);

  const initializeScanner = () => {
    Quagga.init(
      {
        inputStream: {
          name: 'Live',
          type: 'LiveStream',
          target: videoRef.current,
          constraints: {
            facingMode: 'environment', // Use back camera on mobile devices
          },
        },
        decoder: {
          readers: [
            'ean_reader',
            'ean_8_reader',
            'code_128_reader',
            'code_39_reader',
            'upc_reader',
            'upc_e_reader',
          ],
        },
      },
      (err) => {
        if (err) {
          setError('Failed to initialize camera');
          return;
        }
        startScanning();
        Quagga.start();
      }
    );

    // Handle successful scans
    Quagga.onDetected((result) => {
      if (result.codeResult.code) {
        handleSuccessfulScan(result.codeResult.code);
      }
    });
  };

  const handleSuccessfulScan = (barcode: string) => {
    // Play a success sound
    const audio = new Audio('/sounds/beep.mp3');
    audio.play();

    // Stop scanning and pass the barcode
    Quagga.stop();
    stopScanning();
    onScan(barcode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Scan Medication Barcode</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {error ? (
          <div className="text-center p-4">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={onClose}>Close</Button>
          </div>
        ) : (
          <>
            <div 
              ref={videoRef} 
              className="w-full aspect-square bg-gray-900 rounded-lg overflow-hidden mb-4"
            />
            
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Position the barcode within the camera view
              </p>
              
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={() => initializeScanner()}>
                  <Camera className="h-4 w-4 mr-2" />
                  Retry Scan
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
} 