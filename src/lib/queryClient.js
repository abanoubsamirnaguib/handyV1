// src/lib/queryClient.js
import { QueryClient } from '@tanstack/react-query';

// Configure React Query with sensible defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 1 hour (matches backend cache)
      staleTime: 1000 * 60 * 60, // 1 hour
      cacheTime: 1000 * 60 * 60 * 2, // 2 hours
      // Retry failed requests
      retry: 1,
      // Don't refetch on window focus for static data
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect for static data
      refetchOnReconnect: false,
    },
  },
});
