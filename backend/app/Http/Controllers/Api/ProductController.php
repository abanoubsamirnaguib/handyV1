<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ReviewResource;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use App\Services\ImageService;

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
        // Check if user is suspended
        if (Auth::user()->status === 'suspended') {
            return response()->json([
                'message' => 'لا يمكنك إضافة منتجات لأن حسابك معلق. يرجى التواصل مع الإدارة.'
            ], 403);
        }
        
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'delivery_time' => 'nullable|string|max:50',
            'type' => 'required|in:gig,product',
            'quantity' => $request->type === 'product' ? 'required|integer|min:0' : 'nullable',
            'tags' => 'array',
            'tags.*' => 'string|max:50',
            'images' => 'array',
            'images.*' => 'image|mimes:jpeg,jpg,png,gif,webp|max:5120',
        ]);
        
        // If type is product and no quantity is set, default to 0 and set status inactive
        if ($validated['type'] === 'product' && (!isset($validated['quantity']) || $validated['quantity'] === null)) {
            $validated['quantity'] = 0;
        }
        
        // If type is gig, quantity should be null
        if ($validated['type'] === 'gig') {
            $validated['quantity'] = null;
        }
        $product = new Product($validated);
        $product->seller_id = Auth::user()->seller_id;
        $product->status = 'pending_review';
        $product->save();
        
        // Save tags
        if ($request->has('tags')) {
            foreach ($request->tags as $tag) {
                $tag = trim($tag);
                if (!empty($tag)) {
                    $product->tags()->create(['tag_name' => $tag]);
                }
            }
        }
        
        // Save images - Convert to WebP format
        if ($request->hasFile('images')) {
            $directory = 'products/' . $product->id;
            $webpPaths = ImageService::convertMultipleToWebP(
                $request->file('images'),
                $directory,
                100,  // WebP quality (0-100)
                1920 // Max width in pixels
            );
            
            foreach ($webpPaths as $path) {
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

        // إشعار المشرف بمنتج جديد يحتاج مراجعة
        try {
            $productTypeText = $product->type === 'gig' ? 'حرفة' : 'منتج';
            \App\Services\NotificationService::notifyAdmin(
                'product_pending',
                "{$productTypeText} جديد يحتاج مراجعة: {$product->title}",
                "/admin/products/{$product->id}"
            );
        } catch (\Exception $e) {
            \Log::warning('Failed to send admin notification for pending product', [
                'product_id' => $product->id,
                'error' => $e->getMessage()
            ]);
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
            'quantity' => ($request->type ?? $product->type) === 'product' ? 'required|integer|min:0' : 'nullable',
            'tags' => 'array',
            'tags.*' => 'string|max:50',
            'images' => 'array',
            'images.*' => 'image|mimes:jpeg,jpg,png,gif,webp|max:5120',
            'existing_images' => 'array',
            'existing_images.*' => 'string',
        ]);
        
        // If type is being changed or updated
        $productType = $validated['type'] ?? $product->type;
        
        // If type is gig, quantity should be null
        if ($productType === 'gig') {
            $validated['quantity'] = null;
        }
        
        // If quantity is being updated and reaches 0 for products, set status to inactive
        if ($productType === 'product' && isset($validated['quantity']) && $validated['quantity'] == 0) {
            $validated['status'] = 'inactive';
        }
        
        // Store old status to check if product was active before edit
        $oldStatus = $product->status;
        
        // Set status to pending_review when product is edited
        $validated['status'] = 'pending_review';
        // Clear rejection reason when re-submitting for review
        $validated['rejection_reason'] = null;
        
        $product->update($validated);
        // Update tags
        if ($request->has('tags')) {
            $product->tags()->delete();
            foreach ($request->tags as $tag) {
                $tag = trim($tag);
                if (!empty($tag)) {
                    $product->tags()->create(['tag_name' => $tag]);
                }
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
                // Delete image using ImageService
                ImageService::deleteImage($image->image_url);
                $image->delete();
                }
            }
            } else if ($hasNewImages) {
            // Delete all existing images using ImageService
            foreach ($product->images as $image) {
                ImageService::deleteImage($image->image_url);
            }
            $product->images()->delete();
            }
            if ($hasNewImages) {
            // Convert new images to WebP format
            $directory = 'products/' . $product->id;
            $webpPaths = ImageService::convertMultipleToWebP(
                $request->file('images'),
                $directory,
                100,  // WebP quality (0-100)
                1920 // Max width in pixels
            );
            
            foreach ($webpPaths as $path) {
                $product->images()->create(['image_url' => $path]);
            }
            }
        }
        
        // Send notification to seller that product is pending review again
        $seller = \App\Models\Seller::find(Auth::user()->seller_id);
        if ($seller && $seller->user_id) {
            \App\Services\NotificationService::productPendingReview(
                userId: $seller->user_id,
                productTitle: $product->title,
                productType: $product->type
            );
        }
        
        // Notify admin about edited product needing review
        try {
            $productTypeText = $product->type === 'gig' ? 'حرفة' : 'منتج';
            $statusText = $oldStatus === 'active' ? 'معدل' : 'محدّث';
            \App\Services\NotificationService::notifyAdmin(
                'product_pending',
                "{$productTypeText} {$statusText} يحتاج مراجعة: {$product->title}",
                "/admin/products"
            );
        } catch (\Exception $e) {
            \Log::warning('Failed to send admin notification for edited product', [
                'product_id' => $product->id,
                'error' => $e->getMessage()
            ]);
        }
        
        return response()->json([
            'message' => 'Product updated successfully', 
            'product' => $product->load(['images', 'tags']),
            'notification' => 'تم تحديث المنتج بنجاح وهو الآن قيد المراجعة. سيتم تفعيله خلال 48-72 ساعة.'
        ]);
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

        // Delete images from storage using ImageService
        foreach ($product->images as $image) {
            ImageService::deleteImage($image->image_url);
        }
        
        // Remove the entire product directory
        $productDir = 'products/' . $product->id;
        ImageService::deleteDirectory($productDir);

        $product->images()->delete();
        $product->tags()->delete();
        $product->delete();

        return response()->json(['message' => 'Product deleted']);
    }

    /**
     * Toggle product status between active and inactive.
     * Only products that were previously approved (had status 'active') can be toggled.
     */
    public function toggleStatus($id)
    {
        $product = Product::findOrFail($id);
        
        // Verify ownership
        if ($product->seller_id !== Auth::user()->seller_id) {
            return response()->json([
                'message' => 'غير مصرح لك بتعديل هذا المنتج.'
            ], 403);
        }

        // Can only toggle products that are either active or inactive
        // Cannot toggle pending_review or rejected products
        if (!in_array($product->status, ['active', 'inactive'])) {
            return response()->json([
                'message' => 'لا يمكن تفعيل/تعطيل هذا المنتج. يجب أن تتم الموافقة عليه من الإدارة أولاً.',
                'current_status' => $product->status
            ], 422);
        }

        // If trying to activate the product, check the limit
        if ($product->status === 'inactive') {
            // Count currently active products for this seller
            $activeCount = Product::where('seller_id', Auth::user()->seller_id)
                ->where('status', 'active')
                ->count();

            if ($activeCount >= 10) {
                return response()->json([
                    'message' => 'لقد وصلت للحد الأقصى من المنتجات المفعلة (10 منتجات). يرجى تعطيل منتج آخر أولاً.',
                    'active_count' => $activeCount,
                    'limit' => 10
                ], 422);
            }
        }

        // Toggle the status
        $newStatus = $product->status === 'active' ? 'inactive' : 'active';
        $product->status = $newStatus;
        $product->save();

        // Count active products after toggle
        $activeCount = Product::where('seller_id', Auth::user()->seller_id)
            ->where('status', 'active')
            ->count();

        return response()->json([
            'message' => $newStatus === 'active' 
                ? 'تم تفعيل المنتج بنجاح' 
                : 'تم تعطيل المنتج بنجاح',
            'product' => $product,
            'active_count' => $activeCount,
            'total_slots' => 10
        ]);
    }
}
