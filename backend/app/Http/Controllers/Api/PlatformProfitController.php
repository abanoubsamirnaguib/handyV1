<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlatformProfit;
use Illuminate\Http\Request;

class PlatformProfitController extends Controller
{
    public function index(Request $request)
    {
        $query = PlatformProfit::with(['order', 'city', 'seller'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('seller_id')) $query->where('seller_id', $request->seller_id);
        if ($request->filled('city_id')) $query->where('city_id', $request->city_id);
        if ($request->filled('date_from')) $query->whereDate('created_at', '>=', $request->date_from);
        if ($request->filled('date_to')) $query->whereDate('created_at', '<=', $request->date_to);

        $perPage = $request->get('per_page', 20);
        $profits = $query->paginate($perPage);

        $total = PlatformProfit::sum('amount');

        return response()->json([
            'total' => $total,
            'data' => $profits,
        ]);
    }
}
