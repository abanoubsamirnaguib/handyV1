<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Seller;
use Illuminate\Http\Request;
use App\Http\Resources\SellerResource;
use App\Http\Resources\ProductResource;

class SellerController extends Controller
{
    public function show($id)
    {
        $seller = Seller::with(['skills', 'user' , 'products'])->findOrFail($id);
        return new SellerResource($seller);
    }

    public function products($id)
    {
        $seller = Seller::findOrFail($id);
        $products = $seller->products()->active()->with(['images', 'tags', 'category'])->get();
        return ProductResource::collection($products);
    }

    public function search(Request $request)
    {
        $query = Seller::with(['skills', 'user']);
        if ($request->filled('search')) {
            $q = $request->search;
            $query->whereHas('user', function($u) use ($q) {
                $u->where('name', 'like', "%$q%")
                  ->orWhere('email', 'like', "%$q%")
                  ->orWhere('bio', 'like', "%$q%");
            });
        }
        if ($request->filled('location')) {
            $query->whereHas('user', function($u) use ($request) {
                $u->where('location', 'like', "%{$request->location}%");
            });
        }
        if ($request->filled('sort')) {
            if ($request->sort === 'rating') $query->orderByDesc('rating');
            if ($request->sort === 'experience') $query->orderByDesc('completed_orders');
        }
        return SellerResource::collection($query->paginate(20));
    }

    public function topSellers(Request $request)
    {
        // Get top 3 sellers by number of products , rating , only active users
        $sellers = Seller::with(['skills', 'user', 'products'])
            ->whereHas('user', function($q) {
                $q->where('status', 'active');
            })
            ->whereHas('products', function($q) {
                $q->where('status', 'active');
            })
            ->withCount(['products' => function($q) {
                $q->where('status', 'active');
            }])
            ->orderByDesc('products_count')
            ->orderByDesc('rating')
            ->limit(3)
            ->get();

        // Return only the fields needed for the home page
        $result = $sellers->map(function($seller) {
            return [
                'id' => $seller->id,
                'name' => $seller->user->name ?? '',
                'avatar' => $seller->user->avatar_url ?? '',
                'skills' => $seller->skills->pluck('skill_name')->toArray(),
                'rating' => $seller->rating ?? 0,
                'reviewCount' => $seller->review_count ?? 0,
                'productsCount' => $seller->products_count ?? 0,
            ];
        });
        return response()->json(['data' => $result]);
    }
}
