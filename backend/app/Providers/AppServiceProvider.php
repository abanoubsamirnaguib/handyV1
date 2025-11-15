<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \App\Models\Review::observe(\App\Observers\ReviewObserver::class);
        
        // Register AI Assistant observers
        \App\Models\Product::observe(\App\Observers\ProductObserver::class);
        \App\Models\Seller::observe(\App\Observers\SellerObserver::class);
    }
}
