// Authentication guard for protected pages
import { auth, onAuthStateChanged, isEmailVerified, reloadUser } from './auth.js';

class AuthGuard {
  constructor() {
    this.isAuthenticated = false;
    this.isEmailVerified = false;
    this.currentUser = null;
    this.listeners = [];
  }

  // Initialize auth guard
  init() {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          this.currentUser = user;
          this.isAuthenticated = true;
          
          // Reload user to get latest email verification status
          try {
            await reloadUser();
            this.isEmailVerified = user.emailVerified;
          } catch (error) {
            console.error('Error reloading user:', error);
            this.isEmailVerified = false;
          }
        } else {
          this.currentUser = null;
          this.isAuthenticated = false;
          this.isEmailVerified = false;
        }
        
        // Notify all listeners
        this.listeners.forEach(listener => listener({
          isAuthenticated: this.isAuthenticated,
          isEmailVerified: this.isEmailVerified,
          user: this.currentUser
        }));
        
        resolve();
      });
    });
  }

  // Add listener for auth state changes
  onAuthStateChange(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Check if user can access protected content
  canAccess() {
    return this.isAuthenticated && this.isEmailVerified;
  }

  // Get current auth state
  getAuthState() {
    return {
      isAuthenticated: this.isAuthenticated,
      isEmailVerified: this.isEmailVerified,
      user: this.currentUser
    };
  }

  // Redirect to login with message
  redirectToLogin(message = 'Please log in to access this page') {
    const encodedMessage = encodeURIComponent(message);
    window.location.href = `login.html?message=${encodedMessage}`;
  }

  // Redirect to login for email verification
  redirectForEmailVerification() {
    this.redirectToLogin('Please verify your email before accessing this page');
  }

  // Protect a page - call this at the start of protected pages
  async protectPage() {
    await this.init();
    
    if (!this.isAuthenticated) {
      this.redirectToLogin();
      return false;
    }
    
    if (!this.isEmailVerified) {
      this.redirectForEmailVerification();
      return false;
    }
    
    return true;
  }

  // Show loading state while checking auth
  showAuthLoading() {
    const loadingHtml = `
      <div id="auth-loading" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        color: white;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        <div style="text-align: center;">
          <div style="
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          "></div>
          <p>Verifying authentication...</p>
        </div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', loadingHtml);
  }

  // Hide loading state
  hideAuthLoading() {
    const loadingEl = document.getElementById('auth-loading');
    if (loadingEl) {
      loadingEl.remove();
    }
  }
}

// Create global instance
window.authGuard = new AuthGuard();

// Export for module usage
export default window.authGuard;
