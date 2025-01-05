/**
 * @fileoverview Threshold Configuration Component
 * @version 1.0.0
 * @created 2024-03-21
 */

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  Alert,
  Chip
} from '@/components/ui';
import { Grid } from '@/components/ui/layout';
import { 
  EditIcon, 
  SaveIcon, 
  AddIcon, 
  DeleteIcon 
} from '@/components/ui/Icons';
import { monitoring, METRIC_TYPES } from '../../lib/monitoring';

interface ThresholdConfig {
  id: string;
  metric: string;
  threshold: number;
  comparison: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  duration: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  notifyChannels: string[];
  aggregation: 'avg' | 'max' | 'min' | 'sum' | 'count';
}

export const ThresholdConfig: React.FC = () => {
  const [configs, setConfigs] = useState<ThresholdConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingConfig, setEditingConfig] = useState<ThresholdConfig | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const thresholds = await monitoring.getThresholdConfigs();
      setConfigs(thresholds);
      setError(null);
    } catch (err) {
      setError('Failed to load threshold configurations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (config: ThresholdConfig) => {
    setEditingConfig({ ...config });
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingConfig({
      id: '',
      metric: '',
      threshold: 0,
      comparison: 'gt',
      duration: 300,
      severity: 'medium',
      notifyChannels: ['email'],
      aggregation: 'avg'
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingConfig) return;

    try {
      if (editingConfig.id) {
        await monitoring.updateThresholdConfig(editingConfig);
      } else {
        await monitoring.createThresholdConfig(editingConfig);
      }

      await loadConfigs();
      setDialogOpen(false);
      setEditingConfig(null);
      setError(null);
    } catch (err) {
      setError('Failed to save threshold configuration');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await monitoring.deleteThresholdConfig(id);
      await loadConfigs();
      setError(null);
    } catch (err) {
      setError('Failed to delete threshold configuration');
      console.error(err);
    }
  };

  const renderConfigCard = (config: ThresholdConfig) => (
    <Grid item xs={12} md={6} lg={4} key={config.id}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" component="div">
              {config.metric.split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
            </Typography>
            <Box>
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => handleEdit(config)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton size="small" onClick={() => handleDelete(config.id)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Typography color="textSecondary" gutterBottom>
            Threshold: {config.threshold} ({config.comparison})
          </Typography>
          <Typography color="textSecondary" gutterBottom>
            Duration: {config.duration}s
          </Typography>
          <Typography color="textSecondary" gutterBottom>
            Aggregation: {config.aggregation}
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Chip 
              label={config.severity} 
              size="small"
              color={
                config.severity === 'critical' ? 'error' :
                config.severity === 'high' ? 'warning' :
                config.severity === 'medium' ? 'info' : 'success'
              }
              sx={{ mr: 1 }}
            />
            {config.notifyChannels.map(channel => (
              <Chip 
                key={channel}
                label={channel}
                size="small"
                variant="outlined"
                sx={{ mr: 1 }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );

  const renderDialog = () => (
    <Dialog 
      open={dialogOpen} 
      onClose={() => setDialogOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {editingConfig?.id ? 'Edit Threshold' : 'New Threshold'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Metric</InputLabel>
            <Select
              value={editingConfig?.metric || ''}
              label="Metric"
              onChange={(e) => setEditingConfig(c => c ? { ...c, metric: e.target.value } : null)}
            >
              {Object.entries(METRIC_TYPES).map(([category, metrics]) => (
                Object.entries(metrics).map(([key, value]) => (
                  <MenuItem key={value} value={value}>
                    {category} - {key}
                  </MenuItem>
                ))
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Threshold Value"
            type="number"
            value={editingConfig?.threshold || 0}
            onChange={(e) => setEditingConfig(c => c ? { ...c, threshold: Number(e.target.value) } : null)}
          />

          <FormControl fullWidth>
            <InputLabel>Comparison</InputLabel>
            <Select
              value={editingConfig?.comparison || 'gt'}
              label="Comparison"
              onChange={(e) => setEditingConfig(c => c ? { ...c, comparison: e.target.value as any } : null)}
            >
              <MenuItem value="gt">&gt;</MenuItem>
              <MenuItem value="lt">&lt;</MenuItem>
              <MenuItem value="eq">=</MenuItem>
              <MenuItem value="gte">≥</MenuItem>
              <MenuItem value="lte">≤</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Duration (seconds)"
            type="number"
            value={editingConfig?.duration || 300}
            onChange={(e) => setEditingConfig(c => c ? { ...c, duration: Number(e.target.value) } : null)}
          />

          <FormControl fullWidth>
            <InputLabel>Severity</InputLabel>
            <Select
              value={editingConfig?.severity || 'medium'}
              label="Severity"
              onChange={(e) => setEditingConfig(c => c ? { ...c, severity: e.target.value as any } : null)}
            >
              <MenuItem value="critical">Critical</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Aggregation</InputLabel>
            <Select
              value={editingConfig?.aggregation || 'avg'}
              label="Aggregation"
              onChange={(e) => setEditingConfig(c => c ? { ...c, aggregation: e.target.value as any } : null)}
            >
              <MenuItem value="avg">Average</MenuItem>
              <MenuItem value="max">Maximum</MenuItem>
              <MenuItem value="min">Minimum</MenuItem>
              <MenuItem value="sum">Sum</MenuItem>
              <MenuItem value="count">Count</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Notification Channels</InputLabel>
            <Select
              multiple
              value={editingConfig?.notifyChannels || []}
              label="Notification Channels"
              onChange={(e) => setEditingConfig(c => c ? { ...c, notifyChannels: e.target.value as string[] } : null)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="sms">SMS</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDialogOpen(false)}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          variant="contained"
          startIcon={<SaveIcon />}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          Threshold Configurations
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Add Threshold
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {configs.map(renderConfigCard)}
      </Grid>

      {renderDialog()}
    </Box>
  );
}; 
