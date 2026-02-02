<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Http\Resources\CategoryResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    public function index()
    {
        // Cache categories for 1 hour (3600 seconds)
        $categories = Cache::remember('categories_list', 3600, function () {
            return Category::all();
        });
        
        // CategoryResource::collection already returns a proper resource response
        return CategoryResource::collection($categories)
            ->response()
            ->header('Cache-Control', 'public, max-age=3600')
            ->header('Expires', gmdate('D, d M Y H:i:s', time() + 3600) . ' GMT');
    }
}
