import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Bell, CreditCard, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const SettingsSection = ({ title, description, icon, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card className="shadow-lg border-orange-100">
      <CardHeader className="flex flex-row items-start space-x-4 space-x-reverse pb-4">
        {React.createElement(icon, { className: "h-8 w-8 text-primary mt-1" })}
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

const DashboardSettings = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    avatarUrl: user?.avatar || '', // Assuming avatar is a URL
    phone: user?.phone || '',
    skills: user?.skills || []
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [newSkill, setNewSkill] = useState('');

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleAddSkill = () => {
    if (newSkill.trim() === '') return;
    
    // Add the new skill if it doesn't already exist
    if (!profileData.skills.includes(newSkill.trim())) {
      setProfileData({
        ...profileData, 
        skills: [...profileData.skills, newSkill.trim()]
      });
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.name || !profileData.email) {
      toast({ variant: "destructive", title: "خطأ", description: "الاسم والبريد الإلكتروني حقول إلزامية." });
      return;
    }
    const profileUpdateData = await updateProfile({
      name: profileData.name,
      email: profileData.email,
      bio: profileData.bio,
      avatar: profileData.avatarUrl,
      phone: profileData.phone,
      skills: profileData.skills,
    });
    
    // Include skills only if user is a seller
    if (user?.active_role === 'seller') {
      profileUpdateData.skills = profileData.skills;
    }
    
    const success = await updateProfile(profileUpdateData);
    if (success) {
      toast({ title: "تم تحديث الملف الشخصي", description: "تم حفظ تغييرات ملفك الشخصي بنجاح." });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ variant: "destructive", title: "خطأ", description: "كلمتا المرور الجديدتان غير متطابقتين." });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast({ variant: "destructive", title: "خطأ", description: "يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل." });
      return;
    }
    const success = await changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
      confirmPassword: passwordData.confirmPassword,
    });
    if (success) {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast({ title: "تم تحديث كلمة المرور", description: "تم تغيير كلمة المرور بنجاح." });
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      <motion.h1 
        className="text-3xl font-bold text-gray-800"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        إعدادات الحساب
      </motion.h1>

      {/* Profile Settings */}
      <SettingsSection title="الملف الشخصي" description="تحديث معلوماتك الشخصية وصورة العرض." icon={User}>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">الاسم الكامل</Label>
              <Input id="name" name="name" value={profileData.name} onChange={handleProfileChange} />
            </div>
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" name="email" type="email" value={profileData.email} onChange={handleProfileChange} />
            </div>
          </div>
          <div>
            <Label htmlFor="bio">نبذة تعريفية</Label>
            <Textarea id="bio" name="bio" value={profileData.bio} onChange={handleProfileChange} rows={3} placeholder="أخبرنا المزيد عنك..." />
          </div>
          <div>
            <Label htmlFor="avatarUrl">رابط صورة الملف الشخصي</Label>
            <Input id="avatarUrl" name="avatarUrl" value={profileData.avatarUrl} onChange={handleProfileChange} placeholder="https://example.com/avatar.jpg" />
          </div>
          <div>
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input id="phone" name="phone" value={profileData.phone} onChange={handleProfileChange} placeholder="مثال: +201234567890" />
          </div>
          
          {/* Skills section for sellers only */}
          {user?.active_role === 'seller' && (
            <div className="space-y-3">
              <Label>المهارات</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {profileData.skills.map((skill, index) => (
                  <div key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full flex items-center">
                    <span>{skill}</span>
                    <button 
                      type="button" 
                      className="ml-2 text-gray-500 hover:text-red-500"
                      onClick={() => handleRemoveSkill(skill)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="أضف مهارة جديدة"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                />
                <Button 
                  type="button" 
                  onClick={handleAddSkill} 
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                >
                  إضافة
                </Button>
              </div>
            </div>
          )}
          
          <Button type="submit" className="bg-burntOrange hover:bg-burntOrange/90 text-white">
            <Save className="ml-2 h-4 w-4" /> حفظ تغييرات الملف الشخصي
          </Button>
        </form>
      </SettingsSection>

      <Separator />

      {/* Password Settings */}
      <SettingsSection title="الأمان وكلمة المرور" description="تغيير كلمة المرور الخاصة بك." icon={Lock}>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
            <Input id="currentPassword" name="currentPassword" type="password" value={passwordData.currentPassword} onChange={handlePasswordChange} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
              <Input id="newPassword" name="newPassword" type="password" value={passwordData.newPassword} onChange={handlePasswordChange} />
            </div>
            <div>
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={handlePasswordChange} />
            </div>
          </div>
          <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
            <Save className="ml-2 h-4 w-4" /> تغيير كلمة المرور
          </Button>
        </form>
      </SettingsSection>
      
      <Separator />

      {/* Notifications Settings (Placeholder) */}
      <SettingsSection title="الإشعارات" description="إدارة تفضيلات الإشعارات الخاصة بك." icon={Bell}>
        <p className="text-gray-600">سيتم إضافة إعدادات الإشعارات قريباً.</p>
      </SettingsSection>

      {/* Seller specific settings */}
      {user?.active_role === 'seller' && (
        <>
          <Separator />
          {/* Payment Settings (Placeholder for Sellers) */}
          <SettingsSection title="إعدادات الدفع" description="إدارة طرق سحب الأرباح." icon={CreditCard}>
            <p className="text-gray-600">سيتم إضافة إعدادات الدفع للبائعين قريباً.</p>
          </SettingsSection>
        </>
      )}
    </div>
  );
};

export default DashboardSettings;
