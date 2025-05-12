<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Http\Resources\ProductResource;
use App\Http\Requests\ProductRequest;

class ProductCrudController extends Controller
{
    public function index()
    {
        return ProductResource::collection(Product::with(['images', 'tags', 'category', 'seller'])->get());
    }
    public function store(ProductRequest $request)
    {
        $validated = $request->validated();
        $product = Product::create($validated);
        $product->load(['images', 'tags', 'category', 'seller']);
        return new ProductResource($product);
    }
    public function update(ProductRequest $request, $id)
    {
        $product = Product::findOrFail($id);
        $product->update($request->validated());
        $product->load(['images', 'tags', 'category', 'seller']);
        return new ProductResource($product);
    }
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
