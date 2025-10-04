import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Calendar, MapPin, User, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { adminApi } from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PlatformProfits = () => {
  const { toast } = useToast();
  const [profits, setProfits] = useState([]);
  const [totalProfits, setTotalProfits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [filters, setFilters] = useState({
    seller_id: '',
    city_id: '',
    date_from: '',
    date_to: '',
    per_page: 20
  });

  const [cities, setCities] = useState([]);
  const [sellers, setSellers] = useState([]);

  useEffect(() => {
    loadPlatformProfits();
    loadCities();
  }, [currentPage, filters]);

  const loadPlatformProfits = async () => {
    try {
      setIsLoading(true);
      const params = {
        ...filters,
        page: currentPage
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await adminApi.getPlatformProfits(params);
      const data = response.data || response;
      
      setProfits(data.data || []);
      setTotalProfits(response.total || 0);
      setCurrentPage(data.current_page || 1);
      setTotalPages(data.last_page || 1);
    } catch (error) {
      console.error('Error loading platform profits:', error);
      toast({
        variant: "destructive",
        title: "خطأ في تحميل أرباح المنصة",
        description: "حدث خطأ أثناء تحميل بيانات أرباح المنصة."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCities = async () => {
    try {
      const response = await adminApi.getCities();
      const citiesData = response.data || response || [];
      setCities(Array.isArray(citiesData) ? citiesData : []);
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const resetFilters = () => {
    setFilters({
      seller_id: '',
      city_id: '',
      date_from: '',
      date_to: '',
      per_page: 20
    });
    setCurrentPage(1);
  };

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString('ar-EG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading && profits.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-roman-500"></div>
        <span className="mr-2 text-gray-600">جاري تحميل أرباح المنصة...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">أرباح المنصة</h2>
        <p className="text-gray-600 mt-1">عرض وإدارة أرباح المنصة من العمولات</p>
      </div>

      {/* Total Profits Card */}
      <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 ml-2" />
                <div>
                  <h3 className="text-lg font-semibold">إجمالي الأرباح</h3>
                  <p className="text-green-100">من جميع العمولات</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {formatCurrency(totalProfits)} جنيه
              </div>
              <p className="text-green-100">إجمالي تراكمي</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>فلترة النتائج</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>المدينة</Label>
              <Select
                value={filters.city_id}
                onValueChange={(value) => handleFilterChange('city_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المدينة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع المدن</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={String(city.id)}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>من تاريخ</Label>
              <Input
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
              />
            </div>

            <div>
              <Label>إلى تاريخ</Label>
              <Input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
              />
            </div>

            <div>
              <Label>عدد النتائج</Label>
              <Select
                value={String(filters.per_page)}
                onValueChange={(value) => handleFilterChange('per_page', Number(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end mt-4 space-x-2 space-x-reverse">
            <Button variant="outline" onClick={resetFilters}>
              إعادة تعيين
            </Button>
            <Button onClick={loadPlatformProfits} disabled={isLoading}>
              {isLoading ? 'جاري البحث...' : 'بحث'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profits List */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل الأرباح</CardTitle>
        </CardHeader>
        <CardContent>
          {profits.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد أرباح</h3>
              <p className="text-gray-600">لم يتم تسجيل أي أرباح بعد</p>
            </div>
          ) : (
            <div className="space-y-4">
              {profits.map((profit, index) => (
                <motion.div
                  key={profit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-center">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 text-roman-500 ml-2" />
                      <div>
                        <p className="font-semibold">طلب رقم</p>
                        <p className="text-sm text-gray-600">#{profit.order_id}</p>
                      </div>
                    </div>

                    {profit.city && (
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-blue-500 ml-2" />
                        <div>
                          <p className="font-semibold">المدينة</p>
                          <p className="text-sm text-gray-600">{profit.city.name}</p>
                        </div>
                      </div>
                    )}

                    {profit.seller && (
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-green-500 ml-2" />
                        <div>
                          <p className="font-semibold">البائع</p>
                          <p className="text-sm text-gray-600">
                            {profit.seller.business_name || `بائع #${profit.seller.id}`}
                          </p>
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="font-semibold">نسبة العمولة</p>
                      <p className="text-sm text-orange-600 font-medium">
                        {Number(profit.commission_percent || 0)}%
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold">مبلغ العمولة</p>
                      <p className="text-sm text-green-600 font-bold">
                        {formatCurrency(profit.amount)} جنيه
                      </p>
                    </div>

                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-500 ml-1" />
                      <div>
                        <p className="font-semibold">تاريخ الحساب</p>
                        <p className="text-xs text-gray-600">
                          {formatDate(profit.calculated_on)}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-gray-600">
                الصفحة {currentPage} من {totalPages}
              </div>
              <div className="flex space-x-2 space-x-reverse">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                >
                  السابق
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                >
                  التالي
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformProfits;
