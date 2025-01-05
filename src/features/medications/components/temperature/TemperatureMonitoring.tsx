/**
 * @writecarenotes.com
 * @fileoverview Temperature monitoring component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Component for monitoring medication storage temperatures
 * including alerts and compliance reporting.
 */

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import { useOrganization } from '@/hooks/useOrganization';
import { TemperatureService } from '../../services/temperatureService';
import { formatDate } from '@/lib/format';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ThermometerSnowflake,
  ThermometerSun,
  XCircle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { StorageLocation, TemperatureAlert } from '../../types/stockAnalytics';

const temperatureService = new TemperatureService();

export function TemperatureMonitoring() {
  const { organizationId } = useOrganization();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const {
    data: locations,
    isLoading: locationsLoading,
    error: locationsError,
  } = useQuery({
    queryKey: ['storage-locations', organizationId],
    queryFn: () => temperatureService.getStorageLocations(organizationId),
  });

  const {
    data: alerts,
    isLoading: alertsLoading,
    error: alertsError,
  } = useQuery({
    queryKey: ['temperature-alerts', organizationId],
    queryFn: () =>
      Promise.all(
        (locations || []).map((location) =>
          temperatureService.getActiveAlerts(location.id)
        )
      ).then((results) => results.flat()),
  });

  const { mutate: acknowledgeAlert } = useMutation({
    mutationFn: ({
      id,
      userId,
    }: {
      id: string;
      userId: string;
    }) => temperatureService.acknowledgeAlert(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['temperature-alerts']);
      toast({
        title: 'Alert acknowledged',
        description: 'The temperature alert has been acknowledged.',
      });
    },
  });

  if (locationsLoading || alertsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading temperature data...</p>
      </div>
    );
  }

  if (locationsError || alertsError) {
    return (
      <div className="flex items-center justify-center h-96 text-destructive">
        <p>Error loading temperature data</p>
      </div>
    );
  }

  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE');
  const criticalLocations = locations.filter((l) => l.status === 'ALERT');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Temperature Monitoring
        </h2>
        <div className="flex items-center gap-4">
          <Button variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            Configure Alerts
          </Button>
          <Button>
            <ThermometerSnowflake className="h-4 w-4 mr-2" />
            Add Location
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Storage Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locations.length}</div>
            <p className="text-xs text-muted-foreground">
              Total monitored locations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {activeAlerts.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requiring attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Critical Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {criticalLocations.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Outside safe range
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Compliance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                ((locations.length - criticalLocations.length) /
                  locations.length) *
                  100
              )}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              Locations within range
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Temperature Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle>Temperature Monitoring</CardTitle>
          <CardDescription>
            Monitor and manage storage temperatures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>Current Temp</TableHead>
                    <TableHead>Range</TableHead>
                    <TableHead>Humidity</TableHead>
                    <TableHead>Last Checked</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.map((location) => (
                    <TableRow
                      key={location.id}
                      className={
                        location.status === 'ALERT'
                          ? 'bg-destructive/10'
                          : location.status === 'WARNING'
                          ? 'bg-warning/10'
                          : undefined
                      }
                    >
                      <TableCell className="font-medium">
                        {location.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {location.currentTemp}°C
                          {location.currentTemp > location.maxTemp ? (
                            <ThermometerSun className="h-4 w-4 text-destructive" />
                          ) : location.currentTemp < location.minTemp ? (
                            <ThermometerSnowflake className="h-4 w-4 text-destructive" />
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        {location.minTemp}°C - {location.maxTemp}°C
                      </TableCell>
                      <TableCell>
                        {location.currentHumidity
                          ? `${location.currentHumidity}%`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {location.lastChecked
                          ? formatDate(location.lastChecked)
                          : 'Never'}
                      </TableCell>
                      <TableCell>
                        <LocationStatusBadge status={location.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="alerts">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Threshold</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium">
                        {
                          locations.find((l) => l.id === alert.locationId)
                            ?.name
                        }
                      </TableCell>
                      <TableCell>
                        <AlertTypeBadge type={alert.type} />
                      </TableCell>
                      <TableCell>
                        {alert.value}
                        {alert.type.includes('TEMP') ? '°C' : '%'}
                      </TableCell>
                      <TableCell>
                        {alert.threshold}
                        {alert.type.includes('TEMP') ? '°C' : '%'}
                      </TableCell>
                      <TableCell>{formatDate(alert.timestamp)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() =>
                            acknowledgeAlert({
                              id: alert.id,
                              userId: 'current-user-id', // TODO: Get from auth
                            })
                          }
                        >
                          Acknowledge
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="compliance">
              <div className="space-y-4">
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={locations.map((location) => ({
                        name: location.name,
                        temperature: location.currentTemp,
                        minTemp: location.minTemp,
                        maxTemp: location.maxTemp,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="temperature"
                        name="Current Temperature"
                        stroke="#0ea5e9"
                      />
                      <Line
                        type="monotone"
                        dataKey="minTemp"
                        name="Min Temperature"
                        stroke="#f43f5e"
                        strokeDasharray="5 5"
                      />
                      <Line
                        type="monotone"
                        dataKey="maxTemp"
                        name="Max Temperature"
                        stroke="#f43f5e"
                        strokeDasharray="5 5"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location</TableHead>
                      <TableHead>Compliance Rate</TableHead>
                      <TableHead>Alerts (30d)</TableHead>
                      <TableHead>Max Deviation</TableHead>
                      <TableHead>Last Calibration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locations.map((location) => (
                      <TableRow key={location.id}>
                        <TableCell className="font-medium">
                          {location.name}
                        </TableCell>
                        <TableCell>95%</TableCell>
                        <TableCell>3</TableCell>
                        <TableCell>2.5°C</TableCell>
                        <TableCell>2024-02-15</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function LocationStatusBadge({
  status,
}: {
  status: StorageLocation['status'];
}) {
  switch (status) {
    case 'NORMAL':
      return (
        <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Normal
        </Badge>
      );
    case 'WARNING':
      return (
        <Badge variant="warning" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Warning
        </Badge>
      );
    case 'ALERT':
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Alert
        </Badge>
      );
    default:
      return null;
  }
}

function AlertTypeBadge({
  type,
}: {
  type: TemperatureAlert['type'];
}) {
  switch (type) {
    case 'HIGH_TEMP':
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <ThermometerSun className="h-3 w-3" />
          High Temperature
        </Badge>
      );
    case 'LOW_TEMP':
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <ThermometerSnowflake className="h-3 w-3" />
          Low Temperature
        </Badge>
      );
    case 'HIGH_HUMIDITY':
      return (
        <Badge variant="warning" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          High Humidity
        </Badge>
      );
    case 'LOW_HUMIDITY':
      return (
        <Badge variant="warning" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Low Humidity
        </Badge>
      );
    default:
      return null;
  }
} 