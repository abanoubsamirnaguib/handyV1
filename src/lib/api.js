// src/lib/api.js

// Use import.meta.env for Vite env variables with fallback for different environments
const getApiBaseUrl = () => {
  // Production
  if (window.location.hostname === 'handy3.abanoubsamir.com') {
    return 'https://handy3.abanoubsamir.com/backend/public/api';
  }
  
  // Development - from environment variable or default
  return import.meta.env.VITE_API_BASE_URL + '/api' || 'http://localhost:8000/api';
};

// Get base URL for assets (images, files)
const getAssetBaseUrl = () => {
  // Production
  if (window.location.hostname === 'handy3.abanoubsamir.com') {
    return 'https://handy3.abanoubsamir.com/backend/public';
  }
  
  // Development
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
};

const BASE_URL = getApiBaseUrl();
export const ASSET_BASE_URL = getAssetBaseUrl();

export function apiUrl(path) {
  // Ensure no double slashes
  const cleanBase = BASE_URL.replace(/\/$/, '');
  const cleanPath = path.replace(/^\//, '');
  return `${cleanBase}/${cleanPath}`;
}

// Helper function to get asset URLs (images, files)
export function assetUrl(path) {
  if (!path) return null;
  
  // If it's already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Remove leading slash if present and construct full URL
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${ASSET_BASE_URL}/${cleanPath}`;
}

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  const res = await fetch(apiUrl(path), { ...defaultOptions, ...options });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API error: ${res.status} - ${error}`);
  }
  return res.json();
}

// Dedicated FormData fetch for file uploads (no Content-Type header, only Authorization)
export async function apiFormFetch(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    // Do NOT set Content-Type for FormData
  };
  const res = await fetch(apiUrl(path), {
    ...options,
    headers,
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API error: ${res.status} - ${error}`);
  }
  return res.json();
}

// Delivery-specific API fetch function
export async function deliveryApiFetch(path, options = {}) {
  const token = localStorage.getItem('delivery_token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  const res = await fetch(apiUrl(path), { ...defaultOptions, ...options });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API error: ${res.status} - ${error}`);
  }
  return res.json();
}

// General API functions
export const api = {
  // Generic HTTP methods
  get: (path) => apiFetch(path),
  post: (path, data) => apiFetch(path, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  put: (path, data) => apiFetch(path, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (path) => apiFetch(path, {
    method: 'DELETE',
  }),
  
  // Categories
  getCategories: () => apiFetch('listcategories'),

  // Public Cities (for checkout city selection)
  getCities: () => apiFetch('cities'),
  
  // Sellers
  getSeller: (sellerId) => apiFetch(`listsellers/${sellerId}`),
  getSellerProducts: (sellerId) => apiFetch(`listsellers/${sellerId}/products`),
  getSellers: () => apiFetch('listsellers'),
  getTopSellers: () => apiFetch('sellers/top'),

  // Products
  getFeaturedProducts: () => apiFetch('TopProducts?featured=1&status=active&limit=10'),
  getProductById: (productId) => apiFetch(`Listpoducts/${productId}`),
  
  // Authentication with OTP
  sendEmailVerificationOTP: (email) => 
    apiFetch('send-email-verification-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  
  verifyEmail: (email, otpCode) => 
    apiFetch('verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, otp_code: otpCode }),
    }),
  
  registerWithVerification: (userData) => 
    apiFetch('register-with-verification', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  
  sendPasswordResetOTP: (email) => 
    apiFetch('send-password-reset-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  
  verifyPasswordResetOTP: (email, otpCode) => 
    apiFetch('verify-password-reset-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp_code: otpCode }),
    }),
  
  resetPassword: (email, otpCode, password, passwordConfirmation) => 
    apiFetch('reset-password', {
      method: 'POST',
      body: JSON.stringify({ 
        email, 
        otp_code: otpCode, 
        password, 
        password_confirmation: passwordConfirmation 
      }),
    }),

  // Profile image upload
  uploadProfileImage: (userId, imageFile) => {
    const formData = new FormData();
    formData.append('avatar', imageFile);
    
    return apiFormFetch(`users/${userId}/upload-avatar`, {
      method: 'POST',
      body: formData,
    });
  },

  // Cover image upload
  uploadCoverImage: (userId, imageFile) => {
    const formData = new FormData();
    formData.append('cover_image', imageFile);
    
    return apiFormFetch(`users/${userId}/upload-cover-image`, {
      method: 'POST',
      body: formData,
    });
  },

  // Cart API functions
  getCart: () => apiFetch('cart'),
  addToCart: (productId, quantity = 1) => 
    apiFetch('cart/add', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    }),
  updateCartItem: (cartItemId, quantity) => 
    apiFetch(`cart-items/${cartItemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    }),
  removeFromCart: (cartItemId) => 
    apiFetch(`cart-items/${cartItemId}`, { method: 'DELETE' }),
  clearCart: () => 
    apiFetch('cart/clear', { method: 'DELETE' }),

  // Order API functions
  createOrder: (orderData) => 
    apiFetch('orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),
  createOrderWithFiles: (formData) => 
    apiFormFetch('orders', {
      method: 'POST',
      body: formData,
    }),
  getOrders: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    return apiFetch(`orders${queryString ? `?${queryString}` : ''}`);
  },
  getOrder: (orderId) => apiFetch(`orders/${orderId}`),
  updateOrder: (orderId, orderData) => 
    apiFetch(`orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    }),
  deleteOrder: (orderId) => 
    apiFetch(`orders/${orderId}`, { method: 'DELETE' }),

  // Order workflow functions
  uploadPaymentProof: (orderId, imageFileOrFormData) => {
    let formData;
    
    // Check if it's already FormData (for remaining payment) or a file
    if (imageFileOrFormData instanceof FormData) {
      formData = imageFileOrFormData;
    } else {
      formData = new FormData();
      formData.append('payment_proof', imageFileOrFormData);
    }
    
    return apiFormFetch(`orders/${orderId}/upload-payment-proof`, {
      method: 'POST',
      body: formData,
    });
  },
  
  // Customer actions
  completeOrder: (orderId) => 
    apiFetch(`orders/${orderId}/complete`, { method: 'POST' }),
  cancelOrder: (orderId, reason) => 
    apiFetch(`orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  
  // Dashboard statistics
  getDashboardStats: () => apiFetch('orders/dashboard/stats'),

  // Enhanced Wishlist functions with existence checks
  getWishlist: () => apiFetch('wishlist'),
  getWishlistCount: () => apiFetch('wishlist/count'),
  addToWishlist: (productId) => 
    apiFetch('wishlist/add', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    }),
  removeFromWishlist: (productId) => 
    apiFetch(`wishlist/remove/${productId}`, { method: 'DELETE' }),
  toggleWishlist: (productId) => 
    apiFetch('wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    }),
  checkWishlistStatus: (productId) => apiFetch(`wishlist/check/${productId}`),
  clearWishlist: () => apiFetch('wishlist/clear', { method: 'DELETE' }),

  // Chat API functions
  getConversations: () => apiFetch('chat/conversations'),
  getMessages: (conversationId) => apiFetch(`chat/conversations/${conversationId}/messages`),
  sendMessage: (messageData) => 
    apiFetch('chat/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    }),
  sendMessageWithFiles: (formData) => 
    apiFormFetch('chat/messages', {
      method: 'POST',
      body: formData,
    }),
  updateOnlineStatus: () => 
    apiFetch('chat/update-online-status', {
      method: 'POST',
    }),

  // Service order API functions
  getSellerServices: (userId) => apiFetch(`users/${userId}/services`),
  createServiceOrder: (formData) => 
    apiFormFetch('orders', {
      method: 'POST',
      body: formData,
    }),
  startConversation: (recipientId) => 
    apiFetch('chat/conversations/start', {
      method: 'POST',
      body: JSON.stringify({ recipient_id: recipientId }),
    }),
  markAsRead: (conversationId) => 
    apiFetch(`chat/conversations/${conversationId}/mark-read`, { method: 'POST' }),
  deleteConversation: (conversationId) => 
    apiFetch(`chat/conversations/${conversationId}`, { method: 'DELETE' }),


  // Notification API functions
  getNotifications: () => {return apiFetch('notifications');},
  getUnreadNotificationCount: () => {return apiFetch('notifications/unread-count');},
  markNotificationAsRead: (id) => apiFetch(`notifications/${id}/mark-read`, { method: 'POST' }),
  markAllNotificationsAsRead: () => apiFetch('notifications/mark-all-read', { method: 'POST' }),
  deleteNotification: (id) => apiFetch(`notifications/${id}`, { method: 'DELETE' }),

  // Withdrawal requests for sellers
  getWithdrawalRequests: () => apiFetch('withdrawals'),
  createWithdrawalRequest: (data) => 
    apiFetch('withdrawals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getEarningsSummary: () => apiFetch('earnings-summary'),

  // Buyer withdrawals
  getBuyerWithdrawals: () => apiFetch('buyer-withdrawals'),
  createBuyerWithdrawalRequest: (data) => 
    apiFetch('buyer-withdrawals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Reviews API functions
  getProductReviews: (productId) => apiFetch(`products/${productId}/reviews`),
  getSellerReviews: (sellerId) => apiFetch(`sellers/${sellerId}/reviews`),
  getOrderReviews: (orderId) => apiFetch(`orders/${orderId}/reviews`),
  canReviewOrder: (orderId) => apiFetch(`orders/${orderId}/can-review`),
  createReview: (reviewData, imageFile = null) => {
    if (imageFile) {
      // Use FormData if image is provided
      const formData = new FormData();
      formData.append('product_id', reviewData.product_id);
      if (reviewData.order_id) formData.append('order_id', reviewData.order_id);
      formData.append('rating', reviewData.rating);
      if (reviewData.comment) formData.append('comment', reviewData.comment);
      if (reviewData.status) formData.append('status', reviewData.status);
      formData.append('image', imageFile);
      
      return apiFormFetch('reviews', {
        method: 'POST',
        body: formData,
      });
    } else {
      // Use JSON if no image
      return apiFetch('reviews', {
        method: 'POST',
        body: JSON.stringify(reviewData),
      });
    }
  },
  updateReview: (reviewId, reviewData, imageFile = null, removeImage = false) => {
    if (imageFile || removeImage) {
      // Use FormData if image is provided or being removed
      const formData = new FormData();
      if (reviewData.rating) formData.append('rating', reviewData.rating);
      if (reviewData.comment !== undefined) formData.append('comment', reviewData.comment);
      if (reviewData.status) formData.append('status', reviewData.status);
      if (imageFile) formData.append('image', imageFile);
      if (removeImage) formData.append('remove_image', '1');
      console.log('formData1', formData);
      return apiFormFetch(`reviews/${reviewId}`, {
        method: 'PUT',
        body: formData,
      });
    } else {
      console.log('reviewData2', reviewData);
      // Use JSON if no image changes
      return apiFetch(`reviews/${reviewId}`, {
        method: 'PUT',
        body: JSON.stringify(reviewData),
      });
    }
  },
  deleteReview: (reviewId) => 
    apiFetch(`reviews/${reviewId}`, { method: 'DELETE' }),

  // Contact Us form submission (public endpoint)
  submitContactForm: (formData) => 
    apiFetch('contact', {
      method: 'POST',
      body: JSON.stringify(formData),
    }),

  // Public announcements endpoints
  getPublicAnnouncements: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiFetch(`announcements?${searchParams}`);
  },
  getLatestAnnouncements: (limit = 3) => 
    apiFetch(`announcements/latest?limit=${limit}`),
  getAnnouncementById: (id) => 
    apiFetch(`announcements/${id}`),
  getAnnouncementStats: () => 
    apiFetch('announcements/stats'),

  // About Us Statistics
  getAboutUsStats: () => 
    apiFetch('about-us/stats'),
};

// Admin API functions
export const adminApi = {
  // Dashboard stats
  getDashboardStats: () => apiFetch('admin/dashboard'),
  
  // Users management
  getUsers: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiFetch(`admin/users?${searchParams}`);
  },
  updateUserStatus: (userId, status) => 
    apiFetch(`admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  deleteUser: (userId) => 
    apiFetch(`admin/users/${userId}`, { method: 'DELETE' }),

  // Sellers management
  getSellers: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiFetch(`admin/sellers?${searchParams}`);
  },
  updateSellerStatus: (sellerId, status) => 
    apiFetch(`admin/sellers/${sellerId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Products management
  getProducts: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiFetch(`admin/products?${searchParams}`);
  },
  toggleProductFeatured: (productId) => 
    apiFetch(`admin/products/${productId}/featured`, { method: 'PATCH' }),
  deleteProduct: (productId) => 
    apiFetch(`admin/products/${productId}`, { method: 'DELETE' }),
  updateProductStatus: (productId, status) => 
    apiFetch(`admin/products/${productId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  // Recent activity
  getRecentActivity: () => apiFetch('admin/recent-activity'),

  // Categories management
  getCategories: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiFetch(`categories?${searchParams}`);
  },
  createCategory: (categoryData) => {
    // Check if categoryData contains file data
    if (categoryData instanceof FormData) {
      return apiFormFetch('categories', {
        method: 'POST',
        body: categoryData,
      });
    }
    return apiFetch('categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },
  updateCategory: (categoryId, categoryData) => {
    // Check if categoryData contains file data
    if (categoryData instanceof FormData) {
      return apiFormFetch(`categories/${categoryId}`, {
        method: 'POST', // Using POST with _method=PUT for file uploads
        body: categoryData,
      });
    }
    return apiFetch(`categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  },
  deleteCategory: (categoryId) => 
    apiFetch(`categories/${categoryId}`, { method: 'DELETE' }),

  // Admin order management
  getOrders: (params = {}) => { 
    const searchParams = new URLSearchParams(params);
    return apiFetch(`admin/orders?${searchParams}`);
  },
  getPendingOrders: () => apiFetch('admin/orders/pending'),
  approveOrder: (orderId, notes = '') => 
    apiFetch(`admin/orders/${orderId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),
  rejectOrder: (orderId, reason) => 
    apiFetch(`admin/orders/${orderId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  
  // Admin order workflow functions
  adminApproveOrder: (orderId, notes = '') => 
    apiFetch(`orders/${orderId}/admin-approve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),
  adminUpdateOrderStatus: (orderId, status, notes = '') => 
    apiFetch(`admin/orders/${orderId}/update-status`, {
      method: 'POST',
      body: JSON.stringify({ status, notes }),
    }),
  getPendingApprovalOrders: () => apiFetch('orders/pending-approval'),

  // Delivery Personnel Management
  getDeliveryPersonnel: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiFetch(`admin/delivery-personnel?${searchParams}`);
  },
  createDeliveryPersonnel: (personnelData) => 
    apiFetch('admin/delivery-personnel', {
      method: 'POST',
      body: JSON.stringify(personnelData),
    }),
  updateDeliveryPersonnel: (personnelId, personnelData) => 
    apiFetch(`admin/delivery-personnel/${personnelId}`, {
      method: 'PUT',
      body: JSON.stringify(personnelData),
    }),
  deleteDeliveryPersonnel: (personnelId) => 
    apiFetch(`admin/delivery-personnel/${personnelId}`, { method: 'DELETE' }),
  resetDeliveryPersonnelPassword: (personnelId) => 
    apiFetch(`admin/delivery-personnel/${personnelId}/reset-password`, { method: 'POST' }),
  getAvailableDeliveryPersonnel: () => apiFetch('admin/delivery/available-personnel'),
  
  // New Delivery Order Management
  getOrdersReadyForDelivery: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiFetch(`admin/delivery/orders-ready?${searchParams}`);
  },
  getPickedUpOrdersAwaitingDelivery: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiFetch(`admin/delivery/picked-up-orders?${searchParams}`);
  },
  bulkAssignOrders: (orderIds, deliveryPersonId) => 
    apiFetch('admin/delivery/bulk-assign-orders', {
      method: 'POST',
      body: JSON.stringify({ 
        order_ids: orderIds, 
        delivery_person_id: deliveryPersonId 
      }),
    }),
  assignPickupPerson: (orderId, pickupPersonId) => 
    apiFetch('admin/delivery/assign-pickup-person', {
      method: 'POST',
      body: JSON.stringify({ 
        order_id: orderId, 
        pickup_person_id: pickupPersonId 
      }),
    }),
  assignDeliveryPerson: (orderId, deliveryPersonId) => 
    apiFetch('admin/delivery/assign-delivery-person', {
      method: 'POST',
      body: JSON.stringify({ 
        order_id: orderId, 
        delivery_person_id: deliveryPersonId 
      }),
    }),

  // Withdrawal requests management (sellers)
  getWithdrawalRequests: () => apiFetch('admin/withdrawal-requests'),
  approveWithdrawalRequest: (requestId, data) => 
    apiFetch(`admin/withdrawal-requests/${requestId}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  rejectWithdrawalRequest: (requestId, data) => 
    apiFetch(`admin/withdrawal-requests/${requestId}/reject`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Buyer withdrawal requests management
  getBuyerWithdrawalRequests: () => apiFetch('admin/buyer-withdrawal-requests'),
  approveBuyerWithdrawalRequest: (requestId, data) => 
    apiFetch(`admin/buyer-withdrawal-requests/${requestId}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  rejectBuyerWithdrawalRequest: (requestId, data) => 
    apiFetch(`admin/buyer-withdrawal-requests/${requestId}/reject`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Withdrawal settings management
  getWithdrawalSettings: () => apiFetch('admin/withdrawal-settings'),
  updateWithdrawalSettings: (data) => 
    apiFetch('admin/withdrawal-settings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Admin site settings management
  getSiteSettings: () => apiFetch('admin/site-settings'),
  updateSiteSettings: (settingsType, settings) => 
    apiFetch('admin/site-settings', {
      method: 'POST',
      body: JSON.stringify({ settingsType, settings }),
    }),

  // Contact Us management
  getContactMessages: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiFetch(`admin/contact?${searchParams}`);
  },
  getContactStats: () => apiFetch('admin/contact/stats'),
  getContactMessage: (id) => apiFetch(`admin/contact/${id}`),
  markContactMessageAsRead: (id) => 
    apiFetch(`admin/contact/${id}/read`, { method: 'PATCH' }),
  markContactMessageAsResolved: (id, data) => 
    apiFetch(`admin/contact/${id}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteContactMessage: (id) => 
    apiFetch(`admin/contact/${id}`, { method: 'DELETE' }),

  // Admin chat management
  getAllConversations: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiFetch(`admin/chat/conversations?${searchParams}`);
  },
  getConversationMessages: (conversationId) => 
    apiFetch(`admin/chat/conversations/${conversationId}/messages`),
  getChatStats: () => apiFetch('admin/chat/stats'),

  // Admin announcements management
  getAnnouncements: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiFetch(`admin/announcements?${searchParams}`);
  },
  getAnnouncementStats: () => apiFetch('admin/announcements/stats'),
  createAnnouncement: (formData) => 
    apiFormFetch('admin/announcements', {
      method: 'POST',
      body: formData,
    }),
  updateAnnouncement: (id, formData) => 
    apiFormFetch(`admin/announcements/${id}`, {
      method: 'POST',
      body: formData,
    }),
  deleteAnnouncement: (id) => 
    apiFetch(`admin/announcements/${id}`, { method: 'DELETE' }),
  toggleAnnouncementStatus: (id) => 
    apiFetch(`admin/announcements/${id}/toggle-status`, { method: 'POST' }),
  
  // Admin Cities management
  getCities: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiFetch(`admin/cities?${searchParams}`);
  },
  createCity: (cityData) => 
    apiFetch('admin/cities', {
      method: 'POST',
      body: JSON.stringify(cityData),
    }),
  updateCity: (cityId, cityData) => 
    apiFetch(`admin/cities/${cityId}`, {
      method: 'PUT',
      body: JSON.stringify(cityData),
    }),
  deleteCity: (cityId) => 
    apiFetch(`admin/cities/${cityId}`, { method: 'DELETE' }),

  // Platform profits (admin)
  getPlatformProfits: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiFetch(`admin/platform-profits?${searchParams}`);
  },
};

// Seller API for product/gig CRUD
export const sellerApi = {
  // Get seller's own products/gigs
  getSellerProducts: async () => {
    return apiFetch('seller/products');
  },
  
  getProductById: async (id) => {
    return apiFetch(`seller/products/${id}`);
  },
  
  createProduct: async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (key === 'images') {
          value.forEach((file) => formData.append('images[]', file));
        } else if (key === 'tags') {
          value.forEach((tag) => formData.append('tags[]', tag));
        }
      } else {
        formData.append(key, value);
      }
    });
    return apiFormFetch('seller/products', {
      method: 'POST',
      body: formData,
    });
  },  updateProduct: async (id, data) => {
    const formData = new FormData();
    
    // Process form data
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (key === 'images') {
          // Only append files, not string URLs
          value.forEach((file) => {
            if (file instanceof File) {
              formData.append('images[]', file);
            }
          });
        } else if (key === 'tags') {
          value.forEach((tag) => formData.append('tags[]', tag));
        } else if (key === 'existing_images') {
          // For existing images we want to keep
          value.forEach((imgUrl, index) => {
            formData.append(`existing_images[${index}]`, imgUrl);
          });
        } else {
          // Generic array handling
          value.forEach((item) => formData.append(`${key}[]`, item));
        }
      } else if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    // Add _method=PUT for Laravel to handle it as PUT request
    formData.append('_method', 'PUT');
    
    return apiFormFetch(`seller/products/${id}`, {
      method: 'POST', // Using POST but Laravel will treat it as PUT due to _method
      body: formData,
    });
  },
  deleteProduct: async (id) => {
    return apiFetch(`seller/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Seller order management functions
  getSellerOrders: (params = {}) => {
    const searchParams = new URLSearchParams({ seller_orders: true, ...params });
    return apiFetch(`orders?${searchParams}`);
  },
  
  // Seller order workflow functions
  approveOrder: (orderId, data = {}) => {
    // Handle both old format (notes as string) and new format (data object)
    const payload = typeof data === 'string' ? { notes: data } : data;
    return apiFetch(`orders/${orderId}/seller-approve`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  
  // Price approval functions
  approveProposedPrice: (orderId, notes = '') =>
    apiFetch(`orders/${orderId}/approve-price`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),
  rejectProposedPrice: (orderId, reason = '') =>
    apiFetch(`orders/${orderId}/reject-price`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  
  startWork: (orderId, notes = '') => 
    apiFetch(`orders/${orderId}/start-work`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),
  completeWork: (orderId, notes = '', deliveryDate = null) => 
    apiFetch(`orders/${orderId}/complete-work`, {
      method: 'POST',
      body: JSON.stringify({ notes, delivery_date: deliveryDate }),
    }),
};

// Delivery API functions
export const deliveryApi = {
  // Authentication
  login: (credentials) => 
    apiFetch('delivery/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  logout: () => 
    deliveryApiFetch('delivery/logout', { method: 'POST' }),
  
  // Profile and stats
  getProfile: () => deliveryApiFetch('delivery/profile'),
  getStats: () => deliveryApiFetch('delivery/stats'),
  toggleAvailability: () => 
    deliveryApiFetch('delivery/toggle-availability', { method: 'POST' }),
  
  // Orders management
  getOrdersToPickup: () => deliveryApiFetch('delivery/orders-to-pickup'), // الطلبات المخصصة للاستلام
  getOrdersToDeliver: () => deliveryApiFetch('delivery/orders-to-deliver'), // الطلبات المخصصة للتسليم
  getOrderDetails: (orderId) => deliveryApiFetch(`delivery/orders/${orderId}`),
  
  // Order actions
  pickupOrder: (orderId) => 
    deliveryApiFetch(`delivery/orders/${orderId}/pickup`, {
      method: 'POST',
    }),
  deliverOrder: (orderId) => 
    deliveryApiFetch(`delivery/orders/${orderId}/deliver`, {
      method: 'POST',
    }),
  suspendOrder: (orderId, data) =>
    deliveryApiFetch(`delivery/orders/${orderId}/suspend`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Get all orders assigned to delivery person
  myOrders: () => deliveryApiFetch('delivery/my-orders'),
  
  // Get suspended orders
  suspendedOrders: () => deliveryApiFetch('delivery/suspended-orders'),
};
