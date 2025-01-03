/**
 * @fileoverview Alert History Component
 * @version 1.0.0
 * @created 2024-03-21
 */

import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  Select,
  MenuItem,
  TextField
} from '@/components/ui';
import { FilterListIcon, CheckCircleIcon, MoreVertIcon } from '@/components/ui/Icons';
import { monitoring } from '../../lib/monitoring';

interface Alert {
  id: string;
  metric: string;
  value: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  status: 'active' | 'resolved' | 'acknowledged';
}

interface AlertFilters {
  severity: string[];
  status: string[];
  timeRange: 'hour' | 'day' | 'week' | 'month';
  search: string;
}

interface AlertAction {
  comment: string;
  timestamp: number;
  user: string;
  type: 'acknowledge' | 'resolve';
}

interface AlertWithActions extends Alert {
  actions?: AlertAction[];
}

export const AlertHistory: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState<AlertFilters>({
    severity: [],
    status: [],
    timeRange: 'day',
    search: ''
  });
  const [selectedAlert, setSelectedAlert] = useState<AlertWithActions | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionComment, setActionComment] = useState('');
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [actionType, setActionType] = useState<'acknowledge' | 'resolve'>('acknowledge');

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const endTime = Date.now();
        const periodInMs = {
          hour: 60 * 60 * 1000,
          day: 24 * 60 * 60 * 1000,
          week: 7 * 24 * 60 * 60 * 1000,
          month: 30 * 24 * 60 * 60 * 1000
        };
        const startTime = endTime - periodInMs[filters.timeRange];
        
        // Get alerts from monitoring system
        const alertHistory = await monitoring.getAlertHistory(startTime, endTime);
        setAlerts(alertHistory);
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [filters.timeRange]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'error';
      case 'acknowledged':
        return 'warning';
      case 'resolved':
        return 'success';
      default:
        return 'default';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filters.severity.length && !filters.severity.includes(alert.severity)) {
      return false;
    }
    if (filters.status.length && !filters.status.includes(alert.status)) {
      return false;
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return alert.metric.toLowerCase().includes(searchLower);
    }
    return true;
  });

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleActionClick = (alert: AlertWithActions, event: React.MouseEvent<HTMLElement>) => {
    setSelectedAlert(alert);
    setActionMenuAnchor(event.currentTarget);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
  };

  const handleActionSelect = (type: 'acknowledge' | 'resolve') => {
    setActionType(type);
    setActionMenuAnchor(null);
    setActionDialogOpen(true);
  };

  const handleActionSubmit = async () => {
    if (!selectedAlert) return;

    try {
      const action: AlertAction = {
        comment: actionComment,
        timestamp: Date.now(),
        user: 'current-user', // Replace with actual user
        type: actionType
      };

      await monitoring.updateAlertStatus(selectedAlert.id, actionType, action);
      
      // Update local state
      setAlerts(alerts.map(alert => 
        alert.id === selectedAlert.id 
          ? { 
              ...alert, 
              status: actionType === 'acknowledge' ? 'acknowledged' : 'resolved',
              actions: [...(alert.actions || []), action]
            }
          : alert
      ));

      setActionDialogOpen(false);
      setActionComment('');
      setSelectedAlert(null);
    } catch (error) {
      console.error('Failed to update alert:', error);
    }
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Alert History
      </Typography>

      <div>
        <TextField
          size="small"
          label="Search Metrics"
          value={filters.search}
          onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
        />

        <Select
          size="small"
          value={filters.timeRange}
          label="Time Range"
          onChange={(e) => setFilters(f => ({ ...f, timeRange: e.target.value as any }))}
        >
          <MenuItem value="hour">Last Hour</MenuItem>
          <MenuItem value="day">Last 24 Hours</MenuItem>
          <MenuItem value="week">Last Week</MenuItem>
          <MenuItem value="month">Last Month</MenuItem>
        </Select>

        <Select
          size="small"
          multiple
          value={filters.severity}
          label="Severity"
          onChange={(e) => setFilters(f => ({ ...f, severity: e.target.value as string[] }))}
        >
          <MenuItem value="critical">Critical</MenuItem>
          <MenuItem value="high">High</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="low">Low</MenuItem>
        </Select>

        <Select
          size="small"
          multiple
          value={filters.status}
          label="Status"
          onChange={(e) => setFilters(f => ({ ...f, status: e.target.value as string[] }))}
        >
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="acknowledged">Acknowledged</MenuItem>
          <MenuItem value="resolved">Resolved</MenuItem>
        </Select>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Metric</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Threshold</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAlerts
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((alert) => (
                <TableRow key={alert.id} sx={{ cursor: 'pointer' }}>
                  <TableCell>
                    {new Date(alert.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>{alert.metric}</TableCell>
                  <TableCell>{alert.value}</TableCell>
                  <TableCell>{alert.threshold}</TableCell>
                  <TableCell>
                    <span
                      style={{ color: getSeverityColor(alert.severity) }}
                    >
                      {alert.severity}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <span
                        style={{ color: getStatusColor(alert.status) }}
                      >
                        {alert.status}
                      </span>
                      <IconButton 
                        size="small"
                        onClick={(e) => handleActionClick(alert, e)}
                        disabled={alert.status === 'resolved'}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <div>
        <Button
          onClick={() => setPage(page - 1)}
          disabled={page === 0}
        >
          Previous
        </Button>
        <Button
          onClick={() => setPage(page + 1)}
          disabled={page >= Math.ceil(filteredAlerts.length / rowsPerPage) - 1}
        >
          Next
        </Button>
      </div>

      <Dialog 
        open={actionDialogOpen} 
        onClose={() => setActionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionType === 'acknowledge' ? 'Acknowledge Alert' : 'Resolve Alert'}
        </DialogTitle>
        <DialogContent>
          <div>
            <TextField
              label="Comment"
              multiline
              rows={4}
              fullWidth
              value={actionComment}
              onChange={(e) => setActionComment(e.target.value)}
              placeholder="Add a comment about this action..."
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleActionSubmit}
            variant="contained"
            startIcon={<CheckCircleIcon />}
          >
            {actionType === 'acknowledge' ? 'Acknowledge' : 'Resolve'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}; 
