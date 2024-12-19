import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Tab,
  Tabs,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  CareHome,
  CareHomeConfiguration,
  CareHomeType,
  ServiceType
} from '../types/careHomeTypes';
import { CareHomeService } from '../services/careHomeService';
import { CareHomeForm } from './CareHomeForm';
import { ConfigurationForm } from './ConfigurationForm';
import { ServicesList } from './ServicesList';
import { StaffingTable } from './StaffingTable';
import { FacilitiesGrid } from './FacilitiesGrid';
import { ComplianceChecklist } from './ComplianceChecklist';

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
      id={`care-home-tabpanel-${index}`}
      aria-labelledby={`care-home-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export function CareHomeManagement() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedCareHome, setSelectedCareHome] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const careHomeService = new CareHomeService();

  // Fetch care homes
  const {
    data: careHomes,
    isLoading: isLoadingCareHomes,
    error: careHomesError
  } = useQuery(['careHomes'], () => careHomeService.getAllCareHomes());

  // Fetch selected care home configuration
  const {
    data: selectedConfig,
    isLoading: isLoadingConfig
  } = useQuery(
    ['careHomeConfig', selectedCareHome],
    () => selectedCareHome ? careHomeService.getCareHomeConfiguration(selectedCareHome) : null,
    { enabled: !!selectedCareHome }
  );

  // Mutations
  const createCareHomeMutation = useMutation(
    async ({ careHome, config }: { 
      careHome: Omit<CareHome, 'id'>;
      config: Omit<CareHomeConfiguration, 'id' | 'careHomeId'>;
    }) => {
      return careHomeService.createCareHome(careHome, config);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['careHomes']);
      }
    }
  );

  const updateConfigurationMutation = useMutation(
    async ({ 
      careHomeId,
      config 
    }: {
      careHomeId: string;
      config: Partial<CareHomeConfiguration>;
    }) => {
      return careHomeService.updateCareHomeConfiguration(careHomeId, config);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['careHomeConfig', selectedCareHome]);
      }
    }
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleCareHomeSelect = (careHomeId: string) => {
    setSelectedCareHome(careHomeId);
  };

  const handleCreateCareHome = async (
    careHome: Omit<CareHome, 'id'>,
    config: Omit<CareHomeConfiguration, 'id' | 'careHomeId'>
  ) => {
    try {
      await createCareHomeMutation.mutateAsync({ careHome, config });
    } catch (error) {
      console.error('Failed to create care home:', error);
    }
  };

  const handleUpdateConfiguration = async (
    config: Partial<CareHomeConfiguration>
  ) => {
    if (!selectedCareHome) return;

    try {
      await updateConfigurationMutation.mutateAsync({
        careHomeId: selectedCareHome,
        config
      });
    } catch (error) {
      console.error('Failed to update configuration:', error);
    }
  };

  if (isLoadingCareHomes) {
    return <CircularProgress />;
  }

  if (careHomesError) {
    return <Alert severity="error">Failed to load care homes</Alert>;
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Care Home Management
      </Typography>

      <Tabs value={selectedTab} onChange={handleTabChange}>
        <Tab label="Care Homes" />
        <Tab label="Configuration" disabled={!selectedCareHome} />
        <Tab label="Services" disabled={!selectedCareHome} />
        <Tab label="Staffing" disabled={!selectedCareHome} />
        <Tab label="Facilities" disabled={!selectedCareHome} />
        <Tab label="Compliance" disabled={!selectedCareHome} />
      </Tabs>

      <TabPanel value={selectedTab} index={0}>
        <Grid container spacing={3}>
          {careHomes?.map((careHome) => (
            <Grid item xs={12} md={6} lg={4} key={careHome.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  bgcolor: selectedCareHome === careHome.id ? 'action.selected' : 'background.paper'
                }}
                onClick={() => handleCareHomeSelect(careHome.id)}
              >
                <CardContent>
                  <Typography variant="h6">{careHome.name}</Typography>
                  <Typography color="textSecondary">
                    Type: {careHome.type}
                  </Typography>
                  <Typography color="textSecondary">
                    Registration: {careHome.registrationType}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setSelectedTab(1)}
            >
              Add New Care Home
            </Button>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={selectedTab} index={1}>
        {selectedCareHome ? (
          <ConfigurationForm
            careHomeId={selectedCareHome}
            configuration={selectedConfig}
            onSubmit={handleUpdateConfiguration}
            isLoading={isLoadingConfig}
          />
        ) : (
          <CareHomeForm onSubmit={handleCreateCareHome} />
        )}
      </TabPanel>

      <TabPanel value={selectedTab} index={2}>
        {selectedCareHome && selectedConfig && (
          <ServicesList
            services={selectedConfig.careTypes}
            onUpdateServices={(services) =>
              handleUpdateConfiguration({ careTypes: services })
            }
          />
        )}
      </TabPanel>

      <TabPanel value={selectedTab} index={3}>
        {selectedCareHome && selectedConfig && (
          <StaffingTable
            staffingRequirements={selectedConfig.staffingRequirements}
            onUpdateStaffing={(staffing) =>
              handleUpdateConfiguration({ staffingRequirements: staffing })
            }
          />
        )}
      </TabPanel>

      <TabPanel value={selectedTab} index={4}>
        {selectedCareHome && selectedConfig && (
          <FacilitiesGrid
            facilities={selectedConfig.facilityRequirements}
            onUpdateFacilities={(facilities) =>
              handleUpdateConfiguration({ facilityRequirements: facilities })
            }
          />
        )}
      </TabPanel>

      <TabPanel value={selectedTab} index={5}>
        {selectedCareHome && selectedConfig && (
          <ComplianceChecklist
            regulations={selectedConfig.regulatoryRequirements}
            onUpdateRegulations={(regulations) =>
              handleUpdateConfiguration({ regulatoryRequirements: regulations })
            }
          />
        )}
      </TabPanel>
    </Box>
  );
}
