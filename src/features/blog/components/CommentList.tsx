/**
 * @writecarenotes.com
 * @fileoverview Blog comment list component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Component for displaying blog post comments with moderation controls
 * and user interactions.
 */

import React from 'react';
import { Comment } from '@/app/api/blog/types';
import { useLocalization } from '@/hooks/useLocalization';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar';
import { Separator } from '@/components/ui/Separator';
import { MessageCircle, Flag, Trash2 } from 'lucide-react';

interface CommentListProps {
  comments: Comment[];
  postId: string;
  currentUserId?: string;
  isAdmin?: boolean;
  onDelete?: (commentId: string) => Promise<void>;
  onReport?: (commentId: string) => Promise<void>;
  onModerate?: (commentId: string, status: 'APPROVED' | 'REJECTED') => Promise<void>;
}

export const CommentList: React.FC<CommentListProps> = ({
  comments,
  postId,
  currentUserId,
  isAdmin = false,
  onDelete,
  onReport,
  onModerate,
}) => {
  const { formatDate } = useLocalization();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">
        Comments ({comments.length})
      </h3>

      {comments.length === 0 ? (
        <p className="text-gray-500">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <div
              key={comment.id}
              className="bg-white rounded-lg shadow p-4"
            >
              {/* Author Info */}
              <div className="flex items-center gap-2 mb-2">
                {comment.author.avatar && (
                  <Avatar className="w-8 h-8 rounded-full">
                    <AvatarImage src={comment.author.avatar} />
                    <AvatarFallback />
                  </Avatar>
                )}
                <div>
                  <div className="font-medium">
                    {comment.author.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(comment.createdAt)}
                  </div>
                </div>
              </div>

              {/* Comment Content */}
              <CardContent className="text-gray-700 mb-4">
                {comment.content}
              </CardContent>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Reply Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Reply
                </Button>

                {/* Report Button (if not own comment) */}
                {currentUserId !== comment.author.id && onReport && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-red-600"
                    onClick={() => onReport(comment.id)}
                  >
                    <Flag className="w-4 h-4 mr-1" />
                    Report
                  </Button>
                )}

                {/* Delete Button (if own comment or admin) */}
                {(currentUserId === comment.author.id || isAdmin) && onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-red-600"
                    onClick={() => onDelete(comment.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                )}
              </div>

              {/* Moderation Controls (admin only) */}
              {isAdmin && comment.status === 'PENDING' && onModerate && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 hover:bg-green-50"
                      onClick={() => onModerate(comment.id, 'APPROVED')}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => onModerate(comment.id, 'REJECTED')}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 