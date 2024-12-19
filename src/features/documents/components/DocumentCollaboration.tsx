import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  MessageSquare,
  Clock,
  Check,
  X,
  AlertTriangle,
  History,
  Lock,
  UserPlus,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  isPrivate: boolean;
  department?: string;
  role?: string;
}

interface DocumentVersion {
  id: string;
  version: number;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  changes: string;
}

interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  department: string;
  lastActive?: string;
  permission: 'VIEW' | 'COMMENT' | 'EDIT' | 'ADMIN';
}

interface DocumentCollaborationProps {
  documentId: string;
  currentUserId: string;
  userPermission: 'VIEW' | 'COMMENT' | 'EDIT' | 'ADMIN';
}

export function DocumentCollaboration({
  documentId,
  currentUserId,
  userPermission,
}: DocumentCollaborationProps) {
  const { t } = useTranslation('documents');
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(false);

  // Fetch comments
  const { data: comments } = useQuery<Comment[]>({
    queryKey: ['document-comments', documentId],
    queryFn: async () => {
      const response = await fetch(`/api/documents/${documentId}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      return response.json();
    },
  });

  // Fetch version history
  const { data: versions } = useQuery<DocumentVersion[]>({
    queryKey: ['document-versions', documentId],
    queryFn: async () => {
      const response = await fetch(`/api/documents/${documentId}/versions`);
      if (!response.ok) throw new Error('Failed to fetch versions');
      return response.json();
    },
  });

  // Fetch collaborators
  const { data: collaborators } = useQuery<Collaborator[]>({
    queryKey: ['document-collaborators', documentId],
    queryFn: async () => {
      const response = await fetch(`/api/documents/${documentId}/collaborators`);
      if (!response.ok) throw new Error('Failed to fetch collaborators');
      return response.json();
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/documents/${documentId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment, isPrivate }),
      });
      if (!response.ok) throw new Error('Failed to add comment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-comments'] });
      setNewComment('');
      setIsPrivate(false);
      toast({
        title: t('collaboration.commentAdded'),
        description: t('collaboration.commentAddedDescription'),
      });
    },
  });

  // Update collaborator permission mutation
  const updatePermissionMutation = useMutation({
    mutationFn: async ({
      userId,
      permission,
    }: {
      userId: string;
      permission: string;
    }) => {
      const response = await fetch(
        `/api/documents/${documentId}/collaborators/${userId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ permission }),
        }
      );
      if (!response.ok) throw new Error('Failed to update permission');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-collaborators'] });
      toast({
        title: t('collaboration.permissionUpdated'),
        description: t('collaboration.permissionUpdatedDescription'),
      });
    },
  });

  return (
    <div className="space-y-6">
      {/* Comments Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">
            {t('collaboration.comments')}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowVersionHistory(true)}
          >
            <History className="h-4 w-4 mr-2" />
            {t('collaboration.versionHistory')}
          </Button>
        </div>

        {/* Comment Input */}
        {userPermission !== 'VIEW' && (
          <div className="space-y-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={t('collaboration.addComment')}
              className="min-h-[100px]"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="form-checkbox"
                />
                <span className="text-sm text-muted-foreground">
                  {t('collaboration.privateComment')}
                </span>
              </label>
              <Button
                onClick={() => addCommentMutation.mutate()}
                disabled={!newComment.trim()}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {t('collaboration.postComment')}
              </Button>
            </div>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments?.map((comment) => (
            <div
              key={comment.id}
              className={cn(
                'p-4 rounded-lg border',
                comment.isPrivate && 'bg-muted/50'
              )}
            >
              <div className="flex items-start space-x-4">
                <Avatar>
                  <AvatarImage src={comment.userAvatar} />
                  <AvatarFallback>
                    {comment.userName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{comment.userName}</span>
                    {comment.role && (
                      <Badge variant="outline">{comment.role}</Badge>
                    )}
                    {comment.isPrivate && (
                      <Badge variant="secondary">
                        <Lock className="h-3 w-3 mr-1" />
                        {t('collaboration.private')}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(comment.createdAt), 'PPp')}
                  </p>
                  <p className="mt-2">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Version History Dialog */}
      <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('collaboration.versionHistory')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {versions?.map((version) => (
              <div
                key={version.id}
                className="p-4 rounded-lg border space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar>
                      <AvatarImage src={version.createdBy.avatar} />
                      <AvatarFallback>
                        {version.createdBy.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {t('collaboration.version')} {version.version}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t('collaboration.by')} {version.createdBy.name}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(version.createdAt), 'PPp')}
                  </p>
                </div>
                <p className="text-sm">{version.changes}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Collaborators Button */}
      <Button
        variant="outline"
        onClick={() => setShowCollaborators(true)}
        className="w-full"
      >
        <Users className="h-4 w-4 mr-2" />
        {t('collaboration.manageCollaborators')}
      </Button>

      {/* Collaborators Dialog */}
      <Dialog open={showCollaborators} onOpenChange={setShowCollaborators}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('collaboration.collaborators')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {collaborators?.map((collaborator) => (
              <div
                key={collaborator.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={collaborator.avatar} />
                    <AvatarFallback>
                      {collaborator.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{collaborator.name}</p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{collaborator.department}</span>
                      <span>•</span>
                      <span>{collaborator.role}</span>
                    </div>
                  </div>
                </div>
                {userPermission === 'ADMIN' && (
                  <Select
                    value={collaborator.permission}
                    onValueChange={(value) =>
                      updatePermissionMutation.mutate({
                        userId: collaborator.id,
                        permission: value,
                      })
                    }
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIEW">
                        {t('collaboration.permissions.view')}
                      </SelectItem>
                      <SelectItem value="COMMENT">
                        {t('collaboration.permissions.comment')}
                      </SelectItem>
                      <SelectItem value="EDIT">
                        {t('collaboration.permissions.edit')}
                      </SelectItem>
                      <SelectItem value="ADMIN">
                        {t('collaboration.permissions.admin')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


