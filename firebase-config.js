// Firebase Configuration - Using Environment Variables
let firebaseConfig = {
  // Default fallback values - will be replaced by .env values
  apiKey: "your_api_key_here",
  authDomain: "your-project-id.firebaseapp.com",
  databaseURL: "https://your-project-id-default-rtdb.region.firebasedatabase.app",
  projectId: "your-project-id",
  storageBucket: "your-project-id.firebasestorage.app",
  messagingSenderId: "your_sender_id",
  appId: "your_app_id"
};

// Initialize Firebase config from environment variables
async function initConfig() {
  try {
    if (window.envLoader) {
      firebaseConfig = await window.envLoader.getFirebaseConfig();
      console.log('Firebase config loaded from environment variables');
    }
  } catch (error) {
    console.warn('Failed to load environment config, using fallback:', error);
  }
}

// Use REST API instead of Firebase SDK to avoid CSP issues
class FirebaseREST {
  constructor() {
    this.authToken = null;
    this.userId = null;
  }

  get baseURL() {
    return firebaseConfig.databaseURL;
  }

  get apiKey() {
    return firebaseConfig.apiKey;
  }

  // Simple authentication using anonymous auth via REST API
  async signInAnonymously() {
    try {
      const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnSecureToken: true
        })
      });

      const data = await response.json();
      
      if (data.idToken) {
        this.authToken = data.idToken;
        this.userId = data.localId;
        console.log('Signed in anonymously via REST API');
        return true;
      }
      
      throw new Error(data.error?.message || 'Authentication failed');
    } catch (error) {
      console.error('Error signing in:', error);
      return false;
    }
  }

  // Upload data to Firebase Realtime Database
  async setData(path, data) {
    if (!this.authToken) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${this.baseURL}/${path}.json?auth=${this.authToken}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      return response.ok;
    } catch (error) {
      console.error('Error setting data:', error);
      return false;
    }
  }

  // Get data from Firebase Realtime Database
  async getData(path) {
    if (!this.authToken) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${this.baseURL}/${path}.json?auth=${this.authToken}`);
      
      if (response.ok) {
        return await response.json();
      }
      
      return null;
    } catch (error) {
      console.error('Error getting data:', error);
      return null;
    }
  }

  // Listen for changes (polling implementation)
  startPolling(path, callback, interval = 5000) {
    return setInterval(async () => {
      const data = await this.getData(path);
      callback(data);
    }, interval);
  }

  stopPolling(intervalId) {
    if (intervalId) {
      clearInterval(intervalId);
    }
  }
}

// Initialize Firebase REST client
const firebaseREST = new FirebaseREST();

// Initialize config and export
async function initFirebase() {
  await initConfig();
  return true;
}

// Export for use in other modules
window.firebaseConfig = {
  initFirebase,
  getFirebaseREST: () => firebaseREST,
  config: () => firebaseConfig,
  initConfig
};