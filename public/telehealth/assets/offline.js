/**
 * Write Care Notes - Offline Mode JavaScript
 * @version 1.0.0
 */

class OfflineManager {
  constructor() {
    this.db = null;
    this.syncQueue = document.getElementById('syncQueue');
    this.viewCachedBtn = document.getElementById('viewCached');
    this.createDraftBtn = document.getElementById('createDraft');

    this.init();
  }

  async init() {
    await this.openDatabase();
    this.attachEventListeners();
    this.updateSyncQueueUI();
    this.startNetworkListener();
  }

  async openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('TelehealthOfflineDB', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('offlineQueue')) {
          db.createObjectStore('offlineQueue', { keyPath: 'timestamp' });
        }
        if (!db.objectStoreNames.contains('cachedData')) {
          db.createObjectStore('cachedData', { keyPath: 'id' });
        }
      };
    });
  }

  attachEventListeners() {
    this.viewCachedBtn.addEventListener('click', () => this.viewCachedData());
    this.createDraftBtn.addEventListener('click', () => this.createDraft());

    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  startNetworkListener() {
    setInterval(() => {
      if (navigator.onLine && this.hasQueuedItems) {
        this.syncQueuedRequests();
      }
    }, 30000); // Check every 30 seconds
  }

  async viewCachedData() {
    try {
      const tx = this.db.transaction('cachedData', 'readonly');
      const store = tx.objectStore('cachedData');
      const data = await this.getAllFromStore(store);

      // Display cached data in a modal
      this.showDataModal(data);
    } catch (error) {
      console.error('Error viewing cached data:', error);
      this.showError('Unable to load cached data');
    }
  }

  async createDraft() {
    try {
      const draft = {
        id: `draft_${Date.now()}`,
        type: 'consultation',
        status: 'draft',
        createdAt: new Date().toISOString(),
        data: {}
      };

      const tx = this.db.transaction('cachedData', 'readwrite');
      const store = tx.objectStore('cachedData');
      await store.add(draft);

      this.showSuccess('Draft created successfully');
    } catch (error) {
      console.error('Error creating draft:', error);
      this.showError('Unable to create draft');
    }
  }

  async updateSyncQueueUI() {
    try {
      const tx = this.db.transaction('offlineQueue', 'readonly');
      const store = tx.objectStore('offlineQueue');
      const items = await this.getAllFromStore(store);

      if (items.length === 0) {
        this.syncQueue.innerHTML = '<p>No pending items</p>';
        return;
      }

      const html = items.map(item => `
        <div class="queue-item">
          <strong>${item.request.method}</strong> ${item.request.url}
          <small>${new Date(item.timestamp).toLocaleString()}</small>
        </div>
      `).join('');

      this.syncQueue.innerHTML = html;
      this.hasQueuedItems = items.length > 0;
    } catch (error) {
      console.error('Error updating sync queue UI:', error);
    }
  }

  async handleOnline() {
    document.body.classList.remove('offline');
    this.showSuccess('Back online!');
    await this.syncQueuedRequests();
  }

  handleOffline() {
    document.body.classList.add('offline');
    this.showError('You are offline');
  }

  async syncQueuedRequests() {
    try {
      const tx = this.db.transaction('offlineQueue', 'readwrite');
      const store = tx.objectStore('offlineQueue');
      const items = await this.getAllFromStore(store);

      for (const item of items) {
        try {
          await this.replayRequest(item.request);
          await store.delete(item.timestamp);
        } catch (error) {
          console.error('Error syncing request:', error);
        }
      }

      await this.updateSyncQueueUI();
    } catch (error) {
      console.error('Error syncing queued requests:', error);
    }
  }

  async replayRequest(serializedRequest) {
    const request = new Request(serializedRequest.url, {
      method: serializedRequest.method,
      headers: new Headers(serializedRequest.headers),
      body: serializedRequest.body,
      mode: serializedRequest.mode,
      credentials: serializedRequest.credentials,
      cache: serializedRequest.cache,
      redirect: serializedRequest.redirect,
      referrer: serializedRequest.referrer
    });

    const response = await fetch(request);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  }

  getAllFromStore(store) {
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  showDataModal(data) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h2>Cached Data</h2>
        <pre>${JSON.stringify(data, null, 2)}</pre>
        <button onclick="this.parentElement.parentElement.remove()">Close</button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new OfflineManager();
}); 