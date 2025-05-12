// A hook for toggling development mode indicators
import { useState, useEffect } from 'react';

export const useDevMode = (initialState = false) => {
  // Check localStorage for saved preference
  const [isDevMode, setIsDevMode] = useState(() => {
    const saved = localStorage.getItem('devModeEnabled');
    return saved !== null ? JSON.parse(saved) : initialState;
  });

  // Toggle dev mode function
  const toggleDevMode = () => {
    const newState = !isDevMode;
    setIsDevMode(newState);
    localStorage.setItem('devModeEnabled', JSON.stringify(newState));
    
    // Apply or remove the class from body
    if (newState) {
      document.body.classList.add('dev-mode-enabled');
    } else {
      document.body.classList.remove('dev-mode-enabled');
    }
  };
  
  // Set up initial state on mount
  useEffect(() => {
    if (isDevMode) {
      document.body.classList.add('dev-mode-enabled');
    } else {
      document.body.classList.remove('dev-mode-enabled');
    }
    
    // Clean up on unmount
    return () => {
      document.body.classList.remove('dev-mode-enabled');
    };
  }, [isDevMode]);
  
  return { isDevMode, toggleDevMode };
};
