// Environment Variables Loader for Chrome Extension
// This script loads .env file and makes variables available

class EnvLoader {
  constructor() {
    this.envVars = {};
    this.loaded = false;
  }

  async loadEnv() {
    if (this.loaded) return this.envVars;

    try {
      // Try to load .env file
      const response = await fetch(chrome.runtime.getURL('.env'));
      const envText = await response.text();
      
      // Parse .env file
      const lines = envText.split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Skip comments and empty lines
        if (!trimmedLine || trimmedLine.startsWith('#')) continue;
        
        // Parse KEY=VALUE format
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          this.envVars[key.trim()] = value;
        }
      }
      
      this.loaded = true;
      console.log('Environment variables loaded successfully');
      
    } catch (error) {
      console.warn('Could not load .env file, using fallback config:', error);
      
      // Fallback configuration
      this.envVars = {
        FIREBASE_API_KEY: 'your_api_key_here',
        FIREBASE_AUTH_DOMAIN: 'your-project-id.firebaseapp.com',
        FIREBASE_DATABASE_URL: 'https://your-project-id-default-rtdb.region.firebasedatabase.app',
        FIREBASE_PROJECT_ID: 'your-project-id',
        FIREBASE_STORAGE_BUCKET: 'your-project-id.firebasestorage.app',
        FIREBASE_MESSAGING_SENDER_ID: 'your_sender_id',
        FIREBASE_APP_ID: 'your_app_id'
      };
      
      this.loaded = true;
    }
    
    return this.envVars;
  }

  getEnv(key, defaultValue = '') {
    return this.envVars[key] || defaultValue;
  }

  async getFirebaseConfig() {
    await this.loadEnv();
    
    return {
      apiKey: this.getEnv('FIREBASE_API_KEY'),
      authDomain: this.getEnv('FIREBASE_AUTH_DOMAIN'),
      databaseURL: this.getEnv('FIREBASE_DATABASE_URL'),
      projectId: this.getEnv('FIREBASE_PROJECT_ID'),
      storageBucket: this.getEnv('FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: this.getEnv('FIREBASE_MESSAGING_SENDER_ID'),
      appId: this.getEnv('FIREBASE_APP_ID')
    };
  }
}

// Export for use in other modules
window.envLoader = new EnvLoader();