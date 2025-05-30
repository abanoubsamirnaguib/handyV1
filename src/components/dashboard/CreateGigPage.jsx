
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, Image as ImageIcon, DollarSign, Tag, Clock, Save, ArrowRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { categories } from '@/lib/data'; 
import { useAuth } from '@/contexts/AuthContext';

const CreateGigPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [gigData, setGigData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    tags: '', 
    deliveryTime: '',
    images: [], 
  });
  const [imagePreviews, setImagePreviews] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGigData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value) => {
    setGigData(prev => ({ ...prev, category: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setGigData(prev => ({ ...prev, images: [...prev.images, ...files].slice(0, 5) })); 

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews].slice(0, 5));
  };

  const removeImage = (index) => {
    setGigData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user || user.active_role !== 'seller') {
        toast({ variant: "destructive", title: "غير مصرح به", description: "يجب أن تكون في وضع البائع لإنشاء خدمة." });
        return;
    }
    
    if (!gigData.title || !gigData.description || !gigData.price || !gigData.category) {
        toast({ variant: "destructive", title: "حقول ناقصة", description: "يرجى ملء جميع الحقول الإلزامية." });
        return;
    }
    
    
    const newGig = {
      id: `g${Date.now()}`, 
      sellerId: user.id,
      ...gigData,
      price: parseFloat(gigData.price),
      tags: gigData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      images: imagePreviews, 
      rating: 0, 
      reviewCount: 0, 
      featured: false,
    };
    console.log("Creating new gig:", newGig);
    

    toast({ title: "تم إنشاء الخدمة بنجاح!", description: `خدمة "${gigData.title}" أصبحت جاهزة.` });
    navigate('/dashboard/gigs'); 
  };
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
        <h1 className="text-3xl font-bold text-gray-800">إنشاء خدمة جديدة</h1>
        <PlusCircle className="h-8 w-8 text-primary" />
      </motion.div>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-xl border-orange-200">
          <CardContent className="p-6 space-y-6">
            
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <CardHeader className="px-0 pt-0 pb-4">
                <CardTitle className="text-xl text-gray-700">المعلومات الأساسية</CardTitle>
                <CardDescription>صف خدمتك بوضوح لجذب العملاء.</CardDescription>
              </CardHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="flex items-center"><ArrowRight className="ml-2 h-4 w-4 text-gray-500" />عنوان الخدمة</Label>
                  <Input id="title" name="title" value={gigData.title} onChange={handleChange} placeholder="مثال: تصميم شعار احترافي لشركتك" required />
                </div>
                <div>
                  <Label htmlFor="description" className="flex items-center"><ArrowRight className="ml-2 h-4 w-4 text-gray-500" />وصف الخدمة</Label>
                  <Textarea id="description" name="description" value={gigData.description} onChange={handleChange} rows={5} placeholder="اشرح بالتفصيل ما تقدمه في هذه الخدمة..." required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className="flex items-center"><Tag className="ml-2 h-4 w-4 text-gray-500" />التصنيف</Label>
                    <Select onValueChange={handleCategoryChange} value={gigData.category} required>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="اختر تصنيف الخدمة" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="price" className="flex items-center"><DollarSign className="ml-2 h-4 w-4 text-gray-500" />السعر (بالجنيه)</Label>
                    <Input id="price" name="price" type="number" value={gigData.price} onChange={handleChange} placeholder="مثال: 150" required min="1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="tags" className="flex items-center"><Tag className="ml-2 h-4 w-4 text-gray-500" />الكلمات المفتاحية (مفصولة بفاصلة)</Label>
                  <Input id="tags" name="tags" value={gigData.tags} onChange={handleChange} placeholder="مثال: تصميم, شعار, هوية بصرية" />
                </div>
                <div>
                  <Label htmlFor="deliveryTime" className="flex items-center"><Clock className="ml-2 h-4 w-4 text-gray-500" />مدة التسليم المتوقعة</Label>
                  <Input id="deliveryTime" name="deliveryTime" value={gigData.deliveryTime} onChange={handleChange} placeholder="مثال: 3-5 أيام عمل" />
                </div>
              </div>
            </motion.div>

            
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <CardHeader className="px-0 pt-6 pb-4">
                <CardTitle className="text-xl text-gray-700">صور الخدمة</CardTitle>
                <CardDescription>أضف صورًا عالية الجودة تعرض خدمتك (حتى 5 صور).</CardDescription>
              </CardHeader>
              <div>
                <Label htmlFor="images" className="flex items-center cursor-pointer border-2 border-dashed border-gray-300 rounded-md p-6 justify-center hover:border-primary transition-colors">
                  <ImageIcon className="ml-2 h-8 w-8 text-gray-400" />
                  <span className="text-gray-500">انقر هنا لاختيار الصور</span>
                </Label>
                <Input id="images" type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                {imagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img 
                          src={preview || "https://images.unsplash.com/photo-1690721606848-ac5bdcde45ea"} 
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
              <Button type="submit" size="lg" className="bg-green-500 hover:bg-green-600">
                <Save className="ml-2 h-5 w-5" /> نشر الخدمة
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default CreateGigPage;
