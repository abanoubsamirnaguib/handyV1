<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ReviewResource;

class ProductController extends Controller
{
    public function show($id)
    {
        $product = Product::with(['images', 'tags', 'category', 'seller'])->findOrFail($id);
        return new ProductResource($product);
    }

    public function reviews($id)
    {
        $product = Product::findOrFail($id);
        $reviews = $product->reviews()->with('user')->get();
        return ReviewResource::collection($reviews);
    }

    public function search(Request $request)
    {
        $query = Product::with(['images', 'tags', 'category', 'seller']);
        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }
        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(function($sub) use ($q) {
                $sub->where('title', 'like', "%$q%")
                    ->orWhere('description', 'like', "%$q%")
                    ->orWhereHas('tags', function($t) use ($q) {
                        $t->where('tag_name', 'like', "%$q%") ;
                    });
            });
        }
        if ($request->filled('sort')) {
            if ($request->sort === 'price_asc') $query->orderBy('price');
            if ($request->sort === 'price_desc') $query->orderByDesc('price');
            if ($request->sort === 'rating') $query->orderByDesc('rating');
        }
        return ProductResource::collection($query->paginate(20));
    }
}
