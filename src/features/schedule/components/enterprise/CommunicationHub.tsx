import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Announcement as AnnouncementIcon,
  NotificationsActive as UrgentIcon,
  SwapHoriz as HandoverIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Announcement, ShiftHandover } from '../../types/enterprise';
import { scheduleAPI } from '../../api/scheduleAPI';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`communication-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const CommunicationHub: React.FC = () => {
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcementPriority, setAnnouncementPriority] = useState<
    'low' | 'medium' | 'high' | 'urgent'
  >('medium');

  const { data: announcements = [] } = useQuery<Announcement[]>(
    ['announcements'],
    () => scheduleAPI.getAnnouncements(),
  );

  const { data: handovers = [] } = useQuery<ShiftHandover[]>(
    ['handovers'],
    () => scheduleAPI.getShiftHandovers(),
  );

  const createAnnouncementMutation = useMutation(
    (newAnnouncement: Partial<Announcement>) =>
      scheduleAPI.createAnnouncement(newAnnouncement),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['announcements']);
        handleCloseDialog();
      },
    }
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setAnnouncementTitle('');
    setAnnouncementContent('');
    setAnnouncementPriority('medium');
  };

  const handleCreateAnnouncement = () => {
    createAnnouncementMutation.mutate({
      title: announcementTitle,
      content: announcementContent,
      priority: announcementPriority,
      timestamp: new Date().toISOString(),
    });
  };

  const getPriorityColor = (
    priority: 'low' | 'medium' | 'high' | 'urgent'
  ): 'default' | 'primary' | 'warning' | 'error' => {
    switch (priority) {
      case 'low':
        return 'default';
      case 'medium':
        return 'primary';
      case 'high':
        return 'warning';
      case 'urgent':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Announcements" />
          <Tab label="Shift Handovers" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Announcements</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            New Announcement
          </Button>
        </Box>

        <List>
          {announcements.map((announcement) => (
            <Card key={announcement.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">{announcement.title}</Typography>
                  <Chip
                    label={announcement.priority}
                    color={getPriorityColor(announcement.priority)}
                    size="small"
                  />
                </Box>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  {announcement.content}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mt: 2,
                    color: 'text.secondary',
                  }}
                >
                  <Typography variant="caption">
                    Posted: {format(new Date(announcement.timestamp), 'PPp')}
                  </Typography>
                  <Typography variant="caption">
                    By: {announcement.sender}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </List>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Shift Handovers
        </Typography>

        <List>
          {handovers.map((handover) => (
            <Card key={handover.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <HandoverIcon sx={{ mr: 1 }} />
                  <Typography variant="subtitle1">
                    {handover.fromEmployee} → {handover.toEmployee}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {handover.notes}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Tasks:
                </Typography>
                <List dense>
                  {handover.tasks.map((task) => (
                    <ListItem key={task.id}>
                      <ListItemText
                        primary={task.description}
                        secondary={`Status: ${task.status} | Priority: ${task.priority}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          ))}
        </List>
      </TabPanel>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>New Announcement</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={announcementTitle}
            onChange={(e) => setAnnouncementTitle(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Content"
            fullWidth
            multiline
            rows={4}
            value={announcementContent}
            onChange={(e) => setAnnouncementContent(e.target.value)}
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Priority
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {(['low', 'medium', 'high', 'urgent'] as const).map((priority) => (
                <Chip
                  key={priority}
                  label={priority}
                  onClick={() => setAnnouncementPriority(priority)}
                  color={getPriorityColor(priority)}
                  variant={announcementPriority === priority ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleCreateAnnouncement} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
