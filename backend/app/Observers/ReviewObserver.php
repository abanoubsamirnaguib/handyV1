<?php

namespace App\Observers;

use App\Models\Review;
use App\Models\Product;
use App\Models\Seller;
use App\Services\NotificationService;

class ReviewObserver
{
    /**
     * Handle the Review "created" event.
     */
    public function created(Review $review): void
    {
        $this->updateStats($review);
        $this->sendSellerNotification($review);
    }

    /**
     * Handle the Review "updated" event.
     */
    public function updated(Review $review): void
    {
        $this->updateStats($review);
    }

    /**
     * Handle the Review "deleted" event.
     */
    public function deleted(Review $review): void
    {
        $this->updateStats($review);
    }

    /**
     * Update product and seller rating stats
     */
    private function updateStats(Review $review): void
    {
        if ($review->product) {
            $review->product->updateRatingStats();
            
            if ($review->product->seller) {
                $review->product->seller->updateRatingStats();
            }
        }
    }

    /**
     * Send notification to seller when review is created
     */
    private function sendSellerNotification(Review $review): void
    {
        // Load the product with seller relationship if not already loaded
        if (!$review->relationLoaded('product')) {
            $review->load('product.seller');
        }

        // Check if product and seller exist
        if ($review->product && $review->product->seller && $review->product->seller->user_id) {
            $sellerId = $review->product->seller->user_id;
            $productId = $review->product->id;
            $rating = $review->rating;

            // Send notification to seller
            NotificationService::reviewReceived($sellerId, $productId, $rating);
        }
    }
} 