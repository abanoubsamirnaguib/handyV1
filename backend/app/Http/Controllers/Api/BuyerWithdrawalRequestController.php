<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BuyerWithdrawalRequest;
use App\Models\User;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class BuyerWithdrawalRequestController extends Controller
{
    // Get buyer's withdrawal requests
    public function index()
    {
        $user = Auth::user();

        $requests = BuyerWithdrawalRequest::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'withdrawal_requests' => $requests->map(function($request) {
                return [
                    'id' => $request->id,
                    'amount' => $request->amount,
                    'payment_method' => $request->payment_method,
                    'payment_details' => $request->payment_details,
                    'status' => $request->status,
                    'admin_notes' => $request->admin_notes,
                    'rejection_reason' => $request->rejection_reason,
                    'created_at' => $request->created_at->format('Y-m-d H:i'),
                    'processed_at' => $request->processed_at instanceof \DateTime ? $request->processed_at->format('Y-m-d H:i') : null,
                ];
            })
        ]);
    }

    // Create new buyer withdrawal request
    public function store(Request $request)
    {
        $user = Auth::user();

        // Get withdrawal settings (reuse seller settings for simplicity)
        $minAmount = SiteSetting::where('setting_key', 'min_withdrawal_amount')->value('setting_value') ?? 100;
        $maxAmount = SiteSetting::where('setting_key', 'max_withdrawal_amount')->value('setting_value') ?? 100000;

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

        // Check if buyer has sufficient balance
        if ($user->buyer_wallet_balance < $request->amount) {
            return response()->json(['error' => 'الرصيد غير كافي في محفظتك'], 422);
        }

        // Check for pending requests
        $pendingRequest = BuyerWithdrawalRequest::where('user_id', $user->id)->where('status', 'pending')->first();
        if ($pendingRequest) {
            return response()->json(['error' => 'لديك طلب سحب معلق بالفعل'], 422);
        }

        $withdrawalRequest = BuyerWithdrawalRequest::create([
            'user_id' => $user->id,
            'amount' => $request->amount,
            'payment_method' => $request->payment_method,
            'payment_details' => $request->payment_details,
        ]);

        return response()->json([
            'message' => 'تم إرسال طلب السحب بنجاح',
            'withdrawal_request' => [
                'id' => $withdrawalRequest->id,
                'amount' => $withdrawalRequest->amount,
                'payment_method' => $withdrawalRequest->payment_method,
                'status' => $withdrawalRequest->status,
                'created_at' => $withdrawalRequest->created_at->format('Y-m-d H:i'),
            ]
        ], 201);
    }

    // Admin list
    public function adminIndex()
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['error' => 'غير مصرح'], 403);
        }

        $requests = BuyerWithdrawalRequest::orderBy('created_at', 'desc')->get();
        return response()->json(['withdrawal_requests' => $requests]);
    }

    // Admin approve
    public function approve($id)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['error' => 'غير مصرح'], 403);
        }

        $requestModel = BuyerWithdrawalRequest::findOrFail($id);
        $requestModel->approve($user->id);
        return response()->json(['message' => 'تمت الموافقة على طلب السحب']);
    }

    // Admin reject
    public function reject(Request $request, $id)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['error' => 'غير مصرح'], 403);
        }

        $request->validate([
            'reason' => 'required|string|max:255'
        ]);

        $requestModel = BuyerWithdrawalRequest::findOrFail($id);
        $requestModel->reject($user->id, $request->reason);
        return response()->json(['message' => 'تم رفض طلب السحب']);
    }
}


