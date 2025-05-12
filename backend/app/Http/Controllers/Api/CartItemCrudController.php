<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use Illuminate\Http\Request;

class CartItemCrudController extends Controller
{
    public function index() { return CartItem::with(['user', 'product'])->get(); }
    public function store(Request $request) {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);
        $item = CartItem::create($validated);
        return response()->json($item, 201);
    }
    public function update(Request $request, $id) {
        $item = CartItem::findOrFail($id);
        $item->update($request->all());
        return response()->json($item);
    }
    public function destroy($id) {
        $item = CartItem::findOrFail($id);
        $item->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
