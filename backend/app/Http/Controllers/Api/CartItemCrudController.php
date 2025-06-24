<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartItemCrudController extends Controller
{
    public function index() { return CartItem::with(['user', 'product'])->get(); }
    public function store(Request $request) {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);
        $item = CartItem::create($validated);
        return response()->json($item, 201);
    }
    public function update(Request $request, $id) {
        $item = CartItem::findOrFail($id);
        $item->update($request->all());
        return response()->json($item);
    }
    public function destroy($id) {
        $item = CartItem::findOrFail($id);
        $item->delete();
        return response()->json(['message' => 'تم حذف العنصر من العربة']);
    }
    
    // جلب عربة المستخدم الحالي
    public function getUserCart()
    {
        $cartItems = CartItem::with(['product.images', 'product.seller'])
            ->where('user_id', Auth::id())
            ->get();
            
        $total = $cartItems->sum(function($item) {
            return $item->product->price * $item->quantity;
        });
        
        return response()->json([
            'items' => $cartItems,
            'total' => $total,
            'count' => $cartItems->count()
        ]);
    }
    
    // إضافة منتج للعربة
    public function addToCart(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1|max:10'
        ]);
        
        $product = Product::findOrFail($validated['product_id']);
        
        // التحقق من أن المنتج متاح
        if ($product->status !== 'active') {
            return response()->json(['message' => 'هذا المنتج غير متاح حالياً'], 400);
        }
        
        // البحث عن العنصر إذا كان موجود في العربة
        $existingItem = CartItem::where([
            'user_id' => Auth::id(),
            'product_id' => $validated['product_id']
        ])->first();
        
        if ($existingItem) {
            // تحديث الكمية
            $newQuantity = $existingItem->quantity + $validated['quantity'];
            $existingItem->update([
                'quantity' => min($newQuantity, 10), // حد أقصى 10 قطع
                'updated_at' => now()
            ]);
            $item = $existingItem;
        } else {
            // إنشاء عنصر جديد
            $item = CartItem::create([
                'user_id' => Auth::id(),
                'product_id' => $validated['product_id'],
                'quantity' => $validated['quantity'],
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
        
        // إرجاع العنصر مع معلومات المنتج
        $item->load(['product.images']);
        
        return response()->json([
            'message' => 'تم إضافة المنتج للعربة بنجاح',
            'item' => $item
        ]);
    }
    
    // تفريغ العربة
    public function clearCart()
    {
        $deletedCount = CartItem::where('user_id', Auth::id())->delete();
        
        return response()->json([
            'message' => 'تم تفريغ العربة بنجاح',
            'deleted_items' => $deletedCount
        ]);
    }
    
    // تحديث كمية منتج في العربة
    public function updateQuantity(Request $request, $id)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1|max:10'
        ]);
        
        $item = CartItem::where([
            'id' => $id,
            'user_id' => Auth::id()
        ])->firstOrFail();
        
        $item->update([
            'quantity' => $validated['quantity'],
            'updated_at' => now()
        ]);
        
        return response()->json([
            'message' => 'تم تحديث الكمية بنجاح',
            'item' => $item
        ]);
    }
    
    // حذف منتج معين من العربة
    public function removeFromCart($productId)
    {
        $deleted = CartItem::where([
            'user_id' => Auth::id(),
            'product_id' => $productId
        ])->delete();
        
        if ($deleted) {
            return response()->json(['message' => 'تم حذف المنتج من العربة']);
        } else {
            return response()->json(['message' => 'المنتج غير موجود في العربة'], 404);
        }
    }
    
    // الحصول على عدد العناصر في العربة
    public function getCartCount()
    {
        $count = CartItem::where('user_id', Auth::id())->sum('quantity');
        
        return response()->json(['count' => $count]);
    }
}
