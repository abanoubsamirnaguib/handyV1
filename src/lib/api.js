// src/lib/api.js

// Use import.meta.env for Vite env variables
const BASE_URL = import.meta.env.VITE_API_BASE_URL + '/api/' || 'http://localhost:8000/api/';

export function apiUrl(path) {
  // Ensure no double slashes
  return `${BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
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
    
    // Debug FormData contents (can't directly console log FormData)
    console.log('FormData keys:');
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1] instanceof File ? 'File object' : pair[1]}`);
    }
    
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
};
