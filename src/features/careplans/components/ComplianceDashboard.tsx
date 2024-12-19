import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  CircularProgress,
  LinearProgress,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FilterListIcon from '@mui/icons-material/FilterList';
import { EnterpriseAnalyticsService } from '../services/enterpriseAnalyticsService';

interface ComplianceMetric {
  category: string;
  score: number;
  trend: number;
  status: 'success' | 'warning' | 'error';
}

interface QualityMetric {
  name: string;
  current: number;
  previous: number;
  target: number;
}

interface TrendData {
  date: string;
  compliance: number;
  incidents: number;
  satisfaction: number;
}

export const ComplianceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<ComplianceMetric[]>([]);
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetric[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30days');

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Load data using EnterpriseAnalyticsService
      // This would be implemented in a real application
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handlePeriodSelect = (period: string) => {
    setSelectedPeriod(period);
    handleMenuClose();
  };

  const handleExport = () => {
    // Implementation for exporting dashboard data
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Compliance & Quality Dashboard</Typography>
        <Box>
          <IconButton onClick={handleExport}>
            <FileDownloadIcon />
          </IconButton>
          <IconButton onClick={handleMenuClick}>
            <FilterListIcon />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handlePeriodSelect('7days')}>Last 7 Days</MenuItem>
            <MenuItem onClick={() => handlePeriodSelect('30days')}>Last 30 Days</MenuItem>
            <MenuItem onClick={() => handlePeriodSelect('90days')}>Last 90 Days</MenuItem>
            <MenuItem onClick={() => handlePeriodSelect('1year')}>Last Year</MenuItem>
          </Menu>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Compliance Scores */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardHeader
              title="Compliance Scores"
              action={
                <IconButton>
                  <MoreVertIcon />
                </IconButton>
              }
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="score" fill="#2196f3" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Quality Metrics */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardHeader title="Quality Metrics" />
            <CardContent>
              {qualityMetrics.map((metric, index) => (
                <Box key={index} mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">{metric.name}</Typography>
                    <Typography variant="body2">
                      {metric.current}% / {metric.target}%
                    </Typography>
                  </Box>
                  <Tooltip title={`Target: ${metric.target}%`}>
                    <LinearProgress
                      variant="determinate"
                      value={(metric.current / metric.target) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 5,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor:
                            metric.current >= metric.target
                              ? '#4caf50'
                              : metric.current >= metric.target * 0.8
                              ? '#ff9800'
                              : '#f44336',
                        },
                      }}
                    />
                  </Tooltip>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Trends Over Time */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Trends Over Time" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="compliance"
                    stroke="#2196f3"
                    activeDot={{ r: 8 }}
                  />
                  <Line type="monotone" dataKey="incidents" stroke="#f44336" />
                  <Line type="monotone" dataKey="satisfaction" stroke="#4caf50" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
