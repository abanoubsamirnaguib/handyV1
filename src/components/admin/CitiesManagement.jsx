import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, MapPin, DollarSign, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { adminApi } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const CitiesManagement = () => {
  const { toast } = useToast();
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    delivery_fee: '',
    platform_commission_percent: ''
  });

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getCities();
      const citiesData = response.data || response || [];
      setCities(Array.isArray(citiesData) ? citiesData : []);
    } catch (error) {
      console.error('Error loading cities:', error);
      toast({
        variant: "destructive",
        title: "خطأ في تحميل المدن",
        description: "حدث خطأ أثناء تحميل قائمة المدن."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      delivery_fee: '',
      platform_commission_percent: ''
    });
    setEditingCity(null);
  };

  const handleAddCity = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditCity = (city) => {
    setFormData({
      name: city.name,
      delivery_fee: city.delivery_fee,
      platform_commission_percent: city.platform_commission_percent
    });
    setEditingCity(city);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ في البيانات",
        description: "اسم المدينة مطلوب"
      });
      return;
    }

    if (!formData.delivery_fee || parseFloat(formData.delivery_fee) < 0) {
      toast({
        variant: "destructive",
        title: "خطأ في البيانات",
        description: "رسوم التوصيل يجب أن تكون رقم موجب"
      });
      return;
    }

    if (!formData.platform_commission_percent || parseFloat(formData.platform_commission_percent) < 0 || parseFloat(formData.platform_commission_percent) > 100) {
      toast({
        variant: "destructive",
        title: "خطأ في البيانات",
        description: "نسبة العمولة يجب أن تكون بين 0 و 100"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const cityData = {
        name: formData.name.trim(),
        delivery_fee: parseFloat(formData.delivery_fee),
        platform_commission_percent: parseFloat(formData.platform_commission_percent)
      };

      if (editingCity) {
        await adminApi.updateCity(editingCity.id, cityData);
        toast({
          title: "تم تحديث المدينة",
          description: "تم تحديث بيانات المدينة بنجاح"
        });
      } else {
        await adminApi.createCity(cityData);
        toast({
          title: "تم إضافة المدينة",
          description: "تم إضافة المدينة الجديدة بنجاح"
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadCities();
    } catch (error) {
      console.error('Error saving city:', error);
      toast({
        variant: "destructive",
        title: "خطأ في حفظ البيانات",
        description: "حدث خطأ أثناء حفظ بيانات المدينة"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCity = async (cityId) => {
    try {
      await adminApi.deleteCity(cityId);
      toast({
        title: "تم حذف المدينة",
        description: "تم حذف المدينة بنجاح"
      });
      loadCities();
    } catch (error) {
      console.error('Error deleting city:', error);
      toast({
        variant: "destructive",
        title: "خطأ في حذف المدينة",
        description: "حدث خطأ أثناء حذف المدينة"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-roman-500"></div>
        <span className="mr-2 text-gray-600">جاري تحميل المدن...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إدارة المدن</h2>
          <p className="text-gray-600 mt-1">إدارة المدن ورسوم التوصيل ونسب العمولة</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddCity} className="bg-roman-500 hover:bg-roman-600">
              <Plus className="h-4 w-4 ml-2" />
              إضافة مدينة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCity ? 'تعديل المدينة' : 'إضافة مدينة جديدة'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">اسم المدينة</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="أدخل اسم المدينة"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="delivery_fee">رسوم التوصيل (جنيه)</Label>
                <Input
                  id="delivery_fee"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.delivery_fee}
                  onChange={(e) => handleInputChange('delivery_fee', e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="platform_commission_percent">نسبة عمولة المنصة (%)</Label>
                <Input
                  id="platform_commission_percent"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.platform_commission_percent}
                  onChange={(e) => handleInputChange('platform_commission_percent', e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-roman-500 hover:bg-roman-600"
                >
                  {isSubmitting ? 'جاري الحفظ...' : (editingCity ? 'تحديث' : 'إضافة')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cities List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cities.map((city, index) => (
          <motion.div
            key={city.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-roman-500 ml-2" />
                    {city.name}
                  </div>
                  <div className="flex space-x-1 space-x-reverse">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditCity(city)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من رغبتك في حذف مدينة "{city.name}"؟ 
                            هذا الإجراء لا يمكن التراجع عنه.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteCity(city.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-green-600 ml-1" />
                    <span className="text-sm text-gray-600">رسوم التوصيل:</span>
                  </div>
                  <span className="font-semibold text-green-700">
                    {Number(city.delivery_fee || 0)} جنيه
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Percent className="h-4 w-4 text-orange-600 ml-1" />
                    <span className="text-sm text-gray-600">عمولة المنصة:</span>
                  </div>
                  <span className="font-semibold text-orange-700">
                    {Number(city.platform_commission_percent || 0)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {cities.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد مدن</h3>
            <p className="text-gray-600 mb-4">لم يتم إضافة أي مدن بعد</p>
            <Button onClick={handleAddCity} className="bg-roman-500 hover:bg-roman-600">
              <Plus className="h-4 w-4 ml-2" />
              إضافة أول مدينة
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CitiesManagement;
