<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckUserStatus
{
    /**
     * Handle an incoming request.
     * Prevents suspended users from accessing protected routes.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();
        
        // Check if user is authenticated and suspended
        if ($user && $user->status === 'suspended') {
            return response()->json([
                'message' => 'تم تعليق حسابك. يرجى التواصل مع الإدارة.'
            ], 403);
        }
        
        return $next($request);
    }
}

