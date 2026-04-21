<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\ReferralReward;
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReferralController extends Controller
{
    public function me(Request $request)
    {
        $user = Auth::user();
        $settings = $this->getGiftSettings();

        $rewardTypes = [
            ReferralReward::TYPE_COMPLETED_ORDER_GIFT,
            ReferralReward::TYPE_REFERRAL_SELLER_FIRST_PRODUCT_GIFT,
        ];

        $rewards = ReferralReward::with([
            'referred:id,name,email',
            'sourceProduct:id,title',
        ])
            ->where('referrer_user_id', $user->id)
            ->whereIn('reward_type', $rewardTypes)
            ->orderByDesc('created_at')
            ->get();

        $orderRewards = $rewards
            ->where('reward_type', ReferralReward::TYPE_COMPLETED_ORDER_GIFT)
            ->values();

        $referralSellerRewards = $rewards
            ->where('reward_type', ReferralReward::TYPE_REFERRAL_SELLER_FIRST_PRODUCT_GIFT)
            ->values();

        $orderCount = $orderRewards->count();
        $orderLimit = (int) $settings['orderGiftLimitPerSeller'];

        $referralCount = $referralSellerRewards->count();
        $referralLimit = (int) $settings['referralSellerLimitPerSeller'];

        $referredRegistrationsCount = User::where('referred_by_user_id', $user->id)->count();

        return response()->json([
            'referral_code' => $user->referral_code,
            'referral_link' => $user->referral_link,
            'gift_wallet_balance' => (float) ($user->gift_wallet_balance ?? 0),
            'total_earned_gift' => (float) $rewards->sum('amount'),
            'referred_users_count' => (int) $referredRegistrationsCount,

            'settings' => $settings,
            'progress' => [
                'orders' => $this->buildProgress($orderCount, $orderLimit),
                'referrals' => $this->buildProgress($referralCount, $referralLimit),
            ],

            'order_rewards' => $orderRewards->map(function (ReferralReward $reward) {
                return [
                    'id' => $reward->id,
                    'reward_type' => $reward->reward_type,
                    'reward_type_label' => $reward->reward_type_label,
                    'amount' => (float) $reward->amount,
                    'currency' => $reward->currency,
                    'reason' => $reward->reason,
                    'order_id' => $reward->source_order_id,
                    'buyer' => [
                        'id' => $reward->referred?->id,
                        'name' => $reward->referred?->name,
                        'email' => $reward->referred?->email,
                    ],
                    'created_at' => $reward->created_at,
                ];
            })->values(),

            'referral_seller_rewards' => $referralSellerRewards->map(function (ReferralReward $reward) {
                return [
                    'id' => $reward->id,
                    'reward_type' => $reward->reward_type,
                    'reward_type_label' => $reward->reward_type_label,
                    'amount' => (float) $reward->amount,
                    'currency' => $reward->currency,
                    'reason' => $reward->reason,
                    'product_id' => $reward->source_product_id,
                    'product_title' => $reward->sourceProduct?->title,
                    'registered_seller' => [
                        'id' => $reward->referred?->id,
                        'name' => $reward->referred?->name,
                        'email' => $reward->referred?->email,
                    ],
                    'created_at' => $reward->created_at,
                ];
            })->values(),
        ]);
    }

    public function adminSummary(Request $request)
    {
        $user = Auth::user();
        if (!in_array($user->role, ['admin', 'super_admin'], true)) {
            return response()->json(['error' => 'غير مصرح'], 403);
        }

        $settings = $this->getGiftSettings();

        $rewardTypes = [
            ReferralReward::TYPE_COMPLETED_ORDER_GIFT,
            ReferralReward::TYPE_REFERRAL_SELLER_FIRST_PRODUCT_GIFT,
        ];

        $sellerUsers = User::query()
            ->whereHas('seller')
            ->with('seller:id,user_id,completed_orders,wallet_balance')
            ->get(['id', 'name', 'email', 'gift_wallet_balance']);

        $sellerUserIds = $sellerUsers->pluck('id');
        $sellerProfileIds = $sellerUsers->pluck('seller.id')->filter()->values();

        $allRewards = ReferralReward::query()
            ->with(['referred:id,name,email', 'sourceProduct:id,title'])
            ->whereIn('reward_type', $rewardTypes)
            ->whereIn('referrer_user_id', $sellerUserIds)
            ->orderByDesc('created_at')
            ->get();

        $rewardsBySellerUser = $allRewards->groupBy('referrer_user_id');

        $registrationCountBySellerUser = User::query()
            ->selectRaw('referred_by_user_id, COUNT(*) as registrations_count')
            ->whereNotNull('referred_by_user_id')
            ->whereIn('referred_by_user_id', $sellerUserIds)
            ->groupBy('referred_by_user_id')
            ->pluck('registrations_count', 'referred_by_user_id');

        $completedOrdersAggBySeller = Order::query()
            ->whereIn('seller_id', $sellerProfileIds)
            ->where('status', 'completed')
            ->selectRaw('seller_id, COUNT(*) as completed_orders_count, SUM(total_price) as completed_orders_total, SUM(COALESCE(seller_net_amount, total_price)) as seller_net_total')
            ->groupBy('seller_id')
            ->get()
            ->keyBy('seller_id');

        $summary = $sellerUsers->map(function (User $sellerUser) use (
            $settings,
            $rewardsBySellerUser,
            $registrationCountBySellerUser,
            $completedOrdersAggBySeller
        ) {
            $sellerRewards = collect($rewardsBySellerUser->get($sellerUser->id, collect()));

            $orderRewards = $sellerRewards
                ->where('reward_type', ReferralReward::TYPE_COMPLETED_ORDER_GIFT)
                ->values();

            $referralSellerRewards = $sellerRewards
                ->where('reward_type', ReferralReward::TYPE_REFERRAL_SELLER_FIRST_PRODUCT_GIFT)
                ->values();

            $orderCount = $orderRewards->count();
            $orderLimit = (int) $settings['orderGiftLimitPerSeller'];

            $referralCount = $referralSellerRewards->count();
            $referralLimit = (int) $settings['referralSellerLimitPerSeller'];

            $sellerProfileId = $sellerUser->seller?->id;
            $completedAgg = $sellerProfileId ? $completedOrdersAggBySeller->get($sellerProfileId) : null;

            $referredRegistrationsCount = (int) ($registrationCountBySellerUser[$sellerUser->id] ?? 0);

            return [
                'seller' => [
                    'id' => $sellerUser->id,
                    'seller_profile_id' => $sellerProfileId,
                    'name' => $sellerUser->name,
                    'email' => $sellerUser->email,
                ],
                'gift_wallet_balance' => (float) ($sellerUser->gift_wallet_balance ?? 0),

                'order_gifts' => [
                    'allowed' => $orderLimit,
                    'count' => $orderCount,
                    'remaining' => max($orderLimit - $orderCount, 0),
                    'progress_percent' => $this->buildProgress($orderCount, $orderLimit)['percent'],
                    'total_amount' => (float) $orderRewards->sum('amount'),
                    'rows' => $orderRewards->map(function (ReferralReward $reward) {
                        return [
                            'id' => $reward->id,
                            'order_id' => $reward->source_order_id,
                            'buyer_name' => $reward->referred?->name,
                            'buyer_email' => $reward->referred?->email,
                            'amount' => (float) $reward->amount,
                            'currency' => $reward->currency,
                            'reason' => $reward->reason,
                            'created_at' => $reward->created_at,
                        ];
                    })->values(),
                ],

                'referral_seller_gifts' => [
                    'allowed' => $referralLimit,
                    'count' => $referralCount,
                    'remaining' => max($referralLimit - $referralCount, 0),
                    'progress_percent' => $this->buildProgress($referralCount, $referralLimit)['percent'],
                    'registered_sellers_count' => $referredRegistrationsCount,
                    'total_amount' => (float) $referralSellerRewards->sum('amount'),
                    'rows' => $referralSellerRewards->map(function (ReferralReward $reward) {
                        return [
                            'id' => $reward->id,
                            'registered_seller_name' => $reward->referred?->name,
                            'registered_seller_email' => $reward->referred?->email,
                            'product_id' => $reward->source_product_id,
                            'product_title' => $reward->sourceProduct?->title,
                            'amount' => (float) $reward->amount,
                            'currency' => $reward->currency,
                            'reason' => $reward->reason,
                            'created_at' => $reward->created_at,
                        ];
                    })->values(),
                ],

                'completed_orders_metrics' => [
                    'count' => (int) ($completedAgg->completed_orders_count ?? ($sellerUser->seller?->completed_orders ?? 0)),
                    'total_revenue' => (float) ($completedAgg->completed_orders_total ?? 0),
                    'seller_net_total' => (float) ($completedAgg->seller_net_total ?? 0),
                ],

                'total_rewards_earned' => (float) $sellerRewards->sum('amount'),
            ];
        })->sortByDesc('total_rewards_earned')->values();

        return response()->json([
            'settings' => $settings,
            'summary' => $summary,
            'totals' => [
                'sellers_count' => $summary->count(),
                'referred_accounts_count' => (int) $summary->sum('referral_seller_gifts.registered_sellers_count'),
                'order_gifts_count' => (int) $summary->sum('order_gifts.count'),
                'referral_seller_gifts_count' => (int) $summary->sum('referral_seller_gifts.count'),
                'rewards_count' => (int) ($summary->sum('order_gifts.count') + $summary->sum('referral_seller_gifts.count')),
                'total_rewards_earned' => (float) $summary->sum('total_rewards_earned'),
                'total_gift_wallet_balance' => (float) $summary->sum('gift_wallet_balance'),
            ],
        ]);
    }

    private function buildProgress(int $count, int $allowed): array
    {
        $percent = $allowed > 0
            ? min(100, (float) round(($count / $allowed) * 100, 2))
            : 0;

        return [
            'allowed' => $allowed,
            'count' => $count,
            'remaining' => max($allowed - $count, 0),
            'percent' => $percent,
        ];
    }

    private function getGiftSettings(): array
    {
        $orderGiftAmount = SiteSetting::where('setting_key', 'gift_order_completed_amount')->value('setting_value');
        if ($orderGiftAmount === null) {
            $orderGiftAmount = SiteSetting::where('setting_key', 'referral_first_order_gift_amount')->value('setting_value');
        }

        $orderGiftLimit = SiteSetting::where('setting_key', 'gift_order_completed_limit_per_seller')->value('setting_value');

        $referralSellerGiftAmount = SiteSetting::where('setting_key', 'gift_referral_seller_first_product_amount')->value('setting_value');
        if ($referralSellerGiftAmount === null) {
            $referralSellerGiftAmount = SiteSetting::where('setting_key', 'referral_first_product_gift_amount')->value('setting_value');
        }

        $referralSellerLimit = SiteSetting::where('setting_key', 'gift_referral_seller_registration_limit')->value('setting_value');
        if ($referralSellerLimit === null) {
            $referralSellerLimit = SiteSetting::where('setting_key', 'referral_max_link_uses')->value('setting_value');
        }

        return [
            'enabled' => SiteSetting::where('setting_key', 'referral_enabled')->value('setting_value') !== 'false',
            'orderGiftAmount' => (float) ($orderGiftAmount ?? 0),
            'orderGiftLimitPerSeller' => max(0, (int) ($orderGiftLimit ?? 0)),
            'referralSellerGiftAmount' => (float) ($referralSellerGiftAmount ?? 0),
            'referralSellerLimitPerSeller' => max(0, (int) ($referralSellerLimit ?? 0)),
        ];
    }
}
