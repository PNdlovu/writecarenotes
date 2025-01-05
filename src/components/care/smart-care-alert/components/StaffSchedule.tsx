/**
 * @writecarenotes.com
 * @fileoverview Staff Schedule Component
 * @version 1.0.0
 * @created 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import React, { useState } from 'react';
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
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Paper
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Staff } from '../types/OnCallTypes';

interface StaffScheduleProps {
    organizationId: string;
    data: {
        available: number;
        total: number;
        schedule: Array<{
            id: string;
            staffId: string;
            staffName: string;
            role: string;
            start: Date;
            end: Date;
            status: 'scheduled' | 'active' | 'completed';
        }>;
        coverage: Array<{
            hour: number;
            coverage: number;
            required: number;
        }>;
    };
}

export const StaffSchedule: React.FC<StaffScheduleProps> = ({
    organizationId,
    data
}) => {
    const [selectedSlot, setSelectedSlot] = useState<any>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleSaveSchedule = async () => {
        // Implementation
        setDialogOpen(false);
    };

    const getCoverageStatus = (coverage: number, required: number) => {
        const ratio = coverage / required;
        if (ratio >= 1) return 'success';
        if (ratio >= 0.7) return 'warning';
        return 'error';
    };

    return (
        <Grid container spacing={3}>
            {/* Coverage Overview */}
            <Grid item xs={12} md={4}>
                <Card sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Staff Coverage
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h3">
                            {Math.round((data.available / data.total) * 100)}%
                        </Typography>
                        <Typography color="text.secondary">
                            {data.available} of {data.total} staff available
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setDialogOpen(true)}
                    >
                        Add Schedule
                    </Button>
                </Card>
            </Grid>

            {/* Coverage Timeline */}
            <Grid item xs={12} md={8}>
                <Card sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        24-Hour Coverage
                    </Typography>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Hour</TableCell>
                                    <TableCell>Coverage</TableCell>
                                    <TableCell>Required</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.coverage.map((slot) => (
                                    <TableRow key={slot.hour}>
                                        <TableCell>
                                            {slot.hour}:00
                                        </TableCell>
                                        <TableCell>{slot.coverage}</TableCell>
                                        <TableCell>{slot.required}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={`${Math.round((slot.coverage / slot.required) * 100)}%`}
                                                color={getCoverageStatus(slot.coverage, slot.required)}
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

            {/* Schedule Table */}
            <Grid item xs={12}>
                <Card>
                    <Box sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Staff Schedule
                        </Typography>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Staff</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell>Start</TableCell>
                                    <TableCell>End</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.schedule.map((schedule) => (
                                    <TableRow key={schedule.id}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <PersonIcon sx={{ mr: 1 }} />
                                                {schedule.staffName}
                                            </Box>
                                        </TableCell>
                                        <TableCell>{schedule.role}</TableCell>
                                        <TableCell>
                                            {new Date(schedule.start).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(schedule.end).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={schedule.status}
                                                color={
                                                    schedule.status === 'active' ? 'success' :
                                                    schedule.status === 'scheduled' ? 'primary' :
                                                    'default'
                                                }
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                onClick={() => setSelectedSlot(schedule)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton size="small" color="error">
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            </Grid>

            {/* Schedule Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {selectedSlot ? 'Edit Schedule' : 'Add Schedule'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Staff Member"
                                    defaultValue={selectedSlot?.staffId || ''}
                                >
                                    {/* Staff options would be populated here */}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <DateTimePicker
                                    label="Start Time"
                                    defaultValue={selectedSlot?.start || null}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <DateTimePicker
                                    label="End Time"
                                    defaultValue={selectedSlot?.end || null}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveSchedule}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
};
