import { useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Loader2, Camera, AlertTriangle } from "lucide-react";

interface BarcodeScannerProps {
  medicationId: string;
  onSuccess: (barcode: string) => void;
  onError: (error: string) => void;
}

export function BarcodeScanner({ medicationId, onSuccess, onError }: BarcodeScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startScanning = () => {
    setScanning(true);
    setError(null);
    // Implement actual barcode scanning logic here
    setTimeout(() => {
      setScanning(false);
      onSuccess("MOCK_BARCODE_123"); // Replace with actual barcode
    }, 2000);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Barcode Scanner</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            {scanning ? (
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-500">Scanning barcode...</p>
              </div>
            ) : (
              <div className="text-center">
                <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">Camera preview will appear here</p>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <Button
              onClick={startScanning}
              disabled={scanning}
              className="w-full max-w-xs"
            >
              {scanning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  Start Scanning
                </>
              )}
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            Position the barcode within the camera frame and hold steady
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
