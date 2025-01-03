/**
 * @writecarenotes.com
 * @fileoverview Compliance Report Component
 * @version 1.0.0
 * @created 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import React from 'react';
import {
    Box,
    Grid,
    Card,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Tooltip,
    LinearProgress,
    Paper
} from '@mui/material';
import {
    Error as ErrorIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import { AnalyticsChart } from '../analytics/AnalyticsChart';

interface ComplianceReportProps {
    organizationId: string;
    data: {
        overall: {
            rate: string;
            issues: number;
            critical: number;
        };
        byCategory: Array<{
            category: string;
            rate: string;
            issues: number;
        }>;
        recentIssues: Array<{
            id: string;
            timestamp: Date;
            category: string;
            description: string;
            severity: 'low' | 'medium' | 'high';
            status: 'open' | 'resolved';
        }>;
        trends: {
            daily: any[];
            weekly: any[];
            monthly: any[];
        };
    };
}

export const ComplianceReport: React.FC<ComplianceReportProps> = ({
    organizationId,
    data
}) => {
    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'high':
                return <ErrorIcon color="error" />;
            case 'medium':
                return <WarningIcon color="warning" />;
            default:
                return <InfoIcon color="info" />;
        }
    };

    const getComplianceColor = (rate: string) => {
        const value = parseInt(rate);
        if (value >= 90) return 'success';
        if (value >= 70) return 'warning';
        return 'error';
    };

    return (
        <Grid container spacing={3}>
            {/* Overall Compliance */}
            <Grid item xs={12} md={4}>
                <Card sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Overall Compliance
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h3" sx={{ mr: 2 }}>
                            {data.overall.rate}
                        </Typography>
                        <Chip
                            label={getComplianceColor(data.overall.rate) === 'success' ? 'Compliant' : 'Action Needed'}
                            color={getComplianceColor(data.overall.rate)}
                        />
                    </Box>
                    <Typography color="text.secondary" gutterBottom>
                        Open Issues: {data.overall.issues}
                    </Typography>
                    <Typography color="error">
                        Critical Issues: {data.overall.critical}
                    </Typography>
                </Card>
            </Grid>

            {/* Compliance Trends */}
            <Grid item xs={12} md={8}>
                <Card sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Compliance Trends
                    </Typography>
                    <AnalyticsChart
                        data={data.trends.daily}
                        type="line"
                        height={200}
                    />
                </Card>
            </Grid>

            {/* Compliance by Category */}
            <Grid item xs={12} md={6}>
                <Card>
                    <Box sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Compliance by Category
                        </Typography>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Category</TableCell>
                                    <TableCell align="right">Rate</TableCell>
                                    <TableCell align="right">Issues</TableCell>
                                    <TableCell align="right">Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.byCategory.map((category) => (
                                    <TableRow key={category.category}>
                                        <TableCell>{category.category}</TableCell>
                                        <TableCell align="right">{category.rate}</TableCell>
                                        <TableCell align="right">{category.issues}</TableCell>
                                        <TableCell align="right">
                                            <Chip
                                                label={parseInt(category.rate) >= 90 ? 'Compliant' : 'Action Needed'}
                                                color={getComplianceColor(category.rate)}
                                                size="small"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            </Grid>

            {/* Recent Issues */}
            <Grid item xs={12} md={6}>
                <Card>
                    <Box sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Recent Compliance Issues
                        </Typography>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Severity</TableCell>
                                    <TableCell>Issue</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell align="right">Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.recentIssues.map((issue) => (
                                    <TableRow key={issue.id}>
                                        <TableCell>
                                            <Tooltip title={issue.severity}>
                                                {getSeverityIcon(issue.severity)}
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {issue.description}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {new Date(issue.timestamp).toLocaleString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{issue.category}</TableCell>
                                        <TableCell align="right">
                                            <Chip
                                                label={issue.status}
                                                color={issue.status === 'resolved' ? 'success' : 'warning'}
                                                size="small"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            </Grid>

            {/* Weekly Trends */}
            <Grid item xs={12}>
                <Card sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Weekly Compliance Trends
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" gutterBottom>
                                Response Time Compliance
                            </Typography>
                            <AnalyticsChart
                                data={data.trends.weekly}
                                type="bar"
                                height={200}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" gutterBottom>
                                Staff Coverage Compliance
                            </Typography>
                            <AnalyticsChart
                                data={data.trends.weekly}
                                type="bar"
                                height={200}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" gutterBottom>
                                Documentation Compliance
                            </Typography>
                            <AnalyticsChart
                                data={data.trends.weekly}
                                type="bar"
                                height={200}
                            />
                        </Grid>
                    </Grid>
                </Card>
            </Grid>
        </Grid>
    );
};
