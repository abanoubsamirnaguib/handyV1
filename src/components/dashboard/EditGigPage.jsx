import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Edit, Image as ImageIcon, DollarSign, Tag, Clock, Save, ArrowRight, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { sellerApi, apiFetch } from '@/lib/api';

// Custom RTL-friendly Select wrapper components
const RTLSelect = ({ children, value, onValueChange, ...props }) => {
  return (
    <Select dir="rtl" value={value} onValueChange={onValueChange} {...props}>
      {children}
    </Select>
  );
};

const RTLSelectTrigger = ({ children, ...props }) => {
  return (
    <SelectTrigger className="text-right" {...props}>
      {children}
    </SelectTrigger>
  );
};

const RTLSelectContent = ({ children, ...props }) => {
  return (
    <SelectContent align="end" className="rtl-select-content" {...props}>
      {children}
    </SelectContent>
  );
};

const RTLSelectItem = ({ children, ...props }) => {
  return (
    <SelectItem className="text-right" {...props}>
      {children}
    </SelectItem>
  );
};

const EditGigPage = () => {  const { gigId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [gigData, setGigData] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await apiFetch('listcategories');
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (data && Array.isArray(data.data)) {
          setCategories(data.data);
        } else if (data && data.success && Array.isArray(data.data)) {
          setCategories(data.data);
        } else {
          console.error('Invalid categories response structure:', data);
          setCategories([]);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        toast({
          variant: "destructive",
          title: "خطأ في تحميل التصنيفات",
          description: error.message || "فشل في تحميل التصنيفات"
        });
        setCategories([]);
      }
    };
    
    loadCategories();
  }, [toast]);

  // Fetch gig data
  useEffect(() => {
    const fetchGigData = async () => {
      if (!user || user.active_role !== 'seller') {
        return;
      }
      
      setLoading(true);
      
      try {        // Fetch gig details from API
        const response = await sellerApi.getProductById(gigId);
        
        if (response && (response.data || response)) {
          const gigDetails = response.data || response;
          
          // Format tags for the input field (comma-separated string)
          const formattedTags = Array.isArray(gigDetails.tags) 
            ? gigDetails.tags.map(tag => typeof tag === 'object' && tag.tag_name ? tag.tag_name : tag).join(', ')
            : '';
          
          // Process images to ensure we have proper URLs for previews
          const imageUrls = Array.isArray(gigDetails.images)
            ? gigDetails.images.map(img => {
                if (typeof img === 'string') return img;
                if (img && img.image_url) {
                  return img.image_url.startsWith('http') 
                    ? img.image_url 
                    : `${import.meta.env.VITE_API_BASE_URL}/storage/${img.image_url}`;
                }
                return null;
              }).filter(Boolean)
            : [];
          
          setGigData({
            ...gigDetails,
            category: gigDetails.category_id || (gigDetails.category && gigDetails.category.id),
            price: gigDetails.price ? gigDetails.price.toString() : '0',
            tags: formattedTags,
            deliveryTime: gigDetails.delivery_time || '',
            type: gigDetails.type || 'gig', // Default to gig if no type is specified
          });
          
          setImagePreviews(imageUrls);
        } else {
          toast({ 
            variant: "destructive",
            title: "خطأ في تحميل البيانات",
            description: "لم يتم العثور على الخدمة المطلوبة."
          });
          navigate('/dashboard/gigs');
        }
      } catch (error) {
        console.error('Error fetching gig details:', error);
        toast({
          variant: "destructive", 
          title: "خطأ في تحميل البيانات",
          description: error.message || "فشل في تحميل تفاصيل الخدمة."
        });
        navigate('/dashboard/gigs');
      } finally {
        setLoading(false);
      }
    };

    fetchGigData();
  }, [gigId, user, navigate, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGigData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value) => {
    setGigData(prev => ({ ...prev, category: value }));
  };
  
  const handleTypeChange = (value) => {
    setGigData(prev => ({ ...prev, type: value }));
  };  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    // Check if we're going to exceed the 5 image limit
    if (imagePreviews.length + files.length > 5) {
      toast({
        variant: "destructive",
        title: "الحد الأقصى للصور",
        description: "يمكنك إضافة 5 صور كحد أقصى. يرجى حذف بعض الصور أولاً."
      });
      return;
    }
    
    // Store actual File objects in the gigData state
    setGigData(prev => {
      // Initialize images array if it doesn't exist
      const currentImages = Array.isArray(prev.images) ? [...prev.images] : [];
      return { 
        ...prev, 
        // Append new file objects to existing array
        images: [...currentImages, ...files].slice(0, 5),
        // Flag to indicate there are new images that need to be uploaded
        hasNewImages: true
      };
    });

    // Create object URLs for new files to show as previews
    const newPreviewUrls = files.map(file => {
      const preview = URL.createObjectURL(file);
      return preview;
    });
    
    // Add new previews
    setImagePreviews(prev => {
      return [...prev, ...newPreviewUrls].slice(0, 5);
    });
  };
  const removeImage = (index) => {
    // Remove from previews
    setImagePreviews(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
    
    // Remove from actual images array in gigData
    setGigData(prev => {
      const updatedImages = Array.isArray(prev.images) ? [...prev.images] : [];
      
      // Only if we have images at this index
      if (index < updatedImages.length) {
        updatedImages.splice(index, 1);
      }
      
      return { ...prev, images: updatedImages };
    });
    
    // If the removed image was a File object created with URL.createObjectURL,
    // we should revoke the object URL to avoid memory leaks
    const removed = imagePreviews[index];
    if (removed && typeof removed === 'string' && removed.startsWith('blob:')) {
      URL.revokeObjectURL(removed);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!gigData) return;    // Basic validation
    if (!gigData.title || !gigData.title.trim()) {
      toast({ variant: "destructive", title: "حقل العنوان مطلوب", description: "يرجى إدخال عنوان للخدمة." });
      return;
    }
    
    if (!gigData.description || !gigData.description.trim()) {
      toast({ variant: "destructive", title: "حقل الوصف مطلوب", description: "يرجى إدخال وصف للخدمة." });
      return;
    }
    
    if (!gigData.price || parseFloat(gigData.price) <= 0) {
      toast({ variant: "destructive", title: "السعر غير صحيح", description: "يرجى إدخال سعر صحيح للخدمة." });
      return;
    }
    
    if (!gigData.category) {
      toast({ variant: "destructive", title: "التصنيف مطلوب", description: "يرجى اختيار تصنيف للخدمة." });
      return;
    }
    
    // Check if we have at least one image
    if (imagePreviews.length === 0) {
      toast({ 
        variant: "destructive", 
        title: "الصور مطلوبة", 
        description: "يرجى إضافة صورة واحدة على الأقل للخدمة."
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Process updated data for the API
      const updatedData = {
        title: gigData.title,
        description: gigData.description,
        price: parseFloat(gigData.price),
        category_id: gigData.category,
        tags: gigData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        delivery_time: gigData.deliveryTime,
        type: gigData.type || 'gig',
      };
        // Add only new images that are File objects
      const newImageFiles = [];
      const existingImageUrls = [];      // Process images based on our updated ProductController
      // Now the backend properly handles both existing_images and new images

      // First collect all File objects from gigData
      if (gigData.images && Array.isArray(gigData.images)) {
        gigData.images.forEach(img => {
          if (img instanceof File) {
            newImageFiles.push(img);
          }
        });
      }

      // Then collect all existing image URLs that aren't blob URLs
      imagePreviews.forEach(img => {
        if (typeof img === 'string' && !img.startsWith('blob:')) {
          // Extract just the path part if it's a full URL
          let path = img;
          
          // If URL contains the storage path, extract just the relative path
          if (img.includes('/storage/')) {
            path = img.substring(img.indexOf('/storage/') + 9);
          }
          
          existingImageUrls.push(path);
        }
      });
      
      // Add files to the form data, if any
      if (newImageFiles.length > 0) {
        updatedData.images = newImageFiles;
        console.log('New image files to upload:', newImageFiles.length);
      }
      
      // Always include existing images we want to keep
      if (existingImageUrls.length > 0) {
        updatedData.existing_images = existingImageUrls;
        console.log('Existing images to keep:', existingImageUrls);
      }
      
      // Make API call to update the gig
      console.log('Sending update for gig:', gigId, updatedData);
      await sellerApi.updateProduct(gigId, updatedData);
      
      toast({ 
        title: "تم تحديث الخدمة بنجاح!", 
        description: `تم حفظ التغييرات على خدمة "${gigData.title}".`
      });
      
      navigate('/dashboard/gigs');
    } catch (error) {
      console.error('Error updating gig:', error);
      toast({
        variant: "destructive",
        title: "خطأ في تحديث الخدمة",
        description: error.message || "فشل في تحديث الخدمة. يرجى المحاولة مرة أخرى."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  // Loading state
  if (loading) {
    return (
      <div className="p-6 md:p-8 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <p className="mt-4 text-lg">جاري تحميل الخدمة...</p>
      </div>
    );
  }
  
  // Not seller or gig not found
  if (!gigData) {
    return (
      <div className="p-6 md:p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-700">لا يمكن تحميل الخدمة</h1>
        <p className="text-gray-500">لم يتم العثور على الخدمة المطلوبة أو تم حذفها.</p>
        <Button onClick={() => navigate('/dashboard/gigs')} className="mt-4">العودة للوحة التحكم</Button>
      </div>
    );
  }
  
  // Not a seller
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
    <div className="p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800">تعديل الخدمة</h1>
        <Edit className="h-8 w-8 text-primary" />
      </motion.div>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-xl border-orange-200">
          <CardContent className="p-6 space-y-6">
            {/* Basic Info */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <CardHeader className="px-0 pt-0 pb-4">
                <CardTitle className="text-xl text-gray-700">المعلومات الأساسية</CardTitle>
              </CardHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="flex items-center"><ArrowRight className="ml-2 h-4 w-4 text-gray-500" />عنوان الخدمة</Label>
                  <Input id="title" name="title" value={gigData.title} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="description" className="flex items-center"><ArrowRight className="ml-2 h-4 w-4 text-gray-500" />وصف الخدمة</Label>
                  <Textarea id="description" name="description" value={gigData.description} onChange={handleChange} rows={5} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className="flex items-center"><Tag className="ml-2 h-4 w-4 text-gray-500" />التصنيف</Label>
                    <RTLSelect
                      onValueChange={handleCategoryChange}
                      value={gigData.category ? String(gigData.category) : ""}
                      required
                    >
                      <RTLSelectTrigger id="category">
                        <SelectValue placeholder="اختر تصنيف الخدمة" />
                      </RTLSelectTrigger>
                      <RTLSelectContent>
                        {categories.length > 0 ? (
                          categories.map(cat => (
                            <RTLSelectItem key={cat.id || cat._id} value={String(cat.id || cat._id)}>
                              {cat.name || cat.title || 'تصنيف غير محدد'}
                            </RTLSelectItem>
                          ))
                        ) : (
                          <RTLSelectItem value="no-categories" disabled>
                            لا توجد تصنيفات متاحة
                          </RTLSelectItem>
                        )}
                      </RTLSelectContent>
                    </RTLSelect>
                  </div>
                  <div>
                    <Label htmlFor="price" className="flex items-center"><DollarSign className="ml-2 h-4 w-4 text-gray-500" />السعر (بالجنيه)</Label>
                    <Input id="price" name="price" type="number" value={gigData.price} onChange={handleChange} required min="1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="tags" className="flex items-center"><Tag className="ml-2 h-4 w-4 text-gray-500" />الكلمات المفتاحية (مفصولة بفاصلة)</Label>
                  <Input id="tags" name="tags" value={gigData.tags} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="deliveryTime" className="flex items-center"><Clock className="ml-2 h-4 w-4 text-gray-500" />مدة التسليم المتوقعة</Label>
                  <Input id="deliveryTime" name="deliveryTime" value={gigData.deliveryTime} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="type" className="flex items-center"><ArrowRight className="ml-2 h-4 w-4 text-gray-500" />نوع الخدمة</Label>
                  <RTLSelect id="type" value={gigData.type} onValueChange={handleTypeChange}>
                    <RTLSelectTrigger>
                      <SelectValue placeholder="اختر نوع الخدمة" />
                    </RTLSelectTrigger>
                    <RTLSelectContent>
                      <RTLSelectItem value="gig">خدمة/حرفة</RTLSelectItem>
                      <RTLSelectItem value="product">منتج قابل للبيع</RTLSelectItem>
                    </RTLSelectContent>
                  </RTLSelect>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <CardHeader className="px-0 pt-6 pb-4">
                <CardTitle className="text-xl text-gray-700">صور الخدمة</CardTitle>
                <CardDescription>أضف أو عدّل صور خدمتك (حتى 5 صور).</CardDescription>
              </CardHeader>
              <div>
                <Label htmlFor="images" className="flex items-center cursor-pointer border-2 border-dashed border-gray-300 rounded-md p-6 justify-center hover:border-primary transition-colors">
                  <ImageIcon className="ml-2 h-8 w-8 text-gray-400" />
                  <span className="text-gray-500">انقر هنا لاختيار صور جديدة</span>
                </Label>
                <Input id="images" type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                {imagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img 
                          src={typeof preview === 'string' ? preview : "https://images.unsplash.com/photo-1690721606848-ac5bdcde45ea"} 
                          alt={`معاينة ${index + 1}`} 
                          className="w-full h-full object-cover rounded-md shadow" 
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
              <motion.div className="pt-6 flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <Button type="submit" size="lg" className="bg-green-500 hover:bg-green-600" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="ml-2 h-5 w-5 animate-spin" /> جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="ml-2 h-5 w-5" /> حفظ التعديلات
                  </>
                )}
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default EditGigPage;
