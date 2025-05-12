
import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, PlusCircle, Edit, Trash2, Eye, BarChart2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { getGigsBySellerId } from '@/lib/data';
import { Link, useNavigate } from 'react-router-dom';
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
} from "@/components/ui/alert-dialog";
import { useToast } from '@/components/ui/use-toast';


const DashboardGigs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  // This should ideally come from a state management or API call that can be updated
  const [userGigs, setUserGigs] = React.useState(user ? getGigsBySellerId(user.id) : []);

  const handleDeleteGig = (gigId) => {
    // Placeholder for delete logic
    // In a real app, this would make an API call and update state
    setUserGigs(prevGigs => prevGigs.filter(gig => gig.id !== gigId));
    toast({
      title: "تم حذف الخدمة",
      description: `تم حذف الخدمة بنجاح.`,
    });
  };

  if (user?.role !== 'seller') {
    return (
      <div className="p-6 md:p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-700">غير مصرح لك بالدخول</h1>
        <p className="text-gray-500">هذه الصفحة مخصصة للبائعين فقط.</p>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">العودة للوحة التحكم</Button>
      </div>
    );
  }
  
  return (
    <div className="p-6 md:p-8 space-y-8">
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-800">خدماتي</h1>
        <Button onClick={() => navigate('/dashboard/gigs/new')} className="bg-green-500 hover:bg-green-600">
          <PlusCircle className="ml-2 h-5 w-5" /> أضف خدمة جديدة
        </Button>
      </motion.div>

      {userGigs.length === 0 ? (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">ليس لديك خدمات معروضة بعد</h2>
          <p className="text-gray-500">ابدأ بإضافة خدماتك ليراها العملاء!</p>
          <Button onClick={() => navigate('/dashboard/gigs/new')} className="mt-6 bg-orange-500 hover:bg-orange-600">
            <PlusCircle className="ml-2 h-4 w-4" /> أضف خدمتك الأولى
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userGigs.map((gig, index) => (
            <motion.div
              key={gig.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="shadow-lg hover:shadow-xl transition-shadow flex flex-col h-full border-amber-100">
                <div className="relative h-48">
                  <img 
                    src={gig.images && gig.images.length > 0 
                      ? gig.images[0] 
                      : "https://images.unsplash.com/photo-1690721606848-ac5bdcde45ea"} 
                    alt={gig.title} 
                    className="w-full h-full object-cover" 
                  />
                  <Badge variant="secondary" className="absolute top-2 right-2 bg-amber-500 text-white">{gig.category}</Badge>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-gray-800 h-14 overflow-hidden">{gig.title}</CardTitle>
                  <CardDescription className="text-sm text-primary font-bold">{gig.price} جنيه</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Eye className="ml-2 h-4 w-4 text-blue-500" /> {Math.floor(Math.random() * 500)} مشاهدة
                  </div>
                  <div className="flex items-center text-gray-600">
                    <ShoppingBag className="ml-2 h-4 w-4 text-green-500" /> {Math.floor(Math.random() * 50)} طلب
                  </div>
                   <div className="flex items-center text-gray-600">
                    <BarChart2 className="ml-2 h-4 w-4 text-orange-500" /> {gig.rating} تقييم ({gig.reviewCount})
                  </div>
                </CardContent>
                <CardFooter className="grid grid-cols-2 gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/dashboard/gigs/edit/${gig.id}`}>
                      <Edit className="ml-1 h-4 w-4" /> تعديل
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="ml-1 h-4 w-4" /> حذف
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد من حذف هذه الخدمة؟</AlertDialogTitle>
                        <AlertDialogDescription>
                          لا يمكن التراجع عن هذا الإجراء. سيتم حذف الخدمة نهائياً.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteGig(gig.id)} className="bg-destructive hover:bg-destructive/90">
                          حذف
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardGigs;
