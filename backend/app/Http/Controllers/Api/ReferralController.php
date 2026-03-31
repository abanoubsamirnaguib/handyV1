<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReferralReward;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReferralController extends Controller
{
    public function me(Request $request)
    {
        $user = Auth::user();

        $referredUsersCount = $user->referrals()->count();
        $rewards = ReferralReward::with(['referred:id,name,email'])
            ->where('referrer_user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        $totalEarned = (float) $rewards->sum('amount');

        return response()->json([
            'referral_code' => $user->referral_code,
            'referral_link' => $user->referral_link,
            'referred_users_count' => $referredUsersCount,
            'total_earned_gift' => $totalEarned,
            'gift_wallet_balance' => (float) ($user->gift_wallet_balance ?? 0),
            'rewards' => $rewards->map(function (ReferralReward $reward) {
                return [
                    'id' => $reward->id,
                    'reward_type' => $reward->reward_type,
                    'reward_type_label' => $reward->reward_type_label,
                    'amount' => (float) $reward->amount,
                    'currency' => $reward->currency,
                    'reason' => $reward->reason,
                    'source_product_id' => $reward->source_product_id,
                    'source_order_id' => $reward->source_order_id,
                    'created_at' => $reward->created_at,
                    'referred_user' => [
                        'id' => $reward->referred?->id,
                        'name' => $reward->referred?->name,
                        'email' => $reward->referred?->email,
                    ],
                ];
            })->values(),
        ]);
    }

    public function adminSummary(Request $request)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['error' => 'غير مصرح'], 403);
        }

        $referrers = User::query()
            ->whereHas('referrals')
            ->with([
                'referrals:id,name,email,referred_by_user_id,created_at',
                'referralRewardsEarned' => function ($query) {
                    $query->orderByDesc('created_at');
                },
            ])
            ->get(['id', 'name', 'email', 'gift_wallet_balance']);

        $summary = $referrers
            ->map(function (User $referrer) {
                $rewards = $referrer->referralRewardsEarned;
                $rewardsByReferred = $rewards->groupBy('referred_user_id');

                $referredUsers = $referrer->referrals->map(function (User $referredUser) use ($rewardsByReferred) {
                    $userRewards = collect($rewardsByReferred->get($referredUser->id, []));

                    return [
                        'id' => $referredUser->id,
                        'name' => $referredUser->name,
                        'email' => $referredUser->email,
                        'registered_at' => $referredUser->created_at,
                        'earned_from_this_user' => (float) $userRewards->sum('amount'),
                        'rewards' => $userRewards->map(function (ReferralReward $reward) {
                            return [
                                'id' => $reward->id,
                                'reward_type' => $reward->reward_type,
                                'reward_type_label' => $reward->reward_type_label,
                                'amount' => (float) $reward->amount,
                                'reason' => $reward->reason,
                                'created_at' => $reward->created_at,
                            ];
                        })->values(),
                    ];
                })->values();

                return [
                    'referrer' => [
                        'id' => $referrer->id,
                        'name' => $referrer->name,
                        'email' => $referrer->email,
                    ],
                    'gift_wallet_balance' => (float) ($referrer->gift_wallet_balance ?? 0),
                    'referred_users_count' => $referrer->referrals->count(),
                    'rewards_count' => $rewards->count(),
                    'total_rewards_earned' => (float) $rewards->sum('amount'),
                    'referred_users' => $referredUsers,
                ];
            })
            ->sortByDesc('total_rewards_earned')
            ->values();

        return response()->json([
            'summary' => $summary,
            'totals' => [
                'referrers_count' => $summary->count(),
                'referred_accounts_count' => (int) $summary->sum('referred_users_count'),
                'rewards_count' => (int) $summary->sum('rewards_count'),
                'total_rewards_earned' => (float) $summary->sum('total_rewards_earned'),
            ],
        ]);
    }
}

