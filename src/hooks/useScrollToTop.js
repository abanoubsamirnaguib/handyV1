import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook that scrolls the referenced element to the top when the route changes
 * @param {Object} options Configuration options
 * @param {boolean} options.scrollToTopOnNavigation Whether to scroll to top on navigation
 * @returns {React.RefObject} A ref to attach to the scrollable element
 */
export function useScrollToTop({ scrollToTopOnNavigation = true } = {}) {
  const scrollRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (scrollToTopOnNavigation && scrollRef.current) {
      scrollRef.current.scrollTo(0, 0);
    }
  }, [location.pathname, scrollToTopOnNavigation]);

  return scrollRef;
}
