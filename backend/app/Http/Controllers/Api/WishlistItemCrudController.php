<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WishlistItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class WishlistItemCrudController extends Controller
{
    /**
     * Get all wishlist items (Admin only)
     */
    public function index() 
    { 
        return WishlistItem::with(['user', 'product'])->get(); 
    }

    /**
     * Get current user's wishlist
     */
    public function getUserWishlist()
    {
        $userId = Auth::id();
        $wishlistItems = WishlistItem::getUserWishlist($userId);
        $count = WishlistItem::getWishlistCount($userId);
        
        return response()->json([
            'items' => $wishlistItems,
            'count' => $count,
            'message' => 'تم جلب قائمة الأمنيات بنجاح'
        ]);
    }

    /**
     * Add product to wishlist
     */
    public function store(Request $request) 
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $userId = Auth::id();
        $result = WishlistItem::addToWishlist($userId, $validated['product_id']);

        $statusCode = $result['success'] ? 201 : 400;
        
        return response()->json($result, $statusCode);
    }

    /**
     * Add product to current user's wishlist
     */
    public function addToWishlist(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $userId = Auth::id();
        $result = WishlistItem::addToWishlist($userId, $validated['product_id']);

        $statusCode = $result['success'] ? 201 : 400;
        
        return response()->json($result, $statusCode);
    }

    /**
     * Remove product from current user's wishlist by product ID
     */
    public function removeFromWishlist($productId)
    {
        // Validate product exists
        $product = Product::find($productId);
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'المنتج غير موجود',
                'action' => 'product_not_found'
            ], 404);
        }

        $userId = Auth::id();
        $result = WishlistItem::removeFromWishlist($userId, $productId);

        $statusCode = $result['success'] ? 200 : 404;
        
        return response()->json($result, $statusCode);
    }

    /**
     * Toggle product in current user's wishlist
     */
    public function toggleWishlist(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $userId = Auth::id();
        $result = WishlistItem::toggleWishlist($userId, $validated['product_id']);

        $statusCode = $result['success'] ? 200 : 400;
        
        return response()->json($result, $statusCode);
    }

    /**
     * Check if product is in current user's wishlist
     */
    public function checkWishlistStatus($productId)
    {
        // Validate product exists
        $product = Product::find($productId);
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'المنتج غير موجود',
                'in_wishlist' => false
            ], 404);
        }

        $userId = Auth::id();
        $inWishlist = WishlistItem::isInWishlist($userId, $productId);
        
        return response()->json([
            'success' => true,
            'in_wishlist' => $inWishlist,
            'product_id' => $productId,
            'message' => $inWishlist ? 'المنتج موجود في قائمة الأمنيات' : 'المنتج غير موجود في قائمة الأمنيات'
        ]);
    }

    /**
     * Get wishlist count for current user
     */
    public function getWishlistCount()
    {
        $userId = Auth::id();
        $count = WishlistItem::getWishlistCount($userId);
        
        return response()->json([
            'success' => true,
            'count' => $count,
            'message' => 'تم جلب عدد عناصر قائمة الأمنيات'
        ]);
    }

    /**
     * Clear all items from current user's wishlist
     */
    public function clearWishlist()
    {
        $userId = Auth::id();
        $deletedCount = WishlistItem::where('user_id', $userId)->delete();
        
        return response()->json([
            'success' => true,
            'deleted_items' => $deletedCount,
            'message' => 'تم تفريغ قائمة الأمنيات بنجاح'
        ]);
    }

    /**
     * Update wishlist item (Admin function)
     */
    public function update(Request $request, $id) 
    {
        $item = WishlistItem::findOrFail($id);
        $item->update($request->all());
        return response()->json([
            'success' => true,
            'item' => $item,
            'message' => 'تم تحديث عنصر قائمة الأمنيات'
        ]);
    }

    /**
     * Delete wishlist item by ID (Admin function)
     */
    public function destroy($id) 
    {
        $item = WishlistItem::findOrFail($id);
        $item->delete();
        return response()->json([
            'success' => true,
            'message' => 'تم حذف العنصر من قائمة الأمنيات'
        ]);
    }

    /**
     * Clean up inactive products from all wishlists (Admin function)
     */
    public function cleanupInactive()
    {
        $deletedCount = WishlistItem::cleanupInactiveProducts();
        
        return response()->json([
            'success' => true,
            'deleted_items' => $deletedCount,
            'message' => "تم حذف {$deletedCount} عنصر من المنتجات غير النشطة"
        ]);
    }

    /**
     * Get wishlist statistics (Admin function)
     */
    public function getStatistics()
    {
        $totalItems = WishlistItem::count();
        $totalUsers = WishlistItem::distinct('user_id')->count();
        $popularProducts = WishlistItem::with('product')
            ->select('product_id', \DB::raw('count(*) as wishlist_count'))
            ->groupBy('product_id')
            ->orderBy('wishlist_count', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'statistics' => [
                'total_items' => $totalItems,
                'total_users_with_wishlist' => $totalUsers,
                'popular_products' => $popularProducts
            ],
            'message' => 'تم جلب إحصائيات قائمة الأمنيات'
        ]);
    }
}
