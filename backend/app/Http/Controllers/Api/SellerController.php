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
        $seller = Seller::with(['skills', 'user'])->findOrFail($id);
        return new SellerResource($seller);
    }

    public function products($id)
    {
        $seller = Seller::findOrFail($id);
        $products = $seller->products()->with(['images', 'tags', 'category'])->get();
        return ProductResource::collection($products);
    }

    public function search(Request $request)
    {
        $query = Seller::with(['skills', 'user']);
        if ($request->filled('search')) {
            $q = $request->search;
            $query->whereHas('user', function($u) use ($q) {
                $u->where('name', 'like', "%$q%")
                  ->orWhere('email', 'like', "%$q%") ;
            })->orWhere('bio', 'like', "%$q%") ;
        }
        if ($request->filled('location')) {
            $query->where('location', 'like', "%{$request->location}%");
        }
        if ($request->filled('sort')) {
            if ($request->sort === 'rating') $query->orderByDesc('rating');
            if ($request->sort === 'experience') $query->orderByDesc('completed_orders');
        }
        return SellerResource::collection($query->paginate(20));
    }
}
