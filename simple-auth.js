// Simple Email Authentication Manager
class SimpleAuth {
  constructor() {
    this.currentUserEmail = null;
    this.isLoggedIn = false;
    this.init();
  }

  async init() {
    try {
      // Check if user was previously logged in
      const { userEmail } = await chrome.storage.local.get(['userEmail']);
      
      if (userEmail && this.isValidEmail(userEmail)) {
        this.currentUserEmail = userEmail;
        this.isLoggedIn = true;
        console.log('🔐 Restored user session:', userEmail);
        this.updateUI();
        
        // Notify Firebase sync about user
        if (window.firebaseSync) {
          await window.firebaseSync.onUserChanged({ email: userEmail, id: this.getEmailHash(userEmail) });
        }
        return;
      }
      
      console.log('🔐 Simple Auth initialized - not logged in');
      this.updateUI();
    } catch (error) {
      console.error('Error initializing Simple Auth:', error);
    }
  }

  // Show login prompt
  async showLoginPrompt() {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        z-index: 2000000;
        display: flex;
        align-items: center;
        justify-content: center;
      `;

      const modal = document.createElement('div');
      modal.style.cssText = `
        background: white;
        padding: 24px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        max-width: 400px;
        width: 90%;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      `;

      modal.innerHTML = `
        <h3 style="margin: 0 0 16px 0; color: #333;">Đăng nhập JP Vocab</h3>
        <p style="margin: 0 0 16px 0; color: #666; font-size: 14px;">
          Nhập email để đồng bộ từ vựng của bạn
        </p>
        <input type="email" id="emailInput" placeholder="your.email@example.com" 
               style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; margin-bottom: 16px; box-sizing: border-box;">
        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button id="cancelBtn" style="padding: 8px 16px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer; font-size: 14px;">
            Hủy
          </button>
          <button id="loginBtn" style="padding: 8px 16px; border: none; background: #4CAF50; color: white; border-radius: 4px; cursor: pointer; font-size: 14px;">
            Đăng nhập
          </button>
        </div>
      `;

      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      const emailInput = modal.querySelector('#emailInput');
      const loginBtn = modal.querySelector('#loginBtn');
      const cancelBtn = modal.querySelector('#cancelBtn');

      // Focus email input
      setTimeout(() => emailInput.focus(), 100);

      // Handle login
      const handleLogin = async () => {
        const email = emailInput.value.trim();
        if (!this.isValidEmail(email)) {
          this.showError('Email không hợp lệ');
          return;
        }

        try {
          await this.signIn(email);
          overlay.remove();
          resolve(true);
        } catch (error) {
          this.showError('Lỗi đăng nhập: ' + error.message);
        }
      };

      // Handle cancel
      const handleCancel = () => {
        overlay.remove();
        resolve(false);
      };

      // Event listeners
      loginBtn.onclick = handleLogin;
      cancelBtn.onclick = handleCancel;
      
      // Enter key to login
      emailInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
          handleLogin();
        }
        if (e.key === 'Escape') {
          handleCancel();
        }
      };

      // Click outside to cancel
      overlay.onclick = (e) => {
        if (e.target === overlay) {
          handleCancel();
        }
      };
    });
  }

  // Sign in with email
  async signIn(email) {
    try {
      if (!this.isValidEmail(email)) {
        throw new Error('Email không hợp lệ');
      }

      this.currentUserEmail = email;
      this.isLoggedIn = true;

      // Save to storage
      await chrome.storage.local.set({ 
        userEmail: email,
        loginTime: Date.now() 
      });

      console.log('✅ Simple login successful:', email);
      this.updateUI();
      
      // Trigger sync with new user context
      if (window.firebaseSync) {
        await window.firebaseSync.onUserChanged({ 
          email: email, 
          id: this.getEmailHash(email),
          name: email.split('@')[0] // Use part before @ as name
        });
      }

      this.showStatus('Đã đăng nhập: ' + email, 'success');
      return true;

    } catch (error) {
      console.error('❌ Simple login failed:', error);
      throw error;
    }
  }

  // Sign out
  async signOut() {
    try {
      console.log('🔐 Signing out user:', this.currentUserEmail);
      
      // Clear local storage
      await chrome.storage.local.remove(['userEmail', 'loginTime']);
      
      // Reset state
      this.isLoggedIn = false;
      this.currentUserEmail = null;
      
      // Update UI
      this.updateUI();
      
      // Notify Firebase sync about user change
      if (window.firebaseSync) {
        await window.firebaseSync.onUserChanged(null);
      }
      
      console.log('✅ Logout successful');
      this.showStatus('Đã đăng xuất', 'success');
      
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  // Change email
  async changeEmail() {
    const success = await this.showLoginPrompt();
    return success;
  }

  // Show user menu for logout/change email
  async showUserMenu() {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        z-index: 2000000;
        display: flex;
        align-items: center;
        justify-content: center;
      `;

      const modal = document.createElement('div');
      modal.style.cssText = `
        background: white;
        padding: 24px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        max-width: 350px;
        width: 90%;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      `;

      modal.innerHTML = `
        <h3 style="margin: 0 0 8px 0; color: #333;">Tài khoản</h3>
        <p style="margin: 0 0 20px 0; color: #666; font-size: 14px;">
          📧 ${this.currentUserEmail}
        </p>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <button id="changeEmailBtn" style="width: 100%; padding: 10px; border: 1px solid #2196F3; background: #2196F3; color: white; border-radius: 4px; cursor: pointer; font-size: 14px;">
            🔄 Đổi Email
          </button>
          <button id="signOutBtn" style="width: 100%; padding: 10px; border: 1px solid #f44336; background: #f44336; color: white; border-radius: 4px; cursor: pointer; font-size: 14px;">
            🚪 Đăng xuất
          </button>
          <button id="cancelBtn" style="width: 100%; padding: 10px; border: 1px solid #ddd; background: white; color: #333; border-radius: 4px; cursor: pointer; font-size: 14px;">
            ❌ Hủy
          </button>
        </div>
      `;

      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      const changeEmailBtn = modal.querySelector('#changeEmailBtn');
      const signOutBtn = modal.querySelector('#signOutBtn');
      const cancelBtn = modal.querySelector('#cancelBtn');

      // Handle change email
      changeEmailBtn.onclick = async () => {
        overlay.remove();
        await this.changeEmail();
        resolve('change-email');
      };

      // Handle sign out
      signOutBtn.onclick = async () => {
        overlay.remove();
        await this.signOut();
        resolve('sign-out');
      };

      // Handle cancel
      const handleCancel = () => {
        overlay.remove();
        resolve('cancel');
      };

      cancelBtn.onclick = handleCancel;

      // Click outside to cancel
      overlay.onclick = (e) => {
        if (e.target === overlay) {
          handleCancel();
        }
      };

      // ESC key to cancel
      document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
          document.removeEventListener('keydown', escHandler);
          handleCancel();
        }
      });
    });
  }

  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Generate hash from email for Firebase path
  getEmailHash(email) {
    // Simple hash function for email -> Firebase-safe key
    return btoa(email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
  }

  // Update UI based on authentication state
  updateUI() {
    const loginButton = document.getElementById('simpleLoginButton');
    const logoutButton = document.getElementById('simpleLogoutButton');

    if (this.isLoggedIn && this.currentUserEmail) {
      // Show logged in state
      if (loginButton) loginButton.style.display = 'none';
      if (logoutButton) {
        logoutButton.style.display = 'block';
        const userName = this.currentUserEmail.split('@')[0];
        logoutButton.textContent = `👤 ${userName}`;
        logoutButton.title = `Đăng nhập: ${this.currentUserEmail}\nClick để đổi email hoặc đăng xuất`;
      }
      
      console.log('🔄 UI updated for logged in user:', this.currentUserEmail);
    } else {
      // Show logged out state
      if (loginButton) loginButton.style.display = 'block';
      if (logoutButton) logoutButton.style.display = 'none';
      
      console.log('🔄 UI updated for logged out state');
    }
  }

  // Show status message
  showStatus(message, type = 'info') {
    // Remove existing status message
    const existing = document.getElementById('simpleAuthStatus');
    if (existing) existing.remove();
    
    const statusDiv = document.createElement('div');
    statusDiv.id = 'simpleAuthStatus';
    statusDiv.textContent = message;
    statusDiv.style.cssText = `
      position: fixed;
      top: 60px;
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

  // Show error message
  showError(message) {
    this.showStatus(message, 'error');
  }

  // Get current user email
  getUserEmail() {
    return this.currentUserEmail;
  }

  // Get user ID for Firebase path
  getUserId() {
    return this.isLoggedIn && this.currentUserEmail ? this.getEmailHash(this.currentUserEmail) : null;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.isLoggedIn;
  }
}

// Initialize Simple Auth
window.simpleAuth = new SimpleAuth();