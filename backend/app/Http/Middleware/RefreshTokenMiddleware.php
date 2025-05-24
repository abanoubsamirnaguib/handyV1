<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RefreshTokenMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        
        // Only for successful responses with authenticated user
        if ($request->user() && $response->getStatusCode() === 200) {
            // Check if token is about to expire (for example, less than 24 hours left)
            $tokenExpiration = $request->user()->currentAccessToken()->created_at->addMinutes(config('sanctum.expiration'));
            $expiresIn = now()->diffInMinutes($tokenExpiration, false);
            
            // If token has less than 24 hours remaining, refresh it
            if ($expiresIn < 24 * 60 && $expiresIn > 0) {
                // Revoke the current token
                $request->user()->currentAccessToken()->delete();
                
                // Create a new token
                $newToken = $request->user()->createToken('api-token')->plainTextToken;
                
                // Add the new token to the response
                $responseData = json_decode($response->getContent(), true) ?: [];
                $responseData['new_token'] = $newToken;
                
                $response->setContent(json_encode($responseData));
            }
        }
        
        return $response;
    }
}
