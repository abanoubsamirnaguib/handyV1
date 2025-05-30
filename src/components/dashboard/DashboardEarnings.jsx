
import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Download, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';


const earningsData = {
  totalRevenue: 12500.75,
  pendingClearance: 1500.00,
  withdrawn: 8000.00,
  availableForWithdrawal: 3000.75,
  monthlyBreakdown: [
    { month: 'يناير', earnings: 1200 },
    { month: 'فبراير', earnings: 1500 },
    { month: 'مارس', earnings: 1800 },
    { month: 'أبريل', earnings: 1300 },
    { month: 'مايو', earnings: 2000 },
  ],
};

const DashboardEarnings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (user?.active_role !== 'seller') {
    return (
      <div className="p-6 md:p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-700">غير مصرح لك بالدخول</h1>
        <p className="text-gray-500">هذه الصفحة مخصصة للبائعين فقط.</p>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">العودة للوحة التحكم</Button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <motion.div 
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800">الأرباح</h1>
          <p className="text-gray-500">تابع إيراداتك وقم بإدارة عمليات السحب.</p>
        </div>
        <Button className="mt-4 sm:mt-0 bg-green-500 hover:bg-green-600">
          <DollarSign className="ml-2 h-5 w-5" /> سحب الأرباح
        </Button>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "إجمالي الإيرادات", value: `${earningsData.totalRevenue.toFixed(2)} جنيه`, icon: TrendingUp, color: "blue" },
          { title: "قيد التحصيل", value: `${earningsData.pendingClearance.toFixed(2)} جنيه`, icon: Clock, color: "orange" },
          { title: "تم سحبها", value: `${earningsData.withdrawn.toFixed(2)} جنيه`, icon: Download, color: "purple" },
          { title: "متاح للسحب", value: `${earningsData.availableForWithdrawal.toFixed(2)} جنيه`, icon: DollarSign, color: "green" },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
          >
            <Card className={`border-t-4 border-${stat.color}-500 shadow-lg`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                {React.createElement(stat.icon, { className: `h-5 w-5 text-${stat.color}-500` })}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="shadow-xl">
          <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
            <div>
              <CardTitle className="text-xl text-gray-700">ملخص الأرباح الشهري</CardTitle>
              <CardDescription>عرض تفصيلي لأرباحك خلال الأشهر الماضية.</CardDescription>
            </div>
            <div className="flex items-center gap-2 mt-4 sm:mt-0">
              <Select defaultValue="last_6_months">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="اختر الفترة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_3_months">آخر 3 أشهر</SelectItem>
                  <SelectItem value="last_6_months">آخر 6 أشهر</SelectItem>
                  <SelectItem value="this_year">هذا العام</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="ml-2 h-4 w-4" /> تصدير التقرير
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            
            <div className="h-72 bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500"> (مخطط بياني للأرباح هنا)</p>
            </div>
            <div className="mt-6 space-y-3">
              {earningsData.monthlyBreakdown.slice(0,3).map(item => (
                <div key={item.month} className="flex justify-between items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition">
                  <span className="font-medium text-gray-700">{item.month}</span>
                  <span className="font-semibold text-green-600">{item.earnings.toFixed(2)} جنيه</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardEarnings;
