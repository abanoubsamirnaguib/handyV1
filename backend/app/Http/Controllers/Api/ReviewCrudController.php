<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;
use App\Http\Resources\ReviewResource;
use App\Http\Requests\ReviewRequest;
use Illuminate\Support\Facades\Storage;

class ReviewCrudController extends Controller
{
    public function index() { 
        return ReviewResource::collection(Review::with(['user', 'product', 'order'])->get()); 
    }
    public function store(ReviewRequest $request) {
        $validated = $request->validated();
        $validated['user_id'] = auth()->id(); // Ensure user_id is set to authenticated user
        
        // Check if user has ordered this product
        if (isset($validated['order_id'])) {
            $order = \App\Models\Order::where('id', $validated['order_id'])
                ->where('user_id', auth()->id())
                ->where('status', 'completed')
                ->first();
                
            if (!$order) {
                return response()->json(['message' => 'يمكنك فقط تقييم المنتجات التي قمت بشرائها وتم تسليمها'], 403);
            }
            
            // Check if user already reviewed this product for this order
            $existingReview = Review::where('user_id', auth()->id())
                ->where('product_id', $validated['product_id'])
                ->where('order_id', $validated['order_id'])
                ->first();
                
            if ($existingReview) {
                return response()->json(['message' => 'لقد قمت بتقييم هذا المنتج مسبقاً'], 409);
            }
        }
        
        // Handle image upload
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('reviews', 'public');
            $validated['image'] = $imagePath;
        }
        $review = Review::create($validated);
        $review->load(['user', 'product', 'order']);
        return new ReviewResource($review);
    }
    public function update(ReviewRequest $request, $id) {
        $review = Review::findOrFail($id);
        // Ensure user can only update their own reviews
        if ($review->user_id !== auth()->id()) {
            return response()->json(['message' => 'يمكنك فقط تعديل تقييماتك الخاصة'], 403);
        }
        
        $validated = $request->validated();
        
        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($review->image && Storage::disk('public')->exists($review->image)) {
                Storage::disk('public')->delete($review->image);
            }
            $imagePath = $request->file('image')->store('reviews', 'public');
            $validated['image'] = $imagePath;
        } elseif ($request->has('remove_image') && $request->input('remove_image') === '1') {
            // Remove existing image
            if ($review->image && Storage::disk('public')->exists($review->image)) {
                Storage::disk('public')->delete($review->image);
            }
            $validated['image'] = null;
        }
        $review->update($validated);
        $review->load(['user', 'product', 'order']);
        return new ReviewResource($review);
    }
    public function destroy($id) {
        $review = Review::findOrFail($id);
        
        // Ensure user can only delete their own reviews
        if ($review->user_id !== auth()->id()) {
            return response()->json(['message' => 'يمكنك فقط حذف تقييماتك الخاصة'], 403);
        }
        
        // Delete image if exists
        if ($review->image && Storage::disk('public')->exists($review->image)) {
            Storage::disk('public')->delete($review->image);
        }
        
        $review->delete();
        return response()->json(['message' => 'تم حذف التقييم بنجاح']);
    }

    // Get reviews for a specific product
    public function getProductReviews($productId) {
        $reviews = Review::where('product_id', $productId)
            ->where('status', 'published')
            ->with(['user', 'product', 'order'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        return ReviewResource::collection($reviews);
    }

    // Get reviews for a specific seller (from all their products)
    public function getSellerReviews($sellerId) {
        $reviews = Review::whereHas('product', function($query) use ($sellerId) {
                $query->where('seller_id', $sellerId);
            })
            ->where('status', 'published')
            ->with(['user', 'product', 'order'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        return ReviewResource::collection($reviews);
    }

    // Get reviews for a specific order
    public function getOrderReviews($orderId) {
        // First check if the authenticated user is either the buyer or seller for this order
        $order = \App\Models\Order::where('id', $orderId)
            ->where(function($query) {
                $query->where('user_id', auth()->id()) // User is the buyer
                      ->orWhereHas('seller', function($subQuery) {
                          $subQuery->where('user_id', auth()->id()); // User is the seller
                      });
            })
            ->first();

        if (!$order) {
            return response()->json(['message' => 'الطلب غير موجود أو ليس لديك صلاحية للوصول إليه'], 404);
        }

        // Get all reviews for this order
        $reviews = Review::where('order_id', $orderId)
            ->where('status', 'published')
            ->with(['user', 'product', 'order'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        return ReviewResource::collection($reviews);
    }

    // Check if user can review products in an order
    public function canReviewOrder($orderId) {
        $order = \App\Models\Order::where('id', $orderId)
            ->where('user_id', auth()->id())
            ->where('status', 'completed')
            ->with('items.product')
            ->first();

        if (!$order) {
            return response()->json(['message' => 'الطلب غير موجود أو غير مكتمل'], 404);
        }

        $reviewableProducts = [];
        foreach ($order->items as $item) {
            $existingReview = Review::where('user_id', auth()->id())
                ->where('product_id', $item->product_id)
                ->where('order_id', $orderId)
                ->first();

            if (!$existingReview) {
                $reviewableProducts[] = [
                    'product_id' => $item->product_id,
                    'product_title' => $item->product->title,
                    'product_image' => $item->product->images->first()->image_url ?? null,
                    'can_review' => true
                ];
            } else {
                $reviewableProducts[] = [
                    'product_id' => $item->product_id,
                    'product_title' => $item->product->title,
                    'product_image' => $item->product->images->first()->image_url ?? null,
                    'can_review' => false,
                    'existing_review' => new ReviewResource($existingReview)
                ];
            }
        }

        return response()->json([
            'order_id' => $orderId,
            'products' => $reviewableProducts
        ]);
    }
}
