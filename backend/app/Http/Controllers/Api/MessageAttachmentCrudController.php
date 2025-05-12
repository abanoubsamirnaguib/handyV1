<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MessageAttachment;
use Illuminate\Http\Request;

class MessageAttachmentCrudController extends Controller
{
    public function index() { return MessageAttachment::with('message')->get(); }
    public function store(Request $request) {
        $validated = $request->validate([
            'message_id' => 'required|exists:messages,id',
            'file_url' => 'required|string',
            'file_type' => 'nullable|string',
        ]);
        $attachment = MessageAttachment::create($validated);
        return response()->json($attachment, 201);
    }
    public function update(Request $request, $id) {
        $attachment = MessageAttachment::findOrFail($id);
        $attachment->update($request->all());
        return response()->json($attachment);
    }
    public function destroy($id) {
        $attachment = MessageAttachment::findOrFail($id);
        $attachment->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
