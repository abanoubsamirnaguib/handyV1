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
  CheckCircle2
} from 'lucide-react';

const AdminDeliveryAssignment = () => {
  const { toast } = useToast();
  
  const [orders, setOrders] = useState([]);
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">معين للاستلام</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(order => order.pickup_person_id).length}
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
                <p className="text-sm font-medium text-gray-600">معين للتسليم</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(order => order.delivery_person_id).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                        {order.pickup_person_id ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <UserCheck className="h-3 w-3 mr-1" />
                            موظف الاستلام معين
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            بحاجة لموظف استلام
                          </Badge>
                        )}
                        
                        {order.delivery_person_id ? (
                          <Badge variant="default" className="bg-blue-100 text-blue-800">
                            <Truck className="h-3 w-3 mr-1" />
                            موظف التسليم معين
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            بحاجة لموظف تسليم
                          </Badge>
                        )}
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