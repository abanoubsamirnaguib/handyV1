<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use Illuminate\Http\Request;

class ConversationCrudController extends Controller
{
    public function index() { return Conversation::with(['buyer', 'seller'])->get(); }
    public function store(Request $request) {
        $validated = $request->validate([
            'buyer_id' => 'required|exists:users,id',
            'seller_id' => 'required|exists:users,id',
        ]);
        $conv = Conversation::create($validated);
        return response()->json($conv, 201);
    }
    public function update(Request $request, $id) {
        $conv = Conversation::findOrFail($id);
        $conv->update($request->all());
        return response()->json($conv);
    }
    public function destroy($id) {
        $conv = Conversation::findOrFail($id);
        $conv->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
