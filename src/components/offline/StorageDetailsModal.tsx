/**
 * @writecarenotes.com
 * @fileoverview Storage details modal component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Modal component that displays detailed information about
 * offline storage usage, including data types, sizes, and
 * last modified times. Provides options to manage stored data.
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Database, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';

interface StorageDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface StorageItem {
  id: string;
  type: string;
  size: number;
  timestamp: number;
  status: 'synced' | 'pending' | 'error';
}

export function StorageDetailsModal({ open, onOpenChange }: StorageDetailsModalProps) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<StorageItem[]>([]);
  const [storageInfo, setStorageInfo] = useState({
    used: 0,
    quota: 0,
    itemCount: 0,
    lastUpdated: new Date()
  });

  useEffect(() => {
    if (open) {
      loadStorageDetails();
    }
  }, [open]);

  const loadStorageDetails = async () => {
    setLoading(true);
    try {
      // Get storage estimate
      const estimate = await navigator.storage.estimate();
      
      // Open IndexedDB
      const db = await openDB();
      
      // Get items from offline store
      const tx = db.transaction(['offlineStore', 'syncQueue'], 'readonly');
      const offlineStore = tx.objectStore('offlineStore');
      const syncQueue = tx.objectStore('syncQueue');
      
      const [offlineItems, syncItems] = await Promise.all([
        offlineStore.getAll(),
        syncQueue.getAll()
      ]);

      // Process items
      const processedItems: StorageItem[] = [
        ...offlineItems.map(item => ({
          id: item.id,
          type: item.type,
          size: new Blob([JSON.stringify(item.data)]).size,
          timestamp: item.timestamp,
          status: 'synced' as const
        })),
        ...syncItems.map(item => ({
          id: item.url,
          type: 'pending-sync',
          size: new Blob([item.body]).size,
          timestamp: item.timestamp,
          status: 'pending' as const
        }))
      ];

      setItems(processedItems);
      setStorageInfo({
        used: estimate.usage || 0,
        quota: estimate.quota || 0,
        itemCount: processedItems.length,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Failed to load storage details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearType = async (type: string) => {
    if (!confirm(`Are you sure you want to clear all ${type} data?`)) {
      return;
    }

    try {
      const db = await openDB();
      const tx = db.transaction('offlineStore', 'readwrite');
      const store = tx.objectStore('offlineStore');
      
      // Get all items of this type
      const items = await store.getAll();
      const itemsToDelete = items.filter(item => item.type === type);
      
      // Delete items
      await Promise.all(
        itemsToDelete.map(item => store.delete(item.id))
      );
      
      // Reload details
      await loadStorageDetails();
    } catch (error) {
      console.error(`Failed to clear ${type} data:`, error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getStoragePercentage = () => {
    return Math.round((storageInfo.used / storageInfo.quota) * 100);
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = {
        count: 0,
        size: 0,
        items: []
      };
    }
    acc[item.type].count++;
    acc[item.type].size += item.size;
    acc[item.type].items.push(item);
    return acc;
  }, {} as Record<string, { count: number; size: number; items: StorageItem[] }>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Storage Details</span>
          </DialogTitle>
          <DialogDescription>
            Manage your offline storage and view detailed usage information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Storage Overview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Storage Usage</span>
              <span className="text-sm text-muted-foreground">
                {formatBytes(storageInfo.used)} / {formatBytes(storageInfo.quota)}
              </span>
            </div>
            <Progress value={getStoragePercentage()} className="h-2" />
            {getStoragePercentage() > 90 && (
              <div className="flex items-center space-x-1 text-xs text-amber-500">
                <AlertTriangle className="w-4 h-4" />
                <span>Storage almost full</span>
              </div>
            )}
          </div>

          {/* Storage Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Total Items</span>
              <p className="text-2xl font-semibold">{storageInfo.itemCount}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Types</span>
              <p className="text-2xl font-semibold">{Object.keys(groupedItems).length}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Last Updated</span>
              <p className="text-sm">
                {formatDistanceToNow(storageInfo.lastUpdated, { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Storage Details Table */}
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(groupedItems).map(([type, data]) => (
                  <TableRow key={type}>
                    <TableCell className="font-medium">{type}</TableCell>
                    <TableCell>{data.count}</TableCell>
                    <TableCell>{formatBytes(data.size)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleClearType(type)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadStorageDetails}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="ml-2">Refresh</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Open IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('writecarenotes-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create offline store
      if (!db.objectStoreNames.contains('offlineStore')) {
        db.createObjectStore('offlineStore', { keyPath: 'id' });
      }
      
      // Create sync queue store
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'timestamp' });
      }
    };
  });
} 