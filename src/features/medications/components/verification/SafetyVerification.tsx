import React, { useState, useEffect } from 'react';
import { Box, Stepper, Step, StepLabel, Typography, Alert, Paper, Button } from '@mui/material';
import { BarcodeScanner } from './BarcodeScanner';
import { PredictiveSafetyCheck } from './PredictiveSafetyCheck';
import { useVerification } from '../../hooks/useVerification';
import { format } from 'date-fns';

interface SafetyVerificationProps {
  medicationId: string;
  expectedResidentId: string;
  onVerificationComplete: () => void;
  onError: (error: string) => void;
}

interface VerificationStep {
  label: string;
  description: string;
  instructions: string;
}

const steps: VerificationStep[] = [
  {
    label: 'Resident Verification',
    description: 'Scan resident\'s wristband barcode',
    instructions: 'Please scan the barcode on the resident\'s wristband'
  },
  {
    label: 'Medication Verification',
    description: 'Scan medication barcode',
    instructions: 'Please scan the barcode on the medication package'
  },
  {
    label: 'Final Safety Check',
    description: 'Review and confirm',
    instructions: 'Please review all details before confirming'
  }
];

export const SafetyVerification: React.FC<SafetyVerificationProps> = ({
  medicationId,
  expectedResidentId,
  onVerificationComplete,
  onError,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [scannedData, setScannedData] = useState({
    residentId: '',
    residentName: '',
    medicationBarcode: '',
    medicationDetails: null,
    scannedAt: null as Date | null,
  });
  const [verificationErrors, setVerificationErrors] = useState<string[]>([]);
  const { verifyMedicationSafety } = useVerification();

  const handleResidentScan = async (barcode: string) => {
    try {
      // Verify resident barcode
      const residentResponse = await fetch(`/api/residents/verify-barcode/${barcode}`);
      const residentData = await residentResponse.json();

      if (!residentData) {
        throw new Error('Invalid resident barcode');
      }

      if (residentData.id !== expectedResidentId) {
        throw new Error('Wrong resident! Please verify you are with the correct resident');
      }

      setScannedData(prev => ({
        ...prev,
        residentId: residentData.id,
        residentName: residentData.name,
        scannedAt: new Date(),
      }));

      setActiveStep(1);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to verify resident');
    }
  };

  const handleMedicationScan = async (barcode: string) => {
    try {
      // Verify medication barcode
      const medicationResponse = await fetch(`/api/medications/verify-barcode/${barcode}`);
      const medicationData = await medicationResponse.json();

      if (!medicationData) {
        throw new Error('Invalid medication barcode');
      }

      // Verify this is the correct medication for this resident
      const safetyCheck = await verifyMedicationSafety({
        medicationId: medicationData.id,
        residentId: scannedData.residentId,
        barcode,
        scannedAt: new Date(),
      });

      if (!safetyCheck.isValid) {
        setVerificationErrors(safetyCheck.errors);
        throw new Error('Safety check failed');
      }

      setScannedData(prev => ({
        ...prev,
        medicationBarcode: barcode,
        medicationDetails: medicationData,
      }));

      setActiveStep(2);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to verify medication');
    }
  };

  const handleFinalConfirmation = async () => {
    try {
      // Perform final safety checks
      const finalSafetyCheck = await fetch('/api/medications/final-safety-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          residentId: scannedData.residentId,
          medicationId,
          scannedAt: scannedData.scannedAt,
          verificationSteps: {
            residentVerified: true,
            medicationVerified: true,
            timeVerified: true,
          },
        }),
      });

      if (!finalSafetyCheck.ok) {
        throw new Error('Final safety check failed');
      }

      onVerificationComplete();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Final verification failed');
    }
  };

  const handleAnalysisComplete = () => {
    // Handle analysis complete
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {steps[0].instructions}
            </Typography>
            <BarcodeScanner
              medicationId={medicationId}
              onSuccess={handleResidentScan}
              onError={onError}
            />
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {steps[1].instructions}
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Verified Resident: {scannedData.residentName}
            </Alert>
            <BarcodeScanner
              medicationId={medicationId}
              onSuccess={handleMedicationScan}
              onError={onError}
            />
          </Box>
        );
      case 2:
        return (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Final Safety Check
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Resident Details:</Typography>
              <Typography>Name: {scannedData.residentName}</Typography>
              <Typography>ID: {scannedData.residentId}</Typography>
              <Typography>Verified at: {scannedData.scannedAt ? format(scannedData.scannedAt, 'PPpp') : ''}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Medication Details:</Typography>
              {scannedData.medicationDetails && (
                <>
                  <Typography>Name: {scannedData.medicationDetails.name}</Typography>
                  <Typography>Dosage: {scannedData.medicationDetails.dosage}</Typography>
                  <Typography>Route: {scannedData.medicationDetails.route}</Typography>
                  <Typography>Time: {scannedData.medicationDetails.scheduledTime}</Typography>
                </>
              )}
            </Box>
            {verificationErrors.length > 0 && (
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Safety Concerns:</Typography>
                <ul>
                  {verificationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </Alert>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={handleFinalConfirmation}
              disabled={verificationErrors.length > 0}
            >
              Confirm and Proceed
            </Button>
          </Paper>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <PredictiveSafetyCheck
        residentId={expectedResidentId}
        medicationId={medicationId}
        staffId={'staffId'} // Replace with actual staffId
        onAnalysisComplete={handleAnalysisComplete}
      />
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel>
              {step.label}
              <Typography variant="caption" display="block">
                {step.description}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      {renderStepContent(activeStep)}
    </Box>
  );
};
