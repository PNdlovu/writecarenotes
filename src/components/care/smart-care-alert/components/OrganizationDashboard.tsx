/**
 * @writecarenotes.com
 * @fileoverview Organization-level On-Call Dashboard
 * @version 1.0.0
 * @created 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    Typography,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Tooltip,
    CircularProgress,
    Alert,
    useTheme,
    useMediaQuery,
    Paper
} from '@mui/material';
import {
    Assessment as AssessmentIcon,
    Notifications as NotificationsIcon,
    People as PeopleIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { Organization } from '../../base/types';
import { OnCallService } from '../services/OnCallService';
import { OnCallAnalytics } from '../analytics/OnCallAnalytics';
import { ComplianceReport } from '../compliance/ComplianceReport';
import { AnalyticsChart } from '../analytics/AnalyticsChart';
import { StaffSchedule } from './StaffSchedule';

interface OrganizationDashboardProps {
    organization: Organization;
}

export const OrganizationDashboard: React.FC<OrganizationDashboardProps> = ({ organization }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [analytics, setAnalytics] = useState<any>(null);
    const [compliance, setCompliance] = useState<any>(null);

    const onCallService = OnCallService.getInstance();
    const onCallAnalytics = OnCallAnalytics.getInstance();

    useEffect(() => {
        loadDashboardData();
    }, [organization.id]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [analyticsData, complianceData] = await Promise.all([
                onCallAnalytics.getOrganizationAnalytics(organization.id),
                onCallAnalytics.getComplianceReport(organization.id)
            ]);

            setAnalytics(analyticsData);
            setCompliance(complianceData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const renderOverview = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={3}>
                <Card sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                        Active Calls
                    </Typography>
                    <Typography variant="h4">
                        {analytics?.activeCalls || 0}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        <AnalyticsChart
                            data={analytics?.callTrends}
                            type="line"
                            height={100}
                        />
                    </Box>
                </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
                <Card sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                        Response Time
                    </Typography>
                    <Typography variant="h4">
                        {analytics?.averageResponseTime || '0m'}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        <AnalyticsChart
                            data={analytics?.responseTrends}
                            type="bar"
                            height={100}
                        />
                    </Box>
                </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
                <Card sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                        Staff Coverage
                    </Typography>
                    <Typography variant="h4">
                        {analytics?.staffCoverage || '0%'}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        <AnalyticsChart
                            data={analytics?.coverageTrends}
                            type="area"
                            height={100}
                        />
                    </Box>
                </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
                <Card sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                        Compliance Rate
                    </Typography>
                    <Typography variant="h4">
                        {analytics?.complianceRate || '0%'}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        <AnalyticsChart
                            data={analytics?.complianceTrends}
                            type="bar"
                            height={100}
                        />
                    </Box>
                </Card>
            </Grid>

            <Grid item xs={12}>
                <Card>
                    <Box sx={{ p: 2 }}>
                        <Typography variant="h6">Care Home Performance</Typography>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Care Home</TableCell>
                                    <TableCell align="right">Active Calls</TableCell>
                                    <TableCell align="right">Avg Response Time</TableCell>
                                    <TableCell align="right">Staff Coverage</TableCell>
                                    <TableCell align="right">Compliance</TableCell>
                                    <TableCell align="right">Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {analytics?.careHomes?.map((home: any) => (
                                    <TableRow key={home.id}>
                                        <TableCell>{home.name}</TableCell>
                                        <TableCell align="right">{home.activeCalls}</TableCell>
                                        <TableCell align="right">{home.responseTime}</TableCell>
                                        <TableCell align="right">{home.staffCoverage}</TableCell>
                                        <TableCell align="right">{home.compliance}</TableCell>
                                        <TableCell align="right">
                                            {home.status === 'normal' ? (
                                                <CheckCircleIcon color="success" />
                                            ) : (
                                                <WarningIcon color="error" />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            </Grid>
        </Grid>
    );

    const renderCompliance = () => (
        <ComplianceReport
            organizationId={organization.id}
            data={compliance}
        />
    );

    const renderStaffing = () => (
        <StaffSchedule
            organizationId={organization.id}
            data={analytics?.staffing}
        />
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 2 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>
                Organization On-Call Dashboard
            </Typography>

            <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                sx={{ mb: 3 }}
            >
                <Tab
                    icon={<AssessmentIcon />}
                    label={!isMobile && "Overview"}
                    id="tab-overview"
                />
                <Tab
                    icon={<WarningIcon />}
                    label={!isMobile && "Compliance"}
                    id="tab-compliance"
                />
                <Tab
                    icon={<PeopleIcon />}
                    label={!isMobile && "Staffing"}
                    id="tab-staffing"
                />
            </Tabs>

            {activeTab === 0 && renderOverview()}
            {activeTab === 1 && renderCompliance()}
            {activeTab === 2 && renderStaffing()}
        </Box>
    );
};
