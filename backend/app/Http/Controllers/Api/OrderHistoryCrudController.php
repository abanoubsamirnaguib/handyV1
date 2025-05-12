<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrderHistory;
use Illuminate\Http\Request;

class OrderHistoryCrudController extends Controller
{
    public function index() { return OrderHistory::with(['order', 'actionUser'])->get(); }
    public function store(Request $request) {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'status' => 'required|string',
            'action_by' => 'nullable|exists:users,id',
            'action_type' => 'nullable|string',
            'note' => 'nullable|string',
        ]);
        $history = OrderHistory::create($validated);
        return response()->json($history, 201);
    }
    public function update(Request $request, $id) {
        $history = OrderHistory::findOrFail($id);
        $history->update($request->all());
        return response()->json($history);
    }
    public function destroy($id) {
        $history = OrderHistory::findOrFail($id);
        $history->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
