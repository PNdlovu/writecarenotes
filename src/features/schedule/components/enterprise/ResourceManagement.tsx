import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import { Resource, ResourceAvailability } from '../../types/enterprise';
import { scheduleAPI } from '../../api/scheduleAPI';
import { format } from 'date-fns';

interface ResourceManagementProps {
  date?: Date;
}

export const ResourceManagement: React.FC<ResourceManagementProps> = ({ date = new Date() }) => {
  const queryClient = useQueryClient();
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: resources = [] } = useQuery<Resource[]>(
    ['resources'],
    () => scheduleAPI.getResources(),
  );

  const createResourceMutation = useMutation(
    (newResource: Partial<Resource>) => scheduleAPI.createResource(newResource),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['resources']);
        handleCloseDialog();
      },
    }
  );

  const handleOpenDialog = (resource?: Resource) => {
    setSelectedResource(resource || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedResource(null);
    setDialogOpen(false);
  };

  const getAvailabilityStatus = (resource: Resource): JSX.Element => {
    const currentAvailability = resource.availability.find(a => {
      const start = new Date(a.startTime);
      const end = new Date(a.endTime);
      const now = new Date();
      return now >= start && now <= end;
    });

    return (
      <Chip
        size="small"
        label={currentAvailability?.status || 'unavailable'}
        color={
          currentAvailability?.status === 'available'
            ? 'success'
            : currentAvailability?.status === 'booked'
            ? 'error'
            : 'warning'
        }
      />
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Resource Management</Typography>
        <Button
          variant="contained"
          onClick={() => handleOpenDialog()}
        >
          Add Resource
        </Button>
      </Box>

      <Grid container spacing={3}>
        {resources.map((resource) => (
          <Grid item xs={12} md={6} lg={4} key={resource.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">{resource.name}</Typography>
                  {getAvailabilityStatus(resource)}
                </Box>
                <Typography color="text.secondary" gutterBottom>
                  Type: {resource.type}
                </Typography>
                {resource.capacity && (
                  <Typography color="text.secondary">
                    Capacity: {resource.capacity}
                  </Typography>
                )}
                {resource.requirements && resource.requirements.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Requirements:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                      {resource.requirements.map((req, index) => (
                        <Chip
                          key={index}
                          label={req}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedResource ? 'Edit Resource' : 'Add New Resource'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Resource Name"
              fullWidth
              defaultValue={selectedResource?.name}
            />
            <FormControl fullWidth>
              <InputLabel>Resource Type</InputLabel>
              <Select
                defaultValue={selectedResource?.type || 'room'}
                label="Resource Type"
              >
                <MenuItem value="room">Room</MenuItem>
                <MenuItem value="equipment">Equipment</MenuItem>
                <MenuItem value="vehicle">Vehicle</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Capacity"
              type="number"
              fullWidth
              defaultValue={selectedResource?.capacity}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            {selectedResource ? 'Save Changes' : 'Add Resource'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
