import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Smartphone, Monitor, CheckCircle, Info, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePWA } from '@/hooks/usePWA';
import '@/styles/pwa.css';

const PWAInstallSection = () => {
  const { isInstallable, isInstalled, installApp, getInstallInstructions, canInstall, showManualInstructions, clearPWAState } = usePWA();
  const [showInstructions, setShowInstructions] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await installApp();
      if (!success && canInstall) {
        // If install failed but app is installable, show instructions
        setShowInstructions(true);
      }
    } finally {
      setIsInstalling(false);
    }
  };

  const handleRefreshForInstall = () => {
    // Clear the PWA state and reload to try getting the install prompt again
    clearPWAState();
    window.location.reload();
  };

  const mockupGallery = [
    {
      image: "/mockup/بازار-منصة-للمنتجات-اليدوية-10-19-2025_02_36_AM-portrait.png",
      title: "تصفح المنتجات"
    },
    {
      image: "/mockup/بازار-منصة-للمنتجات-اليدوية-10-19-2025_02_37_AM-portrait.png",
      title: "تجربة الشراء"
    },
    {
      image: "/mockup/بازار-منصة-للمنتجات-اليدوية-10-19-2025_02_36_AM-left.png",
      title: "واجهة سهلة"
    }
  ];

  // dont uncomment this part yet
  // if (isInstalled) {
  //   return (
  //     <section className="py-16 bg-gradient-to-br from-roman-50 to-roman-100">
  //       <div className="container mx-auto px-4 text-center">
  //         <motion.div
  //           initial={{ opacity: 0, scale: 0.9 }}
  //           animate={{ opacity: 1, scale: 1 }}
  //           transition={{ duration: 0.6 }}
  //           className="max-w-md mx-auto"
  //         >
  //           <div className="bg-white rounded-2xl p-8 shadow-lg">
  //             <div className="w-16 h-16 bg-roman-100 rounded-full flex items-center justify-center mx-auto mb-4">
  //               <CheckCircle className="w-8 h-8 text-roman-500" />
  //             </div>
  //             <h3 className="text-2xl font-bold text-gray-900 mb-2">
  //               تم تثبيت التطبيق بنجاح!
  //             </h3>
  //             <p className="text-gray-600">
  //               يمكنك الآن الوصول إلى بازار مباشرة من الشاشة الرئيسية
  //             </p>
  //           </div>
  //         </motion.div>
  //       </div>
  //     </section>
  //   );
  // }

  return (
    <section className="py-12 bg-gradient-to-br from-roman-50 to-roman-100 pwa-install-section">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              حمّل تطبيق <span className="text-roman-500">بازار</span> على جهازك
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              احصل على تجربة تسوق استثنائية مع تطبيق بازار. سرعة فائقة، تصميم مُحسّن
              </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
          {/* Phone Mockup Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Three Phones Horizontal Display */}
            <div className="flex justify-center items-end space-x-4 space-x-reverse mb-8">
              {/* Left Phone */}
              <motion.div
                initial={{ opacity: 0, y: 30, rotate: -5 }}
                animate={{ opacity: 1, y: 0, rotate: -8 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative z-10 transform"
              >
                <motion.img 
                  src={mockupGallery[0].image}
                  alt={mockupGallery[0].title}
                  className="w-40 h-auto drop-shadow-xl"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                />
              </motion.div>

              {/* Center Phone (Main/Larger) */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative z-20"
              >
                <motion.img 
                  src={mockupGallery[1].image}
                  alt={mockupGallery[1].title}
                  className="w-52 h-auto drop-shadow-2xl"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />
                {/* Glow effect for center phone */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-roman-400 to-roman-600 rounded-full blur-3xl -z-10 scale-75"
                />
              </motion.div>

              {/* Right Phone */}
              <motion.div
                initial={{ opacity: 0, y: 30, rotate: 5 }}
                animate={{ opacity: 1, y: 0, rotate: 8 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="relative z-10 transform"
              >
                <motion.img 
                  src={mockupGallery[2].image}
                  alt={mockupGallery[2].title}
                  className="w-40 h-auto drop-shadow-xl"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                />
              </motion.div>
            </div>


            {/* Floating Elements */}
            <motion.div
              animate={{ 
                y: [0, -15, 0],
                rotate: 360,
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ 
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-8 right-4 w-3 h-3 bg-gradient-to-r from-roman-400 to-roman-500 rounded-full shadow-lg z-0"
            />
            
            <motion.div
              animate={{ 
                y: [0, 12, 0],
                rotate: -360,
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 3
              }}
              className="absolute bottom-12 left-8 w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full shadow-lg z-0"
            />
          </motion.div>

          {/* Install Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-white shadow-xl border-0 h-full flex flex-col justify-between">
              <CardHeader className="text-center pb-4">
                <motion.div 
                  className="w-20 h-20 bg-gradient-to-br from-roman-500 to-roman-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Download className="w-10 h-10 text-white" />
                </motion.div>
                <CardTitle className="text-xl font-bold mb-2">تثبيت التطبيق</CardTitle>

              </CardHeader>
              
              <CardContent className="space-y-6 flex-1">
                {/* Features Section */}


                {/* Additional Benefits */}
                <div className="bg-gradient-to-br from-roman-50 to-roman-100 rounded-xl p-4 border border-roman-200">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 space-x-reverse text-roman-700">
                      <Monitor className="w-4 h-4" />
                      <span className="text-sm font-medium">متوافق مع جميع الأجهزة</span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse text-roman-700">
                      <Zap className="w-4 h-4" />
                      <span className="text-sm font-medium">تحديثات تلقائية</span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse text-roman-700">
                      <Smartphone className="w-4 h-4" />
                      <span className="text-sm font-medium">واجهة مُحسّنة للمحمول</span>
                    </div>
                  </div>
                </div>

                {/* Install Button Section */}
                <div className="space-y-4">
                  {canInstall ? (
                    <>
                      <div className="text-center">
                        <p className="text-gray-600 text-sm mb-2">
                          اضغط على الزر أدناه لتثبيت التطبيق على جهازك
                        </p>
                      </div>
                      <Button 
                        onClick={handleInstall}
                        disabled={isInstalling}
                        className="w-full bg-gradient-to-r from-roman-500 to-roman-600 hover:from-roman-600 hover:to-roman-700 text-white py-3 text-lg font-semibold shadow-lg pwa-install-button"
                        size="lg"
                      >
                        {isInstalling ? (
                          <>
                            <div className="install-spinner rounded-full h-4 w-4 border-2 border-white border-t-transparent ml-2" />
                            جاري التثبيت...
                          </>
                        ) : (
                          <>
                            <Download className="ml-2 h-5 w-5" />
                            تثبيت التطبيق الآن
                          </>
                        )}
                      </Button>
                    </>
                  ) : showManualInstructions ? (
                    <>
                      <div className="text-center">
                        <p className="text-gray-600 text-sm mb-2">
                          يمكنك تثبيت التطبيق من خلال متصفحك بسهولة
                        </p>
                        <p className="text-gray-500 text-xs">
                          اتبع التعليمات البسيطة لإضافة التطبيق إلى شاشتك الرئيسية
                        </p>
                      </div>
                      <Button 
                        onClick={() => setShowInstructions(true)}
                        variant="outline"
                        className="w-full border-2 border-roman-500 text-roman-600 hover:bg-roman-50 hover:border-roman-600 transition-colors py-3 text-lg font-semibold"
                        size="lg"
                      >
                        <Info className="ml-2 h-5 w-5" />
                        شرح طريقة التثبيت
                      </Button>
                    </>
                  ) : !isInstalled ? (
                    <>
                      <div className="text-center">
                        <p className="text-gray-600 text-sm mb-2">
                          التطبيق متاح للتثبيت على هذا الجهاز
                        </p>
                        <p className="text-gray-500 text-xs">
                          قم بزيارة الصفحة الرئيسية مرة أخرى أو حدث الصفحة لإظهار زر التثبيت
                        </p>
                      </div>
                      <Button 
                        onClick={handleRefreshForInstall}
                        variant="outline"
                        className="w-full border-2 border-roman-500 text-roman-600 hover:bg-roman-50 hover:border-roman-600 transition-colors py-3 text-lg font-semibold"
                        size="lg"
                      >
                        <Info className="ml-2 h-5 w-5" />
                        تحديث الصفحة
                      </Button>
                    </>
                  ) : null}
                </div>

                {/* Security Note */}
                <div className="text-center pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 flex items-center justify-center space-x-1 space-x-reverse">
                    <CheckCircle className="w-3 h-3 text-roman-500" />
                    <span>آمن ومعتمد</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        {/* Instructions Modal */}
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
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
      </div>
    </section>
  );
};

export default PWAInstallSection;