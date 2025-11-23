<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WithdrawalRequest;
use App\Models\Seller;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class WithdrawalRequestController extends Controller
{
    // Get seller's withdrawal requests
    public function index()
    {
        $user = Auth::user();
        if ($user->active_role !== 'seller') {
            return response()->json(['error' => 'غير مصرح'], 403);
        }

        $seller = Seller::where('user_id', $user->id)->first();
        if (!$seller) {
            return response()->json(['error' => 'البائع غير موجود'], 404);
        }

        $withdrawalRequests = $seller->withdrawalRequests()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'withdrawal_requests' => $withdrawalRequests->map(function($request) {
                return [
                    'id' => $request->id,
                    'amount' => $request->amount,
                    'payment_method' => $request->getPaymentMethodLabel(),
                    'payment_details' => $request->payment_details,
                    'status' => $request->status,
                    'status_label' => $request->getStatusLabel(),
                    'admin_notes' => $request->admin_notes,
                    'rejection_reason' => $request->rejection_reason,
                    'created_at' => $request->created_at->format('Y-m-d H:i'),
                    'processed_at' => $request->processed_at instanceof \DateTime ? $request->processed_at->format('Y-m-d H:i') : null,
                ];
            })
        ]);
    }

    // Create new withdrawal request
    public function store(Request $request)
    {
        $user = Auth::user();
        if ($user->active_role !== 'seller') {
            return response()->json(['error' => 'غير مصرح'], 403);
        }

        $seller = Seller::where('user_id', $user->id)->first();
        if (!$seller) {
            return response()->json(['error' => 'البائع غير موجود'], 404);
        }

        // Get withdrawal settings
        $minAmount = SiteSetting::where('setting_key', 'min_withdrawal_amount')->value('setting_value') ?? 100;
        $maxAmount = SiteSetting::where('setting_key', 'max_withdrawal_amount')->value('setting_value') ?? 100000;
        
        // Get enabled payment methods
        $enabledMethods = SiteSetting::where('setting_key', 'enabled_payment_methods')->value('setting_value');
        $enabledPaymentMethods = $enabledMethods ? json_decode($enabledMethods, true) : [
            'vodafone_cash' => true,
            'instapay' => true,
            'etisalat_cash' => true,
            'orange_cash' => true,
            'bank_transfer' => true,
        ];
        
        $availableMethods = array_keys(array_filter($enabledPaymentMethods));

        $validator = Validator::make($request->all(), [
            'amount' => "required|numeric|min:{$minAmount}|max:{$maxAmount}",
            'payment_method' => 'required|string|in:' . implode(',', $availableMethods),
            'payment_details' => 'required|string|max:255',
        ], [
            'amount.min' => "الحد الأدنى للسحب هو {$minAmount} جنيه",
            'amount.max' => "الحد الأقصى للسحب هو {$maxAmount} جنيه",
            'payment_method.in' => 'طريقة الدفع غير متاحة حالياً',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check if seller has sufficient balance
        if ($seller->wallet_balance < $request->amount) {
            return response()->json(['error' => 'الرصيد غير كافي في المحفظة'], 422);
        }

        // Check for pending requests
        $pendingRequest = $seller->withdrawalRequests()->where('status', 'pending')->first();
        if ($pendingRequest) {
            return response()->json(['error' => 'لديك طلب سحب معلق بالفعل'], 422);
        }

        $withdrawalRequest = WithdrawalRequest::create([
            'seller_id' => $seller->id,
            'amount' => $request->amount,
            'payment_method' => $request->payment_method,
            'payment_details' => $request->payment_details,
        ]);

        // إشعار المشرف بطلب سحب جديد
        try {
            \App\Services\NotificationService::notifyAdmin(
                'withdrawal_request',
                "طلب سحب جديد من {$user->name} - المبلغ: {$request->amount} جنيه",
                "/admin/withdrawals/{$withdrawalRequest->id}"
            );
        } catch (\Exception $e) {
            \Log::warning('Failed to send admin notification for withdrawal request', [
                'withdrawal_id' => $withdrawalRequest->id,
                'error' => $e->getMessage()
            ]);
        }

        return response()->json([
            'message' => 'تم إرسال طلب السحب بنجاح',
            'withdrawal_request' => [
                'id' => $withdrawalRequest->id,
                'amount' => $withdrawalRequest->amount,
                'payment_method' => $withdrawalRequest->getPaymentMethodLabel(),
                'status' => $withdrawalRequest->getStatusLabel(),
                'created_at' => $withdrawalRequest->created_at->format('Y-m-d H:i'),
            ]
        ], 201);
    }

    // Get seller's earnings summary
    public function earningsSummary()
    {
        $user = Auth::user();
        if ($user->active_role !== 'seller') {
            return response()->json(['error' => 'غير مصرح'], 403);
        }

        $seller = Seller::where('user_id', $user->id)->first();
        if (!$seller) {
            return response()->json(['error' => 'البائع غير موجود'], 404);
        }

        $totalEarnings = $seller->getTotalEarnings();
        $pendingEarnings = $seller->getPendingEarnings();
        $totalWithdrawn = $seller->getTotalWithdrawn();
        $availableForWithdrawal = $seller->getAvailableForWithdrawal();

        // Get monthly earnings for current year
        $monthlyEarnings = $seller->getMonthlyEarnings();
        $monthNames = [
            1 => 'يناير', 2 => 'فبراير', 3 => 'مارس', 4 => 'أبريل',
            5 => 'مايو', 6 => 'يونيو', 7 => 'يوليو', 8 => 'أغسطس',
            9 => 'سبتمبر', 10 => 'أكتوبر', 11 => 'نوفمبر', 12 => 'ديسمبر'
        ];

        $monthlyBreakdown = $monthlyEarnings->map(function($item) use ($monthNames) {
            return [
                'month' => $monthNames[$item->month],
                'earnings' => (float) $item->earnings
            ];
        });

        // Get withdrawal settings
        $minAmount = SiteSetting::where('setting_key', 'min_withdrawal_amount')->value('setting_value') ?? 100;
        $maxAmount = SiteSetting::where('setting_key', 'max_withdrawal_amount')->value('setting_value') ?? 100000;
        
        // Get enabled payment methods
        $enabledMethods = SiteSetting::where('setting_key', 'enabled_payment_methods')->value('setting_value');
        $enabledPaymentMethods = $enabledMethods ? json_decode($enabledMethods, true) : [
            'vodafone_cash' => true,
            'instapay' => true,
            'etisalat_cash' => true,
            'orange_cash' => true,
            'bank_transfer' => true,
        ];

        return response()->json([
            'total_revenue' => (float) $totalEarnings,
            'pending_clearance' => (float) $pendingEarnings,
            'withdrawn' => (float) $totalWithdrawn,
            'available_for_withdrawal' => (float) $availableForWithdrawal,
            'monthly_breakdown' => $monthlyBreakdown,
            'withdrawal_settings' => [
                'min_amount' => (float) $minAmount,
                'max_amount' => (float) $maxAmount,
                'enabled_payment_methods' => $enabledPaymentMethods,
            ]
        ]);
    }

    // Admin: Get all withdrawal requests
    public function adminIndex()
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['error' => 'غير مصرح'], 403);
        }

        $withdrawalRequests = WithdrawalRequest::with(['seller.user', 'processedBy'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'withdrawal_requests' => $withdrawalRequests->map(function($request) {
                return [
                    'id' => $request->id,
                    'seller_name' => $request->seller->user->name,
                    'seller_email' => $request->seller->user->email,
                    'amount' => $request->amount,
                    'payment_method' => $request->getPaymentMethodLabel(),
                    'payment_details' => $request->payment_details,
                    'status' => $request->status,
                    'status_label' => $request->getStatusLabel(),
                    'admin_notes' => $request->admin_notes,
                    'rejection_reason' => $request->rejection_reason,
                    'processed_by' => $request->processedBy ? $request->processedBy->name : null,
                    'created_at' => $request->created_at->format('Y-m-d H:i'),
                    'processed_at' => $request->processed_at instanceof \DateTime ? $request->processed_at->format('Y-m-d H:i') : null,
                ];
            })
        ]);
    }

    // Admin: Approve withdrawal request
    public function approve(Request $request, $id)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['error' => 'غير مصرح'], 403);
        }

        $withdrawalRequest = WithdrawalRequest::with('seller')->findOrFail($id);

        try {
            $withdrawalRequest->approve($user->id, $request->admin_notes);
            
            // إرسال إشعار للبائع بالموافقة على طلب السحب
            try {
                $sellerUserId = $withdrawalRequest->seller->user_id;
                \App\Services\NotificationService::create(
                    $sellerUserId,
                    'payment',
                    "تمت الموافقة على طلب سحب الأموال. المبلغ: {$withdrawalRequest->amount} جنيه",
                    "/dashboard/earnings"
                );
            } catch (\Exception $e) {
                \Log::warning('Failed to send notification to seller for approved withdrawal', [
                    'withdrawal_id' => $withdrawalRequest->id,
                    'error' => $e->getMessage()
                ]);
            }
            
            return response()->json([
                'message' => 'تم الموافقة على طلب السحب بنجاح',
                'withdrawal_request' => [
                    'id' => $withdrawalRequest->id,
                    'status' => $withdrawalRequest->getStatusLabel(),
                    'processed_at' => $withdrawalRequest->processed_at instanceof \DateTime ? $withdrawalRequest->processed_at->format('Y-m-d H:i') : null,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    // Admin: Reject withdrawal request
    public function reject(Request $request, $id)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['error' => 'غير مصرح'], 403);
        }

        $validator = Validator::make($request->all(), [
            'rejection_reason' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $withdrawalRequest = WithdrawalRequest::with('seller')->findOrFail($id);

        try {
            $withdrawalRequest->reject($user->id, $request->rejection_reason);
            
            // إرسال إشعار للبائع برفض طلب السحب
            try {
                $sellerUserId = $withdrawalRequest->seller->user_id;
                \App\Services\NotificationService::create(
                    $sellerUserId,
                    'payment',
                    "تم رفض طلب سحب الأموال. السبب: {$request->rejection_reason}",
                    "/dashboard/earnings"
                );
            } catch (\Exception $e) {
                \Log::warning('Failed to send notification to seller for rejected withdrawal', [
                    'withdrawal_id' => $withdrawalRequest->id,
                    'error' => $e->getMessage()
                ]);
            }
            
            return response()->json([
                'message' => 'تم رفض طلب السحب',
                'withdrawal_request' => [
                    'id' => $withdrawalRequest->id,
                    'status' => $withdrawalRequest->getStatusLabel(),
                    'rejection_reason' => $withdrawalRequest->rejection_reason,
                    'processed_at' => $withdrawalRequest->processed_at instanceof \DateTime ? $withdrawalRequest->processed_at->format('Y-m-d H:i') : null,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    // Admin: Get withdrawal settings
    public function getWithdrawalSettings()
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['error' => 'غير مصرح'], 403);
        }

        $minAmount = SiteSetting::where('setting_key', 'min_withdrawal_amount')->value('setting_value') ?? '100';
        $maxAmount = SiteSetting::where('setting_key', 'max_withdrawal_amount')->value('setting_value') ?? '100000';
        $processingTime = SiteSetting::where('setting_key', 'withdrawal_processing_time')->value('setting_value') ?? '3-5 أيام عمل';
        
        // Get enabled payment methods
        $enabledMethods = SiteSetting::where('setting_key', 'enabled_payment_methods')->value('setting_value');
        $enabledPaymentMethods = $enabledMethods ? json_decode($enabledMethods, true) : [
            'vodafone_cash' => true,
            'instapay' => true,
            'etisalat_cash' => true,
            'orange_cash' => true,
            'bank_transfer' => true,
        ];

        return response()->json([
            'settings' => [
                'min_withdrawal_amount' => (float) $minAmount,
                'max_withdrawal_amount' => (float) $maxAmount,
                'withdrawal_processing_time' => $processingTime,
                'enabled_payment_methods' => $enabledPaymentMethods,
            ]
        ]);
    }

    // Admin: Update withdrawal settings
    public function updateWithdrawalSettings(Request $request)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['error' => 'غير مصرح'], 403);
        }

        $validator = Validator::make($request->all(), [
            'min_withdrawal_amount' => 'required|numeric|min:1',
            'max_withdrawal_amount' => 'required|numeric|gt:min_withdrawal_amount',
            'withdrawal_processing_time' => 'nullable|string|max:255',
            'enabled_payment_methods' => 'nullable|array',
        ], [
            'max_withdrawal_amount.gt' => 'الحد الأقصى يجب أن يكون أكبر من الحد الأدنى',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // Update or create withdrawal settings
            $settings = [
                'min_withdrawal_amount' => $request->min_withdrawal_amount,
                'max_withdrawal_amount' => $request->max_withdrawal_amount,
                'withdrawal_processing_time' => $request->withdrawal_processing_time ?? '3-5 أيام عمل',
            ];

            foreach ($settings as $key => $value) {
                SiteSetting::updateOrCreate(
                    ['setting_key' => $key],
                    ['setting_value' => $value]
                );
            }

            // Handle enabled payment methods
            if ($request->has('enabled_payment_methods')) {
                SiteSetting::updateOrCreate(
                    ['setting_key' => 'enabled_payment_methods'],
                    ['setting_value' => json_encode($request->enabled_payment_methods)]
                );
            }

            return response()->json([
                'message' => 'تم تحديث إعدادات السحب بنجاح',
                'settings' => $settings
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'حدث خطأ في تحديث الإعدادات'], 500);
        }
    }
}