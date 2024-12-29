/**
 * @fileoverview Offline indicator component
 * @version 1.0.0
 * @created 2024-03-21
 */

'use client';

import React from 'react';
import { useOffline } from '../hooks/useOffline';
import { NetworkStatus, SyncStatus, StorageQuota } from '../types';

export interface OfflineIndicatorProps {
  className?: string;
  showStorageQuota?: boolean;
  showSyncStatus?: boolean;
  showServiceWorker?: boolean;
  onNetworkChange?: (status: NetworkStatus) => void;
  onSyncComplete?: (status: SyncStatus) => void;
  onStorageUpdate?: (quota: StorageQuota) => void;
}

export function OfflineIndicator({
  className = '',
  showStorageQuota = false,
  showSyncStatus = false,
  showServiceWorker = false,
  onNetworkChange,
  onSyncComplete,
  onStorageUpdate
}: OfflineIndicatorProps) {
  const { state, actions } = useOffline({
    onNetworkChange,
    onSyncComplete,
    onStorageUpdate
  });

  return (
    <div className={`offline-indicator ${className}`}>
      {/* Network Status */}
      <div className="offline-indicator__network">
        <div className={`offline-indicator__status ${state.isOnline ? 'online' : 'offline'}`}>
          <span className="offline-indicator__icon">
            {state.isOnline ? '🟢' : '🔴'}
          </span>
          <span className="offline-indicator__text">
            {state.isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Sync Status */}
      {showSyncStatus && (
        <div className="offline-indicator__sync">
          {state.isSyncing ? (
            <div className="offline-indicator__syncing">
              <span className="offline-indicator__icon">🔄</span>
              <span className="offline-indicator__text">Syncing...</span>
            </div>
          ) : state.lastSyncStatus && (
            <div className="offline-indicator__last-sync">
              <span className="offline-indicator__icon">
                {state.lastSyncStatus.status === 'completed' ? '✅' : '⚠️'}
              </span>
              <span className="offline-indicator__text">
                {state.lastSyncStatus.status === 'completed'
                  ? `Synced (${state.lastSyncStatus.successCount} items)`
                  : 'Sync pending'}
              </span>
              {state.lastSyncStatus.failureCount > 0 && (
                <span className="offline-indicator__error">
                  {state.lastSyncStatus.failureCount} failed
                </span>
              )}
            </div>
          )}
          <button
            className="offline-indicator__sync-button"
            onClick={() => actions.sync()}
            disabled={!state.isOnline || state.isSyncing}
          >
            Sync Now
          </button>
        </div>
      )}

      {/* Storage Quota */}
      {showStorageQuota && state.storageQuota && (
        <div className="offline-indicator__storage">
          <div className="offline-indicator__quota">
            <div className="offline-indicator__quota-bar">
              <div
                className="offline-indicator__quota-fill"
                style={{ width: `${state.storageQuota.percentage}%` }}
              />
            </div>
            <div className="offline-indicator__quota-text">
              {Math.round(state.storageQuota.percentage)}% used
              ({formatBytes(state.storageQuota.used)} of {formatBytes(state.storageQuota.total)})
            </div>
          </div>
          <button
            className="offline-indicator__clear-button"
            onClick={() => actions.clearData()}
            disabled={state.isSyncing}
          >
            Clear Data
          </button>
        </div>
      )}

      {/* Service Worker Status */}
      {showServiceWorker && (
        <div className="offline-indicator__service-worker">
          <div className="offline-indicator__sw-status">
            {state.serviceWorkerStatus.active ? (
              <span className="offline-indicator__sw-active">
                <span className="offline-indicator__icon">✅</span>
                <span className="offline-indicator__text">Service Worker Active</span>
              </span>
            ) : state.serviceWorkerStatus.installing ? (
              <span className="offline-indicator__sw-installing">
                <span className="offline-indicator__icon">🔄</span>
                <span className="offline-indicator__text">Installing Service Worker...</span>
              </span>
            ) : (
              <span className="offline-indicator__sw-inactive">
                <span className="offline-indicator__icon">⚠️</span>
                <span className="offline-indicator__text">Service Worker Inactive</span>
              </span>
            )}
          </div>
          {state.serviceWorkerStatus.waiting && (
            <button
              className="offline-indicator__update-button"
              onClick={() => actions.updateServiceWorker()}
            >
              Update Available
            </button>
          )}
        </div>
      )}

      <style jsx>{`
        .offline-indicator {
          font-family: var(--font-sans);
          font-size: 0.875rem;
          line-height: 1.25rem;
          color: var(--text-primary);
          background: var(--background-secondary);
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .offline-indicator__network {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .offline-indicator__status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
        }

        .offline-indicator__status.online {
          background: var(--success-light);
          color: var(--success-dark);
        }

        .offline-indicator__status.offline {
          background: var(--error-light);
          color: var(--error-dark);
        }

        .offline-indicator__sync {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .offline-indicator__syncing,
        .offline-indicator__last-sync {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .offline-indicator__error {
          color: var(--error);
          font-size: 0.75rem;
        }

        .offline-indicator__storage {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .offline-indicator__quota {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .offline-indicator__quota-bar {
          width: 100%;
          height: 0.5rem;
          background: var(--background-tertiary);
          border-radius: 0.25rem;
          overflow: hidden;
        }

        .offline-indicator__quota-fill {
          height: 100%;
          background: var(--primary);
          transition: width 0.3s ease;
        }

        .offline-indicator__quota-text {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .offline-indicator__service-worker {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .offline-indicator__sw-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        button {
          padding: 0.25rem 0.75rem;
          border-radius: 0.25rem;
          border: 1px solid var(--border-color);
          background: var(--background-primary);
          color: var(--text-primary);
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        button:hover:not(:disabled) {
          background: var(--background-secondary);
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .offline-indicator__update-button {
          background: var(--primary);
          color: white;
          border: none;
        }

        .offline-indicator__update-button:hover {
          background: var(--primary-dark);
        }
      `}</style>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
