
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, CalendarDays, Edit3, PlusCircle, MessageSquare, Briefcase, Award, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { getSellerById, getGigsBySellerId } from '@/lib/data'; 

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { startConversation, setActiveConversation } = useChat();
  
  const [profileData, setProfileData] = useState(null);
  const [userGigs, setUserGigs] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '', bio: '', location: '', skills: '' });

  const isOwnProfile = user && user.id === id;

  useEffect(() => {
    let data;
    if (isOwnProfile) {
      data = user;
    } else {
      data = getSellerById(id);
    }

    if (data) {
      setProfileData(data);
      setUserGigs(getGigsBySellerId(data.id));
      if (isOwnProfile) {
        setEditFormData({
          name: data.name || '',
          bio: data.bio || '',
          location: data.location || '',
          skills: data.skills ? data.skills.join(', ') : '',
        });
      }
    } else {
      navigate('/404'); 
    }
  }, [id, user, isOwnProfile, navigate]);

  const handleEditFormChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleSaveChanges = () => {
    const updatedSkills = editFormData.skills.split(',').map(skill => skill.trim()).filter(skill => skill);
    updateProfile({ ...editFormData, skills: updatedSkills });
    setIsEditing(false);
  };

  const handleContactSeller = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.id === profileData.id) return; 
    const conversationId = startConversation(profileData);
    setActiveConversation(conversationId);
    navigate('/chat');
  };

  if (!profileData) {
    return <div className="container mx-auto px-4 py-8 text-center">جاري تحميل الملف الشخصي...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >        {/* Profile Header */}
        <Card className="mb-8 shadow-xl overflow-hidden border-lightBeige bg-gradient-to-br from-lightBeige/50 via-lightGreen/30 to-white">
          <div className="relative h-48 bg-gradient-to-r from-olivePrimary to-burntOrange">
            <img src="https://images.unsplash.com/photo-1692975716697-4abaff365786" alt="غلاف الملف الشخصي" className="w-full h-full object-cover opacity-30" />
          </div>
          <CardContent className="pt-0 -mt-16">
            <div className="flex flex-col md:flex-row items-center md:items-end">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage src={profileData.avatar} alt={profileData.name} />
                <AvatarFallback className="text-4xl">{profileData.name ? profileData.name.charAt(0) : 'U'}</AvatarFallback>
              </Avatar>
              <div className="md:mr-6 mt-4 md:mt-0 text-center md:text-right">
                <h1 className="text-3xl font-bold text-gray-800">{profileData.name}</h1>
                {profileData.role === 'seller' && (
                  <p className="text-md text-primary">{profileData.skills ? profileData.skills.slice(0,2).join(' | ') : 'حرفي'}</p>
                )}
              </div>
              <div className="mt-4 md:mt-0 md:mr-auto flex space-x-2 space-x-reverse">
                {isOwnProfile ? (
                  <Button onClick={() => setIsEditing(!isEditing)} variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                    <Edit3 className="ml-2 h-4 w-4" /> {isEditing ? 'إلغاء التعديل' : 'تعديل الملف الشخصي'}
                  </Button>
                ) : (
                  <Button onClick={handleContactSeller} className="bg-burntOrange hover:bg-burntOrange/90 text-white">
                    <MessageSquare className="ml-2 h-4 w-4" /> تواصل
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Form (Conditional) */}
        {isEditing && isOwnProfile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <Card className="shadow-lg border-orange-200">
              <CardHeader>
                <CardTitle className="text-xl text-primary">تعديل معلوماتك الشخصية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">الاسم</label>
                  <Input type="text" name="name" id="name" value={editFormData.name} onChange={handleEditFormChange} className="mt-1" />
                </div>
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">نبذة تعريفية</label>
                  <Textarea name="bio" id="bio" value={editFormData.bio} onChange={handleEditFormChange} rows={3} className="mt-1" />
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">الموقع</label>
                  <Input type="text" name="location" id="location" value={editFormData.location} onChange={handleEditFormChange} className="mt-1" />
                </div>
                <div>
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-700">المهارات (مفصولة بفاصلة)</label>
                  <Input type="text" name="skills" id="skills" value={editFormData.skills} onChange={handleEditFormChange} className="mt-1" />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveChanges} className="bg-green-500 hover:bg-green-600">حفظ التغييرات</Button>
                <Button onClick={() => setIsEditing(false)} variant="ghost" className="mr-2">إلغاء</Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {/* Profile Details & Gigs */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Sidebar: About */}
          <motion.div 
            className="md:col-span-1 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-lg border-orange-100">
              <CardHeader>
                <CardTitle className="text-xl text-gray-700">نبذة عني</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">{profileData.bio || 'لا توجد نبذة تعريفية متاحة.'}</p>
                <Separator className="my-4" />
                <div className="space-y-2 text-sm text-gray-600">
                  {profileData.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 ml-2 text-primary" /> {profileData.location}
                    </div>
                  )}
                  {profileData.memberSince && (
                    <div className="flex items-center">
                      <CalendarDays className="h-4 w-4 ml-2 text-primary" /> عضو منذ {new Date(profileData.memberSince).toLocaleDateString('ar-EG')}
                    </div>
                  )}
                </div>
                {profileData.role === 'seller' && profileData.skills && profileData.skills.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <h4 className="font-semibold text-gray-700 mb-2">المهارات:</h4>
                    <div className="flex flex-wrap gap-2">
                      {profileData.skills.map(skill => (
                        <Badge key={skill} variant="secondary" className="bg-lightGreen/20 text-darkOlive">{skill}</Badge>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            {profileData.role === 'seller' && (
              <Card className="shadow-lg border-orange-100">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-700">إحصائيات البائع</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center"><Star className="h-5 w-5 ml-2 text-yellow-400" /> متوسط التقييم</span>
                    <span className="font-semibold">{profileData.rating?.toFixed(1) || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center"><Award className="h-5 w-5 ml-2 text-green-500" /> الطلبات المكتملة</span>
                    <span className="font-semibold">{profileData.completedOrders || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center"><Users className="h-5 w-5 ml-2 text-blue-500" /> عدد التقييمات</span>
                    <span className="font-semibold">{profileData.reviewCount || 0}</span>
                  </div>
                   <div className="flex items-center justify-between">
                    <span className="flex items-center"><Briefcase className="h-5 w-5 ml-2 text-purple-500" /> عدد الخدمات</span>
                    <span className="font-semibold">{userGigs.length}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Right Content: Gigs */}
          <motion.div 
            className="md:col-span-2 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {profileData.role === 'seller' ? 'خدماتي' : 'طلباتي'} ({userGigs.length})
              </h2>
              {isOwnProfile && profileData.role === 'seller' && (
                <Button onClick={() => navigate('/dashboard/gigs/new')} className="bg-green-500 hover:bg-green-600">
                  <PlusCircle className="ml-2 h-4 w-4" /> أضف خدمة جديدة
                </Button>
              )}
            </div>

            {userGigs.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-6">
                {userGigs.map(gig => (
                  <Card key={gig.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 card-hover border-lightBeige/50">
                    <div className="relative h-48">
                      <img 
                        src={gig.images && gig.images.length > 0 
                          ? gig.images[0] 
                          : "https://images.unsplash.com/photo-1690721606848-ac5bdcde45ea"} 
                        alt={gig.title} 
                        className="w-full h-full object-cover" 
                      />
                      <Badge variant="secondary" className="absolute top-2 right-2 bg-olivePrimary text-white">{gig.category}</Badge>
                    </div>
                    <CardHeader className="pb-1">
                      <CardTitle className="text-md font-semibold text-gray-700 h-12 overflow-hidden">{gig.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        {gig.rating} ({gig.reviewCount} تقييمات)
                      </div>
                      <p className="text-lg font-bold text-primary">{gig.price} جنيه</p>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button asChild variant="outline" className="flex-1 border-olivePrimary/30 text-darkOlive hover:bg-lightGreen/30 hover:text-olivePrimary hover:border-olivePrimary">
                        <Link to={`/gigs/${gig.id}`}>عرض</Link>
                      </Button>
                      {isOwnProfile && (
                         <Button asChild variant="outline" className="flex-1">
                           <Link to={`/dashboard/gigs/edit/${gig.id}`}>تعديل</Link>
                         </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12 border-dashed border-gray-300">
                <CardContent>
                  <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    {profileData.role === 'seller' ? 'لا توجد خدمات معروضة حالياً' : 'لا توجد طلبات حالياً'}
                  </h3>
                  <p className="text-gray-500">
                    {profileData.role === 'seller' ? 'ابدأ بإضافة خدماتك ليراها العملاء!' : 'تصفح المنتجات وقم بطلبك الأول!'}
                  </p>
                  {profileData.role === 'buyer' && (
                    <Button asChild className="mt-4 bg-burntOrange hover:bg-burntOrange/90 text-white">
                      <Link to="/explore">استكشف المنتجات</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
