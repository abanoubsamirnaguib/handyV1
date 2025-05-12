<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WishlistItem;
use Illuminate\Http\Request;

class WishlistItemCrudController extends Controller
{
    public function index() { return WishlistItem::with(['user', 'product'])->get(); }
    public function store(Request $request) {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'product_id' => 'required|exists:products,id',
        ]);
        $item = WishlistItem::create($validated);
        return response()->json($item, 201);
    }
    public function update(Request $request, $id) {
        $item = WishlistItem::findOrFail($id);
        $item->update($request->all());
        return response()->json($item);
    }
    public function destroy($id) {
        $item = WishlistItem::findOrFail($id);
        $item->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
