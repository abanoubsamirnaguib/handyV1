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
        $product = Product::with(['images', 'tags', 'category', 'seller.user'])->findOrFail($id);
        return new ProductResource($product);
    }

    public function reviews($id)
    {
        $product = Product::findOrFail($id);
        $reviews = $product->reviews()->with('user')->get();
        return ReviewResource::collection($reviews);
    }

    public function TopProducts(Request $request)
    {
        $query = Product::with(['images', 'tags', 'category', 'seller']);

        if ($request->filled('featured')) {
            $query->where('featured', (bool)$request->featured);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('sort')) {
            if ($request->sort === 'price_asc') $query->orderBy('price');
            if ($request->sort === 'price_desc') $query->orderByDesc('price');
            if ($request->sort === 'rating') $query->orderByDesc('rating');
        }
        return ProductResource::collection($query->paginate($request->limit ?? 10));
    }

    public function relatedProducts($id)
    {
        $product = Product::with(['category', 'seller'])->findOrFail($id);
        $query = Product::with(['images', 'tags', 'category'])
            ->where('id', '!=', $id)
            ->where(function($q) use ($product) {
                $q->where('seller_id', $product->seller_id)
                  ->where('category_id', $product->category_id);
                // Optionally, also include products from the same category
                // $q->orWhere('category_id', $product->category_id);
            })
            ->where('status', 'active')
            ->limit(6);
        $related = $query->get();
        return ProductResource::collection($related);
    }
}
