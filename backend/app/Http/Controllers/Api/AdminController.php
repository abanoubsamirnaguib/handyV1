<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Product;
use App\Models\Seller;
use App\Models\Order;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Http\Resources\UserResource;
use App\Http\Resources\ProductResource;
use App\Http\Resources\SellerResource;
use App\Http\Resources\OrderResource;


class AdminController extends Controller
{    public function dashboard()
    {
        $stats = [
            'total_users' => User::count(),
            'total_sellers' => Seller::count(),
            'total_products' => Product::count(),
            'total_orders' => Order::count(),
            'active_users' => User::where('status', 'active')->count(),
            'pending_sellers' => User::whereHas('seller')->where('status', 'pending')->count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
        ];

        return response()->json($stats);
    }

    public function users(Request $request)
    {
        $query = User::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(20);
        
        return UserResource::collection($users);
    }    public function sellers(Request $request)
    {
        $query = Seller::with(['user', 'skills']);

        if ($request->filled('search')) {
            $search = $request->search;            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('bio', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");            });
        }

        if ($request->filled('status')) {
            $query->whereHas('user', function($q) use ($request) {
                $q->where('status', $request->status);
            });
        }

        $perPage = $request->get('per_page', 20);
        $sellers = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        return SellerResource::collection($sellers);
    }

    public function products(Request $request)
    {
        $query = Product::with(['seller.user', 'category']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }        if ($request->filled('featured')) {
            $query->where('featured', $request->featured === 'true');
        }

        $perPage = $request->get('per_page', 20);
        $products = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        return ProductResource::collection($products);
    }

    public function updateUserStatus(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'required|in:active,suspended,inactive'
        ]);

        $user->update($validated);

        return new UserResource($user);
    }    public function updateSellerStatus(Request $request, $id)
    {
        $seller = Seller::with('user')->findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'required|in:active,pending,suspended,rejected'
        ]);

        // Update the user's status instead of seller's status
        $seller->user->update(['status' => $validated['status']]);

        return new SellerResource($seller->load('user'));
    }

    public function toggleProductFeatured(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        
        $product->update([
            'featured' => !$product->featured
        ]);

        return new ProductResource($product);
    }

    public function deleteProduct($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }

    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    public function recentActivity()
    {
        $recentUsers = User::orderBy('created_at', 'desc')->take(5)->get(['id', 'name', 'email', 'created_at']);
        $recentProducts = Product::with('seller.user')->orderBy('created_at', 'desc')->take(5)->get();
        $recentOrders = Order::with(['user', 'seller'])->orderBy('created_at', 'desc')->take(5)->get();

        return response()->json([
            'recent_users' => $recentUsers,
            'recent_products' => ProductResource::collection($recentProducts),
            'recent_orders' => $recentOrders,
        ]);
    }
    public function updateProductStatus(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $validated = $request->validate([
            'status' => 'required|in:active,inactive,pending_review,rejected'
        ]);
        $product->update(['status' => $validated['status']]);

        // إذا تم تفعيل المنتج، نرسل إشعارًا للبائع
        if ($validated['status'] === 'active' && $product->seller && $product->seller->user_id) {
            \App\Services\NotificationService::productApproved(
                userId: $product->seller->user_id,
                productTitle: $product->title,
                productType: $product->type
            );
        }

        return new ProductResource($product);
    }

    public function getOrders(Request $request)
    {
        $query = Order::with(['user', 'seller.user', 'items.product', 'adminApprover', 'deliveryPerson', 'history.actionUser', 'city']);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%")
                  ->orWhere('id', 'like', "%{$search}%")
                  ->orWhereHas('user', function($subQ) use ($search) {
                      $subQ->where('name', 'like', "%{$search}%")
                           ->orWhere('email', 'like', "%{$search}%");
                  })
                  ->orWhereHas('seller.user', function($subQ) use ($search) {
                      $subQ->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        // Filter by payment status
        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }
        // Filter by payment proof
        if ($request->filled('payment_proof')) {
            if ($request->payment_proof === 'with_proof') {
                $query->whereNotNull('payment_proof');
            } elseif ($request->payment_proof === 'without_proof') {
                $query->whereNull('payment_proof');
            } elseif ($request->payment_proof === 'cash_on_delivery') {
                $query->where('payment_method',  'cash_on_delivery');
            }
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $perPage = $request->get('per_page', 20);
        $orders = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        return OrderResource::collection($orders);
    }

    public function getPendingOrders(Request $request)
    {
        $query = Order::with(['user', 'seller.user', 'items.product', 'adminApprover'])
            ->where('status', 'pending_admin_approval');

        $perPage = $request->get('per_page', 20);
        $orders = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        return OrderResource::collection($orders);
    }

    public function approveOrder(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        
        // استخدام الطريقة الجديدة من النموذج للتحقق من إمكانية الموافقة
        if (!$order->canBeApprovedByAdmin()) {
            return response()->json([
                'message' => 'لا يمكن الموافقة على هذا الطلب في الوقت الحالي'
            ], 400);
        }

        // استخدام الطريقة الجديدة من النموذج للموافقة
        $order->approveByAdmin(auth()->id(), $request->input('notes', ''));

        return new OrderResource($order->fresh()->load(['user', 'seller.user', 'items.product', 'adminApprover']));
    }

    /**
     * Get statistics for About Us page (public endpoint)
     */
    public function getAboutUsStats()
    {
        $stats = [
            'trusted_artisans' => Seller::whereHas('user', function($query) {
                $query->where('status', 'active');
            })->count(),
            'handmade_products' => Product::where('status', 'active')->count(),
            'satisfied_customers' => User::where('status', 'active')->where('role', 'customer')->count(),
            'diverse_categories' => Category::count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
