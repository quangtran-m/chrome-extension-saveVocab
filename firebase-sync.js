// Firebase Sync Manager (REST API Version) - Always Enabled
class FirebaseSync {
  constructor() {
    this.isAuthenticated = false;
    this.currentUser = null;
    this.syncEnabled = true; // Always enabled
    this.lastSyncTime = null;
    this.pollingInterval = null;
    this.firebaseREST = null;
    this.init();
  }

  async init() {
    try {
      await window.firebaseConfig.initFirebase();
      this.firebaseREST = window.firebaseConfig.getFirebaseREST();
      
      // Always try to authenticate
      await this.authenticate();
      
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
    console.log("🔄 Updating sync status...");
    
    const uploadButton = document.getElementById('uploadButton');
    const downloadButton = document.getElementById('downloadButton');
    const syncStatusButton = document.getElementById('syncStatusButton');
    const toolbar = document.getElementById('jp-vocab-toolbar');
    
    // Debug toolbar visibility
    console.log("🔍 UI Elements check:", {
      toolbar: !!toolbar,
      toolbarVisible: toolbar ? toolbar.offsetParent !== null : false,
      uploadButton: !!uploadButton,
      downloadButton: !!downloadButton,
      syncStatusButton: !!syncStatusButton,
      isAuthenticated: this.isAuthenticated
    });
    
    // Ensure toolbar is visible
    if (toolbar && toolbar.offsetParent === null) {
      console.warn("⚠️ Toolbar is hidden, forcing visibility...");
      toolbar.style.display = 'flex';
      toolbar.style.visibility = 'visible';
    }
    
    if (this.isAuthenticated) {
      // Enable menu items
      if (uploadButton) {
        uploadButton.style.opacity = '1';
        uploadButton.disabled = false;
      }
      if (downloadButton) {
        downloadButton.style.opacity = '1';
        downloadButton.disabled = false;
      }
      
      // Update main status button
      if (syncStatusButton) {
        syncStatusButton.textContent = '🔄 Connected';
        syncStatusButton.style.background = '#4CAF50';
        syncStatusButton.title = 'Firebase connected - Click for sync info';
      }
      
      console.log("✅ UI updated for authenticated state");
    } else {
      // Disable menu items
      if (uploadButton) {
        uploadButton.style.opacity = '0.5';
        uploadButton.disabled = true;
      }
      if (downloadButton) {
        downloadButton.style.opacity = '0.5';
        downloadButton.disabled = true;
      }
      
      // Update main status button
      if (syncStatusButton) {
        syncStatusButton.textContent = '🔄 Offline';
        syncStatusButton.style.background = '#757575';
        syncStatusButton.title = 'Firebase disconnected - Check your connection';
      }
      
      console.log("⚠️ UI updated for offline state");
    }
  }

  // Show detailed sync information
  async showSyncInfo() {
    const { words = [] } = await chrome.storage.local.get('words');
    const { lastSyncTime } = await chrome.storage.local.get('lastSyncTime');
    const deviceId = await this.getDeviceId();
    
    const lastSyncText = lastSyncTime 
      ? new Date(lastSyncTime).toLocaleString()
      : 'Chưa đồng bộ';
    
    const statusMessage = `
📊 Thông tin đồng bộ:
• Trạng thái: ${this.isAuthenticated ? '🟢 Kết nối' : '🔴 Offline'}
• Từ vựng local: ${words.length} từ
• Lần sync cuối: ${lastSyncText}
• Device ID: ${deviceId.substring(0, 12)}...
• Auto-sync: ${this.syncEnabled ? '✅ Bật' : '❌ Tắt'}
    `.trim();
    
    this.showSyncStatus(statusMessage, 'info');
    
    // Also log to console
    console.log('📊 Sync Info:', {
      authenticated: this.isAuthenticated,
      wordsCount: words.length,
      lastSyncTime: lastSyncTime,
      deviceId: deviceId,
      syncEnabled: this.syncEnabled
    });
  }

  // Show sync status message
  showSyncStatus(message, type = 'info') {
    // Remove existing status message
    const existing = document.getElementById('syncStatus');
    if (existing) existing.remove();
    
    const statusDiv = document.createElement('div');
    statusDiv.id = 'syncStatus';
    
    // Handle multi-line messages
    if (message.includes('\n')) {
      statusDiv.innerHTML = message.replace(/\n/g, '<br>');
    } else {
      statusDiv.textContent = message;
    }
    
    statusDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 16px;
      border-radius: 8px;
      color: white;
      font-family: monospace;
      font-size: 12px;
      z-index: 1000001;
      max-width: 350px;
      white-space: pre-line;
      line-height: 1.4;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
    `;
    
    document.body.appendChild(statusDiv);
    
    // Auto remove after 8 seconds for longer messages
    const timeout = message.length > 100 ? 8000 : 4000;
    setTimeout(() => {
      if (statusDiv.parentNode) {
        statusDiv.remove();
      }
    }, timeout);
  }

  // Force sync (not needed anymore but keeping for compatibility)
  async forceSync() {
    if (!this.isAuthenticated) {
      this.showSyncStatus('🔴 Chưa kết nối Firebase', 'error');
      return;
    }
    
    this.showSyncStatus('🔄 Đang đồng bộ...', 'info');
    await this.uploadToFirebase();
    await this.downloadFromFirebase();
  }
}

// Initialize Firebase Sync - Always enabled
window.firebaseSync = new FirebaseSync();