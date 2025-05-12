import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Save,
  Globe,
  DollarSign,
  Image,
  Mail,
  Bell,
  Shield
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';

const SettingsSection = ({ title, description, icon: Icon, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card className="shadow-lg border-blue-100">
      <CardHeader className="flex flex-row items-start space-x-4 space-x-reverse pb-4">
        {React.createElement(Icon, { className: "h-8 w-8 text-blue-600 mt-1" })}
        <div>
          <CardTitle className="text-xl text-gray-800">{title}</CardTitle>
          <CardDescription className="text-gray-500">{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  </motion.div>
);

const AdminSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // إعدادات الموقع العامة
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'منصة الصنايعي',
    siteDescription: 'منصة تسويق المنتجات الحرفية اليدوية',
    logoUrl: '/logo.png',
    faviconUrl: '/favicon.ico',
    maintenanceMode: false,
    registrationsEnabled: true,
    defaultLanguage: 'ar',
    defaultCurrency: 'EGP',
  });

  // إعدادات البريد الإلكتروني
  const [emailSettings, setEmailSettings] = useState({
    senderName: 'منصة الصنايعي',
    senderEmail: 'no-reply@example.com',
    smtpServer: 'smtp.example.com',
    smtpPort: '587',
    smtpUsername: 'smtp-user',
    smtpPassword: 'smtp-password',
    useSMTP: true,
  });

  // إعدادات الإشعارات
  const [notificationSettings, setNotificationSettings] = useState({
    newUserNotifications: true,
    newOrderNotifications: true,
    productReportNotifications: true,
    chatReportNotifications: true,
    lowStockNotifications: true,
    adminEmails: 'admin@example.com',
  });

  // إعدادات الأمان
  const [securitySettings, setSecuritySettings] = useState({
    requireEmailVerification: true,
    twoFactorAuthEnabled: false,
    passwordMinLength: '8',
    passwordRequiresUppercase: true,
    passwordRequiresNumber: true,
    passwordRequiresSymbol: false,
    sessionTimeout: '120', // دقائق
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast({
        variant: "destructive",
        title: "غير مصرح به",
        description: "هذه الصفحة مخصصة للمشرفين فقط."
      });
    }
  }, [user, toast]);

  const handleGeneralChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGeneralSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEmailChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEmailSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNotificationChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSecurityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSecuritySettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveSettings = (settingsType) => {
    let message = '';
    
    switch(settingsType) {
      case 'general':
        message = 'تم حفظ الإعدادات العامة بنجاح';
        break;
      case 'email':
        message = 'تم حفظ إعدادات البريد الإلكتروني بنجاح';
        break;
      case 'notifications':
        message = 'تم حفظ إعدادات الإشعارات بنجاح';
        break;
      case 'security':
        message = 'تم حفظ إعدادات الأمان بنجاح';
        break;
      default:
        message = 'تم حفظ الإعدادات بنجاح';
    }
    
    toast({
      title: "تم حفظ الإعدادات",
      description: message
    });
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-6 md:p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-700">غير مصرح لك بالدخول</h1>
        <p className="text-gray-500">هذه الصفحة مخصصة للمشرفين فقط.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800">إعدادات النظام</h1>
          <p className="text-gray-500 mt-1">تكوين وتخصيص إعدادات المنصة</p>
        </div>
      </motion.div>

      <Tabs defaultValue="general">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="general">
            <Globe className="ml-2 h-4 w-4" />
            عام
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="ml-2 h-4 w-4" />
            البريد الإلكتروني
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="ml-2 h-4 w-4" />
            الإشعارات
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="ml-2 h-4 w-4" />
            الأمان
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <SettingsSection 
            title="الإعدادات العامة" 
            description="ضبط الإعدادات الأساسية للمنصة" 
            icon={Globe}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siteName">اسم الموقع</Label>
                  <Input
                    id="siteName"
                    name="siteName"
                    value={generalSettings.siteName}
                    onChange={handleGeneralChange}
                  />
                </div>
                <div>
                  <Label htmlFor="defaultLanguage">اللغة الافتراضية</Label>
                  <Select 
                    name="defaultLanguage" 
                    value={generalSettings.defaultLanguage}
                    onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, defaultLanguage: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر اللغة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">الإنجليزية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="siteDescription">وصف الموقع</Label>
                <Textarea
                  id="siteDescription"
                  name="siteDescription"
                  value={generalSettings.siteDescription}
                  onChange={handleGeneralChange}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="logoUrl">رابط الشعار</Label>
                  <Input
                    id="logoUrl"
                    name="logoUrl"
                    value={generalSettings.logoUrl}
                    onChange={handleGeneralChange}
                  />
                </div>
                <div>
                  <Label htmlFor="faviconUrl">رابط أيقونة الموقع</Label>
                  <Input
                    id="faviconUrl"
                    name="faviconUrl"
                    value={generalSettings.faviconUrl}
                    onChange={handleGeneralChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultCurrency">العملة الافتراضية</Label>
                  <Select 
                    name="defaultCurrency" 
                    value={generalSettings.defaultCurrency}
                    onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, defaultCurrency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر العملة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EGP">جنيه مصري (EGP)</SelectItem>
                      <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                      <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                      <SelectItem value="AED">درهم إماراتي (AED)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="maintenanceMode" className="cursor-pointer">وضع الصيانة</Label>
                  <Switch
                    id="maintenanceMode"
                    name="maintenanceMode"
                    checked={generalSettings.maintenanceMode}
                    onCheckedChange={(checked) => setGeneralSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="registrationsEnabled" className="cursor-pointer">تمكين التسجيل للمستخدمين الجدد</Label>
                  <Switch
                    id="registrationsEnabled"
                    name="registrationsEnabled"
                    checked={generalSettings.registrationsEnabled}
                    onCheckedChange={(checked) => setGeneralSettings(prev => ({ ...prev, registrationsEnabled: checked }))}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button 
                onClick={() => handleSaveSettings('general')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="ml-2 h-4 w-4" />
                حفظ الإعدادات
              </Button>
            </div>
          </SettingsSection>
        </TabsContent>

        <TabsContent value="email">
          <SettingsSection 
            title="إعدادات البريد الإلكتروني" 
            description="ضبط إعدادات خادم البريد الإلكتروني ورسائل النظام" 
            icon={Mail}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="senderName">اسم المرسل</Label>
                  <Input
                    id="senderName"
                    name="senderName"
                    value={emailSettings.senderName}
                    onChange={handleEmailChange}
                  />
                </div>
                <div>
                  <Label htmlFor="senderEmail">بريد المرسل</Label>
                  <Input
                    id="senderEmail"
                    name="senderEmail"
                    type="email"
                    value={emailSettings.senderEmail}
                    onChange={handleEmailChange}
                  />
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between mb-4">
                <Label htmlFor="useSMTP" className="cursor-pointer">استخدام خادم SMTP</Label>
                <Switch
                  id="useSMTP"
                  name="useSMTP"
                  checked={emailSettings.useSMTP}
                  onCheckedChange={(checked) => setEmailSettings(prev => ({ ...prev, useSMTP: checked }))}
                />
              </div>

              {emailSettings.useSMTP && (
                <div className="space-y-4 border-r-2 border-blue-200 pr-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="smtpServer">خادم SMTP</Label>
                      <Input
                        id="smtpServer"
                        name="smtpServer"
                        value={emailSettings.smtpServer}
                        onChange={handleEmailChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtpPort">منفذ SMTP</Label>
                      <Input
                        id="smtpPort"
                        name="smtpPort"
                        value={emailSettings.smtpPort}
                        onChange={handleEmailChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="smtpUsername">اسم مستخدم SMTP</Label>
                      <Input
                        id="smtpUsername"
                        name="smtpUsername"
                        value={emailSettings.smtpUsername}
                        onChange={handleEmailChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtpPassword">كلمة مرور SMTP</Label>
                      <Input
                        id="smtpPassword"
                        name="smtpPassword"
                        type="password"
                        value={emailSettings.smtpPassword}
                        onChange={handleEmailChange}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <Button 
                onClick={() => handleSaveSettings('email')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="ml-2 h-4 w-4" />
                حفظ الإعدادات
              </Button>
            </div>
          </SettingsSection>
        </TabsContent>

        <TabsContent value="notifications">
          <SettingsSection 
            title="إعدادات الإشعارات" 
            description="تكوين الإشعارات التي يتلقاها المشرفون والمستخدمون" 
            icon={Bell}
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="adminEmails">بريد المشرفين (للإشعارات)</Label>
                <Input
                  id="adminEmails"
                  name="adminEmails"
                  value={notificationSettings.adminEmails}
                  onChange={handleNotificationChange}
                  placeholder="admin@example.com, admin2@example.com"
                />
                <p className="text-xs text-gray-500 mt-1">افصل بين عناوين البريد الإلكتروني بفاصلة</p>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <Label className="block mb-2">إشعارات المشرفين</Label>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="newUserNotifications" className="cursor-pointer">تنبيه عند تسجيل مستخدم جديد</Label>
                  <Switch
                    id="newUserNotifications"
                    name="newUserNotifications"
                    checked={notificationSettings.newUserNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, newUserNotifications: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="newOrderNotifications" className="cursor-pointer">تنبيه عند إنشاء طلب جديد</Label>
                  <Switch
                    id="newOrderNotifications"
                    name="newOrderNotifications"
                    checked={notificationSettings.newOrderNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, newOrderNotifications: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="productReportNotifications" className="cursor-pointer">تنبيه عند الإبلاغ عن منتج</Label>
                  <Switch
                    id="productReportNotifications"
                    name="productReportNotifications"
                    checked={notificationSettings.productReportNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, productReportNotifications: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="chatReportNotifications" className="cursor-pointer">تنبيه عند الإبلاغ عن محادثة</Label>
                  <Switch
                    id="chatReportNotifications"
                    name="chatReportNotifications"
                    checked={notificationSettings.chatReportNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, chatReportNotifications: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="lowStockNotifications" className="cursor-pointer">تنبيه عند انخفاض المخزون</Label>
                  <Switch
                    id="lowStockNotifications"
                    name="lowStockNotifications"
                    checked={notificationSettings.lowStockNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, lowStockNotifications: checked }))}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button 
                onClick={() => handleSaveSettings('notifications')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="ml-2 h-4 w-4" />
                حفظ الإعدادات
              </Button>
            </div>
          </SettingsSection>
        </TabsContent>

        <TabsContent value="security">
          <SettingsSection 
            title="إعدادات الأمان" 
            description="تكوين إعدادات أمان النظام وسياسات كلمات المرور" 
            icon={Shield}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="requireEmailVerification" className="cursor-pointer">طلب تأكيد البريد الإلكتروني</Label>
                <Switch
                  id="requireEmailVerification"
                  name="requireEmailVerification"
                  checked={securitySettings.requireEmailVerification}
                  onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, requireEmailVerification: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="twoFactorAuthEnabled" className="cursor-pointer">تمكين المصادقة الثنائية (إذا كان متاحًا)</Label>
                <Switch
                  id="twoFactorAuthEnabled"
                  name="twoFactorAuthEnabled"
                  checked={securitySettings.twoFactorAuthEnabled}
                  onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, twoFactorAuthEnabled: checked }))}
                />
              </div>

              <Separator className="my-4" />
              
              <Label className="block mb-2">متطلبات كلمة المرور</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="passwordMinLength">الحد الأدنى لطول كلمة المرور</Label>
                  <Input
                    id="passwordMinLength"
                    name="passwordMinLength"
                    type="number"
                    min="6"
                    max="64"
                    value={securitySettings.passwordMinLength}
                    onChange={handleSecurityChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="sessionTimeout">مهلة الجلسة (بالدقائق)</Label>
                  <Input
                    id="sessionTimeout"
                    name="sessionTimeout"
                    type="number"
                    min="5"
                    value={securitySettings.sessionTimeout}
                    onChange={handleSecurityChange}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="passwordRequiresUppercase" className="cursor-pointer">يتطلب حرف كبير واحد على الأقل</Label>
                <Switch
                  id="passwordRequiresUppercase"
                  name="passwordRequiresUppercase"
                  checked={securitySettings.passwordRequiresUppercase}
                  onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, passwordRequiresUppercase: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="passwordRequiresNumber" className="cursor-pointer">يتطلب رقم واحد على الأقل</Label>
                <Switch
                  id="passwordRequiresNumber"
                  name="passwordRequiresNumber"
                  checked={securitySettings.passwordRequiresNumber}
                  onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, passwordRequiresNumber: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="passwordRequiresSymbol" className="cursor-pointer">يتطلب رمزًا واحدًا على الأقل</Label>
                <Switch
                  id="passwordRequiresSymbol"
                  name="passwordRequiresSymbol"
                  checked={securitySettings.passwordRequiresSymbol}
                  onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, passwordRequiresSymbol: checked }))}
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button 
                onClick={() => handleSaveSettings('security')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="ml-2 h-4 w-4" />
                حفظ الإعدادات
              </Button>
            </div>
          </SettingsSection>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
