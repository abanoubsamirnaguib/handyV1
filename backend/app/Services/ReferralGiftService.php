<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\ReferralReward;
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ReferralGiftService
{
    private const SETTING_ENABLED = 'referral_enabled';
    private const SETTING_SIGNUP_GIFT = 'referral_signup_gift_amount';
    private const SETTING_SIGNUP_GIFT_LEGACY = 'referral_bonus_amount';
    private const SETTING_FIRST_PRODUCT_GIFT = 'referral_first_product_gift_amount';
    private const SETTING_FIRST_ORDER_GIFT = 'referral_first_order_gift_amount';

    public static function awardSignupGift(User $referredUser): ?ReferralReward
    {
        $amount = self::getGiftAmountByType(ReferralReward::TYPE_SIGNUP);
        $reason = "تسجيل مستخدم جديد عبر رابط دعوتك: {$referredUser->name}";

        return self::awardGift(
            referredUser: $referredUser,
            rewardType: ReferralReward::TYPE_SIGNUP,
            amount: $amount,
            reason: $reason,
        );
    }

    public static function awardFirstApprovedProductGift(Product $product): ?ReferralReward
    {
        $product->loadMissing('seller.user');
        $referredUser = $product->seller?->user;
        if (!$referredUser) {
            return null;
        }

        $amount = self::getGiftAmountByType(ReferralReward::TYPE_FIRST_PRODUCT);
        $reason = "تمت الموافقة على أول منتج للمستخدم المدعو {$referredUser->name}: {$product->title}";

        return self::awardGift(
            referredUser: $referredUser,
            rewardType: ReferralReward::TYPE_FIRST_PRODUCT,
            amount: $amount,
            reason: $reason,
            sourceProductId: $product->id,
        );
    }

    public static function awardFirstCompletedOrderGift(Order $order): ?ReferralReward
    {
        $order->loadMissing(['user', 'seller.user']);

        $referredUser = $order->user;
        if (!$referredUser || !$referredUser->referred_by_user_id) {
            return null;
        }

        $referrerUserId = (int) $referredUser->referred_by_user_id;
        $orderSellerUserId = (int) ($order->seller?->user_id ?? 0);

        // Gift is granted only when the referred user buys from the owner of the referral link.
        if ($orderSellerUserId !== $referrerUserId) {
            return null;
        }

        $amount = self::getGiftAmountByType(ReferralReward::TYPE_FIRST_ORDER);
        $reason = "إكمال أول طلب من المستخدم المدعو {$referredUser->name} (طلب رقم #{$order->id})";

        return self::awardGift(
            referredUser: $referredUser,
            rewardType: ReferralReward::TYPE_FIRST_ORDER,
            amount: $amount,
            reason: $reason,
            sourceOrderId: $order->id,
        );
    }

    private static function awardGift(
        User $referredUser,
        string $rewardType,
        float $amount,
        string $reason,
        ?int $sourceProductId = null,
        ?int $sourceOrderId = null,
    ): ?ReferralReward {
        if (!self::isReferralEnabled() || $amount <= 0) {
            return null;
        }

        if (!$referredUser->referred_by_user_id) {
            return null;
        }

        $referrer = User::find($referredUser->referred_by_user_id);
        if (!$referrer || $referrer->id === $referredUser->id) {
            return null;
        }

        $alreadyRewarded = ReferralReward::where('referrer_user_id', $referrer->id)
            ->where('referred_user_id', $referredUser->id)
            ->where('reward_type', $rewardType)
            ->exists();

        if ($alreadyRewarded) {
            return null;
        }

        $currency = SiteSetting::where('setting_key', 'default_currency')->value('setting_value') ?? 'EGP';

        return DB::transaction(function () use (
            $referrer,
            $referredUser,
            $rewardType,
            $amount,
            $currency,
            $reason,
            $sourceProductId,
            $sourceOrderId
        ) {
            $reward = ReferralReward::create([
                'referrer_user_id' => $referrer->id,
                'referred_user_id' => $referredUser->id,
                'reward_type' => $rewardType,
                'amount' => $amount,
                'currency' => $currency,
                'source_product_id' => $sourceProductId,
                'source_order_id' => $sourceOrderId,
                'reason' => $reason,
                'created_at' => now(),
            ]);

            $referrer->addToGiftWallet($amount);

            try {
                NotificationService::create(
                    $referrer->id,
                    'system',
                    "تم إضافة هدية بقيمة {$amount} إلى محفظة الهدايا. السبب: {$reason}",
                    '/dashboard/wallet'
                );
            } catch (\Throwable $e) {
                // Ignore notification errors to avoid blocking business flow.
            }

            return $reward;
        });
    }

    private static function isReferralEnabled(): bool
    {
        return SiteSetting::where('setting_key', self::SETTING_ENABLED)->value('setting_value') !== 'false';
    }

    private static function getGiftAmountByType(string $rewardType): float
    {
        switch ($rewardType) {
            case ReferralReward::TYPE_SIGNUP:
                $value = SiteSetting::where('setting_key', self::SETTING_SIGNUP_GIFT)->value('setting_value');
                if ($value === null) {
                    $value = SiteSetting::where('setting_key', self::SETTING_SIGNUP_GIFT_LEGACY)->value('setting_value');
                }

                return (float) ($value ?? 0);

            case ReferralReward::TYPE_FIRST_PRODUCT:
                return (float) (SiteSetting::where('setting_key', self::SETTING_FIRST_PRODUCT_GIFT)->value('setting_value') ?? 0);

            case ReferralReward::TYPE_FIRST_ORDER:
                return (float) (SiteSetting::where('setting_key', self::SETTING_FIRST_ORDER_GIFT)->value('setting_value') ?? 0);

            default:
                return 0;
        }
    }
}
