<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Seller;
use App\Models\Order;
use App\Models\WishlistItem;
use App\Http\Resources\ProductResource;
use App\Http\Resources\SellerResource;
use Illuminate\Support\Facades\Auth;

class ExploreController extends Controller
{
    // Return only the needed fields for products
    public function products(Request $request)
    {
        $query = Product::query();
        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(function($sub) use ($q) {
                $sub->where('title', 'like', "%$q%")
                    ->orWhere('description', 'like', "%$q%") ;
            });
        }
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }
        if ($request->filled('min_rating')) {
            $query->where('rating', '>=', $request->min_rating);
        }
        if ($request->filled('sort')) {
            if ($request->sort === 'price_low') $query->orderBy('price');
            if ($request->sort === 'price_high') $query->orderByDesc('price');
            if ($request->sort === 'rating') $query->orderByDesc('rating');
            if ($request->sort === 'newest') $query->orderByDesc('created_at');
            if ($request->sort === 'oldest') $query->orderBy('created_at');
        } else {
            // Default sorting by oldest when no sort specified
            $query->orderBy('created_at');
        }
        $query->where('status', 'active'); // Only active products
        
        // Pagination support
        $perPage = $request->input('per_page', 40); // Default 40 items per page
        $page = $request->input('page', 1);
        
        $productsQuery = $query->select(['id','title','description','price','category_id','seller_id','rating','review_count','featured','status','type','created_at'])
            ->with(['images:id,product_id,image_url', 'category:id,name', 'seller:id'])
            ->withCount('orderItems as orders_count');
        
        // Get total count before pagination
        $total = $productsQuery->count();
        
        // Apply pagination
        $products = $productsQuery->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();
        
        // Get user's wishlist status for all products if user is authenticated
        $wishlistStatuses = [];
        
        if (Auth::check()) {
            $userId = Auth::id();
            $productIds = $products->pluck('id')->toArray();
            
            $wishlistItems = WishlistItem::where('user_id', $userId)
                ->whereIn('product_id', $productIds)
                ->pluck('product_id')
                ->toArray();
            
            // Create a lookup array for quick access
            $wishlistStatuses = array_fill_keys($wishlistItems, true);
        }
        
        return response()->json([
            'data' => $products->map(function($p) use ($wishlistStatuses) {
                return [
                    'id' => $p->id,
                    'title' => $p->title,
                    'description' => $p->description,
                    'price' => $p->price,
                    'category_id' => $p->category_id,
                    'category' => $p->category ? ['id'=>$p->category->id, 'name'=>$p->category->name] : null,
                    'sellerId' => $p->seller_id,
                    'images' => $p->images ? $p->images->map(fn($img) => ['url'=>$img->image_url])->values() : [],
                    'rating' => $p->rating,
                    'reviewCount' => $p->review_count,
                    'ordersCount' => $p->orders_count ?? 0,
                    'featured' => $p->featured,
                    'status' => $p->status,
                    'type' => $p->type ?? 'product', // Default to 'product' if type is null
                    'in_wishlist' => isset($wishlistStatuses[$p->id]) ? true : false,
                ];
            }),
            'pagination' => [
                'current_page' => (int) $page,
                'per_page' => (int) $perPage,
                'total' => $total,
                'last_page' => (int) ceil($total / $perPage),
                'has_more' => ($page * $perPage) < $total,
            ]
        ]);
    }

    // Return only the needed fields for sellers
    public function sellers(Request $request)
    {
        $query = Seller::with('user');
        if ($request->filled('search')) {
            $q = $request->search;
            $query->whereHas('user', function($u) use ($q) {
                $u->where('name', 'like', "%$q%")
                  ->orWhere('email', 'like', "%$q%") ;
            });
        }
        if ($request->filled('category')) {
            $categoryId = $request->category;
            $query->whereHas('products', function($q) use ($categoryId) {
                $q->where('category_id', $categoryId);
            });
        }
        if ($request->filled('min_rating')) {
            $query->where('rating', '>=', $request->min_rating);
        }
        // Add sort support: oldest (default), rating, experience, newest
        if ($request->filled('sort')) {
            $sort = $request->sort;
            if ($sort === 'rating') {
                $query->orderByDesc('rating');
            } elseif ($sort === 'experience') {
                $query->orderByDesc('completed_orders');
            } elseif ($sort === 'newest') {
                $query->orderByDesc('member_since');
            } elseif ($sort === 'oldest') {
                $query->orderBy('member_since');
            }
        } else {
            // Default sorting by oldest when no sort specified
            $query->orderBy('member_since');
        }
        // Only active sellers
        $query->whereHas('user', function($q) {
            $q->where('status', 'active');
        });
        
        // Pagination support
        $perPage = $request->input('per_page', 20); // Default 20 sellers per page
        $page = $request->input('page', 1);
        
        $sellersQuery = $query->select(['id','user_id','rating','review_count','completed_orders','member_since']);
        
        // Get total count before pagination
        $total = $sellersQuery->count();
        
        // Apply pagination
        $sellers = $sellersQuery->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();
        
        // Get total orders count for each seller
        $sellerIds = $sellers->pluck('id')->toArray();
        $ordersCount = Order::whereIn('seller_id', $sellerIds)
            ->selectRaw('seller_id, COUNT(*) as total_orders')
            ->groupBy('seller_id')
            ->pluck('total_orders', 'seller_id')
            ->toArray();
        
        return response()->json([
            'data' => $sellers->map(function($s) use ($ordersCount) {
                return [
                    'id' => $s->id,
                    'name' => $s->user->name ?? '',
                    'avatar' => $s->user->avatar_url ?? '',
                    'coverImage' => $s->user->cover_image_url ?? null,
                    'skills' => $s->skills ? $s->skills->pluck('skill_name') : [],
                    'rating' => $s->rating,
                    'reviewCount' => $s->review_count,
                    'bio' => $s->user->bio ?? '',
                    'location' => $s->user->location ?? '',
                    'memberSince' => $s->member_since,
                    'completedOrders' => $s->completed_orders,
                    'ordersCount' => $ordersCount[$s->id] ?? 0,
                ];
            }),
            'pagination' => [
                'current_page' => (int) $page,
                'per_page' => (int) $perPage,
                'total' => $total,
                'last_page' => (int) ceil($total / $perPage),
                'has_more' => ($page * $perPage) < $total,
            ]
        ]);
    }
}
