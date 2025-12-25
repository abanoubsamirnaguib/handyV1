
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Download, Calendar, Clock, Plus, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';

const DashboardEarnings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [earningsData, setEarningsData] = useState({
    total_revenue: 0,
    pending_clearance: 0,
    withdrawn: 0,
    available_for_withdrawal: 0,
    monthly_breakdown: [],
    withdrawal_settings: { min_amount: 100, max_amount: 100000 }
  });

  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawalDialog, setShowWithdrawalDialog] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('last_6_months');
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    payment_method: '',
    payment_details: ''
  });

  const allPaymentMethods = [
    { value: 'vodafone_cash', label: 'فودافون كاش' },
    { value: 'instapay', label: 'انستا باي' },
    { value: 'etisalat_cash', label: 'اتصالات كاش' },
    { value: 'orange_cash', label: 'أورانج كاش' },
    { value: 'bank_transfer', label: 'تحويل بنكي' }
  ];

  // Filter payment methods based on admin settings
  const paymentMethods = allPaymentMethods.filter(method => 
    earningsData.withdrawal_settings?.enabled_payment_methods?.[method.value] !== false
  );

  useEffect(() => {
    if (user?.active_role === 'seller') {
      fetchEarningsData();
      fetchWithdrawalRequests();
    }
  }, [user]);

  const fetchEarningsData = async () => {
    try {
      setLoading(true);
      const response = await api.getEarningsSummary();
      setEarningsData(response);
    } catch (error) {
      console.error('Error fetching earnings data:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل بيانات الأرباح",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawalRequests = async () => {
    try {
      const response = await api.getWithdrawalRequests();
      setWithdrawalRequests(response.withdrawal_requests);
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault();
    
    if (!withdrawalForm.amount || !withdrawalForm.payment_method || !withdrawalForm.payment_details) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(withdrawalForm.amount) > earningsData.available_for_withdrawal) {
      toast({
        title: "خطأ",
        description: "المبلغ المطلوب أكبر من الرصيد المتاح",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await api.createWithdrawalRequest(withdrawalForm);
      toast({
        title: "نجح",
        description: response.message,
        variant: "default",
      });
      
      setShowWithdrawalDialog(false);
      setWithdrawalForm({ amount: '', payment_method: '', payment_details: '' });
      fetchEarningsData();
      fetchWithdrawalRequests();
    } catch (error) {
      let errorMessage = "حدث خطأ في إرسال طلب السحب";
      
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

  // Filter monthly breakdown based on selected period
  const getFilteredMonthlyBreakdown = () => {
    const allMonths = earningsData.monthly_breakdown || [];
    const monthOrder = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    
    // Sort by month order (most recent first)
    const sortedMonths = [...allMonths].sort((a, b) => {
      const aIndex = monthOrder.indexOf(a.month);
      const bIndex = monthOrder.indexOf(b.month);
      return bIndex - aIndex;
    });

    switch (selectedPeriod) {
      case 'last_3_months':
        return sortedMonths.slice(0, 3);
      case 'last_6_months':
        return sortedMonths.slice(0, 6);
      case 'this_year':
        return sortedMonths;
      default:
        return sortedMonths.slice(0, 6);
    }
  };

  const filteredBreakdown = getFilteredMonthlyBreakdown();

  // Get max earnings for chart scaling
  const maxEarnings = filteredBreakdown.length > 0 
    ? Math.max(...filteredBreakdown.map(item => item.earnings), 1)
    : 1;

  // Export report as CSV
  const handleExportReport = () => {
    const csvContent = [
      ['الشهر', 'الأرباح (جنيه)'],
      ...filteredBreakdown.map(item => [item.month, item.earnings.toFixed(2)])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `earnings-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "نجح",
      description: "تم تصدير التقرير بنجاح",
      variant: "default",
    });
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

  if (loading) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">جاري تحميل بيانات الأرباح...</p>
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
          <h1 className="text-3xl font-bold text-gray-800">الأرباح</h1>
          <p className="text-gray-500">تابع إيراداتك وقم بإدارة عمليات السحب.</p>
        </div>
        <Dialog open={showWithdrawalDialog} onOpenChange={setShowWithdrawalDialog}>
          <DialogTrigger asChild>
            <Button 
              className="mt-4 sm:mt-0 bg-green-500 hover:bg-green-600"
              disabled={earningsData.available_for_withdrawal < earningsData.withdrawal_settings.min_amount}
            >
              <DollarSign className="ml-2 h-5 w-5" /> سحب الأرباح
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>طلب سحب الأرباح</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
              <div>
                <Label htmlFor="amount">المبلغ المطلوب سحبه (جنيه)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="1"
                  min={earningsData.withdrawal_settings.min_amount}
                  max={Math.min(earningsData.available_for_withdrawal, earningsData.withdrawal_settings.max_amount)}
                  value={withdrawalForm.amount}
                  onChange={(e) => setWithdrawalForm({...withdrawalForm, amount: e.target.value})}
                  placeholder={`الحد الأدنى: ${earningsData.withdrawal_settings.min_amount} جنيه`}
                />
                <p className="text-sm text-gray-500 mt-1">
                  المتاح للسحب: {earningsData.available_for_withdrawal.toFixed(2)} جنيه
                </p>
              </div>
              
              <div>
                <Label htmlFor="payment_method">طريقة الدفع</Label>
                <Select value={withdrawalForm.payment_method} onValueChange={(value) => setWithdrawalForm({...withdrawalForm, payment_method: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر طريقة الدفع" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="payment_details">
                  {withdrawalForm.payment_method === 'bank_transfer' ? 'بيانات الحساب البنكي' : 'رقم المحفظة'}
                </Label>
                <Input
                  id="payment_details"
                  value={withdrawalForm.payment_details}
                  onChange={(e) => setWithdrawalForm({...withdrawalForm, payment_details: e.target.value})}
                  placeholder={withdrawalForm.payment_method === 'bank_transfer' ? 'رقم الحساب واسم البنك' : 'رقم المحفظة الإلكترونية'}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowWithdrawalDialog(false)}>
                  إلغاء
                </Button>
                <Button type="submit" className="bg-green-500 hover:bg-green-600">
                  إرسال الطلب
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "إجمالي الإيرادات", value: `${earningsData.total_revenue.toFixed(2)} جنيه`, icon: TrendingUp, color: "blue" },
          { title: "قيد التحصيل", value: `${earningsData.pending_clearance.toFixed(2)} جنيه`, icon: Clock, color: "orange" },
          { title: "تم سحبها", value: `${earningsData.withdrawn.toFixed(2)} جنيه`, icon: Download, color: "purple" },
          { title: "متاح للسحب", value: `${earningsData.available_for_withdrawal.toFixed(2)} جنيه`, icon: DollarSign, color: "green" },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
          >
            <Card className={`border-t-4 border-${stat.color}-500 shadow-lg`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                {React.createElement(stat.icon, { className: `h-5 w-5 text-${stat.color}-500` })}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="shadow-xl">
          <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
            <div>
              <CardTitle className="text-xl text-gray-700">ملخص الأرباح الشهري</CardTitle>
              <CardDescription>عرض تفصيلي لأرباحك خلال الأشهر الماضية.</CardDescription>
            </div>
            <div className="flex items-center gap-2 mt-4 sm:mt-0">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="اختر الفترة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_3_months">آخر 3 أشهر</SelectItem>
                  <SelectItem value="last_6_months">آخر 6 أشهر</SelectItem>
                  <SelectItem value="this_year">هذا العام</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExportReport} disabled={filteredBreakdown.length === 0}>
                <Download className="ml-2 h-4 w-4" /> تصدير التقرير
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Chart Visualization */}
            {filteredBreakdown.length > 0 ? (
              <div className="h-72 bg-gray-50 rounded-md p-4 mb-6">
                <div className="h-full flex items-end justify-between gap-2">
                  {filteredBreakdown.map((item, index) => {
                    const height = (item.earnings / maxEarnings) * 100;
                    return (
                      <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                        <div className="flex-1 w-full flex items-end">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-md shadow-md hover:from-green-600 hover:to-green-500 transition-colors"
                            style={{ minHeight: '8px' }}
                            title={`${item.month}: ${item.earnings.toFixed(2)} جنيه`}
                          />
                        </div>
                        <div className="text-xs text-gray-600 text-center font-medium mt-1">
                          {item.month}
                        </div>
                        <div className="text-xs text-green-600 font-semibold">
                          {item.earnings.toFixed(0)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="h-72 bg-gray-100 rounded-md flex items-center justify-center mb-6">
                <p className="text-gray-500">لا توجد بيانات للأرباح الشهرية</p>
              </div>
            )}

            {/* Monthly Breakdown List */}
            <div className="mt-6 space-y-3">
              {filteredBreakdown.length > 0 ? (
                filteredBreakdown.map((item, index) => (
                  <motion.div
                    key={item.month}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-700">{item.month}</span>
                    </div>
                    <span className="font-semibold text-green-600">{item.earnings.toFixed(2)} جنيه</span>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>لا توجد أرباح شهرية لهذه الفترة</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Withdrawal Requests Table */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl text-gray-700">طلبات السحب</CardTitle>
                <CardDescription>تابع حالة طلبات سحب الأرباح الخاصة بك</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {withdrawalRequests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4">المبلغ</th>
                      <th className="text-right py-3 px-4">طريقة الدفع</th>
                      <th className="text-right py-3 px-4">الحالة</th>
                      <th className="text-right py-3 px-4">تاريخ الطلب</th>
                      <th className="text-right py-3 px-4">ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawalRequests.map((request) => (
                      <tr key={request.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{request.amount} جنيه</td>
                        <td className="py-3 px-4">{request.payment_method}</td>
                        <td className="py-3 px-4">
                          <Badge className={`${getStatusColor(request.status)} flex items-center gap-1 w-fit`}>
                            {getStatusIcon(request.status)}
                            {request.status_label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{request.created_at}</td>
                        <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                          {request.rejection_reason || request.admin_notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>لم تقم بأي طلبات سحب بعد</p>
                <p className="text-sm">اطلب سحب أرباحك عندما تصل للحد الأدنى</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardEarnings;
