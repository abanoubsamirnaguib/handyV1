<?php

// Reminder: Ensure the 'api' rate limiter is defined in app/Providers/RouteServiceProvider.php like:
// use Illuminate\Cache\RateLimiting\Limit;
// use Illuminate\Support\Facades\RateLimiter;
// RateLimiter::for('api', function (Request $request) {
//     return Limit::perMinute(60)->by(optional($request->user())->id ?: $request->ip());
// });

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SellerController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductCrudController;
use App\Http\Controllers\Api\OrderCrudController;
use App\Http\Controllers\Api\CategoryCrudController;
use App\Http\Controllers\Api\ReviewCrudController;
use App\Http\Controllers\Api\SellerCrudController;
use App\Http\Controllers\Api\UserCrudController;
use App\Http\Controllers\Api\CartItemCrudController;
use App\Http\Controllers\Api\WishlistItemCrudController;
use App\Http\Controllers\Api\NotificationCrudController;
use App\Http\Controllers\Api\ActivityLogCrudController;
use App\Http\Controllers\Api\OrderHistoryCrudController;
use App\Http\Controllers\Api\FileUploadController;
use App\Http\Controllers\Api\SiteSettingController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\Api\ExploreController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\DeliveryController;
use App\Http\Controllers\Api\DeliveryPersonnelCrudController;
use App\Http\Controllers\Api\WithdrawalRequestController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\AdminAnnouncementController;
use App\Http\Controllers\Api\CityCrudController;
use App\Http\Controllers\Api\PlatformProfitController;
use App\Http\Controllers\Api\AIAssistantController;


Broadcast::routes(['middleware' => ['broadcast.auth']]);

Route::prefix('listsellers')->group(function () {
    Route::get('{id}', [SellerController::class, 'show'])->middleware('optional.auth');
    Route::get('{id}/products', [SellerController::class, 'products'])->middleware('optional.auth');
});

Route::prefix('Listpoducts')->group(function () {
    Route::get('{id}', [ProductController::class, 'show'])->middleware('optional.auth');
    Route::get('{id}/reviews', [ProductController::class, 'reviews']);
    Route::get('{id}/related', [ProductController::class, 'relatedProducts'])->middleware('optional.auth'); // Related gigs endpoint
});

// Seller services endpoint (takes user ID, finds seller internally)
Route::get('users/{userId}/services', [ProductController::class, 'getSellerServices'])->middleware('optional.auth');

Route::get('listcategories', [CategoryController::class, 'index']);
Route::get('TopProducts', [ProductController::class, 'TopProducts'])->middleware('optional.auth');
Route::get('sellers/search', [SellerController::class, 'search']);
Route::get('sellers/top', [SellerController::class, 'topSellers']);

// Debug route for testing order creation response
Route::get('debug/order-test', function() {
    $testOrder = \App\Models\Order::latest()->first();
    if ($testOrder) {
        return new \App\Http\Resources\OrderResource($testOrder);
    }
    return response()->json(['message' => 'No orders found'], 404);
});

// Authentication - public routes
Route::post('register-with-verification', [AuthController::class, 'registerWithEmailVerification']);
Route::post('login', [AuthController::class, 'login']);

// OTP routes - public
Route::post('send-email-verification-otp', [AuthController::class, 'sendEmailVerificationOTP']);
Route::post('verify-email', [AuthController::class, 'verifyEmail']);
Route::post('send-password-reset-otp', [AuthController::class, 'sendPasswordResetOTP']);
Route::post('verify-password-reset-otp', [AuthController::class, 'verifyPasswordResetOTP']);
Route::post('reset-password', [AuthController::class, 'resetPassword']);

// Public routes
Route::get('users/{id}', [UserCrudController::class, 'show']);  // Keep this one public for displaying profiles

// Add explore routes for minimal product/seller data
Route::get('explore/products', [ExploreController::class, 'products'])->middleware('optional.auth');
Route::get('explore/sellers', [ExploreController::class, 'sellers']);

// Public review endpoints - allow guests to view reviews
Route::get('products/{productId}/reviews', [ReviewCrudController::class, 'getProductReviews']);
Route::get('sellers/{sellerId}/reviews', [ReviewCrudController::class, 'getSellerReviews']);

// Public Announcements - للزوار
Route::prefix('announcements')->group(function () {
    Route::get('/', [AnnouncementController::class, 'index']); // جميع الإعلانات المرئية
    Route::get('latest', [AnnouncementController::class, 'latest']); // أحدث الإعلانات
    Route::get('stats', [AnnouncementController::class, 'stats']); // إحصائيات الإعلانات
    Route::get('{id}', [AnnouncementController::class, 'show']); // إعلان واحد
});

// Public About Us Statistics
Route::get('about-us/stats', [AdminController::class, 'getAboutUsStats']);

// Public Cities list (for checkout selection)
Route::get('cities', [CityCrudController::class, 'index']);

// Public Site Settings (general settings for frontend)
Route::get('site-settings/general', [SiteSettingController::class, 'getGeneralSettings']);

// AI Assistant routes (public - can be moved to protected if needed)
Route::post('ai-assistant/chat', [AIAssistantController::class, 'chat']);

// Protected Routes with middleware 
Route::middleware(['auth:sanctum'])->group(function () {
    // Allow logout without status check (suspended users should be able to log out)
    Route::post('logout', [AuthController::class, 'logout']);
    
    // All other routes require active user status
    Route::middleware(['check.user.status'])->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::get('check-token', [AuthController::class, 'checkToken']);
    
    // Role switching endpoints
    Route::post('switch-role', [AuthController::class, 'switchRole']);
    Route::post('enable-seller-mode', [AuthController::class, 'enableSellerMode']);

    // Product CRUD
    Route::apiResource('products', ProductCrudController::class)->except(['show']);
    
    // Order CRUD - استخدام OrderCrudController المحديث
    Route::apiResource('orders', OrderCrudController::class);
    
    // Order workflow routes - إضافة routes جديدة لتتبع الطلبات
    Route::prefix('orders')->group(function () {
        // Admin actions
        Route::post('{id}/admin-approve', [OrderCrudController::class, 'adminApprove']);
        Route::get('pending-approval', [OrderCrudController::class, 'getPendingApproval']);
        Route::get('check-late', [OrderCrudController::class, 'checkLateOrders']);
        
        // Seller actions  
        Route::post('{id}/seller-approve', [OrderCrudController::class, 'sellerApprove']);
        Route::post('{id}/approve-price', [OrderCrudController::class, 'approveProposedPrice']);
        Route::post('{id}/reject-price', [OrderCrudController::class, 'rejectProposedPrice']);
        Route::post('{id}/complete-work', [OrderCrudController::class, 'completeWork']);
        
        // Delivery actions
        Route::post('{id}/pickup-delivery', [OrderCrudController::class, 'pickupByDelivery']);
        Route::post('{id}/mark-delivered', [OrderCrudController::class, 'markAsDelivered']);
        Route::get('ready-for-delivery', [OrderCrudController::class, 'getReadyForDelivery']);
        
        // Customer actions
        Route::post('{id}/complete', [OrderCrudController::class, 'completeOrder']);
        Route::post('{id}/upload-payment-proof', [OrderCrudController::class, 'uploadPaymentProof']);
        
        // Check late status for individual order
        Route::put('{id}/check-late', [OrderCrudController::class, 'checkLateStatus']);
        
        // General actions
        Route::post('{id}/cancel', [OrderCrudController::class, 'cancelOrder']);
        
        // Dashboard statistics
        Route::get('dashboard/stats', [OrderCrudController::class, 'getDashboardStats']);
    });
    
    // Category CRUD
    Route::apiResource('categories', CategoryCrudController::class)->except(['show']);
    
    // Review CRUD    
    Route::apiResource('reviews', ReviewCrudController::class)->except(['show']);
    
    // Additional review endpoints (protected - for order reviews and review management)
    Route::get('orders/{orderId}/reviews', [ReviewCrudController::class, 'getOrderReviews']);
    Route::get('orders/{orderId}/can-review', [ReviewCrudController::class, 'canReviewOrder']);
    
    // Seller CRUD
    Route::apiResource('sellers', SellerCrudController::class);    
    
    // User CRUD (remaining routes)
    Route::delete('users/{id}', [UserCrudController::class, 'destroy']);
    Route::get('users', [UserCrudController::class, 'index']);
    Route::post('users', [UserCrudController::class, 'store']);
    Route::put('users/{id}', [UserCrudController::class, 'update']);
    Route::patch('users/{id}', [UserCrudController::class, 'update']);
    
    // Cart Item CRUD - تحديث routes للعربة
    Route::apiResource('cart-items', CartItemCrudController::class)->except(['show']);
    Route::get('cart', [CartItemCrudController::class, 'getUserCart']); // جلب عربة المستخدم
    Route::post('cart/add', [CartItemCrudController::class, 'addToCart']); // إضافة للعربة
    Route::delete('cart/clear', [CartItemCrudController::class, 'clearCart']); // تفريغ العربة
    
    // Wishlist Item CRUD - Enhanced with existence checks and user-specific methods
    Route::apiResource('wishlist-items', WishlistItemCrudController::class)->except(['show']);
    Route::get('wishlist', [WishlistItemCrudController::class, 'getUserWishlist']); // Get user's wishlist
    Route::post('wishlist/add', [WishlistItemCrudController::class, 'addToWishlist']); // Add to wishlist
    Route::delete('wishlist/remove/{productId}', [WishlistItemCrudController::class, 'removeFromWishlist']); // Remove by product ID
    Route::post('wishlist/toggle', [WishlistItemCrudController::class, 'toggleWishlist']); // Toggle wishlist status
    Route::get('wishlist/check/{productId}', [WishlistItemCrudController::class, 'checkWishlistStatus']); // Check if in wishlist
    Route::get('wishlist/count', [WishlistItemCrudController::class, 'getWishlistCount']); // Get wishlist count
    Route::delete('wishlist/clear', [WishlistItemCrudController::class, 'clearWishlist']); // Clear all wishlist items
    
    // Real-time Chat Routes (Comprehensive chat system)
    Route::prefix('chat')->group(function () {
        Route::get('conversations', [ChatController::class, 'getConversations']);
        Route::get('conversations/{conversationId}/messages', [ChatController::class, 'getMessages']);
        Route::post('messages', [ChatController::class, 'sendMessage']);
        Route::post('conversations/start', [ChatController::class, 'startConversation']);
        Route::post('conversations/{conversationId}/mark-read', [ChatController::class, 'markAsRead']);
        Route::delete('conversations/{conversationId}', [ChatController::class, 'deleteConversation']);
        Route::post('update-online-status', [ChatController::class, 'updateOnlineStatus']);
        Route::post('conversations/{conversationId}/report', [ChatController::class, 'reportConversation']);
    });
    
    // Notification CRUD
    Route::apiResource('notifications', NotificationCrudController::class)->except(['show']);
    Route::get('notifications/unread-count', [NotificationCrudController::class, 'unreadCount']);
    Route::post('notifications/{id}/mark-read', [NotificationCrudController::class, 'markAsRead']);
    Route::post('notifications/mark-all-read', [NotificationCrudController::class, 'markAllAsRead']);
    
    // Activity Log CRUD
    Route::apiResource('activity-logs', ActivityLogCrudController::class)->except(['show']);
    
    // Order History CRUD
    Route::apiResource('order-history', OrderHistoryCrudController::class)->except(['show']);
    
    // File Upload
    Route::post('upload', [FileUploadController::class, 'upload']);

    // User profile image upload
    Route::post('users/{id}/upload-avatar', [UserCrudController::class, 'uploadProfileImage']);
    
    // User cover image upload
    Route::post('users/{id}/upload-cover-image', [UserCrudController::class, 'uploadCoverImage']);

    // Site Settings
    Route::get('settings', [SiteSettingController::class, 'index']);
    Route::post('settings', [SiteSettingController::class, 'update']);
    
    // Change Password
    Route::post('change-password', [AuthController::class, 'changePassword']);
    
    // Payment routes
    Route::post('payments/deposit', [PaymentController::class, 'processDeposit']);
    Route::post('payments/remaining', [PaymentController::class, 'processRemainingPayment']);
    Route::get('payments/order/{orderId}', [PaymentController::class, 'getOrderPayments']);
    
    // Admin routes
    Route::prefix('admin')->group(function () {
        Route::get('dashboard', [AdminController::class, 'dashboard']);
        Route::get('users', [AdminController::class, 'users']);
        Route::get('sellers', [AdminController::class, 'sellers']);
        Route::get('products', [AdminController::class, 'products']);
        Route::get('recent-activity', [AdminController::class, 'recentActivity']);
        
        Route::patch('users/{id}/status', [AdminController::class, 'updateUserStatus']);
        Route::patch('sellers/{id}/status', [AdminController::class, 'updateSellerStatus']);
        Route::patch('products/{id}/featured', [AdminController::class, 'toggleProductFeatured']);
        Route::patch('products/{id}/status', [AdminController::class, 'updateProductStatus']);
        
        Route::delete('users/{id}', [AdminController::class, 'deleteUser']);
        Route::delete('products/{id}', [AdminController::class, 'deleteProduct']);
        
        // Admin order management routes
        Route::get('orders', [AdminController::class, 'getOrders']);
        Route::get('orders/pending', [AdminController::class, 'getPendingOrders']);
        Route::post('orders/{id}/approve', [AdminController::class, 'approveOrder']);
        Route::post('orders/{id}/reject', [AdminController::class, 'rejectOrder']);
        Route::post('orders/{id}/update-status', [OrderCrudController::class, 'adminUpdateStatus']);
        
        // Delivery Personnel Management
        Route::apiResource('delivery-personnel', DeliveryPersonnelCrudController::class);
        Route::post('delivery-personnel/{id}/reset-password', [DeliveryPersonnelCrudController::class, 'resetPassword']);
        Route::post('delivery-personnel/{id}/reset-trips', [DeliveryPersonnelCrudController::class, 'resetTripsCount']);
        Route::get('delivery/available-personnel', [DeliveryPersonnelCrudController::class, 'availableDeliveryPersonnel']);
        
        // New Delivery Order Management
        Route::get('delivery/orders-ready', [DeliveryPersonnelCrudController::class, 'getOrdersReadyForDelivery']);
        Route::get('delivery/picked-up-orders', [DeliveryPersonnelCrudController::class, 'getPickedUpOrdersAwaitingDeliveryAssignment']);
        Route::get('delivery/orders-in-progress', [DeliveryPersonnelCrudController::class, 'getOrdersInProgress']);
        Route::post('delivery/bulk-assign-orders', [DeliveryPersonnelCrudController::class, 'bulkAssignOrders']);
        Route::post('delivery/assign-pickup-person', [DeliveryPersonnelCrudController::class, 'assignPickupPerson']);
        Route::post('delivery/assign-delivery-person', [DeliveryPersonnelCrudController::class, 'assignDeliveryPerson']);
        
        // Withdrawal management for admin
        Route::get('withdrawal-requests', [WithdrawalRequestController::class, 'adminIndex']);
        Route::post('withdrawal-requests/{id}/approve', [WithdrawalRequestController::class, 'approve']);
        Route::post('withdrawal-requests/{id}/reject', [WithdrawalRequestController::class, 'reject']);
        
        // Buyer withdrawal management for admin
        Route::get('buyer-withdrawal-requests', [\App\Http\Controllers\Api\BuyerWithdrawalRequestController::class, 'adminIndex']);
        Route::post('buyer-withdrawal-requests/{id}/approve', [\App\Http\Controllers\Api\BuyerWithdrawalRequestController::class, 'approve']);
        Route::post('buyer-withdrawal-requests/{id}/reject', [\App\Http\Controllers\Api\BuyerWithdrawalRequestController::class, 'reject']);
        
        // Withdrawal settings management
        Route::get('withdrawal-settings', [WithdrawalRequestController::class, 'getWithdrawalSettings']);
        Route::post('withdrawal-settings', [WithdrawalRequestController::class, 'updateWithdrawalSettings']);
        
        // Admin site settings management
        Route::get('site-settings', [SiteSettingController::class, 'getAdminSettings']);
        Route::post('site-settings', [SiteSettingController::class, 'updateAdminSettings']);
        
        // Admin chat management routes
        Route::prefix('chat')->group(function () {
            Route::get('conversations', [ChatController::class, 'adminGetAllConversations']);
            Route::get('conversations/{conversationId}/messages', [ChatController::class, 'adminGetMessages']);
            Route::get('stats', [ChatController::class, 'adminGetStats']);
            Route::get('reports', [ChatController::class, 'adminGetReports']);
            Route::post('reports/{reportId}/resolve', [ChatController::class, 'adminResolveReport']);
        });
        
        // Admin wishlist management routes
        Route::prefix('wishlist')->group(function () {
            Route::get('statistics', [WishlistItemCrudController::class, 'getStatistics']); // Get wishlist statistics
            Route::post('cleanup-inactive', [WishlistItemCrudController::class, 'cleanupInactive']); // Clean up inactive products
        });
        
        // Admin announcements management
        Route::prefix('announcements')->group(function () {
            Route::get('/', [AdminAnnouncementController::class, 'index']); // جميع الإعلانات للأدمن
            Route::post('/', [AdminAnnouncementController::class, 'store']); // إنشاء إعلان جديد
            Route::get('stats', [AdminAnnouncementController::class, 'stats']); // إحصائيات الإعلانات للأدمن
            Route::get('{id}', [AdminAnnouncementController::class, 'show']); // عرض إعلان واحد
            Route::put('{id}', [AdminAnnouncementController::class, 'update']); // تحديث الإعلان
            Route::delete('{id}', [AdminAnnouncementController::class, 'destroy']); // حذف الإعلان
            Route::post('{id}/toggle-status', [AdminAnnouncementController::class, 'toggleStatus']); // تغيير حالة الإعلان
        });
        
        // City CRUD for admin
        Route::apiResource('cities', CityCrudController::class);

        // Platform profits (admin dashboard)
        Route::get('platform-profits', [PlatformProfitController::class, 'index']);
    });
    
    // Product CRUD for sellers (gigs/products)
    Route::get('seller/products', [ProductController::class, 'index']);
    Route::post('seller/products', [ProductController::class, 'store']);
    Route::get('seller/products/{id}', [ProductController::class, 'show']);
    Route::put('seller/products/{id}', [ProductController::class, 'update']);
    Route::delete('seller/products/{id}', [ProductController::class, 'destroy']);
    Route::post('seller/products/{id}/toggle-status', [ProductController::class, 'toggleStatus']);
    
    // Withdrawal routes for sellers
    Route::get('withdrawals', [WithdrawalRequestController::class, 'index']);
    Route::post('withdrawals', [WithdrawalRequestController::class, 'store']);
    Route::get('earnings-summary', [WithdrawalRequestController::class, 'earningsSummary']);
    
    // Buyer withdrawal routes
    Route::get('buyer-withdrawals', [\App\Http\Controllers\Api\BuyerWithdrawalRequestController::class, 'index']);
    Route::post('buyer-withdrawals', [\App\Http\Controllers\Api\BuyerWithdrawalRequestController::class, 'store']);
    }); // End check.user.status middleware group
}); // End auth:sanctum middleware group

// Delivery Personnel Routes (separate authentication)
Route::prefix('delivery')->name('delivery.')->group(function () {
    // Public routes (login only)
    Route::post('login', [DeliveryController::class, 'login'])->name('login');
    
    // Protected routes (require delivery personnel authentication)
    Route::middleware(['delivery.auth'])->group(function () {
        Route::post('logout', [DeliveryController::class, 'logout'])->name('logout');
        Route::get('profile', [DeliveryController::class, 'profile'])->name('profile');
        Route::get('stats', [DeliveryController::class, 'stats'])->name('stats');
        Route::post('toggle-availability', [DeliveryController::class, 'toggleAvailability'])->name('toggle-availability');
        
        // Orders management

        Route::get('orders-to-pickup', [DeliveryController::class, 'ordersToPickup']); // الطلبات المخصصة للاستلام
        Route::get('orders-to-deliver', [DeliveryController::class, 'ordersToDeliver']); // الطلبات المخصصة للتسليم
        Route::get('my-orders', [DeliveryController::class, 'myOrders']);
        Route::get('suspended-orders', [DeliveryController::class, 'suspendedOrders']); // الطلبات المعلقة
        Route::get('orders/{id}', [DeliveryController::class, 'orderDetails']);
        
        // Order actions

        Route::post('orders/{id}/pickup', [DeliveryController::class, 'pickupOrder']);
        Route::post('orders/{id}/deliver', [DeliveryController::class, 'deliverOrder']);
        Route::post('orders/{id}/suspend', [DeliveryController::class, 'suspendOrder']); // تعليق الطلب
    });
});

// Contact Us Routes (Public submission, protected admin management)
Route::post('contact', [ContactController::class, 'store']); // Public endpoint for contact form submission

// Protected Contact Us Routes for Admin
Route::middleware(['auth:sanctum'])->prefix('admin/contact')->group(function () {
    Route::get('/', [ContactController::class, 'index']); // Get all contact messages
    Route::get('stats', [ContactController::class, 'stats']); // Get contact message statistics
    Route::get('{id}', [ContactController::class, 'show']); // Get single contact message
    Route::patch('{id}/read', [ContactController::class, 'markAsRead']); // Mark as read
    Route::patch('{id}/resolve', [ContactController::class, 'markAsResolved']); // Mark as resolved
    Route::delete('{id}', [ContactController::class, 'destroy']); // Delete contact message
});
