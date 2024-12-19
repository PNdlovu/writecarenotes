import React, { useEffect, useState } from 'react';
import { Alert, Box, Card, CircularProgress, Typography } from '@mui/material';
import { PredictiveSafetyService } from '../../services/predictiveSafetyService';
import { useEnvironmentalData } from '../../hooks/useEnvironmentalData';
import { useStaffWorkload } from '../../hooks/useStaffWorkload';

interface PredictiveSafetyCheckProps {
  residentId: string;
  medicationId: string;
  staffId: string;
  onAnalysisComplete: (result: PredictiveSafetyResult) => void;
}

const RiskIndicator: React.FC<{ score: number }> = ({ score }) => {
  const getColor = (score: number) => {
    if (score >= 80) return 'error';
    if (score >= 60) return 'warning';
    if (score >= 40) return 'info';
    return 'success';
  };

  return (
    <Box display="flex" alignItems="center" gap={2}>
      <CircularProgress
        variant="determinate"
        value={score}
        color={getColor(score)}
        size={60}
      />
      <Typography variant="h6" color={getColor(score)}>
        Risk Score: {score}
      </Typography>
    </Box>
  );
};

export const PredictiveSafetyCheck: React.FC<PredictiveSafetyCheckProps> = ({
  residentId,
  medicationId,
  staffId,
  onAnalysisComplete,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<PredictiveSafetyResult | null>(null);
  
  const environmentalData = useEnvironmentalData();
  const staffWorkload = useStaffWorkload(staffId);
  const predictiveSafetyService = new PredictiveSafetyService();

  useEffect(() => {
    const performAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await predictiveSafetyService.performPredictiveSafetyAnalysis({
          residentId,
          medicationId,
          staffId,
          scannedAt: new Date(),
          environmentalData,
          staffWorkload,
        });

        setAnalysisResult(result);
        onAnalysisComplete(result);
      } catch (err) {
        setError('Failed to perform safety analysis. Please try again.');
        console.error('Predictive safety analysis error:', err);
      } finally {
        setLoading(false);
      }
    };

    performAnalysis();
  }, [residentId, medicationId, staffId, environmentalData, staffWorkload]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress />
        <Typography variant="body1" ml={2}>
          Performing safety analysis...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!analysisResult) {
    return null;
  }

  return (
    <Card sx={{ p: 3, mb: 2 }}>
      <Typography variant="h5" gutterBottom>
        Safety Analysis Results
      </Typography>

      <RiskIndicator score={analysisResult.riskScore} />

      {analysisResult.predictiveWarnings.length > 0 && (
        <Box mt={2}>
          <Typography variant="h6" color="warning.main" gutterBottom>
            Warnings
          </Typography>
          {analysisResult.predictiveWarnings.map((warning, index) => (
            <Alert key={index} severity="warning" sx={{ mb: 1 }}>
              {warning}
            </Alert>
          ))}
        </Box>
      )}

      {analysisResult.requiredActions.length > 0 && (
        <Box mt={2}>
          <Typography variant="h6" color="info.main" gutterBottom>
            Required Actions
          </Typography>
          {analysisResult.requiredActions.map((action, index) => (
            <Alert key={index} severity="info" sx={{ mb: 1 }}>
              {action}
            </Alert>
          ))}
        </Box>
      )}

      {analysisResult.recommendedPrecautions.length > 0 && (
        <Box mt={2}>
          <Typography variant="h6" color="success.main" gutterBottom>
            Recommended Precautions
          </Typography>
          {analysisResult.recommendedPrecautions.map((precaution, index) => (
            <Alert key={index} severity="success" sx={{ mb: 1 }}>
              {precaution}
            </Alert>
          ))}
        </Box>
      )}

      {analysisResult.biometricChecksRequired && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Biometric checks are required before proceeding
        </Alert>
      )}

      {analysisResult.behavioralChecksRequired && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Behavioral assessment is required before proceeding
        </Alert>
      )}
    </Card>
  );
};
