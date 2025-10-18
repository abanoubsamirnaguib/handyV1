import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Smartphone, Monitor, CheckCircle, Info, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePWA } from '@/hooks/usePWA';
import '@/styles/pwa.css';

const PWAInstallSection = () => {
  const { isInstallable, isInstalled, installApp, getInstallInstructions, canInstall } = usePWA();
  const [showInstructions, setShowInstructions] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      await installApp();
    } finally {
      setIsInstalling(false);
    }
  };

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'سرعة فائقة',
      description: 'افتح التطبيق مباشرة من الشاشة الرئيسية بدون انتظار'
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: 'تجربة أصلية',
      description: 'استمتع بتجربة مشابهة للتطبيقات المحلية مع إشعارات فورية'
    },
    {
      icon: <Monitor className="w-6 h-6" />,
      title: 'يعمل بدون إنترنت',
      description: 'تصفح منتجاتك المفضلة وتصفح مشترياتك حتى بدون اتصال'
    }
  ];

  if (isInstalled) {
    return (
      <section className="py-16 bg-gradient-to-br from-roman-50 to-roman-100">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-16 h-16 bg-roman-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-roman-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                تم تثبيت التطبيق بنجاح!
              </h3>
              <p className="text-gray-600">
                يمكنك الآن الوصول إلى بازار مباشرة من الشاشة الرئيسية
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-roman-50 to-roman-100 pwa-install-section">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-4 bg-gradient-to-r from-roman-100 to-roman-200 text-roman-800 px-4 py-1">
              <Download className="w-3 h-3 ml-2" />
              تطبيق الويب التقدمي PWA
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              حمّل تطبيق <span className="text-roman-500">بازار</span> على جهازك
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              احصل على تجربة تسوق استثنائية مع تطبيق بازار. 
              <span className="text-roman-500 font-semibold"> سرعة فائقة</span>، 
              تصميم مُحسّن، وإمكانية التصفح حتى 
              <span className="text-roman-500 font-semibold"> بدون إنترنت</span>.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
          {/* Features */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-start space-x-4 space-x-reverse pwa-feature-card p-4 rounded-xl bg-white hover:bg-white transition-all duration-300"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-roman-500 to-roman-600 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Install Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-white shadow-2xl border-0 pwa-install-card">
              <CardHeader className="text-center pb-4">
                <motion.div 
                  className="w-20 h-20 bg-gradient-to-br from-roman-500 to-roman-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }}
                >
                  <Download className="w-10 h-10 text-white" />
                </motion.div>
                <CardTitle className="text-xl font-bold">
                  تثبيت التطبيق
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {canInstall ? (
                  <>
                    <div className="text-center mb-4">
                      <p className="text-gray-600 text-sm mb-2">
                        اضغط على الزر أدناه لتثبيت التطبيق على جهازك
                      </p>
                      <div className="flex items-center justify-center space-x-2 space-x-reverse text-roman-500 text-xs">
                        <CheckCircle className="w-3 h-3" />
                        <span>تثبيت سريع وآمن</span>
                      </div>
                    </div>
                    <Button 
                      onClick={handleInstall}
                      disabled={isInstalling}
                      className={`w-full bg-gradient-to-r from-roman-500 to-roman-600 hover:from-roman-600 hover:to-roman-700 text-white py-3 text-lg font-semibold shadow-lg ${!isInstalling ? 'pwa-install-button' : ''}`}
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
                ) : (
                  <>
                    <p className="text-center text-gray-600 text-sm">
                      يمكنك تثبيت التطبيق من خلال متصفحك
                    </p>
                    <Button 
                      onClick={() => setShowInstructions(true)}
                      variant="outline"
                      className="w-full border-2 border-roman-500 text-roman-600 hover:bg-roman-50 hover:border-roman-600 transition-colors"
                      size="lg"
                    >
                      <Info className="ml-2 h-5 w-5" />
                      شرح طريقة التثبيت
                    </Button>
                  </>
                )}
                
                <div className="text-center pt-2">
                  <p className="text-xs text-gray-500 flex items-center justify-center space-x-1 space-x-reverse">
                    <CheckCircle className="w-3 h-3 text-roman-500" />
                    <span>متوافق مع جميع الأجهزة والمتصفحات الحديثة</span>
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