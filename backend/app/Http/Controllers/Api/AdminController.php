<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Product;
use App\Models\Seller;
use App\Models\Order;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Http\Resources\UserResource;
use App\Http\Resources\ProductResource;
use App\Http\Resources\SellerResource;
use App\Http\Resources\OrderResource;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;


class AdminController extends Controller
{    public function dashboard()
    {
        $stats = [
            'total_users' => User::count(),
            'total_sellers' => Seller::count(),
            'total_products' => Product::count(),
            'total_orders' => Order::count(),
            'active_users' => User::where('status', 'active')->count(),
            'pending_sellers' => User::whereHas('seller')->where('status', 'suspended')->count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'pending_products' => Product::where('status', 'pending_review')->count(),
            'total_buyers' => User::where(function($q) {
                $q->where('role', 'buyer')->orWhere('is_buyer', true);
            })->count(),
            'suspended_users' => User::where('status', 'suspended')->count(),
        ];

        return response()->json($stats);
    }

    public function users(Request $request)
    {
        $query = User::query()
            ->withCount('orders as orders_count');

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

        $perPage = $request->get('per_page', 20);
        $users = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        return UserResource::collection($users);
    }
    public function sellers(Request $request)
    {
        $query = Seller::with(['user', 'skills'])
            ->withCount([
                'orders as in_progress_orders_count' => function($q) {
                    $q->whereIn('status', ['pending', 'admin_approved', 'seller_approved', 'work_completed', 'ready_for_delivery', 'out_for_delivery']);
                }
            ]);

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
        $query = Product::with(['seller.user', 'category'])
            ->withCount('orderItems as orders_count');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('featured')) {
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
            'status' => 'required|in:active,suspended'
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
    public function updateProductStatus(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $validated = $request->validate([
            'status' => 'required|in:active,inactive,pending_review,rejected',
            'rejection_reason' => 'nullable|string|max:1000'
        ]);
        
        // Check if admin is trying to approve (activate) the product
        if ($validated['status'] === 'active' && $product->status !== 'active') {
            // Check seller's active product count
            $activeCount = Product::where('seller_id', $product->seller_id)
                ->where('status', 'active')
                ->count();
            
            if ($activeCount >= 10) {
                return response()->json([
                    'message' => 'لا يمكن الموافقة على هذا المنتج. البائع وصل للحد الأقصى من المنتجات المفعلة (10 منتجات).',
                    'error' => 'seller_limit_reached',
                    'active_count' => $activeCount,
                    'limit' => 10,
                    'seller_id' => $product->seller_id
                ], 422);
            }
        }
        
        $updateData = ['status' => $validated['status']];
        
        // إذا تم رفض المنتج، نحفظ سبب الرفض
        if ($validated['status'] === 'rejected' && isset($validated['rejection_reason'])) {
            $updateData['rejection_reason'] = $validated['rejection_reason'];
        } elseif ($validated['status'] !== 'rejected') {
            // إذا تم تغيير الحالة من rejected إلى حالة أخرى، نحذف سبب الرفض
            $updateData['rejection_reason'] = null;
        }
        
        $product->update($updateData);

        // إذا تم تفعيل المنتج، نرسل إشعارًا للبائع
        if ($validated['status'] === 'active' && $product->seller && $product->seller->user_id) {
            \App\Services\NotificationService::productApproved(
                userId: $product->seller->user_id,
                productTitle: $product->title,
                productType: $product->type
            );
        }
        
        // إذا تم رفض المنتج، نرسل إشعارًا للبائع مع سبب الرفض
        if ($validated['status'] === 'rejected' && $product->seller && $product->seller->user_id) {
            \App\Services\NotificationService::productRejected(
                userId: $product->seller->user_id,
                productTitle: $product->title,
                productType: $product->type,
                rejectionReason: $validated['rejection_reason'] ?? ''
            );
        }

        return new ProductResource($product);
    }

    public function getOrders(Request $request)
    {
        $query = Order::with(['user', 'seller.user', 'items.product', 'adminApprover', 'deliveryPerson', 'pickupPerson', 'history.actionUser', 'city']);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%")
                  ->orWhere('id', 'like', "%{$search}%")
                  ->orWhereHas('user', function($subQ) use ($search) {
                      $subQ->where('name', 'like', "%{$search}%")
                           ->orWhere('email', 'like', "%{$search}%");
                  })
                  ->orWhereHas('seller.user', function($subQ) use ($search) {
                      $subQ->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        // Filter by payment status
        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }
        // Filter by payment proof
        if ($request->filled('payment_proof')) {
            if ($request->payment_proof === 'with_proof') {
                $query->whereNotNull('payment_proof');
            } elseif ($request->payment_proof === 'without_proof') {
                $query->whereNull('payment_proof');
            } elseif ($request->payment_proof === 'cash_on_delivery') {
                $query->where('payment_method',  'cash_on_delivery');
            }
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $perPage = $request->get('per_page', 20);
        $orders = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        return OrderResource::collection($orders);
    }

    public function getPendingOrders(Request $request)
    {
        $query = Order::with(['user', 'seller.user', 'items.product', 'adminApprover'])
            ->where('status', 'pending_admin_approval');

        $perPage = $request->get('per_page', 20);
        $orders = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        return OrderResource::collection($orders);
    }

    public function approveOrder(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        
        // استخدام الطريقة الجديدة من النموذج للتحقق من إمكانية الموافقة
        if (!$order->canBeApprovedByAdmin()) {
            return response()->json([
                'message' => 'لا يمكن الموافقة على هذا الطلب في الوقت الحالي'
            ], 400);
        }

        // استخدام الطريقة الجديدة من النموذج للموافقة
        $order->approveByAdmin(auth()->id(), $request->input('notes', ''));

        return new OrderResource($order->fresh()->load(['user', 'seller.user', 'items.product', 'adminApprover']));
    }

    public function rejectOrder(Request $request, $id)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:1000'
        ]);

        $order = Order::findOrFail($id);
        
        // استخدام الطريقة الجديدة من النموذج للتحقق من إمكانية الرفض
        if (!$order->canBeRejectedByAdmin()) {
            return response()->json([
                'message' => 'لا يمكن رفض هذا الطلب في الوقت الحالي. يمكن رفض الطلبات قيد المراجعة فقط.'
            ], 400);
        }

        try {
            $order->rejectByAdmin(auth()->id(), $validated['reason']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }

        // إرسال إشعار للمشتري
        try {
            \App\Services\NotificationService::create(
                $order->user_id,
                'order_rejected',
                "تم رفض طلبك رقم {$order->id} من قبل الإدارة.\n\nسبب الرفض: {$validated['reason']}",
                "/orders/{$order->id}"
            );
        } catch (\Exception $e) {
            \Log::warning('Failed to send notification for rejected order', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
        }

        // إرسال إشعار للبائع إذا كان موجوداً
        if ($order->seller && $order->seller->user_id) {
            try {
                \App\Services\NotificationService::create(
                    $order->seller->user_id,
                    'order_rejected',
                    "تم رفض الطلب رقم {$order->id} من قبل الإدارة.\n\nسبب الرفض: {$validated['reason']}",
                    "/orders/{$order->id}"
                );
            } catch (\Exception $e) {
                \Log::warning('Failed to send notification to seller for rejected order', [
                    'order_id' => $order->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return new OrderResource($order->fresh()->load(['user', 'seller.user', 'items.product', 'adminApprover']));
    }

    /**
     * Admin: update order details (buyer/seller info + totals + deposit info + optional deposit image replacement)
     *
     * Route: PUT /api/admin/orders/{id}
     */
    public function updateOrder(Request $request, $id)
    {
        $order = Order::with(['user', 'seller.user', 'items.product', 'adminApprover', 'deliveryPerson', 'pickupPerson', 'history.actionUser', 'city'])
            ->findOrFail($id);

        $validated = $request->validate([
            'customer_name' => 'sometimes|nullable|string|max:100',
            'customer_phone' => 'sometimes|nullable|string|max:20',
            'delivery_address' => 'sometimes|nullable|string',
            'seller_address' => 'sometimes|nullable|string',

            // Frontend uses total_amount; backend stores total_price and computes total_amount in resource
            'total_amount' => 'sometimes|nullable|numeric|min:0',
            'total_price' => 'sometimes|nullable|numeric|min:0',

            // Deposit fields (service orders)
            'deposit_amount' => 'sometimes|nullable|numeric|min:0',
            'deposit_image' => 'sometimes|file|image|max:4096', // 4MB
        ]);

        DB::beginTransaction();
        try {
            $changes = [];

            foreach (['customer_name', 'customer_phone', 'delivery_address', 'seller_address'] as $field) {
                if (array_key_exists($field, $validated)) {
                    $changes[$field] = $validated[$field];
                }
            }

            // Determine intended total (excluding delivery fee) from either total_amount or total_price
            $newTotal = null;
            if (array_key_exists('total_amount', $validated)) {
                $fee = (float) ($order->delivery_fee ?? 0);
                $newTotal = max(0, (float) $validated['total_amount'] - $fee);
            } elseif (array_key_exists('total_price', $validated)) {
                $newTotal = max(0, (float) $validated['total_price']);
            }

            if ($newTotal !== null) {
                // If negotiated price is approved, final price comes from buyer_proposed_price
                $isNegotiatedApproved = $order->buyer_proposed_price && ($order->price_approval_status === 'approved');
                if ($isNegotiatedApproved) {
                    $changes['buyer_proposed_price'] = $newTotal;
                } else {
                    $changes['total_price'] = $newTotal;
                }
            }

            // Deposit amount only valid on service orders requiring deposit
            if (array_key_exists('deposit_amount', $validated)) {
                if (!$order->is_service_order || !$order->requires_deposit) {
                    return response()->json([
                        'message' => 'هذا الطلب لا يدعم تعديل قيمة العربون'
                    ], 422);
                }

                $changes['deposit_amount'] = (float) $validated['deposit_amount'];
            }

            // If deposit image provided, replace it (service orders only)
            if ($request->hasFile('deposit_image')) {
                if (!$order->is_service_order || !$order->requires_deposit) {
                    return response()->json([
                        'message' => 'هذا الطلب لا يدعم رفع صورة عربون'
                    ], 422);
                }

                // Delete old file if present (best-effort)
                if ($order->deposit_image) {
                    try {
                        Storage::disk('public')->delete($order->deposit_image);
                    } catch (\Throwable $e) {
                        // ignore
                    }
                }

                $path = $request->file('deposit_image')->store('deposit_images', 'public');
                $changes['deposit_image'] = $path;
            }

            // Validate deposit constraints after applying changes
            $finalPriceAfter = $order->getFinalPrice();
            if (array_key_exists('buyer_proposed_price', $changes)) {
                $finalPriceAfter = (float) $changes['buyer_proposed_price'];
            } elseif (array_key_exists('total_price', $changes) && !($order->buyer_proposed_price && $order->price_approval_status === 'approved')) {
                $finalPriceAfter = (float) $changes['total_price'];
            }

            if ($order->is_service_order && $order->requires_deposit) {
                $depositAfter = array_key_exists('deposit_amount', $changes)
                    ? (float) $changes['deposit_amount']
                    : (float) ($order->deposit_amount ?? 0);

                if ($depositAfter > $finalPriceAfter) {
                    return response()->json([
                        'message' => 'قيمة العربون لا يمكن أن تتجاوز السعر النهائي'
                    ], 422);
                }

                // Keep same business rule used in creation: deposit <= 80% of final price
                $maxDeposit = $finalPriceAfter * 0.8;
                if ($depositAfter > $maxDeposit) {
                    return response()->json([
                        'message' => 'قيمة العربون لا يمكن أن تتجاوز 80% من السعر النهائي'
                    ], 422);
                }
            }

            // Recompute buyer_total if total_price/buyer_proposed_price changed (delivery fee stays same)
            if (array_key_exists('total_price', $changes) || array_key_exists('buyer_proposed_price', $changes)) {
                $fee = (float) ($order->delivery_fee ?? 0);
                $buyerTotal = round(($finalPriceAfter ?? 0) + $fee, 2);
                $changes['buyer_total'] = $buyerTotal;
            }

            if (!empty($changes)) {
                $changes['updated_at'] = now();
                $order->update($changes);

                // History (keep it simple)
                $order->addToHistory($order->status, auth()->id(), 'admin_order_updated', 'تم تعديل بيانات الطلب بواسطة الإدارة');
            }

            DB::commit();
            return new OrderResource($order->fresh()->load(['user', 'seller.user', 'items.product', 'adminApprover', 'deliveryPerson', 'pickupPerson', 'history.actionUser', 'city']));
        } catch (\Throwable $e) {
            DB::rollBack();
            \Log::error('Admin updateOrder failed', [
                'order_id' => $id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Get statistics for About Us page (public endpoint)
     */
    public function getAboutUsStats()
    {
        $stats = [
            'trusted_artisans' => Seller::whereHas('user', function($query) {
                $query->where('status', 'active');
            })->count(),
            'handmade_products' => Product::where('status', 'active')->count(),
            'satisfied_customers' => User::where('status', 'active')->where('role', 'customer')->count(),
            'diverse_categories' => Category::count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
