<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use Illuminate\Http\Request;

class MessageCrudController extends Controller
{
    public function index() { return Message::with(['conversation', 'sender', 'recipient'])->get(); }
    public function store(Request $request) {
        $validated = $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'sender_id' => 'required|exists:users,id',
            'recipient_id' => 'required|exists:users,id',
            'message_text' => 'required|string',
        ]);
        $msg = Message::create($validated);
        return response()->json($msg, 201);
    }
    public function update(Request $request, $id) {
        $msg = Message::findOrFail($id);
        $msg->update($request->all());
        return response()->json($msg);
    }
    public function destroy($id) {
        $msg = Message::findOrFail($id);
        $msg->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
