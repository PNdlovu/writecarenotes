import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Avatar,
  AvatarGroup,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Group as TeamIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { TeamCapacity } from '../../types/enterprise';
import { scheduleAPI } from '../../api/scheduleAPI';
import { format } from 'date-fns';

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
      id={`team-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const TeamManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);

  const { data: teams = [] } = useQuery(['teams'], () => scheduleAPI.getTeams());

  const { data: capacityData = [] } = useQuery<TeamCapacity[]>(
    ['teamCapacity'],
    () => scheduleAPI.getTeamCapacity(),
  );

  const createTeamMutation = useMutation(
    (newTeam: any) => scheduleAPI.createTeam(newTeam),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['teams']);
        handleCloseDialog();
      },
    }
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (team?: any) => {
    setSelectedTeam(team || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedTeam(null);
    setDialogOpen(false);
  };

  const handleCreateTeam = (formData: any) => {
    createTeamMutation.mutate(formData);
  };

  const renderTeamOverview = () => (
    <Grid container spacing={3}>
      {teams.map((team) => (
        <Grid item xs={12} md={6} lg={4} key={team.id}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <Box>
                  <Typography variant="h6">{team.name}</Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {team.description}
                  </Typography>
                </Box>
                <Box>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(team)}
                  >
                    <EditIcon />
                  </IconButton>
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationIcon sx={{ mr: 1, fontSize: 'small' }} />
                  <Typography variant="body2">{team.location}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TimeIcon sx={{ mr: 1, fontSize: 'small' }} />
                  <Typography variant="body2">{team.timezone}</Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Skills
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {team.skills.map((skill: string, index: number) => (
                    <Chip key={index} label={skill} size="small" />
                  ))}
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Team Members ({team.members.length})
                </Typography>
                <AvatarGroup max={5}>
                  {team.members.map((member: any) => (
                    <Avatar
                      key={member.id}
                      alt={member.name}
                      src={member.avatar}
                    />
                  ))}
                </AvatarGroup>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderCapacityPlanning = () => (
    <Card>
      <CardContent>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Team</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Required</TableCell>
                <TableCell>Actual</TableCell>
                <TableCell>Coverage</TableCell>
                <TableCell>Skills Coverage</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {capacityData.map((capacity) => (
                <TableRow key={capacity.id}>
                  <TableCell>{capacity.teamId}</TableCell>
                  <TableCell>
                    {format(new Date(capacity.date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>{capacity.requiredHeadcount}</TableCell>
                  <TableCell>{capacity.actualHeadcount}</TableCell>
                  <TableCell>
                    {(
                      (capacity.actualHeadcount / capacity.requiredHeadcount) *
                      100
                    ).toFixed(1)}
                    %
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {Object.entries(capacity.skills).map(([skill, count]) => (
                        <Chip
                          key={skill}
                          label={`${skill}: ${count}`}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h6">Team Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create Team
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Teams Overview" />
          <Tab label="Capacity Planning" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {renderTeamOverview()}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {renderCapacityPlanning()}
      </TabPanel>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedTeam ? 'Edit Team' : 'Create New Team'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Team Name"
                fullWidth
                defaultValue={selectedTeam?.name}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={2}
                defaultValue={selectedTeam?.description}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Location"
                fullWidth
                defaultValue={selectedTeam?.location}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Timezone</InputLabel>
                <Select
                  label="Timezone"
                  defaultValue={selectedTeam?.timezone || 'UTC'}
                >
                  <MenuItem value="UTC">UTC</MenuItem>
                  <MenuItem value="EST">EST</MenuItem>
                  <MenuItem value="PST">PST</MenuItem>
                  {/* Add more timezone options */}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={() => handleCreateTeam({})}
            variant="contained"
          >
            {selectedTeam ? 'Save Changes' : 'Create Team'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
