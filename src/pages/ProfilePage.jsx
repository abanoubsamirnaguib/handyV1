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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
const getApiUrl = (path) => `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { startConversation, setActiveConversation } = useChat();
  const [profileData, setProfileData] = useState(null);
  const [userGigs, setUserGigs] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '', bio: '', location: '', skills: '' });
  const [loading, setLoading] = useState(true);

  const isOwnProfile = !id || id === 'me' || (user && user.id === id);

  // Add a dependency array tracking variable to prevent multiple fetches
  const [fetchCounter, setFetchCounter] = useState(0);

  useEffect(() => {
    // Only fetch once per component mount
    if (fetchCounter > 0) return;

    const fetchProfile = async () => {
      setLoading(true);
      setFetchCounter(prev => prev + 1);

      try {
        // Set URL based on whether this is the user's own profile
        const url = isOwnProfile 
          ? getApiUrl('/api/me')
          : getApiUrl(`/api/users/${id}`);

        const token = localStorage.getItem('token');
        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          // Add cache control headers to prevent repeated fetches
          cache: 'force-cache'
        });

        if (!res.ok) throw new Error('Not found');

        const data = await res.json();
        setProfileData(data);

        // Update form data if this is the user's own profile
        if (isOwnProfile) {
          setEditFormData({
            name: data.name || '',
            bio: data.bio || '',
            location: data.location || '',
            skills: data.skills ? data.skills.join(', ') : '',
          });

          // Also update localStorage with the fresh data
          if (user) {
            const updatedUser = { ...user, ...data };
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        }

        // Fetch gigs if the user is a seller - only do this once
        if (data.role === 'seller') {
          const sellerID = data.id;
          const gigsRes = await fetch(getApiUrl(`/api/sellers/${sellerID}`), {
            cache: 'force-cache'
          });
          if (gigsRes.ok) {
            const sellerData = await gigsRes.json();
            setUserGigs(sellerData.gigs || []);
          } else {
            setUserGigs([]);
          }
        } else {
          setUserGigs([]);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setProfileData(null);
        setUserGigs([]);
        navigate('/404');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();

    // Add cleanup function
    return () => {
      console.log('Profile page unmounted');
    };
  }, [id, isOwnProfile, navigate]); // Remove user from dependency array to prevent re-fetches

  const handleEditFormChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleSaveChanges = async () => {
    const updatedSkills = editFormData.skills
      ? editFormData.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
      : [];
    
    try {
      // Create an object with the data to update
      const dataToUpdate = {
        name: editFormData.name,
        bio: editFormData.bio,
        location: editFormData.location,
        skills: updatedSkills
      };
      
      console.log('Sending profile update:', dataToUpdate);
      
      const success = await updateProfile(dataToUpdate);
      
      if (success) {
        // Immediately update the profile data state to reflect changes
        setProfileData(prev => ({
          ...prev,
          ...dataToUpdate
        }));
        
        setIsEditing(false);
        
        // Update localStorage directly to ensure consistency
        const storedUserData = localStorage.getItem('user');
        if (storedUserData) {
          try {
            const parsedData = JSON.parse(storedUserData);
            const updatedUser = {
              ...parsedData,
              ...dataToUpdate
            };
            
            // Store the updated data back to localStorage
            localStorage.setItem('user', JSON.stringify(updatedUser));
            console.log('Updated user data in localStorage:', updatedUser);
            
            // Force a re-fetch of profile data from API to ensure everything is in sync
            const token = localStorage.getItem('token');
            const url = getApiUrl('/api/me');
            const response = await fetch(url, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            
            if (response.ok) {
              const freshData = await response.json();
              setProfileData(freshData);
            }
          } catch (e) {
            console.error('Error updating localStorage:', e);
          }
        }
      } else {
        console.warn("Profile update was not successful");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
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

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">جاري تحميل الملف الشخصي...</div>;
  }
  if (!profileData) {
    return <div className="container mx-auto px-4 py-8 text-center">تعذر تحميل الملف الشخصي.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="mb-8 shadow-xl overflow-hidden border-orange-200 bg-gradient-to-br from-orange-50 via-amber-50 to-white">
          <div className="relative h-48 bg-gradient-to-r from-orange-500 to-amber-400">
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
                  <Button onClick={handleContactSeller} className="bg-orange-500 hover:bg-orange-600">
                    <MessageSquare className="ml-2 h-4 w-4" /> تواصل
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

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

        <div className="grid md:grid-cols-3 gap-8">
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
                        <Badge key={skill} variant="secondary" className="bg-orange-100 text-orange-700">{skill}</Badge>
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
                  <Card key={gig.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 card-hover border-amber-100">
                    <div className="relative h-48">
                      <img 
                        src={gig.images && gig.images.length > 0 
                          ? gig.images[0] 
                          : "https://images.unsplash.com/photo-1690721606848-ac5bdcde45ea"} 
                        alt={gig.title} 
                        className="w-full h-full object-cover" 
                      />
                      <Badge variant="secondary" className="absolute top-2 right-2 bg-amber-500 text-white">{gig.category}</Badge>
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
                      <Button asChild variant="outline" className="flex-1 border-orange-400 text-orange-500 hover:bg-orange-500 hover:text-white">
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
                    <Button asChild className="mt-4 bg-orange-500 hover:bg-orange-600">
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
