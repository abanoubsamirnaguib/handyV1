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
import { useCategories } from '@/hooks/useCache';

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
  const [showProgress, setShowProgress] = useState(false);

  // Use cached categories from React Query
  const { data: categoriesData } = useCategories();
  
  useEffect(() => {
    if (categoriesData) {
      // Handle different response structures
      let rawCategories = [];
      
      if (Array.isArray(categoriesData)) {
        rawCategories = categoriesData;
      } else if (categoriesData.data && Array.isArray(categoriesData.data)) {
        rawCategories = categoriesData.data;
      }
      
      setCategories(rawCategories);
    }
  }, [categoriesData]);

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
            quantity: gigDetails.quantity !== null && gigDetails.quantity !== undefined ? gigDetails.quantity.toString() : '',
          });
          
          setImagePreviews(imageUrls);
        } else {
          toast({ 
            variant: "destructive",
            title: "خطأ في تحميل البيانات",
            description: "لم يتم العثور على الحرفة المطلوبة."
          });
          navigate('/dashboard/gigs');
        }
      } catch (error) {
        console.error('Error fetching gig details:', error);
        toast({
          variant: "destructive", 
          title: "خطأ في تحميل البيانات",
          description: error.message || "فشل في تحميل تفاصيل الحرفة."
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
    
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    // Validate each file
    const validFiles = [];
    const errors = [];
    
    files.forEach((file) => {
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        errors.push(`الملف "${file.name}" ليس صورة صالحة. الأنواع المسموحة: JPG, PNG, GIF, WebP`);
        return;
      }
      
      // Check file size
      if (file.size > maxSize) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        errors.push(`الملف "${file.name}" كبير جداً (${fileSizeMB} ميجا). الحد الأقصى 5 ميجا`);
        return;
      }
      
      validFiles.push(file);
    });
    
    // Show errors if any
    if (errors.length > 0) {
      toast({
        variant: "destructive",
        title: "خطأ في رفع الصور",
        description: errors.join('\n'),
        duration: 5000
      });
    }
    
    // Check total number of images (existing + new)
    const totalImages = imagePreviews.length + validFiles.length;
    if (totalImages > 5) {
      toast({
        variant: "destructive",
        title: "الحد الأقصى للصور",
        description: `يمكنك إضافة 5 صور كحد أقصى. لديك ${imagePreviews.length} صورة، حاولت إضافة ${validFiles.length}`,
        duration: 4000
      });
      
      // Take only the allowed number of new files
      const allowedNewFiles = validFiles.slice(0, 5 - imagePreviews.length);
      if (allowedNewFiles.length > 0) {
        processValidFiles(allowedNewFiles);
      }
      return;
    }
    
    // Process valid files
    if (validFiles.length > 0) {
      processValidFiles(validFiles);
      
      // Show success message
      toast({
        title: "تم رفع الصور بنجاح",
        description: `تم إضافة ${validFiles.length} صورة`,
        duration: 2000
      });
    }
    
    // Reset the input value to allow re-uploading the same file if needed
    e.target.value = '';
  };
  
  // Helper function to process valid files
  const processValidFiles = (validFiles) => {
    // Store actual File objects in the gigData state
    setGigData(prev => {
      const currentImages = Array.isArray(prev.images) ? [...prev.images] : [];
      return { 
        ...prev, 
        images: [...currentImages, ...validFiles].slice(0, 5),
        hasNewImages: true
      };
    });

    // Create object URLs for new files to show as previews
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    
    // Add new previews
    setImagePreviews(prev => [...prev, ...newPreviewUrls].slice(0, 5));
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
      toast({ variant: "destructive", title: "حقل العنوان مطلوب", description: "يرجى إدخال عنوان للحرفة." });
      return;
    }
    
    if (!gigData.description || !gigData.description.trim()) {
      toast({ variant: "destructive", title: "حقل الوصف مطلوب", description: "يرجى إدخال وصف للحرفة." });
      return;
    }
    
    if (!gigData.price || (parseFloat(gigData.price) < 0)) {
      toast({ variant: "destructive", title: "السعر غير صحيح", description: "يرجى إدخال سعر صحيح للحرفة." });
      return;
    }
    
    // Validate price based on product type
    const priceValue = parseFloat(gigData.price);
    if (gigData.type === 'product' && (isNaN(priceValue) || priceValue < 1)) {
      toast({ variant: "destructive", title: "السعر غير صحيح", description: "السعر الأدنى للمنتجات هو 1 جنيه." });
      return;
    }
    
    if (!gigData.category) {
      toast({ variant: "destructive", title: "التصنيف مطلوب", description: "يرجى اختيار تصنيف للحرفة." });
      return;
    }
    
    // Validate quantity for products
    if (gigData.type === 'product' && (gigData.quantity === '' || gigData.quantity === null || gigData.quantity === undefined)) {
      toast({ variant: "destructive", title: "حقل الكمية مطلوب", description: "يرجى إدخال الكمية المتاحة للمنتج." });
      return;
    }
    
    // Check if we have at least one image
    if (imagePreviews.length === 0) {
      toast({ 
        variant: "destructive", 
        title: "الصور مطلوبة", 
        description: "يرجى إضافة صورة واحدة على الأقل للحرفة."
      });
      return;
    }
    
    setIsSubmitting(true);
    setShowProgress(true);
    
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
        quantity: gigData.type === 'product' ? (gigData.quantity !== '' ? parseInt(gigData.quantity) : 0) : null,
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
      const response = await sellerApi.updateProduct(gigId, updatedData);
      
      toast({ 
        title: "تم تحديث الحرفة بنجاح!", 
        description: response?.notification || `تم حفظ التغييرات على حرفة "${gigData.title}". المنتج الآن قيد المراجعة.",`,
        duration: 5000
      });
      
 
      navigate('/dashboard/gigs');
    } catch (error) {
      console.error('Error updating gig:', error);
      toast({
        variant: "destructive",
        title: "خطأ في تحديث الحرفة",
        description: error.message || "فشل في تحديث الحرفة. يرجى المحاولة مرة أخرى."
      });
    } finally {
      setIsSubmitting(false);
      setShowProgress(false);
    }
  };
  // Loading state
  if (loading) {
    return (
      <div className="p-6 md:p-8 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <p className="mt-4 text-lg">جاري تحميل الحرفة...</p>
      </div>
    );
  }
  
  // Not seller or gig not found
  if (!gigData) {
    return (
      <div className="p-6 md:p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-700">لا يمكن تحميل الحرفة</h1>
        <p className="text-gray-500">لم يتم العثور على الحرفة المطلوبة أو تم حذفها.</p>
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
        <h1 className="text-3xl font-bold text-gray-800">تعديل الحرفة</h1>
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
                  <Label htmlFor="title" className="flex items-center"><ArrowRight className="ml-2 h-4 w-4 text-gray-500" />عنوان الحرفة</Label>
                  <Input id="title" name="title" value={gigData.title} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="description" className="flex items-center"><ArrowRight className="ml-2 h-4 w-4 text-gray-500" />وصف الحرفة</Label>
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
                        <SelectValue placeholder="اختر تصنيف الحرفة" />
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
                    <Input 
                      id="price" 
                      name="price" 
                      type="number" 
                      value={gigData.price} 
                      onChange={handleChange} 
                      required 
                      min={gigData.type === 'product' ? '1' : '0'} 
                    />
                    {gigData.type === 'gig' && (gigData.price === '0.00' || parseFloat(gigData.price) === 0) && (
                      <p className="text-sm text-blue-600 mt-1 flex items-center">
                        <svg className="h-4 w-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        السعر سيتم تحديده مع عرض المشتري (قابل للتفاوض)
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Quantity field for products only */}
                {gigData.type === 'product' && (
                  <div>
                    <Label htmlFor="quantity" className="flex items-center">
                      <Tag className="ml-2 h-4 w-4 text-gray-500" />
                      الكمية المتاحة
                    </Label>
                    <Input 
                      id="quantity" 
                      name="quantity" 
                      type="number" 
                      value={gigData.quantity} 
                      onChange={handleChange} 
                      placeholder="مثال: 10" 
                      min="0"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      عند وصول الكمية لصفر، سيتم تعطيل المنتج تلقائياً
                    </p>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="tags" className="flex items-center"><Tag className="ml-2 h-4 w-4 text-gray-500" />الكلمات المفتاحية (مفصولة بفاصلة)</Label>
                  <Input id="tags" name="tags" value={gigData.tags} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="deliveryTime" className="flex items-center"><Clock className="ml-2 h-4 w-4 text-gray-500" />مدة التسليم المتوقعة</Label>
                  <Input id="deliveryTime" name="deliveryTime" value={gigData.deliveryTime} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="type" className="flex items-center"><ArrowRight className="ml-2 h-4 w-4 text-gray-500" />نوع المنتج</Label>
                  <RTLSelect id="type" value={gigData.type} onValueChange={handleTypeChange}>
                    <RTLSelectTrigger>
                      <SelectValue placeholder="اختر نوع المنتج" />
                    </RTLSelectTrigger>
                    <RTLSelectContent>
                      <RTLSelectItem value="gig">حرفة</RTLSelectItem>
                      <RTLSelectItem value="product">منتج قابل للبيع</RTLSelectItem>
                    </RTLSelectContent>
                  </RTLSelect>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <CardHeader className="px-0 pt-6 pb-4">
                <CardTitle className="text-xl text-gray-700">صور الحرفة</CardTitle>
                <CardDescription>أضف أو عدّل صور حرفتك (حتى 5 صور).</CardDescription>
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

      {/* Progress Bar Overlay */}
      {showProgress && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 shadow-2xl max-w-md w-full mx-4"
          >
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">جاري تحديث الحرفة...</h3>
              <p className="text-gray-600 mb-4">يرجى الانتظار، جاري حفظ التعديلات والصور</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  className="bg-green-500 h-2.5 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default EditGigPage;
