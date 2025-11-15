<?php

namespace App\Observers;

use App\Models\Product;
use App\Http\Controllers\Api\AIAssistantController;

class ProductObserver
{
    /**
     * Handle the Product "created" event.
     */
    public function created(Product $product): void
    {
        AIAssistantController::clearCache();
    }

    /**
     * Handle the Product "updated" event.
     */
    public function updated(Product $product): void
    {
        AIAssistantController::clearCache();
    }

    /**
     * Handle the Product "deleted" event.
     */
    public function deleted(Product $product): void
    {
        AIAssistantController::clearCache();
    }
}

