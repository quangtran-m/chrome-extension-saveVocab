// Firebase Sync Manager (REST API Version)
class FirebaseSync {
  constructor() {
    this.isAuthenticated = false;
    this.currentUser = null;
    this.syncEnabled = false;
    this.lastSyncTime = null;
    this.pollingInterval = null;
    this.firebaseREST = null;
    this.init();
  }

  async init() {
    try {
      await window.firebaseConfig.initFirebase();
      this.firebaseREST = window.firebaseConfig.getFirebaseREST();
      
      // Check for stored sync preference
      const { syncEnabled = false } = await chrome.storage.local.get('syncEnabled');
      this.syncEnabled = syncEnabled;
      
      if (this.syncEnabled) {
        await this.authenticate();
      }
      
      this.updateSyncStatus();
      
    } catch (error) {
      console.error('Error initializing Firebase sync:', error);
    }
  }

  // Authenticate with Firebase
  async authenticate() {
    try {
      const success = await this.firebaseREST.signInAnonymously();
      if (success) {
        this.isAuthenticated = true;
        this.currentUser = { uid: this.firebaseREST.userId };
        this.setupPolling();
        console.log('Authentication successful');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error authenticating:', error);
      return false;
    }
  }

  // Sign out
  async signOut() {
    try {
      this.isAuthenticated = false;
      this.currentUser = null;
      this.syncEnabled = false;
      await chrome.storage.local.set({ syncEnabled: false });
      this.cleanup();
      console.log('Signed out successfully');
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      return false;
    }
  }

  // Enable/Disable Sync
  async toggleSync(enable) {
    if (enable && !this.isAuthenticated) {
      const success = await this.authenticate();
      if (!success) {
        this.showSyncStatus('Lỗi xác thực', 'error');
        return false;
      }
    }
    
    this.syncEnabled = enable;
    await chrome.storage.local.set({ syncEnabled: enable });
    
    if (enable && this.isAuthenticated) {
      await this.uploadToFirebase();
      this.setupPolling();
    } else {
      this.cleanup();
    }
    
    this.updateSyncStatus();
    return true;
  }

  // Upload local words to Firebase
  async uploadToFirebase() {
    if (!this.isAuthenticated || !this.syncEnabled) return;
    
    try {
      const { words = [] } = await chrome.storage.local.get('words');
      const deviceId = await this.getDeviceId();
      
      const data = {
        words: words,
        lastUpdated: Date.now(),
        deviceId: deviceId
      };
      
      const success = await this.firebaseREST.setData(`users/${this.currentUser.uid}/words`, data);
      
      if (success) {
        this.lastSyncTime = Date.now();
        await chrome.storage.local.set({ lastSyncTime: this.lastSyncTime });
        
        console.log('Words uploaded to Firebase successfully');
        this.showSyncStatus('Đồng bộ thành công', 'success');
      } else {
        throw new Error('Upload failed');
      }
      
    } catch (error) {
      console.error('Error uploading to Firebase:', error);
      this.showSyncStatus('Lỗi đồng bộ', 'error');
    }
  }

  // Download words from Firebase
  async downloadFromFirebase() {
    if (!this.isAuthenticated || !this.syncEnabled) return;
    
    try {
      const data = await this.firebaseREST.getData(`users/${this.currentUser.uid}/words`);
      
      if (data && data.words) {
        const { words: localWords = [] } = await chrome.storage.local.get('words');
        
        // Merge with local words (avoid duplicates)
        const mergedWords = Array.from(new Set([...localWords, ...data.words]));
        
        await chrome.storage.local.set({ 
          words: mergedWords,
          lastSyncTime: Date.now()
        });
        
        console.log('Words downloaded from Firebase successfully');
        this.showSyncStatus('Tải về thành công', 'success');
        
        // Trigger re-highlight
        if (window.highlightAll) {
          window.highlightAll();
        }
        
        return mergedWords;
      }
    } catch (error) {
      console.error('Error downloading from Firebase:', error);
      this.showSyncStatus('Lỗi tải về', 'error');
    }
  }

  // Setup polling for sync (replaces realtime sync)
  setupPolling() {
    if (!this.isAuthenticated || !this.syncEnabled) return;
    
    // Clear existing polling
    this.cleanup();
    
    // Poll every 10 seconds for changes
    this.pollingInterval = this.firebaseREST.startPolling(
      `users/${this.currentUser.uid}/words`, 
      async (data) => {
        if (data && data.words && data.deviceId !== await this.getDeviceId()) {
          // Data changed from another device
          const { words: localWords = [] } = await chrome.storage.local.get('words');
          const remoteWords = data.words;
          
          // Simple merge strategy - combine both arrays
          const mergedWords = Array.from(new Set([...localWords, ...remoteWords]));
          
          if (mergedWords.length !== localWords.length || 
              JSON.stringify(mergedWords.sort()) !== JSON.stringify(localWords.sort())) {
            await chrome.storage.local.set({ words: mergedWords });
            console.log('Words synced from another device');
            this.showSyncStatus('Đã đồng bộ từ thiết bị khác', 'info');
            
            // Trigger re-highlight
            if (window.highlightAll) {
              window.highlightAll();
            }
          }
        }
      }, 
      10000 // 10 seconds
    );
  }

  // Cleanup listeners
  cleanup() {
    if (this.pollingInterval) {
      this.firebaseREST.stopPolling(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Get unique device ID
  async getDeviceId() {
    let { deviceId } = await chrome.storage.local.get('deviceId');
    if (!deviceId) {
      deviceId = 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      await chrome.storage.local.set({ deviceId });
    }
    return deviceId;
  }

  // Update sync status in UI
  updateSyncStatus() {
    const syncButton = document.getElementById('syncButton');
    if (syncButton) {
      if (this.isAuthenticated && this.syncEnabled) {
        syncButton.textContent = '☁️ Sync On';
        syncButton.style.background = '#4CAF50';
      } else {
        syncButton.textContent = '☁️ Sync Off';
        syncButton.style.background = '#757575';
      }
    }
  }

  // Show sync status message
  showSyncStatus(message, type = 'info') {
    // Remove existing status message
    const existing = document.getElementById('syncStatus');
    if (existing) existing.remove();
    
    const statusDiv = document.createElement('div');
    statusDiv.id = 'syncStatus';
    statusDiv.textContent = message;
    statusDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 8px 16px;
      border-radius: 4px;
      color: white;
      font-family: sans-serif;
      font-size: 12px;
      z-index: 1000001;
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
    `;
    
    document.body.appendChild(statusDiv);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      if (statusDiv.parentNode) {
        statusDiv.remove();
      }
    }, 3000);
  }

  // Force sync
  async forceSync() {
    if (!this.isAuthenticated || !this.syncEnabled) {
      this.showSyncStatus('Sync chưa được bật', 'error');
      return;
    }
    
    this.showSyncStatus('Đang đồng bộ...', 'info');
    await this.uploadToFirebase();
    await this.downloadFromFirebase();
  }
}

// Initialize Firebase Sync
window.firebaseSync = new FirebaseSync();