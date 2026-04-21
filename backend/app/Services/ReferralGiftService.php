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
    private const SETTING_ORDER_GIFT_AMOUNT = 'gift_order_completed_amount';
    private const SETTING_ORDER_GIFT_AMOUNT_LEGACY = 'referral_first_order_gift_amount';
    private const SETTING_ORDER_GIFT_LIMIT = 'gift_order_completed_limit_per_seller';
    private const SETTING_REFERRAL_SELLER_GIFT_AMOUNT = 'gift_referral_seller_first_product_amount';
    private const SETTING_REFERRAL_SELLER_GIFT_AMOUNT_LEGACY = 'referral_first_product_gift_amount';
    private const SETTING_REFERRAL_SELLER_LIMIT = 'gift_referral_seller_registration_limit';
    private const SETTING_REFERRAL_SELLER_LIMIT_LEGACY = 'referral_max_link_uses';

    public static function awardCompletedOrderGift(Order $order): ?ReferralReward
    {
        if (!self::isGiftEnabled()) {
            return null;
        }

        $order->loadMissing(['seller.user', 'user']);

        $sellerUser = $order->seller?->user;
        $buyerUser = $order->user;

        if (!$sellerUser || !$buyerUser || $sellerUser->id === $buyerUser->id) {
            return null;
        }

        $amount = self::getOrderGiftAmount();
        if ($amount <= 0) {
            return null;
        }

        $allowedOrders = self::getOrderGiftLimit();
        if ($allowedOrders <= 0) {
            return null;
        }

        $currentCount = ReferralReward::where('referrer_user_id', $sellerUser->id)
            ->where('reward_type', ReferralReward::TYPE_COMPLETED_ORDER_GIFT)
            ->count();

        if ($currentCount >= $allowedOrders) {
            return null;
        }

        $reason = "هدية استكمال أوردر رقم #{$order->id} للمشتري {$buyerUser->name}";

        return self::createGiftReward(
            referrer: $sellerUser,
            triggerUser: $buyerUser,
            rewardType: ReferralReward::TYPE_COMPLETED_ORDER_GIFT,
            amount: $amount,
            reason: $reason,
            sourceOrderId: (int) $order->id,
            enforcePairUniqueness: false,
        );
    }

    public static function awardFirstApprovedProductGift(Product $product): ?ReferralReward
    {
        if (!self::isGiftEnabled()) {
            return null;
        }

        $product->loadMissing('seller.user');

        $referredSellerUser = $product->seller?->user;
        if (!$referredSellerUser || !$referredSellerUser->referred_by_user_id) {
            return null;
        }

        $approvedProductsCount = Product::where('seller_id', $product->seller_id)
            ->where('status', 'active')
            ->count();

        if ($approvedProductsCount !== 1) {
            return null;
        }

        $referrer = User::find($referredSellerUser->referred_by_user_id);
        if (!$referrer || $referrer->id === $referredSellerUser->id) {
            return null;
        }

        $amount = self::getReferralSellerGiftAmount();
        if ($amount <= 0) {
            return null;
        }

        $allowedRegistrations = self::getReferralSellerLimit();
        if ($allowedRegistrations <= 0) {
            return null;
        }

        $currentCount = ReferralReward::where('referrer_user_id', $referrer->id)
            ->where('reward_type', ReferralReward::TYPE_REFERRAL_SELLER_FIRST_PRODUCT_GIFT)
            ->count();

        if ($currentCount >= $allowedRegistrations) {
            return null;
        }

        $reason = "هدية قبول أول منتج للبائع المسجل عبر رابطك: {$referredSellerUser->name} ({$product->title})";

        return self::createGiftReward(
            referrer: $referrer,
            triggerUser: $referredSellerUser,
            rewardType: ReferralReward::TYPE_REFERRAL_SELLER_FIRST_PRODUCT_GIFT,
            amount: $amount,
            reason: $reason,
            sourceProductId: (int) $product->id,
            enforcePairUniqueness: true,
        );
    }

    private static function createGiftReward(
        User $referrer,
        User $triggerUser,
        string $rewardType,
        float $amount,
        string $reason,
        ?int $sourceProductId = null,
        ?int $sourceOrderId = null,
        bool $enforcePairUniqueness = false,
    ): ?ReferralReward {
        if (!self::isGiftEnabled() || $amount <= 0) {
            return null;
        }

        if ($referrer->id === $triggerUser->id) {
            return null;
        }

        if ($sourceOrderId) {
            $alreadyRewardedForOrder = ReferralReward::where('reward_type', $rewardType)
                ->where('source_order_id', $sourceOrderId)
                ->exists();

            if ($alreadyRewardedForOrder) {
                return null;
            }
        }

        if ($enforcePairUniqueness) {
            $alreadyRewardedForPair = ReferralReward::where('referrer_user_id', $referrer->id)
                ->where('referred_user_id', $triggerUser->id)
                ->where('reward_type', $rewardType)
                ->exists();

            if ($alreadyRewardedForPair) {
                return null;
            }
        }

        $currency = SiteSetting::where('setting_key', 'default_currency')->value('setting_value') ?? 'EGP';

        return DB::transaction(function () use (
            $referrer,
            $triggerUser,
            $rewardType,
            $amount,
            $currency,
            $reason,
            $sourceProductId,
            $sourceOrderId
        ) {
            $reward = ReferralReward::create([
                'referrer_user_id' => $referrer->id,
                'referred_user_id' => $triggerUser->id,
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

    private static function isGiftEnabled(): bool
    {
        return SiteSetting::where('setting_key', self::SETTING_ENABLED)->value('setting_value') !== 'false';
    }

    private static function getOrderGiftAmount(): float
    {
        $value = SiteSetting::where('setting_key', self::SETTING_ORDER_GIFT_AMOUNT)->value('setting_value');
        if ($value === null) {
            $value = SiteSetting::where('setting_key', self::SETTING_ORDER_GIFT_AMOUNT_LEGACY)->value('setting_value');
        }

        return (float) ($value ?? 0);
    }

    private static function getOrderGiftLimit(): int
    {
        $value = SiteSetting::where('setting_key', self::SETTING_ORDER_GIFT_LIMIT)->value('setting_value');
        return max(0, (int) ($value ?? 0));
    }

    private static function getReferralSellerGiftAmount(): float
    {
        $value = SiteSetting::where('setting_key', self::SETTING_REFERRAL_SELLER_GIFT_AMOUNT)->value('setting_value');
        if ($value === null) {
            $value = SiteSetting::where('setting_key', self::SETTING_REFERRAL_SELLER_GIFT_AMOUNT_LEGACY)->value('setting_value');
        }

        return (float) ($value ?? 0);
    }

    private static function getReferralSellerLimit(): int
    {
        $value = SiteSetting::where('setting_key', self::SETTING_REFERRAL_SELLER_LIMIT)->value('setting_value');
        if ($value === null) {
            $value = SiteSetting::where('setting_key', self::SETTING_REFERRAL_SELLER_LIMIT_LEGACY)->value('setting_value');
        }

        return max(0, (int) ($value ?? 0));
    }
}
