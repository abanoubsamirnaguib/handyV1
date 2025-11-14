import React, { useState, useEffect } from 'react';
import { adminApi } from '../../lib/api';
import { useToast } from '../ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { 
  Package, 
  User, 
  Phone, 
  MapPin, 
  Truck, 
  Calendar, 
  Filter,
  UserCheck,
  UserPlus,
  Clock,
  CheckCircle2,
  Loader2
} from 'lucide-react';

const AdminDeliveryAssignment = () => {
  const { toast } = useToast();
  
  const [orders, setOrders] = useState([]);
  const [ordersInProgress, setOrdersInProgress] = useState([]);
  const [deliveryPersonnel, setDeliveryPersonnel] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPickupDialog, setShowPickupDialog] = useState(false);
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [selectedPickupPerson, setSelectedPickupPerson] = useState('');
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  
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
      const [ordersResponse, ordersInProgressResponse, personnelResponse] = await Promise.all([
        adminApi.getOrdersReadyForDelivery(),
        adminApi.getOrdersInProgress(),
        adminApi.getAvailableDeliveryPersonnel()
      ]);
      
      // getOrdersReadyForDelivery uses paginate() so data is in response.data.data
      // apiFetch returns res.json() directly, so response structure is: { success: true, data: {...} }
      // For paginated responses: response.data.data contains the array
      setOrders(ordersResponse.data?.data || []);
      
      // getOrdersInProgress uses get() so data is directly in response.data (array)
      // apiFetch returns res.json() directly, so response structure is: { success: true, data: [...] }
      // So we access: response.data (which is the array)
      const inProgressData = ordersInProgressResponse.data || [];
      setOrdersInProgress(Array.isArray(inProgressData) ? inProgressData : []);
      
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
    setFilters({ search: '', date_from: '', date_to: '' });
    loadInitialData();
  };

  const handleAssignPickup = async () => {
    if (!selectedOrder || !selectedPickupPerson) return;

    try {
      setIsAssigning(true);
      const response = await adminApi.assignPickupPerson(selectedOrder.id, selectedPickupPerson);
      
      toast({
        title: "تم التعيين بنجاح",
        description: response.message
      });

      setShowPickupDialog(false);
      setSelectedPickupPerson('');
      setSelectedOrder(null);
      loadInitialData();
    } catch (error) {
      console.error('Error assigning pickup person:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.response?.data?.message || "حدث خطأ أثناء التعيين"
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleAssignDelivery = async () => {
    if (!selectedOrder || !selectedDeliveryPerson) return;

    // تحقق من حالة الطلب: إذا كان خدمة ويحتاج عربون ولم يتم دفع باقي المبلغ النهائي
    if (
      selectedOrder.is_service_order &&
      selectedOrder.requires_deposit &&
      selectedOrder.deposit_status === 'paid' &&
      !selectedOrder.remaining_payment_proof // لم يرفع صورة باقي المبلغ
    ) {
      toast({
        variant: "destructive",
        title: "لا يمكن تعيين موظف التسليم",
        description: "المبلغ النهائي للطلب لم يتم دفعه بعد من قبل العميل."
      });
      return;
    }

    try {
      setIsAssigning(true);
      const response = await adminApi.assignDeliveryPerson(selectedOrder.id, selectedDeliveryPerson);
      toast({
        title: "تم التعيين بنجاح",
        description: response.message
      });
      setShowDeliveryDialog(false);
      setSelectedDeliveryPerson('');
      setSelectedOrder(null);
      loadInitialData();
    } catch (error) {
      console.error('Error assigning delivery person:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.response?.data?.message || "حدث خطأ أثناء التعيين"
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'غير محدد';
    return new Date(date).toLocaleDateString('ar-SA');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">تعيين موظفي التوصيل</h1>
        <p className="text-gray-600">إدارة تعيين موظفي الاستلام والتسليم للطلبات الجاهزة</p>
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

      {/* Stats */}
      {(() => {
        // دمج جميع الطلبات (الجاهزة + قيد التنفيذ) مع تجنب التكرار
        const orderIds = new Set();
        const allOrders = [];
        
        // إضافة الطلبات الجاهزة
        orders.forEach(order => {
          if (!orderIds.has(order.id)) {
            orderIds.add(order.id);
            allOrders.push(order);
          }
        });
        
        // إضافة الطلبات قيد التنفيذ (تجنب التكرار)
        ordersInProgress.forEach(order => {
          if (!orderIds.has(order.id)) {
            orderIds.add(order.id);
            allOrders.push(order);
          }
        });
        
        // حساب الإحصائيات
        const totalOrders = allOrders.length;
        const assignedForPickup = allOrders.filter(order => order.pickup_person_id).length;
        const assignedForDelivery = allOrders.filter(order => order.delivery_person_id).length;
        const inProgressCount = ordersInProgress.length;
        
        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">إجمالي الطلبات</p>
                    <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <UserCheck className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">معين للاستلام من البائع</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {assignedForPickup}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Truck className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">معين للتسليم للمشتري</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {assignedForDelivery}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Loader2 className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">قيد التنفيذ</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {inProgressCount}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })()}

      {/* Orders In Progress */}
      {ordersInProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 text-orange-600" />
              الطلبات قيد التنفيذ ({ordersInProgress.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ordersInProgress.map((order) => {
                const isPickupPending = order.pickup_person_id && !order.delivery_picked_up_at;
                const isDeliveryPending = order.delivery_person_id && order.delivery_picked_up_at && !order.delivered_at;
                
                return (
                  <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 bg-orange-50">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-4">
                          <h3 className="font-semibold">طلب #{order.id}</h3>
                          <Badge variant="outline" className={isPickupPending ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                            {isPickupPending ? 'في انتظار الاستلام من البائع' : 'في انتظار التسليم للمشتري'}
                          </Badge>
                          {order.work_completed_at && (
                            <Badge variant="outline">
                              {formatDate(order.work_completed_at)}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>العميل: {order.user?.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{order.customer_phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>البائع: {order.seller?.user?.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{order.delivery_address}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 pt-2 border-t">
                          {isPickupPending && order.pickup_person && (
                            <div className="flex flex-col items-start gap-1">
                              <div className="flex items-center gap-2">
                                <UserCheck className="h-5 w-5 text-green-600" />
                                <span className="text-sm font-medium text-gray-700">موظف الاستلام من البائع:</span>
                              </div>
                              <span className="text-sm text-green-800 font-semibold mr-7">
                                {order.pickup_person?.name || 'غير محدد'}
                              </span>
                              {order.pickup_person?.phone && (
                                <span className="text-xs text-gray-500 mr-7">
                                  {order.pickup_person.phone}
                                </span>
                              )}
                            </div>
                          )}
                          
                          {isDeliveryPending && order.delivery_person && (
                            <div className="flex flex-col items-start gap-1">
                              <div className="flex items-center gap-2">
                                <Truck className="h-5 w-5 text-blue-600" />
                                <span className="text-sm font-medium text-gray-700">موظف التسليم للمشتري:</span>
                              </div>
                              <span className="text-sm text-blue-800 font-semibold mr-7">
                                {order.delivery_person?.name || 'غير محدد'}
                              </span>
                              {order.delivery_person?.phone && (
                                <span className="text-xs text-gray-500 mr-7">
                                  {order.delivery_person.phone}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>الطلبات الجاهزة للتوصيل ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد طلبات جاهزة للتوصيل</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <h3 className="font-semibold">طلب #{order.id}</h3>
                        <Badge variant="outline">
                          {formatDate(order.work_completed_at)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>العميل: {order.user?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{order.customer_phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>البائع: {order.seller?.user?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{order.delivery_address}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center gap-1">
                          {order.pickup_person_id ? (
                            <>
                              <UserCheck className="h-5 w-5 text-green-600" />
                              <span className="text-xs text-green-800 font-medium">
                                {order.pickup_person?.name || 'موظف الاستلام'}
                              </span>
                            </>
                          ) : (
                            <>
                              <Clock className="h-5 w-5 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                بحاجة لموظف استلام
                              </span>
                            </>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-center gap-1">
                          {order.delivery_person_id ? (
                            <>
                              <Truck className="h-5 w-5 text-blue-600" />
                              <span className="text-xs text-blue-800 font-medium">
                                {order.delivery_person?.name || 'موظف التسليم'}
                              </span>
                            </>
                          ) : (
                            <>
                              <Clock className="h-5 w-5 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                بحاجة لموظف تسليم
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Dialog open={showPickupDialog && selectedOrder?.id === order.id} 
                              onOpenChange={(open) => {
                                setShowPickupDialog(open);
                                if (!open) setSelectedOrder(null);
                              }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!!order.pickup_person_id}
                            onClick={() => setSelectedOrder(order)}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            تعيين موظف استلام
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>تعيين موظف الاستلام</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>الطلب #{order.id}</Label>
                              <p className="text-sm text-gray-600">العميل: {order.user?.name}</p>
                            </div>
                            <div>
                              <Label>اختر موظف الاستلام</Label>
                              <Select value={selectedPickupPerson} onValueChange={setSelectedPickupPerson}>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر موظف الاستلام" />
                                </SelectTrigger>
                                <SelectContent>
                                  {deliveryPersonnel.map((person) => (
                                    <SelectItem key={person.id} value={person.id.toString()}>
                                      {person.name} - {person.phone}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={handleAssignPickup}
                              disabled={!selectedPickupPerson || isAssigning}
                            >
                              {isAssigning ? 'جاري التعيين...' : 'تأكيد التعيين'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={showDeliveryDialog && selectedOrder?.id === order.id} 
                              onOpenChange={(open) => {
                                setShowDeliveryDialog(open);
                                if (!open) setSelectedOrder(null);
                              }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!!order.delivery_person_id}
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Truck className="h-4 w-4 mr-1" />
                            تعيين موظف تسليم
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>تعيين موظف التسليم</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>الطلب #{order.id}</Label>
                              <p className="text-sm text-gray-600">العميل: {order.user?.name}</p>
                            </div>
                            <div>
                              <Label>اختر موظف التسليم</Label>
                              <Select value={selectedDeliveryPerson} onValueChange={setSelectedDeliveryPerson}>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر موظف التسليم" />
                                </SelectTrigger>
                                <SelectContent>
                                  {deliveryPersonnel.map((person) => (
                                    <SelectItem key={person.id} value={person.id.toString()}>
                                      {person.name} - {person.phone}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={handleAssignDelivery}
                              disabled={!selectedDeliveryPerson || isAssigning}
                            >
                              {isAssigning ? 'جاري التعيين...' : 'تأكيد التعيين'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDeliveryAssignment; 