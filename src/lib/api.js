// src/lib/api.js

// Use import.meta.env for Vite env variables
const BASE_URL = import.meta.env.VITE_API_BASE_URL + '/api/' || 'http://localhost:3000/api/';

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
  getFeaturedProducts: () => apiFetch('products/search?featured=1&status=active'),
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
