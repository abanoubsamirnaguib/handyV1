<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

class OptionalAuth
{
    /**
     * Handle an incoming request.
     * This middleware attempts to authenticate the user if a token is present,
     * but doesn't fail if no token is provided or if authentication fails.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        // Check if the request has a Bearer token
        if ($request->bearerToken()) {
            try {
                // Attempt to authenticate using Sanctum
                $user = Auth::guard('sanctum')->user();
                if ($user) {
                    // Set the authenticated user for the current request
                    Auth::setUser($user);
                }
            } catch (\Exception $e) {
                // If authentication fails, continue without authentication
                // This allows the request to proceed as a guest request
            }
        }

        return $next($request);
    }
}
