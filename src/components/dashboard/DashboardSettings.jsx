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
  const { user, updateProfile, changePassword, uploadProfileImage } = useAuth();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    avatarUrl: user?.avatar || '', // Keep for display purposes
    phone: user?.phone || '',
    skills: user?.skills || []
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [newSkill, setNewSkill] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        toast({ 
          variant: "destructive", 
          title: "خطأ", 
          description: "يرجى اختيار ملف صورة صالح." 
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ 
          variant: "destructive", 
          title: "خطأ", 
          description: "حجم الصورة يجب أن يكون أقل من 5 ميجابايت." 
        });
        return;
      }

      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;
    
    setUploadingAvatar(true);
    try {
      const result = await uploadProfileImage(avatarFile);
      if (result.success) {
        setAvatarFile(null);
        setAvatarPreview(result.data.avatar);
        // Update profileData with new avatar URL
        setProfileData(prev => ({ ...prev, avatarUrl: result.data.avatar }));
      }
    } catch (error) {
      console.error('Avatar upload failed:', error);
    } finally {
      setUploadingAvatar(false);
    }
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
          
          {/* Profile Image Upload Section */}
          <div>
            <Label>صورة الملف الشخصي</Label>
            <div className="flex items-center space-x-4 space-x-reverse mt-2">
              {/* Avatar Preview */}
              <div className="relative">
                <img 
                  src={avatarPreview || 'https://avatar.iran.liara.run/public/65'} 
                  alt="معاينة الصورة الشخصية" 
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                />
                {avatarFile && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    ✓
                  </div>
                )}
              </div>
              
              {/* Upload Controls */}
              <div className="flex-1 space-y-2">
                <Input 
                  id="avatar" 
                  type="file" 
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <div className="flex gap-2">
                  <Label 
                    htmlFor="avatar" 
                    className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    اختيار صورة
                  </Label>
                  {avatarFile && (
                    <Button 
                      type="button"
                      onClick={handleUploadAvatar}
                      disabled={uploadingAvatar}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm"
                    >
                      {uploadingAvatar ? 'جاري الرفع...' : 'رفع الصورة'}
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  يرجى اختيار صورة بصيغة JPG، PNG أو GIF. الحد الأقصى: 5 ميجابايت
                </p>
              </div>
            </div>
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
