/**
 * @writecarenotes.com
 * @fileoverview Real-time Notification Service
 * @version 1.0.0
 * @created 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { io, Socket } from 'socket.io-client';
import { OnCallRecord } from '../types/OnCallTypes';
import { EventEmitter } from 'events';

type NotificationCallback = (notification: OnCallNotification) => void;

export interface OnCallNotification {
    id: string;
    type: 'new-call' | 'update' | 'assignment' | 'escalation' | 'reminder';
    priority: 'urgent' | 'high' | 'medium' | 'low';
    title: string;
    message: string;
    timestamp: Date;
    metadata: {
        recordId?: string;
        careHomeId?: string;
        staffId?: string;
    };
}

class NotificationService extends EventEmitter {
    private static instance: NotificationService;
    private socket: Socket | null = null;
    private connected: boolean = false;
    private reconnectAttempts: number = 0;
    private readonly MAX_RECONNECT_ATTEMPTS = 5;
    private pendingNotifications: OnCallNotification[] = [];

    private constructor() {
        super();
        if ('Notification' in window) {
            Notification.requestPermission();
        }
    }

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    async connect(careHomeId: string, region: string): Promise<void> {
        if (this.socket) {
            this.socket.close();
        }

        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || '';
        this.socket = io(socketUrl, {
            query: {
                careHomeId,
                region
            },
            reconnection: true,
            reconnectionAttempts: this.MAX_RECONNECT_ATTEMPTS,
            reconnectionDelay: 1000,
        });

        this.setupSocketListeners();
    }

    private setupSocketListeners(): void {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            this.connected = true;
            this.reconnectAttempts = 0;
            this.processPendingNotifications();
        });

        this.socket.on('disconnect', () => {
            this.connected = false;
        });

        this.socket.on('notification', (notification: OnCallNotification) => {
            this.handleNotification(notification);
        });

        this.socket.on('record-update', (record: OnCallRecord) => {
            this.emit('record-update', record);
        });

        this.socket.on('error', (error: Error) => {
            console.error('Socket error:', error);
            this.reconnectAttempts++;
            if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
                this.fallbackToPolling();
            }
        });
    }

    private async handleNotification(notification: OnCallNotification): Promise<void> {
        if (!this.connected) {
            this.pendingNotifications.push(notification);
            return;
        }

        // Emit event for UI updates
        this.emit('notification', notification);

        // Show system notification if permitted
        if (Notification.permission === 'granted') {
            const systemNotification = new Notification(notification.title, {
                body: notification.message,
                icon: '/notification-icon.png', // Add your icon path
                tag: notification.id,
                requireInteraction: notification.priority === 'urgent'
            });

            systemNotification.onclick = () => {
                window.focus();
                this.emit('notification-click', notification);
            };
        }

        // Store notification for offline access
        await this.storeNotification(notification);
    }

    private async storeNotification(notification: OnCallNotification): Promise<void> {
        try {
            const request = indexedDB.open('notifications-db', 1);
            
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains('notifications')) {
                    db.createObjectStore('notifications', { keyPath: 'id' });
                }
            };

            request.onsuccess = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                const transaction = db.transaction(['notifications'], 'readwrite');
                const store = transaction.objectStore('notifications');
                store.add(notification);
            };
        } catch (error) {
            console.error('Failed to store notification:', error);
        }
    }

    private async processPendingNotifications(): Promise<void> {
        while (this.pendingNotifications.length > 0) {
            const notification = this.pendingNotifications.shift();
            if (notification) {
                await this.handleNotification(notification);
            }
        }
    }

    private fallbackToPolling(): void {
        // Implement polling mechanism as fallback
        const pollInterval = setInterval(async () => {
            try {
                const response = await fetch('/api/notifications/poll');
                const notifications = await response.json();
                notifications.forEach((notification: OnCallNotification) => {
                    this.handleNotification(notification);
                });
            } catch (error) {
                console.error('Polling failed:', error);
            }
        }, 30000); // Poll every 30 seconds

        // Store interval ID for cleanup
        this.emit('polling-started', pollInterval);
    }

    subscribe(callback: NotificationCallback): () => void {
        this.on('notification', callback);
        return () => this.off('notification', callback);
    }

    async markAsRead(notificationId: string): Promise<void> {
        if (this.socket && this.connected) {
            this.socket.emit('mark-read', notificationId);
        }
        // Update local storage
        try {
            const request = indexedDB.open('notifications-db', 1);
            request.onsuccess = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                const transaction = db.transaction(['notifications'], 'readwrite');
                const store = transaction.objectStore('notifications');
                store.delete(notificationId);
            };
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.connected = false;
        this.removeAllListeners();
    }
}
