/**
 * @writecarenotes.com
 * @fileoverview Staff Assignment Dialog Component
 * @version 1.0.0
 * @created 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Typography,
    Box,
    Chip,
    TextField,
    CircularProgress,
    Alert,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import { Staff, OnCallRecord } from '../types/OnCallTypes';

interface StaffAssignmentDialogProps {
    open: boolean;
    onClose: () => void;
    onAssign: (staffId: string, notes: string) => Promise<void>;
    availableStaff: Staff[];
    record: OnCallRecord;
}

export const StaffAssignmentDialog: React.FC<StaffAssignmentDialogProps> = ({
    open,
    onClose,
    onAssign,
    availableStaff,
    record
}) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAssign = async () => {
        if (!selectedStaff) return;

        try {
            setLoading(true);
            setError(null);
            await onAssign(selectedStaff.id, notes);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to assign staff');
        } finally {
            setLoading(false);
        }
    };

    const isStaffQualified = (staff: Staff) => {
        return staff.qualifications.some(qual => 
            record.compliance?.regulatoryRequirements.includes(qual)
        );
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            fullScreen={fullScreen}
            fullWidth
            maxWidth="sm"
            aria-labelledby="staff-assignment-dialog-title"
        >
            <DialogTitle id="staff-assignment-dialog-title">
                Assign Staff Member
            </DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                        Call Details
                    </Typography>
                    <Typography variant="body1">
                        Category: {record.category}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                        <Chip 
                            label={record.priority} 
                            color={record.priority === 'urgent' ? 'error' : 'default'}
                            size="small"
                        />
                    </Box>
                </Box>

                <Typography variant="subtitle1" gutterBottom>
                    Available Staff
                </Typography>
                <List sx={{ mb: 2 }}>
                    {availableStaff.map((staff) => (
                        <ListItem
                            key={staff.id}
                            button
                            selected={selectedStaff?.id === staff.id}
                            onClick={() => setSelectedStaff(staff)}
                            sx={{
                                borderRadius: 1,
                                mb: 1,
                                border: '1px solid',
                                borderColor: 'divider'
                            }}
                        >
                            <ListItemAvatar>
                                <Avatar>
                                    <PersonIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={staff.name}
                                secondary={
                                    <Box>
                                        <Typography variant="body2">
                                            {staff.role}
                                        </Typography>
                                        <Box sx={{ mt: 0.5 }}>
                                            {staff.qualifications.map((qual) => (
                                                <Chip
                                                    key={qual}
                                                    label={qual}
                                                    size="small"
                                                    color={
                                                        record.compliance?.regulatoryRequirements.includes(qual)
                                                            ? 'success'
                                                            : 'default'
                                                    }
                                                    sx={{ mr: 0.5, mb: 0.5 }}
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                }
                            />
                            {isStaffQualified(staff) && (
                                <Chip
                                    label="Qualified"
                                    color="success"
                                    size="small"
                                    sx={{ ml: 1 }}
                                />
                            )}
                        </ListItem>
                    ))}
                </List>

                <TextField
                    label="Assignment Notes"
                    multiline
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    fullWidth
                    placeholder="Add any specific instructions or notes for the assigned staff member"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleAssign}
                    variant="contained"
                    disabled={!selectedStaff || loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                    Assign Staff
                </Button>
            </DialogActions>
        </Dialog>
    );
};
