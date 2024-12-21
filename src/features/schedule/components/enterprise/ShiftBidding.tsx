import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import { ShiftBid } from '../../types/enterprise';
import { Shift } from '../../../../types/schedule';
import { Employee } from '../../../../types/employee';
import { scheduleAPI } from '../../api/scheduleAPI';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

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
      <div className="flex gap-2">
        <Badge variant="outline">
          {shiftBids.length} bid(s)
        </Badge>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shift Bidding</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Shift</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shifts.map((shift) => (
              <TableRow key={shift.id}>
                <TableCell>{shift.name}</TableCell>
                <TableCell>{format(new Date(shift.date), 'dd MMM yyyy')}</TableCell>
                <TableCell>{shift.time}</TableCell>
                <TableCell>
                  <Badge variant={shift.status === 'Open' ? 'success' : 'secondary'}>
                    {shift.status}
                  </Badge>
                  {getBidStatus(shift)}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    disabled={shift.status !== 'Open'}
                    onClick={() => handleOpenBidDialog(shift)}
                  >
                    Bid Now
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={bidDialogOpen} onOpenChange={handleCloseBidDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Place Bid for Shift</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedShift && (
                <div>
                  <p className="text-sm font-medium">Shift Details</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedShift.name} - {format(new Date(selectedShift.date), 'dd MMM yyyy')} at {selectedShift.time}
                  </p>
                </div>
              )}
              <div>
                <label htmlFor="notes" className="text-sm font-medium">Notes</label>
                <Textarea
                  id="notes"
                  value={bidNotes}
                  onChange={(e) => setBidNotes(e.target.value)}
                  placeholder="Add any notes about your bid..."
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseBidDialog}>
                Cancel
              </Button>
              <Button onClick={handleSubmitBid} disabled={createBidMutation.isLoading}>
                {createBidMutation.isLoading ? 'Submitting...' : 'Submit Bid'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
