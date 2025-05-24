<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;

class CsrfDebugController extends Controller
{
    public function debug(Request $request)
    {
        $cookies = $request->cookies->all();
        $headers = $request->headers->all();
        $xsrfToken = $request->header('X-XSRF-TOKEN');
        $csrfToken = $request->header('X-CSRF-TOKEN');
        
        return response()->json([
            'message' => 'CSRF Debug Information',
            'has_csrf_token' => !empty($csrfToken),
            'has_xsrf_token' => !empty($xsrfToken),
            'cookies' => array_keys($cookies),
            'header_names' => array_keys($headers),
            'laravel_session' => isset($cookies['laravel_session']) ? 'present' : 'missing',
            'xsrf_token_cookie' => isset($cookies['XSRF-TOKEN']) ? 'present' : 'missing',
        ]);
    }
}
