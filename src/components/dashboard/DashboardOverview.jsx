
import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingBag, Users, BarChart3, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const StatCard = ({ title, value, icon, color, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card className={`border-${color}-500 border-t-4 shadow-lg hover:shadow-xl transition-shadow`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        {React.createElement(icon, { className: `h-5 w-5 text-${color}-500` })}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-800">{value}</div>
        <p className="text-xs text-muted-foreground pt-1">{description}</p>
      </CardContent>
    </Card>
  </motion.div>
);

const DashboardOverview = () => {
  const { user } = useAuth();

  
  const stats = user?.active_role === 'seller' ? [
    { title: "إجمالي الأرباح", value: "12,500 جنيه", icon: DollarSign, color: "green", description: "+15% عن الشهر الماضي" },
    { title: "الطلبات الجديدة", value: "32", icon: ShoppingBag, color: "blue", description: "+5 طلبات اليوم" },
    { title: "إجمالي الخدمات", value: "15", icon: BarChart3, color: "orange", description: "2 خدمة غير نشطة" },
    { title: "العملاء النشطون", value: "120", icon: Users, color: "purple", description: "متوسط تقييم 4.8" },
  ] : [
    { title: "إجمالي الطلبات", value: "18", icon: ShoppingBag, color: "blue", description: "3 طلبات قيد التنفيذ" },
    { title: "المبلغ المنفق", value: "4,200 جنيه", icon: DollarSign, color: "green", description: "متوسط قيمة الطلب 233 جنيه" },
    { title: "البائعون المفضلون", value: "5", icon: Users, color: "purple", description: "تواصل معهم الآن" },
    { title: "الرسائل غير المقروءة", value: "2", icon: MessageCircle, color: "orange", description: "من ليلى حسن وكريم محمود" },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8">
      <motion.h1 
        className="text-3xl font-bold text-gray-800"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        {user?.active_role === 'seller' ? 'نظرة عامة على أداء متجرك' : 'ملخص حسابك'}
      </motion.h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-gray-700">الطلبات الأخيرة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">هنا ستظهر قائمة بأحدث الطلبات.</p>
              
              <ul className="mt-4 space-y-2">
                <li className="flex justify-between p-2 bg-gray-50 rounded-md"><span>طلب #1234</span> <span className="text-green-600">مكتمل</span></li>
                <li className="flex justify-between p-2 bg-gray-50 rounded-md"><span>طلب #1235</span> <span className="text-blue-600">قيد التنفيذ</span></li>
                <li className="flex justify-between p-2 bg-gray-50 rounded-md"><span>طلب #1236</span> <span className="text-burntOrange">في انتظار الدفع</span></li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-gray-700">{user?.active_role === 'seller' ? 'الخدمات الأكثر مبيعاً' : 'المنتجات المفضلة'}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">هنا ستظهر قائمة بالخدمات أو المنتجات.</p>
              
               <ul className="mt-4 space-y-2">
                <li className="p-2 bg-gray-50 rounded-md">مجوهرات فضية مخصصة</li>
                <li className="p-2 bg-gray-50 rounded-md">صناديق خشبية مزخرفة</li>
                <li className="p-2 bg-gray-50 rounded-md">وسائد مطرزة يدوياً</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardOverview;
