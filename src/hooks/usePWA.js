import { useState, useEffect } from 'react';

// Global variable to store the deferred prompt across navigation
let globalDeferredPrompt = null;
let globalInstallableState = false;

// Storage keys
const STORAGE_KEYS = {
  PWA_INSTALLABLE: 'pwa_installable',
  PWA_INSTALLED: 'pwa_installed'
};

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(globalDeferredPrompt);
  const [isInstallable, setIsInstallable] = useState(globalInstallableState);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check localStorage for previous states
    const savedInstallable = localStorage.getItem(STORAGE_KEYS.PWA_INSTALLABLE) === 'true';
    const savedInstalled = localStorage.getItem(STORAGE_KEYS.PWA_INSTALLED) === 'true';

    // Check if browser supports PWA features
    const supportsPWA = () => {
      // Check for service worker support
      if (!('serviceWorker' in navigator)) return false;
      
      // Check for manifest support  
      if (!window.navigator.userAgent.includes('Chrome') && 
          !window.navigator.userAgent.includes('Edge') && 
          !window.navigator.userAgent.includes('Samsung')) {
        // Only Chrome, Edge, and Samsung browsers reliably support PWA install prompts
        return false;
      }
      
      return true;
    };

    // Check if app is already installed
    const checkIfInstalled = () => {
      // For standalone mode (PWA installed)
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        localStorage.setItem(STORAGE_KEYS.PWA_INSTALLED, 'true');
        localStorage.setItem(STORAGE_KEYS.PWA_INSTALLABLE, 'false');
        return true;
      }
      
      // For iOS Safari
      if (window.navigator.standalone === true) {
        setIsInstalled(true);
        localStorage.setItem(STORAGE_KEYS.PWA_INSTALLED, 'true');
        localStorage.setItem(STORAGE_KEYS.PWA_INSTALLABLE, 'false');
        return true;
      }
      
      // Check if running in PWA context
      if (document.referrer.includes('android-app://')) {
        setIsInstalled(true);
        localStorage.setItem(STORAGE_KEYS.PWA_INSTALLED, 'true');
        localStorage.setItem(STORAGE_KEYS.PWA_INSTALLABLE, 'false');
        return true;
      }

      // If we reach here, app is NOT currently installed
      // Clear the saved installed state if it was previously set
      if (savedInstalled) {
        localStorage.removeItem(STORAGE_KEYS.PWA_INSTALLED);
        setIsInstalled(false);
      }
      
      return false;
    };

    const installed = checkIfInstalled();
    
    // If app is not installed, restore the global state or reset for re-installation
    if (!installed) {
      // Reset the installed state
      setIsInstalled(false);
      
      if (globalDeferredPrompt || savedInstallable) {
        setDeferredPrompt(globalDeferredPrompt);
        setIsInstallable(globalInstallableState || savedInstallable);
        if (savedInstallable) {
          globalInstallableState = true;
        }
      }
      // If browser supports PWA but no prompt received yet, 
      // set a timeout to show manual instructions
      else if (supportsPWA()) {
        // Check periodically if the prompt becomes available
        const checkForPrompt = () => {
          if (!globalDeferredPrompt && !isInstalled && !savedInstallable) {
            // Don't set installable to false immediately, give it some time
            setTimeout(() => {
              if (!globalDeferredPrompt && !isInstalled) {
                setIsInstallable(false); // This will trigger showManualInstructions
              }
            }, 2000);
          }
        };
        
        setTimeout(checkForPrompt, 1000);
      }
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event so it can be triggered later
      globalDeferredPrompt = e;
      globalInstallableState = true;
      setDeferredPrompt(e);
      setIsInstallable(true);
      // Clear the installed state since the prompt is available again
      setIsInstalled(false);
      localStorage.setItem(STORAGE_KEYS.PWA_INSTALLABLE, 'true');
      localStorage.removeItem(STORAGE_KEYS.PWA_INSTALLED);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      globalDeferredPrompt = null;
      globalInstallableState = false;
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      localStorage.setItem(STORAGE_KEYS.PWA_INSTALLED, 'true');
      localStorage.setItem(STORAGE_KEYS.PWA_INSTALLABLE, 'false');
    };

    // Check if we already have a saved prompt that's still valid
    if (globalDeferredPrompt && !installed) {
      setDeferredPrompt(globalDeferredPrompt);
      setIsInstallable(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Listen for visibility change to check for uninstallation when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Tab became visible, check if app is still installed
        const currentlyInstalled = checkIfInstalled();
        if (!currentlyInstalled && isInstalled) {
          setIsInstalled(false);
          localStorage.removeItem(STORAGE_KEYS.PWA_INSTALLED);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Periodic check for uninstallation
    const checkUninstallInterval = setInterval(() => {
      const currentlyInstalled = checkIfInstalled();
      if (!currentlyInstalled && isInstalled) {
        setIsInstalled(false);
        localStorage.removeItem(STORAGE_KEYS.PWA_INSTALLED);
        // The next beforeinstallprompt event will make it installable again
      }
    }, 3000); // Check every 3 seconds

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(checkUninstallInterval);
    };
  }, []);



  const installApp = async () => {
    const promptToUse = deferredPrompt || globalDeferredPrompt;
    if (!promptToUse) return false;

    try {
      // Show the install prompt
      promptToUse.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await promptToUse.userChoice;
      
      if (outcome === 'accepted') {
        globalDeferredPrompt = null;
        globalInstallableState = false;
        setIsInstalled(true);
        setIsInstallable(false);
        localStorage.setItem(STORAGE_KEYS.PWA_INSTALLED, 'true');
        localStorage.setItem(STORAGE_KEYS.PWA_INSTALLABLE, 'false');
      }
      
      // Reset the deferred prompt
      setDeferredPrompt(null);
      
      return outcome === 'accepted';
    } catch (error) {
      console.error('Error installing PWA:', error);
      return false;
    }
  };

  const getInstallInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      return {
        browser: 'Chrome',
        steps: [
          'اضغط على أيقونة القائمة (ثلاث نقاط) في أعلى اليمين',
          'اختر "تثبيت التطبيق" أو "Add to Home screen"',
          'اضغط على "تثبيت" في النافذة المنبثقة'
        ]
      };
    } else if (userAgent.includes('firefox')) {
      return {
        browser: 'Firefox',
        steps: [
          'اضغط على أيقونة القائمة (ثلاث خطوط) في أعلى اليمين',
          'اختر "تثبيت" أو "Install"',
          'اضغط على "تثبيت" في النافذة المنبثقة'
        ]
      };
    } else if (userAgent.includes('safari')) {
      return {
        browser: 'Safari',
        steps: [
          'اضغط على أيقونة المشاركة في أسفل الشاشة',
          'مرر لأسفل واختر "Add to Home Screen"',
          'اضغط على "إضافة" لتثبيت التطبيق'
        ]
      };
    } else if (userAgent.includes('edg')) {
      return {
        browser: 'Edge',
        steps: [
          'اضغط على أيقونة القائمة (ثلاث نقاط) في أعلى اليمين',
          'اختر "Apps" ثم "Install this site as an app"',
          'اضغط على "تثبيت" في النافذة المنبثقة'
        ]
      };
    }
    
    return {
      browser: 'المتصفح',
      steps: [
        'ابحث عن خيار "تثبيت التطبيق" أو "Add to Home Screen" في قائمة المتصفح',
        'اتبع الخطوات المعروضة لتثبيت التطبيق'
      ]
    };
  };

  const clearPWAState = () => {
    localStorage.removeItem(STORAGE_KEYS.PWA_INSTALLABLE);
    localStorage.removeItem(STORAGE_KEYS.PWA_INSTALLED);
    globalDeferredPrompt = null;
    globalInstallableState = false;
    setDeferredPrompt(null);
    setIsInstallable(false);
    setIsInstalled(false);
    
    // Force re-check after clearing state
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const recheckInstallStatus = () => {
    // Check if app is currently installed
    const currentlyInstalled = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches ||
                              window.navigator.standalone === true ||
                              document.referrer.includes('android-app://');
    
    if (!currentlyInstalled && isInstalled) {
      setIsInstalled(false);
      localStorage.removeItem(STORAGE_KEYS.PWA_INSTALLED);
    } else if (currentlyInstalled && !isInstalled) {
      setIsInstalled(true);
      localStorage.setItem(STORAGE_KEYS.PWA_INSTALLED, 'true');
    }
    
    return currentlyInstalled;
  };

  return {
    isInstallable: isInstallable || (globalDeferredPrompt && !isInstalled),
    isInstalled,
    installApp,
    getInstallInstructions,
    canInstall: (isInstallable || (globalDeferredPrompt && !isInstalled)) && !isInstalled,
    // Add a fallback for browsers that support PWA but haven't triggered the event yet
    showManualInstructions: !isInstalled && !isInstallable && !globalDeferredPrompt
  };
};