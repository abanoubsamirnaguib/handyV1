import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Save,
  Globe,
  DollarSign,
  Image,
  Bell,
  Users
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
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
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
      <CardHeader className="flex flex-row-reverse items-start gap-4 pb-4">
        {React.createElement(Icon, { className: "h-8 w-8 text-blue-600 mt-1" })}
        <div className="text-right flex-1">
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
  const { refreshSettings } = useSiteSettings();
  const [loading, setLoading] = useState(false);

  // إعدادات الموقع العامة
  const [generalSettings, setGeneralSettings] = useState({
    siteDescription: 'منصة تجمع الحرفيين والمبدعين في مكان واحد، لعرض منتجاتهم اليدوية الفريدة والتواصل مع العملاء مباشرة.',
    maintenanceMode: false,
    registrationsEnabled: true,
    contactPhone: '+20 123 456 7890',
    contactEmail: 'officialbazar64@gmail.com',
    contactAddress: 'شارع الحرفيين، الفيوم ، مصر',
    workingHours: 'السبت - الخميس: 9:00 صباحاً - 6:00 مساءً',
    transactionNumber: '',
  });

  // إعدادات إشعارات المستخدمين
  const [userNotificationSettings, setUserNotificationSettings] = useState({
    welcome: true,
    orderCreated: true,
    orderStatus: true,
    productPending: true,
    productApproved: true,
    message: true,
    review: true,
    payment: true,
    system: true,
  });

  // إعدادات إشعارات المشرفين
  const [adminNotificationSettings, setAdminNotificationSettings] = useState({
    newUser: true,
    newOrder: true,
    productPending: true,
    productReport: true,
    chatReport: true,
    withdrawalRequest: true,
    contactMessage: true,
    adminEmail: 'admin@example.com',
    deliveryMethod: 'both', // both, email, dashboard
  });
  // إعدادات السحب
  const [withdrawalSettings, setWithdrawalSettings] = useState({
    minWithdrawalAmount: '100',
    maxWithdrawalAmount: '100000',
    withdrawalProcessingTime: '3-5 أيام عمل',
    enabledPaymentMethods: {
      vodafone_cash: true,
      instapay: true,
      etisalat_cash: true,
      orange_cash: true,
      bank_transfer: true,
    },
  });

  // إعدادات الإحالة (Referral)
  const [referralSettings, setReferralSettings] = useState({
    enabled: true,
    bonusAmount: 0,
  });

  const handleGeneralChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGeneralSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleUserNotificationChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserNotificationSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAdminNotificationChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAdminNotificationSettings(prev => ({
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

        // Update user notification settings
        if (response.settings.userNotifications) {
          setUserNotificationSettings(prev => ({
            ...prev,
            ...response.settings.userNotifications
          }));
        }

        // Update admin notification settings
        if (response.settings.adminNotifications) {
          setAdminNotificationSettings(prev => ({
            ...prev,
            ...response.settings.adminNotifications
          }));
        }

        // Update referral settings
        if (response.settings.referrals) {
          setReferralSettings(prev => ({
            ...prev,
            ...response.settings.referrals
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
        case 'userNotifications':
          settings = userNotificationSettings;
          break;
        case 'adminNotifications':
          settings = adminNotificationSettings;
          break;
        case 'referrals':
          settings = referralSettings;
          break;
        default:
          throw new Error('نوع إعدادات غير صحيح');
      }

      await adminApi.updateSiteSettings(settingsType, settings);
      
      // Refresh site settings if general settings were updated
      if (settingsType === 'general') {
        refreshSettings();
      }
      
      const messages = {
        'general': 'تم حفظ الإعدادات العامة بنجاح',
        'userNotifications': 'تم حفظ إعدادات إشعارات المستخدمين بنجاح',
        'adminNotifications': 'تم حفظ إعدادات إشعارات المشرفين بنجاح',
        'referrals': 'تم حفظ إعدادات الإحالة بنجاح',
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
    <div className="p-6 md:p-8 space-y-8" dir="rtl">
      <motion.div
        className="flex items-center justify-between text-right"
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
            <Globe className="mr-2 h-4 w-4" />
            عام
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            الإشعارات
          </TabsTrigger>
          <TabsTrigger value="referrals">
            <Users className="mr-2 h-4 w-4" />
            الإحالة
          </TabsTrigger>
          <TabsTrigger value="withdrawals">
            <DollarSign className="mr-2 h-4 w-4" />
            السحب
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <SettingsSection 
            title="الإعدادات العامة" 
            description="ضبط الإعدادات الأساسية للمنصة" 
            icon={Globe}
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="siteDescription">وصف الموقع</Label>
                <Textarea
                  id="siteDescription"
                  name="siteDescription"
                  value={generalSettings.siteDescription}
                  onChange={handleGeneralChange}
                  rows={3}
                  className="text-right"
                  dir="rtl"
                />
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">معلومات التواصل</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactPhone">رقم التواصل</Label>
                    <Input
                      id="contactPhone"
                      name="contactPhone"
                      value={generalSettings.contactPhone}
                      onChange={handleGeneralChange}
                      placeholder="+20 123 456 7890"
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactEmail">البريد الإلكتروني</Label>
                    <Input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      value={generalSettings.contactEmail}
                      onChange={handleGeneralChange}
                      placeholder="info@example.com"
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="contactAddress">العنوان</Label>
                  <Input
                    id="contactAddress"
                    name="contactAddress"
                    value={generalSettings.contactAddress}
                    onChange={handleGeneralChange}
                    placeholder="شارع الحرفيين، الفيوم ، مصر"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <div>
                  <Label htmlFor="workingHours">ساعات العمل</Label>
                  <Input
                    id="workingHours"
                    name="workingHours"
                    value={generalSettings.workingHours}
                    onChange={handleGeneralChange}
                    placeholder="السبت - الخميس: 9:00 صباحاً - 6:00 مساءً"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">معلومات الدفع</h3>
                <div>
                  <Label htmlFor="transactionNumber">رقم الحساب/التحويل (Instapay أو أي طريقة دفع أخرى)</Label>
                  <Input
                    id="transactionNumber"
                    name="transactionNumber"
                    value={generalSettings.transactionNumber}
                    onChange={handleGeneralChange}
                    placeholder="أدخل رقم الحساب أو رقم التحويل"
                    className="text-right"
                    dir="rtl"
                  />
                  <p className="text-xs text-gray-500 mt-1">سيتم عرض هذا الرقم للمشترين عند رفع صورة إثبات الدفع</p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex flex-col space-y-4">
                <div className="flex flex-row-reverse items-center justify-between">
                  <Label htmlFor="maintenanceMode" className="cursor-pointer text-right flex-1">وضع الصيانة</Label>
                  <Switch
                    id="maintenanceMode"
                    name="maintenanceMode"
                    checked={generalSettings.maintenanceMode}
                    onCheckedChange={(checked) => setGeneralSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                  />
                </div>
                <div className="flex flex-row-reverse items-center justify-between">
                  <Label htmlFor="registrationsEnabled" className="cursor-pointer text-right flex-1">تمكين التسجيل للمستخدمين الجدد</Label>
                  <Switch
                    id="registrationsEnabled"
                    name="registrationsEnabled"
                    checked={generalSettings.registrationsEnabled}
                    onCheckedChange={(checked) => setGeneralSettings(prev => ({ ...prev, registrationsEnabled: checked }))}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-start mt-6">
              <Button 
                onClick={() => handleSaveSettings('general')}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
              </Button>
            </div>
          </SettingsSection>
        </TabsContent>

        <TabsContent value="referrals">
          <SettingsSection
            title="إعدادات الإحالة"
            description="تحديد بونص الإحالة وإيقاف/تشغيل النظام"
            icon={Users}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="text-right">
                  <div className="font-medium text-gray-800">تفعيل نظام الإحالة</div>
                  <div className="text-sm text-gray-500">عند التفعيل سيتم احتساب بونص عند التسجيل عبر رابط دعوة</div>
                </div>
                <Switch
                  checked={!!referralSettings.enabled}
                  onCheckedChange={(checked) => setReferralSettings(prev => ({ ...prev, enabled: checked }))}
                />
              </div>

              <div>
                <Label htmlFor="referralBonusAmount">قيمة بونص الإحالة (رصيد هدية)</Label>
                <Input
                  id="referralBonusAmount"
                  type="number"
                  min="0"
                  step="1"
                  value={referralSettings.bonusAmount}
                  onChange={(e) => setReferralSettings(prev => ({ ...prev, bonusAmount: Number(e.target.value || 0) }))}
                  className="text-right"
                  dir="rtl"
                />
                <p className="text-xs text-gray-500 mt-1">سيتم إضافة هذا الرصيد إلى محفظة الهدايا للمُحيل (لا يمكن سحبه)</p>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => handleSaveSettings('referrals')}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="ml-2 h-4 w-4" />
                  {loading ? 'جاري الحفظ...' : 'حفظ إعدادات الإحالة'}
                </Button>
              </div>
            </div>
          </SettingsSection>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="space-y-8">
            {/* إشعارات المستخدمين */}
          <SettingsSection 
              title="إعدادات إشعارات المستخدمين" 
              description="تحكم في أنواع الإشعارات التي يتلقاها المستخدمون في المنصة" 
            icon={Bell}
          >
            <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-700">
                    <strong>ملاحظة:</strong> يمكنك التحكم في أنواع الإشعارات التي يتلقاها المستخدمون. عند تعطيل أي نوع، لن يتلقى المستخدمون إشعارات من هذا النوع.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-row-reverse items-center justify-between">
                    <div className="text-right flex-1">
                      <Label htmlFor="welcome" className="cursor-pointer font-medium">إشعار الترحيب</Label>
                      <p className="text-xs text-gray-500">يُرسل للمستخدمين الجدد عند التسجيل</p>
                    </div>
                    <Switch
                      id="welcome"
                      name="welcome"
                      checked={userNotificationSettings.welcome}
                      onCheckedChange={(checked) => setUserNotificationSettings(prev => ({ ...prev, welcome: checked }))}
                    />
                  </div>

                  <Separator />
                  
                  <div className="flex flex-row-reverse items-center justify-between">
                    <div className="text-right flex-1">
                      <Label htmlFor="orderCreated" className="cursor-pointer font-medium">إشعار إنشاء الطلب</Label>
                      <p className="text-xs text-gray-500">يُرسل عند إنشاء طلب جديد</p>
                    </div>
                    <Switch
                      id="orderCreated"
                      name="orderCreated"
                      checked={userNotificationSettings.orderCreated}
                      onCheckedChange={(checked) => setUserNotificationSettings(prev => ({ ...prev, orderCreated: checked }))}
                    />
                  </div>

                  <Separator />
                  
                  <div className="flex flex-row-reverse items-center justify-between">
                    <div className="text-right flex-1">
                      <Label htmlFor="orderStatus" className="cursor-pointer font-medium">إشعار تحديث حالة الطلب</Label>
                      <p className="text-xs text-gray-500">يُرسل عند تحديث حالة الطلب</p>
                    </div>
                    <Switch
                      id="orderStatus"
                      name="orderStatus"
                      checked={userNotificationSettings.orderStatus}
                      onCheckedChange={(checked) => setUserNotificationSettings(prev => ({ ...prev, orderStatus: checked }))}
                    />
                  </div>

                  <Separator />
                  
                  <div className="flex flex-row-reverse items-center justify-between">
                    <div className="text-right flex-1">
                      <Label htmlFor="productPending" className="cursor-pointer font-medium">إشعار المنتج قيد المراجعة</Label>
                      <p className="text-xs text-gray-500">يُرسل للبائع عند إضافة منتج جديد</p>
                    </div>
                    <Switch
                      id="productPending"
                      name="productPending"
                      checked={userNotificationSettings.productPending}
                      onCheckedChange={(checked) => setUserNotificationSettings(prev => ({ ...prev, productPending: checked }))}
                    />
                  </div>

                  <Separator />
                  
                  <div className="flex flex-row-reverse items-center justify-between">
                    <div className="text-right flex-1">
                      <Label htmlFor="productApproved" className="cursor-pointer font-medium">إشعار الموافقة على المنتج</Label>
                      <p className="text-xs text-gray-500">يُرسل للبائع عند الموافقة على منتجه</p>
                    </div>
                    <Switch
                      id="productApproved"
                      name="productApproved"
                      checked={userNotificationSettings.productApproved}
                      onCheckedChange={(checked) => setUserNotificationSettings(prev => ({ ...prev, productApproved: checked }))}
                    />
                  </div>

                  <Separator />
                  
                  <div className="flex flex-row-reverse items-center justify-between">
                    <div className="text-right flex-1">
                      <Label htmlFor="message" className="cursor-pointer font-medium">إشعار الرسائل الجديدة</Label>
                      <p className="text-xs text-gray-500">يُرسل عند استلام رسالة جديدة</p>
                    </div>
                    <Switch
                      id="message"
                      name="message"
                      checked={userNotificationSettings.message}
                      onCheckedChange={(checked) => setUserNotificationSettings(prev => ({ ...prev, message: checked }))}
                    />
                  </div>

                  <Separator />
                  
                  <div className="flex flex-row-reverse items-center justify-between">
                    <div className="text-right flex-1">
                      <Label htmlFor="review" className="cursor-pointer font-medium">إشعار التقييمات الجديدة</Label>
                      <p className="text-xs text-gray-500">يُرسل للبائع عند استلام تقييم جديد</p>
                    </div>
                    <Switch
                      id="review"
                      name="review"
                      checked={userNotificationSettings.review}
                      onCheckedChange={(checked) => setUserNotificationSettings(prev => ({ ...prev, review: checked }))}
                    />
                  </div>

                  <Separator />
                  
                  <div className="flex flex-row-reverse items-center justify-between">
                    <div className="text-right flex-1">
                      <Label htmlFor="payment" className="cursor-pointer font-medium">إشعار استلام الدفعات</Label>
                      <p className="text-xs text-gray-500">يُرسل للبائع عند استلام دفعة</p>
                    </div>
                    <Switch
                      id="payment"
                      name="payment"
                      checked={userNotificationSettings.payment}
                      onCheckedChange={(checked) => setUserNotificationSettings(prev => ({ ...prev, payment: checked }))}
                    />
                  </div>

                  <Separator />
                  
                  <div className="flex flex-row-reverse items-center justify-between">
                    <div className="text-right flex-1">
                      <Label htmlFor="system" className="cursor-pointer font-medium">إشعارات النظام</Label>
                      <p className="text-xs text-gray-500">إشعارات عامة من المنصة</p>
                    </div>
                    <Switch
                      id="system"
                      name="system"
                      checked={userNotificationSettings.system}
                      onCheckedChange={(checked) => setUserNotificationSettings(prev => ({ ...prev, system: checked }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-start mt-6">
                <Button 
                  onClick={() => handleSaveSettings('userNotifications')}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'جاري الحفظ...' : 'حفظ إعدادات المستخدمين'}
                </Button>
              </div>
            </SettingsSection>

            {/* إشعارات المشرفين */}
            <SettingsSection 
              title="إعدادات إشعارات المشرفين" 
              description="تحكم في الإشعارات التي تتلقاها كمشرف عبر البريد الإلكتروني وداخل المنصة" 
              icon={Bell}
            >
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-amber-700">
                    <strong>⚡ إشعارات فورية:</strong> يمكنك اختيار طريقة استلام الإشعارات الإدارية (بريد إلكتروني، لوحة تحكم، أو كلاهما).
                  </p>
                </div>

              <div>
                  <Label htmlFor="adminEmail">بريد المشرف (للإشعارات)</Label>
                <Input
                    id="adminEmail"
                    name="adminEmail"
                    type="email"
                    value={adminNotificationSettings.adminEmail}
                    onChange={handleAdminNotificationChange}
                    placeholder="admin@example.com"
                    className="text-right"
                    dir="rtl"
                  />
                  <p className="text-xs text-gray-500 mt-1">سيتم إرسال جميع الإشعارات الإدارية إلى هذا البريد</p>
                </div>

                <div>
                  <Label htmlFor="deliveryMethod">طريقة استلام الإشعارات</Label>
                  <Select 
                    value={adminNotificationSettings.deliveryMethod}
                    onValueChange={(value) => setAdminNotificationSettings(prev => ({ ...prev, deliveryMethod: value }))}
                  >
                    <SelectTrigger id="deliveryMethod" className="text-right" dir="rtl">
                      <SelectValue placeholder="اختر طريقة الاستلام" />
                    </SelectTrigger>
                    <SelectContent className="text-right" dir="rtl">
                      <SelectItem value="both">
                        <div className="flex flex-col text-right">
                          <span className="font-medium">كلاهما</span>
                          <span className="text-xs text-gray-500">البريد الإلكتروني + لوحة التحكم</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="email">
                        <div className="flex flex-col text-right">
                          <span className="font-medium">البريد الإلكتروني فقط</span>
                          <span className="text-xs text-gray-500">إرسال الإشعارات للبريد فقط</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="dashboard">
                        <div className="flex flex-col text-right">
                          <span className="font-medium">لوحة التحكم فقط</span>
                          <span className="text-xs text-gray-500">الإشعارات داخل الموقع فقط</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    {adminNotificationSettings.deliveryMethod === 'both' && '✅ ستتلقى الإشعارات عبر البريد وداخل لوحة التحكم'}
                    {adminNotificationSettings.deliveryMethod === 'email' && '📧 ستتلقى الإشعارات عبر البريد الإلكتروني فقط'}
                    {adminNotificationSettings.deliveryMethod === 'dashboard' && '🔔 ستتلقى الإشعارات داخل لوحة التحكم فقط'}
                  </p>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                  <div className="flex flex-row-reverse items-center justify-between">
                    <div className="text-right flex-1">
                      <Label htmlFor="newUser" className="cursor-pointer font-medium">تسجيل مستخدم جديد</Label>
                      <p className="text-xs text-gray-500">إشعار عند انضمام مستخدم جديد للمنصة</p>
                    </div>
                    <Switch
                      id="newUser"
                      name="newUser"
                      checked={adminNotificationSettings.newUser}
                      onCheckedChange={(checked) => setAdminNotificationSettings(prev => ({ ...prev, newUser: checked }))}
                    />
                  </div>

                  <Separator />
                
                <div className="flex flex-row-reverse items-center justify-between">
                    <div className="text-right flex-1">
                      <Label htmlFor="newOrder" className="cursor-pointer font-medium">طلب جديد</Label>
                      <p className="text-xs text-gray-500">إشعار عند إنشاء طلب جديد</p>
                    </div>
                  <Switch
                      id="newOrder"
                      name="newOrder"
                      checked={adminNotificationSettings.newOrder}
                      onCheckedChange={(checked) => setAdminNotificationSettings(prev => ({ ...prev, newOrder: checked }))}
                  />
                </div>

                  <Separator />
                
                <div className="flex flex-row-reverse items-center justify-between">
                    <div className="text-right flex-1">
                      <Label htmlFor="productPending" className="cursor-pointer font-medium">منتج يحتاج مراجعة</Label>
                      <p className="text-xs text-gray-500">إشعار عند إضافة منتج جديد يحتاج موافقة</p>
                    </div>
                  <Switch
                      id="productPending"
                      name="productPending"
                      checked={adminNotificationSettings.productPending}
                      onCheckedChange={(checked) => setAdminNotificationSettings(prev => ({ ...prev, productPending: checked }))}
                  />
                </div>

                  <Separator />
                
                <div className="flex flex-row-reverse items-center justify-between">
                    <div className="text-right flex-1">
                      <Label htmlFor="productReport" className="cursor-pointer font-medium">الإبلاغ عن منتج</Label>
                      <p className="text-xs text-gray-500">إشعار عند الإبلاغ عن منتج مخالف</p>
                    </div>
                  <Switch
                      id="productReport"
                      name="productReport"
                      checked={adminNotificationSettings.productReport}
                      onCheckedChange={(checked) => setAdminNotificationSettings(prev => ({ ...prev, productReport: checked }))}
                  />
                </div>

                  <Separator />
                
                <div className="flex flex-row-reverse items-center justify-between">
                    <div className="text-right flex-1">
                      <Label htmlFor="chatReport" className="cursor-pointer font-medium">الإبلاغ عن محادثة</Label>
                      <p className="text-xs text-gray-500">إشعار عند الإبلاغ عن محادثة غير لائقة</p>
                    </div>
                  <Switch
                      id="chatReport"
                      name="chatReport"
                      checked={adminNotificationSettings.chatReport}
                      onCheckedChange={(checked) => setAdminNotificationSettings(prev => ({ ...prev, chatReport: checked }))}
                  />
                </div>

                  <Separator />
                
                <div className="flex flex-row-reverse items-center justify-between">
                    <div className="text-right flex-1">
                      <Label htmlFor="withdrawalRequest" className="cursor-pointer font-medium">طلب سحب جديد</Label>
                      <p className="text-xs text-gray-500">إشعار عند تقديم طلب سحب من بائع</p>
                    </div>
                  <Switch
                      id="withdrawalRequest"
                      name="withdrawalRequest"
                      checked={adminNotificationSettings.withdrawalRequest}
                      onCheckedChange={(checked) => setAdminNotificationSettings(prev => ({ ...prev, withdrawalRequest: checked }))}
                  />
                </div>

                  <Separator />
                  
                  <div className="flex flex-row-reverse items-center justify-between">
                    <div className="text-right flex-1">
                      <Label htmlFor="contactMessage" className="cursor-pointer font-medium">رسالة تواصل جديدة</Label>
                      <p className="text-xs text-gray-500">إشعار عند استلام رسالة من صفحة التواصل</p>
                    </div>
                    <Switch
                      id="contactMessage"
                      name="contactMessage"
                      checked={adminNotificationSettings.contactMessage}
                      onCheckedChange={(checked) => setAdminNotificationSettings(prev => ({ ...prev, contactMessage: checked }))}
                    />
                  </div>
              </div>
            </div>

            <div className="flex justify-start mt-6">
              <Button 
                  onClick={() => handleSaveSettings('adminNotifications')}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                <Save className="mr-2 h-4 w-4" />
                  {loading ? 'جاري الحفظ...' : 'حفظ إعدادات المشرفين'}
              </Button>
            </div>
          </SettingsSection>
          </div>
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
                    step="1"
                    min="1"
                    value={withdrawalSettings.minWithdrawalAmount}
                    onChange={handleWithdrawalChange}
                    className="text-right"
                    dir="rtl"
                  />
                  <p className="text-xs text-gray-500 mt-1">أقل مبلغ يمكن للبائع طلب سحبه</p>
                </div>
                <div>
                  <Label htmlFor="maxWithdrawalAmount">الحد الأقصى للسحب (جنيه مصري)</Label>
                  <Input
                    id="maxWithdrawalAmount"
                    name="maxWithdrawalAmount"
                    type="number"
                    step="1"
                    min="1"
                    value={withdrawalSettings.maxWithdrawalAmount}
                    onChange={handleWithdrawalChange}
                    className="text-right"
                    dir="rtl"
                  />
                  <p className="text-xs text-gray-500 mt-1">أعلى مبلغ يمكن للبائع طلب سحبه في المرة الواحدة</p>
                </div>
              </div>

              <div>
                <Label htmlFor="withdrawalProcessingTime">وقت المعالجة المتوقع</Label>
                <Input
                  id="withdrawalProcessingTime"
                  name="withdrawalProcessingTime"
                  value={withdrawalSettings.withdrawalProcessingTime}
                  onChange={handleWithdrawalChange}
                  className="text-right"
                  dir="rtl"
                />
                <p className="text-xs text-gray-500 mt-1">الوقت المتوقع لمعالجة طلبات السحب</p>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <Label className="block mb-2">طرق الدفع المتاحة للسحب</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-row-reverse items-center justify-between">
                    <Label htmlFor="vodafone_cash" className="cursor-pointer text-right flex-1">فودافون كاش</Label>
                    <Switch
                      id="vodafone_cash"
                      checked={withdrawalSettings.enabledPaymentMethods.vodafone_cash}
                      onCheckedChange={(checked) => handlePaymentMethodChange('vodafone_cash', checked)}
                    />
                  </div>
                  
                  <div className="flex flex-row-reverse items-center justify-between">
                    <Label htmlFor="instapay" className="cursor-pointer text-right flex-1">انستا باي</Label>
                    <Switch
                      id="instapay"
                      checked={withdrawalSettings.enabledPaymentMethods.instapay}
                      onCheckedChange={(checked) => handlePaymentMethodChange('instapay', checked)}
                    />
                  </div>
                  
                  <div className="flex flex-row-reverse items-center justify-between">
                    <Label htmlFor="etisalat_cash" className="cursor-pointer text-right flex-1">اتصالات كاش</Label>
                    <Switch
                      id="etisalat_cash"
                      checked={withdrawalSettings.enabledPaymentMethods.etisalat_cash}
                      onCheckedChange={(checked) => handlePaymentMethodChange('etisalat_cash', checked)}
                    />
                  </div>
                  
                  <div className="flex flex-row-reverse items-center justify-between">
                    <Label htmlFor="orange_cash" className="cursor-pointer text-right flex-1">أورانج كاش</Label>
                    <Switch
                      id="orange_cash"
                      checked={withdrawalSettings.enabledPaymentMethods.orange_cash}
                      onCheckedChange={(checked) => handlePaymentMethodChange('orange_cash', checked)}
                    />
                  </div>
                  
                  <div className="flex flex-row-reverse items-center justify-between">
                    <Label htmlFor="bank_transfer" className="cursor-pointer text-right flex-1">تحويل بنكي</Label>
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

            <div className="flex justify-start mt-6">
              <Button 
                onClick={() => handleSaveSettings('withdrawals')}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                <Save className="mr-2 h-4 w-4" />
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
