import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  MessageCircle, 
  Settings, 
  Users, 
  Tag, 
  UserCheck, 
  PackageOpen,
  Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

const AdminDashboardCard = ({ title, description, link, icon: Icon }) => (
  <motion.div whileHover={{ y: -5 }} className="h-full">
    <Card className="h-full shadow-lg hover:shadow-xl transition-shadow duration-300 border-blue-200 flex flex-col">
      <CardHeader className="flex-row items-center space-x-4 pb-2">
        <div className="p-3 rounded-full bg-blue-600/10 text-blue-600">
          <Icon className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl text-gray-700">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-gray-500">{description}</p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
          <Link to={link}>الانتقال</Link>
        </Button>
      </CardFooter>
    </Card>
  </motion.div>
);

const AdminDashboardPage = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-gray-800 mb-6">مرحباً بك في لوحة تحكم المدير</h1>
    <p className="text-gray-600 mb-8">
      من هنا يمكنك إدارة جميع جوانب النظام بما في ذلك التصنيفات والمنتجات والبائعين والمستخدمين والمحادثات.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AdminDashboardCard 
        title="إدارة التصنيفات" 
        description="إضافة وتعديل وحذف تصنيفات المنتجات." 
        link="/admin/categories" 
        icon={Tag} 
      />
      <AdminDashboardCard 
        title="إدارة المنتجات" 
        description="استعراض وإدارة جميع المنتجات في النظام." 
        link="/admin/products" 
        icon={PackageOpen} 
      />
      <AdminDashboardCard 
        title="إدارة البائعين" 
        description="الموافقة على البائعين الجدد وإدارة حساباتهم." 
        link="/admin/sellers" 
        icon={UserCheck} 
      />
      <AdminDashboardCard 
        title="إدارة المستخدمين" 
        description="استعراض وإدارة حسابات المستخدمين." 
        link="/admin/users" 
        icon={Users} 
      />
      <AdminDashboardCard 
        title="المحادثات" 
        description="عرض جميع المحادثات بين المستخدمين والبائعين." 
        link="/admin/messages" 
        icon={MessageCircle} 
      />
      <AdminDashboardCard 
        title="إعدادات النظام" 
        description="تكوين إعدادات النظام العامة." 
        link="/admin/settings" 
        icon={Settings} 
      />
      <AdminDashboardCard 
        title="أقسام الهدايا" 
        description="إدارة أقسام عرض المنتجات حسب التاجات." 
        link="/admin/gift-sections" 
        icon={Gift} 
      />
    </div>
  </div>
);

export default AdminDashboardPage;
