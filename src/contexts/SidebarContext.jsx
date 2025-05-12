import React, { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);  // Store the desktop sidebar state separately, persisted in localStorage
  const [desktopSidebarState, setDesktopSidebarState] = useState(() => {
    const saved = localStorage.getItem('desktopSidebarState');
    return saved !== null ? JSON.parse(saved) : true;
  });
  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 768;
      
      if (isMobile !== isMobileView) {
        setIsMobile(isMobileView);
        
        if (isMobileView) {
          // Switching to mobile: store desktop state and close mobile menu
          setDesktopSidebarState(isSidebarOpen);
          setIsMobileMenuOpen(false);
          setIsSidebarOpen(false);
        } else {
          // Switching to desktop: restore desktop state
          setIsSidebarOpen(desktopSidebarState);
          setIsMobileMenuOpen(false);
        }
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile, isSidebarOpen, isMobileMenuOpen, desktopSidebarState]);

  // Save desktop sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('desktopSidebarState', JSON.stringify(desktopSidebarState));
  }, [desktopSidebarState]);  const toggleSidebar = () => {
    if (isMobile) {
      // For mobile: toggle the mobile menu state
      setIsMobileMenuOpen(prev => !prev);
      console.log('Mobile menu toggled to:', !isMobileMenuOpen); // Debug
    } else {
      const newState = !isSidebarOpen;
      setIsSidebarOpen(newState);
      setDesktopSidebarState(newState);
    }
  };

  const closeMobileSidebar = () => {
    if (isMobile && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <SidebarContext.Provider value={{ 
      isSidebarOpen, 
      toggleSidebar, 
      isMobile, 
      isMobileMenuOpen,
      closeMobileSidebar 
    }}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);
