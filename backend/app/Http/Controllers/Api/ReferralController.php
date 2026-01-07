<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReferralReward;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReferralController extends Controller
{
    public function me(Request $request)
    {
        $user = Auth::user();

        $referredUsersCount = $user->referrals()->count();
        $totalEarned = (float) ReferralReward::where('referrer_user_id', $user->id)->sum('amount');

        return response()->json([
            'referral_code' => $user->referral_code,
            'referral_link' => $user->referral_link,
            'referred_users_count' => $referredUsersCount,
            'total_earned_gift' => $totalEarned,
            'gift_wallet_balance' => (float) ($user->gift_wallet_balance ?? 0),
        ]);
    }
}

