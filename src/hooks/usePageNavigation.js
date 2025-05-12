import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSidebar } from '@/contexts/SidebarContext';

/**
 * Custom hook that automatically closes the mobile sidebar when navigating between pages
 */
export function usePageNavigation() {
  const location = useLocation();
  const { isMobile, closeMobileSidebar } = useSidebar();

  useEffect(() => {
    // Close the sidebar on mobile when navigating to a new page
    if (isMobile) {
      closeMobileSidebar();
    }
  }, [location.pathname, isMobile, closeMobileSidebar]);

  return location;
}
