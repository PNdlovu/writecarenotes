import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { format } from 'date-fns';
import { ShiftBid } from '../../types/enterprise';
import { Shift } from '../../../../types/schedule';
import { Employee } from '../../../../types/employee';
import { scheduleAPI } from '../../api/scheduleAPI';

interface ShiftBiddingProps {
  shifts: Shift[];
  employees: Employee[];
}

export const ShiftBidding: React.FC<ShiftBiddingProps> = ({ shifts, employees }) => {
  const queryClient = useQueryClient();
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [bidNotes, setBidNotes] = useState('');

  const { data: bids = [] } = useQuery<ShiftBid[]>(
    ['shiftBids'],
    () => scheduleAPI.getShiftBids(),
  );

  const createBidMutation = useMutation(
    (newBid: Partial<ShiftBid>) => scheduleAPI.createShiftBid(newBid),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['shiftBids']);
        handleCloseBidDialog();
      },
    }
  );

  const handleOpenBidDialog = (shift: Shift) => {
    setSelectedShift(shift);
    setBidDialogOpen(true);
  };

  const handleCloseBidDialog = () => {
    setSelectedShift(null);
    setBidDialogOpen(false);
    setBidNotes('');
  };

  const handleSubmitBid = () => {
    if (!selectedShift) return;

    createBidMutation.mutate({
      shiftId: selectedShift.id,
      notes: bidNotes,
      timestamp: new Date().toISOString(),
      bidStatus: 'pending',
      priority: 1,
    });
  };

  const getBidStatus = (shift: Shift) => {
    const shiftBids = bids.filter(bid => bid.shiftId === shift.id);
    if (shiftBids.length === 0) return null;
    
    return (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Chip
          size="small"
          label={`${shiftBids.length} bid(s)`}
          color="primary"
          variant="outlined"
        />
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Available Shifts for Bidding
      </Typography>
      
      <List>
        {shifts.map((shift) => (
          <Card key={shift.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <ListItem>
                  <ListItemText
                    primary={format(new Date(shift.startTime), 'PPP')}
                    secondary={`${format(new Date(shift.startTime), 'p')} - ${format(
                      new Date(shift.endTime),
                      'p'
                    )}`}
                  />
                </ListItem>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  {getBidStatus(shift)}
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleOpenBidDialog(shift)}
                  >
                    Place Bid
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </List>

      <Dialog open={bidDialogOpen} onClose={handleCloseBidDialog}>
        <DialogTitle>Place Bid for Shift</DialogTitle>
        <DialogContent>
          {selectedShift && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">
                {format(new Date(selectedShift.startTime), 'PPP')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {`${format(new Date(selectedShift.startTime), 'p')} - ${format(
                  new Date(selectedShift.endTime),
                  'p'
                )}`}
              </Typography>
              <TextField
                margin="normal"
                fullWidth
                multiline
                rows={4}
                label="Bid Notes"
                value={bidNotes}
                onChange={(e) => setBidNotes(e.target.value)}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBidDialog}>Cancel</Button>
          <Button onClick={handleSubmitBid} variant="contained">
            Submit Bid
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
