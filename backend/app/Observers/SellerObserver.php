<?php

namespace App\Observers;

use App\Models\Seller;
use App\Http\Controllers\Api\AIAssistantController;

class SellerObserver
{
    /**
     * Handle the Seller "created" event.
     */
    public function created(Seller $seller): void
    {
        AIAssistantController::clearCache();
    }

    /**
     * Handle the Seller "updated" event.
     */
    public function updated(Seller $seller): void
    {
        AIAssistantController::clearCache();
    }

    /**
     * Handle the Seller "deleted" event.
     */
    public function deleted(Seller $seller): void
    {
        AIAssistantController::clearCache();
    }
}

