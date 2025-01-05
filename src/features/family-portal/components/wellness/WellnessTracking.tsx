import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { ScrollArea } from "@/components/ui/ScrollArea";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Heart, Moon, Activity, Users, Calendar } from 'lucide-react';

interface WellnessData {
  date: string;
  mood: number;
  sleep: number;
  physicalActivity: number;
  socialEngagement: number;
  notes?: string;
}

interface WellnessMetrics {
  mood: {
    current: number;
    trend: 'up' | 'down' | 'stable';
    average: number;
  };
  sleep: {
    averageHours: number;
    quality: number;
    pattern: string;
  };
  physicalActivity: {
    minutesPerDay: number;
    activityTypes: string[];
    intensity: 'low' | 'moderate' | 'high';
  };
  socialEngagement: {
    eventsAttended: number;
    interactions: number;
    groupActivities: string[];
  };
}

interface WellnessTrackingProps {
  residentId: string;
  timeRange?: 'week' | 'month' | 'year';
}

export const WellnessTracking: React.FC<WellnessTrackingProps> = ({
  residentId,
  timeRange = 'week'
}) => {
  const [wellnessData, setWellnessData] = useState<WellnessData[]>([]);
  const [metrics, setMetrics] = useState<WellnessMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchWellnessData();
    fetchWellnessMetrics();
  }, [residentId, timeRange]);

  const fetchWellnessData = async () => {
    try {
      const response = await fetch(
        `/api/wellness/${residentId}/data?timeRange=${timeRange}`
      );
      if (!response.ok) throw new Error('Failed to fetch wellness data');
      const data = await response.json();
      setWellnessData(data);
    } catch (error) {
      console.error('Error fetching wellness data:', error);
    }
  };

  const fetchWellnessMetrics = async () => {
    try {
      const response = await fetch(`/api/wellness/${residentId}/metrics`);
      if (!response.ok) throw new Error('Failed to fetch wellness metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching wellness metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (mood: number) => {
    if (mood >= 4) return '😊';
    if (mood >= 3) return '🙂';
    if (mood >= 2) return '😐';
    return '☹️';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      default:
        return '→';
    }
  };

  if (loading) {
    return <div>Loading wellness tracking...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <Tabs defaultValue="overview" onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold">Wellness Tracking</h2>
              <p className="text-sm text-muted-foreground">
                Monitor well-being and daily activities
              </p>
            </div>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="mood">Mood</TabsTrigger>
              <TabsTrigger value="sleep">Sleep</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <div className="grid grid-cols-2 gap-4 mb-6">
              {metrics && (
                <>
                  <Card className="p-4">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      <h3 className="font-medium">Current Mood</h3>
                    </div>
                    <div className="mt-2">
                      <span className="text-2xl">
                        {getMoodEmoji(metrics.mood.current)}
                      </span>
                      <span className="ml-2">
                        {getTrendIcon(metrics.mood.trend)}
                      </span>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center space-x-2">
                      <Moon className="h-5 w-5 text-blue-500" />
                      <h3 className="font-medium">Sleep Quality</h3>
                    </div>
                    <div className="mt-2">
                      <span className="text-2xl">
                        {metrics.sleep.averageHours}hrs
                      </span>
                      <Badge className="ml-2" variant="outline">
                        {metrics.sleep.pattern}
                      </Badge>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-green-500" />
                      <h3 className="font-medium">Physical Activity</h3>
                    </div>
                    <div className="mt-2">
                      <span className="text-2xl">
                        {metrics.physicalActivity.minutesPerDay}min
                      </span>
                      <Badge className="ml-2" variant="outline">
                        {metrics.physicalActivity.intensity}
                      </Badge>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-purple-500" />
                      <h3 className="font-medium">Social Engagement</h3>
                    </div>
                    <div className="mt-2">
                      <span className="text-2xl">
                        {metrics.socialEngagement.eventsAttended}
                      </span>
                      <span className="text-sm ml-2">events this week</span>
                    </div>
                  </Card>
                </>
              )}
            </div>

            <div className="h-[300px] mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={wellnessData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="#ef4444"
                    name="Mood"
                  />
                  <Line
                    type="monotone"
                    dataKey="sleep"
                    stroke="#3b82f6"
                    name="Sleep"
                  />
                  <Line
                    type="monotone"
                    dataKey="physicalActivity"
                    stroke="#22c55e"
                    name="Activity"
                  />
                  <Line
                    type="monotone"
                    dataKey="socialEngagement"
                    stroke="#a855f7"
                    name="Social"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="mood">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Mood Tracking</h3>
              {metrics && (
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Daily Mood Log</h4>
                    <ScrollArea className="h-[300px]">
                      {wellnessData.map((data, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-2 border-b"
                        >
                          <span>{data.date}</span>
                          <span className="text-2xl">
                            {getMoodEmoji(data.mood)}
                          </span>
                        </div>
                      ))}
                    </ScrollArea>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Mood Analysis</h4>
                    <div className="space-y-2">
                      <p>Average Mood: {metrics.mood.average.toFixed(1)}</p>
                      <p>
                        Trend: {getTrendIcon(metrics.mood.trend)}
                        {metrics.mood.trend}
                      </p>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Similar detailed views for sleep, activity, and social tabs */}
        </Tabs>
      </Card>
    </div>
  );
};


