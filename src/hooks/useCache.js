// src/hooks/useCache.js
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

/**
 * Hook for fetching categories with caching
 * Categories are cached for 1 hour and shared across all components
 */
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
    staleTime: 1000 * 60 * 60, // 1 hour
    cacheTime: 1000 * 60 * 60 * 2, // 2 hours
  });
}

/**
 * Hook for fetching gift sections with caching
 * Gift sections are cached for 30 minutes
 */
export function useGiftSections() {
  return useQuery({
    queryKey: ['giftSections'],
    queryFn: () => api.getGiftSections(),
    staleTime: 1000 * 60 * 30, // 30 minutes
    cacheTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook for fetching site settings with caching
 * Settings are cached for 1 hour
 */
export function useSiteSettings() {
  return useQuery({
    queryKey: ['siteSettings', 'general'],
    queryFn: () => api.getGeneralSiteSettings(),
    staleTime: 1000 * 60 * 60, // 1 hour
    cacheTime: 1000 * 60 * 60 * 2, // 2 hours
  });
}

/**
 * Hook for fetching explore page data with caching
 * This hook handles tabs (gigs, products, sellers) with smart caching
 * Each tab's data is cached separately based on filters
 */
export function useExploreData(tab, filters = {}) {
  const queryKey = ['explore', tab, filters];
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      const params = [];
      
      // Add filters to params
      if (filters.category) params.push(`category_id=${filters.category}`);
      if (filters.search) params.push(`search=${encodeURIComponent(filters.search)}`);
      if (filters.sort) params.push(`sort=${filters.sort}`);
      if (filters.minPrice) params.push(`min_price=${filters.minPrice}`);
      if (filters.maxPrice) params.push(`max_price=${filters.maxPrice}`);
      if (filters.rating) params.push(`rating=${filters.rating}`);
      if (filters.page) params.push(`page=${filters.page}`);

      // Use different endpoints for different tabs
      if (tab === 'sellers') {
        return api.apiFetch(`explore/sellers?${params.join('&')}`);
      } else {
        // Both 'gigs' and 'products' use the same endpoint
        return api.apiFetch(`explore/products?${params.join('&')}`);
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 15, // 15 minutes
    keepPreviousData: true, // Keep previous data while fetching new data
  });
}
