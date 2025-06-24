<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Product;
use App\Models\Seller;
use App\Models\Order;
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
        return new ProductResource($product);
    }

    public function getOrders(Request $request)
    {
        $query = Order::with(['user', 'seller.user', 'items.product', 'adminApprover', 'deliveryPerson']);

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
        
        if ($order->status !== 'pending_admin_approval') {
            return response()->json([
                'message' => 'Order cannot be approved in current status'
            ], 400);
        }

        $order->update([
            'status' => 'admin_approved',
            'payment_status' => 'paid',
            'admin_approved_at' => now(),
            'admin_approved_by' => auth()->id(),
            'admin_notes' => $request->input('notes', '')
        ]);

        // Create order history entry
        $order->history()->create([
            'status' => 'admin_approved',
            'notes' => $request->input('notes', ''),
            'changed_by' => auth()->id(),
            'changed_at' => now()
        ]);

        return new OrderResource($order->load(['user', 'seller.user', 'items.product', 'adminApprover']));
    }
}
