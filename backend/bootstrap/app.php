<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Configure API middleware for token-based authentication only
        $middleware->group('api', [
            \Illuminate\Routing\Middleware\ThrottleRequests::class.':api',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);
        
        // Ensure web middleware is properly configured with CORS
        $middleware->web([
            \App\Http\Middleware\VerifyCsrfToken::class,
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
        
        // Register broadcasting auth middleware
        $middleware->alias([
            'broadcast.auth' => \App\Http\Middleware\BroadcastAuth::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
