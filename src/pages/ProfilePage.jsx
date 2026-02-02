import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, CalendarDays, Edit3, PlusCircle, MessageSquare, Briefcase, Award, Users, Phone, X, Crop, Share2, ShoppingBag, Eye, Clock, CheckCircle, XCircle, Package, Truck } from 'lucide-react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { apiFetch, apiUrl, api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateProfile, uploadProfileImage, uploadCoverImage } = useAuth();
  const { startConversation, setActiveConversation } = useChat();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState(null);
  const [userGigs, setUserGigs] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [sellerReviews, setSellerReviews] = useState([]);
  const [sellerData, setSellerData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '', bio: '', location: '', skills: '', avatar: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [uploadingCoverImage, setUploadingCoverImage] = useState(false);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [showCropModal, setShowCropModal] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  const isOwnProfile = !id || id === 'me' || (user && user.id === id);

  // Handle share profile link
  const handleShare = async () => {
    // Generate the correct seller URL format regardless of current URL
    const baseUrl = window.location.origin;
    // Use the real user ID instead of 'me' for sharing
    const shareUrl = `${baseUrl}/sellers/${profileData?.id || user?.id}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: profileData?.name,
          text: profileData?.bio || "تفقد ملفي الشخصي على بازار",
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 3000);
        toast({
          title: "تم نسخ الرابط",
          description: "تم نسخ رابط الملف الشخصي إلى الحافظة"
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

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
          ? apiUrl('me')
          : apiUrl(`users/${id}`);

        console.log('Fetching profile from:', url);
        const token = localStorage.getItem('token');
        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          // Add cache control headers to prevent repeated fetches
          cache: 'force-cache'
        });

        if (!res.ok) throw new Error('Not found');

        const data = (await res.json()).data;
        console.log('Raw backend data received:', data);
        
        // Validate and structure the data properly
        const validatedData = {
          id: data.id,
          name: data.name || '',
          bio: data.bio || '',
          location: data.location || '',
          active_role: data.active_role || 'buyer',
          skills: Array.isArray(data.skills) ? data.skills : [],
          avatar: data.avatar || '',
          cover_image: data.cover_image || '',
          phone: data.phone || '',
          seller_id: data.seller_id || null,
          rating: typeof data.rating === 'number' ? data.rating : (parseFloat(data.rating) || 0),
          completedOrders: typeof data.completedOrders === 'number' ? data.completedOrders : (parseInt(data.completedOrders) || 0),
          reviewCount: typeof data.reviewCount === 'number' ? data.reviewCount : (parseInt(data.reviewCount) || 0),
          memberSince: data.memberSince || data.createdAt || new Date().toISOString()
        };
        
        console.log('Validated profile data being set:', validatedData);
        setProfileData(validatedData);

        // Update form data if this is the user's own profile
        if (isOwnProfile) {
          const formData = {
            name: validatedData.name,
            bio: validatedData.bio,
            location: validatedData.location,
            skills: validatedData.skills.join(', '),
            avatar: validatedData.avatar || '',
            phone: validatedData.phone || '',
          };
          console.log('Setting edit form data:', formData);
          setEditFormData(formData);

          // Also update localStorage with the fresh data
          if (user) {
            const updatedUser = { ...user, ...validatedData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            console.log('Updated localStorage with validated data:', updatedUser);
          }
        }
        
        // Fetch complete seller data if the user is a seller
        if (validatedData.active_role === 'seller' && validatedData.seller_id) {
          const sellerID = validatedData.seller_id;
          console.log('Fetching complete seller data for seller ID:', sellerID);
          
          try {
            // Fetch seller data from seller endpoint
            const sellerResponse = await apiFetch(`listsellers/${sellerID}`);
            console.log('Raw seller data received:', sellerResponse);
            
            if (sellerResponse.data) {
              const sellerInfo = sellerResponse.data;
              
              // Update profile data with seller statistics
              const updatedProfileData = {
                ...validatedData,
                rating: typeof sellerInfo.rating === 'number' ? sellerInfo.rating : parseFloat(sellerInfo.rating) || 0,
                reviewCount: typeof sellerInfo.review_count === 'number' ? sellerInfo.review_count : parseInt(sellerInfo.review_count) || 0,
                completedOrders: typeof sellerInfo.completed_orders === 'number' ? sellerInfo.completed_orders : parseInt(sellerInfo.completed_orders) || 0,
                memberSince: sellerInfo.member_since || validatedData.memberSince,
                skills: Array.isArray(sellerInfo.skills) ? sellerInfo.skills : validatedData.skills
              };
              setProfileData(updatedProfileData);
              
              // Store seller data separately
              setSellerData({
                id: sellerInfo.id,
                rating: typeof sellerInfo.rating === 'number' ? sellerInfo.rating : parseFloat(sellerInfo.rating) || 0,
                review_count: typeof sellerInfo.review_count === 'number' ? sellerInfo.review_count : parseInt(sellerInfo.review_count) || 0,
                completed_orders: typeof sellerInfo.completed_orders === 'number' ? sellerInfo.completed_orders : parseInt(sellerInfo.completed_orders) || 0,
                member_since: sellerInfo.member_since
              });
              
              // Fetch seller's products/gigs
              const products = sellerInfo.products || [];
              const validatedGigs = Array.isArray(products) ? products.map(product => ({
                id: product.id,
                title: product.title || 'عنوان غير محدد',
                price: typeof product.price === 'number' ? product.price : 0,
                category: product.category?.name || product.category || 'غير محدد',
                rating: typeof product.rating === 'number' ? product.rating : (parseFloat(product.rating) || 0),
                reviewCount: typeof product.review_count === 'number' ? product.review_count : 0,
                images: Array.isArray(product.images) 
                  ? product.images.map(img => img.url || img.image_url || img)
                  : [],
                description: product.description || ''
              })) : [];
              
              console.log('Validated gigs data being set:', validatedGigs);
              setUserGigs(validatedGigs);
              
              // Fetch seller reviews
              try {
                const reviewsResponse = await apiFetch(`sellers/${sellerID}/reviews`);
                if (reviewsResponse && reviewsResponse.data && Array.isArray(reviewsResponse.data)) {
                  setSellerReviews(reviewsResponse.data);
                }
              } catch (reviewError) {
                console.warn('Failed to fetch seller reviews:', reviewError);
                setSellerReviews([]);
              }
            }
          } catch (sellerError) {
            console.warn('Failed to fetch seller data, trying fallback:', sellerError);
            // Fallback: try to fetch gigs using user ID
            try {
              const gigsRes = await fetch(apiUrl(`/listsellers/${validatedData.id}`), {
                cache: 'force-cache'
              });
              
              if (gigsRes.ok) {
                const sellerData = await gigsRes.json();
                const gigs = sellerData.gigs || sellerData.data?.products || [];
                const validatedGigs = Array.isArray(gigs) ? gigs.map(gig => ({
                  id: gig.id,
                  title: gig.title || 'عنوان غير محدد',
                  price: typeof gig.price === 'number' ? gig.price : 0,
                  category: gig.category?.name || gig.category || 'غير محدد',
                  rating: typeof gig.rating === 'number' ? gig.rating : (parseFloat(gig.rating) || 0),
                  reviewCount: typeof gig.reviewCount === 'number' ? gig.reviewCount : 0,
                  images: Array.isArray(gig.images) 
                    ? gig.images.map(img => img.url || img.image_url || img)
                    : [],
                  description: gig.description || ''
                })) : [];
                
                setUserGigs(validatedGigs);
              }
            } catch (fallbackError) {
              console.warn('Fallback also failed:', fallbackError);
              setUserGigs([]);
            }
          }
        } else {
          console.log('User is not a seller, setting empty gigs array');
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

  // Fetch user orders if the user is a buyer
  useEffect(() => {
    const fetchUserOrders = async () => {
      // Only fetch orders if:
      // 1. This is the user's own profile
      // 2. The user is a buyer (not a seller)
      // 3. Profile data is loaded
      if (!isOwnProfile || !profileData || profileData.active_role === 'seller') {
        setUserOrders([]);
        return;
      }

      setOrdersLoading(true);
      try {
        const response = await api.getOrders({ user_orders: true });
        console.log('User orders API response:', response);
        
        // Handle both paginated and direct array responses
        const ordersData = response.data || response;
        setUserOrders(Array.isArray(ordersData) ? ordersData : []);
      } catch (error) {
        console.error('Error loading user orders:', error);
        setUserOrders([]);
        toast({
          variant: "destructive",
          title: "خطأ في تحميل الطلبات",
          description: "حدث خطأ أثناء تحميل الطلبات. يرجى المحاولة مرة أخرى.",
        });
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchUserOrders();
  }, [isOwnProfile, profileData, toast]);

  const handleEditFormChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        alert('يرجى اختيار ملف صورة صالح.');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت.');
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
        setAvatarPreview(null);
        // Refresh profile data
        const updatedProfile = { ...profileData, avatar: result.data.avatar };
        setProfileData(updatedProfile);
        setEditFormData(prev => ({ ...prev, avatar: result.data.avatar }));
      }
    } catch (error) {
      console.error('Avatar upload failed:', error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        alert('يرجى اختيار ملف صورة صالح.');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('حجم الصورة يجب أن يكون أقل من 10 ميجابايت.');
        return;
      }

      setCoverImageFile(file);
      
      // Create preview for cropping
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImagePreview(e.target.result);
        setShowCropModal(true);
        // Reset crop state
        setCrop(undefined);
        setCompletedCrop(undefined);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadCoverImage = async () => {
    if (!coverImageFile) return;
    
    setUploadingCoverImage(true);
    try {
      const result = await uploadCoverImage(coverImageFile);
      if (result.success) {
        setCoverImageFile(null);
        setCoverImagePreview(null);
        // Refresh profile data
        const updatedProfile = { ...profileData, cover_image: result.data.cover_image };
        setProfileData(updatedProfile);
      }
    } catch (error) {
      console.error('Cover image upload failed:', error);
    } finally {
      setUploadingCoverImage(false);
    }
  };

  // Image cropping functions
  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    
    // Set crop to cover image aspect ratio (3:1 for cover images)
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        3 / 1, // aspect ratio 3:1
        width,
        height
      ),
      width,
      height
    );
    
    setCrop(crop);
  }

  async function getCroppedImg() {
    if (!completedCrop || !imgRef.current || !canvasRef.current) {
      return null;
    }

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 1);
    });
  }

  const handleCropComplete = async () => {
    try {
      const croppedBlob = await getCroppedImg();
      if (croppedBlob) {
        // Convert blob to file
        const croppedFile = new File([croppedBlob], coverImageFile.name, {
          type: croppedBlob.type,
        });
        
        setUploadingCoverImage(true);
        const result = await uploadCoverImage(croppedFile);
        
        if (result.success) {
          // Refresh profile data
          const updatedProfile = { ...profileData, cover_image: result.data.cover_image };
          setProfileData(updatedProfile);
          
          // Reset states
          setCoverImageFile(null);
          setCoverImagePreview(null);
          setShowCropModal(false);
          setCrop(undefined);
          setCompletedCrop(undefined);
        }
      }
    } catch (error) {
      console.error('Cover image upload failed:', error);
    } finally {
      setUploadingCoverImage(false);
    }
  };

  const handleCropCancel = () => {
    setCoverImageFile(null);
    setCoverImagePreview(null);
    setShowCropModal(false);
    setCrop(undefined);
    setCompletedCrop(undefined);
  };
  const handleSaveChanges = async () => {
    // Only process skills if the user is a seller
    const updatedSkills = profileData?.active_role === 'seller' && editFormData.skills
      ? editFormData.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
      : [];
    try {
      // Create an object with the data to update
      const dataToUpdate = {
        name: editFormData.name.trim(),
        bio: editFormData.bio.trim(),
        location: editFormData.location.trim(),
        avatar: editFormData.avatar,
        phone: editFormData.phone,
      };
      
      // Only add skills to the update data if the user is a seller
      if (profileData?.active_role === 'seller') {
        dataToUpdate.skills = updatedSkills;
      }
      
      console.log('Sending profile update:', dataToUpdate);
      
      const success = await updateProfile(dataToUpdate);
      
      if (success) {
        console.log('Profile update successful, updating local state');
        
        // Immediately update the profile data state to reflect changes with proper validation
        setProfileData(prev => {
          const updated = {
            ...prev,
            name: dataToUpdate.name || prev.name,
            bio: dataToUpdate.bio || prev.bio,
            location: dataToUpdate.location || prev.location,
            skills: Array.isArray(dataToUpdate.skills) ? dataToUpdate.skills : prev.skills
          };
          console.log('Updated profile data state:', updated);
          return updated;
        });
        
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
            const url = apiUrl('me');
            const response = await fetch(url, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            
            if (response.ok) {
              const freshData = (await response.json()).data;
              console.log('Fresh data received from API:', freshData);
                // Validate fresh data before setting
              const validatedFreshData = {
                id: freshData.id,
                name: freshData.name || '',
                bio: freshData.bio || '',
                location: freshData.location || '',
                active_role: freshData.active_role || 'buyer',
                skills: Array.isArray(freshData.skills) ? freshData.skills : [],
                avatar: freshData.avatar || '',
                cover_image: freshData.cover_image || '',
                rating: typeof freshData.rating === 'number' ? freshData.rating : 0,
                completedOrders: typeof freshData.completedOrders === 'number' ? freshData.completedOrders : 0,
                reviewCount: typeof freshData.reviewCount === 'number' ? freshData.reviewCount : 0,
                memberSince: freshData.memberSince || freshData.createdAt || new Date().toISOString()
              };
              
              console.log('Setting validated fresh profile data:', validatedFreshData);
              setProfileData(validatedFreshData);
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

  const handleContactSeller = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.id === profileData.id) return;
    try {
      const conversationId = await startConversation(profileData);
      setActiveConversation(conversationId);
      navigate('/chat');
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
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
        transition={{ duration: 0.5 }}      >        {/* Profile Header */}
        <Card className="mb-8 shadow-xl overflow-hidden border-neutral-200 bg-neutral-100">
          <div className="relative h-48 bg-roman-500">
            {profileData.cover_image ? (
              <img 
                src={profileData.cover_image} 
                alt="غلاف الملف الشخصي" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <img 
                src="https://images.unsplash.com/photo-1692975716697-4abaff365786" 
                alt="غلاف الملف الشخصي" 
                className="w-full h-full object-cover opacity-100" 
              />
            )}
            {isOwnProfile && (
              <div className="absolute top-4 right-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white/80 hover:bg-white text-gray-700"
                  onClick={() => {
                    document.getElementById('cover-image-upload')?.click();
                  }}
                >
                  <Edit3 className="ml-2 h-4 w-4" /> تغيير صورة الغلاف
                </Button>
                <input
                  id="cover-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="hidden"
                />
              </div>
            )}
            {/* Crop modal will be rendered after the Card component */}
          </div>
          <CardContent className="pt-0 -mt-16">
            <div className="flex flex-col md:flex-row items-center md:items-end">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage src={profileData.avatar} alt={profileData.name} />
                <AvatarFallback className="text-4xl">{profileData.name ? profileData.name.charAt(0) : 'U'}</AvatarFallback>
              </Avatar>
              <div className="md:mr-6 mt-4 md:mt-0 text-center md:text-right">
                <h1 className="text-3xl font-bold text-gray-800">{profileData?.name || 'اسم غير محدد'}</h1>                {profileData?.active_role === 'seller' && (
                  <p className="text-md text-primary">
                    {profileData?.skills && profileData.skills.length > 0 
                      ? profileData.skills.slice(0,2).join(' | ') 
                      : 'حرفي'}
                  </p>
                )}
              </div>
              <div className="mt-4 md:mt-0 md:mr-auto flex space-x-2 space-x-reverse">
                <div className="flex gap-2">
                  {isOwnProfile ? (
                    <Button onClick={() => setIsEditing(!isEditing)} variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                      <Edit3 className="ml-2 h-4 w-4" /> {isEditing ? 'إلغاء التعديل' : 'تعديل الملف الشخصي'}
                    </Button>
                  ) : (
                    <Button onClick={handleContactSeller} className="bg-roman-500 hover:bg-roman-500/90 text-white">
                      <MessageSquare className="ml-2 h-4 w-4" /> تواصل
                    </Button>
                  )}
                  <Button onClick={handleShare} variant="outline" className="px-3">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cover Image Crop Modal */}
        {showCropModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-900">اختر منطقة صورة الغلاف</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCropCancel}
                  className="p-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="p-4 space-y-4 flex-1 overflow-auto">
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg flex-shrink-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Crop className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">كيفية الاستخدام:</span>
                  </div>
                  <p>اسحب الحدود لتحديد المنطقة التي تريد عرضها في صورة الغلاف. نسبة العرض إلى الارتفاع ستكون 3:1 لتناسب منطقة الغلاف.</p>
                </div>

                <div className="relative crop-container rounded-lg bg-gray-100 max-h-[60vh] flex items-center justify-center">
                  {coverImagePreview && (
                    <>
                      <div className="overflow-auto max-w-full max-h-full p-4">
                        <ReactCrop
                          crop={crop}
                          onChange={(_, percentCrop) => setCrop(percentCrop)}
                          onComplete={(c) => setCompletedCrop(c)}
                          aspect={3 / 1}
                          className="max-w-none"
                        >
                          <img
                            ref={imgRef}
                            alt="اختر منطقة الغلاف"
                            src={coverImagePreview}
                            onLoad={onImageLoad}
                            className="block max-w-none"
                            style={{ maxHeight: '70vh', width: 'auto' }}
                          />
                        </ReactCrop>
                      </div>
                      <canvas
                        ref={canvasRef}
                        className="hidden"
                      />
                    </>
                  )}
                </div>

                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded flex-shrink-0">
                  💡 نصيحة: إذا كانت الصورة طويلة، يمكنك التمرير داخل منطقة الصورة للوصول لجميع أجزائها وتحديد المنطقة المناسبة.
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 flex-shrink-0">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleCropComplete}
                    disabled={!completedCrop || uploadingCoverImage}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {uploadingCoverImage ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        جارٍ الرفع...
                      </div>
                    ) : (
                      'رفع صورة الغلاف'
                    )}
                  </Button>
                  <Button
                    onClick={handleCropCancel}
                    variant="outline"
                    className="flex-1 sm:flex-none"
                    disabled={uploadingCoverImage}
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

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
                </div>                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">الموقع</label>
                  <Input type="text" name="location" id="location" value={editFormData.location} onChange={handleEditFormChange} className="mt-1" />
                </div>
                {profileData?.active_role === 'seller' && (
                  <div>
                    <label htmlFor="skills" className="block text-sm font-medium text-gray-700">المهارات (مفصولة بفاصلة)</label>
                    <Input type="text" name="skills" id="skills" value={editFormData.skills} onChange={handleEditFormChange} className="mt-1" />
                  </div>
                )}
                {/* Profile Image Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">صورة الملف الشخصي</label>
                  <div className="flex items-center space-x-4 space-x-reverse">
                    {/* Avatar Preview */}
                    <div className="relative">
                      <img 
                        src={avatarPreview || profileData?.avatar || 'https://avatar.iran.liara.run/public/65'} 
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
                        id="avatar-upload" 
                        type="file" 
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      <div className="flex gap-2">
                        <label 
                          htmlFor="avatar-upload" 
                          className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                          اختيار صورة
                        </label>
                        {avatarFile && (
                          <button 
                            type="button"
                            onClick={handleUploadAvatar}
                            disabled={uploadingAvatar}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50"
                          >
                            {uploadingAvatar ? 'جاري الرفع...' : 'رفع الصورة'}
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        يرجى اختيار صورة بصيغة JPG، PNG أو GIF. الحد الأقصى: 5 ميجابايت
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">رقم الهاتف</label>
                  <Input type="text" name="phone" id="phone" value={editFormData.phone} onChange={handleEditFormChange} className="mt-1" placeholder="مثال: +201234567890" />
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
                <p className="text-gray-600 leading-relaxed">{profileData?.bio || 'لا توجد نبذة تعريفية متاحة.'}</p>
                <Separator className="my-4" />
                <div className="space-y-2 text-sm text-gray-600">
                  {profileData?.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 ml-2 text-primary" /> {profileData.location}
                    </div>
                  )}
                  {profileData?.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 ml-2 text-primary" /> {profileData.phone}
                    </div>
                  )}
                  {profileData?.memberSince && (
                    <div className="flex items-center">
                      <CalendarDays className="h-4 w-4 ml-2 text-primary" /> 
                      عضو منذ {new Date(profileData.memberSince).toLocaleDateString('ar-EG')}
                    </div>
                  )}
                </div>
                {profileData?.active_role === 'seller' && profileData?.skills && profileData.skills.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <h4 className="font-semibold text-gray-700 mb-2">المهارات:</h4>
                    <div className="flex flex-wrap gap-2">
                      {profileData.skills.map((skill, index) => (
                        <Badge key={`${skill}-${index}`} variant="secondary" className="bg-success-100/20 text-neutral-900">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            {profileData?.active_role === 'seller' && (
              <Card className="shadow-lg border-orange-100">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-700">إحصائيات البائع</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center"><Award className="h-5 w-5 ml-2 text-green-500" /> الطلبات المكتملة</span>
                    <span className="font-semibold">{profileData?.completedOrders || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center"><Users className="h-5 w-5 ml-2 text-blue-500" /> عدد التقييمات</span>
                    <span className="font-semibold">{profileData?.reviewCount || 0}</span>
                  </div>
                   <div className="flex items-center justify-between">
                    <span className="flex items-center"><Briefcase className="h-5 w-5 ml-2 text-purple-500" /> عدد الحرف</span>
                    <span className="font-semibold">{userGigs?.length || 0}</span>
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
                {profileData?.active_role === 'seller' ? 'حرفي' : 'طلباتي'} ({profileData?.active_role === 'seller' ? (userGigs?.length || 0) : (userOrders?.length || 0)})
              </h2>
              {isOwnProfile && profileData?.active_role === 'seller' && (
                <Button onClick={() => navigate('/dashboard/gigs/new')} className="bg-green-500 hover:bg-green-600">
                  <PlusCircle className="ml-2 h-4 w-4" /> أضف حرفة جديدة
                </Button>
              )}
            </div>

            {/* Show orders for buyers */}
            {profileData?.active_role === 'buyer' ? (
              ordersLoading ? (
                <Card className="text-center py-12 border-dashed border-gray-300">
                  <CardContent>
                    <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-spin" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">جاري تحميل الطلبات...</h3>
                  </CardContent>
                </Card>
              ) : userOrders && userOrders.length > 0 ? (
                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userOrders.map(order => {
                    const getStatusBadge = (status) => {
                      const statusConfig = {
                        'pending': { label: 'قيد الانتظار', className: 'bg-amber-100 text-amber-700', icon: Clock },
                        'pending_buyer_info': { label: 'بانتظار موافقة المشتري', className: 'bg-purple-100 text-purple-700', icon: Clock },
                        'admin_approved': { label: 'موافق عليه', className: 'bg-blue-100 text-blue-700', icon: CheckCircle },
                        'seller_approved': { label: 'موافق عليه', className: 'bg-indigo-100 text-indigo-700', icon: CheckCircle },
                        'work_completed': { label: 'تم الإنجاز', className: 'bg-cyan-100 text-cyan-700', icon: Package },
                        'out_for_delivery': { label: 'قيد التوصيل', className: 'bg-orange-100 text-orange-700', icon: Truck },
                        'delivered': { label: 'تم التسليم', className: 'bg-green-100 text-green-700', icon: Truck },
                        'completed': { label: 'مكتمل', className: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
                        'cancelled': { label: 'ملغى', className: 'bg-red-100 text-red-700', icon: XCircle },
                        'rejected': { label: 'مرفوض', className: 'bg-red-100 text-red-700', icon: XCircle }
                      };
                      const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-700', icon: Clock };
                      const Icon = config.icon;
                      return (
                        <Badge variant="outline" className={`${config.className} font-medium flex items-center px-3 py-1 text-xs`}>
                          <Icon className="ml-1 h-3 w-3" />
                          {config.label}
                        </Badge>
                      );
                    };

                    const formatDate = (dateString) => {
                      if (!dateString) return '';
                      return new Date(dateString).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      });
                    };

                    return (
                      <Card key={order.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 card-hover border-neutral-200/50">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between mb-2">
                            <CardTitle className="text-lg font-semibold text-gray-700">
                              طلب رقم #{order.id}
                            </CardTitle>
                            {getStatusBadge(order.status)}
                          </div>
                          <CardDescription className="text-sm text-gray-500">
                            <CalendarDays className="inline ml-1 h-3 w-3" />
                            {formatDate(order.order_date || order.created_at)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-3">
                          <div className="space-y-2">
                            {order.items && order.items.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-1">المنتجات:</h4>
                                {order.items.slice(0, 2).map((item, idx) => (
                                  <p key={idx} className="text-xs text-gray-600">
                                    {item.product?.title || 'منتج'} (x{item.quantity || 1})
                                  </p>
                                ))}
                                {order.items.length > 2 && (
                                  <p className="text-xs text-gray-500">+ {order.items.length - 2} منتج آخر</p>
                                )}
                              </div>
                            )}
                            <Separator />
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-gray-700">الإجمالي:</span>
                              <span className="text-lg font-bold text-roman-500">{order.total_price || 0} جنيه</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                          <Button asChild variant="outline" className="flex-1 border-roman-500/30 text-neutral-900 hover:bg-success-100/30 hover:text-roman-500 hover:border-roman-500">
                            <Link to={`/orders/${order.id}`}>
                              <Eye className="ml-2 h-4 w-4" />
                              عرض التفاصيل
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="text-center py-12 border-dashed border-gray-300">
                  <CardContent>
                    <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد طلبات حالياً</h3>
                    <p className="text-gray-500">تصفح المنتجات وقم بطلبك الأول!</p>
                    <Button asChild className="mt-4 bg-roman-500 hover:bg-roman-500/90 text-white">
                      <Link to="/explore">استكشف المنتجات</Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            ) : userGigs && userGigs.length > 0 ? (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {userGigs.map(gig => (
                  <Card key={gig.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 card-hover border-neutral-200/50">
                    <div className="relative h-48">
                      <img 
                        src={gig.images && gig.images.length > 0 
                          ? gig.images[0] 
                          : "https://images.unsplash.com/photo-1690721606848-ac5bdcde45ea"} 
                        alt={gig.title} 
                        className="w-full h-full object-cover" 
                      />
                      <Badge variant="secondary" className="absolute top-2 right-2 bg-roman-500 text-white">
                        {gig.category || 'غير محدد'}
                      </Badge>
                    </div>
                    <CardHeader className="pb-1">
                      <CardTitle className="text-md font-semibold text-gray-700 h-12 overflow-hidden">
                        {gig.title || 'عنوان غير محدد'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        {typeof gig.rating === 'number' ? gig.rating : (parseFloat(gig.rating) || 0)} ({gig.reviewCount || 0} تقييمات)
                      </div>
                      <p className="text-lg font-bold text-primary">{gig.price || 0} جنيه</p>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button asChild variant="outline" className="flex-1 border-roman-500/30 text-neutral-900 hover:bg-success-100/30 hover:text-roman-500 hover:border-roman-500">
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
                    {profileData?.active_role === 'seller' ? 'لا توجد حرف معروضة حالياً' : 'لا توجد طلبات حالياً'}
                  </h3>
                  <p className="text-gray-500">
                    {profileData?.active_role === 'seller' ? 'ابدأ بإضافة حرفك ليراها العملاء!' : 'تصفح المنتجات وقم بطلبك الأول!'}
                  </p>
                  {profileData?.active_role === 'buyer' && (
                    <Button asChild className="mt-4 bg-roman-500 hover:bg-roman-500/90 text-white">
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
