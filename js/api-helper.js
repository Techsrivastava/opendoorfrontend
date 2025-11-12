/**
 * Wildex API Helper - Complete Integration with Backend
 * Auto-detects environment and uses appropriate base URL
 */

// Environment Detection
const isLocalhost = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname === '';

// API Configuration
const API_CONFIG = {
  // Auto-switch between local and production
  baseURL: isLocalhost 
    ? 'https://openbacken-production.up.railway.app/api'  // Local development
    : 'https://openbacken-production.up.railway.app/api', // Production
  
  timeout: 10000,
  
  // API Endpoints
  endpoints: {
    // Booking endpoints (matching backend routes)
    createBooking: '/bookings/create',              // POST /api/bookings/create
    getAllBookings: '/bookings',                     // GET /api/bookings
    bookingById: '/bookings/:id',                   // GET /api/bookings/:id
    bookingsByCustomer: '/bookings/customer/:customerId', // GET /api/bookings/customer/:id
    updateBooking: '/bookings/:id',                 // PUT /api/bookings/:id
    deleteBooking: '/bookings/:id',                 // DELETE /api/bookings/:id
    bookingStatus: '/bookings/:id/status',          // PATCH /api/bookings/:id/status
    bookingExpenses: '/bookings/:id/expenses',      // POST/GET /api/bookings/:id/expenses
    collectPayment: '/bookings/:id/collect-payment', // POST /api/bookings/:id/collect-payment
    
    // Payment endpoints
    createOrder: '/payments/create-order',
    verifyPayment: '/payments/verify',
    paymentDetails: '/payments/booking/:bookingId',
    
    // Customer endpoints
    customers: '/customers',
    customerLogin: '/customers/send-login-otp',
    customerRegister: '/customers/send-registration-otp',
    
    // Package endpoints
    packages: '/packages',
    packageById: '/packages/:id',
    packageBySlug: '/packages/slug/:slug'
  }
};

// Log current configuration
console.log('🔧 API Configuration:', {
  environment: isLocalhost ? 'Development' : 'Production',
  baseURL: API_CONFIG.baseURL
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Build complete API URL
 * @param {string} endpoint - Endpoint path or key from API_CONFIG.endpoints
 * @param {Object} params - URL parameters to replace
 * @returns {string} Complete URL
 */
function buildApiUrl(endpoint, params = {}) {
  let url = endpoint;
  
  // If endpoint is a key in API_CONFIG.endpoints, use that
  if (API_CONFIG.endpoints[endpoint]) {
    url = API_CONFIG.endpoints[endpoint];
  }
  
  // Replace URL parameters
  Object.keys(params).forEach(key => {
    url = url.replace(`:${key}`, params[key]);
  });
  
  return `${API_CONFIG.baseURL}${url}`;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get authentication headers with JWT token
 */
function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

/**
 * Check if user is logged in
 */
function isLoggedIn() {
  return !!localStorage.getItem('authToken') && !!localStorage.getItem('customerId');
}

/**
 * Get current customer ID
 */
function getCurrentCustomerId() {
  return localStorage.getItem('customerId');
}

/**
 * Save customer data to localStorage
 */
function saveCustomerData(customerData, token) {
  localStorage.setItem('authToken', token);
  localStorage.setItem('customerId', customerData._id);
  localStorage.setItem('customerName', customerData.name || '');
  localStorage.setItem('customerPhone', customerData.phone || '');
  localStorage.setItem('customerEmail', customerData.email || '');
  localStorage.setItem('customerAvatar', customerData.avatar || '');
  
  // Save complete userInfo object for easy access
  const userInfo = {
    _id: customerData._id,
    name: customerData.name || '',
    phone: customerData.phone || '',
    email: customerData.email || '',
    avatar: customerData.avatar || ''
  };
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
}

/**
 * Clear customer data from localStorage
 */
function clearCustomerData() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('customerId');
  localStorage.removeItem('customerName');
  localStorage.removeItem('customerPhone');
  localStorage.removeItem('customerEmail');
  localStorage.removeItem('customerAvatar');
  localStorage.removeItem('userInfo');
}

// ============================================
// AUTHENTICATION APIs
// ============================================

const AuthAPI = {
  /**
   * Send OTP for Registration
   * @param {string} phone - Customer phone number
   * @returns {Promise} API response
   */
  sendRegistrationOTP: async function(phone) {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/customers/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Send Registration OTP Error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  /**
   * Verify OTP and Complete Registration
   * @param {string} customerId - Temporary customer ID from OTP response
   * @param {string} otp - 6-digit OTP code
   * @returns {Promise} API response with token
   */
  verifyRegistrationOTP: async function(customerId, otp) {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/customers/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId, otp })
      });
      
      const data = await response.json();
      
      // Save customer data if successful
      if (data.success && data.data) {
        saveCustomerData(data.data, data.data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Verify Registration OTP Error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  /**
   * Send OTP for Login
   * @param {string} phone - Customer phone number
   * @returns {Promise} API response
   */
  sendLoginOTP: async function(phone) {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/customers/login/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Send Login OTP Error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  /**
   * Verify Login OTP
   * @param {string} customerId - Customer ID from login OTP response
   * @param {string} otp - 6-digit OTP code
   * @returns {Promise} API response with token
   */
  verifyLoginOTP: async function(customerId, otp) {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/customers/login/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId, otp })
      });
      
      const data = await response.json();
      
      // Save customer data if successful
      if (data.success && data.data) {
        saveCustomerData(data.data, data.data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Verify Login OTP Error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  /**
   * Logout user
   */
  logout: function() {
    clearCustomerData();
    window.location.href = '/index.html';
  }
};

// ============================================
// CUSTOMER APIs
// ============================================

const CustomerAPI = {
  /**
   * Get Customer Profile (uses JWT token to identify user)
   * @returns {Promise} Customer profile data
   */
  getProfile: async function() {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/customers/${getCurrentCustomerId()}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get Profile Error:', error);
      return { success: false, message: 'Failed to fetch profile' };
    }
  },

  /**
   * Update Customer Profile (uses JWT token to identify user)
   * @param {Object} profileData - Profile update data { name, email, location, avatar }
   * @returns {Promise} Updated profile data
   */
  updateProfile: async function(profileData) {
    try {
      const formData = new FormData();
      
      if (profileData.name) formData.append('name', profileData.name);
      if (profileData.email) formData.append('email', profileData.email);
      if (profileData.location) formData.append('location', profileData.location);
      if (profileData.notes) formData.append('notes', profileData.notes);
      if (profileData.tags) formData.append('tags', profileData.tags);
      
      // Avatar file upload
      if (profileData.avatar && profileData.avatar instanceof File) {
        formData.append('avatar', profileData.avatar);
      }
      
      const response = await fetch(`${API_CONFIG.baseURL}/customers/me`, {
        method: 'PUT',
        body: formData
      });
      
      const data = await response.json();
      
      // Update localStorage if successful
      if (data.success && data.data) {
        localStorage.setItem('customerName', data.data.name || '');
        localStorage.setItem('customerAvatar', data.data.avatar || '');
      }
      
      return data;
    } catch (error) {
      console.error('Update Profile Error:', error);
      return { success: false, message: 'Failed to update profile' };
    }
  },

  /**
   * Get Customer's Wishlist
   * @param {string} customerId - Customer ID
   * @returns {Promise} Wishlist packages
   */
  getWishlist: async function(customerId) {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/customers/${customerId}/wishlist`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get Wishlist Error:', error);
      return { success: false, message: 'Failed to fetch wishlist' };
    }
  }
};

// ============================================
// BOOKING APIs
// ============================================

const BookingAPI = {
  /**
   * Create New Booking
   * @param {Object} bookingData - Booking details
   * @returns {Promise} Booking confirmation
   */
  createBooking: async function(bookingData) {
    try {
      const customerId = getCurrentCustomerId();
      
      if (!customerId) {
        return { success: false, message: 'Please login to book' };
      }
      
      const payload = {
        customer: customerId,
        package: bookingData.packageId,
        travelDate: bookingData.travelDate,
        amount: parseFloat(bookingData.amount),
        participants: parseInt(bookingData.participants),
        bookedBy: "Self",
        advance: parseFloat(bookingData.advancePayment || 0),
        addons: bookingData.addons || []
      };
      
      const response = await fetch(buildApiUrl('createBooking'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Create Booking Error:', error);
      return { success: false, message: 'Failed to create booking' };
    }
  },

  /**
   * Get Customer's All Bookings
   * @param {string} customerId - Customer ID
   * @returns {Promise} List of bookings
   */
  getCustomerBookings: async function(customerId) {
    try {
      const response = await fetch(buildApiUrl('bookingsByCustomer', { customerId }), {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get Customer Bookings Error:', error);
      return { success: false, message: 'Failed to fetch bookings' };
    }
  },

  /**
   * Get Single Booking by ID
   * @param {string} bookingId - Booking ID
   * @returns {Promise} Booking details
   */
  getBookingById: async function(bookingId) {
    try {
      const response = await fetch(buildApiUrl('bookingById', { id: bookingId }), {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get Booking Error:', error);
      return { success: false, message: 'Failed to fetch booking details' };
    }
  },

  /**
   * Update Booking
   * @param {string} bookingId - Booking ID
   * @param {Object} updateData - Data to update
   * @returns {Promise} Updated booking
   */
  updateBooking: async function(bookingId, updateData) {
    try {
      const response = await fetch(buildApiUrl('bookingById', { id: bookingId }), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Update Booking Error:', error);
      return { success: false, message: 'Failed to update booking' };
    }
  },

  /**
   * Cancel Booking
   * @param {string} bookingId - Booking ID
   * @returns {Promise} Cancellation confirmation
   */
  cancelBooking: async function(bookingId) {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: "Cancelled" })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Cancel Booking Error:', error);
      return { success: false, message: 'Failed to cancel booking' };
    }
  },

  /**
   * Collect Payment for Booking
   * @param {string} bookingId - Booking ID
   * @param {Object} paymentData - Payment details
   * @returns {Promise} Payment confirmation
   */
  collectPayment: async function(bookingId, paymentData) {
    try {
      const payload = {
        amount: parseFloat(paymentData.amount),
        method: paymentData.method, // "Card", "UPI", "NetBanking", "Cash"
        collectedBy: "Self",
        notes: paymentData.notes || ""
      };
      
      const response = await fetch(`${API_CONFIG.baseURL}/bookings/${bookingId}/collect-payment`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Collect Payment Error:', error);
      return { success: false, message: 'Failed to process payment' };
    }
  }
};

// ============================================
// PAYMENT APIs
// ============================================

const PaymentAPI = {
  /**
   * Create Razorpay Order
   * @param {Object} orderData - Order details
   * @returns {Promise<Object>}
   */
  async createOrder(orderData) {
    try {
      const response = await fetch(buildApiUrl('createOrder'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(orderData)
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned invalid response');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order');
      }

      return data;
    } catch (error) {
      console.error('❌ Error creating payment order:', error);
      throw error;
    }
  },

  /**
   * Verify Payment
   * @param {Object} verificationData - Payment verification details
   * @returns {Promise<Object>}
   */
  async verifyPayment(verificationData) {
    try {
      const response = await fetch(buildApiUrl('verifyPayment'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(verificationData)
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned invalid response');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Payment verification failed');
      }

      return data;
    } catch (error) {
      console.error('❌ Error verifying payment:', error);
      throw error;
    }
  },

  /**
   * Get Payment Details for a Booking
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>}
   */
  async getPaymentDetails(bookingId) {
    try {
      const response = await fetch(buildApiUrl('paymentDetails', { bookingId }), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned invalid response');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch payment details');
      }

      return data;
    } catch (error) {
      console.error('❌ Error fetching payment details:', error);
      throw error;
    }
  }
};

// ============================================
// PACKAGE APIs
// ============================================

const PackageAPI = {
  /**
   * Get All Packages
   * @returns {Promise} List of all packages
   */
  getAll: async function() {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/packages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get All Packages Error:', error);
      return { success: false, message: 'Failed to fetch packages' };
    }
  },

  /**
   * Get Package by ID
   * @param {string} packageId - Package ID
   * @returns {Promise} Package details
   */
  getById: async function(packageId) {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/packages/${packageId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get Package Error:', error);
      return { success: false, message: 'Failed to fetch package details' };
    }
  },

  /**
   * Get Package by Slug
   * @param {string} slug - Package slug
   * @returns {Promise} Package details
   */
  getBySlug: async function(slug) {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/packages/slug/${slug}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get Package by Slug Error:', error);
      return { success: false, message: 'Failed to fetch package details' };
    }
  },

  /**
   * Get Packages by Category
   * @param {string} categoryName - Category name (Trekking, Trips, Expeditions, Spiritual)
   * @returns {Promise} List of packages in category
   */
  getByCategory: async function(categoryName) {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/packages?category=${encodeURIComponent(categoryName)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get Packages by Category Error:', error);
      return { success: false, message: 'Failed to fetch packages by category' };
    }
  },

  /**
   * Get Featured Packages
   * @returns {Promise} List of featured packages
   */
  getFeatured: async function() {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/packages?featured=true`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get Featured Packages Error:', error);
      return { success: false, message: 'Failed to fetch featured packages' };
    }
  },

  /**
   * Get Trending Packages
   * @returns {Promise} List of trending packages
   */
  getTrending: async function() {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/packages?trending=true`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get Trending Packages Error:', error);
      return { success: false, message: 'Failed to fetch trending packages' };
    }
  }
};

// ============================================
// UI HELPER FUNCTIONS
// ============================================

const UIHelpers = {
  /**
   * Show loading spinner
   */
  showLoading: function(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = '<div class="spinner">Loading...</div>';
    }
  },

  /**
   * Show success message
   */
  showSuccess: function(message) {
    alert(message); // Replace with better UI notification
  },

  /**
   * Show error message
   */
  showError: function(message) {
    alert('Error: ' + message); // Replace with better UI notification
  },

  /**
   * Format currency
   */
  formatCurrency: function(amount) {
    return '₹' + parseFloat(amount).toLocaleString('en-IN');
  },

  /**
   * Format date
   */
  formatDate: function(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  },

  /**
   * Redirect to login if not authenticated
   */
  requireAuth: function() {
    if (!isLoggedIn()) {
      window.location.href = '/login.html';
      return false;
    }
    return true;
  },

  /**
   * Update user nav display
   */
  updateUserNav: function() {
    const isAuthenticated = isLoggedIn();
    const userName = localStorage.getItem('customerName') || 'User';
    
    const loginBtn = document.getElementById('loginBtn');
    const userProfile = document.getElementById('userProfile');
    const userNameDisplay = document.getElementById('userNameDisplay');
    
    if (isAuthenticated) {
      if (loginBtn) loginBtn.style.display = 'none';
      if (userProfile) userProfile.style.display = 'block';
      if (userNameDisplay) userNameDisplay.textContent = userName;
    } else {
      if (loginBtn) loginBtn.style.display = 'block';
      if (userProfile) userProfile.style.display = 'none';
    }
  }
};

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  // Update user navigation display
  UIHelpers.updateUserNav();
  
  console.log('Wildex API Helper Loaded');
  console.log('User Logged In:', isLoggedIn());
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AuthAPI,
    CustomerAPI,
    BookingAPI,
    PackageAPI,
    UIHelpers,
    isLoggedIn,
    getCurrentCustomerId
  };
}
