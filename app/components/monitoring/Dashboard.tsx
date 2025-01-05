/**
 * @fileoverview Unified Monitoring Dashboard
 * @version 1.0.0
 * @created 2024-03-21
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  IconButton,
  Tooltip,
  Spinner,
  Alert,
  Tabs,
  Tab,
  Paper,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@/components/ui';
import { 
  TimelineIcon,
  AssessmentIcon,
  NotificationsIcon,
  TuneIcon,
  BugReportIcon,
  HealthAndSafetyIcon,
  DownloadIcon,
  SettingsIcon 
} from '@/components/ui/Icons';
import { AlertHistory } from './AlertHistory';
import { ThresholdConfig } from './ThresholdConfig';
import { MetricComparison } from './MetricComparison';
import { AdvancedMetrics } from './AdvancedMetrics';
import { MetricAggregation } from './MetricAggregation';
import { monitoring } from '../../lib/monitoring';

interface HealthScore {
  component: string;
  score: number;
  status: 'healthy' | 'warning' | 'critical';
  metrics: {
    name: string;
    value: number;
    threshold: number;
  }[];
}

interface AnomalyDetection {
  metric: string;
  timestamp: number;
  value: number;
  expectedValue: number;
  severity: 'low' | 'medium' | 'high';
  pattern: string;
}

const DRAWER_WIDTH = 240;

export const MonitoringDashboard: React.FC = () => {
  const [selectedView, setSelectedView] = useState<string>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [healthScores, setHealthScores] = useState<HealthScore[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [healthData, anomalyData] = await Promise.all([
        monitoring.getHealthScores(),
        monitoring.getAnomalies()
      ]);
      setHealthScores(healthData);
      setAnomalies(anomalyData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderOverview = () => (
    <Grid container spacing={3}>
      {/* Health Scores */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Health
            </Typography>
            <Grid container spacing={2}>
              {healthScores.map((health, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1">
                          {health.component}
                        </Typography>
                        <Badge
                          label={health.status}
                          color={getHealthColor(health.status)}
                          size="small"
                        />
                      </Box>
                      <Typography variant="h4" align="center" sx={{ mb: 2 }}>
                        {health.score}%
                      </Typography>
                      <Box>
                        {health.metrics.map((metric, idx) => (
                          <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="textSecondary">
                              {metric.name}
                            </Typography>
                            <Typography variant="body2">
                              {metric.value} / {metric.threshold}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Anomalies */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Anomalies
            </Typography>
            <Grid container spacing={2}>
              {anomalies.map((anomaly, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1">
                          {anomaly.metric.split('.').pop()}
                        </Typography>
                        <Badge
                          label={anomaly.severity}
                          color={anomaly.severity === 'high' ? 'error' : anomaly.severity === 'medium' ? 'warning' : 'info'}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {new Date(anomaly.timestamp).toLocaleString()}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="textSecondary">
                            Actual Value
                          </Typography>
                          <Typography variant="body2">
                            {anomaly.value}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="textSecondary">
                            Expected Value
                          </Typography>
                          <Typography variant="body2">
                            {anomaly.expectedValue}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        Pattern: {anomaly.pattern}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderContent = () => {
    switch (selectedView) {
      case 'overview':
        return renderOverview();
      case 'alerts':
        return <AlertHistory />;
      case 'thresholds':
        return <ThresholdConfig />;
      case 'comparison':
        return <MetricComparison />;
      case 'advanced':
        return <AdvancedMetrics />;
      case 'aggregation':
        return <MetricAggregation />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="persistent"
        anchor="left"
        open={drawerOpen}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItem button selected={selectedView === 'overview'} onClick={() => setSelectedView('overview')}>
              <ListItemIcon>
                <HealthAndSafetyIcon />
              </ListItemIcon>
              <ListItemText primary="Overview" />
            </ListItem>
            <ListItem button selected={selectedView === 'alerts'} onClick={() => setSelectedView('alerts')}>
              <ListItemIcon>
                <NotificationsIcon />
              </ListItemIcon>
              <ListItemText primary="Alerts" />
            </ListItem>
            <ListItem button selected={selectedView === 'thresholds'} onClick={() => setSelectedView('thresholds')}>
              <ListItemIcon>
                <TuneIcon />
              </ListItemIcon>
              <ListItemText primary="Thresholds" />
            </ListItem>
            <Divider />
            <ListItem button selected={selectedView === 'comparison'} onClick={() => setSelectedView('comparison')}>
              <ListItemIcon>
                <TimelineIcon />
              </ListItemIcon>
              <ListItemText primary="Comparison" />
            </ListItem>
            <ListItem button selected={selectedView === 'advanced'} onClick={() => setSelectedView('advanced')}>
              <ListItemIcon>
                <AssessmentIcon />
              </ListItemIcon>
              <ListItemText primary="Advanced" />
            </ListItem>
            <ListItem button selected={selectedView === 'aggregation'} onClick={() => setSelectedView('aggregation')}>
              <ListItemIcon>
                <BugReportIcon />
              </ListItemIcon>
              <ListItemText primary="Aggregation" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Spinner />
          </Box>
        ) : (
          renderContent()
        )}
      </Box>
    </Box>
  );
}; 
