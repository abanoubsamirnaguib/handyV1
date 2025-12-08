import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Monitor, CheckCircle, Info, Globe, Wifi, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';
import '@/styles/pwa-popup.css';

const PWAInstallPopup = () => {
  const { isInstallable, isInstalled, installApp, getInstallInstructions, canInstall } = usePWA();
  const [showPopup, setShowPopup] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false);
  const [deviceType, setDeviceType] = useState('desktop');

  // Detect device type
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isAndroid = /android/i.test(userAgent);
    const isIOS = /iphone|ipad|ipod/i.test(userAgent);
    
    if (isAndroid) {
      setDeviceType('android');
    } else if (isIOS) {
      setDeviceType('ios');
    } else if (isMobile) {
      setDeviceType('mobile');
    } else {
      setDeviceType('desktop');
    }
  }, []);

  // Check if popup should be shown
  useEffect(() => {
    // Don't show if already installed or dismissed
    if (isInstalled || hasBeenDismissed) {
      setShowPopup(false);
      return;
    }

    // Check if user has dismissed popup in current session
    const dismissed = sessionStorage.getItem('pwa-popup-dismissed') === 'true';
    const dismissedCount = parseInt(localStorage.getItem('pwa-popup-dismissed-count') || '0');
    
    if (dismissed || dismissedCount >= 3) {
      setHasBeenDismissed(true);
      return;
    }

    // Show popup after a delay if app is not installed
    const timer = setTimeout(() => {
      if (!isInstalled && !dismissed && dismissedCount < 3) {
        setShowPopup(true);
      }
    }, deviceType === 'android' ? 3000 : 5000); // Shorter delay for Android

    return () => clearTimeout(timer);
  }, [isInstalled, hasBeenDismissed, deviceType]);

  // Watch for install status changes and hide popup immediately if installed
  useEffect(() => {
    if (isInstalled && showPopup) {
      setShowPopup(false);
    }
  }, [isInstalled, showPopup]);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await installApp();
      if (success) {
        setShowPopup(false);
        // Clear dismissal count on successful install
        localStorage.removeItem('pwa-popup-dismissed-count');
      } else if (canInstall) {
        // If install failed but app is installable, show instructions
        setShowInstructions(true);
      }
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPopup(false);
    setHasBeenDismissed(true);
    sessionStorage.setItem('pwa-popup-dismissed', 'true');
    
    // Track dismissal count to avoid showing too many times
    const dismissedCount = parseInt(localStorage.getItem('pwa-popup-dismissed-count') || '0');
    localStorage.setItem('pwa-popup-dismissed-count', (dismissedCount + 1).toString());
  };

  const handleShowInstructions = () => {
    setShowInstructions(true);
  };

  // Get device-specific features
  const getDeviceFeatures = () => {
    switch (deviceType) {
      case 'android':
        return [
          { icon: Smartphone, text: 'إضافة إلى الشاشة الرئيسية', color: 'green' },
          { icon: Zap, text: 'فتح سريع مثل التطبيقات الأخرى', color: 'blue' },
          { icon: Globe, text: 'يعمل بدون متصفح', color: 'purple' },
        ];
      case 'ios':
        return [
          { icon: Smartphone, text: 'إضافة إلى الشاشة الرئيسية', color: 'green' },
          { icon: Monitor, text: 'تجربة تطبيق أصلي', color: 'blue' },
          { icon: Wifi, text: 'يعمل حتى بدون انترنت', color: 'purple' },
        ];
      default:
        return [
          { icon: Monitor, text: 'وصول سريع من سطح المكتب', color: 'green' },
          { icon: Zap, text: 'تحديثات تلقائية', color: 'blue' },
          { icon: CheckCircle, text: 'تجربة محسنة ومتجاوبة', color: 'purple' },
        ];
    }
  };

  // Get device-specific title and description
  const getDeviceContent = () => {
    switch (deviceType) {
      case 'android':
        return {
          title: 'اضف تطبيق بازار لهاتفك',
          description: 'احصل على تجربة تسوق أسرع وأسهل',
          buttonText: 'إضافة للهاتف'
        };
      case 'ios':
        return {
          title: 'ثبت تطبيق بازار على الآيفون',
          description: 'تجربة تسوق مثل التطبيقات الأصلية',
          buttonText: 'إضافة للآيفون'
        };
      default:
        return {
          title: 'تثبيت تطبيق بازار',
          description: 'احصل على تجربة أسرع وأفضل',
          buttonText: 'تثبيت التطبيق'
        };
    }
  };

  // Don't render if installed
  if (isInstalled) {
    return null;
  }

  const content = getDeviceContent();
  const features = getDeviceFeatures();

  return (
    <>
      {/* Install Popup - Only show if not installed and instructions not showing */}
      <AnimatePresence>
        {showPopup && !isInstalled && !showInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-4 z-50"
            style={{ zIndex: 9999 }}
          >
            <motion.div
              initial={{ 
                y: deviceType === 'android' || deviceType === 'ios' ? 100 : 20, 
                opacity: 0, 
                scale: 0.95 
              }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ 
                y: deviceType === 'android' || deviceType === 'ios' ? 100 : 20, 
                opacity: 0, 
                scale: 0.95 
              }}
              className={`bg-white ${
                deviceType === 'android' 
                  ? 'rounded-t-3xl sm:rounded-2xl pwa-popup-android' 
                  : deviceType === 'ios'
                  ? 'rounded-t-3xl sm:rounded-2xl pwa-popup-ios'
                  : 'rounded-2xl'
              } ${
                deviceType === 'android' || deviceType === 'ios' ? 'pwa-popup-mobile' : ''
              } p-6 max-w-md w-full shadow-2xl relative`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="absolute top-4 left-4 p-2 h-8 w-8 hover:bg-gray-100 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>

              {/* App Icon */}
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-roman-500 to-roman-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Download className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {content.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {content.description}
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3 space-x-reverse text-sm">
                    <div className={`w-6 h-6 pwa-popup-feature-${feature.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <feature.icon className="w-4 h-4 pwa-popup-icon" />
                    </div>
                    <span className="text-gray-700">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {canInstall ? (
                  <Button
                    onClick={handleInstall}
                    disabled={isInstalling}
                    className="w-full bg-gradient-to-r from-roman-500 to-roman-600 hover:from-roman-600 hover:to-roman-700 text-white py-3 text-base font-semibold shadow-lg"
                    size="lg"
                  >
                    {isInstalling ? (
                      <>
                        <div className="rounded-full h-4 w-4 border-2 border-white border-t-transparent animate-spin ml-2" />
                        جاري التثبيت...
                      </>
                    ) : (
                      <>
                        <Download className="ml-2 h-5 w-5" />
                        {content.buttonText}
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleShowInstructions}
                    className="w-full bg-gradient-to-r from-roman-500 to-roman-600 hover:from-roman-600 hover:to-roman-700 text-white py-3 text-base font-semibold shadow-lg"
                    size="lg"
                  >
                    <Info className="ml-2 h-5 w-5" />
                    كيفية التثبيت
                  </Button>
                )}
                
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  className="w-full text-gray-500 hover:text-gray-700"
                >
                  لاحقاً
                </Button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions Modal */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            style={{ zIndex: 10000 }}
            onClick={() => setShowInstructions(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-8 h-8 bg-roman-100 rounded-lg flex items-center justify-center">
                    <Info className="w-4 h-4 text-roman-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    كيفية تثبيت التطبيق
                  </h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowInstructions(false)}
                  className="p-1 h-8 w-8 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-roman-50 to-roman-100 rounded-xl p-4 border border-roman-200">
                  <div className="flex items-center space-x-2 space-x-reverse mb-3">
                    <div className="w-5 h-5 bg-roman-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">1</span>
                    </div>
                    <p className="font-semibold text-sm text-roman-800">
                      في متصفح {getInstallInstructions().browser}:
                    </p>
                  </div>
                  <ol className="list-none space-y-2 text-sm text-gray-700">
                    {getInstallInstructions().steps.map((step, index) => (
                      <li key={index} className="flex items-start space-x-2 space-x-reverse">
                        <div className="w-1.5 h-1.5 bg-roman-400 rounded-full mt-2 flex-shrink-0" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                
                <div className="text-center bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-center space-x-2 space-x-reverse text-roman-500 mb-1">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">نصيحة</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    بعد التثبيت، ستجد أيقونة التطبيق على الشاشة الرئيسية وستتمكن من فتحه مثل أي تطبيق آخر
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PWAInstallPopup;