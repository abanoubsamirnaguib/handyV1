<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        // For API requests, don't redirect, just return 401
        if ($request->is('api/*') || $request->expectsJson() || $request->wantsJson()) {
            return null;
        }
        
        return route('login');
    }
}
