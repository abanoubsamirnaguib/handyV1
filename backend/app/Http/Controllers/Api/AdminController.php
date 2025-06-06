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
}
