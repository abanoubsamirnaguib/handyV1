<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HomeSlider;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class HomeSliderController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $slides = Cache::remember('home_slider_list', 1800, function () {
                return HomeSlider::query()
                    ->where('is_active', true)
                    ->orderBy('display_order', 'asc')
                    ->orderBy('id', 'asc')
                    ->get();
            });

            return response()->json([
                'success' => true,
                'data' => $slides,
            ])
                ->header('Cache-Control', 'public, max-age=1800')
                ->header('Expires', gmdate('D, d M Y H:i:s', time() + 1800) . ' GMT');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch home slider',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
