import { useTranslation } from 'next-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { DocumentShare, Notification } from '@prisma/client';
import { useSession } from 'next-auth/react';
import {
  Bell,
  Share2,
  Eye,
  Edit2,
  Clock,
  Check,
  X,
  ExternalLink,
  Shield,
  AlertTriangle,
  Clipboard,
  Calendar,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/router';
import { Select } from '@/components/ui/select';

interface ShareNotificationsProps {
  limit?: number;
}

interface Notification {
  id: string;
  type: 'SHARE' | 'VIEW' | 'EXPIRY' | 'COMPLIANCE' | 'CRITICAL' | 'INSPECTION';
  documentId: string;
  documentName: string;
  message: string;
  timestamp: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  read: boolean;
  metadata?: {
    expiryDate?: string;
    complianceThreshold?: number;
    criticalityLevel?: string;
    department?: string;
    region?: 'england' | 'wales' | 'scotland' | 'dublin' | 'belfast';
    regulator?: 'CQC' | 'CIW' | 'CI' | 'HIQA' | 'RQIA';
    inspectionDate?: string;
    inspectionType?: 'scheduled' | 'unannounced' | 'followup';
  };
}

interface ShareNotification extends Notification {
  share: DocumentShare & {
    document: {
      id: string;
      title: string;
    };
  };
}

export default function ShareNotifications({ limit = 5 }: ShareNotificationsProps) {
  const { t } = useTranslation('documents');
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const router = useRouter();

  // Fetch notifications
  const { data: notifications, isLoading } = useQuery<ShareNotification[]>({
    queryKey: ['shareNotifications'],
    queryFn: async () => {
      const response = await fetch('/api/notifications/shares');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    },
    enabled: !!session,
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to mark notification as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shareNotifications'] });
    },
  });

  // Accept share mutation
  const acceptShareMutation = useMutation({
    mutationFn: async (shareId: string) => {
      const response = await fetch(`/api/documents/shares/${shareId}/accept`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to accept share');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shareNotifications'] });
      toast({
        title: t('sharing.acceptSuccess'),
        description: t('sharing.accessGranted'),
      });
    },
    onError: () => {
      toast({
        title: t('sharing.acceptError'),
        variant: 'destructive',
      });
    },
  });

  // Decline share mutation
  const declineShareMutation = useMutation({
    mutationFn: async (shareId: string) => {
      const response = await fetch(`/api/documents/shares/${shareId}/decline`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to decline share');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shareNotifications'] });
      toast({
        title: t('sharing.declineSuccess'),
      });
    },
    onError: () => {
      toast({
        title: t('sharing.declineError'),
        variant: 'destructive',
      });
    },
  });

  const handleNotificationClick = (notification: ShareNotification) => {
    markAsReadMutation.mutate(notification.id);
    router.push(`/documents/${notification.share.documentId}`);
  };

  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredNotifications = useMemo(() => {
    if (priorityFilter === 'all' && typeFilter === 'all') return notifications;
    return notifications.filter((notification) => {
      if (priorityFilter !== 'all' && notification.priority !== priorityFilter) return false;
      if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
      return true;
    });
  }, [notifications, priorityFilter, typeFilter]);

  const getPriorityVariant = (priority: 'LOW' | 'MEDIUM' | 'HIGH') => {
    switch (priority) {
      case 'LOW':
        return 'secondary';
      case 'MEDIUM':
        return 'warning';
      case 'HIGH':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getRegulatorBadgeColor = (regulator: string) => {
    switch (regulator) {
      case 'CQC': return 'bg-blue-100 text-blue-800';
      case 'CIW': return 'bg-green-100 text-green-800';
      case 'CI': return 'bg-purple-100 text-purple-800';
      case 'HIQA': return 'bg-orange-100 text-orange-800';
      case 'RQIA': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SHARE':
        return <Share2 className="h-5 w-5 text-primary" />;
      case 'VIEW':
        return <Eye className="h-5 w-5 text-primary" />;
      case 'EXPIRY':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'COMPLIANCE':
        return <Shield className="h-5 w-5 text-blue-500" />;
      case 'CRITICAL':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'INSPECTION':
        return <Clipboard className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-20 bg-gray-100" />
            <CardContent className="h-16 bg-gray-50" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex space-x-2">
        <Select
          value={priorityFilter}
          onValueChange={setPriorityFilter}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={t('notifications.filterByPriority')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('notifications.allPriorities')}</SelectItem>
            <SelectItem value="HIGH">{t('notifications.highPriority')}</SelectItem>
            <SelectItem value="MEDIUM">{t('notifications.mediumPriority')}</SelectItem>
            <SelectItem value="LOW">{t('notifications.lowPriority')}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={typeFilter}
          onValueChange={setTypeFilter}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={t('notifications.filterByType')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('notifications.allTypes')}</SelectItem>
            <SelectItem value="SHARE">{t('notifications.shareType')}</SelectItem>
            <SelectItem value="VIEW">{t('notifications.viewType')}</SelectItem>
            <SelectItem value="EXPIRY">{t('notifications.expiryType')}</SelectItem>
            <SelectItem value="COMPLIANCE">{t('notifications.complianceType')}</SelectItem>
            <SelectItem value="CRITICAL">{t('notifications.criticalType')}</SelectItem>
            <SelectItem value="INSPECTION">{t('notifications.inspectionType')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {filteredNotifications.map((notification) => (
          <Card
            key={notification.id}
            className={cn(
              'transition-colors hover:bg-muted/50',
              !notification.read && 'bg-primary/5'
            )}
          >
            <CardHeader className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium">
                    {getNotificationIcon(notification.type)}
                    <span className="ml-2">{notification.documentName}</span>
                  </CardTitle>
                  <CardDescription>
                    {notification.message}
                    {notification.metadata && (
                      <div className="mt-1 text-xs space-y-1">
                        {notification.metadata.region && notification.metadata.regulator && (
                          <Badge 
                            className={cn(
                              "mr-2",
                              getRegulatorBadgeColor(notification.metadata.regulator)
                            )}
                          >
                            {notification.metadata.regulator} - {t(`regions.${notification.metadata.region}`)}
                          </Badge>
                        )}
                        {notification.metadata.inspectionDate && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-purple-500" />
                            <span>
                              {t('notifications.inspection')}: {format(new Date(notification.metadata.inspectionDate), 'PP')}
                              {notification.metadata.inspectionType && (
                                <Badge variant="outline" className="ml-2">
                                  {t(`inspectionTypes.${notification.metadata.inspectionType}`)}
                                </Badge>
                              )}
                            </span>
                          </div>
                        )}
                        {notification.metadata.expiryDate && (
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-yellow-500" />
                            <span>
                              {t('notifications.expires')}: {format(new Date(notification.metadata.expiryDate), 'PP')}
                            </span>
                          </div>
                        )}
                        {notification.metadata.complianceThreshold && (
                          <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4 text-blue-500" />
                            <span>
                              {t('notifications.compliance')}: {notification.metadata.complianceThreshold}%
                            </span>
                          </div>
                        )}
                        {notification.metadata.criticalityLevel && (
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <span>
                              {t('notifications.criticality')}: {notification.metadata.criticalityLevel}
                            </span>
                          </div>
                        )}
                        {notification.metadata.department && (
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-green-500" />
                            <span>
                              {t('notifications.department')}: {notification.metadata.department}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={getPriorityVariant(notification.priority)}
                  >
                    {notification.priority}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsReadMutation.mutate(notification.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredNotifications.length === 0 && (
        <div className="text-center py-8">
          <Bell className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-2 text-sm font-semibold">
            {t('notifications.noNotifications')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('notifications.noNotificationsDescription')}
          </p>
        </div>
      )}
    </div>
  );
}


