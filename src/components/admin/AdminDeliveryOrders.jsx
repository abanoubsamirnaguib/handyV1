import React, { useState, useEffect } from 'react';
import { adminApi } from '../../lib/api';
import { useToast } from '../ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Checkbox } from '../ui/checkbox';
import { 
  Package, 
  User, 
  Phone, 
  MapPin, 
  Truck, 
  Calendar, 
  Filter,
  Users,
  CheckCircle2,
  Clock
} from 'lucide-react';

const AdminDeliveryOrders = () => {
  const { toast } = useToast();
  
  const [orders, setOrders] = useState([]);
  const [deliveryPersonnel, setDeliveryPersonnel] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    date_from: '',
    date_to: '',
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [ordersResponse, personnelResponse] = await Promise.all([
        adminApi.getOrdersReadyForDelivery(),
        adminApi.getAvailableDeliveryPersonnel()
      ]);
      
      setOrders(ordersResponse.data?.data || []);
      setDeliveryPersonnel(personnelResponse.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل البيانات"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getOrdersReadyForDelivery(filters);
      setOrders(response.data?.data || []);
    } catch (error) {
      console.error('Error searching orders:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء البحث"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    const resetFilters = { search: '', date_from: '', date_to: '' };
    setFilters(resetFilters);
    loadInitialData();
  };

  const handleOrderSelect = (orderId, isSelected) => {
    if (isSelected) {
      setSelectedOrders(prev => [...prev, orderId]);
    } else {
      setSelectedOrders(prev => prev.filter(id => id !== orderId));
    }
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedOrders(orders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleBulkAssign = async () => {
    if (selectedOrders.length === 0) {
      toast({
        variant: "destructive",
        title: "تحديد مطلوب",
        description: "يرجى تحديد طلب واحد على الأقل"
      });
      return;
    }

    if (!selectedDeliveryPerson) {
      toast({
        variant: "destructive",
        title: "اختيار مطلوب",
        description: "يرجى اختيار موظف التوصيل"
      });
      return;
    }

    try {
      setIsAssigning(true);
      const response = await adminApi.bulkAssignOrders(selectedOrders, selectedDeliveryPerson);
      
      toast({
        title: "تم التعيين بنجاح",
        description: response.message
      });

      // Reset selections and reload data
      setSelectedOrders([]);
      setSelectedDeliveryPerson('');
      setShowAssignDialog(false);
      loadInitialData();
    } catch (error) {
      console.error('Error assigning orders:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.response?.data?.message || "حدث خطأ أثناء تعيين الطلبات"
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    return new Date(dateString).toLocaleDateString('ar-EG');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">إدارة توزيع الطلبات</h1>
        <div className="flex gap-2">
          <Badge variant="outline" className="px-3 py-1">
            <Package className="h-4 w-4 ml-1" />
            {orders.length} طلب جاهز للتوصيل
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            <Users className="h-4 w-4 ml-1" />
            {selectedOrders.length} طلب محدد
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            فلترة وبحث
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">البحث</Label>
              <Input
                id="search"
                name="search"
                placeholder="رقم الطلب، اسم العميل، أو رقم الهاتف"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>
            <div>
              <Label htmlFor="date_from">من تاريخ</Label>
              <Input
                id="date_from"
                name="date_from"
                type="date"
                value={filters.date_from}
                onChange={handleFilterChange}
              />
            </div>
            <div>
              <Label htmlFor="date_to">إلى تاريخ</Label>
              <Input
                id="date_to"
                name="date_to"
                type="date"
                value={filters.date_to}
                onChange={handleFilterChange}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleSearch} className="flex-1">
                بحث
              </Button>
              <Button variant="outline" onClick={handleReset}>
                إعادة تعيين
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Checkbox
                id="select-all"
                checked={selectedOrders.length === orders.length && orders.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all" className="font-medium">
                تحديد الكل ({orders.length} طلب)
              </Label>
            </div>
            <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
              <DialogTrigger asChild>
                <Button
                  disabled={selectedOrders.length === 0}
                  className="flex items-center gap-2"
                >
                  <Truck className="h-4 w-4" />
                  تعيين للدليفري ({selectedOrders.length})
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>تعيين الطلبات لموظف التوصيل</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>عدد الطلبات المحددة: {selectedOrders.length}</Label>
                  </div>
                  <div>
                    <Label>اختر موظف التوصيل</Label>
                    <Select value={selectedDeliveryPerson} onValueChange={setSelectedDeliveryPerson}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر موظف التوصيل" />
                      </SelectTrigger>
                      <SelectContent>
                        {deliveryPersonnel.map(person => (
                          <SelectItem key={person.id} value={person.id.toString()}>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {person.name}
                              <Badge variant="outline">{person.phone}</Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleBulkAssign} 
                      disabled={isAssigning || !selectedDeliveryPerson}
                      className="flex-1"
                    >
                      {isAssigning ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                          جاري التعيين...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 ml-2" />
                          تأكيد التعيين
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAssignDialog(false)}
                      disabled={isAssigning}
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                لا توجد طلبات جاهزة للتوصيل
              </h3>
              <p className="text-gray-600">
                جميع الطلبات المتاحة تم تعيينها بالفعل أو لا توجد طلبات مكتملة من البائعين
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map(order => (
            <Card key={order.id} className={`transition-all ${
              selectedOrders.includes(order.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selectedOrders.includes(order.id)}
                    onCheckedChange={(checked) => handleOrderSelect(order.id, checked)}
                  />
                  <div className="flex-1 space-y-4">
                    {/* Order Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">الطلب #{order.id}</h3>
                        <p className="text-gray-600">{formatCurrency(order.total_price)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 ml-1" />
                          {formatDate(order.work_completed_at)}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800">
                          جاهز للتوصيل
                        </Badge>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">معلومات العميل</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="h-4 w-4" />
                          {order.user?.name || order.customer_name}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          {order.user?.phone || order.customer_phone}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          {order.delivery_address}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">معلومات البائع</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="h-4 w-4" />
                          {order.seller?.user?.name}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          {order.seller?.user?.phone}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          {order.seller_address || 'غير محدد'}
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">محتويات الطلب</h4>
                      <div className="space-y-1">
                        {order.items?.map(item => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.product?.title} x {item.quantity}</span>
                            <span>{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDeliveryOrders; 