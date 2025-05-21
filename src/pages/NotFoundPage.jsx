
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-lightBeige p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, duration: 0.5 }}
        className="w-full max-w-lg text-center"
      >
        <Card className="shadow-2xl border-orange-200 overflow-hidden">
          <CardHeader className="bg-olivePrimary p-8">
            <AlertTriangle className="h-20 w-20 text-white mx-auto mb-4" />
            <CardTitle className="text-5xl font-extrabold text-white">404</CardTitle>
            <CardDescription className="text-xl text-lightBeige mt-2">
              عفواً، الصفحة التي تبحث عنها غير موجودة.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <p className="text-gray-600 mb-8 text-lg">
              ربما تم حذف الصفحة، أو تغيير اسمها، أو أنها غير متاحة مؤقتاً.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link to="/">
                  <Home className="ml-2 h-5 w-5" />
                  العودة إلى الصفحة الرئيسية
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10">
                <Link to="/explore">
                  استكشاف المنتجات
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <p className="mt-8 text-sm text-gray-500">
          إذا كنت تعتقد أن هذا خطأ، يرجى <Link to="/contact" className="text-primary hover:underline">الاتصال بالدعم</Link>.
        </p>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
