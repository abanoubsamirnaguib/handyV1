<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ReviewResource;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{
    /**
     * Get seller services (products with type 'gig')
     */
    public function getSellerServices($userId)
    {
        // First find the seller record for this user
        $seller = \App\Models\Seller::where('user_id', $userId)->first();
        
        if (!$seller) {
            return response()->json([]);
        }
        
        // Get active gig services for this seller
        $services = Product::where('seller_id', $seller->id)
            ->where('type', 'gig')
            ->where('status', 'active')
            ->with(['category', 'images'])
            ->get();

        return ProductResource::collection($services);
    }

    /**
     * Get all products for the authenticated seller.
     */
    public function index(Request $request)
    {
        $query = Product::with(['images', 'tags', 'category'])
            ->where('seller_id', Auth::user()->seller_id);
        
        // Optional filtering
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        
        // Order by most recent first
        $query->orderBy('created_at', 'desc');
        
        $products = $query->paginate($request->limit ?? 50);
        
        return ProductResource::collection($products);
    }

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

    /**
     * Store a newly created product/gig.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'delivery_time' => 'nullable|string|max:50',
            'type' => 'required|in:gig,product',
            'tags' => 'array',
            'tags.*' => 'string|max:50',
            'images' => 'array',
            'images.*' => 'image|max:2048',
        ]);
        $product = new Product($validated);
        $product->seller_id = Auth::user()->seller_id;
        $product->status = 'pending_review';
        $product->save();
        
        // Save tags
        if ($request->has('tags')) {
            foreach ($request->tags as $tag) {
                $product->tags()->create(['tag_name' => $tag]);
            }
        }
        
        // Save images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $img) {
                $path = $img->store('products/'. $product->id , 'public');
                $product->images()->create(['image_url' => $path]);
            }
        }

        // إرسال إشعار للبائع بأن المنتج قيد المراجعة
        $seller = \App\Models\Seller::find(Auth::user()->seller_id);
        if ($seller && $seller->user_id) {
            \App\Services\NotificationService::productPendingReview(
                userId: $seller->user_id,
                productTitle: $product->title,
                productType: $product->type
            );
        }

        return response()->json([
            'message' => 'Product created successfully', 
            'product' => $product->load(['images', 'tags']),
            'notification' => 'تم إضافة المنتج بنجاح وهو الآن قيد المراجعة. سيتم تفعيله خلال 48-72 ساعة.'
        ], 201);
    }

    /**
     * Update the specified product/gig.
     */
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        if ($product->seller_id !== Auth::user()->seller_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'price' => 'sometimes|required|numeric|min:0',
            'category_id' => 'sometimes|required|exists:categories,id',
            'delivery_time' => 'nullable|string|max:50',
            'type' => 'sometimes|required|in:gig,product',
            'tags' => 'array',
            'tags.*' => 'string|max:50',
            'images' => 'array',
            'images.*' => 'image|max:2048',
            'existing_images' => 'array',
            'existing_images.*' => 'string',
        ]);
        $product->update($validated);
        // Update tags
        if ($request->has('tags')) {
            $product->tags()->delete();
            foreach ($request->tags as $tag) {
                $product->tags()->create(['tag_name' => $tag]);
            }
        }
        $hasNewImages = $request->hasFile('images');
        $hasExistingImages = $request->has('existing_images') && is_array($request->existing_images);

        if ($hasNewImages || $hasExistingImages) {
            if ($hasExistingImages) {
            $existingImages = $product->images()->get();
            $keepImagePaths = $request->existing_images;
            foreach ($existingImages as $image) {
                $found = false;
                foreach ($keepImagePaths as $keepPath) {
                $imagePath = $image->image_url;
                $keepPath = trim($keepPath, '/');
                if (str_contains($imagePath, $keepPath) || $imagePath === $keepPath) {
                    $found = true;
                    break;
                }
                }
                if (!$found) {
                if (Storage::disk('public')->exists($image->image_url)) {
                    Storage::disk('public')->delete($image->image_url);
                }
                $image->delete();
                }
            }
            } else if ($hasNewImages) {
            foreach ($product->images as $image) {
                if ($image->image_url && Storage::disk('public')->exists($image->image_url)) {
                Storage::disk('public')->delete($image->image_url);
                }
            }
            $product->images()->delete();
            }
            if ($hasNewImages) {
            foreach ($request->file('images') as $img) {
                $path = $img->store('products/' . $product->id, 'public');
                $product->images()->create(['image_url' => $path]);
            }
            }
        }
        return response()->json(['message' => 'Product updated', 'product' => $product->load(['images', 'tags'])]);
    }

    /**
     * Remove the specified product/gig.
     */
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        if ($product->seller_id !== Auth::user()->seller_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Delete images from storage (stored in public/products/{product_id})
        foreach ($product->images as $image) {
            if ($image->image_url && Storage::disk('public')->exists($image->image_url)) {
            Storage::disk('public')->delete($image->image_url);
            }
        }
        // Optionally, remove the entire product directory if empty
        $productDir = 'products/' . $product->id;
        if (Storage::disk('public')->exists($productDir) && empty(Storage::disk('public')->files($productDir))) {
            Storage::disk('public')->deleteDirectory($productDir);
        }

        $product->images()->delete();
        $product->tags()->delete();
        $product->delete();

        return response()->json(['message' => 'Product deleted']);
    }
}
