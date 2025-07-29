<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DeliveryAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        // Set the guard to delivery for this request
        Auth::shouldUse('delivery');
        
        // Check if the user is authenticated using the delivery guard
        if (!Auth::guard('delivery')->check()) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح، يرجى تسجيل الدخول',
                'error' => 'Unauthenticated'
            ], 401);
        }

        return $next($request);
    }
}
