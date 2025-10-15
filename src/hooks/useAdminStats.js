import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export const useAdminStats = () => {
  const [stats, setStats] = useState({
    pending_orders: 0,
    total_orders: 0,
    total_users: 0,
    total_sellers: 0,
    total_products: 0,
    active_users: 0,
    pending_sellers: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchStats = async () => {
    if (!user || user.role !== 'admin') {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await adminApi.getDashboardStats();
      setStats(response || {
        pending_orders: 0,
        total_orders: 0,
        total_users: 0,
        total_sellers: 0,
        total_products: 0,
        active_users: 0,
        pending_sellers: 0
      });
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError(err);
      // Keep current stats on error, don't reset to zero
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Set up interval to refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats
  };
};