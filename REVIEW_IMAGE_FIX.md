# Review Image Upload Fix

## المشكلة
عند محاولة رفع صورة مع تحديث التقييم، الطلب لا يصل إلى الـ backend.

## السبب
Laravel API routes لا تدعم FormData مع معاملات `PUT` أو `PATCH` مباشرة. الحل هو استخدام:
- `POST` مع `_method=PATCH` في FormData (Form Spoofing)
- أو استخدام `PATCH` مع JSON للبيانات التي لا تحتوي على صور

## التغييرات المنجزة

### 1. Frontend - `src/lib/api.js`
```javascript
updateReview: (reviewId, reviewData, imageFile = null, removeImage = false) => {
  if (imageFile || removeImage) {
    // استخدام POST مع _method=PATCH للـ FormData
    const formData = new FormData();
    formData.append('_method', 'PATCH');
    // إضافة البيانات
    return apiFormFetch(`reviews/${reviewId}`, {
      method: 'POST',
      body: formData,
    });
  } else {
    // استخدام PATCH مع JSON للبيانات فقط
    return apiFetch(`reviews/${reviewId}`, {
      method: 'PATCH',
      body: JSON.stringify(reviewData),
    });
  }
}
```

### 2. Backend - `backend/app/Http/Requests/ReviewRequest.php`
- تم إضافة دعم `_method` field
- التعامل مع POST مع `_method=PATCH/PUT` كطلب تحديث

### 3. Backend - `backend/app/Http/Controllers/Api/ReviewCrudController.php`
- إزالة `_method` من البيانات المعتمدة قبل حفظها
- فقط تحديث الحقول التي تم تقديمها (not null)
- معالجة صحيحة لرفع الصور وحذفها

## الاختبار

### تحديث التقييم مع صورة:
1. اختر صورة في واجهة المستخدم
2. اضغط على زر "تحديث"
3. سيتم إرسال `POST` بـ `_method=PATCH` و `FormData`
4. الـ backend سيستقبله كـ `PATCH` request

### تحديث التقييم بدون صورة:
1. غير التقييم أو التعليق فقط
2. اضغط على زر "تحديث"
3. سيتم إرسال `PATCH` بـ JSON

## الملاحظات
- جميع الصور ترفع إلى `storage/app/public/reviews/`
- الصور تُعرض عبر `asset('storage/' . $path)`
- الصور القديمة تُحذف عند تحديث الصورة
- يمكن حذف الصورة بدون تحميل صورة جديدة
