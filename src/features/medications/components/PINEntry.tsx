/**
 * @fileoverview PIN Entry Component for Medication Administration
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Secure PIN entry component for medication administration with
 * accessibility features and comprehensive error handling.
 */

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PINEntryProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => Promise<void>;
  requiresWitness?: boolean;
  title?: string;
}

const MAX_ATTEMPTS = 3;
const PIN_LENGTH = 4;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

export function PINEntry({
  isOpen,
  onClose,
  onSubmit,
  requiresWitness = false,
  title = 'Enter PIN'
}: PINEntryProps) {
  const [pin, setPin] = useState<string>('');
  const [witnessPin, setWitnessPin] = useState<string>('');
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null);
  const [showWitnessInput, setShowWitnessInput] = useState(false);

  useEffect(() => {
    // Check if there's an existing lockout
    const storedLockoutEnd = localStorage.getItem('pinLockoutEnd');
    if (storedLockoutEnd) {
      const endTime = parseInt(storedLockoutEnd, 10);
      if (endTime > Date.now()) {
        setIsLocked(true);
        setLockoutEndTime(endTime);
      } else {
        localStorage.removeItem('pinLockoutEnd');
      }
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLocked && lockoutEndTime) {
      timer = setInterval(() => {
        if (Date.now() >= lockoutEndTime) {
          setIsLocked(false);
          setLockoutEndTime(null);
          localStorage.removeItem('pinLockoutEnd');
          setAttempts(0);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLocked, lockoutEndTime]);

  const handlePINSubmit = useCallback(async () => {
    if (pin.length !== PIN_LENGTH) {
      setError('PIN must be 4 digits');
      return;
    }

    if (requiresWitness && !showWitnessInput) {
      setShowWitnessInput(true);
      setError(null);
      return;
    }

    if (requiresWitness && witnessPin.length !== PIN_LENGTH) {
      setError('Witness PIN must be 4 digits');
      return;
    }

    try {
      await onSubmit(requiresWitness ? `${pin}:${witnessPin}` : pin);
      // Reset on success
      setPin('');
      setWitnessPin('');
      setError(null);
      setAttempts(0);
      onClose();
    } catch (error) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        const lockoutEnd = Date.now() + LOCKOUT_DURATION;
        setIsLocked(true);
        setLockoutEndTime(lockoutEnd);
        localStorage.setItem('pinLockoutEnd', lockoutEnd.toString());
        setError('Maximum attempts exceeded. Please try again in 30 minutes.');
      } else {
        setError(`Invalid PIN. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
      }

      setPin('');
      setWitnessPin('');
    }
  }, [pin, witnessPin, attempts, requiresWitness, showWitnessInput, onSubmit, onClose]);

  const handleNumberClick = useCallback((number: number) => {
    if (showWitnessInput) {
      if (witnessPin.length < PIN_LENGTH) {
        setWitnessPin(prev => prev + number);
      }
    } else {
      if (pin.length < PIN_LENGTH) {
        setPin(prev => prev + number);
      }
    }
    setError(null);
  }, [pin.length, witnessPin.length, showWitnessInput]);

  const handleClear = useCallback(() => {
    if (showWitnessInput) {
      setWitnessPin('');
    } else {
      setPin('');
    }
    setError(null);
  }, [showWitnessInput]);

  const handleBackspace = useCallback(() => {
    if (showWitnessInput) {
      setWitnessPin(prev => prev.slice(0, -1));
    } else {
      setPin(prev => prev.slice(0, -1));
    }
    setError(null);
  }, [showWitnessInput]);

  const renderPINDisplay = (value: string) => {
    return (
      <div className="flex justify-center space-x-2 mb-4">
        {Array.from({ length: PIN_LENGTH }).map((_, index) => (
          <div
            key={index}
            className="w-3 h-3 rounded-full border-2 border-primary"
            style={{
              backgroundColor: index < value.length ? 'currentColor' : 'transparent'
            }}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4">
          {isLocked ? (
            <Alert>
              <AlertDescription>
                Account locked. Please try again in{' '}
                {Math.ceil((lockoutEndTime! - Date.now()) / 60000)} minutes.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="w-full max-w-xs">
                {showWitnessInput ? (
                  <>
                    <p className="text-center mb-2">Enter Witness PIN</p>
                    {renderPINDisplay(witnessPin)}
                  </>
                ) : (
                  <>
                    <p className="text-center mb-2">Enter Your PIN</p>
                    {renderPINDisplay(pin)}
                  </>
                )}

                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => (
                    <Button
                      key={number}
                      variant="outline"
                      onClick={() => handleNumberClick(number)}
                      className="h-12 text-lg"
                    >
                      {number}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    onClick={handleClear}
                    className="h-12"
                  >
                    Clear
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleNumberClick(0)}
                    className="h-12 text-lg"
                  >
                    0
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleBackspace}
                    className="h-12"
                  >
                    ←
                  </Button>
                </div>

                <div className="mt-4">
                  <Button
                    onClick={handlePINSubmit}
                    className="w-full"
                    disabled={
                      isLocked ||
                      (showWitnessInput ? witnessPin.length !== PIN_LENGTH : pin.length !== PIN_LENGTH)
                    }
                  >
                    {showWitnessInput ? 'Confirm Witness PIN' : requiresWitness ? 'Next' : 'Submit'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 


