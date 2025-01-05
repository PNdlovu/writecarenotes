/**
 * @writecarenotes.com
 * @fileoverview Blog offline synchronization hook
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Custom hook for managing offline data synchronization for blog posts.
 * Uses the enterprise-grade offline queue system for reliable sync.
 */

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useOfflineSync } from '@/lib/offline/hooks/useOfflineSync';
import type { Post, PostStatus } from '@/app/api/blog/types';

interface BlogPost extends Post {
  syncStatus: 'PENDING' | 'SYNCING' | 'SYNCED' | 'ERROR';
  lastSyncAttempt?: Date;
  syncError?: string;
  localUpdatedAt: Date;
}

export function useOfflineSync() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const { toast } = useToast();
  const { 
    isOnline, 
    isSyncing, 
    queueAction,
    syncNow,
    lastSyncTime 
  } = useOfflineSync({
    syncInterval: 30000, // Sync every 30 seconds when online
    maxRetries: 3,
  });

  useEffect(() => {
    // Attempt sync when we come online and have pending posts
    if (isOnline && posts.some(p => p.syncStatus === 'PENDING') && !isSyncing) {
      syncNow();
    }
  }, [isOnline, posts, isSyncing, syncNow]);

  const saveOffline = async (post: Partial<Post>) => {
    const newPost: BlogPost = {
      ...post,
      id: post.id || crypto.randomUUID(),
      syncStatus: 'PENDING',
      localUpdatedAt: new Date(),
    } as BlogPost;

    setPosts(prev => [...prev, newPost]);
    
    // Queue the post with medium priority
    queueAction('blog_post_update', {
      postId: newPost.id,
      post: newPost,
      timestamp: new Date().toISOString(),
    }, 1);

    toast({
      title: 'Post Saved Offline',
      description: isOnline 
        ? 'Post will be synced shortly'
        : 'Post will be synced when you are back online',
    });

    return newPost;
  };

  const getOffline = (id: string) => {
    return posts.find(p => p.id === id) || null;
  };

  const listOffline = (status?: PostStatus) => {
    if (status) {
      return posts.filter(p => p.status === status);
    }
    return posts;
  };

  return {
    isOnline,
    isSyncing,
    lastSyncTime,
    posts,
    saveOffline,
    getOffline,
    listOffline,
    syncNow,
  };
}