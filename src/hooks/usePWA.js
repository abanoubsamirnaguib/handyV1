import { useState, useEffect } from 'react';

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      // For standalone mode (PWA installed)
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return;
      }
      
      // For iOS Safari
      if (window.navigator.standalone === true) {
        setIsInstalled(true);
        return;
      }
      
      // Check if running in PWA context
      if (document.referrer.includes('android-app://')) {
        setIsInstalled(true);
        return;
      }
    };

    checkIfInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event so it can be triggered later
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return false;

    try {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
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

  return {
    isInstallable,
    isInstalled,
    installApp,
    getInstallInstructions,
    canInstall: isInstallable && !isInstalled
  };
};