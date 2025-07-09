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

// General API functions
export const api = {
  // Categories
  getCategories: () => apiFetch('listcategories'),
  
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
  uploadPaymentProof: (orderId, imageFile) => {
    const formData = new FormData();
    formData.append('payment_proof', imageFile);
    
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

  // Wishlist functions
  getWishlist: () => apiFetch('wishlist-items'),
  addToWishlist: (productId) => 
    apiFetch('wishlist-items', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    }),
  removeFromWishlist: (wishlistItemId) => 
    apiFetch(`wishlist-items/${wishlistItemId}`, { method: 'DELETE' }),

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

  // Reviews API functions
  getProductReviews: (productId) => apiFetch(`products/${productId}/reviews`),
  getSellerReviews: (sellerId) => apiFetch(`sellers/${sellerId}/reviews`),
  getOrderReviews: (orderId) => apiFetch(`orders/${orderId}/reviews`),
  canReviewOrder: (orderId) => apiFetch(`orders/${orderId}/can-review`),
  createReview: (reviewData) => 
    apiFetch('reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    }),
  updateReview: (reviewId, reviewData) => 
    apiFetch(`reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    }),
  deleteReview: (reviewId) => 
    apiFetch(`reviews/${reviewId}`, { method: 'DELETE' }),
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
  createCategory: (categoryData) => 
    apiFetch('categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    }),
  updateCategory: (categoryId, categoryData) => 
    apiFetch(`categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    }),
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
  getPendingApprovalOrders: () => apiFetch('orders/pending-approval'),
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
  approveOrder: (orderId, notes = '') => 
    apiFetch(`orders/${orderId}/seller-approve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
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
  // Get orders ready for delivery
  getReadyForDelivery: () => apiFetch('orders/ready-for-delivery'),
  
  // Delivery workflow functions
  pickupOrder: (orderId, notes = '') => 
    apiFetch(`orders/${orderId}/pickup-delivery`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),
  markAsDelivered: (orderId, notes = '') => 
    apiFetch(`orders/${orderId}/mark-delivered`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),
  
  // Get delivery person orders
  getDeliveryOrders: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiFetch(`orders?delivery=true&${searchParams}`);
  },
};
