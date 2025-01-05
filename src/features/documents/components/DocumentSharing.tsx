import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Document, DocumentShare, Staff } from '@prisma/client';
import { useSession } from 'next-auth/react';
import {
  Share2,
  Link,
  Mail,
  Shield,
  Users,
  Clock,
  Trash2,
  Copy,
  Eye,
  Edit2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog/Dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select/Select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/Badge/Badge';
import { Input } from '@/components/ui/Input/Input';
import { Label } from '@/components/ui/label';
import { ShareAnalytics } from './ShareAnalytics';
import { ShareNotifications } from './ShareNotifications';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

interface DocumentSharingProps {
  documentId: string;
}

interface ShareWithStaff extends DocumentShare {
  staff: Staff;
}

export default function DocumentSharing({ documentId }: DocumentSharingProps) {
  const { t } = useTranslation('documents');
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<'VIEW' | 'EDIT'>('VIEW');
  const [expiryDays, setExpiryDays] = useState('7');

  // Fetch share settings
  const { data: shares, isLoading } = useQuery<ShareWithStaff[]>({
    queryKey: ['documentShares', documentId],
    queryFn: async () => {
      const response = await fetch(`/api/documents/${documentId}/shares`);
      if (!response.ok) throw new Error('Failed to fetch shares');
      return response.json();
    },
    enabled: !!session && !!documentId,
  });

  // Fetch available staff
  const { data: availableStaff } = useQuery<Staff[]>({
    queryKey: ['staffMembers'],
    queryFn: async () => {
      const response = await fetch('/api/staff');
      if (!response.ok) throw new Error('Failed to fetch staff');
      return response.json();
    },
    enabled: showShareDialog,
  });

  // Share with staff mutation
  const shareWithStaffMutation = useMutation({
    mutationFn: async ({
      staffId,
      permission,
    }: {
      staffId: string;
      permission: 'VIEW' | 'EDIT';
    }) => {
      const response = await fetch(`/api/documents/${documentId}/shares`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId, permission }),
      });
      if (!response.ok) throw new Error('Failed to share document');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentShares', documentId] });
      setShowShareDialog(false);
      toast({
        title: t('sharing.shareSuccess'),
      });
    },
    onError: () => {
      toast({
        title: t('sharing.shareError'),
        variant: 'destructive',
      });
    },
  });

  // Create share link mutation
  const createLinkMutation = useMutation({
    mutationFn: async ({
      permission,
      expiresIn,
    }: {
      permission: 'VIEW' | 'EDIT';
      expiresIn: number;
    }) => {
      const response = await fetch(`/api/documents/${documentId}/share-links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permission, expiresIn }),
      });
      if (!response.ok) throw new Error('Failed to create share link');
      return response.json();
    },
    onSuccess: (data) => {
      navigator.clipboard.writeText(data.url);
      setShowLinkDialog(false);
      toast({
        title: t('sharing.linkCreated'),
        description: t('sharing.linkCopied'),
      });
    },
    onError: () => {
      toast({
        title: t('sharing.linkError'),
        variant: 'destructive',
      });
    },
  });

  // Remove share mutation
  const removeShareMutation = useMutation({
    mutationFn: async (shareId: string) => {
      const response = await fetch(`/api/documents/${documentId}/shares/${shareId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove share');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentShares', documentId] });
      toast({
        title: t('sharing.removeSuccess'),
      });
    },
    onError: () => {
      toast({
        title: t('sharing.removeError'),
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="sharing">
        <TabsList>
          <TabsTrigger value="sharing">{t('sharing.sharing')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('sharing.notifications')}</TabsTrigger>
          <TabsTrigger value="analytics">{t('sharing.analytics')}</TabsTrigger>
        </TabsList>

        <TabsContent value="sharing">
          <div className="space-y-6">
            {/* Share Actions */}
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => setShowShareDialog(true)}>
                <Users className="h-4 w-4 mr-2" />
                {t('sharing.shareWithStaff')}
              </Button>
              <Button variant="outline" onClick={() => setShowLinkDialog(true)}>
                <Link className="h-4 w-4 mr-2" />
                {t('sharing.createLink')}
              </Button>
            </div>

            {/* Shares Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('sharing.sharedWith')}</TableHead>
                    <TableHead>{t('sharing.permission')}</TableHead>
                    <TableHead>{t('sharing.expires')}</TableHead>
                    <TableHead className="text-right">{t('sharing.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shares?.map((share) => (
                    <TableRow key={share.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {share.type === 'STAFF' ? (
                            <>
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{share.staff.name}</span>
                            </>
                          ) : (
                            <>
                              <Link className="h-4 w-4 text-muted-foreground" />
                              <span>{t('sharing.shareLink')}</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={share.permission === 'EDIT' ? 'default' : 'secondary'}
                        >
                          {share.permission === 'EDIT' ? (
                            <Edit2 className="h-3 w-3 mr-1" />
                          ) : (
                            <Eye className="h-3 w-3 mr-1" />
                          )}
                          {t(`sharing.permission.${share.permission.toLowerCase()}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {share.expiresAt ? (
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {format(new Date(share.expiresAt), 'PPp')}
                            </span>
                          </div>
                        ) : (
                          <Badge variant="outline">
                            <Shield className="h-3 w-3 mr-1" />
                            {t('sharing.neverExpires')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeShareMutation.mutate(share.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Share with Staff Dialog */}
            <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('sharing.shareWithStaff')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('sharing.selectStaff')}</Label>
                    <Select
                      onValueChange={(staffId) =>
                        shareWithStaffMutation.mutate({
                          staffId,
                          permission: selectedPermission,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('sharing.selectStaffPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStaff?.map((staff) => (
                          <SelectItem key={staff.id} value={staff.id}>
                            {staff.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('sharing.permission')}</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={selectedPermission === 'EDIT'}
                        onCheckedChange={(checked) =>
                          setSelectedPermission(checked ? 'EDIT' : 'VIEW')
                        }
                      />
                      <span>
                        {t(
                          `sharing.permission.${selectedPermission.toLowerCase()}`
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Create Share Link Dialog */}
            <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('sharing.createLink')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('sharing.permission')}</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={selectedPermission === 'EDIT'}
                        onCheckedChange={(checked) =>
                          setSelectedPermission(checked ? 'EDIT' : 'VIEW')
                        }
                      />
                      <span>
                        {t(
                          `sharing.permission.${selectedPermission.toLowerCase()}`
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('sharing.expiryDays')}</Label>
                    <Input
                      type="number"
                      min="1"
                      value={expiryDays}
                      onChange={(e) => setExpiryDays(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={() =>
                      createLinkMutation.mutate({
                        permission: selectedPermission,
                        expiresIn: parseInt(expiryDays) * 24 * 60 * 60 * 1000, // Convert days to milliseconds
                      })
                    }
                  >
                    <Link className="h-4 w-4 mr-2" />
                    {t('sharing.generateLink')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <ShareNotifications limit={10} />
        </TabsContent>

        <TabsContent value="analytics">
          <ShareAnalytics documentId={documentId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}


