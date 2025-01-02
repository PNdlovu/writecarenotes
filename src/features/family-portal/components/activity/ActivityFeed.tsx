/**
 * @fileoverview Real-time Activity Feed
 * @version 1.0.0
 * @created 2024-12-12
 * @copyright Phibu Cloud Solutions Ltd
 */

import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/Button/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { 
  Heart,
  Calendar,
  Utensils,
  Activity,
  Music,
  Users,
  MessageSquare,
  Coffee,
} from 'lucide-react';

interface ActivityEvent {
  id: string;
  type: 'medical' | 'social' | 'care' | 'visit' | 'meal' | 'activity';
  title: string;
  description: string;
  timestamp: Date;
  staff?: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  metadata?: Record<string, any>;
}

interface ActivityFeedProps {
  residentId: string;
  filter?: string[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  residentId,
  filter,
}) => {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
    subscribeToActivities();
  }, [residentId, filter]);

  const fetchActivities = async () => {
    try {
      const response = await fetch(`/api/activities/${residentId}?${
        filter ? `filter=${filter.join(',')}` : ''
      }`);
      
      if (!response.ok) throw new Error('Failed to fetch activities');
      
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToActivities = () => {
    const eventSource = new EventSource(
      `/api/activities/subscribe?residentId=${residentId}`
    );

    eventSource.onmessage = (event) => {
      const newActivity = JSON.parse(event.data);
      setActivities(prev => [newActivity, ...prev]);
    };

    return () => eventSource.close();
  };

  const getActivityIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'medical':
        return <Heart className="h-4 w-4" />;
      case 'social':
        return <Users className="h-4 w-4" />;
      case 'care':
        return <Activity className="h-4 w-4" />;
      case 'visit':
        return <Calendar className="h-4 w-4" />;
      case 'meal':
        return <Utensils className="h-4 w-4" />;
      case 'activity':
        return <Music className="h-4 w-4" />;
      default:
        return <Coffee className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const timestamp = new Date(date);
    const diffMinutes = Math.floor((now.getTime() - timestamp.getTime()) / 60000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return timestamp.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div>Loading activity feed...</div>;
  }

  return (
    <Card className="p-4">
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Activity Feed</h2>
            <p className="text-sm text-muted-foreground">
              Real-time updates and activities
            </p>
          </div>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="medical">Medical</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="care">Care</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all">
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-4 border-b pb-4"
                >
                  <div className="flex-shrink-0">
                    <Badge
                      variant="outline"
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                    >
                      {getActivityIcon(activity.type)}
                    </Badge>
                  </div>

                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{activity.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                    </div>

                    {activity.staff && (
                      <div className="mt-2 flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={activity.staff.avatar} />
                          <AvatarFallback>
                            {activity.staff.name
                              .split(' ')
                              .map(n => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-sm">
                          <span className="font-medium">
                            {activity.staff.name}
                          </span>
                          <span className="text-muted-foreground">
                            {' '}
                            · {activity.staff.role}
                          </span>
                        </div>
                      </div>
                    )}

                    {activity.metadata?.photos && (
                      <div className="mt-2 flex space-x-2">
                        {activity.metadata.photos.map((photo: string, i: number) => (
                          <img
                            key={i}
                            src={photo}
                            alt=""
                            className="h-20 w-20 object-cover rounded"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="medical">
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {activities
                .filter(a => a.type === 'medical')
                .map(activity => (
                  // Same activity item structure as above
                  <div key={activity.id}>...</div>
                ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Similar TabsContent for other categories */}
      </Tabs>

      <div className="mt-4 flex justify-between items-center">
        <Button variant="outline" size="sm">
          <MessageSquare className="h-4 w-4 mr-2" />
          Add Note
        </Button>
        <Button variant="outline" size="sm">
          Export Activity Log
        </Button>
      </div>
    </Card>
  );
};


