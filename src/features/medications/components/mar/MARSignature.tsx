/**
 * @writecarenotes.com
 * @fileoverview MAR Signature Component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Component for capturing digital signatures for medication administration
 * records, with support for touch and mouse input.
 */

import React, { useRef, useState } from 'react';
import SignaturePad from 'react-signature-canvas';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Props {
  onSign: (signature: string) => void;
  onCancel: () => void;
}

export function MARSignature({ onSign, onCancel }: Props) {
  const signaturePadRef = useRef<SignaturePad>(null);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!signaturePadRef.current) return;

    if (signaturePadRef.current.isEmpty()) {
      setError('Please provide a signature');
      return;
    }

    const signatureData = signaturePadRef.current.toDataURL();
    onSign(signatureData);
  };

  const handleClear = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      setError('');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign Administration Record</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="p-4">
            <div 
              className="border rounded-lg"
              style={{ width: '100%', height: '200px' }}
            >
              <SignaturePad
                ref={signaturePadRef}
                canvasProps={{
                  className: 'w-full h-full',
                  style: {
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem'
                  }
                }}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 mt-2">
                {error}
              </p>
            )}
          </Card>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleClear}
            >
              Clear
            </Button>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
              >
                Save Signature
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 