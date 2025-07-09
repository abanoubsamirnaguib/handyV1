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


Broadcast::routes(['middleware' => ['broadcast.auth']]);

Route::prefix('listsellers')->group(function () {
    Route::get('{id}', [SellerController::class, 'show']);
    Route::get('{id}/products', [SellerController::class, 'products']);
});

Route::prefix('Listpoducts')->group(function () {
    Route::get('{id}', [ProductController::class, 'show']);
    Route::get('{id}/reviews', [ProductController::class, 'reviews']);
    Route::get('{id}/related', [ProductController::class, 'relatedProducts']); // Related gigs endpoint
});

// Seller services endpoint (takes user ID, finds seller internally)
Route::get('users/{userId}/services', [ProductController::class, 'getSellerServices']);

Route::get('listcategories', [CategoryController::class, 'index']);
Route::get('TopProducts', [ProductController::class, 'TopProducts']);
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
Route::post('register', [AuthController::class, 'register']);
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
Route::get('explore/products', [ExploreController::class, 'products']);
Route::get('explore/sellers', [ExploreController::class, 'sellers']);

// Public review endpoints - allow guests to view reviews
Route::get('products/{productId}/reviews', [ReviewCrudController::class, 'getProductReviews']);
Route::get('sellers/{sellerId}/reviews', [ReviewCrudController::class, 'getSellerReviews']);

// Protected Routes with middleware 
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('me', [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);
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
        
        // Seller actions  
        Route::post('{id}/seller-approve', [OrderCrudController::class, 'sellerApprove']);
        Route::post('{id}/start-work', [OrderCrudController::class, 'startWork']);
        Route::post('{id}/complete-work', [OrderCrudController::class, 'completeWork']);
        
        // Delivery actions
        Route::post('{id}/pickup-delivery', [OrderCrudController::class, 'pickupByDelivery']);
        Route::post('{id}/mark-delivered', [OrderCrudController::class, 'markAsDelivered']);
        Route::get('ready-for-delivery', [OrderCrudController::class, 'getReadyForDelivery']);
        
        // Customer actions
        Route::post('{id}/complete', [OrderCrudController::class, 'completeOrder']);
        Route::post('{id}/upload-payment-proof', [OrderCrudController::class, 'uploadPaymentProof']);
        
        // General actions
        Route::post('{id}/cancel', [OrderCrudController::class, 'cancelOrder']);
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
    
    // Wishlist Item CRUD
    Route::apiResource('wishlist-items', WishlistItemCrudController::class)->except(['show']);
    
    // Real-time Chat Routes (Comprehensive chat system)
    Route::prefix('chat')->group(function () {
        Route::get('conversations', [ChatController::class, 'getConversations']);
        Route::get('conversations/{conversationId}/messages', [ChatController::class, 'getMessages']);
        Route::post('messages', [ChatController::class, 'sendMessage']);
        Route::post('conversations/start', [ChatController::class, 'startConversation']);
        Route::post('conversations/{conversationId}/mark-read', [ChatController::class, 'markAsRead']);
        Route::delete('conversations/{conversationId}', [ChatController::class, 'deleteConversation']);
        Route::post('update-online-status', [ChatController::class, 'updateOnlineStatus']);
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
    });
    
    // Product CRUD for sellers (gigs/products)
    Route::get('seller/products', [ProductController::class, 'index']);
    Route::post('seller/products', [ProductController::class, 'store']);
    Route::get('seller/products/{id}', [ProductController::class, 'show']);
    Route::put('seller/products/{id}', [ProductController::class, 'update']);
    Route::delete('seller/products/{id}', [ProductController::class, 'destroy']);
});
