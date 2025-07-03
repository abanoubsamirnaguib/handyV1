<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BroadcastAuth
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = null;
        // Try Sanctum authentication first (for API tokens)
        if ($request->bearerToken()) {
            $user = Auth::guard('sanctum')->user();
            if ($user) {
                Auth::setUser($user);
                return $next($request);
            }
        }
        
        // Try web session authentication
        $user = Auth::guard('web')->user();
        if ($user) {
            Auth::setUser($user);
            // \Log::info('Web auth successful, proceeding');
            return $next($request);
        }
        
        // Check for session-based authentication (cookies)
        if ($request->hasSession() && $request->session()->has('login_web_' . sha1('web'))) {
            $user = Auth::guard('web')->user();
            if ($user) {
                Auth::setUser($user);
                return $next($request);
            }
        }
                
        // If no authentication method works, return unauthorized
        return response()->json(['message' => 'Unauthenticated.'], 401);
    }
} 