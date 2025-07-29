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
import { adminApi } from '@/lib/api';
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
  const [loading, setLoading] = useState(false);

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
  // إعدادات السحب
  const [withdrawalSettings, setWithdrawalSettings] = useState({
    minWithdrawalAmount: '100',
    maxWithdrawalAmount: '100000',
    withdrawalProcessingFee: '0',
    withdrawalProcessingTime: '3-5 أيام عمل',
    enabledPaymentMethods: {
      vodafone_cash: true,
      instapay: true,
      etisalat_cash: true,
      orange_cash: true,
      bank_transfer: true,
    },
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

  const handleWithdrawalChange = (e) => {
    const { name, value, type, checked } = e.target;
    setWithdrawalSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePaymentMethodChange = (method, enabled) => {
    setWithdrawalSettings(prev => ({
      ...prev,
      enabledPaymentMethods: {
        ...prev.enabledPaymentMethods,
        [method]: enabled
      }
    }));
  };

  const handleSecurityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSecuritySettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Load all settings on component mount
  useEffect(() => {
    loadWithdrawalSettings();
    loadAllSettings();
  }, []);

  const loadWithdrawalSettings = async () => {
    try {
      const response = await adminApi.getWithdrawalSettings();
      if (response.settings) {
        setWithdrawalSettings({
          minWithdrawalAmount: response.settings.min_withdrawal_amount || '100',
          maxWithdrawalAmount: response.settings.max_withdrawal_amount || '100000',
          withdrawalProcessingFee: response.settings.withdrawal_processing_fee || '0',
          withdrawalProcessingTime: response.settings.withdrawal_processing_time || '3-5 أيام عمل',
          enabledPaymentMethods: response.settings.enabled_payment_methods || {
            vodafone_cash: true,
            instapay: true,
            etisalat_cash: true,
            orange_cash: true,
            bank_transfer: true,
          },
        });
      }
    } catch (error) {
      console.error('Error loading withdrawal settings:', error);
    }
  };

  const loadAllSettings = async () => {
    try {
      const response = await adminApi.getSiteSettings();
      if (response.settings) {
        // Update general settings
        if (response.settings.general) {
          setGeneralSettings(prev => ({
            ...prev,
            ...response.settings.general
          }));
        }

        // Update email settings
        if (response.settings.email) {
          setEmailSettings(prev => ({
            ...prev,
            ...response.settings.email
          }));
        }

        // Update notification settings
        if (response.settings.notifications) {
          setNotificationSettings(prev => ({
            ...prev,
            ...response.settings.notifications
          }));
        }

        // Update security settings
        if (response.settings.security) {
          setSecuritySettings(prev => ({
            ...prev,
            ...response.settings.security
          }));
        }
      }
    } catch (error) {
      console.error('Error loading admin settings:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ في تحميل الإعدادات',
        description: 'تعذر تحميل الإعدادات من الخادم'
      });
    }
  };

  const saveWithdrawalSettings = async () => {
    setLoading(true);
    try {
      const payload = {
        min_withdrawal_amount: withdrawalSettings.minWithdrawalAmount,
        max_withdrawal_amount: withdrawalSettings.maxWithdrawalAmount,
        withdrawal_processing_fee: withdrawalSettings.withdrawalProcessingFee,
        withdrawal_processing_time: withdrawalSettings.withdrawalProcessingTime,
        enabled_payment_methods: withdrawalSettings.enabledPaymentMethods,
      };

      await adminApi.updateWithdrawalSettings(payload);
      
      toast({
        title: "تم حفظ الإعدادات",
        description: "تم حفظ إعدادات السحب بنجاح",
        variant: "default",
      });
    } catch (error) {
      let errorMessage = "حدث خطأ في حفظ إعدادات السحب";
      
      if (error.message && error.message.includes('API error:')) {
        try {
          const errorText = error.message.split('API error:')[1];
          const errorJson = JSON.parse(errorText.split(' - ')[1]);
          errorMessage = errorJson.error || errorJson.message || errorMessage;
        } catch (parseError) {
          console.error('Error parsing API error:', parseError);
        }
      }
      
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (settingsType) => {
    if (settingsType === 'withdrawals') {
      saveWithdrawalSettings();
      return;
    }

    setLoading(true);
    try {
      let settings;
      
      switch(settingsType) {
        case 'general':
          settings = generalSettings;
          break;
        case 'email':
          settings = emailSettings;
          break;
        case 'notifications':
          settings = notificationSettings;
          break;
        case 'security':
          settings = securitySettings;
          break;
        default:
          throw new Error('نوع إعدادات غير صحيح');
      }

      await adminApi.updateSiteSettings(settingsType, settings);
      
      const messages = {
        'general': 'تم حفظ الإعدادات العامة بنجاح',
        'email': 'تم حفظ إعدادات البريد الإلكتروني بنجاح',
        'notifications': 'تم حفظ إعدادات الإشعارات بنجاح',
        'security': 'تم حفظ إعدادات الأمان بنجاح',
      };
      
      toast({
        title: "تم حفظ الإعدادات",
        description: messages[settingsType],
        variant: "default",
      });
    } catch (error) {
      let errorMessage = "حدث خطأ في حفظ الإعدادات";
      
      if (error.message && error.message.includes('API error:')) {
        try {
          const errorText = error.message.split('API error:')[1];
          const errorJson = JSON.parse(errorText.split(' - ')[1]);
          errorMessage = errorJson.error || errorJson.message || errorMessage;
        } catch (parseError) {
          console.error('Error parsing API error:', parseError);
        }
      }
      
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
        <TabsList className="grid grid-cols-5 mb-8">
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
          <TabsTrigger value="withdrawals">
            <DollarSign className="ml-2 h-4 w-4" />
            السحب
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
                disabled={loading}
              >
                <Save className="ml-2 h-4 w-4" />
                {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
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
                disabled={loading}
              >
                <Save className="ml-2 h-4 w-4" />
                {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
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
                disabled={loading}
              >
                <Save className="ml-2 h-4 w-4" />
                {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
              </Button>
            </div>
          </SettingsSection>
        </TabsContent>

        <TabsContent value="withdrawals">
          <SettingsSection 
            title="إعدادات السحب" 
            description="تكوين حدود ومتطلبات سحب الأرباح للبائعين" 
            icon={DollarSign}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minWithdrawalAmount">الحد الأدنى للسحب (جنيه مصري)</Label>
                  <Input
                    id="minWithdrawalAmount"
                    name="minWithdrawalAmount"
                    type="number"
                    min="1"
                    value={withdrawalSettings.minWithdrawalAmount}
                    onChange={handleWithdrawalChange}
                  />
                  <p className="text-xs text-gray-500 mt-1">أقل مبلغ يمكن للبائع طلب سحبه</p>
                </div>
                <div>
                  <Label htmlFor="maxWithdrawalAmount">الحد الأقصى للسحب (جنيه مصري)</Label>
                  <Input
                    id="maxWithdrawalAmount"
                    name="maxWithdrawalAmount"
                    type="number"
                    min="1"
                    value={withdrawalSettings.maxWithdrawalAmount}
                    onChange={handleWithdrawalChange}
                  />
                  <p className="text-xs text-gray-500 mt-1">أعلى مبلغ يمكن للبائع طلب سحبه في المرة الواحدة</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="withdrawalProcessingFee">رسوم المعالجة (جنيه مصري)</Label>
                  <Input
                    id="withdrawalProcessingFee"
                    name="withdrawalProcessingFee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={withdrawalSettings.withdrawalProcessingFee}
                    onChange={handleWithdrawalChange}
                  />
                  <p className="text-xs text-gray-500 mt-1">رسوم إضافية يتم خصمها من كل عملية سحب</p>
                </div>
                <div>
                  <Label htmlFor="withdrawalProcessingTime">وقت المعالجة المتوقع</Label>
                  <Input
                    id="withdrawalProcessingTime"
                    name="withdrawalProcessingTime"
                    value={withdrawalSettings.withdrawalProcessingTime}
                    onChange={handleWithdrawalChange}
                  />
                  <p className="text-xs text-gray-500 mt-1">الوقت المتوقع لمعالجة طلبات السحب</p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <Label className="block mb-2">طرق الدفع المتاحة للسحب</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="vodafone_cash" className="cursor-pointer">فودافون كاش</Label>
                    <Switch
                      id="vodafone_cash"
                      checked={withdrawalSettings.enabledPaymentMethods.vodafone_cash}
                      onCheckedChange={(checked) => handlePaymentMethodChange('vodafone_cash', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="instapay" className="cursor-pointer">انستا باي</Label>
                    <Switch
                      id="instapay"
                      checked={withdrawalSettings.enabledPaymentMethods.instapay}
                      onCheckedChange={(checked) => handlePaymentMethodChange('instapay', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="etisalat_cash" className="cursor-pointer">اتصالات كاش</Label>
                    <Switch
                      id="etisalat_cash"
                      checked={withdrawalSettings.enabledPaymentMethods.etisalat_cash}
                      onCheckedChange={(checked) => handlePaymentMethodChange('etisalat_cash', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="orange_cash" className="cursor-pointer">أورانج كاش</Label>
                    <Switch
                      id="orange_cash"
                      checked={withdrawalSettings.enabledPaymentMethods.orange_cash}
                      onCheckedChange={(checked) => handlePaymentMethodChange('orange_cash', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bank_transfer" className="cursor-pointer">تحويل بنكي</Label>
                    <Switch
                      id="bank_transfer"
                      checked={withdrawalSettings.enabledPaymentMethods.bank_transfer}
                      onCheckedChange={(checked) => handlePaymentMethodChange('bank_transfer', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">معلومات مهمة:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• يجب أن يكون الحد الأقصى أكبر من الحد الأدنى</li>
                  <li>• تطبق هذه الحدود على جميع البائعين في المنصة</li>
                  <li>• يمكن للبائعين رؤية هذه الحدود في صفحة الأرباح</li>
                  <li>• تؤثر طرق الدفع المعطلة على جميع طلبات السحب الجديدة</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button 
                onClick={() => handleSaveSettings('withdrawals')}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                <Save className="ml-2 h-4 w-4" />
                {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
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
                disabled={loading}
              >
                <Save className="ml-2 h-4 w-4" />
                {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
              </Button>
            </div>
          </SettingsSection>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
