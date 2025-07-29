import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Search,
  Filter,
  Download,
  User,
  Phone,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';
import { adminApi } from '@/lib/api';

const AdminWithdrawals = () => {
  const { toast } = useToast();
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchWithdrawalRequests();
  }, []);

  const fetchWithdrawalRequests = async () => {
    try {
      const response = await adminApi.getWithdrawalRequests();
      setWithdrawalRequests(response.withdrawal_requests);
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل طلبات السحب",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRequest = async () => {
    if (!selectedRequest) return;

    if (actionType === 'reject' && !rejectionReason.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال سبب الرفض",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = actionType === 'approve' 
        ? await adminApi.approveWithdrawalRequest(selectedRequest.id, { admin_notes: adminNotes })
        : await adminApi.rejectWithdrawalRequest(selectedRequest.id, { rejection_reason: rejectionReason });
      
      toast({
        title: "نجح",
        description: response.message,
        variant: "default",
      });

      setShowProcessDialog(false);
      setSelectedRequest(null);
      setAdminNotes('');
      setRejectionReason('');
      fetchWithdrawalRequests();
    } catch (error) {
      let errorMessage = "حدث خطأ في معالجة الطلب";
      
      // Parse error message from API response
      if (error.message && error.message.includes('API error:')) {
        try {
          const errorText = error.message.split('API error:')[1];
          const errorJson = JSON.parse(errorText.split(' - ')[1]);
          errorMessage = errorJson.error || errorJson.message || errorMessage;
        } catch (parseError) {
          console.error('Error parsing API error:', parseError);
        }
      }
      
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const openProcessDialog = (request, type) => {
    setSelectedRequest(request);
    setActionType(type);
    setShowProcessDialog(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = withdrawalRequests.filter(request => {
    const matchesSearch = request.seller_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.seller_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: withdrawalRequests.length,
    pending: withdrawalRequests.filter(r => r.status === 'pending').length,
    approved: withdrawalRequests.filter(r => r.status === 'approved').length,
    rejected: withdrawalRequests.filter(r => r.status === 'rejected').length,
    totalAmount: withdrawalRequests
      .filter(r => r.status === 'approved')
      .reduce((sum, r) => sum + parseFloat(r.amount), 0)
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">جاري تحميل طلبات السحب...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <motion.div 
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800">إدارة طلبات السحب</h1>
          <p className="text-gray-500">راجع ووافق على طلبات سحب أرباح البائعين</p>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {[
          { title: "إجمالي الطلبات", value: stats.total, icon: DollarSign, color: "blue" },
          { title: "قيد المراجعة", value: stats.pending, icon: AlertCircle, color: "yellow" },
          { title: "تم الموافقة", value: stats.approved, icon: CheckCircle, color: "green" },
          { title: "مرفوض", value: stats.rejected, icon: XCircle, color: "red" },
          { title: "إجمالي المسحوب", value: `${stats.totalAmount.toFixed(2)} ج`, icon: Download, color: "purple" },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
          >
            <Card className={`border-t-4 border-${stat.color}-500`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                {React.createElement(stat.icon, { className: `h-5 w-5 text-${stat.color}-500` })}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>طلبات السحب</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="البحث بالاسم أو البريد الإلكتروني..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="فلترة بالحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">قيد المراجعة</SelectItem>
                <SelectItem value="approved">تم الموافقة</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Withdrawal Requests Table */}
          {filteredRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-3 px-4">البائع</th>
                    <th className="text-right py-3 px-4">المبلغ</th>
                    <th className="text-right py-3 px-4">طريقة الدفع</th>
                    <th className="text-right py-3 px-4">تفاصيل الدفع</th>
                    <th className="text-right py-3 px-4">الحالة</th>
                    <th className="text-right py-3 px-4">تاريخ الطلب</th>
                    <th className="text-right py-3 px-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">{request.seller_name}</div>
                            <div className="text-gray-500 text-xs">{request.seller_email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-green-600">{request.amount} جنيه</td>
                      <td className="py-3 px-4">{request.payment_method}</td>
                      <td className="py-3 px-4 max-w-xs truncate">{request.payment_details}</td>
                      <td className="py-3 px-4">
                        <Badge className={`${getStatusColor(request.status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(request.status)}
                          {request.status_label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{request.created_at}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {request.status === 'pending' ? (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => openProcessDialog(request, 'approve')}
                            >
                              <CheckCircle className="h-4 w-4 ml-1" />
                              موافقة
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => openProcessDialog(request, 'reject')}
                            >
                              <XCircle className="h-4 w-4 ml-1" />
                              رفض
                            </Button>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            {request.processed_at && (
                              <div>تم المعالجة: {request.processed_at}</div>
                            )}
                            {request.rejection_reason && (
                              <div className="text-red-600 max-w-xs truncate">
                                السبب: {request.rejection_reason}
                              </div>
                            )}
                            {request.admin_notes && (
                              <div className="text-blue-600 max-w-xs truncate">
                                ملاحظات: {request.admin_notes}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>لا توجد طلبات سحب {filterStatus !== 'all' ? getStatusLabel(filterStatus) : ''}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Process Request Dialog */}
      <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'الموافقة على طلب السحب' : 'رفض طلب السحب'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">تفاصيل الطلب</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>البائع:</strong> {selectedRequest.seller_name}</p>
                  <p><strong>المبلغ:</strong> {selectedRequest.amount} جنيه</p>
                  <p><strong>طريقة الدفع:</strong> {selectedRequest.payment_method}</p>
                  <p><strong>تفاصيل الدفع:</strong> {selectedRequest.payment_details}</p>
                </div>
              </div>

              {actionType === 'approve' ? (
                <div>
                  <Label htmlFor="admin_notes">ملاحظات الإدارة (اختياري)</Label>
                  <Textarea
                    id="admin_notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="أي ملاحظات إضافية..."
                    rows={3}
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="rejection_reason">سبب الرفض *</Label>
                  <Textarea
                    id="rejection_reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="اذكر سبب رفض طلب السحب..."
                    rows={3}
                    required
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowProcessDialog(false)}
                >
                  إلغاء
                </Button>
                <Button 
                  onClick={handleProcessRequest}
                  className={actionType === 'approve' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}
                >
                  {actionType === 'approve' ? 'موافقة' : 'رفض'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const getStatusLabel = (status) => {
  const labels = {
    pending: 'قيد المراجعة',
    approved: 'تم الموافقة عليها',
    rejected: 'مرفوضة'
  };
  return labels[status] || status;
};

export default AdminWithdrawals; 