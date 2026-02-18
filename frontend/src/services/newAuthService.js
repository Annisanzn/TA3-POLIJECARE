import api from '../api/axios';

/**
 * New Authentication Service
 * Handles login using the new endpoint /api/login-new
 * Provides better error handling and debugging
 */

class NewAuthService {
  /**
   * Login with email and password
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise} Response with user data and token
   */
  static async login(email, password) {
    console.log('🔐 NewAuthService: Attempting login...');
    console.log('📤 Endpoint: /api/login-new');
    console.log('📝 Email:', email);
    
    try {
      const response = await api.post('/login-new', {
        email,
        password
      });

      console.log('✅ NewAuthService: Login successful');
      console.log('Response:', response);

      // Validate response structure
      if (!response.success) {
        console.warn('⚠️ NewAuthService: Response success is false');
        throw new Error(response.message || 'Login gagal');
      }

      if (!response.token) {
        console.warn('⚠️ NewAuthService: No token in response');
        throw new Error('Token tidak diterima dari server');
      }

      if (!response.user) {
        console.warn('⚠️ NewAuthService: No user data in response');
        throw new Error('Data user tidak diterima dari server');
      }

      return {
        success: true,
        message: response.message || 'Login berhasil',
        token: response.token,
        user: response.user,
        rawResponse: response
      };

    } catch (error) {
      console.error('❌ NewAuthService: Login failed');
      
      // Enhanced error handling
      let errorMessage = 'Terjadi kesalahan saat login';
      let errorDetails = {};

      if (error.response) {
        // Server responded with error status
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      `Server error: ${error.response.status}`;
        
        errorDetails = {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        };
      } else if (error.request) {
        // No response received
        console.error('No response received:', error.request);
        errorMessage = 'Server tidak merespon. Periksa koneksi internet atau server mungkin sedang down.';
        errorDetails = { type: 'network', request: error.request };
      } else {
        // Request setup error
        console.error('Request setup error:', error.message);
        errorMessage = error.message || 'Gagal membuat permintaan login';
        errorDetails = { type: 'setup', message: error.message };
      }

      // Return consistent error structure
      return {
        success: false,
        message: errorMessage,
        error: errorDetails,
        rawError: error
      };
    }
  }

  /**
   * Save authentication data to localStorage
   * @param {string} token 
   * @param {object} user 
   */
  static saveAuthData(token, user) {
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('💾 NewAuthService: Auth data saved to localStorage');
      console.log('Token saved:', token ? 'Yes' : 'No');
      console.log('User saved:', user ? 'Yes' : 'No');
      return true;
    } catch (error) {
      console.error('❌ NewAuthService: Failed to save auth data', error);
      return false;
    }
  }

  /**
   * Get saved authentication data
   * @returns {object} { token, user }
   */
  static getAuthData() {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      console.log('📋 NewAuthService: Retrieved auth data from localStorage');
      console.log('Token exists:', !!token);
      console.log('User exists:', !!user);
      
      return { token, user };
    } catch (error) {
      console.error('❌ NewAuthService: Failed to get auth data', error);
      return { token: null, user: null };
    }
  }

  /**
   * Clear authentication data
   */
  static clearAuthData() {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('🗑️ NewAuthService: Auth data cleared from localStorage');
      return true;
    } catch (error) {
      console.error('❌ NewAuthService: Failed to clear auth data', error);
      return false;
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  static isAuthenticated() {
    const { token, user } = this.getAuthData();
    const isAuth = !!(token && user);
    console.log('🔐 NewAuthService: Authentication check:', isAuth);
    return isAuth;
  }

  /**
   * Get user role
   * @returns {string|null}
   */
  static getUserRole() {
    const { user } = this.getAuthData();
    const role = user?.role || null;
    console.log('👤 NewAuthService: User role:', role);
    return role;
  }

  /**
   * Get redirect path based on user role
   * @returns {string} Redirect path
   */
  static getRedirectPath() {
    const role = this.getUserRole();
    
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'konselor':
        return '/konselor/dashboard';
      case 'operator':
        return '/operator/dashboard';
      case 'user':
      default:
        return '/dashboard';
    }
  }

  /**
   * Validate token with server
   * @returns {Promise} Validation result
   */
  static async validateToken() {
    try {
      const { token } = this.getAuthData();
      
      if (!token) {
        return { valid: false, message: 'No token found' };
      }

      // Make request to validate token
      const response = await api.get('/user-new');
      
      if (response.success) {
        return { valid: true, user: response.user };
      } else {
        return { valid: false, message: response.message };
      }
    } catch (error) {
      console.error('❌ NewAuthService: Token validation failed', error);
      return { 
        valid: false, 
        message: error.response?.data?.message || 'Token validation failed' 
      };
    }
  }
}

export default NewAuthService;