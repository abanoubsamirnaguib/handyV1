<?php


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
use App\Http\Controllers\Api\MessageCrudController;
use App\Http\Controllers\Api\ConversationCrudController;
use App\Http\Controllers\Api\NotificationCrudController;
use App\Http\Controllers\Api\MessageAttachmentCrudController;
use App\Http\Controllers\Api\ActivityLogCrudController;
use App\Http\Controllers\Api\OrderHistoryCrudController;
use App\Http\Controllers\Api\FileUploadController;
use App\Http\Controllers\Api\SiteSettingController;

Route::prefix('listsellers')->group(function () {
    Route::get('{id}', [SellerController::class, 'show']);
    Route::get('{id}/products', [SellerController::class, 'products']);
});

Route::prefix('Listpoducts')->group(function () {
    Route::get('{id}', [ProductController::class, 'show']);
    Route::get('{id}/reviews', [ProductController::class, 'reviews']);
});

Route::get('listcategories', [CategoryController::class, 'index']);

// Public product and seller search/filter endpoints
Route::get('products/search', [ProductController::class, 'search']);
Route::get('sellers/search', [SellerController::class, 'search']);

// Public order show endpoint
Route::get('orders/{id}', [OrderCrudController::class, 'show']);

// Authentication
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('me', [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);

    // Product CRUD
    Route::apiResource('products', ProductCrudController::class)->except(['show']);
    // Order CRUD
    Route::apiResource('orders', OrderCrudController::class)->except(['show']);
    // Category CRUD
    Route::apiResource('categories', CategoryCrudController::class)->except(['show']);
    // Review CRUD
    Route::apiResource('reviews', ReviewCrudController::class)->except(['show']);
    // Seller CRUD
    Route::apiResource('sellers', SellerCrudController::class)->except(['show']);
    // User CRUD
    Route::apiResource('users', UserCrudController::class)->except(['show']);
    // Cart Item CRUD
    Route::apiResource('cart-items', CartItemCrudController::class)->except(['show']);
    // Wishlist Item CRUD
    Route::apiResource('wishlist-items', WishlistItemCrudController::class)->except(['show']);
    // Message CRUD
    Route::apiResource('messages', MessageCrudController::class)->except(['show']);
    // Conversation CRUD
    Route::apiResource('conversations', ConversationCrudController::class)->except(['show']);
    // Notification CRUD
    Route::apiResource('notifications', NotificationCrudController::class)->except(['show']);
    // Message Attachment CRUD
    Route::apiResource('message-attachments', MessageAttachmentCrudController::class)->except(['show']);
    // Activity Log CRUD
    Route::apiResource('activity-logs', ActivityLogCrudController::class)->except(['show']);
    // Order History CRUD
    Route::apiResource('order-history', OrderHistoryCrudController::class)->except(['show']);

    // File Upload
    Route::post('upload', [FileUploadController::class, 'upload']);

    // Site Settings
    Route::get('settings', [SiteSettingController::class, 'index']);
    Route::post('settings', [SiteSettingController::class, 'update']);
});

Route::get('test', function () {
    return 'API route works';
});
